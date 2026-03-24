// Orchestrator — runs all scrapers and saves results
// Respects per-source rate limits (BRD §5.1-5.4)

import { scrapeZillow } from './zillow';
import { scrapeRedfin } from './redfin';
import { scrapeRealtor } from './realtor';
import { scrapeWithClaude } from './claude';
import { saveListings, type SaveResult } from './normalizer';
import { prisma } from '@/lib/prisma';

export interface ScrapeAllResult {
  zillow: SaveResult;
  redfin: SaveResult;
  realtor: SaveResult;
  claude: SaveResult;
  totals: SaveResult;
}

const ZERO: SaveResult = { created: 0, updated: 0, skipped: 0 };
function add(a: SaveResult, b: SaveResult): SaveResult {
  return {
    created: a.created + b.created,
    updated: a.updated + b.updated,
    skipped: a.skipped + b.skipped,
  };
}

export async function runAllScrapers(): Promise<ScrapeAllResult> {
  const rapidApiKey = process.env.RAPIDAPI_KEY ?? '';
  const anthropicKey = process.env.ANTHROPIC_API_KEY ?? '';

  const results = {
    zillow:  { ...ZERO },
    redfin:  { ...ZERO },
    realtor: { ...ZERO },
    claude:  { ...ZERO },
    totals:  { ...ZERO },
  };

  // ── Zillow (20 calls/day budget) ──────────────────────────────────────────
  if (rapidApiKey) {
    const runId = await startRun('zillow');
    try {
      const listings = await scrapeZillow(rapidApiKey, 20);
      results.zillow = await saveListings(listings);
      await finishRun(runId, 'done', listings.length, results.zillow.created + results.zillow.updated);
    } catch (err) {
      await finishRun(runId, 'error', 0, 0, String(err));
      console.error('[zillow] run error:', err);
    }
  } else {
    console.warn('[zillow] skipped — RAPIDAPI_KEY not set');
  }

  // ── Redfin (100 calls/day budget) ─────────────────────────────────────────
  {
    const runId = await startRun('redfin');
    try {
      const listings = await scrapeRedfin(100);
      results.redfin = await saveListings(listings);
      await finishRun(runId, 'done', listings.length, results.redfin.created + results.redfin.updated);
    } catch (err) {
      await finishRun(runId, 'error', 0, 0, String(err));
      console.error('[redfin] run error:', err);
    }
  }

  // ── Realtor.com (20 calls/day budget) ─────────────────────────────────────
  if (rapidApiKey) {
    const runId = await startRun('realtor');
    try {
      const listings = await scrapeRealtor(rapidApiKey, 20);
      results.realtor = await saveListings(listings);
      await finishRun(runId, 'done', listings.length, results.realtor.created + results.realtor.updated);
    } catch (err) {
      await finishRun(runId, 'error', 0, 0, String(err));
      console.error('[realtor] run error:', err);
    }
  } else {
    console.warn('[realtor] skipped — RAPIDAPI_KEY not set');
  }

  // ── Claude fallback (when primary sources returned nothing) ───────────────
  const primaryTotal = results.zillow.created + results.redfin.created + results.realtor.created;
  if (primaryTotal === 0 && anthropicKey) {
    console.log('[claude] primary sources empty — activating fallback');
    const runId = await startRun('claude');
    try {
      const listings = await scrapeWithClaude(anthropicKey);
      results.claude = await saveListings(listings);
      await finishRun(runId, 'done', listings.length, results.claude.created + results.claude.updated);
    } catch (err) {
      await finishRun(runId, 'error', 0, 0, String(err));
      console.error('[claude] run error:', err);
    }
  }

  results.totals = [results.zillow, results.redfin, results.realtor, results.claude].reduce(add, { ...ZERO });

  return results;
}

async function startRun(source: string): Promise<string> {
  const run = await prisma.scrapeRun.create({
    data: { source, status: 'running' },
  });
  return run.id;
}

async function finishRun(
  id: string,
  status: 'done' | 'error',
  found: number,
  saved: number,
  error?: string,
): Promise<void> {
  await prisma.scrapeRun.update({
    where: { id },
    data: { status, found, saved, error: error ?? null, finishedAt: new Date() },
  });
}

/** Check if any scrape run has completed in the last 24 hours */
export async function isDataFresh(): Promise<boolean> {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await prisma.scrapeRun.findFirst({
    where: { status: 'done', finishedAt: { gte: yesterday } },
    orderBy: { finishedAt: 'desc' },
  });
  return !!recent;
}
