import { useState, useRef } from 'react';
import { Search, Loader2, BookOpen } from 'lucide-react';
import { searchTexts } from '../../services/gemini';
import { INITIAL_LIBRARY } from '../../utils/constants';

export default function SearchView({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await searchTexts(query, controller.signal);
      setResults(res);
    } catch (err) {
      if (err.name !== 'AbortError') setError('Search failed. Check your Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20 md:pb-6 animate-fade-in">
      <h1 className="font-serif text-2xl text-zinc-100 mb-1">Search</h1>
      <p className="font-sans text-sm text-zinc-500 mb-6">Find passages by theme or topic across sacred texts</p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g. 'forgiveness', 'creation', 'wisdom'..."
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 font-sans text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-gold/50"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-gold px-4 flex items-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Search
        </button>
      </form>

      {error && <p className="font-sans text-sm text-red-400 text-center">{error}</p>}

      {results && results.length === 0 && (
        <p className="font-sans text-sm text-zinc-500 text-center">No results found.</p>
      )}

      {results && results.length > 0 && (
        <div className="space-y-3">
          {results.map((r, i) => {
            const book = INITIAL_LIBRARY.find(b =>
              b.title.toLowerCase().includes(r.book?.toLowerCase()) ||
              r.book?.toLowerCase().includes(b.title.toLowerCase())
            );
            return (
              <div key={i} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen size={14} className="text-gold" />
                  </div>
                  <div className="flex-1">
                    <div className="font-sans text-xs text-gold font-medium mb-1">
                      {r.book} {r.chapter}:{r.verse}
                    </div>
                    <p className="font-serif text-sm text-zinc-200 leading-relaxed mb-2">
                      &ldquo;{r.quote}&rdquo;
                    </p>
                    <p className="font-sans text-xs text-zinc-500">{r.relevance}</p>
                    {book && (
                      <button
                        onClick={() => onNavigate('reader', { bookId: book.id, chapter: r.chapter })}
                        className="mt-2 text-xs font-sans text-zinc-400 hover:text-gold transition-colors"
                      >
                        Read in context →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
