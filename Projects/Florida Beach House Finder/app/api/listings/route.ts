// GET /api/listings
// BRD Section 5.6 — Query filters + caching strategy

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isDataFresh, runAllScrapers } from '@/lib/scrapers';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  // ── Parse filters ──────────────────────────────────────────────────────────
  const region       = searchParams.get('region') ?? undefined;
  const maxPrice     = parseInt(searchParams.get('maxPrice') ?? '400000', 10);
  const minBeds      = parseFloat(searchParams.get('minBeds') ?? '3');
  const minBaths     = parseFloat(searchParams.get('minBaths') ?? '2');
  const maxBeachDist = parseFloat(searchParams.get('maxBeachDistance') ?? '999');
  const hasPool      = searchParams.get('hasPool') === 'true' ? true : undefined;
  const hasParking   = searchParams.get('hasParking') === 'true' ? true : undefined;
  const minLotSize   = searchParams.get('lotSize') ? parseInt(searchParams.get('lotSize')!, 10) : undefined;
  const proximity    = searchParams.get('proximity') ?? undefined; // walkable|close|nearby|far
  const sortBy       = searchParams.get('sortBy') ?? 'newest';
  const page         = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit        = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10)));

  // ── Build Prisma where clause ──────────────────────────────────────────────
  const where: Prisma.ListingWhereInput = {
    isActive: true,
    price:    { lte: maxPrice },
    beds:     { gte: minBeds },
    baths:    { gte: minBaths },
    beachDistanceMiles: { lte: maxBeachDist },
  };

  if (region && region !== 'All Florida') where.region = region;
  if (hasPool !== undefined)    where.hasPool = hasPool;
  if (hasParking !== undefined) where.hasParking = hasParking;
  if (minLotSize !== undefined) where.lotSizeSqft = { gte: minLotSize };
  if (proximity)                where.beachProximity = proximity;

  // ── Sort ──────────────────────────────────────────────────────────────────
  const orderBy = buildOrderBy(sortBy);

  // ── Cache strategy: serve from DB, trigger background refresh if stale ────
  const fresh = await isDataFresh();
  if (!fresh) {
    // Background refresh (non-blocking)
    runAllScrapers().catch((err) => console.error('[listings] background refresh error:', err));
  }

  // ── Query ─────────────────────────────────────────────────────────────────
  const [total, listings] = await Promise.all([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id:                 true,
        source:             true,
        sourceUrl:          true,
        address:            true,
        city:               true,
        state:              true,
        zip:                true,
        region:             true,
        price:              true,
        beds:               true,
        baths:              true,
        sqft:               true,
        lotSizeSqft:        true,
        hasPool:            true,
        poolReady:          true,
        hasParking:         true,
        nearestBeach:       true,
        beachDistanceMiles: true,
        beachProximity:     true,
        lat:                true,
        lng:                true,
        images:             true,
        description:        true,
        yearBuilt:          true,
        listedAt:           true,
        scrapedAt:          true,
      },
    }),
  ]);

  // ── Stats bar data ─────────────────────────────────────────────────────────
  const stats = await prisma.listing.aggregate({
    where,
    _count:  { id: true },
    _avg:    { price: true },
    _min:    { price: true },
  });
  const poolCount = await prisma.listing.count({ where: { ...where, hasPool: true } });

  // Parse images JSON before returning
  const mapped = listings.map((l) => ({
    ...l,
    images: parseImages(l.images),
  }));

  return NextResponse.json({
    listings: mapped,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    stats: {
      total:     stats._count.id,
      avgPrice:  Math.round(stats._avg.price ?? 0),
      lowestPrice: stats._min.price ?? 0,
      poolCount,
    },
    meta: {
      dataFresh: fresh,
      refreshTriggered: !fresh,
    },
  });
}

function buildOrderBy(sortBy: string): Prisma.ListingOrderByWithRelationInput {
  switch (sortBy) {
    case 'price_asc':   return { price: 'asc' };
    case 'price_desc':  return { price: 'desc' };
    case 'beach_asc':   return { beachDistanceMiles: 'asc' };
    case 'beds_desc':   return { beds: 'desc' };
    case 'newest':
    default:            return { scrapedAt: 'desc' };
  }
}

function parseImages(raw: string): string[] {
  try { return JSON.parse(raw); } catch { return []; }
}
