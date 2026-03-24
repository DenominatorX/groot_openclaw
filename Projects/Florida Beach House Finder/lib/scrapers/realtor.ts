// Realtor.com scraper — RapidAPI realtor16.p.rapidapi.com
// BRD Section 5.3 — Rate limit: 20 calls/day

import type { NormalizedListing, RealtorRawListing } from './types';

const RAPIDAPI_HOST = 'realtor16.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

const FL_SEARCH_QUERIES = [
  // city, state_code pairs
  { city: 'Pensacola Beach',    state_code: 'FL' },
  { city: 'Destin',             state_code: 'FL' },
  { city: 'Panama City Beach',  state_code: 'FL' },
  { city: 'Jacksonville Beach', state_code: 'FL' },
  { city: 'St. Augustine',      state_code: 'FL' },
  { city: 'Daytona Beach',      state_code: 'FL' },
  { city: 'Cocoa Beach',        state_code: 'FL' },
  { city: 'Melbourne',          state_code: 'FL' },
  { city: 'Vero Beach',         state_code: 'FL' },
  { city: 'Stuart',             state_code: 'FL' },
  { city: 'Fort Lauderdale',    state_code: 'FL' },
  { city: 'Miami Beach',        state_code: 'FL' },
  { city: 'Naples',             state_code: 'FL' },
  { city: 'Fort Myers Beach',   state_code: 'FL' },
  { city: 'Sarasota',           state_code: 'FL' },
  { city: 'Clearwater',         state_code: 'FL' },
  { city: 'Saint Pete Beach',   state_code: 'FL' },
  { city: 'Key West',           state_code: 'FL' },
  { city: 'Marathon',           state_code: 'FL' },
  { city: 'Islamorada',         state_code: 'FL' },
];

function normalizeRealtor(raw: RealtorRawListing): NormalizedListing | null {
  const id = raw.property_id ?? raw.listing_id ?? '';
  if (!id) return null;

  const price = raw.list_price ?? 0;
  if (!price || price > 400000) return null;

  const desc = raw.description;
  const beds = desc?.beds ?? 0;
  const bathsFull = desc?.baths_full ?? 0;
  const bathsHalf = desc?.baths_half ?? 0;
  const baths = bathsFull + bathsHalf * 0.5;
  if (beds < 3 || baths < 2) return null;

  const loc = raw.location?.address;
  if (!loc?.city) return null;

  const propType = (desc?.type ?? '').toLowerCase();
  if (propType && (propType.includes('condo') || propType.includes('land') || propType.includes('mobile'))) return null;

  const permalink = raw.permalink;
  const sourceUrl = permalink
    ? `https://www.realtor.com/realestateandhomes-detail/${permalink}`
    : 'https://www.realtor.com';

  const images: string[] = [];
  if (raw.primary_photo?.href) images.push(raw.primary_photo.href);
  if (raw.photos) images.push(...raw.photos.map((p) => p.href ?? '').filter(Boolean));

  return {
    source: 'realtor',
    sourceId: String(id),
    sourceUrl,
    address: loc.line ?? '',
    city: loc.city,
    state: loc.state_code ?? 'FL',
    zip: loc.postal_code ?? '',
    price,
    beds,
    baths,
    sqft: desc?.sqft,
    lotSizeSqft: desc?.lot_sqft,
    lat: loc.coordinate?.lat,
    lng: loc.coordinate?.lon,
    images,
    description: desc?.text,
    propertyType: desc?.type,
    yearBuilt: desc?.year_built,
    listedAt: raw.list_date ? new Date(raw.list_date) : undefined,
  };
}

export async function scrapeRealtor(
  apiKey: string,
  maxQueries = 20,
): Promise<NormalizedListing[]> {
  const results: NormalizedListing[] = [];
  const queries = FL_SEARCH_QUERIES.slice(0, maxQueries);

  for (const query of queries) {
    try {
      const params = new URLSearchParams({
        city: query.city,
        state_code: query.state_code,
        limit: '50',
        offset: '0',
        status: 'for_sale',
        type: 'single_family',
        price_max: '400000',
        beds_min: '3',
        baths_min: '2',
        sort: 'newest',
      });

      const res = await fetch(`${BASE_URL}/properties/list?${params}`, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) {
        console.error(`[realtor] ${query.city}: HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      const listings: RealtorRawListing[] = data?.data?.results ?? data?.results ?? [];

      for (const raw of listings) {
        const normalized = normalizeRealtor(raw);
        if (normalized) results.push(normalized);
      }

      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`[realtor] ${query.city} error:`, err);
    }
  }

  return results;
}
