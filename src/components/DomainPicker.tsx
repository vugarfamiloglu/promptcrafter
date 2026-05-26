'use client';

import { CUSTOM_DOMAIN, DOMAINS } from '@/lib/domains';

interface Props {
  value:    string;
  onChange: (id: string) => void;
}

export function DomainPicker({ value, onChange }: Props) {
  const all = [...DOMAINS, CUSTOM_DOMAIN];
  return (
    <div className="flex flex-wrap gap-1.5">
      {all.map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => onChange(d.id)}
          className={`chip ${value === d.id ? 'is-active' : ''}`}
          title={d.hint}
        >
          <span className="glyph">{d.icon}</span>
          <span>{d.label}</span>
        </button>
      ))}
    </div>
  );
}
