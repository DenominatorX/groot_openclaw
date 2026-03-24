// Shared types for all scrapers

import type { FlRegion } from '@/data/beaches';

/** Normalized listing produced by every scraper → normalizer pipeline */
export interface NormalizedListing {
  source: 'zillow' | 'redfin' | 'realtor' | 'claude';
  sourceId: string;
  sourceUrl: string;

  address: string;
  city: string;
  state: string;
  zip: string;

  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  lotSizeSqft?: number;

  lat?: number;
  lng?: number;

  images: string[];
  description?: string;
  yearBuilt?: number;
  hasParking?: boolean;

  propertyType?: string;
  listedAt?: Date;
}

/** Raw data shape returned by Zillow RapidAPI search */
export interface ZillowRawListing {
  zpid?: string | number;
  id?: string | number;
  detailUrl?: string;
  address?: {
    streetAddress?: string;
    city?: string;
    state?: string;
    zipcode?: string;
  };
  price?: number;
  listPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  livingArea?: number;
  lotAreaValue?: number;
  lotAreaUnit?: string;
  latitude?: number;
  longitude?: number;
  imgSrc?: string;
  photos?: { url: string }[];
  description?: string;
  homeType?: string;
  yearBuilt?: number;
  listingDateTimeOnZillow?: string;
  daysOnZillow?: number;
  priceForHDP?: number;
  unformattedPrice?: number;
}

/** Raw data shape from Redfin Stingray /api/gis-csv */
export interface RedfinRawListing {
  MLS?: string;
  'MLS#'?: string;
  PRICE?: string;
  BEDS?: string;
  BATHS?: string;
  'SQUARE FEET'?: string;
  'LOT SIZE'?: string;
  'ZIP OR POSTAL CODE'?: string;
  ADDRESS?: string;
  CITY?: string;
  STATE?: string;
  LATITUDE?: string;
  LONGITUDE?: string;
  URL?: string;
  'PROPERTY TYPE'?: string;
  'YEAR BUILT'?: string;
  'DAYS ON MARKET'?: string;
  'LIST DATE'?: string;
}

/** Raw data from Realtor.com RapidAPI */
export interface RealtorRawListing {
  property_id?: string;
  listing_id?: string;
  permalink?: string;
  list_price?: number;
  description?: {
    beds?: number;
    baths_full?: number;
    baths_half?: number;
    sqft?: number;
    lot_sqft?: number;
    type?: string;
    year_built?: number;
    text?: string;
  };
  location?: {
    address?: {
      line?: string;
      city?: string;
      state_code?: string;
      postal_code?: string;
      coordinate?: { lat?: number; lon?: number };
    };
  };
  primary_photo?: { href?: string };
  photos?: { href?: string }[];
  list_date?: string;
}
