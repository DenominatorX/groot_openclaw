import { X, BookOpen, Plus } from 'lucide-react';

export default function AcquireModal({ book, onAcquire, onClose, canAcquire, onSwap }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-sm bg-zinc-900 border border-zinc-800 rounded-t-2xl md:rounded-2xl p-6 animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors">
          <X size={18} />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-18 bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 rounded-xl flex items-center justify-center">
            <BookOpen size={24} className="text-gold" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-zinc-100">{book.title}</h2>
            <p className="font-sans text-sm text-zinc-500 mt-1">{book.chapters} chapters</p>
          </div>

          {canAcquire ? (
            <button onClick={onAcquire} className="btn-gold w-full flex items-center justify-center gap-2">
              <Plus size={16} /> Add to My Shelf
            </button>
          ) : (
            <div className="space-y-3 w-full">
              <p className="font-sans text-sm text-zinc-400">
                You've reached your free tier limit. Swap your current book or upgrade to Premium.
              </p>
              <button onClick={onSwap} className="btn-gold w-full">Swap Book</button>
              <button className="w-full border border-zinc-700 text-zinc-300 hover:border-zinc-500 py-2.5 rounded-lg font-sans text-sm transition-colors">
                Upgrade to Premium
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
