'use client';

import { useState } from 'react';

interface Props {
  value:    string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?:   boolean;
  name?:        string;
  id?:          string;
}

/** Password / secret input with eye-toggle. Used for passcode + API keys. */
export function PasswordInput({ value, onChange, placeholder, autoFocus, name, id }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        className="input pr-10"
        type={show ? 'text' : 'password'}
        value={value}
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-ink-3 hover:text-ink-1"
        aria-label={show ? 'Hide' : 'Show'}
        tabIndex={-1}
      >
        {show ? '◉' : '◎'}
      </button>
    </div>
  );
}
