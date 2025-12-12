import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Announcement = { id:string; title:string; body:string; createdISO:string };
const KEY = 'fbla:news:v1';
type Ctx = {
  items: Announcement[];
  add: (title:string, body:string)=>void;
  update: (id:string, patch:Partial<Omit<Announcement,'id'>>)=>void;
  remove: (id:string)=>void;
};
const NewsContext = React.createContext<Ctx | undefined>(undefined);
export function useNews(){ const c=React.useContext(NewsContext); if(!c) throw new Error('useNews inside provider'); return c; }
export function NewsProvider({children}:{children:React.ReactNode}) {
  const [items,setItems]=React.useState<Announcement[]>([]);
  React.useEffect(()=>{ (async()=>{ const raw=await AsyncStorage.getItem(KEY); if(raw) setItems(JSON.parse(raw)); })(); },[]);
  React.useEffect(()=>{ AsyncStorage.setItem(KEY, JSON.stringify(items)).catch(()=>{}); },[items]);
  function add(title:string, body:string){
    setItems(s=>[{ id:Date.now()+Math.random().toString(36).slice(2), title:title.trim(), body:body.trim(), createdISO:new Date().toISOString() }, ...s]);
  }
  function update(id:string, patch:Partial<Omit<Announcement,'id'>>){
    setItems(s=>s.map(i=>i.id===id?{...i,...patch}:i));
  }
  function remove(id:string){ setItems(s=>s.filter(i=>i.id!==id)); }
  return <NewsContext.Provider value={{ items, add, update, remove }}>{children}</NewsContext.Provider>;
}