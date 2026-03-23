import { useState } from 'react'
import timelineData from '../data/timeline.json'

const SIGNIFICANCE_COLORS = {
  critical:  'border-l-red-500 bg-red-950/20',
  high:      'border-l-orange-500 bg-orange-950/20',
  medium:    'border-l-yellow-500 bg-yellow-950/20',
  low:       'border-l-slate-600 bg-slate-900/20',
  milestone: 'border-l-brand-500 bg-brand-950/20',
}
const SIGNIFICANCE_BADGE = {
  critical:  'bg-red-900/60 text-red-300 border-red-700',
  high:      'bg-orange-900/60 text-orange-300 border-orange-700',
  medium:    'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  low:       'bg-slate-800 text-slate-500 border-slate-700',
  milestone: 'bg-blue-900/60 text-blue-300 border-blue-700',
}
const EVENT_TYPE_COLORS = {
  visit:          'text-slate-400',
  lab:            'text-cyan-400',
  procedure:      'text-purple-400',
  hospitalization:'text-red-400',
  legal:          'text-yellow-400',
  communication:  'text-green-400',
  milestone:      'text-blue-400',
}

const ALL_TYPES = ['all', 'visit', 'lab', 'procedure', 'hospitalization', 'legal', 'communication', 'milestone']
const ALL_SIG   = ['all', 'critical', 'high', 'medium', 'low']

export default function MedicalTimeline() {
  const [typeFilter, setTypeFilter]  = useState('all')
  const [sigFilter, setSigFilter]    = useState('all')
  const [search, setSearch]          = useState('')
  const [expanded, setExpanded]      = useState(new Set())

  const events = timelineData.events.filter(e => {
    if (typeFilter !== 'all' && e.eventType !== typeFilter) return false
    if (sigFilter !== 'all' && e.legalSignificance !== sigFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (e.title + e.summary + (e.provider || '') + (e.organization || '')).toLowerCase().includes(q)
    }
    return true
  })

  const toggleExpand = (id) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Medical Timeline</h1>
      <p className="text-slate-400 text-sm mb-4">Chronological case events from 2010 → present. Click any event to expand details.</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search events…"
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
        />
        <div className="flex gap-1">
          {ALL_TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${typeFilter === t ? 'bg-brand-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >{t}</button>
          ))}
        </div>
        <div className="flex gap-1">
          {ALL_SIG.map(s => (
            <button key={s} onClick={() => setSigFilter(s)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${sigFilter === s ? 'bg-brand-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >{s}</button>
          ))}
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-3">{events.length} events shown</div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-24 top-0 bottom-0 w-px bg-slate-800" />
        <div className="space-y-2">
          {events.map(e => {
            const sig = e.legalSignificance || 'low'
            const isExpanded = expanded.has(e.id)
            return (
              <div key={e.id} className="flex gap-4 cursor-pointer group" onClick={() => toggleExpand(e.id)}>
                {/* Date */}
                <div className="w-20 flex-shrink-0 text-right">
                  <div className="text-slate-500 text-xs font-mono leading-tight pt-2">
                    {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-slate-600 text-xs font-mono">
                    {new Date(e.date).getFullYear()}
                  </div>
                </div>

                {/* Dot */}
                <div className="relative flex-shrink-0 flex items-start pt-2.5">
                  <div className={`w-3 h-3 rounded-full border-2 z-10 ${
                    sig === 'critical' ? 'bg-red-500 border-red-400' :
                    sig === 'high'     ? 'bg-orange-500 border-orange-400' :
                    sig === 'medium'   ? 'bg-yellow-500 border-yellow-400' :
                    sig === 'milestone'? 'bg-blue-500 border-blue-400' :
                    'bg-slate-700 border-slate-600'
                  }`} />
                </div>

                {/* Card */}
                <div className={`flex-1 border-l-4 rounded-r-lg px-3 py-2 mb-0.5 transition-all ${SIGNIFICANCE_COLORS[sig] || SIGNIFICANCE_COLORS.low} group-hover:brightness-125`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-white leading-tight">{e.title}</div>
                      <div className="text-xs mt-0.5 text-slate-400">
                        <span className={EVENT_TYPE_COLORS[e.eventType]}>{e.eventType}</span>
                        {e.provider && <span className="text-slate-500"> · {e.provider}</span>}
                        {e.organization && <span className="text-slate-600"> / {e.organization}</span>}
                      </div>
                      <div className={`text-xs mt-1 text-slate-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {e.summary}
                      </div>
                      {isExpanded && e.details && (
                        <div className="mt-2 text-xs text-slate-400 bg-slate-900/50 rounded p-2 border border-slate-700">
                          {e.details}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded border uppercase font-medium ${SIGNIFICANCE_BADGE[sig] || SIGNIFICANCE_BADGE.low}`}>
                        {sig}
                      </span>
                      {e.details && (
                        <span className="text-slate-600 text-xs">{isExpanded ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
