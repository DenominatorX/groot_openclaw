import { useState, useEffect } from 'react';
import { useBibleContent } from '../../hooks/useBibleContent';
import { INITIAL_LIBRARY, TRANSLATIONS } from '../../utils/constants';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, BookOpen, Loader2 } from 'lucide-react';
import StudyModal from '../modals/StudyModal';

export default function ReaderView({
  bookId, chapter, onNavigate,
  isChapterRead, markChapterRead, unmarkChapterRead,
  addToHistory, saveNote, getNote, settings, updateSettings,
}) {
  const book = INITIAL_LIBRARY.find(b => b.id === bookId);
  const [translation, setTranslation] = useState(settings?.translation || 'kjv');
  const [selectedVerse, setSelectedVerse] = useState(null);
  const { verses, loading, error } = useBibleContent(bookId, chapter, translation);
  const read = isChapterRead(bookId, chapter);

  useEffect(() => {
    if (bookId && chapter) addToHistory(bookId, chapter);
  }, [bookId, chapter]);

  if (!book) return null;

  const canPrev = chapter > 1;
  const canNext = chapter < book.chapters;

  const handleToggleRead = async () => {
    if (read) unmarkChapterRead(bookId, chapter);
    else markChapterRead(bookId, chapter);
  };

  return (
    <div className="max-w-2xl mx-auto pb-32 md:pb-8 animate-fade-in">
      {/* Translation selector */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
        {TRANSLATIONS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTranslation(t.id); updateSettings?.({ translation: t.id }); }}
            className={`px-2.5 py-1 rounded text-xs font-sans transition-colors ${
              translation === t.id
                ? 'bg-gold text-zinc-950 font-medium'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto font-sans text-xs text-zinc-600">
          {book.title} {chapter}
        </span>
      </div>

      {/* Chapter title */}
      <div className="px-6 pt-6 pb-2">
        <h1 className="font-serif text-2xl text-zinc-100 mb-0.5">{book.title}</h1>
        <p className="font-sans text-sm text-zinc-500">Chapter {chapter}</p>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {loading && (
          <div className="flex flex-col items-center py-12 gap-3 text-zinc-500">
            <Loader2 size={24} className="animate-spin" />
            <span className="font-sans text-sm">Loading chapter...</span>
          </div>
        )}
        {error && (
          <div className="text-center py-12">
            <p className="font-sans text-sm text-red-400">Could not load this chapter.</p>
            <p className="font-sans text-xs text-zinc-600 mt-1">{error}</p>
          </div>
        )}
        {verses && (
          <div className="space-y-3">
            {verses.map(v => (
              <div
                key={v.number}
                onClick={() => setSelectedVerse(v)}
                className={`group cursor-pointer rounded-lg px-3 py-2 -mx-3 transition-colors hover:bg-zinc-900 ${
                  selectedVerse?.number === v.number ? 'bg-zinc-900 border-l-2 border-gold pl-4' : ''
                }`}
              >
                <span className="font-sans text-[10px] text-gold font-medium mr-2 align-top mt-1 inline-block select-none">
                  {v.number}
                </span>
                <span className="font-serif text-lg text-zinc-200 leading-relaxed">{v.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Smart Navigation bottom bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => onNavigate('reader', { bookId, chapter: chapter - 1 })}
          disabled={!canPrev}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={handleToggleRead}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-sans text-sm font-medium transition-colors ${
            read
              ? 'bg-gold/20 border border-gold/30 text-gold hover:bg-gold/30'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          {read ? <CheckCircle2 size={16} /> : <Circle size={16} />}
          {read ? 'Mark Unread' : 'Mark as Read'}
        </button>

        {canNext ? (
          <button
            onClick={() => onNavigate('reader', { bookId, chapter: chapter + 1 })}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold hover:bg-gold-light text-zinc-950 font-sans text-sm font-medium rounded-lg transition-colors"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => onNavigate('chapter', { bookId })}
            className="px-4 py-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-sans text-sm rounded-lg transition-colors"
          >
            Done
          </button>
        )}
      </div>

      {/* Study Modal */}
      {selectedVerse && (
        <StudyModal
          book={book}
          chapter={chapter}
          verse={selectedVerse}
          onClose={() => setSelectedVerse(null)}
          saveNote={saveNote}
          getNote={getNote}
          settings={settings}
        />
      )}
    </div>
  );
}
