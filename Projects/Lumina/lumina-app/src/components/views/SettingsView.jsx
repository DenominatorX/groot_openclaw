import { LogIn, LogOut, User, Moon, Sun, Monitor, Crown } from 'lucide-react';
import { BADGES } from '../../utils/constants';

export default function SettingsView({ user, signInGoogle, signInGuest, logOut, settings, updateSettings, readCount, currentBadge }) {
  const themes = [
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'grey', label: 'Grey', icon: Monitor },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6 animate-fade-in space-y-6">
      <h1 className="font-serif text-2xl text-zinc-100">Settings</h1>

      {/* Profile */}
      <section className="card p-4 space-y-3">
        <h2 className="font-sans text-xs text-zinc-500 uppercase tracking-wider">Account</h2>
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full" />
                ) : (
                  <User size={16} className="text-zinc-400" />
                )}
              </div>
              <div>
                <div className="font-sans text-sm text-zinc-200">{user.displayName || (user.isAnonymous ? 'Guest' : user.email)}</div>
                <div className="font-sans text-xs text-zinc-500">{user.isAnonymous ? 'Anonymous' : user.email}</div>
              </div>
            </div>
            <button onClick={logOut} className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-xs font-sans">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={signInGoogle}
              className="w-full flex items-center justify-center gap-2 bg-white text-zinc-900 hover:bg-zinc-100 py-2.5 rounded-lg font-sans text-sm font-medium transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <button
              onClick={signInGuest}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-700 py-2.5 rounded-lg font-sans text-sm transition-colors"
            >
              <User size={14} /> Continue as Guest
            </button>
          </div>
        )}
      </section>

      {/* Theme */}
      <section className="card p-4 space-y-3">
        <h2 className="font-sans text-xs text-zinc-500 uppercase tracking-wider">Appearance</h2>
        <div className="flex gap-2">
          {themes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => updateSettings({ theme: id })}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs font-sans transition-colors ${
                settings?.theme === id
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Subscription */}
      <section className="card p-4 space-y-3">
        <h2 className="font-sans text-xs text-zinc-500 uppercase tracking-wider">Subscription</h2>
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          settings?.subscription === 'premium' ? 'bg-gold/10 border border-gold/20' : 'bg-zinc-800'
        }`}>
          <Crown size={18} className={settings?.subscription === 'premium' ? 'text-gold' : 'text-zinc-500'} />
          <div>
            <div className="font-sans text-sm text-zinc-200 font-medium">
              {settings?.subscription === 'premium' ? 'Premium' : 'Free'}
            </div>
            <div className="font-sans text-xs text-zinc-500">
              {settings?.subscription === 'premium' ? 'Unlimited books & AI analysis' : '1 active book · Basic reading'}
            </div>
          </div>
          {settings?.subscription !== 'premium' && (
            <button className="ml-auto btn-gold text-xs py-1.5">Upgrade</button>
          )}
        </div>
      </section>

      {/* Badges */}
      <section className="card p-4 space-y-3">
        <h2 className="font-sans text-xs text-zinc-500 uppercase tracking-wider">Your Journey</h2>
        <div className="space-y-2">
          {BADGES.map(badge => {
            const unlocked = readCount >= badge.requirement;
            return (
              <div key={badge.id} className={`flex items-center gap-3 p-2 rounded-lg ${unlocked ? '' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-sans font-bold ${
                  unlocked ? 'bg-gold text-zinc-950' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {badge.title[0]}
                </div>
                <div>
                  <div className={`font-sans text-sm font-medium ${unlocked ? 'text-zinc-100' : 'text-zinc-500'}`}>{badge.title}</div>
                  <div className="font-sans text-xs text-zinc-600">{badge.description}</div>
                </div>
                {badge.id === currentBadge?.id && (
                  <span className="ml-auto text-[10px] font-sans text-gold">Current</span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
