import { useState } from 'react';
import { INITIAL_LIBRARY, COLLECTIONS } from '../../utils/constants';
import { BookOpen, Lock } from 'lucide-react';

export default function LibraryView({ onNavigate, isInLibrary }) {
  const [activeCollection, setActiveCollection] = useState('all');

  const filtered = activeCollection === 'all'
    ? INITIAL_LIBRARY
    : INITIAL_LIBRARY.filter(b => b.collection === activeCollection);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6 animate-fade-in">
      <h1 className="font-serif text-2xl text-zinc-100 mb-1">Sacred Library</h1>
      <p className="font-sans text-sm text-zinc-500 mb-6">Explore 100+ texts from traditions around the world</p>

      {/* Collection tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        <button
          onClick={() => setActiveCollection('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-sans transition-colors ${
            activeCollection === 'all' ? 'bg-gold text-zinc-950 font-medium' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          All
        </button>
        {COLLECTIONS.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCollection(c.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-sans transition-colors ${
              activeCollection === c.id ? 'bg-gold text-zinc-950 font-medium' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Book grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map(book => {
          const inLib = isInLibrary(book.id);
          return (
            <button
              key={book.id}
              onClick={() => onNavigate('chapter', { bookId: book.id })}
              className={`card p-3 flex flex-col gap-2 text-left hover:border-zinc-600 transition-colors ${
                !book.available ? 'opacity-50' : ''
              }`}
            >
              <div className={`w-full h-20 rounded-lg bg-gradient-to-br ${
                COLLECTIONS.find(c => c.id === book.collection)?.color || 'from-zinc-800 to-zinc-700'
              } flex items-center justify-center relative`}>
                {!book.available && (
                  <div className="absolute inset-0 bg-zinc-950/60 rounded-lg flex items-center justify-center">
                    <Lock size={16} className="text-zinc-400" />
                  </div>
                )}
                <BookOpen size={24} className="text-white/60" />
              </div>
              <div>
                <div className="font-serif text-sm text-zinc-100 leading-tight line-clamp-2">{book.title}</div>
                <div className="font-sans text-[10px] text-zinc-500 mt-0.5">
                  {book.chapters} ch{book.chapters !== 1 ? 's' : ''}
                  {inLib && <span className="ml-1 text-gold">· On shelf</span>}
                  {!book.available && <span className="ml-1">· Coming soon</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
