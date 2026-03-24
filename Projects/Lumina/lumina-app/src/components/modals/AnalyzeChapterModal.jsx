import { useState, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { analyzeChapter } from '../../services/gemini';
import { PERSPECTIVES } from '../../utils/constants';

export default function AnalyzeChapterModal({ book, chapter, chapterText, onClose, isPremium }) {
  const [perspective, setPerspective] = useState('christian');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  const handleAnalyze = async () => {
    if (!isPremium) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setAnalysis('');
    try {
      const text = await analyzeChapter(book.title, chapter, chapterText, perspective, controller.signal);
      if (!controller.signal.aborted) setAnalysis(text);
    } catch (err) {
      if (err.name !== 'AbortError') setAnalysis('Analysis failed. Please try again.');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-2xl md:rounded-2xl max-h-[85vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div>
            <h2 className="font-serif text-lg text-zinc-100">{book.title} — Chapter {chapter}</h2>
            <p className="font-sans text-xs text-zinc-500">Chapter Analysis</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!isPremium ? (
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-6 text-center">
              <p className="font-serif text-lg text-zinc-300 mb-2">Premium Feature</p>
              <p className="font-sans text-sm text-zinc-500 mb-4">Chapter Analysis requires a Premium subscription</p>
              <button className="btn-gold">Upgrade to Premium</button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="font-sans text-xs text-zinc-500">Analysis Perspective</label>
                <select
                  value={perspective}
                  onChange={e => setPerspective(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 font-sans text-sm text-zinc-200 focus:outline-none focus:border-gold/50"
                >
                  {PERSPECTIVES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
              <button onClick={handleAnalyze} disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                Analyze Chapter
              </button>
              {analysis && (
                <div className="bg-zinc-800 rounded-xl p-4">
                  <p className="font-sans text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{analysis}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
