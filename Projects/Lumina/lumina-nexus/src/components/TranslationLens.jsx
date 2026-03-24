/**
 * TranslationLens — shows KJV / NIV / Septuagint name variants for a person.
 * When the lens is active:
 *   - Universally-agreed facts (name same across all 3) appear first
 *   - Translation-specific diffs shown below
 */

import { BookOpen } from 'lucide-react';
import { TRANSLATION_VARIANTS } from '../data/lineage';

const TRANSLATION_LABELS = {
  kjv: { label: 'KJV', full: 'King James Version',     color: '#8b5a2b' },
  niv: { label: 'NIV', full: 'New International Version', color: '#3a6a8a' },
  lxx: { label: 'LXX', full: 'Septuagint (Greek)',      color: '#4a5a2a' },
};

export default function TranslationLens({ person, activeLens }) {
  const variants = TRANSLATION_VARIANTS[person.id];

  if (!variants) {
    return (
      <div className="rounded-lg p-3 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{person.name}</strong> is spelled consistently across KJV, NIV, and Septuagint.
        </p>
      </div>
    );
  }

  const names = { kjv: variants.kjv, niv: variants.niv, lxx: variants.lxx };
  const allNames = Object.values(names);
  const isUniversal = allNames.every(n => n === allNames[0]);

  // Names that differ from the active lens (or from KJV by default)
  const baseName = names[activeLens || 'kjv'];
  const diffs = Object.entries(names).filter(([, n]) => n !== baseName);

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
        <BookOpen size={12} style={{ color: 'var(--gold)' }} />
        <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
          Translation Variants
        </span>
      </div>

      <div className="p-3 space-y-2" style={{ background: 'var(--bg-card)' }}>
        {/* Universally agreed section */}
        {isUniversal ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: '#4ade80', flexShrink: 0 }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
              Universally agreed: <strong style={{ color: 'var(--text-primary)' }}>{baseName}</strong>
            </span>
          </div>
        ) : (
          <>
            {/* Each translation's name */}
            {Object.entries(names).map(([key, name]) => {
              const meta = TRANSLATION_LABELS[key];
              const isActive = key === (activeLens || 'kjv');
              const isDiff = name !== baseName;

              return (
                <div
                  key={key}
                  className="flex items-center justify-between rounded px-2 py-1"
                  style={{
                    background: isActive ? 'var(--bg-elevated)' : 'transparent',
                    border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: meta.color + '30', color: meta.color, fontFamily: 'var(--font-body)' }}
                    >
                      {meta.label}
                    </span>
                    <span className="text-xs" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                      {name}
                    </span>
                  </div>
                  {isDiff && (
                    <span className="text-[10px]" style={{ color: '#fb923c', fontFamily: 'var(--font-body)' }}>
                      differs
                    </span>
                  )}
                </div>
              );
            })}

            {/* Diff summary */}
            {diffs.length > 0 && (
              <p className="text-[10px] pt-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', borderTop: '1px solid var(--border)' }}>
                {diffs.length} translation{diffs.length !== 1 ? 's' : ''} use a different spelling.
                The name debate may reflect variant Hebrew/Greek manuscript traditions.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
