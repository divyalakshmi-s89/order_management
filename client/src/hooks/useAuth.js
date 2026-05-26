import React,{createContext,useContext,useState} from 'react';

const AuthCtx=createContext(null);
const ADMIN={email:'admin@orderflow.com',password:'admin123',name:'Admin',role:'admin'};

export function AuthProvider({children}){
  const [user,setUser]=useState(()=>{
    try{ return JSON.parse(localStorage.getItem('of_user')||'null'); }catch{ return null; }
  });
  const login=(email,password)=>{
    if(email.toLowerCase()===ADMIN.email && password===ADMIN.password){
      const u={email:ADMIN.email,name:ADMIN.name,role:ADMIN.role};
      setUser(u);
      localStorage.setItem('of_user',JSON.stringify(u));
      return true;
    }
    throw new Error('Invalid email or password');
  };
  const logout=()=>{ setUser(null); localStorage.removeItem('of_user'); };
  return <AuthCtx.Provider value={{user,login,logout,isLoggedIn:!!user}}>{children}</AuthCtx.Provider>;
}
export const useAuth=()=>useContext(AuthCtx);
