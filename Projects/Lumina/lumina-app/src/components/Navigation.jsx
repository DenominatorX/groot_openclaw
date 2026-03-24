import { useState } from 'react';
import { Home, BookOpen, Search, Settings, Library, ChevronLeft, Menu, X, BookMarked } from 'lucide-react';

export default function Navigation({ view, onNavigate, title, onBack, canBack, user }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'library', icon: Library, label: 'Library' },
    { id: 'shelf', icon: BookMarked, label: 'My Shelf' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        {canBack ? (
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors">
            <ChevronLeft size={20} />
          </button>
        ) : null}

        <div className="flex-1 min-w-0">
          {title ? (
            <h1 className="text-base font-sans font-medium text-zinc-100 truncate">{title}</h1>
          ) : (
            <span className="text-xl font-serif font-medium text-gold tracking-wide">Lumina</span>
          )}
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-sans transition-colors ${
                view === id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-zinc-950/95 pt-16 animate-fade-in">
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => { onNavigate(id); setMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-sans transition-colors ${
                  view === id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 flex">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${
              view === id ? 'text-gold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-sans">{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
