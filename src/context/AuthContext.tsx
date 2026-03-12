import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  email: string;
  password: string;
  name?: string;
  grade?: string;
  chapter?: string;
  username?: string;
  role: 'admin' | 'secretary' | 'treasurer' | 'member';
};

type AuthState = {
  users: Record<string, User>;
  currentUserId: string | null;
};

type AuthContextValue = {
  users: Record<string, User>;
  currentUser: User | null;
  isLoading: boolean;
  register: (
    email: string,
    password: string,
    username?: string,
    name?: string,
    grade?: string,
    chapter?: string,
    role?: User['role']
  ) => Promise<User>;
  login: (identifier: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (id: string, patch: Partial<Omit<User, 'id' | 'password'>>) => Promise<User>;
};

const STORAGE_KEY = 'fbla:auth:v1';
const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function makeId() {
  return String(Date.now()) + Math.random().toString(36).slice(2, 8);
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({ users: {}, currentUserId: null });
  const [loaded, setLoaded] = React.useState(false);

  // Load from AsyncStorage
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && mounted) {
          setState(JSON.parse(raw));
        } else if (mounted) {
          // Seed sample users (plain text passwords for demo)
          const samples: User[] = [
            { id: 'u_admin', email: 'admin@chapter.org', password: 'pass123', username: 'admin', name: 'Alex Johnson', grade: '12', chapter: 'Central HS', role: 'admin' },
            { id: 'u_sec', email: 'secretary@chapter.org', password: 'pass123', username: 'secretary', name: 'Bella Smith', grade: '11', chapter: 'Central HS', role: 'secretary' },
            { id: 'u_treas', email: 'treasurer@chapter.org', password: 'pass123', username: 'treasurer', name: 'Carlos Nguyen', grade: '12', chapter: 'Central HS', role: 'treasurer' },
            { id: 'u_dana', email: 'dana@chapter.org', password: 'pass123', username: 'dana', name: 'Dana Lee', grade: '10', chapter: 'Central HS', role: 'member' },
            { id: 'u_evan', email: 'evan@chapter.org', password: 'pass123', username: 'evan', name: 'Evan Patel', grade: '9', chapter: 'Central HS', role: 'member' },
          ];
          const usersObj: Record<string, User> = {};
          samples.forEach(u => { usersObj[u.id] = u; });
          setState({ users: usersObj, currentUserId: null });
        }
      } catch (e) {
        console.warn('Failed to load auth store', e);
      } finally {
        if (mounted) setLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Persist to AsyncStorage
  React.useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn('Failed to persist auth store', e);
      }
    })();
  }, [state, loaded]);

  async function register(
    email: string,
    password: string,
    username?: string,
    name?: string,
    grade?: string,
    chapter?: string,
    role: User['role'] = 'member'
  ) {
    if (!email?.trim() || !password) throw new Error('Email and password are required');

    const emailLower = email.trim().toLowerCase();
    const usernameLower = username?.trim().toLowerCase();

    const existsByEmail = Object.values(state.users).some((u) => u.email.toLowerCase() === emailLower);
    if (existsByEmail) throw new Error('Email already in use');

    if (usernameLower) {
      const existsByUsername = Object.values(state.users).some(
        (u) => (u.username || '').toLowerCase() === usernameLower
      );
      if (existsByUsername) throw new Error('Username already in use');
    }

    const id = makeId();
    const user: User = {
      id,
      email: email.trim(),
      password,
      username: username?.trim() || undefined,
      name: name?.trim() || undefined,
      grade: grade?.trim() || undefined,
      chapter: chapter?.trim() || undefined,
      role
    };

    setState((s) => ({ users: { ...s.users, [id]: user }, currentUserId: null }));
    return user;
  }

  async function login(identifier: string, password: string) {
    const idLower = identifier.trim().toLowerCase();
    const found = Object.values(state.users).find(
      (u) =>
        (u.email.toLowerCase() === idLower || (u.username && u.username.toLowerCase() === idLower)) &&
        u.password === password
    );
    if (!found) throw new Error('Invalid username/email or password');
    setState((s) => ({ ...s, currentUserId: found.id }));
    return found;
  }

  function logout() {
    setState((s) => ({ ...s, currentUserId: null }));
  }

  async function updateUser(id: string, patch: Partial<Omit<User, 'id' | 'password'>>) {
    const existing = state.users[id];
    if (!existing) throw new Error('User not found');

    const nextEmail = patch.email?.trim();
    const nextUsername = patch.username?.trim();

    if (nextEmail && nextEmail.toLowerCase() !== existing.email.toLowerCase()) {
      const dupEmail = Object.values(state.users).some(
        (u) => u.id !== id && u.email.toLowerCase() === nextEmail.toLowerCase()
      );
      if (dupEmail) throw new Error('Email already in use');
    }
    if (nextUsername && (existing.username || '').toLowerCase() !== nextUsername.toLowerCase()) {
      const dupUser = Object.values(state.users).some(
        (u) => u.id !== id && (u.username || '').toLowerCase() === nextUsername.toLowerCase()
      );
      if (dupUser) throw new Error('Username already in use');
    }

    const updated: User = {
      ...existing,
      ...patch,
      email: nextEmail ?? existing.email,
      username: (nextUsername ?? existing.username) || undefined,
      name: (patch.name?.trim() ?? existing.name) || undefined,
      grade: (patch.grade?.trim() ?? existing.grade) || undefined,
      chapter: (patch.chapter?.trim() ?? existing.chapter) || undefined,
    };

    setState((s) => ({ ...s, users: { ...s.users, [id]: updated } }));
    return updated;
  }

  const value: AuthContextValue = {
    users: state.users,
    currentUser: state.currentUserId ? state.users[state.currentUserId] ?? null : null,
    isLoading: !loaded,
    register,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}