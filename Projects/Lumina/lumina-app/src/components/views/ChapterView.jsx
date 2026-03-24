import { INITIAL_LIBRARY } from '../../utils/constants';
import { CheckCircle2, Circle, BookOpen, Plus } from 'lucide-react';

export default function ChapterView({ bookId, onNavigate, isChapterRead, isInLibrary, addToLibrary, settings }) {
  const book = INITIAL_LIBRARY.find(b => b.id === bookId);
  if (!book) return null;

  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
  const inLibrary = isInLibrary(bookId);
  const isPremium = settings?.subscription === 'premium';

  const handleAcquire = async () => {
    const ok = await addToLibrary(bookId);
    if (!ok) {
      // Free tier limit hit — could open swap modal
      alert('Upgrade to Premium to add more books, or swap your current book.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6 animate-fade-in">
      {/* Book header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-18 bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen size={22} className="text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-2xl text-zinc-100 leading-tight">{book.title}</h1>
          <p className="font-sans text-sm text-zinc-500 mt-1">{book.chapters} chapters</p>
          {!inLibrary && (
            <button onClick={handleAcquire} className="mt-3 btn-gold text-sm flex items-center gap-1.5">
              <Plus size={14} />
              Add to Shelf
            </button>
          )}
        </div>
      </div>

      {/* Chapter grid */}
      <h2 className="font-sans text-xs text-zinc-500 uppercase tracking-wider mb-3">Chapters</h2>
      <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
        {chapters.map(ch => {
          const read = isChapterRead(bookId, ch);
          return (
            <button
              key={ch}
              onClick={() => onNavigate('reader', { bookId, chapter: ch })}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-sans transition-colors ${
                read
                  ? 'bg-gold/20 border border-gold/30 text-gold'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600'
              }`}
            >
              <span>{ch}</span>
              {read && <CheckCircle2 size={10} className="text-gold mt-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Read progress */}
      {book.chapters > 0 && (() => {
        const readCount = chapters.filter(ch => isChapterRead(bookId, ch)).length;
        const pct = Math.round((readCount / book.chapters) * 100);
        return (
          <div className="mt-6 card p-4">
            <div className="flex justify-between font-sans text-xs text-zinc-500 mb-2">
              <span>{readCount} of {book.chapters} chapters read</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })()}
    </div>
  );
}
