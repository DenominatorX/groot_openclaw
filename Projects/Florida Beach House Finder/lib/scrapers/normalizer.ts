// Normalizer — converts raw scraper output into NormalizedListing
// and persists to SQLite via Prisma (upsert on source+sourceId)

import { prisma } from '@/lib/prisma';
import { findNearestBeach, isPoolReady, detectPool, isExcluded } from '@/lib/distance';
import { BEACHES } from '@/data/beaches';
import type { NormalizedListing } from './types';
import type { FlRegion } from '@/data/beaches';

/** Map city → FL coastal region (approximate centroid lookup) */
function inferRegion(city: string, lat?: number, lng?: number): FlRegion {
  // GPS-based region inference when coordinates are available
  if (lat !== undefined && lng !== undefined) {
    // Lat/lng bounding boxes for each region (rough approximations)
    if (lng < -84.0)                           return 'Panhandle';
    if (lat > 29.0 && lat < 30.8 && lng > -82.0) return 'NE Florida';
    if (lat >= 27.8 && lat <= 29.0)            return 'Space Coast';
    if (lat >= 27.0 && lat < 27.8)             return 'Treasure Coast';
    if (lat >= 25.5 && lat < 27.0 && lng > -81.0) return 'Gold Coast';
    if (lat >= 25.9 && lat < 27.6 && lng <= -81.0) return 'Gulf Coast';
    if (lat >= 27.6 && lat < 28.1 && lng <= -82.5) return 'Tampa Bay';
    if (lat < 25.5)                            return 'Keys';
    if (lat >= 27.6 && lat < 28.1)            return 'Tampa Bay';
    if (lat < 27.6 && lng <= -81.0)           return 'Gulf Coast';
  }

  // City name fallback
  const c = city.toLowerCase();
  if (/pensacola|destin|fort walton|panama city|navarre|seaside|rosemary|grayton|mexico beach|cape san blas|st\.? george/.test(c))
    return 'Panhandle';
  if (/amelia|fernandina|jacksonville|atlantic beach|neptune|ponte vedra|st\.? augustine|flagler|ormond|daytona|new smyrna/.test(c))
    return 'NE Florida';
  if (/cocoa|cape canaveral|melbourne|indialantic|sebastian|titusville/.test(c))
    return 'Space Coast';
  if (/vero|fort pierce|hutchinson|jensen|stuart|hobe sound|port st\.? lucie/.test(c))
    return 'Treasure Coast';
  if (/jupiter|palm beach|delray|boca raton|deerfield|pompano|fort lauderdale|hollywood|hallandale|sunny isles|miami|bal harbour|surfside|key biscayne/.test(c))
    return 'Gold Coast';
  if (/naples|marco|bonita|fort myers|sanibel|captiva|englewood|venice|nokomis|siesta|lido|longboat|anna maria|bradenton|charlotte|port charlotte/.test(c))
    return 'Gulf Coast';
  if (/clearwater|st\.? pete|saint pete|treasure island|madeira|redington|indian rocks|indian shores|belleair|sand key|honeymoon|caladesi|dunedin|safety harbor/.test(c))
    return 'Tampa Bay';
  if (/key west|marathon|islamorada|key largo|big pine|bahia honda|tavernier/.test(c))
    return 'Keys';

  // Default fallback: find nearest beach region by GPS if available
  if (lat !== undefined && lng !== undefined) {
    const nearest = findNearestBeach(lat, lng);
    return nearest.beach.region as FlRegion;
  }

  return 'Gulf Coast'; // final fallback
}

export interface SaveResult {
  created: number;
  updated: number;
  skipped: number;
}

/**
 * Persist a batch of normalized listings to the DB.
 * Applies exclusion filters, computes beach proximity, detects pool.
 */
export async function saveListing(listing: NormalizedListing): Promise<'created' | 'updated' | 'skipped'> {
  const desc = `${listing.description ?? ''} ${listing.propertyType ?? ''}`;

  // Hard exclusion check
  if (isExcluded(listing.propertyType ?? '', listing.description ?? '')) {
    return 'skipped';
  }

  // Must be a house (not condo / lot / etc.)
  const propType = (listing.propertyType ?? '').toLowerCase();
  if (propType && !propType.includes('single') && !propType.includes('house') && !propType.includes('residential')) {
    const allowed = ['single_family', 'single family', 'house', 'residential', 'sfr', ''];
    const isHouse = allowed.some((t) => propType.includes(t));
    // Allow empty/unknown type; reject explicitly non-house types
    if (!isHouse && (propType.includes('condo') || propType.includes('townhouse') || propType.includes('land') || propType.includes('mobile'))) {
      return 'skipped';
    }
  }

  // Beach proximity
  let nearestBeach = 'Unknown';
  let beachDistanceMiles = 999;
  let beachProximity = 'far';
  let region: FlRegion = 'Gulf Coast';

  if (listing.lat && listing.lng) {
    const nearestResult = findNearestBeach(listing.lat, listing.lng);
    nearestBeach = nearestResult.beach.name;
    beachDistanceMiles = nearestResult.distanceMiles;
    beachProximity = nearestResult.proximity;
    region = inferRegion(listing.city, listing.lat, listing.lng);
  } else {
    region = inferRegion(listing.city);
  }

  const hasPool = detectPool(desc);
  const poolReady = isPoolReady(listing.lotSizeSqft);

  const data = {
    source: listing.source,
    sourceId: String(listing.sourceId),
    sourceUrl: listing.sourceUrl,
    address: listing.address,
    city: listing.city,
    state: listing.state || 'FL',
    zip: listing.zip,
    region,
    price: listing.price,
    beds: listing.beds,
    baths: listing.baths,
    sqft: listing.sqft ?? null,
    lotSizeSqft: listing.lotSizeSqft ?? null,
    hasPool,
    poolReady,
    hasParking: listing.hasParking ?? false,
    yearBuilt: listing.yearBuilt ?? null,
    nearestBeach,
    beachDistanceMiles,
    beachProximity,
    lat: listing.lat ?? null,
    lng: listing.lng ?? null,
    images: JSON.stringify(listing.images ?? []),
    description: listing.description ?? null,
    listedAt: listing.listedAt ?? null,
    isActive: true,
  };

  const existing = await prisma.listing.findUnique({
    where: { source_sourceId: { source: listing.source, sourceId: String(listing.sourceId) } },
    select: { id: true },
  });

  if (existing) {
    await prisma.listing.update({ where: { id: existing.id }, data: { ...data, scrapedAt: new Date() } });
    return 'updated';
  }

  await prisma.listing.create({ data });
  return 'created';
}

export async function saveListings(listings: NormalizedListing[]): Promise<SaveResult> {
  const result: SaveResult = { created: 0, updated: 0, skipped: 0 };
  for (const l of listings) {
    const r = await saveListing(l);
    result[r]++;
  }
  return result;
}
