import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SocialLink = {
  id: string;
  platform: string;
  url: string;
};

type SocialContextValue = {
  links: SocialLink[];
  add: (platform: string, url: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const SocialContext = React.createContext<SocialContextValue | undefined>(undefined);

export function useSocial() {
  const ctx = React.useContext(SocialContext);
  if (!ctx) throw new Error('useSocial must be used within SocialProvider');
  return ctx;
}

const KEY = 'fbla:social:v1';

// Default platforms (replace URLs with official FBLA links when confirmed)
const DEFAULT_SOCIAL: SocialLink[] = [
  { id: 's_fb', platform: 'Facebook', url: 'https://www.facebook.com/' },
  { id: 's_ig', platform: 'Instagram', url: 'https://www.instagram.com/' },
  { id: 's_tt', platform: 'TikTok', url: 'https://www.tiktok.com/' },
  { id: 's_sc', platform: 'Snapchat', url: 'https://www.snapchat.com/' },
];

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const [links, setLinks] = React.useState<SocialLink[]>([]);

  React.useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        setLinks(JSON.parse(raw));
      } else {
        setLinks(DEFAULT_SOCIAL);
      }
    })();
  }, []);

  React.useEffect(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(links)).catch(() => {});
  }, [links]);

  function add(platform: string, url: string) {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
    setLinks((s) => [{ id, platform: platform.trim(), url: url.trim() }, ...s]);
  }

  function remove(id: string) {
    setLinks((s) => s.filter((x) => x.id !== id));
  }

  function clear() {
    setLinks(DEFAULT_SOCIAL);
  }

  return (
    <SocialContext.Provider value={{ links, add, remove, clear }}>
      {children}
    </SocialContext.Provider>
  );
}