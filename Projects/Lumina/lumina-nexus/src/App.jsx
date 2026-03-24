import { useState } from 'react';
import { GitBranch, Settings, LayoutList, LogIn, LogOut, User } from 'lucide-react';
import LineageExplorer from './components/LineageExplorer';
import ConfigPanel from './components/ConfigPanel';
import BacklogPanel from './components/BacklogPanel';
import { useAuth } from './hooks/useAuth';
import { signInWithGoogle, signInAnon, signOut } from './firebase/auth';
import { isFirebaseReady } from './firebase/config';

const TABS = [
  { id: 'lineage',  label: 'Lineage',  icon: GitBranch },
  { id: 'backlog',  label: 'Backlog',  icon: LayoutList },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('lineage');
  const [firebaseReady, setFirebaseReady] = useState(isFirebaseReady());
  const { user, loading, ensureAuth } = useAuth();

  function handleFirebaseReady() {
    setFirebaseReady(true);
  }

  async function handleAuth() {
    try {
      await signInWithGoogle();
    } catch {
      try { await signInAnon(); } catch {}
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* NavBar */}
      <header
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', position: 'sticky', top: 0, zIndex: 50 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold)' + '20' }}>
            <GitBranch size={14} style={{ color: 'var(--gold)' }} />
          </div>
          <span className="font-display text-lg font-bold" style={{ color: 'var(--gold)' }}>
            LuminaNexus
          </span>
          <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Biblical Lineage
          </span>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{
                  background: activeTab === tab.id ? 'var(--gold)' + '20' : 'transparent',
                  color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {firebaseReady && !loading && (
            user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                  <User size={12} />
                  <span className="hidden sm:inline">
                    {user.isAnonymous ? 'Anonymous' : (user.displayName || user.email || 'User')}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors hover:bg-white/5"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
                >
                  <LogOut size={12} /> <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', border: '1px solid var(--border)' }}
              >
                <LogIn size={13} /> Sign in
              </button>
            )
          )}
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1 }}>
        {activeTab === 'lineage' && (
          <LineageExplorer
            isFirebaseReady={firebaseReady && !!user}
            ensureAuth={ensureAuth}
          />
        )}
        {activeTab === 'backlog' && (
          <BacklogPanel
            isFirebaseReady={firebaseReady}
            user={user}
            ensureAuth={ensureAuth}
          />
        )}
        {activeTab === 'settings' && (
          <ConfigPanel onFirebaseReady={handleFirebaseReady} />
        )}
      </main>
    </div>
  );
}
