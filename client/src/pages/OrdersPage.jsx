import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ordersAPI } from '../api';
import { useToast } from '../hooks/useToast';
import { fmt$, fmtN, fmtD, STATUSES, cap, aggregate } from '../utils/format';
import { exportOrders } from '../utils/csv';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import OrderForm from '../components/orders/OrderForm';
import OrdersTable from '../components/orders/OrdersTable';

export default function OrdersPage() {
  const toast = useToast();
  const [orders,    setOrders]   = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [formOpen,  setFormOpen] = useState(false);
  const [editRow,   setEditRow]  = useState(null);
  const [delRow,    setDelRow]   = useState(null);
  const [submitting,setSub]      = useState(false);
  const [deleting,  setDel]      = useState(false);
  const [filters,   setFilters]  = useState({ customerName:'', product:'', status:'', days:'' });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try { const r = await ordersAPI.getAll(); setOrders(r.data); }
    catch (e) { toast.error(e.message); }
    finally   { setLoading(false); }
  }, [toast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Unique products from current data
const products = useMemo(
  () => [...new Set((orders || []).map(o => o.product))].sort(),
  [orders]
);
  // Instant computed filtering — no API call
  const filtered = useMemo(() => {
    let r = [...orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (filters.customerName) r = r.filter(o => o.customerName.toLowerCase().includes(filters.customerName.toLowerCase()));
    if (filters.product)      r = r.filter(o => o.product === filters.product);
    if (filters.status)       r = r.filter(o => o.status === filters.status);
    if (filters.days) {
      const since = new Date(); since.setDate(since.getDate() - +filters.days); since.setHours(0,0,0,0);
      r = r.filter(o => new Date(o.createdAt) >= since);
    }
    return r;
  }, [orders, filters]);

  const totalRevenue  = useMemo(() => filtered.reduce((s,o)=>s+o.amount,   0), [filtered]);
  const totalQuantity = useMemo(() => filtered.reduce((s,o)=>s+o.quantity, 0), [filtered]);

  const openCreate = () => { setEditRow(null); setFormOpen(true); };
  // Edit uses row data directly — instant, no fetch
  const openEdit   = o   => { setEditRow({ ...o }); setFormOpen(true); };
  const openDelete = o   => setDelRow(o);

  const handleSubmit = async data => {
    setSub(true);
    try {
      if (editRow) {
        const r = await ordersAPI.update(editRow._id, data);
        setOrders(prev => prev.map(o => o._id === editRow._id ? r.data : o));
        toast.success('Order updated');
      } else {
        const r = await ordersAPI.create(data);
        setOrders(prev => [r.data, ...prev]);
        toast.success('Order created');
      }
      setFormOpen(false);
    } catch (e) { toast.error(e.message); }
    finally { setSub(false); }
  };

  const handleDelete = async () => {
    setDel(true);
    try {
      await ordersAPI.remove(delRow._id);
      setOrders(prev => prev.filter(o => o._id !== delRow._id));
      toast.success('Order deleted');
      setDelRow(null);
    } catch (e) { toast.error(e.message); }
    finally { setDel(false); }
  };

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
          <h1 style={{ margin:0, fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:700 }}>Orders</h1>
          <p style={{ margin:'4px 0 0', fontSize:'.87rem', color:'#978f77' }}>Manage orders · Right-click any row for quick actions</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-secondary" onClick={() => { if (!filtered.length) { toast.info('No orders to export'); return; } exportOrders(filtered.map(o=>({...o,createdAt:fmtD(o.createdAt)}))); toast.success(`Exported ${filtered.length} orders`); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Order
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
        {[
          { label:'Total Orders',   val:fmtN(filtered.length),    icon:'📋' },
          { label:'Total Revenue',  val:fmt$(totalRevenue),        icon:'💰' },
          { label:'Total Quantity', val:fmtN(totalQuantity),       icon:'📦' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:'16px 18px', display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontSize:'1.6rem' }}>{s.icon}</span>
            <div>
              <p style={{ margin:0, fontSize:'.72rem', fontWeight:600, color:'#978f77', textTransform:'uppercase', letterSpacing:'.05em' }}>{s.label}</p>
              <p style={{ margin:'4px 0 0', fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:700, color:'#1a1714' }}>{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding:'16px 18px', marginBottom:18 }}>
        <div style={{ display:'flex', gap:14, flexWrap:'wrap', alignItems:'flex-end' }}>
          <F label="Customer Name">
            <input value={filters.customerName} onChange={e=>setFilters(f=>({...f,customerName:e.target.value}))} placeholder="Search customer…" className="field" style={{ minWidth:150 }}/>
          </F>
          <F label="Product">
            <select value={filters.product} onChange={e=>setFilters(f=>({...f,product:e.target.value}))} className="field" style={{ minWidth:160 }}>
              <option value="">All Products</option>
              {products.map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </F>
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
          <button className="btn btn-secondary" onClick={()=>setFilters({customerName:'',product:'',status:'',days:''})}>Clear Filters</button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', borderBottom:'1px solid #f0ede6' }}>
          <p style={{ margin:0, fontSize:'.85rem', fontWeight:600, color:'#5a534a' }}>
            {filtered.length} {filtered.length===1?'order':'orders'}
            {orders.length !== filtered.length && <span style={{ color:'#b8b29e', fontWeight:400 }}> (of {orders.length} total)</span>}
          </p>
        </div>
        <OrdersTable orders={filtered} loading={loading} onEdit={openEdit} onDelete={openDelete}/>
      </div>

      {/* Create/Edit Modal */}
      <Modal open={formOpen} onClose={()=>setFormOpen(false)} title={editRow ? 'Edit Order' : 'New Order'}>
        <OrderForm initial={editRow} onSubmit={handleSubmit} onCancel={()=>setFormOpen(false)} loading={submitting}/>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!delRow} onClose={()=>setDelRow(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Order"
        message={`Delete the order from "${delRow?.customerName}" for ${delRow?.product}? This cannot be undone.`}
      />
    </div>
  );
}
