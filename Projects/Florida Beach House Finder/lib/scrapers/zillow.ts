// Zillow scraper — RapidAPI zillow-com1.p.rapidapi.com
// BRD Section 5.1 — Rate limit: 20 calls/day

import type { NormalizedListing, ZillowRawListing } from './types';

const RAPIDAPI_HOST = 'zillow-com1.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

// Florida coastal search queries covering all 8 regions
const FL_SEARCH_LOCATIONS = [
  // Panhandle
  'Pensacola Beach, FL',
  'Destin, FL',
  'Panama City Beach, FL',
  // NE Florida
  'Jacksonville Beach, FL',
  'St. Augustine, FL',
  'Daytona Beach, FL',
  // Space Coast
  'Cocoa Beach, FL',
  'Melbourne Beach, FL',
  // Treasure Coast
  'Vero Beach, FL',
  'Stuart, FL',
  // Gold Coast
  'Fort Lauderdale Beach, FL',
  'Miami Beach, FL',
  // Gulf Coast
  'Naples, FL',
  'Fort Myers Beach, FL',
  'Sarasota, FL',
  // Tampa Bay
  'Clearwater Beach, FL',
  'St. Pete Beach, FL',
  // Keys
  'Key West, FL',
  'Marathon, FL',
  'Islamorada, FL',
];

function parsePrice(raw: ZillowRawListing): number {
  return (
    raw.price ??
    raw.listPrice ??
    raw.priceForHDP ??
    raw.unformattedPrice ??
    0
  );
}

function parseLotSqft(raw: ZillowRawListing): number | undefined {
  if (!raw.lotAreaValue) return undefined;
  const val = Number(raw.lotAreaValue);
  if (isNaN(val)) return undefined;
  // Convert acres → sqft if needed
  const unit = (raw.lotAreaUnit ?? '').toLowerCase();
  if (unit === 'acres' || unit === 'acre') return Math.round(val * 43560);
  return Math.round(val); // assume sqft
}

function parseImages(raw: ZillowRawListing): string[] {
  if (raw.photos?.length) return raw.photos.map((p) => p.url).filter(Boolean);
  if (raw.imgSrc) return [raw.imgSrc];
  return [];
}

function buildDetailUrl(raw: ZillowRawListing): string {
  if (raw.detailUrl) {
    return raw.detailUrl.startsWith('http')
      ? raw.detailUrl
      : `https://www.zillow.com${raw.detailUrl}`;
  }
  const zpid = raw.zpid ?? raw.id;
  return zpid ? `https://www.zillow.com/homedetails/${zpid}_zpid/` : 'https://www.zillow.com';
}

function normalizeZillow(raw: ZillowRawListing): NormalizedListing | null {
  const zpid = String(raw.zpid ?? raw.id ?? '');
  if (!zpid || zpid === 'undefined') return null;

  const price = parsePrice(raw);
  if (!price || price <= 0) return null;

  const beds = Number(raw.bedrooms ?? 0);
  const baths = Number(raw.bathrooms ?? 0);
  if (beds < 3 || baths < 2) return null; // BRD minimum criteria
  if (price > 400000) return null; // BRD max price

  const addr = raw.address;
  if (!addr?.city) return null;

  return {
    source: 'zillow',
    sourceId: zpid,
    sourceUrl: buildDetailUrl(raw),
    address: addr.streetAddress ?? '',
    city: addr.city,
    state: addr.state ?? 'FL',
    zip: addr.zipcode ?? '',
    price,
    beds,
    baths,
    sqft: raw.livingArea ? Math.round(Number(raw.livingArea)) : undefined,
    lotSizeSqft: parseLotSqft(raw),
    lat: raw.latitude ? Number(raw.latitude) : undefined,
    lng: raw.longitude ? Number(raw.longitude) : undefined,
    images: parseImages(raw),
    description: raw.description,
    propertyType: raw.homeType,
    yearBuilt: raw.yearBuilt,
    listedAt: raw.listingDateTimeOnZillow
      ? new Date(raw.listingDateTimeOnZillow)
      : undefined,
  };
}

export async function scrapeZillow(
  apiKey: string,
  maxLocations = 20,
): Promise<NormalizedListing[]> {
  const results: NormalizedListing[] = [];
  const locations = FL_SEARCH_LOCATIONS.slice(0, maxLocations);

  for (const location of locations) {
    try {
      const params = new URLSearchParams({
        location,
        status_type: 'ForSale',
        home_type: 'Houses',
        maxPrice: '400000',
        bedsMin: '3',
        bathsMin: '2',
        sort: 'Newest',
      });

      const res = await fetch(`${BASE_URL}/propertyExtendedSearch?${params}`, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) {
        console.error(`[zillow] ${location}: HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      const listings: ZillowRawListing[] = data?.props ?? data?.listings ?? [];

      for (const raw of listings) {
        const normalized = normalizeZillow(raw);
        if (normalized) results.push(normalized);
      }

      // Respect rate limit — small delay between requests
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`[zillow] ${location} error:`, err);
    }
  }

  return results;
}
