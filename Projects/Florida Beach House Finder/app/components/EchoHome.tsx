'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Theme, Listing, ApiStats, Filters } from './types';
import { DEFAULT_FILTERS } from './types';
import Header from './Header';
import RegionPillBar from './RegionPillBar';
import StatsBar from './StatsBar';
import FilterPanel from './FilterPanel';
import ListingCard from './ListingCard';
import DetailPanel from './DetailPanel';
import SortDropdown from './SortDropdown';

interface ApiResponse {
  listings: Listing[];
  stats: ApiStats;
  meta: { dataFresh: boolean; refreshTriggered: boolean };
  pagination: { page: number; limit: number; total: number; pages: number };
}

/* ── Mobile bottom sheet ──────────────────────────────────────────────────── */
function MobileSheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />
      <div
        className="absolute bottom-0 left-0 right-0 slide-up"
        style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderBottom: 'none',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            flexShrink: 0,
            padding: '12px 16px 4px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: 'var(--border)',
            }}
          />
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: 16,
              top: 12,
              padding: 6,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 32,
              minHeight: 32,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.646 3.646a.5.5 0 0 1 .708 0L8 7.293l3.646-3.647a.5.5 0 0 1 .708.708L8.707 8l3.647 3.646a.5.5 0 0 1-.708.708L8 8.707l-3.646 3.647a.5.5 0 0 1-.708-.708L7.293 8 3.646 4.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </button>
        </div>
        <div
          style={{
            overflowY: 'auto',
            flex: 1,
            paddingBottom: 'env(safe-area-inset-bottom, 16px)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton grid ────────────────────────────────────────────────────────── */
function SkeletonGrid() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl shimmer"
          style={{ height: 300, border: '1px solid var(--border)' }}
        />
      ))}
    </div>
  );
}

/* ── Empty / Error states ─────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div style={{ fontSize: 52, marginBottom: 12 }}>🏖️</div>
      <h2
        className="text-xl font-semibold mb-2"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
      >
        No homes found
      </h2>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Try adjusting your filters or expanding the price range.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div style={{ fontSize: 40 }}>⚠️</div>
      <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>
        {message}
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-lg text-sm font-semibold"
        style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
      >
        Retry
      </button>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function EchoHome() {
  const [theme, setTheme] = useState<Theme>('pearl');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [dataFresh, setDataFresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  /* ── Fetch ── */
  const fetchListings = useCallback(async (f: Filters, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        region:           f.region,
        maxPrice:         String(f.maxPrice),
        minBeds:          String(f.minBeds),
        minBaths:         String(f.minBaths),
        maxBeachDistance: String(f.maxBeachDistance),
        sortBy:           f.sortBy,
        limit:            '48',
      });
      if (f.hasPool)          params.set('hasPool',   'true');
      if (f.hasParking)       params.set('hasParking','true');
      if (f.minLotSize > 0)   params.set('lotSize',   String(f.minLotSize));

      const res = await fetch(`/api/listings?${params}`, { signal });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data: ApiResponse = await res.json();
      setListings(data.listings);
      setStats(data.stats);
      setDataFresh(data.meta.dataFresh);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to load listings');
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Re-fetch on filter change ── */
  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    fetchListings(filters, abortRef.current.signal);
  }, [filters, fetchListings]);

  /* ── Refresh ── */
  async function handleRefresh() {
    setRefreshing(true);
    try {
      await fetch('/api/refresh', { method: 'POST' });
      await fetchListings(filters);
    } finally {
      setRefreshing(false);
    }
  }

  /* ── Filter helpers ── */
  function updateFilters(partial: Partial<Filters>) {
    setFilters(prev => ({ ...prev, ...partial }));
    setSelectedListing(null);
  }

  const hasDetailPanel = !!selectedListing;

  return (
    <div
      data-theme={theme}
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* ── Header ── */}
      <Header
        theme={theme}
        onThemeChange={setTheme}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* ── Region pills ── */}
      <RegionPillBar
        activeRegion={filters.region}
        onChange={r => updateFilters({ region: r })}
      />

      {/* ── Stats bar ── */}
      {stats && <StatsBar stats={stats} dataFresh={dataFresh} />}

      {/* ── Body ── */}
      <div className="flex">

        {/* Desktop sidebar */}
        <aside
          className="hidden lg:block shrink-0"
          style={{
            width: 300,
            position: 'sticky',
            top: 52,
            height: 'calc(100vh - 52px)',
            overflowY: 'auto',
            background: 'var(--bg-card)',
            borderRight: '1px solid var(--border)',
          }}
        >
          <FilterPanel
            filters={filters}
            onChange={updateFilters}
            onClose={() => {}}
          />
        </aside>

        {/* Main column */}
        <main className="flex-1 min-w-0">
          {/* Toolbar */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-card)',
              position: 'sticky',
              top: 52,
              zIndex: 30,
            }}
          >
            <div className="flex items-center gap-2">
              {/* Mobile filter toggle */}
              <button
                className="lg:hidden flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border"
                onClick={() => setShowFilterSheet(true)}
                style={{
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                  minHeight: 32,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.5 3h13a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1zm2 4h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1 0-1zm2 4h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1z" />
                </svg>
                Filters
              </button>

              <span
                className="text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                {loading ? 'Loading…' : `${stats?.total ?? 0} homes`}
              </span>
            </div>

            <SortDropdown
              value={filters.sortBy}
              onChange={v => updateFilters({ sortBy: v })}
            />
          </div>

          {/* Grid + detail panel side by side */}
          <div className="flex" style={{ alignItems: 'flex-start' }}>
            {/* Listings grid */}
            <div
              className="flex-1 min-w-0 p-4 fade-in"
              style={{ transition: 'max-width 0.25s ease' }}
            >
              {error ? (
                <ErrorState message={error} onRetry={() => fetchListings(filters)} />
              ) : loading ? (
                <SkeletonGrid />
              ) : listings.length === 0 ? (
                <EmptyState />
              ) : (
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: hasDetailPanel
                      ? 'repeat(auto-fill, minmax(260px, 1fr))'
                      : 'repeat(auto-fill, minmax(280px, 1fr))',
                  }}
                >
                  {listings.map(l => (
                    <ListingCard
                      key={l.id}
                      listing={l}
                      isSelected={selectedListing?.id === l.id}
                      onClick={setSelectedListing}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop detail panel */}
            {selectedListing && (
              <div
                className="hidden lg:block shrink-0"
                style={{
                  width: 480,
                  position: 'sticky',
                  top: 98,
                  height: 'calc(100vh - 98px)',
                  overflowY: 'auto',
                  borderLeft: '1px solid var(--border)',
                }}
              >
                <DetailPanel
                  listing={selectedListing}
                  onClose={() => setSelectedListing(null)}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Mobile: filter sheet ── */}
      {showFilterSheet && (
        <MobileSheet onClose={() => setShowFilterSheet(false)}>
          <FilterPanel
            filters={filters}
            onChange={updateFilters}
            onClose={() => setShowFilterSheet(false)}
          />
        </MobileSheet>
      )}

      {/* ── Mobile: detail sheet ── */}
      {selectedListing && (
        <div className="lg:hidden">
          <MobileSheet onClose={() => setSelectedListing(null)}>
            <DetailPanel
              listing={selectedListing}
              onClose={() => setSelectedListing(null)}
            />
          </MobileSheet>
        </div>
      )}
    </div>
  );
}
