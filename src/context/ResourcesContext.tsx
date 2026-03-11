import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
export type NodeItem = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: NodeItem[];
  uri?: string;
};
const KEY = 'fbla:resources:v1';
type Ctx = {
  root: NodeItem;
  addFolder: (path: string[], name: string) => void;
  addFile: (path: string[], file: { name: string; uri: string }) => void;
  rename: (path: string[], newName: string) => void;
  remove: (path: string[]) => void;
};
const ResourcesContext = React.createContext<Ctx | undefined>(undefined);
export function useResources() {
  const c = React.useContext(ResourcesContext);
  if (!c) throw new Error('useResources must be inside provider');
  return c;
}
function newRoot(): NodeItem { return { id: 'root', name: 'root', type: 'folder', children: [] }; }
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
export function ResourcesProvider({ children }: { children: React.ReactNode }) {
  const [root, setRoot] = React.useState<NodeItem>(newRoot());
  React.useEffect(()=>{ (async()=>{
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) setRoot(JSON.parse(raw));
  })(); },[]);
  React.useEffect(()=>{ AsyncStorage.setItem(KEY, JSON.stringify(root)).catch(()=>{}); },[root]);

  function mutate(path: string[], fn: (node: NodeItem)=>void){
    setRoot(r => {
      const clone = deepClone(r);
      let cur = clone;
      for (const seg of path) {
        if (!cur.children) break;
        const next = cur.children.find(c => c.id === seg);
        if (!next) break;
        cur = next;
      }
      fn(cur);
      return clone;
    });
  }
  function addFolder(path: string[], name: string) {
    mutate(path, node => {
      node.children = node.children || [];
      node.children.push({ id: Date.now()+Math.random().toString(36).slice(2), name, type:'folder', children:[] });
    });
  }
  function addFile(path: string[], file: { name: string; uri: string }) {
    mutate(path, node => {
      node.children = node.children || [];
      node.children.push({ id: Date.now()+Math.random().toString(36).slice(2), name:file.name, type:'file', uri:file.uri });
    });
  }
  function rename(path: string[], newName: string) {
    if (!path.length) return;
    setRoot(r => {
      const clone = deepClone(r);
      let cur: NodeItem | undefined = clone;
      for (const seg of path) {
        if (!cur?.children) break;
        cur = cur.children.find(c => c.id === seg);
      }
      if (cur) cur.name = newName;
      return clone;
    });
  }
  function remove(path: string[]) {
    if (!path.length) return;
    setRoot(r => {
      const clone = deepClone(r);
      let parent: NodeItem | undefined = clone;
      for (let i=0;i<path.length-1;i++){
        parent = parent?.children?.find(c=>c.id===path[i]);
      }
      if (parent?.children){
        parent.children = parent.children.filter(c=>c.id!==path[path.length-1]);
      }
      return clone;
    });
  }
  return (
    <ResourcesContext.Provider value={{ root, addFolder, addFile, rename, remove }}>
      {children}
    </ResourcesContext.Provider>
  );
}
