import React, { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, width = 540 }) {
  useEffect(() => {
    if (!open) return;
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="anim-scaleIn card" style={{ width, maxWidth: 'calc(100vw - 32px)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid #f0ede6', flexShrink: 0 }}>
          <h3 style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', fontWeight: 600, color: '#1a1714' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#978f77', padding: 4, borderRadius: 6, display: 'flex' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}
