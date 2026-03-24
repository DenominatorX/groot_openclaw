import { BookOpen, GitBranch, Bell, User, LogOut, ChevronRight } from 'lucide-react'
import AppCard from './AppCard'

const APPS = [
  {
    id: 'lumina',
    name: 'Lumina',
    description: 'Sacred texts explorer with AI-powered insights, cross-references, and deep study tools.',
    icon: BookOpen,
    color: '#d4af37',
    badge: 'Active',
    path: '/lumina',
  },
  {
    id: 'nexus',
    name: 'LuminaNexus',
    description: 'Biblical genealogy and lineage explorer. Map family trees across scripture.',
    icon: GitBranch,
    color: '#7c9ef0',
    badge: 'Active',
    path: '/nexus',
  },
]

export default function Dashboard({ user, onSignOut }) {
  function handleLaunch(app) {
    window.location.href = app.path
  }

  const displayName = user?.email?.split('@')[0] || 'User'
  const tier = user?.subscription_tier || 'free'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 sm:px-6"
        style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--gold)', fontFamily: 'Georgia, serif' }}>X</span>
          </div>
          <span className="font-bold text-base" style={{ color: 'var(--gold)', fontFamily: 'Georgia, serif' }}>
            DenominatorX
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications placeholder */}
          <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Bell size={16} />
          </button>

          {/* Sign out */}
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-6 sm:px-6 max-w-4xl mx-auto w-full">
        {/* Profile banner */}
        <div className="rounded-2xl p-5 mb-6 flex items-center justify-between"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-border)' }}>
              <User size={20} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                {displayName}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {user?.email}
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold capitalize"
            style={{
              background: tier === 'pro' ? 'var(--gold-dim)' : 'rgba(255,255,255,0.05)',
              color: tier === 'pro' ? 'var(--gold)' : 'var(--text-muted)',
              border: tier === 'pro' ? '1px solid var(--gold-border)' : '1px solid var(--border)',
            }}>
            {tier}
          </span>
        </div>

        {/* Announcements */}
        <div className="rounded-2xl px-5 py-4 mb-6 flex items-center gap-3"
          style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-border)' }}>
          <Bell size={15} style={{ color: 'var(--gold)', flexShrink: 0 }} />
          <p className="text-sm" style={{ color: 'var(--gold)' }}>
            Welcome to DenominatorX private beta. More apps coming soon.
          </p>
          <ChevronRight size={14} style={{ color: 'var(--gold)', marginLeft: 'auto', flexShrink: 0 }} />
        </div>

        {/* Apps section */}
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: 'var(--text-muted)' }}>
            Your Apps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {APPS.map(app => (
              <AppCard key={app.id} app={app} onLaunch={handleLaunch} />
            ))}
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden sticky bottom-0 flex items-center justify-around px-2 py-3"
        style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        <button className="flex flex-col items-center gap-1" style={{ color: 'var(--gold)' }}>
          <BookOpen size={20} />
          <span className="text-xs">Apps</span>
        </button>
        <button className="flex flex-col items-center gap-1" style={{ color: 'var(--text-muted)' }}>
          <Bell size={20} />
          <span className="text-xs">Updates</span>
        </button>
        <button className="flex flex-col items-center gap-1" onClick={onSignOut} style={{ color: 'var(--text-muted)' }}>
          <LogOut size={20} />
          <span className="text-xs">Sign out</span>
        </button>
      </nav>
    </div>
  )
}
