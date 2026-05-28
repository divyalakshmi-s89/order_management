import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  ScatterChart, Scatter, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { analyticsAPI } from '../../api';
import { fmt$, fmtN, CHART_COLORS } from '../../utils/format';

// ─────────────────────────────────────────────────────────────
// Chart styling constants
// ─────────────────────────────────────────────────────────────
const AXIS = {
  tick: { fill: '#978f77', fontSize: 11, fontFamily: "'DM Sans',sans-serif" },
  axisLine: { stroke: '#f0ede6' },
  tickLine: false,
};
const GRID = { strokeDasharray: '3 3', stroke: '#f0ede6', vertical: false };

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  return (
    <div style={{ background:'#1a1714', borderRadius:8, padding:'8px 12px', fontSize:12, fontFamily:"'DM Sans',sans-serif" }}>
      {label && <p style={{ margin:'0 0 4px', color:'#d6d2c6' }}>{label}</p>}
      <p style={{ margin:0, color:CHART_COLORS[0], fontWeight:600 }}>
        {typeof v === 'number' && v > 100 ? fmt$(v) : fmtN(v)}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Settings Panel — rendered via React Portal into document.body
// so it is NEVER clipped by any parent overflow or z-index.
// Defined OUTSIDE the main component so React never remounts it.
// ─────────────────────────────────────────────────────────────
function SettingsPanel({ config, widgetType, anchorEl, onApply, onClose }) {
  const [local, setLocal] = useState({ ...config });
  const panelRef = useRef(null);
  const [pos, setPos] = useState({ top: 100, left: 100 });

  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }));

  // Position the panel next to the trigger button
  useEffect(() => {
    if (!anchorEl) return;
    const rect   = anchorEl.getBoundingClientRect();
    const pW     = 270;
    const viewW  = window.innerWidth;
    let left = rect.right + 10;
    if (left + pW > viewW - 10) left = rect.left - pW - 10;
    const top = Math.max(10, Math.min(rect.top, window.innerHeight - 520));
    setPos({ top, left });
  }, [anchorEl]);

  // Close on outside click
  useEffect(() => {
    const handle = e => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handle), 50);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', handle); };
  }, [onClose]);

  const Seg = ({ label, fieldKey, options }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'#7d7460', marginBottom:7, textTransform:'uppercase', letterSpacing:'.06em' }}>
        {label}
      </label>
      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
        {options.map(o => (
          <button
            key={o.v}
            onClick={() => set(fieldKey, o.v)}
            style={{
              padding:'6px 13px', borderRadius:8, border:'1.5px solid',
              borderColor: local[fieldKey] === o.v ? '#2d6a4f' : '#e5e0d8',
              background:  local[fieldKey] === o.v ? '#2d6a4f' : '#fff',
              color:       local[fieldKey] === o.v ? '#fff' : '#5a534a',
              fontSize:'.8rem', fontWeight:600, fontFamily:"'DM Sans',sans-serif",
              cursor:'pointer', transition:'all .13s',
            }}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );

  const panel = (
    <div
      ref={panelRef}
      onMouseDown={e => e.stopPropagation()}
      className="anim-scaleIn"
      style={{
        position:'fixed', top: pos.top, left: pos.left,
        zIndex: 99999, width: 270,
        background:'#fff', borderRadius:14,
        boxShadow:'0 12px 48px rgba(0,0,0,.22)',
        border:'1px solid #e5e0d8',
        padding:'18px 18px 16px',
        fontFamily:"'DM Sans',sans-serif",
        maxHeight:'92vh', overflowY:'auto',
      }}
    >
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <p style={{ margin:0, fontSize:'.9rem', fontWeight:700, fontFamily:"'Playfair Display',serif", color:'#1a1714' }}>
          Widget Settings
        </p>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#978f77', display:'flex', padding:2 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Title */}
      <div style={{ marginBottom:16 }}>
        <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'#7d7460', marginBottom:7, textTransform:'uppercase', letterSpacing:'.06em' }}>
          Widget Title
        </label>
        <input
          value={local.title || ''}
          onChange={e => set('title', e.target.value)}
          placeholder="e.g. Total Revenue"
          className="field"
          style={{ padding:'8px 12px', fontSize:'.85rem' }}
        />
      </div>

      {/* Chart type — only for non-KPI */}
      {widgetType !== 'kpi' && (
        <Seg label="Chart Type" fieldKey="chartType" options={[
          { v:'bar',     l:'Bar'     },
          { v:'line',    l:'Line'    },
          { v:'area',    l:'Area'    },
          { v:'scatter', l:'Scatter' },
          { v:'pie',     l:'Pie'     },
        ]}/>
      )}

      {/* Data Field */}
      <Seg label="Data Field" fieldKey="field" options={[
        { v:'amount',   l:'Amount ($)' },
        { v:'quantity', l:'Quantity'   },
      ]}/>

      {/* Aggregation */}
      <Seg label="Aggregation" fieldKey="aggregation" options={[
        { v:'sum',   l:'Sum'     },
        { v:'avg',   l:'Average' },
        { v:'count', l:'Count'   },
      ]}/>

      {/* Group By */}
      <Seg label="Group By" fieldKey="groupBy" options={[
        { v:'product',      l:'Product'  },
        { v:'customerName', l:'Customer' },
        { v:'status',       l:'Status'   },
        { v:'none',         l:'Total'    },
      ]}/>

      {/* Actions */}
      <div style={{ display:'flex', gap:8, marginTop:6 }}>
        <button className="btn btn-secondary" onClick={onClose}
          style={{ flex:1, padding:'8px 10px', fontSize:'.82rem' }}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={() => onApply(local)}
          style={{ flex:1, padding:'8px 10px', fontSize:'.82rem' }}>
          ✓ Apply
        </button>
      </div>
    </div>
  );

  return ReactDOM.createPortal(panel, document.body);
}

// ─────────────────────────────────────────────────────────────
// Hover controls — defined OUTSIDE main component so React
// never treats them as a new component type on re-render.
// ─────────────────────────────────────────────────────────────
function WidgetControls({ onRefresh, onSettings, settingsOpen, settingsBtnRef }) {
  return (
    <div
      className="widget-controls"
      style={{ position:'absolute', top:7, right:7, zIndex:20, display:'flex', gap:4 }}
    >
      <button
        onClick={e => { e.stopPropagation(); onRefresh(); }}
        title="Refresh data"
        style={{ width:26, height:26, borderRadius:7, background:'rgba(26,23,20,.78)', border:'none', cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
        </svg>
      </button>
      <button
        ref={settingsBtnRef}
        onClick={e => { e.stopPropagation(); onSettings(); }}
        title="Widget settings"
        style={{
          width:26, height:26, borderRadius:7, border:'none', cursor:'pointer', color:'#fff',
          display:'flex', alignItems:'center', justifyContent:'center', transition:'background .13s',
          background: settingsOpen ? '#2d6a4f' : 'rgba(26,23,20,.78)',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main exported widget component
// ─────────────────────────────────────────────────────────────
export default function WidgetChart({ widget, filters, isBuilder }) {
  const [data,         setData]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [updatedAt,    setUA]           = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [localConfig,  setLocalConfig]  = useState({ ...widget.config });

  // KEY FIX: store config in a ref so fetchData always reads
  // the LATEST config without needing to be in useCallback deps.
  // This eliminates the stale closure problem entirely.
  const configRef  = useRef({ ...widget.config });
  const filtersRef = useRef(filters);
  const settingsBtnRef = useRef(null);
  const timerRef       = useRef(null);

  // Keep refs in sync
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  const { type } = widget;

  // fetchData reads from refs — always fresh, no stale closure
  const fetchData = useCallback(async (overrideCfg, overrideFlt) => {
    const cfg = overrideCfg || configRef.current;
    const flt = overrideFlt || filtersRef.current;
    setLoading(true);
    try {
      const params = {
        field:   cfg.field       || 'amount',
        type:    cfg.aggregation || 'sum',
        groupBy: cfg.groupBy     || 'product',
        ...(flt?.status  ? { status:  flt.status  } : {}),
        ...(flt?.days    ? { days:    flt.days    } : {}),
        ...(flt?.product ? { product: flt.product } : {}),
      };
      const res = await analyticsAPI.getData(params);
      setData(res.data || []);
      setUA(new Date());
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []); // ← empty deps: fetchData is stable forever, reads from refs

  // Initial load
  useEffect(() => { fetchData(); }, [fetchData]);

  // Re-fetch when filters change
  useEffect(() => {
    filtersRef.current = filters;
    fetchData();
  }, [filters, fetchData]);

  // Auto-refresh every 30s — always uses latest ref values
  useEffect(() => {
    timerRef.current = setInterval(() => fetchData(), 30000);
    return () => clearInterval(timerRef.current);
  }, [fetchData]);

  // Apply settings: update ref + state + re-fetch immediately
  const applySettings = useCallback((newCfg) => {
    configRef.current = newCfg;          // update ref first (sync)
    widget.config     = { ...newCfg };   // keep widget object in sync
    setLocalConfig(newCfg);              // trigger re-render
    setSettingsOpen(false);
    fetchData(newCfg, filtersRef.current); // fetch with new cfg explicitly
  }, [fetchData, widget]);

const chartData = (data || []).map(d => ({
  name: d._id ?? d.name ?? 'Unknown',
  value: d.value ?? 0
}));
  const chartType = localConfig.chartType || type;

  // ── KPI Card ────────────────────────────────────────────────
  if (type === 'kpi') {
    const val     = chartData[0]?.value ?? 0;
    const display = localConfig.field === 'amount' && localConfig.aggregation !== 'count'
      ? fmt$(val) : fmtN(val);
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column', padding:'16px 18px', position:'relative' }}>
        {isBuilder && (
          <WidgetControls
            onRefresh={() => fetchData()}
            onSettings={() => setSettingsOpen(o => !o)}
            settingsOpen={settingsOpen}
            settingsBtnRef={settingsBtnRef}
          />
        )}
        {settingsOpen && (
          <SettingsPanel
            config={localConfig}
            widgetType={type}
            anchorEl={settingsBtnRef.current}
            onApply={applySettings}
            onClose={() => setSettingsOpen(false)}
          />
        )}

        {/* Label row */}
        <p style={{ margin:'0 0 8px', fontSize:'.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'#978f77' }}>
          {localConfig.title || 'KPI'}
        </p>

        {/* Big number */}
        {loading
          ? <div className="skeleton" style={{ height:52, width:'65%', borderRadius:8 }}/>
          : <p style={{ margin:'0 0 auto', fontFamily:"'Playfair Display',serif", fontSize:'2.5rem', fontWeight:700, color:'#1a1714', lineHeight:1.1 }}>
              {display}
            </p>
        }

        {/* Footer meta */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:12 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'rgba(45,106,79,.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2" width="14" height="14">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <span style={{ fontSize:'.72rem', color:'#b8b29e' }}>
            {(localConfig.aggregation || 'sum').toUpperCase()} of {localConfig.field}
            {localConfig.groupBy !== 'none' && ` · by ${localConfig.groupBy}`}
          </span>
          {updatedAt && (
            <span style={{ fontSize:'.7rem', color:'#d6d2c6', marginLeft:'auto' }}>
              ↻ {updatedAt.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ── Chart widgets ────────────────────────────────────────────
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', position:'relative' }}>
      {isBuilder && (
        <WidgetControls
          onRefresh={() => fetchData()}
          onSettings={() => setSettingsOpen(o => !o)}
          settingsOpen={settingsOpen}
          settingsBtnRef={settingsBtnRef}
        />
      )}
      {settingsOpen && (
        <SettingsPanel
          config={localConfig}
          widgetType={type}
          anchorEl={settingsBtnRef.current}
          onApply={applySettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {/* Header */}
      <div style={{ padding:'12px 16px 4px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <p style={{ margin:0, fontSize:'.78rem', fontWeight:700, color:'#5a534a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {localConfig.title || 'Chart'}
        </p>
        <span style={{ fontSize:'.68rem', color:'#b8b29e', flexShrink:0, marginLeft:8 }}>
          {(localConfig.aggregation||'sum').toUpperCase()}
          {localConfig.groupBy !== 'none' ? ` · ${localConfig.groupBy}` : ' · total'}
          {updatedAt && ` · ↻ ${updatedAt.toLocaleTimeString()}`}
        </span>
      </div>

      {/* Chart area */}
      <div style={{ flex:1, minHeight:0, padding:'0 6px 8px', overflow:'hidden' }}>
        {loading
          ? <div className="skeleton" style={{ height:'100%', borderRadius:10 }}/>
          : !chartData.length
            ? <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#b8b29e', fontSize:'.82rem' }}>
                No data
              </div>
            : <ChartRenderer type={chartType} data={chartData} />
        }
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Pure chart renderer — no state, just props → JSX
// Also defined outside to avoid remounting on parent re-render
// ─────────────────────────────────────────────────────────────
function ChartRenderer({ type, data }) {
  const margin = { top:6, right:14, left:0, bottom:6 };
  const names  = (data || []).map(d => d.name);
  const tickFontSize = names.length > 7 ? 9 : 11;

  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data} dataKey="value" nameKey="name"
            cx="50%" cy="48%" outerRadius="65%" innerRadius="32%"
            paddingAngle={2}
          >
            {(data || []).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]}/>)}
          </Pie>
          <Tooltip
            formatter={v => [typeof v === 'number' && v > 100 ? fmt$(v) : fmtN(v)]}
            contentStyle={{ background:'#1a1714', border:'none', borderRadius:8, color:'#fff', fontSize:12 }}
          />
          <Legend iconSize={10} wrapperStyle={{ fontSize:11, fontFamily:"'DM Sans',sans-serif" }}/>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'scatter') {
    const sd = (data || []).map((d, i) => ({ x: i + 1, y: d.value, name: d.name }));
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={margin}>
          <CartesianGrid {...GRID}/>
          <XAxis dataKey="x" type="number" {...AXIS}/>
          <YAxis dataKey="y" type="number" {...AXIS}/>
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]?.payload;
            return (
              <div style={{ background:'#1a1714', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#fff' }}>
                <p style={{ margin:0, color:'#d6d2c6' }}>{d?.name}</p>
                <p style={{ margin:'4px 0 0', color:CHART_COLORS[0], fontWeight:600 }}>{fmtN(d?.y)}</p>
              </div>
            );
          }}/>
          <Scatter data={sd} fill={CHART_COLORS[0]} opacity={0.85}/>
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  const isArea = type === 'area';
  const isLine = type === 'line' || isArea;

  if (isLine) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={margin}>
          <defs>
            <linearGradient id={`lg-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={CHART_COLORS[0]} stopOpacity={isArea ? .16 : 0}/>
              <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid {...GRID}/>
          <XAxis dataKey="name" {...AXIS} tick={{ ...AXIS.tick, fontSize: tickFontSize }}/>
          <YAxis {...AXIS}/>
          <Tooltip content={<ChartTooltip/>}/>
          <Area
            type="monotone" dataKey="value"
            stroke={CHART_COLORS[0]} strokeWidth={2.5}
            fill={`url(#lg-${type})`}
            dot={{ fill:CHART_COLORS[0], r:4 }}
            activeDot={{ r:6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Default: Bar chart
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={margin}>
        <CartesianGrid {...GRID}/>
        <XAxis dataKey="name" {...AXIS} tick={{ ...AXIS.tick, fontSize: tickFontSize }}/>
        <YAxis {...AXIS}/>
        <Tooltip content={<ChartTooltip/>}/>
        <Bar dataKey="value" radius={[5,5,0,0]}>
          {(data || []).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
