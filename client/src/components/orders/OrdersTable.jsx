import React, { useState, useEffect, useCallback } from 'react';
import { fmt$, fmtN, fmtD, cap, STATUS_STYLE } from '../../utils/format';

export default function OrdersTable({ orders, loading, onEdit, onDelete }) {
  const [ctx, setCtx] = useState(null); // { x, y, order }

  // Close context menu on any click/scroll
  useEffect(() => {
    const close = () => setCtx(null);
    window.addEventListener('click', close);
    window.addEventListener('scroll', close, true);
    return () => { window.removeEventListener('click', close); window.removeEventListener('scroll', close, true); };
  }, []);

  const handleRightClick = useCallback((e, order) => {
    e.preventDefault();
    e.stopPropagation();
    setCtx({ x: e.clientX, y: e.clientY, order });
  }, []);

  if (loading) return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 44, animationDelay: `${i*60}ms` }}/>)}
    </div>
  );

if (!orders || !orders.length) return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#978f77' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="48" height="48" style={{ opacity: .4, display: 'block', margin: '0 auto 12px' }}>
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>
      </svg>
      <p style={{ margin: 0, fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', color: '#5a534a' }}>No orders found</p>
      <p style={{ margin: '4px 0 0', fontSize: '.85rem' }}>Try adjusting filters or create a new order.</p>
    </div>
  );

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {['Customer','Product','Amount','Qty','Status','Date','Actions'].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
{(orders || []).map((o, i) => {
                const st = STATUS_STYLE[o.status] || STATUS_STYLE.pending;
              return (
                <tr key={o._id} onContextMenu={e => handleRightClick(e, o)}
                  style={{ cursor: 'context-menu', animationDelay: `${i*20}ms` }} className="anim-fadeUp">
                  <td style={{ fontWeight: 600, color: '#1a1714' }}>{o.customerName}</td>
                  <td style={{ color: '#5a534a' }}>{o.product}</td>
                  <td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{fmt$(o.amount)}</td>
                  <td style={{ color: '#5a534a' }}>{fmtN(o.quantity)}</td>
                  <td>
                    <span className={`badge ${st.badge}`}>
                      <span className={`badge-dot ${st.dot}`}/>
                      {cap(o.status)}
                    </span>
                  </td>
                  <td style={{ color: '#978f77', fontSize: '.83rem' }}>{fmtD(o.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => onEdit(o)} title="Edit"
                        style={{ width:30, height:30, borderRadius:8, background:'none', border:'none', cursor:'pointer', color:'#978f77', display:'flex', alignItems:'center', justifyContent:'center' }}
                        onMouseEnter={e=>e.currentTarget.style.background='#f0ede6'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => onDelete(o)} title="Delete"
                        style={{ width:30, height:30, borderRadius:8, background:'none', border:'none', cursor:'pointer', color:'#978f77', display:'flex', alignItems:'center', justifyContent:'center' }}
                        onMouseEnter={e=>{e.currentTarget.style.background='#fef2f2';e.currentTarget.style.color='#dc2626'}} onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='#978f77'}}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Right-click Context Menu */}
      {ctx && (
        <div className="ctx-menu" style={{ top: ctx.y, left: ctx.x }} onClick={e => e.stopPropagation()}>
          <button className="ctx-item" onClick={() => { onEdit(ctx.order); setCtx(null); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit Order
          </button>
          <div className="ctx-divider"/>
          <button className="ctx-item ctx-item-danger" onClick={() => { onDelete(ctx.order); setCtx(null); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
            Delete Order
          </button>
        </div>
      )}
    </>
  );
}
