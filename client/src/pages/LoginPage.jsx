import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export default function LoginPage() {
  const { login, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const toast    = useToast();
  const [form,   setForm]   = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [err,    setErr]    = useState('');
  const [loading,setLoading]= useState(false);
  const [showPwd,setShowPwd]= useState(false);

  if (isLoggedIn) { navigate('/dashboard'); return null; }

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); setErr(''); };

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'This field is required';
    if (!form.password) e.password = 'This field is required';
    return e;
  };

  const handleSubmit = async ev => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      login(form.email, form.password);
      toast.success('Welcome back, Admin!');
      navigate('/dashboard');
    } catch (ex) {
      setErr(ex.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      {/* Background blobs */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:80, left:80, width:320, height:320, borderRadius:'50%', background:'rgba(45,106,79,.12)', filter:'blur(80px)' }}/>
        <div style={{ position:'absolute', bottom:80, right:80, width:400, height:400, borderRadius:'50%', background:'rgba(217,119,6,.08)', filter:'blur(80px)' }}/>
      </div>

      <div style={{ position:'relative', width:'100%', maxWidth:420 }}>
        <div className="card anim-scaleIn" style={{ overflow:'hidden' }}>
          {/* accent bar */}
          <div style={{ height:4, background:'linear-gradient(90deg,#2d6a4f,#52b788,#d97706)' }}/>
          <div style={{ padding:'32px 32px 28px' }}>
            {/* Logo */}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'#141210', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm13 0a4 4 0 100 8 4 4 0 000-8z"/></svg>
              </div>
              <div>
                <h2 style={{ margin:0, fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', fontWeight:700, color:'#1a1714' }}>Orderflow</h2>
                <p style={{ margin:0, fontSize:'.75rem', color:'#978f77' }}>Dashboard & Order Management</p>
              </div>
            </div>

            <h3 style={{ margin:'0 0 4px', fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', fontWeight:600 }}>Welcome back</h3>
            <p style={{ margin:'0 0 22px', fontSize:'.87rem', color:'#978f77' }}>Sign in to continue</p>

            {err && (
              <div style={{ marginBottom:16, padding:'10px 14px', background:'#fef2f2', border:'1.5px solid #fecaca', borderRadius:10, display:'flex', alignItems:'center', gap:8, fontSize:'.85rem', color:'#991b1b' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {err}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:'.75rem', fontWeight:600, color:'#7d7460', marginBottom:6 }}>Email address</label>
                <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="admin@orderflow.com" className={'field'+(errors.email?' field-error':'')} style={{ fontSize:'.9rem' }}/>
                {errors.email && <p style={{ margin:'4px 0 0', fontSize:'.75rem', color:'#ef4444' }}>⚠ {errors.email}</p>}
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:'.75rem', fontWeight:600, color:'#7d7460', marginBottom:6 }}>Password</label>
                <div style={{ position:'relative' }}>
                  <input type={showPwd?'text':'password'} value={form.password} onChange={e=>set('password',e.target.value)} placeholder="••••••••" className={'field'+(errors.password?' field-error':'')} style={{ paddingRight:44, fontSize:'.9rem' }}/>
                  <button type="button" onClick={()=>setShowPwd(s=>!s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#978f77', display:'flex', padding:2 }}>
                    {showPwd
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
                {errors.password && <p style={{ margin:'4px 0 0', fontSize:'.75rem', color:'#ef4444' }}>⚠ {errors.password}</p>}
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width:'100%', justifyContent:'center', padding:'11px', fontSize:'.92rem' }}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>

            {/* Demo hint */}
            <div style={{ marginTop:20, padding:'12px 14px', background:'#f4f3ef', borderRadius:10, border:'1px solid #ece9e1' }}>
              <p style={{ margin:'0 0 8px', fontSize:'.75rem', fontWeight:700, color:'#5a534a' }}>Demo Credentials</p>
              <button onClick={()=>{set('email','admin@orderflow.com');setForm(f=>({...f,password:'admin123'}));}}
                style={{ width:'100%', padding:'7px 12px', background:'#fff', border:'1.5px solid #e5e0d8', borderRadius:8, cursor:'pointer', fontSize:'.8rem', fontWeight:600, color:'#3b3530', display:'flex', alignItems:'center', gap:6 }}>
                <span>👤</span> admin@orderflow.com / admin123
              </button>
            </div>
          </div>
        </div>
        <p style={{ textAlign:'center', color:'rgba(255,255,255,.2)', fontSize:'.75rem', marginTop:20 }}>Orderflow v1.0 © 2026</p>
      </div>
    </div>
  );
}
