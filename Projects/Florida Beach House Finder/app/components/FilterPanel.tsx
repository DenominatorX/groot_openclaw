'use client';

import type { Filters } from './types';

const BEACH_OPTS = [
  { v: 0.5,  l: '≤ ½ mi (Walkable)' },
  { v: 1,    l: '≤ 1 mile' },
  { v: 2,    l: '≤ 2 miles' },
  { v: 5,    l: '≤ 5 miles' },
  { v: 10,   l: '≤ 10 miles' },
  { v: 999,  l: 'Any distance' },
];

const LOT_OPTS = [
  { v: 0,      l: 'Any size' },
  { v: 5000,   l: '5,000+ sqft' },
  { v: 8000,   l: '8,000+ sqft' },
  { v: 12000,  l: '12,000+ sqft' },
  { v: 20000,  l: '20,000+ sqft' },
];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[10px] font-semibold uppercase tracking-wider mb-2"
      style={{ color: 'var(--text-muted)' }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ borderBottom: '1px solid var(--border)', margin: '4px 0 16px' }} />;
}

interface Props {
  filters: Filters;
  onChange: (partial: Partial<Filters>) => void;
  onClose: () => void;
}

export default function FilterPanel({ filters, onChange, onClose }: Props) {
  return (
    <div className="p-4 space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2
          className="text-base font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
        >
          Filters
        </h2>
        <button
          className="lg:hidden text-sm font-semibold"
          onClick={onClose}
          style={{ color: 'var(--accent)', minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
        >
          Done
        </button>
      </div>

      {/* Max Price */}
      <div>
        <Label>Max Price</Label>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>$100K</span>
          <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
            ${(filters.maxPrice / 1000).toFixed(0)}K
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>$400K</span>
        </div>
        <input
          type="range"
          min={100000}
          max={400000}
          step={5000}
          value={filters.maxPrice}
          onChange={e => onChange({ maxPrice: +e.target.value })}
          className="w-full"
          style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
        />
        <Divider />
      </div>

      {/* Beds & Baths */}
      <div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Min Beds</Label>
            <div className="flex gap-1.5">
              {[3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => onChange({ minBeds: n })}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold border transition-all"
                  style={{
                    background: filters.minBeds === n ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: filters.minBeds === n ? 'var(--accent-text)' : 'var(--text-muted)',
                    borderColor: filters.minBeds === n ? 'var(--accent)' : 'var(--border)',
                    minHeight: 32,
                  }}
                >
                  {n}+
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Min Baths</Label>
            <div className="flex gap-1.5">
              {[2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => onChange({ minBaths: n })}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold border transition-all"
                  style={{
                    background: filters.minBaths === n ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: filters.minBaths === n ? 'var(--accent-text)' : 'var(--text-muted)',
                    borderColor: filters.minBaths === n ? 'var(--accent)' : 'var(--border)',
                    minHeight: 32,
                  }}
                >
                  {n}+
                </button>
              ))}
            </div>
          </div>
        </div>
        <Divider />
      </div>

      {/* Beach Distance */}
      <div>
        <Label>Beach Distance</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {BEACH_OPTS.map(opt => (
            <button
              key={opt.v}
              onClick={() => onChange({ maxBeachDistance: opt.v })}
              className="py-2 px-2.5 rounded-lg text-[11px] font-medium border transition-all text-left"
              style={{
                background: filters.maxBeachDistance === opt.v ? 'var(--accent)' : 'var(--bg-elevated)',
                color: filters.maxBeachDistance === opt.v ? 'var(--accent-text)' : 'var(--text-muted)',
                borderColor: filters.maxBeachDistance === opt.v ? 'var(--accent)' : 'var(--border)',
                minHeight: 36,
              }}
            >
              {opt.l}
            </button>
          ))}
        </div>
        <Divider />
      </div>

      {/* Amenities */}
      <div>
        <Label>Amenities</Label>
        <div className="space-y-2">
          {[
            { key: 'hasPool',    icon: '🏊', label: 'Has Pool' },
            { key: 'hasParking', icon: '🚗', label: 'Parking' },
          ].map(({ key, icon, label }) => {
            const active = !!filters[key as keyof Filters];
            return (
              <button
                key={key}
                onClick={() => onChange({ [key]: !active } as Partial<Filters>)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium transition-all"
                style={{
                  background: active ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: active ? 'var(--accent-text)' : 'var(--text-secondary)',
                  borderColor: active ? 'var(--accent)' : 'var(--border)',
                  minHeight: 44,
                }}
              >
                <span>{icon} {label}</span>
                {active && <span style={{ fontSize: 12 }}>✓</span>}
              </button>
            );
          })}
        </div>
        <Divider />
      </div>

      {/* Lot Size */}
      <div>
        <Label>Min Lot Size</Label>
        <select
          value={filters.minLotSize}
          onChange={e => onChange({ minLotSize: +e.target.value })}
          className="w-full px-3 py-2 rounded-lg text-sm border"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)',
            outline: 'none',
            minHeight: 44,
          }}
        >
          {LOT_OPTS.map(opt => (
            <option key={opt.v} value={opt.v}>{opt.l}</option>
          ))}
        </select>
      </div>

      {/* Reset */}
      <button
        onClick={() => onChange({
          maxPrice: 400000,
          minBeds: 3,
          minBaths: 2,
          maxBeachDistance: 999,
          hasPool: false,
          hasParking: false,
          minLotSize: 0,
        })}
        className="w-full py-2 text-xs font-semibold rounded-lg border transition-colors"
        style={{
          background: 'transparent',
          borderColor: 'var(--border)',
          color: 'var(--text-muted)',
          minHeight: 36,
        }}
      >
        Reset Filters
      </button>
    </div>
  );
}
