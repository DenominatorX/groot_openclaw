'use client';

import type { Theme } from './types';

const THEMES: { id: Theme; icon: string; label: string }[] = [
  { id: 'pearl',        icon: '🤍', label: 'Pearl'        },
  { id: 'coastal-noir', icon: '🌊', label: 'Coastal Noir' },
  { id: 'sunset',       icon: '🌅', label: 'Sunset'       },
];

interface Props {
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export default function Header({ theme, onThemeChange, onRefresh, refreshing }: Props) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
      style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-panel)',
        minHeight: 52,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <span style={{ fontSize: 22 }}>🏖️</span>
        <div>
          <h1
            className="font-bold text-lg leading-none"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            EchoHome
          </h1>
          <p className="text-[10px] hidden sm:block mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Florida Beach House Finder
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Theme switcher */}
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id)}
              title={t.label}
              className="px-2.5 py-1.5 text-xs font-medium transition-all"
              style={{
                background: theme === t.id ? 'var(--accent)' : 'var(--bg-elevated)',
                color: theme === t.id ? 'var(--accent-text)' : 'var(--text-muted)',
              }}
            >
              <span className="sm:hidden">{t.icon}</span>
              <span className="hidden sm:inline">{t.icon} {t.label}</span>
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            opacity: refreshing ? 0.6 : 1,
            cursor: refreshing ? 'not-allowed' : 'pointer',
            minWidth: 44,
            minHeight: 44,
          }}
        >
          <span
            className={refreshing ? 'spin' : ''}
            style={{ display: 'inline-block', fontSize: 14 }}
          >
            ↻
          </span>
          <span className="hidden sm:inline">{refreshing ? 'Refreshing…' : 'Refresh'}</span>
        </button>
      </div>
    </header>
  );
}
