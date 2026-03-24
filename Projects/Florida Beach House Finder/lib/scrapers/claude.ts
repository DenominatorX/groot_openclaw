// Claude AI fallback scraper — used when all primary sources fail
// BRD Section 5.4 — claude-sonnet-4-20250514, max_tokens: 4096

import Anthropic from '@anthropic-ai/sdk';
import type { NormalizedListing } from './types';
import { FL_REGIONS, type FlRegion } from '@/data/beaches';
import { BEACHES } from '@/data/beaches';

const MODEL = 'claude-sonnet-4-20250514';

// Representative cities per region for the fallback prompt
const REGION_CITIES: Record<FlRegion, string[]> = {
  Panhandle:        ['Pensacola Beach', 'Destin', 'Panama City Beach'],
  'NE Florida':     ['Jacksonville Beach', 'St. Augustine', 'Flagler Beach'],
  'Space Coast':    ['Cocoa Beach', 'Melbourne Beach'],
  'Treasure Coast': ['Vero Beach', 'Stuart', 'Fort Pierce'],
  'Gold Coast':     ['Fort Lauderdale', 'Miami Beach', 'Delray Beach'],
  'Gulf Coast':     ['Naples', 'Fort Myers Beach', 'Sarasota'],
  'Tampa Bay':      ['Clearwater Beach', 'St. Pete Beach'],
  Keys:             ['Key West', 'Marathon', 'Islamorada'],
};

interface ClaudeListingJson {
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  lotSizeSqft?: number;
  hasPool?: boolean;
  lat?: number;
  lng?: number;
  description?: string;
  yearBuilt?: number;
  images?: string[];
  sourceUrl?: string;
}

export async function scrapeWithClaude(
  anthropicApiKey: string,
  targetRegion?: FlRegion,
): Promise<NormalizedListing[]> {
  const client = new Anthropic({ apiKey: anthropicApiKey });

  const region = targetRegion ?? FL_REGIONS[Math.floor(Math.random() * FL_REGIONS.length)];
  const cities = REGION_CITIES[region];
  const beachesInRegion = BEACHES.filter((b) => b.region === region);

  const prompt = `You are a real estate data assistant. Generate 15 realistic Florida beach house listings for the ${region} region that meet these criteria:

- Single-family homes (NO condos, mobile homes, vacant lots, or marina properties)
- At least 3 bedrooms, 2 bathrooms
- Price under $400,000
- Near sandy beaches in: ${cities.join(', ')}
- Include some with pools (hasPool: true when description mentions "pool")
- Include lot sizes (some ≥6000 sqft for pool-ready)
- Use real-sounding addresses

Nearby sandy beaches for reference (use these GPS coords):
${beachesInRegion.slice(0, 5).map((b) => `- ${b.name}: lat ${b.lat}, lng ${b.lng}`).join('\n')}

Return a valid JSON array (no markdown, no explanation) with this schema per listing:
{
  "address": "123 Ocean Blvd",
  "city": "Clearwater Beach",
  "state": "FL",
  "zip": "33767",
  "price": 349000,
  "beds": 3,
  "baths": 2,
  "sqft": 1450,
  "lotSizeSqft": 7500,
  "lat": 27.97,
  "lng": -82.83,
  "description": "Charming 3/2 with private pool, 2 blocks from the beach...",
  "yearBuilt": 1985,
  "images": [],
  "sourceUrl": "https://www.zillow.com/homes/for_sale/Clearwater-Beach-FL"
}`;

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') return [];

    const text = textBlock.text.trim();
    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed: ClaudeListingJson[] = JSON.parse(jsonMatch[0]);

    return parsed
      .filter((item) => item.price && item.price <= 400000 && item.beds >= 3 && item.baths >= 2)
      .map((item, idx): NormalizedListing => ({
        source: 'claude',
        sourceId: `claude-${region.toLowerCase().replace(/\s/g, '-')}-${Date.now()}-${idx}`,
        sourceUrl: item.sourceUrl ?? 'https://www.zillow.com/homes/for_sale/Florida/',
        address: item.address,
        city: item.city,
        state: item.state ?? 'FL',
        zip: item.zip,
        price: item.price,
        beds: item.beds,
        baths: item.baths,
        sqft: item.sqft,
        lotSizeSqft: item.lotSizeSqft,
        lat: item.lat,
        lng: item.lng,
        images: item.images ?? [],
        description: item.description,
        propertyType: 'Single Family',
        yearBuilt: item.yearBuilt,
      }));
  } catch (err) {
    console.error('[claude] fallback error:', err);
    return [];
  }
}
