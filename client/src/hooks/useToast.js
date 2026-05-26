import React,{createContext,useContext,useState,useCallback} from 'react';

const Ctx = createContext(null);

export function ToastProvider({children}){
  const [toasts,setToasts]=useState([]);
  const add=useCallback((msg,type='info',ms=3500)=>{
    const id=Date.now()+Math.random();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),ms);
  },[]);
  const toast={
    success:m=>add(m,'success'),
    error:m=>add(m,'error'),
    info:m=>add(m,'info')
  };
  const icons={success:'✓',error:'✕',info:'ℹ'};
  return(
    <Ctx.Provider value={toast}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t=>(
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{icons[t.type]}</span>{t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
export const useToast=()=>useContext(Ctx);
