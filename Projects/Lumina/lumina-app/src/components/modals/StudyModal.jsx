import { useState, useRef, useEffect } from 'react';
import { X, Loader2, Send, FileText, MessageSquare } from 'lucide-react';
import { analyzeVerse, chatAboutVerse } from '../../services/gemini';
import { fetchSingleVerse } from '../../hooks/useBibleContent';
import { TRANSLATIONS, PERSPECTIVES } from '../../utils/constants';

export default function StudyModal({ book, chapter, verse, onClose, saveNote, getNote, settings }) {
  const [tab, setTab] = useState('study'); // study | notes | chat
  const [perspective, setPerspective] = useState('christian');
  const [analysis, setAnalysis] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [translations, setTranslations] = useState({});
  const [translationsLoading, setTranslationsLoading] = useState(false);
  const [note, setNote] = useState(getNote(book.id, chapter, verse.number) || '');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const abortRef = useRef(null);
  const chatEndRef = useRef(null);

  const isPremium = settings?.subscription === 'premium';

  // Pre-load alternate translations
  useEffect(() => {
    if (!book.id) return;
    setTranslationsLoading(true);
    Promise.all(
      TRANSLATIONS.map(async t => {
        const text = await fetchSingleVerse(book.id, chapter, verse.number, t.id);
        return [t.id, text];
      })
    ).then(pairs => {
      const obj = {};
      pairs.forEach(([k, v]) => { if (v) obj[k] = v; });
      setTranslations(obj);
    }).finally(() => setTranslationsLoading(false));
  }, [book.id, chapter, verse.number]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleAnalyze = async () => {
    if (!isPremium) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setAnalysisLoading(true);
    setAnalysis('');
    try {
      const text = await analyzeVerse(book.title, chapter, verse.number, verse.text, perspective, controller.signal);
      if (!controller.signal.aborted) setAnalysis(text);
    } catch (err) {
      if (err.name !== 'AbortError') setAnalysis('Analysis failed. Please try again.');
    } finally {
      if (!controller.signal.aborted) setAnalysisLoading(false);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const q = chatInput;
    setChatInput('');
    const newHistory = [...chatHistory, { role: 'user', text: q }];
    setChatHistory(newHistory);
    setChatLoading(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const reply = await chatAboutVerse(book.title, chapter, verse.number, verse.text, q, chatHistory, controller.signal);
      if (!controller.signal.aborted) {
        setChatHistory(prev => [...prev, { role: 'ai', text: reply }]);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setChatHistory(prev => [...prev, { role: 'ai', text: 'Sorry, I could not respond. Check your API key.' }]);
      }
    } finally {
      if (!controller.signal.aborted) setChatLoading(false);
    }
  };

  const handleSaveNote = () => {
    saveNote(book.id, chapter, verse.number, note);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-2xl md:rounded-2xl max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-zinc-800">
          <div>
            <div className="font-sans text-xs text-gold font-medium">{book.title} {chapter}:{verse.number}</div>
            <p className="font-serif text-sm text-zinc-300 mt-1 leading-relaxed line-clamp-2">"{verse.text}"</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors ml-2 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          {[
            { id: 'study', label: 'Study' },
            { id: 'notes', label: 'Notes', icon: FileText },
            { id: 'chat', label: 'Chat', icon: MessageSquare },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 font-sans text-sm transition-colors ${
                tab === t.id ? 'text-zinc-100 border-b-2 border-gold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'study' && (
            <div className="space-y-4">
              {/* Translations */}
              <div>
                <h3 className="font-sans text-xs text-zinc-500 uppercase tracking-wider mb-2">Translations</h3>
                {translationsLoading ? (
                  <div className="flex items-center gap-2 text-zinc-500 text-sm font-sans">
                    <Loader2 size={14} className="animate-spin" /> Loading...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {TRANSLATIONS.map(t => translations[t.id] ? (
                      <div key={t.id} className="bg-zinc-800 rounded-lg p-3">
                        <div className="font-sans text-[10px] text-gold font-medium mb-1">{t.label}</div>
                        <p className="font-serif text-sm text-zinc-200 leading-relaxed">{translations[t.id]}</p>
                      </div>
                    ) : null)}
                  </div>
                )}
              </div>

              {/* Analysis Lens (Premium) */}
              <div>
                <h3 className="font-sans text-xs text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  Analysis Lens
                  {!isPremium && <span className="text-gold text-[10px]">Premium</span>}
                </h3>
                {isPremium ? (
                  <div className="space-y-2">
                    <select
                      value={perspective}
                      onChange={e => setPerspective(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 font-sans text-sm text-zinc-200 focus:outline-none focus:border-gold/50"
                    >
                      {PERSPECTIVES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                    <button onClick={handleAnalyze} disabled={analysisLoading} className="btn-gold text-sm disabled:opacity-60 flex items-center gap-2">
                      {analysisLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                      Analyze
                    </button>
                    {analysis && (
                      <div className="bg-zinc-800 rounded-lg p-3">
                        <p className="font-sans text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{analysis}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gold/5 border border-gold/20 rounded-lg p-3 text-center">
                    <p className="font-sans text-sm text-zinc-400 mb-2">Analyze verses through multiple religious traditions</p>
                    <button className="btn-gold text-xs py-1.5">Upgrade to Premium</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'notes' && (
            <div className="space-y-3">
              <h3 className="font-sans text-xs text-zinc-500 uppercase tracking-wider">Personal Reflection</h3>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Write your thoughts, reflections, or insights here..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 font-sans text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-gold/50 resize-none h-40"
              />
              <button onClick={handleSaveNote} className="btn-gold text-sm">Save Note</button>
            </div>
          )}

          {tab === 'chat' && (
            <div className="flex flex-col h-full min-h-[200px]">
              <div className="flex-1 space-y-3 mb-4">
                {chatHistory.length === 0 && (
                  <p className="font-sans text-sm text-zinc-500 text-center py-4">
                    Ask anything about this verse...
                  </p>
                )}
                {chatHistory.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 font-sans text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-gold text-zinc-950'
                        : 'bg-zinc-800 text-zinc-200'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 rounded-2xl px-3 py-2">
                      <Loader2 size={14} className="animate-spin text-zinc-400" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleChat} className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Ask about this verse..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 font-sans text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-gold/50"
                />
                <button type="submit" disabled={chatLoading} className="p-2 bg-gold hover:bg-gold-light text-zinc-950 rounded-xl disabled:opacity-60 transition-colors">
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
