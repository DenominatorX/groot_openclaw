// POST /api/refresh — manual refresh trigger (board-accessible)
// Runs all scrapers and returns a summary

import { NextRequest, NextResponse } from 'next/server';
import { runAllScrapers } from '@/lib/scrapers';

export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest) {
  try {
    const result = await runAllScrapers();
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error('[refresh] error:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
