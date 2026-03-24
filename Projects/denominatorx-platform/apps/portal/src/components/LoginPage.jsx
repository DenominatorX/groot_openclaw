import { useState } from 'react'
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'
import { login, register } from '../api/auth'

export default function LoginPage({ onAuth }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fn = mode === 'login' ? login : register
      const data = await fn(email.trim().toLowerCase(), password)
      onAuth(data.token, data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}>
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-border)' }}>
          <span className="text-3xl font-bold" style={{ color: 'var(--gold)', fontFamily: 'Georgia, serif' }}>X</span>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)', fontFamily: 'Georgia, serif' }}>
          DenominatorX
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your personal platform</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {/* Mode toggle */}
        <div className="flex rounded-lg overflow-hidden mb-6"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              className="flex-1 py-2 text-sm font-semibold transition-colors"
              style={{
                background: mode === m ? 'var(--gold-dim)' : 'transparent',
                color: mode === m ? 'var(--gold)' : 'var(--text-muted)',
                borderRight: m === 'login' ? '1px solid var(--border)' : 'none',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--gold-border)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors pr-10"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--gold-border)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5"
                style={{ color: 'var(--text-muted)' }}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg px-3 py-2.5 text-sm"
              style={{ background: 'var(--error-dim)', color: 'var(--error)', border: '1px solid rgba(232,85,85,0.2)' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-opacity"
            style={{
              background: 'var(--gold)',
              color: '#0f1117',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {mode === 'login'
              ? <><LogIn size={15} /> {loading ? 'Signing in…' : 'Sign In'}</>
              : <><UserPlus size={15} /> {loading ? 'Creating…' : 'Create Account'}</>
            }
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
        DenominatorX · Private Beta
      </p>
    </div>
  )
}
