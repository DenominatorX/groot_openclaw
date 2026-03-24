import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { INITIAL_LIBRARY } from '../../utils/constants';

export default function ShelfView({ library, onNavigate, removeFromLibrary, settings }) {
  const isPremium = settings?.subscription === 'premium';
  const shelfBooks = library.map(l => INITIAL_LIBRARY.find(b => b.id === l.id || b.id === l.bookId)).filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-serif text-2xl text-zinc-100">My Shelf</h1>
        {!isPremium && (
          <span className="font-sans text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-full px-2.5 py-1">
            {library.length}/1 Free
          </span>
        )}
      </div>
      <p className="font-sans text-sm text-zinc-500 mb-6">Your acquired texts</p>

      {shelfBooks.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <BookOpen size={40} className="text-zinc-700 mx-auto" />
          <p className="font-serif text-xl text-zinc-500">Your shelf is empty</p>
          <p className="font-sans text-sm text-zinc-600">Add texts from the Library to start reading</p>
          <button
            onClick={() => onNavigate('library')}
            className="btn-gold mt-2"
          >
            Browse Library
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {shelfBooks.map(book => (
            <div key={book.id} className="card flex items-center gap-4 p-4">
              <div
                className="w-12 h-16 bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer"
                onClick={() => onNavigate('chapter', { bookId: book.id })}
              >
                <BookOpen size={20} className="text-gold" />
              </div>
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => onNavigate('chapter', { bookId: book.id })}
              >
                <div className="font-serif text-base text-zinc-100">{book.title}</div>
                <div className="font-sans text-xs text-zinc-500 mt-0.5">{book.chapters} chapters</div>
              </div>
              <button
                onClick={() => removeFromLibrary(book.id)}
                className="p-2 text-zinc-600 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Remove from shelf"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {!isPremium && library.length >= 1 && (
            <div className="card p-4 border-gold/30 bg-gold/5 text-center">
              <p className="font-sans text-sm text-zinc-300 mb-2">Upgrade to Premium for unlimited books</p>
              <button className="btn-gold text-sm">Upgrade</button>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => onNavigate('library')}
        className="mt-6 w-full flex items-center justify-center gap-2 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 py-3 rounded-xl font-sans text-sm transition-colors"
      >
        <Plus size={16} />
        Add from Library
      </button>
    </div>
  );
}
