// Florida Sandy Beach Database — 108 beaches across 8 coastal regions
// Used for Haversine distance calculation and beach proximity classification

export type FlRegion =
  | 'Panhandle'
  | 'NE Florida'
  | 'Space Coast'
  | 'Treasure Coast'
  | 'Gold Coast'
  | 'Gulf Coast'
  | 'Tampa Bay'
  | 'Keys';

export interface Beach {
  name: string;
  region: FlRegion;
  lat: number;
  lng: number;
}

export const FL_REGIONS: FlRegion[] = [
  'Panhandle',
  'NE Florida',
  'Space Coast',
  'Treasure Coast',
  'Gold Coast',
  'Gulf Coast',
  'Tampa Bay',
  'Keys',
];

export const BEACHES: Beach[] = [
  // ── Panhandle ──────────────────────────────────────────────────────────────
  { name: 'Pensacola Beach',          region: 'Panhandle',     lat: 30.3335, lng: -87.1530 },
  { name: 'Navarre Beach',            region: 'Panhandle',     lat: 30.3747, lng: -86.8629 },
  { name: 'Fort Walton Beach',        region: 'Panhandle',     lat: 30.4059, lng: -86.6190 },
  { name: 'Okaloosa Island',          region: 'Panhandle',     lat: 30.3986, lng: -86.6134 },
  { name: 'Destin Beach',             region: 'Panhandle',     lat: 30.3935, lng: -86.4958 },
  { name: 'Henderson Beach State Park', region: 'Panhandle',   lat: 30.3729, lng: -86.4576 },
  { name: 'Miramar Beach',            region: 'Panhandle',     lat: 30.3749, lng: -86.3618 },
  { name: 'Seaside Beach',            region: 'Panhandle',     lat: 30.3270, lng: -86.1527 },
  { name: 'Grayton Beach',            region: 'Panhandle',     lat: 30.3168, lng: -86.1497 },
  { name: 'WaterColor Beach',         region: 'Panhandle',     lat: 30.3170, lng: -86.1168 },
  { name: 'Rosemary Beach',           region: 'Panhandle',     lat: 30.2957, lng: -85.9887 },
  { name: 'Panama City Beach',        region: 'Panhandle',     lat: 30.1766, lng: -85.8055 },
  { name: 'St. Andrews State Park',   region: 'Panhandle',     lat: 30.1323, lng: -85.7266 },
  { name: 'Mexico Beach',             region: 'Panhandle',     lat: 29.9502, lng: -85.4151 },
  { name: 'Cape San Blas',            region: 'Panhandle',     lat: 29.6642, lng: -85.3682 },
  { name: 'St. George Island Beach',  region: 'Panhandle',     lat: 29.6564, lng: -84.9228 },
  { name: 'Carrabelle Beach',         region: 'Panhandle',     lat: 29.8538, lng: -84.6604 },
  { name: 'Alligator Point Beach',    region: 'Panhandle',     lat: 30.0677, lng: -84.4000 },
  { name: 'Bald Point State Park',    region: 'Panhandle',     lat: 29.9245, lng: -84.3551 },

  // ── NE Florida ────────────────────────────────────────────────────────────
  { name: 'Amelia Island Beach',      region: 'NE Florida',    lat: 30.6721, lng: -81.4610 },
  { name: 'Fort George Island Beach', region: 'NE Florida',    lat: 30.5521, lng: -81.4507 },
  { name: 'Kathryn Abbey Hanna Park', region: 'NE Florida',    lat: 30.3779, lng: -81.4175 },
  { name: 'Atlantic Beach',           region: 'NE Florida',    lat: 30.3315, lng: -81.3990 },
  { name: 'Neptune Beach',            region: 'NE Florida',    lat: 30.3113, lng: -81.3943 },
  { name: 'Jacksonville Beach',       region: 'NE Florida',    lat: 30.2869, lng: -81.3932 },
  { name: 'Ponte Vedra Beach',        region: 'NE Florida',    lat: 30.2390, lng: -81.3856 },
  { name: 'Vilano Beach',             region: 'NE Florida',    lat: 29.9279, lng: -81.2916 },
  { name: 'St. Augustine Beach',      region: 'NE Florida',    lat: 29.8555, lng: -81.2673 },
  { name: 'Crescent Beach St. Augustine', region: 'NE Florida', lat: 29.7674, lng: -81.2360 },
  { name: 'Flagler Beach',            region: 'NE Florida',    lat: 29.4730, lng: -81.1272 },
  { name: 'Ormond Beach',             region: 'NE Florida',    lat: 29.2859, lng: -81.0578 },
  { name: 'Daytona Beach',            region: 'NE Florida',    lat: 29.2108, lng: -81.0228 },
  { name: 'Daytona Beach Shores',     region: 'NE Florida',    lat: 29.1636, lng: -80.9976 },
  { name: 'New Smyrna Beach',         region: 'NE Florida',    lat: 29.0258, lng: -80.9270 },

  // ── Space Coast ───────────────────────────────────────────────────────────
  { name: 'Canaveral National Seashore', region: 'Space Coast', lat: 28.6983, lng: -80.7372 },
  { name: 'Cape Canaveral Beach',     region: 'Space Coast',   lat: 28.4004, lng: -80.6046 },
  { name: 'Cocoa Beach',              region: 'Space Coast',   lat: 28.3203, lng: -80.6076 },
  { name: 'Patrick Space Force Base Beach', region: 'Space Coast', lat: 28.2339, lng: -80.5999 },
  { name: 'Indialantic Beach',        region: 'Space Coast',   lat: 28.0910, lng: -80.5688 },
  { name: 'Melbourne Beach',          region: 'Space Coast',   lat: 28.0636, lng: -80.5550 },
  { name: 'Sebastian Inlet State Park', region: 'Space Coast', lat: 27.8574, lng: -80.4477 },

  // ── Treasure Coast ────────────────────────────────────────────────────────
  { name: 'Vero Beach',               region: 'Treasure Coast', lat: 27.6386, lng: -80.3973 },
  { name: 'Fort Pierce Beach',        region: 'Treasure Coast', lat: 27.4467, lng: -80.3148 },
  { name: 'Hutchinson Island Beach',  region: 'Treasure Coast', lat: 27.2167, lng: -80.1617 },
  { name: 'Jensen Beach',             region: 'Treasure Coast', lat: 27.2553, lng: -80.2280 },
  { name: 'Stuart Beach',             region: 'Treasure Coast', lat: 27.1978, lng: -80.1853 },
  { name: 'Hobe Sound Beach',         region: 'Treasure Coast', lat: 27.0556, lng: -80.1244 },
  { name: 'Bathtub Reef Beach',       region: 'Treasure Coast', lat: 27.1487, lng: -80.1532 },

  // ── Gold Coast ────────────────────────────────────────────────────────────
  { name: 'Jupiter Beach',            region: 'Gold Coast',    lat: 26.9342, lng: -80.0822 },
  { name: 'Palm Beach Shores',        region: 'Gold Coast',    lat: 26.7741, lng: -80.0373 },
  { name: 'Palm Beach',               region: 'Gold Coast',    lat: 26.7057, lng: -80.0368 },
  { name: 'Delray Beach',             region: 'Gold Coast',    lat: 26.4615, lng: -80.0615 },
  { name: 'Boca Raton Beach',         region: 'Gold Coast',    lat: 26.3683, lng: -80.0834 },
  { name: 'Deerfield Beach',          region: 'Gold Coast',    lat: 26.3184, lng: -80.0997 },
  { name: 'Pompano Beach',            region: 'Gold Coast',    lat: 26.2379, lng: -80.1231 },
  { name: 'Fort Lauderdale Beach',    region: 'Gold Coast',    lat: 26.1224, lng: -80.1101 },
  { name: 'Hollywood Beach',          region: 'Gold Coast',    lat: 26.0112, lng: -80.1193 },
  { name: 'Hallandale Beach',         region: 'Gold Coast',    lat: 25.9812, lng: -80.1198 },
  { name: 'Sunny Isles Beach',        region: 'Gold Coast',    lat: 25.9390, lng: -80.1225 },
  { name: 'Bal Harbour Beach',        region: 'Gold Coast',    lat: 25.8966, lng: -80.1268 },
  { name: 'Surfside Beach',           region: 'Gold Coast',    lat: 25.8726, lng: -80.1243 },
  { name: 'Miami Beach — North Beach', region: 'Gold Coast',   lat: 25.8484, lng: -80.1204 },
  { name: 'Miami Beach — Mid-Beach',  region: 'Gold Coast',    lat: 25.8053, lng: -80.1222 },
  { name: 'South Beach (Miami Beach)', region: 'Gold Coast',   lat: 25.7825, lng: -80.1300 },
  { name: 'Key Biscayne Beach',       region: 'Gold Coast',    lat: 25.6944, lng: -80.1618 },

  // ── Gulf Coast ────────────────────────────────────────────────────────────
  { name: 'Marco Island Beach',       region: 'Gulf Coast',    lat: 25.9412, lng: -81.7180 },
  { name: 'Naples Beach',             region: 'Gulf Coast',    lat: 26.1420, lng: -81.7948 },
  { name: 'Vanderbilt Beach',         region: 'Gulf Coast',    lat: 26.2608, lng: -81.8175 },
  { name: 'Wiggins Pass Beach',       region: 'Gulf Coast',    lat: 26.3122, lng: -81.8282 },
  { name: 'Bonita Beach',             region: 'Gulf Coast',    lat: 26.3394, lng: -81.8470 },
  { name: 'Fort Myers Beach',         region: 'Gulf Coast',    lat: 26.4522, lng: -81.9464 },
  { name: "Lovers Key Beach",         region: 'Gulf Coast',    lat: 26.4054, lng: -81.8908 },
  { name: 'Sanibel Island Beach',     region: 'Gulf Coast',    lat: 26.4478, lng: -82.0929 },
  { name: 'Captiva Island Beach',     region: 'Gulf Coast',    lat: 26.5260, lng: -82.1760 },
  { name: 'Englewood Beach',          region: 'Gulf Coast',    lat: 26.9571, lng: -82.3561 },
  { name: 'Venice Beach',             region: 'Gulf Coast',    lat: 27.0994, lng: -82.4546 },
  { name: 'Nokomis Beach',            region: 'Gulf Coast',    lat: 27.1239, lng: -82.4569 },
  { name: 'Siesta Key Beach',         region: 'Gulf Coast',    lat: 27.2650, lng: -82.5507 },
  { name: 'Crescent Beach Sarasota',  region: 'Gulf Coast',    lat: 27.2315, lng: -82.5407 },
  { name: 'Lido Key Beach',           region: 'Gulf Coast',    lat: 27.3152, lng: -82.5644 },
  { name: 'Longboat Key Beach',       region: 'Gulf Coast',    lat: 27.3912, lng: -82.6349 },
  { name: 'Coquina Beach Anna Maria', region: 'Gulf Coast',    lat: 27.5040, lng: -82.7137 },
  { name: 'Bradenton Beach',          region: 'Gulf Coast',    lat: 27.4712, lng: -82.7045 },

  // ── Tampa Bay ─────────────────────────────────────────────────────────────
  { name: 'Fort De Soto Beach',       region: 'Tampa Bay',     lat: 27.6212, lng: -82.7330 },
  { name: "Pass-a-Grille Beach",      region: 'Tampa Bay',     lat: 27.6694, lng: -82.7378 },
  { name: 'St. Pete Beach',           region: 'Tampa Bay',     lat: 27.7252, lng: -82.7414 },
  { name: 'Treasure Island Beach',    region: 'Tampa Bay',     lat: 27.7697, lng: -82.7682 },
  { name: 'Madeira Beach',            region: 'Tampa Bay',     lat: 27.7982, lng: -82.7913 },
  { name: "John's Pass Beach",        region: 'Tampa Bay',     lat: 27.7928, lng: -82.7965 },
  { name: 'Redington Beach',          region: 'Tampa Bay',     lat: 27.8149, lng: -82.8115 },
  { name: 'Indian Shores Beach',      region: 'Tampa Bay',     lat: 27.8558, lng: -82.8322 },
  { name: 'Indian Rocks Beach',       region: 'Tampa Bay',     lat: 27.8732, lng: -82.8460 },
  { name: 'Belleair Beach',           region: 'Tampa Bay',     lat: 27.9123, lng: -82.8591 },
  { name: 'Sand Key Park Beach',      region: 'Tampa Bay',     lat: 27.9732, lng: -82.8296 },
  { name: 'Clearwater Beach',         region: 'Tampa Bay',     lat: 27.9789, lng: -82.8290 },
  { name: 'Honeymoon Island Beach',   region: 'Tampa Bay',     lat: 28.0788, lng: -82.8281 },
  { name: 'Caladesi Island Beach',    region: 'Tampa Bay',     lat: 28.0576, lng: -82.8270 },
  { name: 'Egmont Key Beach',         region: 'Tampa Bay',     lat: 27.5995, lng: -82.7610 },

  // ── Keys ──────────────────────────────────────────────────────────────────
  { name: 'John Pennekamp State Park', region: 'Keys',         lat: 25.1287, lng: -80.4067 },
  { name: 'Islamorada Beach',          region: 'Keys',         lat: 24.9327, lng: -80.6326 },
  { name: 'Sombrero Beach Marathon',   region: 'Keys',         lat: 24.7000, lng: -81.0998 },
  { name: 'Bahia Honda Beach',         region: 'Keys',         lat: 24.6624, lng: -81.2766 },
  { name: 'Big Pine Key Beach',        region: 'Keys',         lat: 24.6683, lng: -81.3619 },
  { name: 'Fort Zachary Taylor Beach', region: 'Keys',         lat: 24.5508, lng: -81.8093 },
  { name: 'Smathers Beach Key West',   region: 'Keys',         lat: 24.5488, lng: -81.7918 },
  { name: 'Higgs Beach Key West',      region: 'Keys',         lat: 24.5540, lng: -81.7947 },
  { name: 'Dry Tortugas Garden Key',   region: 'Keys',         lat: 24.6282, lng: -82.8732 },
];
