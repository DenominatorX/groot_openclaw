import { useState } from 'react'
import caseStatus from '../data/case-status.json'

function daysUntil(dateStr) {
  const target = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
}

function SOLCountdown({ deadline, startDate, label }) {
  const days = daysUntil(deadline)
  const totalDays = startDate ? Math.ceil((new Date(deadline) - new Date(startDate)) / (1000 * 60 * 60 * 24)) : 730
  const elapsed = totalDays - days
  const pctElapsed = Math.min(100, Math.max(0, (elapsed / totalDays) * 100))
  const pctRemaining = 100 - pctElapsed

  const color = days < 180 ? 'red' : days < 365 ? 'orange' : 'green'
  const colorMap = {
    red:    { ring: 'border-red-600',    text: 'text-red-300',    bg: 'bg-red-950/40',    bar: '#ef4444', track: '#7f1d1d40' },
    orange: { ring: 'border-orange-600', text: 'text-orange-300', bg: 'bg-orange-950/40', bar: '#f97316', track: '#7c2d1240' },
    green:  { ring: 'border-green-700',  text: 'text-green-300',  bg: 'bg-green-950/40',  bar: '#22c55e', track: '#14532d40' },
  }
  const c = colorMap[color]

  return (
    <div className={`rounded-2xl border ${c.ring} ${c.bg} p-5 flex flex-col items-center`}>
      <div className="text-slate-400 text-[10px] uppercase tracking-widest mb-2 font-semibold">{label}</div>
      <div className={`text-5xl font-black tabular-nums leading-none ${c.text}`}>{days.toLocaleString()}</div>
      <div className="text-slate-400 text-sm mt-1 mb-4">days remaining</div>

      {/* Progress bar */}
      <div className="w-full mb-3">
        <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: c.track }}>
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000"
            style={{ width: `${pctElapsed}%`, background: c.bar, opacity: 0.7 }}
          />
        </div>
        <div className="flex justify-between text-[10px] mt-1">
          <span className="text-slate-600">{pctElapsed.toFixed(0)}% elapsed</span>
          <span style={{ color: c.bar }}>{pctRemaining.toFixed(0)}% remaining</span>
        </div>
      </div>

      <div className="text-slate-500 text-xs">{new Date(deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
    </div>
  )
}

const priorityStyle = {
  critical: 'text-red-400 bg-red-900/30 border-red-800',
  high:     'text-orange-400 bg-orange-900/30 border-orange-800',
  medium:   'text-yellow-400 bg-yellow-900/30 border-yellow-800',
}

const statusIcon = { pending: '○', in_progress: '◐', done: '●' }

export default function LegalStatusPanel() {
  const [showDone, setShowDone] = useState(false)
  const { sol, preSuitNotice, counselEngagement, nextActions, keyLegalDates, defendants } = caseStatus

  const visibleActions = nextActions.filter(a => showDone || a.status !== 'done')

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Legal Status Panel</h1>
      <p className="text-slate-400 text-sm mb-6">SOL countdown, pre-suit requirements, and next actions.</p>

      {/* SOL Countdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SOLCountdown
          deadline={sol.primarySOLDeadline}
          startDate="2025-08-06"
          label="Primary SOL — Dr. Kayani"
        />
        <SOLCountdown
          deadline={sol.discoverySOLDeadline}
          startDate="2025-11-06"
          label="Discovery SOL — Dr. Rosario"
        />
        <SOLCountdown
          deadline={preSuitNotice.latestSendDate}
          startDate="2025-08-06"
          label="Pre-Suit Notice Deadline"
        />
      </div>

      {/* SOL Basis */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6 text-sm text-slate-300">
        <span className="text-slate-500">SOL Basis: </span>{sol.solBasis}
      </div>

      {/* Defendants */}
      <h2 className="text-lg font-semibold text-white mb-3">Defendants</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {defendants.map(d => (
          <div key={d.id} className="bg-red-950/30 border border-red-900 rounded-lg p-4">
            <div className="font-semibold text-red-300">{d.name}</div>
            <div className="text-slate-400 text-xs mt-1">{d.allegation}</div>
            <div className="text-slate-500 text-xs mt-2 font-mono">{d.statute}</div>
          </div>
        ))}
      </div>

      {/* Pre-Suit Notice */}
      <h2 className="text-lg font-semibold text-white mb-3">Pre-Suit Notice</h2>
      <div className="bg-orange-950/30 border border-orange-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-orange-300 font-medium">Status: {preSuitNotice.status.replace('_', ' ').toUpperCase()}</span>
          <span className="text-slate-400 text-sm">Required {preSuitNotice.requiredDaysBefore} days before filing</span>
        </div>
        <div className="text-slate-400 text-sm mt-2">{preSuitNotice.notes}</div>
        <div className="mt-2 text-sm">
          <span className="text-slate-500">Latest send date: </span>
          <span className="text-orange-300 font-medium">{new Date(preSuitNotice.latestSendDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Counsel Status */}
      <h2 className="text-lg font-semibold text-white mb-3">Counsel Engagement</h2>
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <div>
            <div className="text-white font-medium capitalize">{counselEngagement.status}</div>
            <div className="text-slate-400 text-sm">{counselEngagement.notes}</div>
            <div className="text-slate-500 text-xs mt-1">Target: {counselEngagement.targetCounselType}</div>
          </div>
        </div>
      </div>

      {/* Next Actions */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white">Next Actions</h2>
        <button
          onClick={() => setShowDone(!showDone)}
          className="text-xs text-slate-400 hover:text-white"
        >
          {showDone ? 'Hide completed' : 'Show completed'}
        </button>
      </div>
      <div className="space-y-2 mb-6">
        {visibleActions.map(a => (
          <div key={a.id} className={`rounded-lg border p-3 ${priorityStyle[a.priority] || 'text-slate-400 bg-slate-800 border-slate-700'}`}>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-lg">{statusIcon[a.status] || '○'}</span>
              <div className="flex-1">
                <div className="font-medium text-sm">{a.action}</div>
                {a.dueDate && (
                  <div className="text-xs mt-0.5 opacity-80">
                    Due: {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' '}({daysUntil(a.dueDate)} days)
                  </div>
                )}
                {a.notes && <div className="text-xs mt-1 opacity-70">{a.notes}</div>}
              </div>
              <span className="text-xs font-mono uppercase opacity-60 flex-shrink-0">{a.priority}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Key Legal Dates */}
      <h2 className="text-lg font-semibold text-white mb-3">Key Legal Dates</h2>
      <div className="space-y-1">
        {keyLegalDates.map((d, i) => (
          <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-slate-800">
            <span className="text-slate-500 w-28 flex-shrink-0 font-mono text-xs">
              {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className={d.type === 'critical' ? 'text-red-400' : d.type === 'deadline' ? 'text-orange-400' : 'text-slate-300'}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
