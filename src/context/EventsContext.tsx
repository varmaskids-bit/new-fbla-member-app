import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type EventItem = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startISO: string; // full timestamp
};

const KEY = 'fbla:events:v1';
type Ctx = {
  events: EventItem[];
  add: (e: Omit<EventItem, 'id'>) => void;
  update: (id: string, patch: Partial<Omit<EventItem, 'id'>>) => void;
  remove: (id: string) => void;
  refresh: () => Promise<void>;
};
const EventsContext = React.createContext<Ctx | undefined>(undefined);
export function useEvents() {
  const c = React.useContext(EventsContext);
  if (!c) throw new Error('useEvents must be inside provider');
  return c;
}
export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  React.useEffect(() => { (async () => {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) setEvents(JSON.parse(raw));
  })(); }, []);
  React.useEffect(() => { AsyncStorage.setItem(KEY, JSON.stringify(events)).catch(()=>{}); }, [events]);

  function add(e: Omit<EventItem, 'id'>) {
    setEvents(s => [...s, { ...e, id: Date.now() + Math.random().toString(36).slice(2) }]);
  }
  function update(id: string, patch: Partial<Omit<EventItem,'id'>>) {
    setEvents(s => s.map(ev => ev.id === id ? { ...ev, ...patch } : ev));
  }
  function remove(id: string) {
    setEvents(s => s.filter(ev => ev.id !== id));
  }
  async function refresh() {
    const raw = await AsyncStorage.getItem(KEY);
    setEvents(raw ? JSON.parse(raw) : []);
  }
  return (
    <EventsContext.Provider value={{ events, add, update, remove, refresh }}>
      {children}
    </EventsContext.Provider>
  );
}
