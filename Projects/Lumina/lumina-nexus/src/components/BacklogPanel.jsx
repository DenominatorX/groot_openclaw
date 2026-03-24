/**
 * BacklogPanel — In-app Kanban/List project management.
 *
 * Columns: To Do | In Progress | Done
 * Items persisted to Firestore (per-user) when Firebase is ready,
 * otherwise falls back to localStorage.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, GripVertical, ChevronDown, Loader2, AlertCircle,
  CheckCircle, Circle, Clock
} from 'lucide-react';
import { getBacklogItems, addBacklogItem, updateBacklogItem, deleteBacklogItem } from '../firebase/db';
import { useLocalStorage } from '../hooks/useLocalStorage';

const COLUMNS = [
  { id: 'todo',        label: 'To Do',       icon: Circle,      color: 'var(--text-muted)' },
  { id: 'in_progress', label: 'In Progress', icon: Clock,       color: '#fb923c' },
  { id: 'done',        label: 'Done',        icon: CheckCircle, color: '#4ade80' },
];

const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_COLORS = { low: '#5a9a8a', medium: 'var(--gold)', high: '#f87171' };
const TYPES = ['feature', 'bug', 'data-entry', 'research', 'other'];

function BacklogItem({ item, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-lg p-3 space-y-2 transition-colors"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start gap-2">
        <GripVertical size={12} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 3, cursor: 'grab' }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
              style={{ background: PRIORITY_COLORS[item.priority] + '20', color: PRIORITY_COLORS[item.priority], fontFamily: 'var(--font-body)' }}
            >
              {item.priority}
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', border: '1px solid var(--border)' }}
            >
              {item.type}
            </span>
          </div>
          <p
            className="text-sm font-semibold mt-1 cursor-pointer"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
            onClick={() => setExpanded(e => !e)}
          >
            {item.title}
          </p>
          {expanded && item.description && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              {item.description}
            </p>
          )}
        </div>
        <button onClick={() => onDelete(item.id)} className="p-0.5 rounded hover:bg-white/5 flex-shrink-0">
          <Trash2 size={11} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Status mover */}
      <div className="flex gap-1">
        {COLUMNS.map(col => (
          <button
            key={col.id}
            onClick={() => onUpdate(item.id, { status: col.id })}
            className="flex-1 text-[10px] py-0.5 rounded transition-colors"
            style={{
              fontFamily: 'var(--font-body)',
              background: item.status === col.id ? col.color + '20' : 'var(--bg-card)',
              color: item.status === col.id ? col.color : 'var(--text-muted)',
              border: `1px solid ${item.status === col.id ? col.color + '60' : 'var(--border)'}`,
            }}
          >
            {col.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function AddItemForm({ onAdd, onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [type, setType] = useState('feature');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await onAdd({ title: title.trim(), description: description.trim(), priority, type, status: 'todo' });
    setLoading(false);
    onClose();
  }

  const inputStyle = {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl p-4 space-y-3 fade-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
        New Item
      </h4>
      <input
        type="text"
        placeholder="Title *"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none"
        style={inputStyle}
        autoFocus
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none resize-none"
        style={inputStyle}
      />
      <div className="flex gap-2">
        <select value={priority} onChange={e => setPriority(e.target.value)} className="flex-1 px-2 py-1.5 text-xs rounded-lg focus:outline-none" style={inputStyle}>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={type} onChange={e => setType(e.target.value)} className="flex-1 px-2 py-1.5 text-xs rounded-lg focus:outline-none" style={inputStyle}>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs rounded-lg" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', border: '1px solid var(--border)' }}>
          Cancel
        </button>
        <button type="submit" disabled={loading || !title.trim()} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-opacity disabled:opacity-50" style={{ background: 'var(--gold)' + '30', color: 'var(--gold)', fontFamily: 'var(--font-body)', border: '1px solid var(--gold)' + '50' }}>
          {loading ? <Loader2 size={11} className="spin" /> : <Plus size={11} />}
          Add
        </button>
      </div>
    </form>
  );
}

export default function BacklogPanel({ isFirebaseReady, user, ensureAuth }) {
  const [items, setItems] = useState([]);
  const [localItems, setLocalItems] = useLocalStorage('nexus_backlog', []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [activeCol, setActiveCol] = useState('all');

  const useCloud = isFirebaseReady && !!user;

  useEffect(() => {
    if (useCloud) {
      loadFromFirestore();
    } else {
      setItems(localItems);
    }
  }, [useCloud, user]);

  async function loadFromFirestore() {
    setLoading(true);
    try {
      const data = await getBacklogItems();
      setItems(data);
    } catch (err) {
      setError(err.message);
      setItems(localItems); // fallback
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = useCallback(async (item) => {
    if (useCloud) {
      await ensureAuth();
      const id = await addBacklogItem(item);
      const newItem = { ...item, id };
      setItems(prev => [newItem, ...prev]);
    } else {
      const newItem = { ...item, id: Date.now().toString() };
      setLocalItems(prev => [newItem, ...prev]);
      setItems(prev => [newItem, ...prev]);
    }
  }, [useCloud, ensureAuth, setLocalItems]);

  const handleUpdate = useCallback(async (id, updates) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    if (useCloud) {
      try { await updateBacklogItem(id, updates); } catch {}
    } else {
      setLocalItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    }
  }, [useCloud, setLocalItems]);

  const handleDelete = useCallback(async (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    if (useCloud) {
      try { await deleteBacklogItem(id); } catch {}
    } else {
      setLocalItems(prev => prev.filter(i => i.id !== id));
    }
  }, [useCloud, setLocalItems]);

  const filtered = activeCol === 'all' ? items : items.filter(i => i.status === activeCol);

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Project Backlog</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            {useCloud ? 'Synced to Firestore' : 'Local storage only'} · {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
          style={{ background: 'var(--gold)' + '20', color: 'var(--gold)', fontFamily: 'var(--font-body)', border: '1px solid var(--gold)' + '40' }}
        >
          <Plus size={13} /> New Item
        </button>
      </div>

      {showAdd && <AddItemForm onAdd={handleAdd} onClose={() => setShowAdd(false)} />}

      {error && (
        <div className="flex items-center gap-2 text-xs p-2 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: '#f87171', fontFamily: 'var(--font-body)' }}>
          <AlertCircle size={12} /> {error} — showing local data.
        </div>
      )}

      {/* Column filter */}
      <div className="flex gap-1">
        {[{ id: 'all', label: `All (${items.length})` }, ...COLUMNS.map(c => ({ ...c, label: `${c.label} (${items.filter(i => i.status === c.id).length})` }))].map(col => (
          <button
            key={col.id}
            onClick={() => setActiveCol(col.id)}
            className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors"
            style={{
              fontFamily: 'var(--font-body)',
              background: activeCol === col.id ? 'var(--gold)' + '20' : 'var(--bg-elevated)',
              color: activeCol === col.id ? 'var(--gold)' : 'var(--text-muted)',
              border: `1px solid ${activeCol === col.id ? 'var(--gold)' + '40' : 'var(--border)'}`,
            }}
          >
            {col.label}
          </button>
        ))}
      </div>

      {/* Items */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="spin" style={{ color: 'var(--gold)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Circle size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            {activeCol === 'all' ? 'No items yet. Add your first task.' : `No ${activeCol} items.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <BacklogItem key={item.id} item={item} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
