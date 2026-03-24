// Redfin scraper — Stingray internal API (no key required, public endpoints)
// BRD Section 5.2 — Rate limit: 100 calls/day; strip {}&&& prefix from responses

import type { NormalizedListing, RedfinRawListing } from './types';

const BASE_URL = 'https://www.redfin.com/stingray';

const FL_REGION_CODES = [
  // region_id, display name  (Redfin region_type=6 = zip, 2 = city, 5 = county)
  // Using city-level searches (region_type=2)
  { regionId: '17429', name: 'Pensacola Beach, FL' },
  { regionId: '15690', name: 'Destin, FL' },
  { regionId: '19196', name: 'Panama City Beach, FL' },
  { regionId: '17436', name: 'Jacksonville Beach, FL' },
  { regionId: '25296', name: 'St. Augustine, FL' },
  { regionId: '15698', name: 'Daytona Beach, FL' },
  { regionId: '14989', name: 'Cocoa Beach, FL' },
  { regionId: '19075', name: 'Melbourne Beach, FL' },
  { regionId: '28213', name: 'Vero Beach, FL' },
  { regionId: '25282', name: 'Stuart, FL' },
  { regionId: '16264', name: 'Fort Lauderdale, FL' },
  { regionId: '19098', name: 'Miami Beach, FL' },
  { regionId: '19076', name: 'Naples, FL' },
  { regionId: '16265', name: 'Fort Myers Beach, FL' },
  { regionId: '25295', name: 'Sarasota, FL' },
  { regionId: '14988', name: 'Clearwater Beach, FL' },
  { regionId: '25293', name: 'Saint Pete Beach, FL' },
  { regionId: '16893', name: 'Key West, FL' },
];

/** Strip the {}&&& JSONP prefix Redfin prepends to all API responses */
function stripStingrayPrefix(text: string): string {
  return text.replace(/^\{\}&&& ?/, '').trim();
}

/** Parse CSV-style rows from Redfin's download endpoint */
function parseCsvRows(csv: string): RedfinRawListing[] {
  const lines = csv.split('\n').filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ''])) as RedfinRawListing;
  });
}

function safeNum(val: string | undefined): number | undefined {
  if (!val || val === '') return undefined;
  const n = parseFloat(val.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? undefined : n;
}

function normalizeRedfin(raw: RedfinRawListing): NormalizedListing | null {
  const mlsId = raw['MLS#'] ?? raw.MLS ?? '';
  if (!mlsId) return null;

  const price = safeNum(raw.PRICE);
  if (!price || price > 400000) return null;

  const beds = safeNum(raw.BEDS) ?? 0;
  const baths = safeNum(raw.BATHS) ?? 0;
  if (beds < 3 || baths < 2) return null;

  const city = raw.CITY ?? '';
  const state = raw.STATE ?? 'FL';
  if (!city) return null;

  const propType = raw['PROPERTY TYPE'] ?? '';
  // Only single-family homes
  if (propType && !/single.family|house|residential/i.test(propType)) return null;

  const lat = safeNum(raw.LATITUDE);
  const lng = safeNum(raw.LONGITUDE);

  const listDate = raw['LIST DATE'];

  return {
    source: 'redfin',
    sourceId: mlsId,
    sourceUrl: raw.URL ?? `https://www.redfin.com`,
    address: raw.ADDRESS ?? '',
    city,
    state,
    zip: raw['ZIP OR POSTAL CODE'] ?? '',
    price,
    beds,
    baths,
    sqft: safeNum(raw['SQUARE FEET']),
    lotSizeSqft: safeNum(raw['LOT SIZE']),
    lat,
    lng,
    images: [],
    propertyType: propType,
    yearBuilt: safeNum(raw['YEAR BUILT']),
    listedAt: listDate ? new Date(listDate) : undefined,
  };
}

async function fetchRegionListings(regionId: string): Promise<NormalizedListing[]> {
  // Redfin download endpoint — returns CSV
  const params = new URLSearchParams({
    al: '1',
    has_deal: 'false',
    has_include_nearby_homes: 'true',
    market: 'miami', // ignored but required
    max_price: '400000',
    min_beds: '3',
    min_baths: '2',
    num_homes: '100',
    ord: 'days-on-redfin-asc',
    page_number: '1',
    property_type: 'house',
    region_id: regionId,
    region_type: '2',
    sf: '1,2,3,5,6,7',
    start: '0',
    status: '9',
    uipt: '1',
    v: '8',
  });

  try {
    const res = await fetch(`${BASE_URL}/api/gis-csv?${params}`, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://www.redfin.com/',
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      console.error(`[redfin] region ${regionId}: HTTP ${res.status}`);
      return [];
    }

    const text = await res.text();
    const clean = stripStingrayPrefix(text);

    // Sometimes returns JSON with a download key
    if (clean.startsWith('{')) {
      const json = JSON.parse(clean);
      if (json?.payload?.url) {
        const csvRes = await fetch(json.payload.url, { signal: AbortSignal.timeout(15_000) });
        const csv = await csvRes.text();
        return parseCsvRows(csv).map(normalizeRedfin).filter(Boolean) as NormalizedListing[];
      }
      return [];
    }

    return parseCsvRows(clean).map(normalizeRedfin).filter(Boolean) as NormalizedListing[];
  } catch (err) {
    console.error(`[redfin] region ${regionId} error:`, err);
    return [];
  }
}

export async function scrapeRedfin(
  maxRegions = 100,
): Promise<NormalizedListing[]> {
  const results: NormalizedListing[] = [];
  const regions = FL_REGION_CODES.slice(0, maxRegions);

  for (const region of regions) {
    const listings = await fetchRegionListings(region.regionId);
    results.push(...listings);
    await new Promise((r) => setTimeout(r, 300));
  }

  return results;
}
