import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GridLayout from 'react-grid-layout';
import { v4 as uuidv4 } from 'uuid';
import { dashboardAPI, ordersAPI, analyticsAPI } from '../api';
import { useToast } from '../hooks/useToast';
import { STATUSES, cap } from '../utils/format';
import WidgetChart from '../components/dashboard/WidgetChart';

// Palette items
const PALETTE = [
  { type:'kpi',     label:'KPI Card',     desc:'Single metric',      defaultW:3, defaultH:3, minW:2, minH:2, config:{ title:'Total Revenue',    field:'amount',   aggregation:'sum',   groupBy:'none',    chartType:'kpi'     } },
  { type:'bar',     label:'Bar Chart',    desc:'Compare categories', defaultW:6, defaultH:5, minW:3, minH:3, config:{ title:'Revenue by Product',field:'amount',   aggregation:'sum',   groupBy:'product', chartType:'bar'     } },
  { type:'line',    label:'Line Chart',   desc:'Trends over time',   defaultW:6, defaultH:5, minW:3, minH:3, config:{ title:'Order Trend',       field:'amount',   aggregation:'sum',   groupBy:'product', chartType:'line'    } },
  { type:'area',    label:'Area Chart',   desc:'Volume over time',   defaultW:6, defaultH:5, minW:3, minH:3, config:{ title:'Quantity Trend',    field:'quantity', aggregation:'sum',   groupBy:'product', chartType:'area'    } },
  { type:'scatter', label:'Scatter Plot', desc:'Distribution',       defaultW:6, defaultH:5, minW:3, minH:3, config:{ title:'Amount Distribution',field:'amount',  aggregation:'sum',   groupBy:'product', chartType:'scatter' } },
  { type:'pie',     label:'Pie Chart',    desc:'Share breakdown',    defaultW:5, defaultH:5, minW:3, minH:3, config:{ title:'Revenue Share',     field:'amount',   aggregation:'sum',   groupBy:'product', chartType:'pie'     } },
];

const ICONS = {
  kpi:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><rect x="2" y="7" width="20" height="14" rx="2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  bar:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
  line:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><polyline points="22 12 18 8 13 13 9 9 2 16"/></svg>,
  area:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><path d="M2 20 L6 14 L10 16 L14 8 L18 12 L22 6 L22 20 Z" fill="rgba(45,106,79,.15)"/></svg>,
  scatter: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><circle cx="7" cy="17" r="1.5" fill="currentColor"/><circle cx="12" cy="10" r="1.5" fill="currentColor"/><circle cx="17" cy="14" r="1.5" fill="currentColor"/><line x1="2" y1="20" x2="22" y2="20"/><line x1="2" y1="4" x2="2" y2="20"/></svg>,
  pie:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/></svg>,
};

export default function BuilderPage() {
  const navigate  = useNavigate();
  const toast     = useToast();
  const [widgets, setWidgets] = useState([]);   // { id, type, layout:{x,y,w,h,minW,minH}, config:{...} }
  const [layouts, setLayouts] = useState([]);   // react-grid-layout layout array
  const [saving,  setSaving]  = useState(false);
  const [products,setProducts]= useState([]);
  const [filters, setFilters] = useState({ status:'', days:'', product:'' });
  const [applied, setApplied] = useState({ status:'', days:'', product:'' });
  const [width,   setWidth]   = useState(900);
  const canvasRef = useRef(null);

  // Measure canvas width accurately
  useEffect(() => {
    const measure = () => { if(canvasRef.current) setWidth(canvasRef.current.offsetWidth - 2); };
    measure();
    const ro = new ResizeObserver(measure);
    if(canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [db, prods] = await Promise.all([dashboardAPI.load('admin'), analyticsAPI.getProds()]);
        if (db.data?.widgets?.length) {
          const ws = db.data.widgets;
          setWidgets(ws);
          setLayouts(ws.map(w => ({ i:w.id, x:w.layout.x, y:w.layout.y, w:w.layout.w, h:w.layout.h, minW:w.layout.minW||2, minH:w.layout.minH||2 })));
        }
        setProducts(prods.data || []);
      } catch {}
    })();
  }, []);

  // Find next available Y position
  const nextY = useCallback(() => {
    if (!layouts.length) return 0;
    return Math.max(...layouts.map(l => l.y + l.h));
  }, [layouts]);

  const addWidget = useCallback((p) => {
    const id  = uuidv4();
    const y   = nextY();
    const lay = { i:id, x:0, y, w:p.defaultW, h:p.defaultH, minW:p.minW, minH:p.minH };
    const wid = { id, type:p.type, layout:{ x:0, y, w:p.defaultW, h:p.defaultH, minW:p.minW, minH:p.minH }, config:{ ...p.config } };
    // Critical: update BOTH together synchronously
    setLayouts(prev => [...prev, lay]);
    setWidgets(prev => [...prev, wid]);
    toast.success(`✓ ${p.label} added to canvas`);
  }, [nextY, toast]);

  const removeWidget = useCallback((id) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    setLayouts(prev => prev.filter(l => l.i !== id));
  }, []);

  const onLayoutChange = useCallback((newLayout) => {
    setLayouts(newLayout);
setWidgets(prev => (prev || []).map(w => {
        const l = newLayout.find(n => n.i === w.id);
      if (!l) return w;
      return { ...w, layout: { ...w.layout, x:l.x, y:l.y, w:l.w, h:l.h } };
    }));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await dashboardAPI.save({ userId:'admin', widgets });
      toast.success('Dashboard saved!');
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (e) { toast.error('Save failed: ' + e.message); }
    finally { setSaving(false); }
  };

  const applyFilters = () => setApplied({ ...filters });
  const clearFilters = () => { setFilters({status:'',days:'',product:''}); setApplied({status:'',days:'',product:''}); };

  const F = ({ label, children }) => (
    <div>
      <label style={{ display:'block', fontSize:'.68rem', fontWeight:600, color:'#7d7460', marginBottom:4 }}>{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>

      {/* ── Left Panel ─────────────────────────────────────────── */}
      <aside style={{ width:220, flexShrink:0, background:'#fff', borderRight:'1px solid #f0ede6', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ padding:'18px 16px', borderBottom:'1px solid #f0ede6' }}>
          <h3 style={{ margin:0, fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontWeight:600 }}>Widget Library</h3>
          <p style={{ margin:'3px 0 0', fontSize:'.75rem', color:'#978f77' }}>Click to add to canvas</p>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:10, display:'flex', flexDirection:'column', gap:8 }}>
          {PALETTE.map(item => (
            <button key={item.type} onClick={() => addWidget(item)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:10, border:'1.5px solid #f0ede6', background:'#fff', cursor:'pointer', textAlign:'left', transition:'all .15s', width:'100%' }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='#2d6a4f'; e.currentTarget.style.background='rgba(45,106,79,.04)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='#f0ede6'; e.currentTarget.style.background='#fff'; }}>
              <div style={{ width:36, height:36, borderRadius:9, background:'#f4f3ef', display:'flex', alignItems:'center', justifyContent:'center', color:'#5a534a', flexShrink:0 }}>{ICONS[item.type]}</div>
              <div>
                <p style={{ margin:0, fontSize:'.85rem', fontWeight:600, color:'#1a1714' }}>{item.label}</p>
                <p style={{ margin:'1px 0 0', fontSize:'.72rem', color:'#978f77' }}>{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
        {/* Tips */}
        <div style={{ padding:'12px 14px', borderTop:'1px solid #f0ede6' }}>
          <div style={{ background:'#f9f8f5', borderRadius:10, padding:'10px 12px' }}>
            <p style={{ margin:'0 0 6px', fontSize:'.72rem', fontWeight:700, color:'#5a534a' }}>💡 Tips</p>
            <p style={{ margin:0, fontSize:'.7rem', color:'#978f77', lineHeight:1.6 }}>• Click widget → appears on canvas<br/>• Drag to reposition<br/>• Drag corner to resize<br/>• Hover → ⚙ settings · 🗑 delete</p>
          </div>
        </div>
      </aside>

      {/* ── Main canvas ─────────────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Toolbar */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 18px', background:'#fff', borderBottom:'1px solid #f0ede6', flexShrink:0, flexWrap:'wrap' }}>
          <button className="btn btn-ghost" style={{ padding:'6px 10px' }} onClick={() => navigate('/dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back
          </button>
          <div style={{ width:1, height:20, background:'#f0ede6' }}/>
          <h2 style={{ margin:0, fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', fontWeight:600, flexShrink:0 }}>Dashboard Builder</h2>

          {/* Filters */}
          <div style={{ display:'flex', gap:10, flex:1, justifyContent:'center', flexWrap:'wrap' }}>
            <F label="Status">
              <select value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value}))} className="field" style={{ padding:'5px 8px', fontSize:'.78rem', minWidth:120 }}>
                <option value="">All Statuses</option>
                {STATUSES.map(s=><option key={s} value={s}>{cap(s)}</option>)}
              </select>
            </F>
            <F label="Period">
              <select value={filters.days} onChange={e=>setFilters(f=>({...f,days:e.target.value}))} className="field" style={{ padding:'5px 8px', fontSize:'.78rem', minWidth:110 }}>
                <option value="">All Time</option>
                <option value="1">Today</option>
                <option value="7">Last 7 Days</option>
                <option value="14">Last 14 Days</option>
                <option value="30">Last 30 Days</option>
              </select>
            </F>
            <F label="Product">
              <select value={filters.product} onChange={e=>setFilters(f=>({...f,product:e.target.value}))} className="field" style={{ padding:'5px 8px', fontSize:'.78rem', minWidth:130 }}>
                <option value="">All Products</option>
{(products || []).map(p => (
  <option key={p} value={p}>{p}</option>
))}              </select>
            </F>
            <div style={{ paddingTop:17 }}>
              <button className="btn btn-primary" style={{ padding:'5px 12px', fontSize:'.78rem' }} onClick={applyFilters}>Apply</button>
            </div>
          </div>

          <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
            <span style={{ fontSize:'.8rem', color:'#978f77' }}>{widgets.length} widget{widgets.length!==1?'s':''}</span>
            {widgets.length>0 && <button className="btn btn-ghost" style={{ padding:'5px 10px', fontSize:'.78rem', color:'#dc2626' }} onClick={()=>{ setWidgets([]); setLayouts([]); }}>Clear all</button>}
            <button className="btn btn-primary" onClick={save} disabled={saving} style={{ padding:'7px 16px' }}>
              {saving ? 'Saving…' : (
                <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save Dashboard</>
              )}
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex:1, overflowY:'auto', background:'#edecea', padding:16 }} ref={canvasRef}>
          {/* Empty state */}
          {widgets.length === 0 && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400, height:'100%' }}>
              <div style={{ border:'2px dashed #d6d2c6', borderRadius:16, padding:'60px 40px', background:'rgba(255,255,255,.5)', maxWidth:400, width:'100%', textAlign:'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#b8b29e" strokeWidth="1" width="48" height="48" style={{ display:'block', margin:'0 auto 16px' }}>
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M17.5 14v7M14 17.5h7"/>
                </svg>
                <p style={{ margin:'0 0 6px', fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', color:'#5a534a' }}>Canvas is empty</p>
                <p style={{ margin:0, fontSize:'.85rem', color:'#978f77' }}>Click any widget in the left panel to add it here</p>
              </div>
            </div>
          )}

          {/* Grid — always mounted, shown when widgets exist */}
          <div style={{ display: widgets.length === 0 ? 'none' : 'block' }}>
            <GridLayout
              layout={layouts}
              cols={12}
              rowHeight={80}
              width={width}
              onLayoutChange={onLayoutChange}
              isDraggable={true}
              isResizable={true}
              margin={[14, 14]}
              containerPadding={[0, 0]}
              compactType="vertical"
              preventCollision={false}
            >
{(widgets || []).map(w => (
                  <div key={w.id} style={{ borderRadius:12, overflow:'visible' }}>
                  <div className="widget-card" style={{ height:'100%' }}>
                    {/* Delete button — always visible in builder */}
                    <button
                      onClick={() => removeWidget(w.id)}
                      title="Remove widget"
                      style={{ position:'absolute', top:6, left:8, zIndex:30, width:22, height:22, borderRadius:6, background:'rgba(220,38,38,.85)', border:'none', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity .15s' }}
                      onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='0'}
                      className="widget-del-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                    <WidgetChart widget={w} filters={applied} isBuilder={true}/>
                  </div>
                </div>
              ))}
            </GridLayout>
          </div>
        </div>
      </div>
    </div>
  );
}
