/**
 * BiographyPanel — button-triggered AI biography generator.
 * Checks Firestore cache first; falls back to Claude then Gemini.
 */

import { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { generateBiography } from '../firebase/biographyEngine';

const SOURCE_LABELS = { claude: 'Claude AI', gemini: 'Gemini AI', cache: 'Cached' };

export default function BiographyPanel({ person, isFirebaseReady, hasApiKey }) {
  const [bio, setBio] = useState(null);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerate(forceRefresh = false) {
    setLoading(true);
    setError(null);
    try {
      const result = await generateBiography(person, {
        useFirestoreCache: isFirebaseReady && !forceRefresh,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setBio(result.bio);
        setSource(result.source);
      }
    } catch (err) {
      setError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  if (!hasApiKey) {
    return (
      <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <AlertCircle size={13} style={{ color: '#fb923c', flexShrink: 0, marginTop: 2 }} />
        <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          Add an Anthropic or Gemini API key in <strong style={{ color: 'var(--text-primary)' }}>Settings</strong> to generate AI biographies.
        </p>
      </div>
    );
  }

  if (!bio && !loading && !error) {
    return (
      <button
        onClick={() => handleGenerate()}
        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-colors hover:opacity-90"
        style={{ background: 'var(--gold)' + '20', border: '1px solid var(--gold)' + '40', color: 'var(--gold)', fontFamily: 'var(--font-body)' }}
      >
        <Sparkles size={14} />
        Generate AI Biography
      </button>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 justify-center">
        <Loader2 size={14} className="spin" style={{ color: 'var(--gold)' }} />
        <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          Generating biography…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg p-3 space-y-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <AlertCircle size={13} style={{ color: '#f87171' }} />
          <span className="text-xs" style={{ color: '#f87171', fontFamily: 'var(--font-body)' }}>{error}</span>
        </div>
        <button
          onClick={() => handleGenerate()}
          className="text-xs flex items-center gap-1 hover:opacity-80"
          style={{ color: 'var(--gold)', fontFamily: 'var(--font-body)' }}
        >
          <RefreshCw size={11} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} style={{ color: 'var(--gold)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
            AI Biography
          </span>
          {source && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: source === 'cache' ? 'var(--bg)' : 'var(--gold)' + '20', color: source === 'cache' ? 'var(--text-muted)' : 'var(--gold)', fontFamily: 'var(--font-body)' }}
            >
              {SOURCE_LABELS[source] || source}
            </span>
          )}
        </div>
        <button
          onClick={() => handleGenerate(true)}
          title="Regenerate (bypasses cache)"
          className="p-1 rounded hover:bg-white/5 transition-colors"
        >
          <RefreshCw size={11} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      <div className="p-3" style={{ background: 'var(--bg-card)' }}>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', lineHeight: 1.7 }}
        >
          {bio}
        </p>
      </div>
    </div>
  );
}
