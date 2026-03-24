'use client';

import { REGIONS } from './types';

interface Props {
  activeRegion: string;
  onChange: (region: string) => void;
}

export default function RegionPillBar({ activeRegion, onChange }: Props) {
  return (
    <div
      className="flex gap-2 px-4 py-3 overflow-x-auto"
      style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {REGIONS.map(r => {
        const active = r === activeRegion;
        return (
          <button
            key={r}
            onClick={() => onChange(r)}
            className="whitespace-nowrap text-xs font-semibold transition-all"
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              background: active ? 'var(--pill-active-bg)' : 'var(--pill-bg)',
              border: `1px solid ${active ? 'var(--pill-active-border)' : 'var(--border)'}`,
              color: active ? 'var(--pill-active-text)' : 'var(--text-muted)',
              minWidth: 'max-content',
              minHeight: 32,
            }}
          >
            {r}
          </button>
        );
      })}
    </div>
  );
}
