import { Crown } from 'lucide-react';

function scoreColor(score) {
  if (!score) return 'var(--text-muted)';
  if (score >= 90) return '#4ade80';
  if (score >= 70) return '#c9a84c';
  if (score >= 50) return '#fb923c';
  return '#f87171';
}

export default function PersonCard({ person, isSelected, onClick, compact = false }) {
  if (compact) {
    return (
      <button
        onClick={() => onClick(person)}
        className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-white/5"
        style={{
          background: isSelected ? 'var(--gold)' + '15' : 'transparent',
          border: `1px solid ${isSelected ? 'var(--gold)' + '40' : 'transparent'}`,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {person.messianic && <Crown size={10} style={{ color: 'var(--gold)', flexShrink: 0 }} />}
            <span
              className="text-sm font-semibold truncate"
              style={{ color: isSelected ? 'var(--gold)' : 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
            >
              {person.name}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {person.confidence != null && (
              <span className="text-[10px]" style={{ color: scoreColor(person.confidence), fontFamily: 'var(--font-body)' }}>
                {person.confidence}
              </span>
            )}
            <div
              className="w-8 h-1 rounded-full overflow-hidden"
              style={{ background: 'var(--border)' }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${person.confidence ?? 50}%`, background: scoreColor(person.confidence) }}
              />
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick(person)}
      className="w-full text-left p-3 rounded-xl transition-colors hover:bg-white/5"
      style={{
        background: isSelected ? 'var(--gold)' + '12' : 'var(--bg-elevated)',
        border: `1px solid ${isSelected ? 'var(--gold)' + '50' : 'var(--border)'}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {person.messianic && <Crown size={11} style={{ color: 'var(--gold)', flexShrink: 0 }} />}
            <span
              className="text-sm font-semibold"
              style={{ color: isSelected ? 'var(--gold)' : 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
            >
              {person.name}
            </span>
            {person.age && (
              <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                {person.age}y
              </span>
            )}
          </div>
          {person.summary && (
            <p
              className="text-xs line-clamp-2"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
            >
              {person.summary}
            </p>
          )}
        </div>
        {/* Mini confidence bar */}
        {person.confidence != null && (
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-[10px] font-bold" style={{ color: scoreColor(person.confidence), fontFamily: 'var(--font-body)' }}>
              {person.confidence}
            </span>
            <div className="w-12 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${person.confidence}%`, background: scoreColor(person.confidence) }}
              />
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
