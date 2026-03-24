// Haversine distance calculation and beach proximity classification
// BRD Section 4.3 — Beach Proximity Tiers

import { BEACHES, type Beach } from '@/data/beaches';

const EARTH_RADIUS_MILES = 3958.8;

/** Haversine great-circle distance between two GPS points in miles */
export function haversineDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_MILES * c;
}

export type BeachProximity = 'walkable' | 'close' | 'nearby' | 'far';

/** BRD §4.3 proximity tiers */
export function classifyProximity(distanceMiles: number): BeachProximity {
  if (distanceMiles <= 0.5) return 'walkable';
  if (distanceMiles <= 1.0) return 'close';
  if (distanceMiles <= 3.0) return 'nearby';
  return 'far';
}

export interface NearestBeachResult {
  beach: Beach;
  distanceMiles: number;
  proximity: BeachProximity;
}

/** Find the closest sandy FL beach to a lat/lng point */
export function findNearestBeach(
  lat: number,
  lng: number,
): NearestBeachResult {
  let nearest: Beach = BEACHES[0];
  let minDist = Infinity;

  for (const beach of BEACHES) {
    const dist = haversineDistanceMiles(lat, lng, beach.lat, beach.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = beach;
    }
  }

  return {
    beach: nearest,
    distanceMiles: Math.round(minDist * 100) / 100,
    proximity: classifyProximity(minDist),
  };
}

/** Pool-ready logic: lot ≥ 6000 sqft can accommodate a pool (BRD §5.5) */
export function isPoolReady(lotSizeSqft: number | null | undefined): boolean {
  return (lotSizeSqft ?? 0) >= 6000;
}

/** Keyword pool detection from listing description / features */
const POOL_KEYWORDS = [
  'pool',
  'swimming pool',
  'private pool',
  'in-ground pool',
  'inground pool',
  'heated pool',
  'saltwater pool',
  'screened pool',
  'pool deck',
  'pool cage',
];

export function detectPool(text: string): boolean {
  const lower = text.toLowerCase();
  return POOL_KEYWORDS.some((kw) => lower.includes(kw));
}

/** Hard exclusion filter — true means the listing should be rejected (BRD §5.5) */
const EXCLUSION_TERMS = [
  'condo',
  'condominium',
  'marina',
  'bayfront only',
  'mobile home',
  'manufactured home',
  'vacant lot',
  'land only',
  'lot only',
  'boat slip',
  'houseboat',
];

export function isExcluded(
  propertyType: string,
  description: string,
): boolean {
  const text = `${propertyType} ${description}`.toLowerCase();
  return EXCLUSION_TERMS.some((term) => text.includes(term));
}
