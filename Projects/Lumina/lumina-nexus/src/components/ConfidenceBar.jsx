/**
 * ConfidenceBar — displays a 1-100 confidence score with a visual progress bar.
 * Speculative connections (< 50) shown with a different color.
 * Users can click to override the score (requires Firebase auth).
 */

import { useState } from 'react';
import { CheckCircle, Edit2, X, Check } from 'lucide-react';

function scoreColor(score) {
  if (score >= 90) return '#4ade80'; // green
  if (score >= 70) return '#c9a84c'; // gold
  if (score >= 50) return '#fb923c'; // orange
  return '#f87171';                   // red (speculative)
}

function scoreLabel(score) {
  if (score >= 90) return 'High confidence';
  if (score >= 70) return 'Moderate confidence';
  if (score >= 50) return 'Some corroboration';
  return 'Speculative';
}

export default function ConfidenceBar({ score, isOverride = false, onSaveOverride, saving = false }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(score);
  const color = scoreColor(score);

  function handleSave() {
    const v = Math.max(1, Math.min(100, Number(draft)));
    onSaveOverride?.(v);
    setEditing(false);
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Connection confidence
          </span>
          {isOverride && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-blue)', color: '#93c5fd' }}>
              user override
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {editing ? (
            <>
              <input
                type="number"
                min={1}
                max={100}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                className="w-14 text-center text-xs rounded px-1 py-0.5 focus:outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
              />
              <button onClick={handleSave} disabled={saving} className="p-0.5 rounded hover:bg-white/5 transition-colors">
                <Check size={13} style={{ color: '#4ade80' }} />
              </button>
              <button onClick={() => setEditing(false)} className="p-0.5 rounded hover:bg-white/5 transition-colors">
                <X size={13} style={{ color: 'var(--text-muted)' }} />
              </button>
            </>
          ) : (
            <>
              <span className="text-sm font-bold" style={{ color, fontFamily: 'var(--font-body)' }}>{score}</span>
              {onSaveOverride && (
                <button
                  onClick={() => { setDraft(score); setEditing(true); }}
                  className="p-0.5 rounded hover:bg-white/5 transition-colors"
                  title="Override confidence score"
                >
                  <Edit2 size={11} style={{ color: 'var(--text-muted)' }} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: color }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          {scoreLabel(score)}
        </span>
        {score < 50 && (
          <span className="text-[10px] flex items-center gap-0.5" style={{ color: '#f87171', fontFamily: 'var(--font-body)' }}>
            Speculative connection
          </span>
        )}
        {score >= 95 && (
          <span className="text-[10px] flex items-center gap-0.5" style={{ color: '#4ade80', fontFamily: 'var(--font-body)' }}>
            <CheckCircle size={10} /> Textually verified
          </span>
        )}
      </div>
    </div>
  );
}
