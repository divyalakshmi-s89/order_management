export const fmt$  = v => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(v||0);
export const fmtN  = v => new Intl.NumberFormat('en-US').format(v||0);
export const fmtD  = s => s ? new Date(s).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) : '—';
export const fmtDT = s => s ? new Date(s).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
export const cap   = s => s ? s[0].toUpperCase()+s.slice(1) : '';

export const STATUSES=['pending','processing','shipped','delivered','cancelled'];
export const CHART_COLORS=['#2d6a4f','#d97706','#7c3aed','#b45309','#0f766e','#9f1239','#1d4ed8','#065f46'];

export const STATUS_STYLE={
  pending:   {badge:'badge-pending',   dot:'badge-dot-pending'},
  processing:{badge:'badge-processing',dot:'badge-dot-processing'},
  shipped:   {badge:'badge-shipped',   dot:'badge-dot-shipped'},
  delivered: {badge:'badge-delivered', dot:'badge-dot-delivered'},
  cancelled: {badge:'badge-cancelled', dot:'badge-dot-cancelled'},
};

export function aggregate(orders,field,type,groupBy){
  if(!orders||!orders.length) return [];
  if(groupBy==='none'){
    if(type==='count') return [{name:'Total',value:orders.length}];
    const total=orders.reduce((s,o)=>s+(+o[field]||0),0);
    const val=type==='sum'?total:total/(orders.length||1);
    return [{name:'Total',value:Math.round(val*100)/100}];
  }
  const groups={};
  orders.forEach(o=>{ const k=o[groupBy]||'Unknown'; (groups[k]=groups[k]||[]).push(o); });
  return Object.entries(groups).map(([k,rows])=>{
    const total=rows.reduce((s,r)=>s+(+r[field]||0),0);
    const val=type==='count'?rows.length:type==='sum'?total:total/(rows.length||1);
    return {name:k,value:Math.round(val*100)/100};
  }).sort((a,b)=>b.value-a.value).slice(0,20);
}
