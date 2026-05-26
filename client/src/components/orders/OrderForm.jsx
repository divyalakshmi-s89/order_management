import React, { useState, useEffect } from 'react';
import { STATUSES, cap } from '../../utils/format';

const EMPTY = { customerName: '', product: '', amount: '', quantity: '', status: 'pending' };

const LBL = { fontSize: '.75rem', fontWeight: 600, color: '#7d7460', display: 'block', marginBottom: 6 };
const ERR = { margin: '4px 0 0', fontSize: '.75rem', color: '#ef4444' };

export default function OrderForm({ initial, onSubmit, onCancel, loading }) {
  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});

  // Populate from row data instantly — no API call
  useEffect(() => {
    setForm(initial
      ? { customerName: initial.customerName || '', product: initial.product || '',
          amount: initial.amount ?? '', quantity: initial.quantity ?? '', status: initial.status || 'pending' }
      : EMPTY
    );
    setErrors({});
  }, [initial]);

  // Single handler — stable reference, no child component re-creation
  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = 'This field is required';
    if (!form.product.trim())       e.product      = 'This field is required';
    if (form.amount === '' || isNaN(+form.amount)) e.amount = 'This field is required';
    else if (+form.amount < 0)                     e.amount = 'Must be ≥ 0';
    if (form.quantity === '' || isNaN(+form.quantity)) e.quantity = 'This field is required';
    else if (+form.quantity < 1)                       e.quantity = 'Must be ≥ 1';
    return e;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({
      customerName: form.customerName.trim(),
      product:      form.product.trim(),
      amount:       +form.amount,
      quantity:     +form.quantity,
      status:       form.status,
    });
  };

  // ── All inputs inlined directly — NO helper component defined inside render.
  // Defining a component (const F = ...) inside a parent causes React to treat
  // it as a brand-new component type on every render, unmounting + remounting
  // the <input> and losing focus after every keystroke.
  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Customer Name */}
        <div>
          <label style={LBL}>Customer Name *</label>
          <input
            type="text"
            value={form.customerName}
            onChange={e => set('customerName', e.target.value)}
            placeholder="e.g. Alice Johnson"
            className={'field' + (errors.customerName ? ' field-error' : '')}
          />
          {errors.customerName && <p style={ERR}>⚠ {errors.customerName}</p>}
        </div>

        {/* Product */}
        <div>
          <label style={LBL}>Product *</label>
          <input
            type="text"
            value={form.product}
            onChange={e => set('product', e.target.value)}
            placeholder="e.g. Laptop Pro 15"
            className={'field' + (errors.product ? ' field-error' : '')}
          />
          {errors.product && <p style={ERR}>⚠ {errors.product}</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Amount */}
        <div>
          <label style={LBL}>Amount ($) *</label>
          <input
            type="number"
            value={form.amount}
            onChange={e => set('amount', e.target.value)}
            placeholder="e.g. 1200"
            className={'field' + (errors.amount ? ' field-error' : '')}
          />
          {errors.amount && <p style={ERR}>⚠ {errors.amount}</p>}
        </div>

        {/* Quantity */}
        <div>
          <label style={LBL}>Quantity *</label>
          <input
            type="number"
            value={form.quantity}
            onChange={e => set('quantity', e.target.value)}
            placeholder="e.g. 2"
            className={'field' + (errors.quantity ? ' field-error' : '')}
          />
          {errors.quantity && <p style={ERR}>⚠ {errors.quantity}</p>}
        </div>
      </div>

      {/* Status */}
      <div style={{ marginBottom: 20 }}>
        <label style={LBL}>Status</label>
        <select value={form.status} onChange={e => set('status', e.target.value)} className="field">
          {STATUSES.map(s => <option key={s} value={s}>{cap(s)}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
          {loading ? 'Saving…' : initial ? 'Update Order' : 'Create Order'}
        </button>
      </div>
    </form>
  );
}
