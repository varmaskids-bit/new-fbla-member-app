import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';

export type Announcement = {
  id: string;
  title: string;
  body: string;
  description: string;
  location?: string;
  createdISO: string;
  startISO?: string;
};

const KEY = 'fbla:news:v1';

type NewsContextValue = {
  items: Announcement[];
  add: (title: string, body: string) => void;
  update: (id: string, patch: Partial<Pick<Announcement, 'title' | 'body'>>) => void;
  remove: (id: string) => void;
};

const NewsContext = React.createContext<NewsContextValue | undefined>(undefined);

export function useNews() {
  const ctx = React.useContext(NewsContext);
  if (!ctx) throw new Error('useNews must be used within NewsProvider');
  return ctx;
}

const SAMPLE_NEWS: Announcement[] = [
  {
    id: 'n1',
    title: 'Welcome to FBLA App',
    body: 'Stay tuned for updates on chapter activities, events, and opportunities!',
    createdISO: new Date().toISOString(),
    description: ''
  },
  {
    id: 'n2',
    title: 'Officer Elections Next Week',
    body: 'Elections for next year\'s officer team will be held next week. Please submit nominations by Friday.',
    createdISO: new Date(Date.now() - 3600000).toISOString(),
    description: ''
  },
  {
    id: 'n3',
    title: 'Community Service Drive',
    body: 'Bring donations for our community service project. Collection runs through the end of the month.',
    createdISO: new Date(Date.now() - 7200000).toISOString(),
    description: ''
  },
  // Added FBLA news announcements - public information for all users
  {
    id: 'n4',
    title: 'FBLA National Leadership Conference 2025',
    description: 'The FBLA National Leadership Conference will be held in Chicago, IL from June 25-28, 2025. Register now for competitive events, leadership workshops, and networking opportunities.',
    location: 'Chicago, IL',
    startISO: new Date('2025-06-25T09:00:00').toISOString(),
    body: '',
    createdISO: ''
  },
  {
    id: 'n5',
    title: 'FBLA Scholarship Opportunities',
    description: 'FBLA offers numerous scholarships for members pursuing higher education. Applications are now open for the 2025-2026 academic year. Visit fbla.org/scholarships for details.',
    location: 'Online Application',
    startISO: new Date('2024-12-15T00:00:00').toISOString(),
    body: '',
    createdISO: ''
  },
  {
    id: 'n6',
    title: 'Chapter of the Year Winners Announced',
    description: 'Congratulations to all Chapter of the Year winners! The 2024 winners include: Large Chapter - Central High School (FL), Medium Chapter - Lincoln Academy (ME), and Small Chapter - Valley View High School (TX).',
    location: 'National Announcement',
    startISO: new Date('2024-11-20T00:00:00').toISOString(),
    body: '',
    createdISO: ''
  },
  {
    id: 'n7',
    title: 'FBLA Competitive Events Registration Open',
    description: 'Registration for the 2025 FBLA Competitive Events is now open. Choose from over 60 events in business, technology, and leadership categories. Early registration deadline: February 15, 2025.',
    location: 'Online Registration',
    startISO: new Date('2024-12-01T00:00:00').toISOString(),
    body: '',
    createdISO: ''
  },
  {
    id: 'n8',
    title: 'FBLA-PBL National Awards Program',
    description: 'The FBLA-PBL National Awards Program recognizes outstanding achievements in academics, leadership, and community service. Nominations are due by March 1, 2025.',
    location: 'National Program',
    startISO: new Date('2024-12-10T00:00:00').toISOString(),
    body: '',
    createdISO: ''
  }
];

export function NewsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<Announcement[]>([]);

  React.useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        setItems(JSON.parse(raw));
      } else {
        setItems(SAMPLE_NEWS); // seed with sample news/announcements
      }
    })();
  }, []);

  React.useEffect(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(items)).catch(() => {});
  }, [items]);

  function add(title: string, body: string) {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
    setItems((s) => [{ id, title: title.trim(), body: body.trim(), description: '', createdISO: new Date().toISOString() }, ...s]);
  }

  function update(id: string, patch: Partial<Pick<Announcement, 'title' | 'body'>>) {
    setItems((s) => s.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function remove(id: string) {
    setItems((s) => s.filter((e) => e.id !== id));
  }

  return (
    <NewsContext.Provider value={{ items, add, update, remove }}>
      {children}
    </NewsContext.Provider>
  );
}
