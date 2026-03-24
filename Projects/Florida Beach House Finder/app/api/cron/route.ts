// GET /api/cron  — health check for cron services
// POST /api/cron — authenticated daily cron trigger (CRON_SECRET)
// BRD Section 5.6 — Caching strategy: daily auto-refresh

import { NextRequest, NextResponse } from 'next/server';
import { runAllScrapers } from '@/lib/scrapers';

export const dynamic = 'force-dynamic';

function validateCronSecret(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  // Accept via Authorization header or query param
  const authHeader = req.headers.get('authorization');
  const querySecret = req.nextUrl.searchParams.get('secret');

  return (
    authHeader === `Bearer ${cronSecret}` ||
    querySecret === cronSecret
  );
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ ok: true, service: 'EchoHome cron', ts: new Date().toISOString() });
}

export async function POST(req: NextRequest) {
  if (!validateCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[cron] daily scrape triggered at', new Date().toISOString());
    const result = await runAllScrapers();
    console.log('[cron] complete:', result.totals);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error('[cron] error:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
