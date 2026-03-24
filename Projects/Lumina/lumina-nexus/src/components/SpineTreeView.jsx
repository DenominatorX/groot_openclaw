/**
 * SpineTreeView — Messianic spine tree with collapsible side branches.
 *
 * The Adam → Jesus messianic chain forms a left-aligned golden spine.
 * Each messianic node can expand to reveal non-messianic relatives
 * (spouses + non-messianic children) as compact branch chips.
 *
 * Era headers divide the spine into Biblical periods.
 * Confidence scores appear on each branch chip.
 */

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Crown, Users, GitBranch } from 'lucide-react';
import { LINEAGE, ERAS, MESSIANIC_LINE } from '../data/lineage';

function scoreColor(s) {
  if (s == null) return 'var(--text-muted)';
  if (s >= 90) return '#4ade80';
  if (s >= 70) return '#c9a84c';
  if (s >= 50) return '#fb923c';
  return '#f87171';
}

function BranchChip({ person, isSelected, onClick }) {
  return (
    <button
      onClick={() => onClick(person)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        borderRadius: '8px',
        fontSize: '0.72rem',
        fontWeight: 500,
        fontFamily: 'var(--font-body)',
        background: isSelected ? 'rgba(201,168,76,0.14)' : 'var(--bg-elevated)',
        border: `1px solid ${isSelected ? 'rgba(201,168,76,0.6)' : 'var(--border)'}`,
        color: isSelected ? 'var(--gold)' : 'var(--text-secondary)',
        transition: 'all 0.15s',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {person.name}
      {person.confidence != null && (
        <span
          style={{
            fontSize: '0.6rem',
            color: scoreColor(person.confidence),
            fontWeight: 700,
          }}
        >
          {person.confidence}
        </span>
      )}
    </button>
  );
}

function SpineNode({ person, isSelected, onClick, branches, isExpanded, onToggle, isLast }) {
  const hasBranches = branches.length > 0;

  return (
    <div style={{ display: 'flex', alignItems: 'stretch' }}>
      {/* ── Spine column ── */}
      <div
        style={{
          width: '24px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Dot */}
        <div
          style={{
            width: '11px',
            height: '11px',
            borderRadius: '50%',
            border: '2px solid var(--gold)',
            background: isSelected ? 'var(--gold)' : 'var(--bg)',
            marginTop: '13px',
            flexShrink: 0,
            zIndex: 1,
            transition: 'background 0.2s, box-shadow 0.2s',
            boxShadow: isSelected ? '0 0 10px rgba(201,168,76,0.5)' : 'none',
          }}
        />
        {/* Connector line */}
        {!isLast && (
          <div
            style={{
              flex: 1,
              width: '2px',
              background: 'linear-gradient(to bottom, rgba(201,168,76,0.35), rgba(201,168,76,0.1))',
              minHeight: '24px',
            }}
          />
        )}
      </div>

      {/* ── Node content ── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          paddingBottom: isLast ? '8px' : '14px',
          paddingLeft: '10px',
        }}
      >
        {/* Main messianic node button */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            paddingTop: '7px',
          }}
        >
          <button
            onClick={() => onClick(person)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              background: isSelected
                ? 'rgba(201,168,76,0.18)'
                : 'var(--bg-card)',
              border: `1.5px solid ${isSelected ? 'var(--gold)' : 'rgba(201,168,76,0.3)'}`,
              color: isSelected ? 'var(--gold)' : 'var(--text-primary)',
              transition: 'all 0.15s',
              cursor: 'pointer',
              boxShadow: isSelected
                ? '0 2px 16px rgba(201,168,76,0.12)'
                : 'none',
            }}
          >
            <Crown
              size={11}
              style={{ color: 'var(--gold)', flexShrink: 0 }}
            />
            {person.name}
            {person.age != null && (
              <span
                style={{
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                }}
              >
                {person.age}y
              </span>
            )}
            {person.confidence != null && (
              <span
                style={{
                  fontSize: '0.62rem',
                  color: scoreColor(person.confidence),
                  fontWeight: 700,
                }}
              >
                {person.confidence}
              </span>
            )}
          </button>

          {hasBranches && (
            <button
              onClick={onToggle}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '0.65rem',
                fontFamily: 'var(--font-body)',
                background: isExpanded ? 'var(--bg-elevated)' : 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              title="Show/hide related people"
            >
              <Users size={9} />
              {branches.length}
              {isExpanded ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
            </button>
          )}
        </div>

        {/* Branch chips */}
        {hasBranches && isExpanded && (
          <div
            className="fade-in"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '5px',
              marginTop: '7px',
              marginLeft: '6px',
              paddingLeft: '10px',
              paddingTop: '4px',
              paddingBottom: '2px',
              borderLeft: '2px solid var(--border)',
            }}
          >
            {branches.map(p => (
              <BranchChip
                key={p.id}
                person={p}
                isSelected={isSelected && false /* highlight by id */}
                onClick={onClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SpineTreeView({ selectedPerson, onSelectPerson }) {
  const [expandedNodes, setExpandedNodes] = useState({});

  const spineData = useMemo(() => {
    const result = [];
    let lastEra = null;

    MESSIANIC_LINE.forEach((person, idx) => {
      const era = ERAS.find(e => e.id === person.era);
      const showEraHeader = era?.id !== lastEra;
      if (showEraHeader) lastEra = era?.id;

      // Non-messianic spouses
      const spouses = (person.spouse || [])
        .map(sid => LINEAGE.find(p => p.id === sid))
        .filter(s => s && !s.messianic);

      // Non-messianic direct children
      const nonMessChildren = (person.children || [])
        .map(cid => LINEAGE.find(p => p.id === cid))
        .filter(c => c && !c.messianic);

      // Deduplicate branches by id
      const seen = new Set();
      const branches = [];
      for (const p of [...spouses, ...nonMessChildren]) {
        if (p && !seen.has(p.id)) {
          seen.add(p.id);
          branches.push(p);
        }
      }

      result.push({
        person,
        era,
        showEraHeader,
        branches,
        isLast: idx === MESSIANIC_LINE.length - 1,
      });
    });

    return result;
  }, []);

  function toggle(personId) {
    setExpandedNodes(prev => ({ ...prev, [personId]: !prev[personId] }));
  }

  return (
    <div style={{ padding: '8px 16px 32px', maxWidth: '700px', margin: '0 auto' }}>
      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          padding: '10px 14px',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          marginBottom: '20px',
          fontSize: '0.68rem',
          fontFamily: 'var(--font-body)',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '2px',
              height: '16px',
              background: 'rgba(201,168,76,0.5)',
              borderRadius: '1px',
            }}
          />
          <span>Messianic Axis (Adam → Jesus)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Crown size={10} style={{ color: 'var(--gold)' }} />
          <span>Messianic line</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={10} />
          <span>Click to expand side branches</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GitBranch size={10} />
          <span>{MESSIANIC_LINE.length} generations</span>
        </div>
      </div>

      {spineData.map(({ person, era, showEraHeader, branches, isLast }) => (
        <div key={person.id}>
          {showEraHeader && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '18px 0 10px 24px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '2px',
                  background: era?.color || '#444',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {era?.name}
              </span>
              <span
                style={{
                  fontSize: '0.6rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {era?.range}
              </span>
            </div>
          )}

          <SpineNode
            person={person}
            isSelected={selectedPerson?.id === person.id}
            onClick={onSelectPerson}
            branches={branches}
            isExpanded={!!expandedNodes[person.id]}
            onToggle={() => toggle(person.id)}
            isLast={isLast}
          />
        </div>
      ))}
    </div>
  );
}
