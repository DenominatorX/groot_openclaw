import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import { useAuth } from './hooks/useAuth'

export default function App() {
  const { user, loading, signIn, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: 'var(--gold-border)', borderTopColor: 'var(--gold)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onAuth={signIn} />
  }

  return <Dashboard user={user} onSignOut={signOut} />
}
