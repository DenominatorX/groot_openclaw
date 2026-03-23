import { useState } from 'react'
import damagesData from '../data/damages.json'

const COLOR_MAP = {
  pastLostWages:                { color: '#f97316', label: 'Past Lost Wages' },
  futureReducedEarningCapacity: { color: '#f59e0b', label: 'Future Earning Capacity' },
  fersDelta:                    { color: '#eab308', label: 'FERS Retirement Delta' },
  futureMedicalExpenses:        { color: '#a78bfa', label: 'Future Medical Expenses' },
  pastMedicalExpenses:          { color: '#7dd3fc', label: 'Past Medical Expenses' },
}

const NON_ECON_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16']

function formatUSD(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function Bar({ value, max, color }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

function SeverityDots({ scale }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full transition-colors"
          style={{
            background: i < scale
              ? scale >= 8 ? '#ef4444' : scale >= 6 ? '#f97316' : '#f59e0b'
              : '#334155'
          }}
        />
      ))}
      <span className="text-xs text-slate-400 ml-1">{scale}/10</span>
    </div>
  )
}

export default function DamagesCalculator() {
  const [view, setView] = useState('range')
  const { economicDamages, nonEconomicDamages, totalEstimates, caseCaption, plaintiff } = damagesData

  const econEntries = Object.entries(economicDamages)
  const maxHigh = Math.max(...econEntries.map(([, d]) => d.highEstimate))

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-1">Damages Calculator</h1>
      <div className="text-slate-400 text-xs mono mb-1">{caseCaption}</div>
      <p className="text-slate-400 text-sm mb-5">Economic and non-economic damages estimates. Low/high range reflects documentation status and litigation risk. Not a legal representation.</p>

      {/* Grand total hero */}
      <div className="card rounded-xl p-5 mb-6 border-slate-600">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-slate-400 text-xs mb-1 uppercase tracking-wide">Economic Low</div>
            <div className="mono font-bold text-3xl text-amber-400">{formatUSD(totalEstimates.economicLow)}</div>
          </div>
          <div className="border-x border-slate-700 flex flex-col justify-center">
            <div className="text-slate-400 text-xs mb-1 uppercase tracking-wide">Grand Total Range</div>
            <div className="mono font-bold text-xl text-white">{totalEstimates.intakeQuotedRange}</div>
            <div className="text-slate-500 text-xs mt-1">intake consultation estimate</div>
          </div>
          <div>
            <div className="text-slate-400 text-xs mb-1 uppercase tracking-wide">Economic High</div>
            <div className="mono font-bold text-3xl text-green-400">{formatUSD(totalEstimates.economicHigh)}</div>
          </div>
        </div>
      </div>

      {/* Economic damages */}
      <h2 className="text-lg font-semibold text-white mb-3">Economic Damages</h2>
      <div className="space-y-3 mb-6">
        {econEntries.map(([key, item]) => {
          const meta = COLOR_MAP[key] || { color: '#94a3b8', label: key }
          return (
            <div key={key} className="card rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="font-medium text-white text-sm">{item.label}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{item.description}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    {item.documented
                      ? <span className="text-xs text-green-400 bg-green-950/40 border border-green-800/40 px-1.5 py-0.5 rounded">Documented</span>
                      : <span className="text-xs text-amber-400 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">Estimated</span>
                    }
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="mono text-sm font-semibold" style={{ color: meta.color }}>
                  {formatUSD(item.lowEstimate)} – {formatUSD(item.highEstimate)}
                </span>
              </div>
              <Bar value={item.highEstimate} max={maxHigh} color={meta.color} />
              {item.notes && <div className="text-slate-500 text-xs mt-2">{item.notes}</div>}
            </div>
          )
        })}
      </div>

      {/* Totals row */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4 text-center">
          <div className="text-amber-300 text-xs uppercase tracking-wide mb-1">Economic Damages</div>
          <div className="mono font-bold text-xl text-amber-400">
            {formatUSD(totalEstimates.economicLow)} – {formatUSD(totalEstimates.economicHigh)}
          </div>
        </div>
        <div className="bg-purple-950/20 border border-purple-900/40 rounded-xl p-4 text-center">
          <div className="text-purple-300 text-xs uppercase tracking-wide mb-1">Non-Economic Damages</div>
          <div className="mono font-bold text-xl text-purple-400">
            {formatUSD(totalEstimates.nonEconomicLow)} – {formatUSD(totalEstimates.nonEconomicHigh)}
          </div>
        </div>
      </div>

      {/* Non-economic damages */}
      <h2 className="text-lg font-semibold text-white mb-3">Non-Economic Damages</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {Object.entries(nonEconomicDamages).map(([key, item], i) => (
          <div key={key} className="card rounded-xl p-4">
            <div className="font-medium text-white text-sm mb-1">{item.label}</div>
            <div className="text-slate-400 text-xs mb-3">{item.description}</div>
            <SeverityDots scale={item.severityScale} />
            {item.notes && <div className="text-slate-500 text-xs mt-2">{item.notes}</div>}
          </div>
        ))}
      </div>

      {/* Defendants breakdown note */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-xs text-slate-400">
        <div className="font-semibold text-slate-300 mb-2">Defendant Apportionment (estimated)</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-red-300 font-medium mb-1">Dr. Kayani / FMC (~75%)</div>
            <div>Primary negligence — failure to monitor, failure to disclose. Directly caused catastrophic Aug 2025 event. Responsible for bulk of physical injury, hospitalization, and FERS/wage damages.</div>
          </div>
          <div>
            <div className="text-orange-300 font-medium mb-1">Dr. Rosario / BayCare (~25%)</div>
            <div>Secondary negligence — 48-day PA delay. Primarily responsible for employment-related damages attributable to diagnostic delay during RIF notice period.</div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-600 italic">
        Estimates as of {new Date(damagesData.asOfDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Figures are estimates for planning purposes only. Final damages to be determined by retained legal and economic experts.
      </div>
    </div>
  )
}
