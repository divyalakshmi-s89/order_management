import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GridLayout from 'react-grid-layout';
import { dashboardAPI, analyticsAPI, ordersAPI } from '../api';
import { useToast } from '../hooks/useToast';
import { fmt$, fmtN, STATUSES, cap, aggregate } from '../utils/format';
import { exportDashboard } from '../utils/csv';
import WidgetChart from '../components/dashboard/WidgetChart';

export default function DashboardPage() {
  const navigate = useNavigate();
  const toast    = useToast();
  const [widgets,  setWidgets]  = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [products, setProducts] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [width,    setWidth]    = useState(1000);
  const [filters,  setFilters]  = useState({ status:'', days:'', product:'' });
  const [applied,  setApplied]  = useState({ status:'', days:'', product:'' });
  const canvasRef = useRef(null);
  const tickRef   = useRef(null);

  // Measure container width
  useEffect(() => {
    const measure = () => { if(canvasRef.current) setWidth(canvasRef.current.offsetWidth - 2); };
    measure();
    const ro = new ResizeObserver(measure);
    if(canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

  const load = useCallback(async () => {
    try {
      const [db, ord, prods] = await Promise.all([
        dashboardAPI.load('admin'),
        ordersAPI.getAll(),
        analyticsAPI.getProds()
      ]);
      if (db.data?.widgets) setWidgets(db.data.widgets);
      setOrders(ord.data || []);
      setProducts(prods.data || []);
      setLastSync(new Date());
    } catch (e) { toast.error(e.message); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30s
  useEffect(() => {
    tickRef.current = setInterval(load, 30000);
    return () => clearInterval(tickRef.current);
  }, [load]);

  const applyFilters = () => setApplied({ ...filters });
  const clearFilters = () => { setFilters({status:'',days:'',product:''}); setApplied({status:'',days:'',product:''}); };
const readonlyLayout = (widgets || []).map(w => ({ i:w.id, x:w.layout.x, y:w.layout.y, w:w.layout.w, h:w.layout.h, static:true }));

  const doExport = () => {
const rows = (widgets || []).map(w => {      const d = aggregate(orders, w.config.field, w.config.aggregation, w.config.groupBy);
      return { title:w.config.title||w.type, type:w.type, field:w.config.field, aggregation:w.config.aggregation, groupBy:w.config.groupBy, value:(d || []).map(r=>`${r.name}: ${r.value}`).join(' | ') };
    });
    exportDashboard(rows);
    toast.success('Dashboard exported');
  };

  if (loading) return (
    <div style={{ padding:28 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:14 }}>
        {[...Array(4)].map((_,i)=><div key={i} className="skeleton" style={{ height:160, animationDelay:`${i*80}ms` }}/>)}
      </div>
    </div>
  );

  const F = ({ label, children }) => (
    <div>
      <label style={{ display:'block', fontSize:'.72rem', fontWeight:600, color:'#7d7460', marginBottom:5 }}>{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ padding:28, minHeight:'100vh' }} className="anim-fadeUp">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:22 }}>
        <div>
          <h1 style={{ margin:0, fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:700 }}>Dashboard</h1>
          <p style={{ margin:'4px 0 0', fontSize:'.87rem', color:'#978f77' }}>
            Live analytics{lastSync && <> · Refreshed {lastSync.toLocaleTimeString()}</>}
          </p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {widgets.length > 0 && (
            <button className="btn btn-secondary" onClick={doExport}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </button>
          )}
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/builder')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M17.5 14v7M14 17.5h7"/></svg>
            Configure Dashboard
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding:'16px 18px', marginBottom:20 }}>
        <p style={{ margin:'0 0 12px', fontSize:'.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'#978f77' }}>Filter Widget Data</p>
        <div style={{ display:'flex', gap:14, flexWrap:'wrap', alignItems:'flex-end' }}>
          <F label="Status">
            <select value={filters.status} onChange={e=>setFilters(f=>({...f,status:e.target.value}))} className="field" style={{ minWidth:140 }}>
              <option value="">All Statuses</option>
              {STATUSES.map(s=><option key={s} value={s}>{cap(s)}</option>)}
            </select>
          </F>
          <F label="Time Period">
            <select value={filters.days} onChange={e=>setFilters(f=>({...f,days:e.target.value}))} className="field" style={{ minWidth:140 }}>
              <option value="">All Time</option>
              <option value="1">Today</option>
              <option value="7">Last 7 Days</option>
              <option value="14">Last 14 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </F>
          <F label="Product">
            <select value={filters.product} onChange={e=>setFilters(f=>({...f,product:e.target.value}))} className="field" style={{ minWidth:160 }}>
              <option value="">All Products</option>
{(products || []).map(p => (
  <option key={p} value={p}>{p}</option>
))}            </select>
          </F>
          <button className="btn btn-primary" onClick={applyFilters}>Apply Filters</button>
          <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
        </div>
      </div>

      {/* Empty state */}
      {!widgets.length ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 20px', textAlign:'center' }}>
          <div style={{ width:72, height:72, borderRadius:20, background:'#f0ede6', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#b8b29e" strokeWidth="1.2" width="36" height="36"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
          </div>
          <h2 style={{ margin:'0 0 8px', fontFamily:"'Playfair Display',serif", color:'#5a534a' }}>Empty Dashboard</h2>
          <p style={{ margin:'0 0 22px', color:'#978f77', fontSize:'.9rem' }}>Click "Configure Dashboard" to add widgets and start visualizing your data.</p>
          <button className="btn btn-primary" style={{ padding:'12px 24px', fontSize:'1rem' }} onClick={() => navigate('/dashboard/builder')}>
            Configure Dashboard →
          </button>
        </div>
      ) : (
        <div ref={canvasRef}>
          <GridLayout
            layout={readonlyLayout}
            cols={12} rowHeight={80} width={width}
            isDraggable={false} isResizable={false}
            margin={[14, 14]} containerPadding={[0, 0]}
          >
{(widgets || []).map(w => (
                <div key={w.id}>
                <div className="widget-card">
                  <WidgetChart widget={w} filters={applied} isBuilder={false}/>
                </div>
              </div>
            ))}
          </GridLayout>
        </div>
      )}
    </div>
  );
}
