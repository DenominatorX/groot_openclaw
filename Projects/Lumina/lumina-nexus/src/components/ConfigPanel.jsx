/**
 * Configuration Panel — Settings tab
 *
 * Manages:
 * - API keys: Anthropic (Claude), Gemini, OpenAI — stored in localStorage only
 * - Firebase project config — stored in localStorage, used to init Firebase
 *
 * Keys are NEVER stored in Firestore.
 */

import { useState } from 'react';
import { Settings, Eye, EyeOff, Save, Check, AlertCircle, Database, Key } from 'lucide-react';
import { initFirebase } from '../firebase/config';

function MaskedInput({ label, storageKey, placeholder }) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(() => localStorage.getItem(storageKey) || '');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (value.trim()) {
      localStorage.setItem(storageKey, value.trim());
    } else {
      localStorage.removeItem(storageKey);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
        {label}
      </label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-3 pr-8 py-2 text-sm rounded-lg focus:outline-none focus:ring-1"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
            }}
          />
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5"
          >
            {visible
              ? <EyeOff size={13} style={{ color: 'var(--text-muted)' }} />
              : <Eye size={13} style={{ color: 'var(--text-muted)' }} />
            }
          </button>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
          style={{
            background: saved ? '#4ade8020' : 'var(--bg-elevated)',
            border: `1px solid ${saved ? '#4ade8060' : 'var(--border)'}`,
            color: saved ? '#4ade80' : 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {saved ? <Check size={12} /> : <Save size={12} />}
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}

const EMPTY_FIREBASE = {
  apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '',
};

export default function ConfigPanel({ onFirebaseReady }) {
  const [fbConfig, setFbConfig] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nexus_firebase_config') || 'null') || EMPTY_FIREBASE;
    } catch { return EMPTY_FIREBASE; }
  });
  const [fbSaved, setFbSaved] = useState(false);
  const [fbError, setFbError] = useState(null);

  function updateFb(key, val) {
    setFbConfig(prev => ({ ...prev, [key]: val }));
  }

  function saveFirebase() {
    setFbError(null);
    if (!fbConfig.apiKey || !fbConfig.projectId) {
      setFbError('apiKey and projectId are required.');
      return;
    }
    try {
      localStorage.setItem('nexus_firebase_config', JSON.stringify(fbConfig));
      const result = initFirebase(fbConfig);
      if (!result) { setFbError('Failed to initialize Firebase.'); return; }
      setFbSaved(true);
      setTimeout(() => setFbSaved(false), 3000);
      onFirebaseReady?.();
    } catch (err) {
      setFbError(err.message);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold)' + '20' }}>
          <Settings size={16} style={{ color: 'var(--gold)' }} />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            All keys stored locally. Never sent to Firestore.
          </p>
        </div>
      </div>

      {/* AI API Keys */}
      <div className="rounded-xl p-4 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <Key size={14} style={{ color: 'var(--gold)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
            AI API Keys
          </h3>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          Used client-side to generate biographies. Claude is tried first; Gemini is the fallback.
        </p>
        <MaskedInput label="Anthropic (Claude)" storageKey="nexus_anthropic_key" placeholder="sk-ant-…" />
        <MaskedInput label="Google Gemini"       storageKey="nexus_gemini_key"    placeholder="AIza…"    />
        <MaskedInput label="OpenAI (optional)"   storageKey="nexus_openai_key"    placeholder="sk-…"     />
      </div>

      {/* Firebase Config */}
      <div className="rounded-xl p-4 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <Database size={14} style={{ color: 'var(--gold)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
            Firebase Project
          </h3>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          Enables biography caching, notes, and backlog sync across devices.
          Leave blank to use local-only mode.
        </p>

        {[
          { key: 'apiKey',            label: 'API Key',             ph: 'AIza…' },
          { key: 'authDomain',        label: 'Auth Domain',         ph: 'project.firebaseapp.com' },
          { key: 'projectId',         label: 'Project ID',          ph: 'my-project-id' },
          { key: 'storageBucket',     label: 'Storage Bucket',      ph: 'project.appspot.com' },
          { key: 'messagingSenderId', label: 'Messaging Sender ID', ph: '123456789' },
          { key: 'appId',             label: 'App ID',              ph: '1:123:web:abc' },
        ].map(({ key, label, ph }) => (
          <div key={key} className="space-y-1">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
              {label}
            </label>
            <input
              type="text"
              value={fbConfig[key] || ''}
              onChange={e => updateFb(key, e.target.value)}
              placeholder={ph}
              className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
            />
          </div>
        ))}

        {fbError && (
          <div className="flex items-center gap-2 text-xs" style={{ color: '#f87171', fontFamily: 'var(--font-body)' }}>
            <AlertCircle size={12} /> {fbError}
          </div>
        )}

        <button
          onClick={saveFirebase}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{
            background: fbSaved ? '#4ade8020' : 'var(--gold)' + '20',
            border: `1px solid ${fbSaved ? '#4ade8060' : 'var(--gold)' + '40'}`,
            color: fbSaved ? '#4ade80' : 'var(--gold)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {fbSaved ? <Check size={14} /> : <Save size={14} />}
          {fbSaved ? 'Firebase connected!' : 'Save & Connect Firebase'}
        </button>
      </div>

      {/* Security note */}
      <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <AlertCircle size={13} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 2 }} />
        <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          All API keys are stored in your browser's localStorage and are used only for client-side API calls.
          They are never transmitted to Firestore or any third-party server other than the respective AI APIs.
        </p>
      </div>
    </div>
  );
}
