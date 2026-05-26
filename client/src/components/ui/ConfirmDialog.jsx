import React from 'react';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="anim-scaleIn card" style={{ width: 380, maxWidth: 'calc(100vw - 32px)', padding: 28, textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" width="26" height="26"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
        </div>
        <h3 style={{ margin: '0 0 8px', fontFamily: "'Playfair Display',serif", fontSize: '1.1rem' }}>{title}</h3>
        <p style={{ margin: '0 0 22px', fontSize: '.87rem', color: '#7d7460' }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading} style={{ flex: 1 }}>
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
