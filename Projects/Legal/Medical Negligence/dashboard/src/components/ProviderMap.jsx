import { useState } from 'react'
import providersData from '../data/providers.json'

const STATUS_STYLES = {
  defendant:  { card: 'border-red-700 bg-red-950/30',   badge: 'bg-red-900/60 text-red-300 border border-red-700',    dot: 'bg-red-500', label: 'DEFENDANT' },
  supporting: { card: 'border-green-700 bg-green-950/20', badge: 'bg-green-900/60 text-green-300 border border-green-700', dot: 'bg-green-500', label: 'SUPPORTING' },
  neutral:    { card: 'border-slate-700 bg-slate-900/30', badge: 'bg-slate-800 text-slate-400 border border-slate-600',   dot: 'bg-slate-500', label: 'NEUTRAL' },
}

export default function ProviderMap() {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  const providers = providersData.providers.filter(p =>
    filter === 'all' || p.negligenceStatus === filter
  )

  const counts = {
    all:        providersData.providers.length,
    defendant:  providersData.providers.filter(p => p.negligenceStatus === 'defendant').length,
    supporting: providersData.providers.filter(p => p.negligenceStatus === 'supporting').length,
    neutral:    providersData.providers.filter(p => p.negligenceStatus === 'neutral').length,
  }

  const detail = selected ? providersData.providers.find(p => p.id === selected) : null

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Provider & Negligence Map</h1>
      <p className="text-slate-400 text-sm mb-4">All providers with their role and negligence status in this case.</p>

      {/* Legend + Filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(counts).map(([key, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
              filter === key
                ? key === 'defendant'  ? 'bg-red-800 border-red-600 text-red-200'
                : key === 'supporting' ? 'bg-green-800 border-green-600 text-green-200'
                : key === 'neutral'    ? 'bg-slate-700 border-slate-500 text-white'
                : 'bg-brand-700 border-brand-600 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {key.toUpperCase()} ({count})
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {providers.map(p => {
              const s = STATUS_STYLES[p.negligenceStatus]
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(selected === p.id ? null : p.id)}
                  className={`text-left border rounded-xl p-4 transition-all hover:brightness-125 ${s.card} ${selected === p.id ? 'ring-2 ring-brand-500' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-white text-sm">{p.name}{p.title ? `, ${p.title}` : ''}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{p.specialty}</div>
                      <div className="text-slate-500 text-xs">{p.organization}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold flex-shrink-0 ml-2 ${s.badge}`}>
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3">
                    <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <span className="text-slate-500 text-xs">{p.dateRange}</span>
                  </div>
                  {p.allegation && (
                    <div className="text-xs text-red-300/70 mt-2 line-clamp-2">{p.allegation}</div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Detail pane */}
        {detail && (
          <div className="w-80 flex-shrink-0 bg-slate-900 border border-slate-800 rounded-xl p-4 h-fit sticky top-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-bold text-white">{detail.name}</div>
                <div className="text-slate-400 text-xs">{detail.specialty}</div>
                <div className="text-slate-500 text-xs">{detail.organization}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-lg leading-none">×</button>
            </div>

            <div className={`text-xs px-2 py-1 rounded inline-block mb-3 ${STATUS_STYLES[detail.negligenceStatus].badge}`}>
              {STATUS_STYLES[detail.negligenceStatus].label}
            </div>

            <div className="text-slate-500 text-xs mb-1">Date Range</div>
            <div className="text-slate-300 text-sm mb-3">{detail.dateRange}</div>

            {detail.allegation && (
              <>
                <div className="text-slate-500 text-xs mb-1">Allegation</div>
                <div className="text-red-300 text-xs mb-3 bg-red-950/30 border border-red-900 rounded p-2">{detail.allegation}</div>
              </>
            )}

            <div className="text-slate-500 text-xs mb-2">Key Facts</div>
            <ul className="space-y-1.5">
              {detail.keyFacts.map((f, i) => (
                <li key={i} className="text-xs text-slate-300 flex gap-2">
                  <span className="text-slate-600 flex-shrink-0">•</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
