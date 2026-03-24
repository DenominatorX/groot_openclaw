/**
 * LineageExplorer — main genealogy tree view.
 * Three view modes: Era View | Messianic Line | Search
 * Translation lens filter: KJV / NIV / LXX
 */

import { useState, useMemo } from 'react';
import {
  Search, GitBranch, ChevronDown, ChevronUp, Users, BookOpen
} from 'lucide-react';
import { LINEAGE, ERAS, MESSIANIC_LINE } from '../data/lineage';
import PersonCard from './PersonCard';
import PersonDetail from './PersonDetail';

const LENS_OPTIONS = [
  { id: null,  label: 'No Lens' },
  { id: 'kjv', label: 'KJV' },
  { id: 'niv', label: 'NIV' },
  { id: 'lxx', label: 'LXX' },
];

export default function LineageExplorer({ isFirebaseReady, ensureAuth }) {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [expandedEras, setExpandedEras] = useState({ creation: true, patriarchs: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('tree');
  const [activeLens, setActiveLens] = useState(null);

  const filteredPeople = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return LINEAGE.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.summary || '').toLowerCase().includes(q) ||
      (p.significance || '').toLowerCase().includes(q)
    );
  }, [searchQuery]);

  function toggleEra(eraId) {
    setExpandedEras(prev => ({ ...prev, [eraId]: !prev[eraId] }));
  }

  function handleSelectPerson(person) {
    setSelectedPerson(person);
    if (person.era && !expandedEras[person.era]) {
      setExpandedEras(prev => ({ ...prev, [person.era]: true }));
    }
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* Toolbar */}
      <div className="px-4 pt-5 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold)' + '20' }}>
              <GitBranch size={16} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Lineage Explorer
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                Adam → Jesus · {LINEAGE.length} individuals · {MESSIANIC_LINE.length} in Messianic line
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); if (e.target.value) setViewMode('search'); else setViewMode('tree'); }}
                placeholder="Search people…"
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
              />
            </div>

            {/* View toggle */}
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {[['tree', 'Era View'], ['messianic', 'Line']].map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => { setViewMode(mode); setSearchQuery(''); }}
                  className="px-3 py-2 text-xs font-semibold transition-colors"
                  style={{
                    background: viewMode === mode ? 'var(--gold)' + '20' : 'var(--bg-elevated)',
                    color: viewMode === mode ? 'var(--gold)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Translation lens */}
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {LENS_OPTIONS.map(opt => (
                <button
                  key={String(opt.id)}
                  onClick={() => setActiveLens(opt.id)}
                  className="px-3 py-2 text-xs font-semibold transition-colors"
                  style={{
                    background: activeLens === opt.id ? 'var(--accent-blue)' : 'var(--bg-elevated)',
                    color: activeLens === opt.id ? '#93c5fd' : 'var(--text-muted)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left: tree / list */}
            <div className="flex-1 min-w-0">
              {viewMode === 'search' && (
                <div className="space-y-2 fade-in">
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                    {filteredPeople.length} result{filteredPeople.length !== 1 ? 's' : ''} for "{searchQuery}"
                  </p>
                  {filteredPeople.map(p => (
                    <PersonCard key={p.id} person={p} isSelected={selectedPerson?.id === p.id} onClick={handleSelectPerson} />
                  ))}
                  {filteredPeople.length === 0 && (
                    <div className="text-center py-12">
                      <Search size={32} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>No matches found</p>
                    </div>
                  )}
                </div>
              )}

              {viewMode === 'messianic' && (
                <div className="space-y-1 fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--gold)' }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--gold)', fontFamily: 'var(--font-body)' }}>
                      Direct Messianic Line — {MESSIANIC_LINE.length} Generations
                    </span>
                  </div>
                  {MESSIANIC_LINE.map((person, i) => (
                    <div key={person.id} className="flex items-stretch">
                      <div className="flex flex-col items-center w-8 shrink-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full border-2 shrink-0"
                          style={{
                            borderColor: 'var(--gold)',
                            background: selectedPerson?.id === person.id ? 'var(--gold)' : 'var(--bg)',
                          }}
                        />
                        {i < MESSIANIC_LINE.length - 1 && (
                          <div className="flex-1 w-px" style={{ background: 'var(--gold)' + '40' }} />
                        )}
                      </div>
                      <div className="flex-1 pb-1">
                        <PersonCard person={person} isSelected={selectedPerson?.id === person.id} onClick={handleSelectPerson} compact />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'tree' && (
                <div className="space-y-3 fade-in">
                  {ERAS.map(era => {
                    const people = LINEAGE.filter(p => p.era === era.id);
                    if (people.length === 0) return null;
                    const isExpanded = expandedEras[era.id];
                    const messCount = people.filter(p => p.messianic).length;

                    return (
                      <div key={era.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                        <button
                          onClick={() => toggleEra(era.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-sm" style={{ background: era.color }} />
                            <div className="text-left">
                              <h3 className="font-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                                {era.name}
                              </h3>
                              <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                                {era.range} · {people.length} people · {messCount} in line
                              </span>
                            </div>
                          </div>
                          {isExpanded
                            ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />
                            : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                          }
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 fade-in">
                            {people.map(p => (
                              <PersonCard key={p.id} person={p} isSelected={selectedPerson?.id === p.id} onClick={handleSelectPerson} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: detail panel */}
            <div className="lg:w-[400px] shrink-0">
              <div className="lg:sticky lg:top-4">
                {selectedPerson ? (
                  <PersonDetail
                    person={selectedPerson}
                    onClose={() => setSelectedPerson(null)}
                    onSelectPerson={handleSelectPerson}
                    activeLens={activeLens}
                    isFirebaseReady={isFirebaseReady}
                    ensureAuth={ensureAuth}
                  />
                ) : (
                  <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <Users size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                    <p className="font-display text-lg mb-1" style={{ color: 'var(--text-muted)' }}>Select a person</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6, fontFamily: 'var(--font-body)' }}>
                      Click any name to view their profile, confidence score, AI biography, and scripture references
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
