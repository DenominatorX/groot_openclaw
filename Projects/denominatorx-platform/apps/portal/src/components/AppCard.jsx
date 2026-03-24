import { ExternalLink } from 'lucide-react'

export default function AppCard({ app, onLaunch }) {
  const Icon = app.icon

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: app.color + '18', border: `1px solid ${app.color}30` }}>
          <Icon size={22} style={{ color: app.color }} />
        </div>
        {app.badge && (
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold-border)' }}>
            {app.badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div>
        <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text)', fontFamily: 'Georgia, serif' }}>
          {app.name}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {app.description}
        </p>
      </div>

      {/* Launch */}
      <button
        onClick={() => onLaunch(app)}
        className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{
          background: app.color + '18',
          color: app.color,
          border: `1px solid ${app.color}30`,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = app.color + '28'
          e.currentTarget.style.borderColor = app.color + '50'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = app.color + '18'
          e.currentTarget.style.borderColor = app.color + '30'
        }}
      >
        <ExternalLink size={14} />
        Launch {app.name}
      </button>
    </div>
  )
}
