'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open:     boolean;
  onClose:  () => void;
  title?:   string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

/* Base modal — keyboard-dismiss, click-outside, portal-rendered. */
export function Modal({ open, onClose, title, children, actions }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {title && <h3>{title}</h3>}
        <div className="body">{children}</div>
        {actions && <div className="actions">{actions}</div>}
      </div>
    </div>,
    document.body,
  );
}
