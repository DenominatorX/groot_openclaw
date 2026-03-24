export type Theme = 'pearl' | 'coastal-noir' | 'sunset';

export interface Listing {
  id: string;
  source: string;
  sourceUrl: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  region: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number | null;
  lotSizeSqft: number | null;
  hasPool: boolean;
  poolReady: boolean;
  hasParking: boolean;
  nearestBeach: string | null;
  beachDistanceMiles: number;
  beachProximity: string | null;
  lat: number | null;
  lng: number | null;
  images: string[];
  description: string | null;
  yearBuilt: number | null;
  listedAt: string | null;
  scrapedAt: string;
}

export interface ApiStats {
  total: number;
  avgPrice: number;
  lowestPrice: number;
  poolCount: number;
}

export interface Filters {
  region: string;
  maxPrice: number;
  minBeds: number;
  minBaths: number;
  maxBeachDistance: number;
  hasPool: boolean;
  hasParking: boolean;
  minLotSize: number;
  sortBy: string;
}

export const DEFAULT_FILTERS: Filters = {
  region: 'All Florida',
  maxPrice: 400000,
  minBeds: 3,
  minBaths: 2,
  maxBeachDistance: 999,
  hasPool: false,
  hasParking: false,
  minLotSize: 0,
  sortBy: 'newest',
};

export const REGIONS = [
  'All Florida',
  'Emerald Coast',
  'Nature Coast',
  'Tampa Bay',
  'Sarasota',
  'Southwest Florida',
  'Miami & Keys',
  'Treasure Coast',
  'Space Coast',
] as const;

export const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'beds_desc',  label: 'Most Beds' },
  { value: 'beach_asc',  label: 'Nearest Beach' },
] as const;
