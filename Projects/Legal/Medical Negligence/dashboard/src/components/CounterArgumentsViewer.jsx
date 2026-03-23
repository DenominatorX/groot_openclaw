import { useState, useRef } from 'react'
import data from '../data/counter-arguments.json'

// ─── Threat level config ──────────────────────────────────────────────────────
const THREAT = {
  critical: {
    badge:  'bg-red-900/60 text-red-300 border border-red-700',
    border: 'border-red-600',
    ring:   'ring-red-600',
    text:   'text-red-400',
    bg:     'bg-red-900/20',
  },
  high: {
    badge:  'bg-orange-900/60 text-orange-300 border border-orange-700',
    border: 'border-orange-500',
    ring:   'ring-orange-500',
    text:   'text-orange-400',
    bg:     'bg-orange-900/20',
  },
  medium: {
    badge:  'bg-yellow-900/60 text-yellow-300 border border-yellow-700',
    border: 'border-yellow-500',
    ring:   'ring-yellow-500',
    text:   'text-yellow-400',
    bg:     'bg-yellow-900/20',
  },
  low: {
    badge:  'bg-slate-700/60 text-slate-400 border border-slate-600',
    border: 'border-slate-600',
    ring:   'ring-slate-600',
    text:   'text-slate-400',
    bg:     'bg-slate-800/40',
  },
}

const STRENGTH = {
  high:   'bg-green-900/40 text-green-300 border border-green-700',
  medium: 'bg-yellow-900/40 text-yellow-300 border border-yellow-700',
  low:    'bg-red-900/40 text-red-300 border border-red-700',
}

function ThreatBadge({ level }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${THREAT[level]?.badge}`}>
      {level === 'critical' && '⚠ '}
      {level}
    </span>
  )
}

function RankBadge({ rank }) {
  const label = rank === 'strongest' ? '★ STRONGEST' : `#${rank}`
  const cls = rank === 'strongest'
    ? 'bg-red-900/60 text-red-300 border border-red-700 font-bold'
    : 'bg-slate-700 text-slate-300 border border-slate-600'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs uppercase tracking-wide ${cls}`}>
      {label}
    </span>
  )
}

// ─── Single counter card ──────────────────────────────────────────────────────
function CounterCard({ counter, practiceMode, isStrongest = false }) {
  const [expanded, setExpanded] = useState(false)
  const t = THREAT[counter.threatLevel] || THREAT.low

  return (
    <div className={`rounded-lg border ${isStrongest ? `border-2 ${t.border} ${t.bg}` : 'border-slate-700 bg-slate-800/50'} p-4`}>
      <div className="flex items-start gap-3 mb-2">
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <RankBadge rank={counter.rank} />
          <ThreatBadge level={counter.threatLevel} />
        </div>
        <h3 className="text-sm font-semibold text-white leading-snug">{counter.label}</h3>
      </div>

      <p className="text-slate-300 text-sm mb-2 leading-relaxed">{counter.summary}</p>

      <p className="text-slate-500 text-xs italic mb-3">{counter.legalBasis}</p>

      {/* Rebuttal */}
      {practiceMode ? (
        <button
          onClick={() => setExpanded(!expanded)}
          className={`text-xs font-medium px-3 py-1.5 rounded border transition-colors ${
            expanded
              ? 'bg-green-900/40 border-green-700 text-green-300'
              : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {expanded ? 'Hide Rebuttal' : 'Show Rebuttal'}
        </button>
      ) : (
        <button
          onClick={() => setExpanded(!expanded)}
          className={`text-xs font-medium px-3 py-1.5 rounded border transition-colors ${
            expanded
              ? 'bg-green-900/40 border-green-700 text-green-300'
              : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {expanded ? '▲ Hide Rebuttal' : '▼ Our Rebuttal'}
        </button>
      )}

      {expanded && (
        <div className="mt-3 p-3 rounded bg-green-950/40 border border-green-800">
          <div className="text-xs font-semibold text-green-400 uppercase tracking-wide mb-1">Our Rebuttal</div>
          <p className="text-green-200 text-sm leading-relaxed">{counter.ourRebuttal}</p>
        </div>
      )}
    </div>
  )
}

// ─── Claim detail view ────────────────────────────────────────────────────────
function ClaimDetail({ claim, practiceMode }) {
  const strongest = claim.counters.find(c => c.rank === 'strongest')
  const others = claim.counters.filter(c => c.rank !== 'strongest').sort((a, b) => a.rank - b.rank)

  return (
    <div>
      {/* Header */}
      <div className="mb-5 pb-4 border-b border-slate-700">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className="text-xl font-bold text-white">{claim.title}</h2>
          <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold uppercase ${STRENGTH[claim.ourStrength]}`}>
            Our Strength: {claim.ourStrength}
          </span>
        </div>
        <p className="text-slate-400 text-sm">{claim.defendant}</p>
      </div>

      {/* Strongest counter */}
      {strongest && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-400 text-base">⚠</span>
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest">Primary Threat</h3>
          </div>
          <CounterCard counter={strongest} practiceMode={practiceMode} isStrongest />
        </div>
      )}

      {/* Additional counters */}
      {others.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Additional Attack Vectors</h3>
          <div className="flex flex-col gap-3">
            {others.map(c => (
              <CounterCard key={c.rank} counter={c} practiceMode={practiceMode} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Overarching Defenses section ─────────────────────────────────────────────
function OverarchingDefenses({ defenses }) {
  return (
    <div>
      <div className="mb-5 pb-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">Overarching Defenses</h2>
        <p className="text-slate-400 text-sm mt-1">Cross-cutting theories that undermine the entire case — not tied to a single claim.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {defenses.map(d => {
          const t = THREAT[d.threatLevel] || THREAT.low
          return (
            <div key={d.id} className={`rounded-lg border-2 ${t.border} ${t.bg} p-4`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-white leading-snug">{d.label}</h3>
                <ThreatBadge level={d.threatLevel} />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{d.summary}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Print styles injected into page head ────────────────────────────────────
function injectPrintStyles() {
  const existing = document.getElementById('ca-print-styles')
  if (existing) return
  const style = document.createElement('style')
  style.id = 'ca-print-styles'
  style.textContent = `
    @media print {
      body * { visibility: hidden; }
      #ca-print-root, #ca-print-root * { visibility: visible; }
      #ca-print-root { position: absolute; left: 0; top: 0; width: 100%; }
      .ca-no-print { display: none !important; }
      .ca-counter-card { page-break-inside: avoid; }
    }
  `
  document.head.appendChild(style)
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CounterArgumentsViewer() {
  const { claims, overarchingDefenses } = data

  const [selectedId, setSelectedId]     = useState(claims[0].id)
  const [practiceMode, setPracticeMode] = useState(false)
  const [defendantFilter, setDefendantFilter] = useState('all')
  const [threatFilter, setThreatFilter]       = useState('all')
  const printRef = useRef(null)

  // Derive unique defendants for filter
  const defendants = ['all', ...Array.from(new Set(claims.map(c => {
    if (c.defendant.includes('Kayani')) return 'Kayani'
    if (c.defendant.includes('Rosario')) return 'Rosario'
    return 'Both'
  })))]

  // Filter claims
  const visibleClaims = claims.filter(c => {
    if (defendantFilter === 'all') return true
    if (defendantFilter === 'Kayani')  return c.defendant.includes('Kayani') && !c.defendant.includes('Both')
    if (defendantFilter === 'Rosario') return c.defendant.includes('Rosario')
    if (defendantFilter === 'Both')    return c.defendant === 'Both Defendants'
    return true
  }).filter(c => {
    if (threatFilter === 'all') return true
    return c.counters.some(x => x.threatLevel === threatFilter)
  })

  // Keep selected claim valid
  const activeClaim = claims.find(c => c.id === selectedId)
    || (visibleClaims.length > 0 ? visibleClaims[0] : null)

  const showOverarching = selectedId === 'overarching'

  function handlePrint() {
    injectPrintStyles()
    window.print()
  }

  return (
    <div id="ca-print-root" ref={printRef}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 ca-no-print">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Counter Arguments Viewer</h1>
          <p className="text-slate-400 text-sm">Defense attack vectors per claim — with rebuttals. Use Practice Mode to prepare for deposition.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Practice mode toggle */}
          <button
            onClick={() => setPracticeMode(!practiceMode)}
            className={`text-xs font-semibold px-3 py-2 rounded border transition-colors ${
              practiceMode
                ? 'bg-amber-900/40 border-amber-600 text-amber-300'
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {practiceMode ? '🎯 Practice Mode: ON' : '🎯 Practice Mode'}
          </button>

          {/* Print / export */}
          <button
            onClick={handlePrint}
            className="text-xs font-semibold px-3 py-2 rounded border border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            🖨 Export PDF
          </button>
        </div>
      </div>

      {/* Practice mode banner */}
      {practiceMode && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-amber-900/30 border border-amber-700 text-amber-300 text-sm ca-no-print">
          <strong>Practice Mode</strong> — Rebuttals are hidden. Click "Show Rebuttal" on each counter to reveal your answer. Simulates deposition preparation.
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 ca-no-print flex-wrap">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Defendant:</span>
          {defendants.map(d => (
            <button
              key={d}
              onClick={() => { setDefendantFilter(d); if (d !== 'all') setSelectedId(visibleClaims[0]?.id || claims[0].id) }}
              className={`px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
                defendantFilter === d
                  ? 'bg-brand-800 border-brand-600 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {d === 'all' ? 'All' : d}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-slate-700" />

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Threat:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map(t => (
            <button
              key={t}
              onClick={() => setThreatFilter(t)}
              className={`px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
                threatFilter === t
                  ? 'bg-brand-800 border-brand-600 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Body: sidebar + content */}
      <div className="flex gap-5">
        {/* Claim list sidebar */}
        <aside className="w-52 flex-shrink-0 ca-no-print">
          <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-700">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Claims</span>
            </div>
            <nav className="py-1">
              {(visibleClaims.length > 0 ? visibleClaims : claims).map((c, idx) => {
                const maxThreat = c.counters.reduce((max, counter) => {
                  const order = { critical: 4, high: 3, medium: 2, low: 1 }
                  return order[counter.threatLevel] > order[max] ? counter.threatLevel : max
                }, 'low')
                const t = THREAT[maxThreat]
                const isActive = selectedId === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`w-full text-left px-3 py-2.5 border-l-2 transition-colors ${
                      isActive
                        ? 'border-brand-500 bg-slate-800 text-white'
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-bold text-slate-500">Claim {idx + 1}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${t.badge}`}>{maxThreat}</span>
                    </div>
                    <div className="text-xs leading-snug line-clamp-2">{c.title}</div>
                  </button>
                )
              })}

              {/* Overarching defenses */}
              <button
                onClick={() => setSelectedId('overarching')}
                className={`w-full text-left px-3 py-2.5 border-l-2 border-t border-slate-700 mt-1 transition-colors ${
                  selectedId === 'overarching'
                    ? 'border-red-600 bg-slate-800 text-white'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-bold text-slate-500">Overarching</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${THREAT.critical.badge}`}>critical</span>
                </div>
                <div className="text-xs leading-snug">Overarching Defenses</div>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 bg-slate-900/50 rounded-lg border border-slate-700 p-5">
          {showOverarching
            ? <OverarchingDefenses defenses={overarchingDefenses} />
            : activeClaim
              ? <ClaimDetail claim={activeClaim} practiceMode={practiceMode} />
              : <p className="text-slate-500 text-sm">No claims match the current filters.</p>
          }
        </div>
      </div>

      {/* Print-only: render all claims + rebuttals */}
      <div className="hidden print:block mt-6">
        <h1 className="text-2xl font-bold mb-1">Counter Arguments — Lane v. Kayani &amp; Rosario</h1>
        <p className="text-sm text-slate-500 mb-6">All claims, counters, and rebuttals — attorney review copy</p>
        {claims.map((claim, ci) => (
          <div key={claim.id} className="mb-8 ca-counter-card">
            <h2 className="text-lg font-bold mb-1">Claim {ci + 1}: {claim.title}</h2>
            <p className="text-sm text-slate-500 mb-3">{claim.defendant} — Strength: {claim.ourStrength}</p>
            {claim.counters.map(c => (
              <div key={`${claim.id}-${c.rank}`} className="mb-4 pl-4 border-l-2 border-slate-300 ca-counter-card">
                <div className="font-semibold text-sm">[{c.rank === 'strongest' ? 'STRONGEST' : `#${c.rank}`}] {c.label}</div>
                <div className="text-xs text-slate-500 italic mb-1">{c.legalBasis} — Threat: {c.threatLevel}</div>
                <p className="text-sm mb-1">{c.summary}</p>
                <p className="text-sm text-green-800"><strong>Rebuttal:</strong> {c.ourRebuttal}</p>
              </div>
            ))}
          </div>
        ))}
        <div>
          <h2 className="text-lg font-bold mb-3">Overarching Defenses</h2>
          {overarchingDefenses.map(d => (
            <div key={d.id} className="mb-3 ca-counter-card">
              <div className="font-semibold text-sm">{d.label} — Threat: {d.threatLevel}</div>
              <p className="text-sm">{d.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
