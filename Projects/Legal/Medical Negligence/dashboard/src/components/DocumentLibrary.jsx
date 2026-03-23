import { useState, useMemo } from 'react'
import documentsData from '../data/documents.json'

const CATEGORY_ICONS = {
  'Legal':           '⚖️',
  'Employment':      '💼',
  'Medical Records': '🏥',
  'Diagnostics':     '🔬',
  'Genetic Testing': '🧬',
  'Correspondence':  '📨',
}

const STATUS_STYLES = {
  obtained: 'bg-green-950/50 text-green-300 border border-green-800/60',
  pending:  'bg-amber-950/50 text-amber-300 border border-amber-800/60',
  needed:   'bg-red-950/50 text-red-300 border border-red-800/60',
  filed:    'bg-blue-950/50 text-blue-300 border border-blue-800/60',
}

const ALL_CATEGORIES = ['All', ...Object.keys(CATEGORY_ICONS)]
const ALL_STATUSES = ['all', 'obtained', 'pending', 'needed']

export default function DocumentLibrary() {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const docs = useMemo(() => documentsData.documents.filter(d => {
    if (catFilter !== 'All' && d.category !== catFilter) return false
    if (statusFilter !== 'all' && d.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (d.title + d.category + d.source + (d.notes || '')).toLowerCase().includes(q)
    }
    return true
  }), [search, catFilter, statusFilter])

  const counts = useMemo(() => ({
    obtained: documentsData.documents.filter(d => d.status === 'obtained').length,
    pending:  documentsData.documents.filter(d => d.status === 'pending').length,
    needed:   documentsData.documents.filter(d => d.status === 'needed').length,
    filed:    documentsData.documents.filter(d => d.status === 'filed').length,
  }), [])

  const selected_doc = selected ? documentsData.documents.find(d => d.id === selected) : null

  function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-1">Document Library</h1>
      <p className="text-slate-400 text-sm mb-4">All case documents indexed by category and status.</p>

      {/* Summary counts */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-green-950/20 border border-green-900/40 rounded-lg p-3 text-center">
          <div className="mono font-bold text-2xl text-green-400">{counts.obtained}</div>
          <div className="text-green-300 text-xs mt-0.5">Obtained</div>
        </div>
        <div className="bg-amber-950/20 border border-amber-900/40 rounded-lg p-3 text-center">
          <div className="mono font-bold text-2xl text-amber-400">{counts.pending}</div>
          <div className="text-amber-300 text-xs mt-0.5">Pending</div>
        </div>
        <div className="bg-red-950/20 border border-red-900/40 rounded-lg p-3 text-center">
          <div className="mono font-bold text-2xl text-red-400">{counts.needed}</div>
          <div className="text-red-300 text-xs mt-0.5">Still Needed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search documents…"
          className="bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-600 w-52"
        />
        <div className="flex flex-wrap gap-1">
          {ALL_CATEGORIES.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${catFilter === c ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >{c === 'All' ? 'All categories' : c}</button>
          ))}
        </div>
        <div className="flex gap-1">
          {ALL_STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors capitalize ${statusFilter === s ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >{s === 'all' ? 'All statuses' : s}</button>
          ))}
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-3">{docs.length} documents</div>

      <div className="flex gap-4">
        {/* Document grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {docs.map(doc => (
              <button
                key={doc.id}
                onClick={() => setSelected(selected === doc.id ? null : doc.id)}
                className={`text-left card rounded-xl p-3.5 transition-all hover:border-slate-600 ${selected === doc.id ? 'border-blue-600 bg-blue-950/20' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xl">{CATEGORY_ICONS[doc.category] || '📄'}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium capitalize ${STATUS_STYLES[doc.status] || STATUS_STYLES.pending}`}>
                    {doc.status}
                  </span>
                </div>
                <div className="font-medium text-white text-sm leading-snug mb-1 line-clamp-2">{doc.title}</div>
                <div className="text-slate-500 text-xs">{doc.category}</div>
                {doc.date && <div className="text-slate-600 mono text-xs mt-1">{formatDate(doc.date)}</div>}
              </button>
            ))}
          </div>

          {docs.length === 0 && (
            <div className="text-slate-500 text-sm text-center py-12">No documents match your filters.</div>
          )}
        </div>

        {/* Detail pane */}
        {selected_doc && (
          <div className="w-72 flex-shrink-0 card rounded-xl p-4 h-fit sticky top-0">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{CATEGORY_ICONS[selected_doc.category] || '📄'}</span>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-lg leading-none">×</button>
            </div>
            <div className="font-semibold text-white text-sm leading-snug mb-1">{selected_doc.title}</div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${STATUS_STYLES[selected_doc.status] || STATUS_STYLES.pending}`}>
                {selected_doc.status}
              </span>
              <span className="text-slate-500 text-xs">{selected_doc.category}</span>
            </div>
            <div className="space-y-2 text-xs">
              {selected_doc.date && (
                <div>
                  <div className="text-slate-500 mb-0.5">Date</div>
                  <div className="text-slate-300 mono">{formatDate(selected_doc.date)}</div>
                </div>
              )}
              <div>
                <div className="text-slate-500 mb-0.5">Source</div>
                <div className="text-slate-300">{selected_doc.source}</div>
              </div>
              {selected_doc.filename && (
                <div>
                  <div className="text-slate-500 mb-0.5">Filename</div>
                  <div className="text-slate-400 mono text-xs break-all">{selected_doc.filename}</div>
                </div>
              )}
              {selected_doc.notes && (
                <div>
                  <div className="text-slate-500 mb-0.5">Notes</div>
                  <div className="text-slate-300">{selected_doc.notes}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
