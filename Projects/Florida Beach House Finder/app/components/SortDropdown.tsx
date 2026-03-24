'use client';

import { SORT_OPTIONS } from './types';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function SortDropdown({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer appearance-none"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
        outline: 'none',
        minHeight: 32,
      }}
    >
      {SORT_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
