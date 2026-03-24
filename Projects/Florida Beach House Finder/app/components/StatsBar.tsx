'use client';

import type { ApiStats } from './types';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

interface Props {
  stats: ApiStats;
  dataFresh: boolean;
}

export default function StatsBar({ stats, dataFresh }: Props) {
  const items = [
    { icon: '🏠', label: 'Homes Found',  value: stats.total.toLocaleString() },
    { icon: '💰', label: 'Avg Price',    value: fmt(stats.avgPrice) },
    { icon: '📉', label: 'Lowest Price', value: fmt(stats.lowestPrice) },
    { icon: '🏊', label: 'With Pool',    value: String(stats.poolCount) },
  ];

  return (
    <div
      className="flex items-center gap-5 px-4 py-2.5 overflow-x-auto"
      style={{
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border)',
        scrollbarWidth: 'none',
      }}
    >
      {items.map(({ icon, label, value }) => (
        <div key={label} className="flex items-center gap-2 shrink-0">
          <span style={{ fontSize: 14 }}>{icon}</span>
          <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>
              {label}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {value}
            </div>
          </div>
        </div>
      ))}

      {/* Divider */}
      <div style={{ flex: 1 }} />

      {/* Data freshness */}
      <div className="shrink-0 flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: dataFresh ? '#22c55e' : '#f59e0b', display: 'inline-block' }} />
        {dataFresh ? 'Data current' : 'Refreshing data…'}
      </div>
    </div>
  );
}
