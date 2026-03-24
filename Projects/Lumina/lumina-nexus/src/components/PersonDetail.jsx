/**
 * PersonDetail — right-side profile panel / mobile bottom-sheet.
 * Shows refs, relationships, confidence scoring (with override),
 * AI biography (with cache), translation lens, and branch validation UI.
 */

import { useState, useEffect } from 'react';
import { X, Crown, BookOpen, Users, ChevronRight, CheckCircle, HelpCircle, XCircle, GitMerge } from 'lucide-react';
import { LINEAGE, TRANSLATION_VARIANTS } from '../data/lineage';
import ConfidenceBar from './ConfidenceBar';
import BiographyPanel from './BiographyPanel';
import TranslationLens from './TranslationLens';
import { saveUserResearch, getUserResearch } from '../firebase/db';

const VALIDATION_OPTIONS = [
  { id: 'verified',   label: 'Verified',   icon: CheckCircle,  color: '#4ade80', desc: 'This connection is textually supported' },
  { id: 'uncertain',  label: 'Uncertain',  icon: HelpCircle,   color: '#fb923c', desc: 'The connection has limited evidence'   },
  { id: 'disputed',   label: 'Disputed',   icon: XCircle,      color: '#f87171', desc: 'This connection is contested or unclear' },
];

export default function PersonDetail({ person, onClose, onSelectPerson, activeLens, isFirebaseReady, ensureAuth }) {
  const [confidenceOverride, setConfidenceOverride] = useState(null);
  const [savingScore, setSavingScore] = useState(false);
  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [validation, setValidation] = useState(null);     // 'verified' | 'uncertain' | 'disputed' | null
  const [validationNote, setValidationNote] = useState('');
  const [savingValidation, setSavingValidation] = useState(false);

  const hasApiKey = !!(
    localStorage.getItem('nexus_anthropic_key') ||
    localStorage.getItem('nexus_gemini_key')
  );

  const effectiveScore = confidenceOverride ?? person.confidence ?? 50;

  // Load user research (override + notes + validation) from Firestore
  useEffect(() => {
    setConfidenceOverride(null);
    setNote('');
    setValidation(null);
    setValidationNote('');
    if (!isFirebaseReady) return;
    (async () => {
      const research = await getUserResearch(person.id);
      if (research?.confidenceOverride != null) setConfidenceOverride(research.confidenceOverride);
      if (research?.note) setNote(research.note);
      if (research?.validation) setValidation(research.validation);
      if (research?.validationNote) setValidationNote(research.validationNote);
    })();
  }, [person.id, isFirebaseReady]);

  async function handleSaveOverride(score) {
    const authedUser = await ensureAuth?.();
    if (!authedUser) return;
    setSavingScore(true);
    try {
      await saveUserResearch(person.id, { confidenceOverride: score });
      setConfidenceOverride(score);
    } finally {
      setSavingScore(false);
    }
  }

  async function handleSaveNote() {
    const authedUser = await ensureAuth?.();
    if (!authedUser) return;
    await saveUserResearch(person.id, { note });
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  }

  async function handleSaveValidation(val) {
    setValidation(val);
    if (!isFirebaseReady) return;
    const authedUser = await ensureAuth?.();
    if (!authedUser) return;
    setSavingValidation(true);
    try {
      await saveUserResearch(person.id, { validation: val, validationNote });
    } finally {
      setSavingValidation(false);
    }
  }

  async function handleSaveValidationNote() {
    if (!isFirebaseReady || !validation) return;
    const authedUser = await ensureAuth?.();
    if (!authedUser) return;
    await saveUserResearch(person.id, { validation, validationNote });
  }

  const parent = person.parent ? LINEAGE.find(p => p.id === person.parent) : null;
  const children = (person.children || []).map(cid => LINEAGE.find(p => p.id === cid)).filter(Boolean);
  const spouses  = (person.spouse  || []).map(sid => LINEAGE.find(p => p.id === sid)).filter(Boolean);

  return (
    <div className="rounded-xl overflow-hidden slide-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-start justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            {person.messianic && <Crown size={14} style={{ color: 'var(--gold)' }} />}
            <h3 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{person.name}</h3>
          </div>
          <p className="text-xs capitalize" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            {person.era?.replace(/_/g, ' ')}
            {person.age ? ` · lived ${person.age} years` : ''}
          </p>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/5">
          <X size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {/* Summary */}
        {person.summary && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', lineHeight: 1.7 }}>
            {person.summary}
          </p>
        )}

        {/* Theological significance */}
        {person.significance && (
          <div className="rounded-lg p-3" style={{ background: 'var(--gold)' + '10', border: '1px solid var(--gold)' + '30' }}>
            <p className="text-xs" style={{ color: 'var(--gold)', fontFamily: 'var(--font-body)' }}>
              <strong>Significance:</strong> {person.significance}
            </p>
          </div>
        )}

        {/* Confidence score */}
        <ConfidenceBar
          score={effectiveScore}
          isOverride={confidenceOverride !== null}
          onSaveOverride={isFirebaseReady ? handleSaveOverride : null}
          saving={savingScore}
        />

        {/* Branch Validation UI */}
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}
          >
            <GitMerge size={12} style={{ color: 'var(--gold)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
              Branch Validation
            </span>
            {validation && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded ml-auto"
                style={{
                  background: VALIDATION_OPTIONS.find(v => v.id === validation)?.color + '20',
                  color: VALIDATION_OPTIONS.find(v => v.id === validation)?.color,
                  fontFamily: 'var(--font-body)',
                }}
              >
                {VALIDATION_OPTIONS.find(v => v.id === validation)?.label}
              </span>
            )}
          </div>
          <div className="p-3 space-y-2" style={{ background: 'var(--bg-card)' }}>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              Do you agree with this lineage connection?
            </p>
            <div className="flex gap-1.5">
              {VALIDATION_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isActive = validation === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSaveValidation(opt.id)}
                    disabled={savingValidation}
                    title={opt.desc}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px',
                      padding: '6px 4px',
                      borderRadius: '8px',
                      border: `1px solid ${isActive ? opt.color : 'var(--border)'}`,
                      background: isActive ? opt.color + '18' : 'var(--bg-elevated)',
                      color: isActive ? opt.color : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.6rem',
                      fontWeight: 600,
                    }}
                  >
                    <Icon size={13} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {validation === 'disputed' && (
              <div className="space-y-1.5 fade-in">
                <textarea
                  value={validationNote}
                  onChange={e => setValidationNote(e.target.value)}
                  onBlur={handleSaveValidationNote}
                  placeholder="Explain your reason for disputing this connection…"
                  rows={2}
                  className="w-full px-2.5 py-2 text-xs rounded-lg focus:outline-none resize-none"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>
            )}
            {!isFirebaseReady && (
              <p className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                Sign in to save your validation across devices.
              </p>
            )}
          </div>
        </div>

        {/* Translation lens */}
        <TranslationLens person={person} activeLens={activeLens} />

        {/* Scripture refs */}
        {person.refs?.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <BookOpen size={12} style={{ color: 'var(--gold)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                Scripture References
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {person.refs.map(ref => (
                <span key={ref} className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Relationships */}
        {(parent || children.length > 0 || spouses.length > 0) && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Users size={12} style={{ color: 'var(--gold)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                Relationships
              </span>
            </div>
            {parent && (
              <div>
                <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Parent</span>
                <button
                  onClick={() => onSelectPerson(parent)}
                  className="flex items-center gap-1 text-sm hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--gold)', fontFamily: 'var(--font-body)' }}
                >
                  {parent.name} <ChevronRight size={12} />
                </button>
              </div>
            )}
            {spouses.length > 0 && (
              <div>
                <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Spouse</span>
                <div className="flex flex-wrap gap-2">
                  {spouses.map(s => (
                    <button key={s.id} onClick={() => onSelectPerson(s)} className="text-sm hover:opacity-80 flex items-center gap-1" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                      {s.name} <ChevronRight size={12} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {children.length > 0 && (
              <div>
                <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Children</span>
                <div className="flex flex-wrap gap-2">
                  {children.map(c => (
                    <button key={c.id} onClick={() => onSelectPerson(c)} className="text-sm hover:opacity-80 flex items-center gap-1" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                      {c.name} <ChevronRight size={12} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Biography */}
        <BiographyPanel person={person} isFirebaseReady={isFirebaseReady} hasApiKey={hasApiKey} />

        {/* Notes */}
        {isFirebaseReady && (
          <div className="space-y-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
              Research Notes
            </span>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Add personal research notes…"
              className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none resize-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
            />
            <div className="flex items-center justify-end gap-2">
              {noteSaved && <span className="text-xs" style={{ color: '#4ade80', fontFamily: 'var(--font-body)' }}>Saved!</span>}
              <button
                onClick={handleSaveNote}
                className="px-3 py-1 text-xs rounded-lg"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', border: '1px solid var(--border)' }}
              >
                Save Note
              </button>
            </div>
          </div>
        )}

        {/* Speculative note */}
        {person.note && (
          <div className="rounded-lg p-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              ⚠ {person.note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
