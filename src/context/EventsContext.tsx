import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type EventItem = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startISO: string;
};

const KEY = 'fbla:events:v1';

type EventsContextValue = {
  events: EventItem[];
  add: (event: Omit<EventItem, 'id'>) => void;
  update: (id: string, patch: Partial<Omit<EventItem, 'id'>>) => void;
  remove: (id: string) => void;
};

const EventsContext = React.createContext<EventsContextValue | undefined>(undefined);

export function useEvents() {
  const ctx = React.useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used within EventsProvider');
  return ctx;
}

const SAMPLE_EVENTS: EventItem[] = [
  {
    id: 'ev1',
    title: 'Industry Connect Webinar',
    description: 'Join us for an Industry Connect Webinar to network with business professionals and learn about career opportunities.',
    location: 'Online Webinar',
    startISO: new Date('2025-01-21T18:00:00').toISOString()
  },
  {
    id: 'ev2',
    title: 'National Career & Technical Education Month',
    description: 'Celebrate National Career & Technical Education Month throughout February. Participate in various activities highlighting FBLA programs.',
    location: 'Nationwide',
    startISO: new Date('2026-02-01T09:00:00').toISOString()
  },
  {
    id: 'ev3',
    title: 'FBLA Week',
    description: 'Celebrate FBLA Week with us on February 8-14, 2026! This week, held during National Career & Technical Education Month, is a highlight of the membership year.',
    location: 'Chapter Activities',
    startISO: new Date('2026-02-08T09:00:00').toISOString()
  },
  {
    id: 'ev4',
    title: 'Industry Connect Webinar',
    description: 'Another opportunity to connect with industry professionals and explore career paths in business.',
    location: 'Online Webinar',
    startISO: new Date('2026-02-18T18:00:00').toISOString()
  },
  {
    id: 'ev5',
    title: 'Collegiate Officer Leadership Summit',
    description: 'Launch your leadership journey at the Officer Leadership Summit on February 21, 2026 from 11:00 AM-1:00 PM ET! This exclusive virtual event brings together all Collegiate officers for a powerful session of leadership growth, networking, and FBLA inspiration.',
    location: 'Virtual Summit',
    startISO: new Date('2026-02-21T11:00:00').toISOString()
  }
];

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = React.useState<EventItem[]>([]);

  React.useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        setEvents(JSON.parse(raw));
      } else {
        setEvents(SAMPLE_EVENTS); // seed
      }
    })();
  }, []);

  React.useEffect(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(events)).catch(() => {});
  }, [events]);

  function add(event: Omit<EventItem, 'id'>) {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
    setEvents((s) => [...s, { id, ...event }]);
  }

  function update(id: string, patch: Partial<Omit<EventItem, 'id'>>) {
    setEvents((s) => s.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function remove(id: string) {
    setEvents((s) => s.filter((e) => e.id !== id));
  }

  return (
    <EventsContext.Provider value={{ events, add, update, remove }}>
      {children}
    </EventsContext.Provider>
  );
}
