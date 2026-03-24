import { BookOpen, BookMarked, Search, Clock } from 'lucide-react';
import { INITIAL_LIBRARY, BADGES } from '../../utils/constants';

export default function HomeView({ onNavigate, history, readCount, currentBadge, library }) {
  const lastRead = history[0];
  const lastBook = lastRead ? INITIAL_LIBRARY.find(b => b.id === lastRead.bookId) : null;

  const nextBadge = BADGES.find(b => b.requirement > readCount);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8 animate-fade-in pb-20 md:pb-6">
      {/* Welcome */}
      <div className="text-center space-y-2 pt-4">
        <h1 className="font-serif text-4xl text-gold font-medium">Lumina</h1>
        <p className="font-sans text-zinc-400 text-sm">Sacred Texts & AI Study</p>
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 mt-2">
          <span className="text-gold text-xs font-sans font-medium">{currentBadge.title}</span>
          <span className="text-zinc-500 text-xs font-sans">·</span>
          <span className="text-zinc-400 text-xs font-sans">{readCount} chapter{readCount !== 1 ? 's' : ''} read</span>
        </div>
      </div>

      {/* Continue Reading */}
      {lastBook && (
        <section>
          <h2 className="font-sans text-xs text-zinc-500 uppercase tracking-wider mb-3">Continue Reading</h2>
          <button
            onClick={() => onNavigate('reader', { bookId: lastRead.bookId, chapter: lastRead.chapter })}
            className="w-full card p-4 flex items-center gap-4 hover:border-zinc-600 transition-colors text-left"
          >
            <div className="w-12 h-16 bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen size={20} className="text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-serif text-lg text-zinc-100">{lastBook.title}</div>
              <div className="font-sans text-sm text-zinc-400">Chapter {lastRead.chapter}</div>
            </div>
            <div className="text-zinc-600">›</div>
          </button>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="font-sans text-xs text-zinc-500 uppercase tracking-wider mb-3">Explore</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('library')}
            className="card p-4 flex flex-col items-center gap-2 hover:border-zinc-600 transition-colors"
          >
            <BookMarked size={22} className="text-gold" />
            <span className="font-sans text-sm text-zinc-200">Library</span>
            <span className="font-sans text-xs text-zinc-500">100+ sacred texts</span>
          </button>
          <button
            onClick={() => onNavigate('shelf')}
            className="card p-4 flex flex-col items-center gap-2 hover:border-zinc-600 transition-colors"
          >
            <BookOpen size={22} className="text-gold" />
            <span className="font-sans text-sm text-zinc-200">My Shelf</span>
            <span className="font-sans text-xs text-zinc-500">{library.length} book{library.length !== 1 ? 's' : ''} acquired</span>
          </button>
        </div>
        <button
          onClick={() => onNavigate('search')}
          className="mt-3 w-full card p-3 flex items-center gap-3 hover:border-zinc-600 transition-colors"
        >
          <Search size={18} className="text-zinc-400" />
          <span className="font-sans text-sm text-zinc-400">Search sacred texts...</span>
        </button>
      </section>

      {/* Recent History */}
      {history.length > 1 && (
        <section>
          <h2 className="font-sans text-xs text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock size={12} /> Recently Viewed
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {history.slice(0, 10).map((h, i) => {
              const book = INITIAL_LIBRARY.find(b => b.id === h.bookId);
              if (!book) return null;
              return (
                <button
                  key={i}
                  onClick={() => onNavigate('reader', { bookId: h.bookId, chapter: h.chapter })}
                  className="flex-shrink-0 w-24 card p-3 flex flex-col items-center gap-1.5 hover:border-zinc-600 transition-colors"
                >
                  <div className="w-8 h-10 bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 rounded flex items-center justify-center">
                    <BookOpen size={14} className="text-gold" />
                  </div>
                  <span className="font-sans text-xs text-zinc-300 text-center leading-tight line-clamp-2">{book.title}</span>
                  <span className="font-sans text-[10px] text-zinc-500">Ch. {h.chapter}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Progress toward next badge */}
      {nextBadge && (
        <section className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-xs text-zinc-400">Progress to <span className="text-gold">{nextBadge.title}</span></span>
            <span className="font-sans text-xs text-zinc-500">{readCount}/{nextBadge.requirement}</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all"
              style={{ width: `${Math.min(100, (readCount / nextBadge.requirement) * 100)}%` }}
            />
          </div>
        </section>
      )}
    </div>
  );
}
