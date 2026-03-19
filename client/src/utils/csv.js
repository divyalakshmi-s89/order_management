import Papa from 'papaparse';
export function downloadCSV(data,filename,cols,headers={}){
  if(!data||!data.length) return;
  const rows=data.map(r=>{
    const o={};
    cols.forEach(c=>{ o[headers[c]||c]=r[c]??''; });
    return o;
  });
  const csv=Papa.unparse(rows);
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download=filename;
  a.click();
}
export function exportOrders(rows){
  downloadCSV(rows,'orders-export.csv',
    ['customerName','product','amount','quantity','status','createdAt'],
    {customerName:'Customer',product:'Product',amount:'Amount ($)',quantity:'Qty',status:'Status',createdAt:'Date'}
  );
}
export function exportDashboard(rows){
  downloadCSV(rows,'dashboard-export.csv',
    ['title','type','field','aggregation','groupBy','value'],
    {title:'Widget Title',type:'Type',field:'Field',aggregation:'Aggregation',groupBy:'Group By',value:'Value'}
  );
}
