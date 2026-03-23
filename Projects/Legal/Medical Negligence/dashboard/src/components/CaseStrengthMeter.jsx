import { useEffect, useState } from 'react'

const DIMENSIONS = [
  {
    id: 'causation',
    label: 'Causation',
    icon: '🔗',
    scores: { kayani: 88, rosario: 76 },
    kayaniRationale: 'Direct causal chain: failure to disclose rhabdo history → RFA performed without precautions → catastrophic second event. Clear but-for causation.',
    rosarioRationale: '48-day PA delay → no diagnosis during RIF notice → inability to document medical accommodation. Clear but-for causation for employment damages.',
  },
  {
    id: 'evidence',
    label: 'Evidence Quality',
    icon: '📋',
    scores: { kayani: 90, rosario: 82 },
    kayaniRationale: 'Lab records, visit notes, omission of CK from 44-lab and 82-lab panels, no referral documentation. Strong documentary evidence.',
    rosarioRationale: 'Voicemails, fax records, 48-day gap between order and PA submission, Fla. Stat. §627.42392 violation timeline. Well-documented.',
  },
  {
    id: 'damages',
    label: 'Documented Damages',
    icon: '💰',
    scores: { kayani: 82, rosario: 68 },
    kayaniRationale: 'Two hospitalizations, permanent metabolic injury, CK>22K, confirmed genetic vulnerability. Medical expenses, lost wages, FERS impact.',
    rosarioRationale: 'RIF notice during delay period, Invitae results confirming diagnosis that was delayed 48 days. Employment damages harder to directly quantify.',
  },
  {
    id: 'standard_of_care',
    label: 'Standard of Care Violation',
    icon: '⚕️',
    scores: { kayani: 92, rosario: 78 },
    kayaniRationale: 'CK monitoring for patients with prior rhabdo is well-documented standard of care. Expert literature supports. 15-year pattern of omission.',
    rosarioRationale: 'Fla. Stat. §627.42392 sets explicit timeliness standards. 48 days vs required 14 days is a clear statutory violation.',
  },
  {
    id: 'expert_support',
    label: 'Expert Support',
    icon: '🔬',
    scores: { kayani: 75, rosario: 70 },
    kayaniRationale: 'Need metabolic medicine / mitochondrial disease expert. Mayo Clinic results pending — will strengthen. Currently 3 supporting providers documented.',
    rosarioRationale: 'Need neurology expert on PA timeliness. Statutory violation is clear but expert needed to opine on standard of care impact.',
  },
  {
    id: 'genetic_proof',
    label: 'Genetic / Scientific Proof',
    icon: '🧬',
    scores: { kayani: 88, rosario: 60 },
    kayaniRationale: 'AGK + AMPD1 variants confirmed by Invitae. Proves underlying vulnerability that Dr. Kayani should have screened for. Mayo pending for confirmation.',
    rosarioRationale: 'Genetic testing proves diagnosis that was delayed — but more attenuated connection to Rosario\'s specific negligence.',
  },
]

function Arc({ score, size = 120, strokeWidth = 10, color }) {
  const [displayScore, setDisplayScore] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setDisplayScore(score), 200)
    return () => clearTimeout(t)
  }, [score])

  const r = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = Math.PI * r  // half arc
  const filled = (displayScore / 100) * circumference
  const startAngle = 180
  const endAngle = 0

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 10 }}>
      <svg width={size} height={size / 2 + strokeWidth / 2} viewBox={`0 0 ${size} ${size / 2 + strokeWidth / 2}`}>
        {/* Background arc */}
        <path
          d={`M ${strokeWidth/2} ${cx} A ${r} ${r} 0 0 1 ${size - strokeWidth/2} ${cx}`}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={`M ${strokeWidth/2} ${cx} A ${r} ${r} 0 0 1 ${size - strokeWidth/2} ${cx}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${(displayScore / 100) * circumference} ${circumference}`}
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <div className="mono font-bold text-lg leading-none" style={{ color }}>{displayScore}</div>
        <div className="text-slate-500 text-xs">/ 100</div>
      </div>
    </div>
  )
}

function ScoreLabel(score) {
  if (score >= 85) return { label: 'Strong', color: '#22c55e' }
  if (score >= 70) return { label: 'Good', color: '#84cc16' }
  if (score >= 55) return { label: 'Moderate', color: '#f59e0b' }
  return { label: 'Developing', color: '#f97316' }
}

export default function CaseStrengthMeter() {
  const [selected, setSelected] = useState(null)

  const kayaniTotal = Math.round(DIMENSIONS.reduce((s, d) => s + d.scores.kayani, 0) / DIMENSIONS.length)
  const rosarioTotal = Math.round(DIMENSIONS.reduce((s, d) => s + d.scores.rosario, 0) / DIMENSIONS.length)

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-1">Case Strength Meter</h1>
      <p className="text-slate-400 text-sm mb-6">Legal scorecard across key dimensions. Scores reflect current evidence strength — will improve with Mayo results and expert retention.</p>

      {/* Overall scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[
          { id: 'kayani', name: 'Dr. Kayani / FMC', subtitle: 'Failure to monitor + failure to disclose', score: kayaniTotal, color: '#ef4444' },
          { id: 'rosario', name: 'Dr. Rosario / BayCare', subtitle: '48-day PA delay (Fla. Stat. §627.42392)', score: rosarioTotal, color: '#f97316' },
        ].map(d => {
          const lbl = ScoreLabel(d.score)
          return (
            <div key={d.id} className="card-red p-5 rounded-xl flex flex-col items-center text-center">
              <div className="text-white font-bold text-lg mb-0.5">{d.name}</div>
              <div className="text-slate-400 text-xs mb-4">{d.subtitle}</div>
              <Arc score={d.score} size={140} strokeWidth={12} color={d.color} />
              <div className="mt-3">
                <span className="mono font-bold text-2xl" style={{ color: d.color }}>{d.score}</span>
                <span className="text-slate-400 text-sm ml-1">/ 100 overall</span>
              </div>
              <div className="mt-1">
                <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ color: lbl.color, background: `${lbl.color}20`, border: `1px solid ${lbl.color}40` }}>
                  {lbl.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Per-dimension breakdown */}
      <h2 className="text-lg font-semibold text-white mb-4">Dimension-by-Dimension Breakdown</h2>
      <div className="space-y-3">
        {DIMENSIONS.map(dim => {
          const isOpen = selected === dim.id
          return (
            <div key={dim.id} className="card rounded-xl overflow-hidden">
              <button
                onClick={() => setSelected(isOpen ? null : dim.id)}
                className="w-full p-4 text-left hover:bg-slate-700/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{dim.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm">{dim.label}</div>
                  </div>
                  {/* Score bars */}
                  <div className="flex gap-6 flex-shrink-0">
                    {[
                      { name: 'Kayani', score: dim.scores.kayani, color: '#ef4444' },
                      { name: 'Rosario', score: dim.scores.rosario, color: '#f97316' },
                    ].map(s => {
                      const lbl = ScoreLabel(s.score)
                      return (
                        <div key={s.name} className="text-center w-20">
                          <div className="text-slate-500 text-xs mb-1">{s.name}</div>
                          <div className="h-1.5 rounded-full bg-slate-700 mb-1">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{ width: `${s.score}%`, background: s.color }}
                            />
                          </div>
                          <div className="mono text-xs font-bold" style={{ color: s.color }}>{s.score}</div>
                        </div>
                      )
                    })}
                  </div>
                  <span className="text-slate-600 text-sm ml-2">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3 animate-slide-up">
                  <div className="bg-red-950/20 border border-red-900/40 rounded-lg p-3">
                    <div className="text-red-300 text-xs font-semibold mb-1">Dr. Kayani / FMC — Score: {dim.scores.kayani}/100</div>
                    <div className="text-slate-300 text-xs leading-relaxed">{dim.kayaniRationale}</div>
                  </div>
                  <div className="bg-orange-950/20 border border-orange-900/40 rounded-lg p-3">
                    <div className="text-orange-300 text-xs font-semibold mb-1">Dr. Rosario / BayCare — Score: {dim.scores.rosario}/100</div>
                    <div className="text-slate-300 text-xs leading-relaxed">{dim.rosarioRationale}</div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 text-xs text-slate-500 bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <strong className="text-slate-400">Scoring methodology:</strong> Scores are estimates based on current documented evidence. Ratings will increase upon: (1) Mayo Clinic genetic confirmation, (2) expert witness retention, (3) full medical records acquisition, (4) counsel engagement. Not a prediction of outcome — consult licensed Florida medical malpractice counsel.
      </div>
    </div>
  )
}
