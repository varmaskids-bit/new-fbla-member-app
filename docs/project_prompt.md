FBLA Member App – Project Prompt (Updated)

Goal
Local-first FBLA chapter mobile app (React Native / Expo) managing members (with roles), announcements (news feed), events, resources (folder/file tree), social media links, and role-based profile editing. No backend; uses AsyncStorage.

Tech Stack
- React Native + Expo
- AsyncStorage persistence
- React Context modules: AuthContext, NewsContext, EventsContext, ResourcesContext, (optionally Social stored inline in screen), ProfilesScreen logic
- Navigation: @react-navigation (stack + bottom tabs)

Persistence Keys
- fbla:auth:v1 (users + currentUserId)
- fbla:news:v1 (announcements)
- fbla:events:v1 (events)
- fbla:resources:v1 (resource tree)
- fbla:social:v1 (social links)

Seeding Behavior
On first launch (when key absent) AuthContext seeds 5 sample users (admin, secretary, treasurer, 2 members). NewsContext seeds 3 announcements. EventsContext seeds 3 upcoming events. Subsequent launches load existing stored data. Clearing AsyncStorage reseeds.

Roles
User.role ∈ { admin | secretary | treasurer | member }.
- Admin: can edit any profile and change roles.
- Non-admin: can only edit their own profile; cannot change roles.

Profiles
ProfilesScreen lists all users; searchable by name, username, email, grade, chapter, role. Edit button appears for:
- Current user (self)
- All users if current user is admin
Role chips for editing appear only if editing as admin.

News Feed
CRUD announcements: title, body, createdISO. Reverse chronological order. Seed examples: Welcome, Officer Elections, Community Service Drive.

Events
CRUD events: title, description, location, startISO. Manual number pickers for year/month/day/hour/minute (no external date picker). Seed sample meetings/workshops.

Resources
Folder/file tree stored as nested JSON; operations: add folder, add file (via DocumentPicker), rename, delete. Deep cloning via JSON (no structuredClone).

Social Media
Simple list of (platform, url) links. User enters platform text manually (preset chip bar removed). Links are clickable (Linking API). Stored under fbla:social:v1.

Navigation (After Login)
Tabs (initial: News):
- News
- Events
- Resources
- Profiles
- Social
Header includes Logout button.

Security / Demo Notes
- Passwords stored plaintext (demo only).
- No server sync; local-only.
- Role-based restrictions enforced in UI; not cryptographic.
- For production: add hashing, authorization guards, remote sync, file previews.

Extensibility Ideas
- Role-based route guards.
- Password hashing (bcrypt / crypto).
- Push notifications (Expo).
- Export/import backup JSON.
- Multi-chapter namespaces.
- Cloud sync backend.

Reseed Instructions
To reseed sample data: clear AsyncStorage (e.g., add temporary button calling AsyncStorage.clear()) then restart app.

Core Code Snapshots (Exact Current State)

AuthContext.tsx
```tsx
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
    register,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

ProfilesScreen.tsx
```tsx
import React from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

const ROLES: Array<'admin'|'secretary'|'treasurer'|'member'> = ['admin','secretary','treasurer','member'];

function roleColor(role: string) {
  switch (role) {
    case 'admin': return { backgroundColor: '#D7263D' };
    case 'secretary': return { backgroundColor: '#FF9500' };
    case 'treasurer': return { backgroundColor: '#2E8B57' };
    default: return { backgroundColor: '#1E66FF' };
  }
}

export default function ProfilesScreen() {
  const { users, currentUser, updateUser } = useAuth();
  const [q, setQ] = React.useState('');
  const all = React.useMemo(() => Object.values(users), [users]);

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return all;
    return all.filter(u =>
      (u.name || '').toLowerCase().includes(term) ||
      (u.username || '').toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.grade || '').toLowerCase().includes(term) ||
      (u.chapter || '').toLowerCase().includes(term) ||
      (u.role || '').toLowerCase().includes(term)
    );
  }, [all, q]);

  // Edit modal state
  const [open, setOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [grade, setGrade] = React.useState('');
  const [chapter, setChapter] = React.useState('');
  const [role, setRole] = React.useState<'admin'|'secretary'|'treasurer'|'member'>('member');

  const isAdmin = currentUser?.role === 'admin';

  function startEdit(u: any) {
    const canEdit = isAdmin || currentUser?.id === u.id;
    if (!canEdit) return;
    setEditId(u.id);
    setName(u.name || '');
    setUsername(u.username || '');
    setEmail(u.email);
    setGrade(u.grade || '');
    setChapter(u.chapter || '');
    setRole(u.role || 'member');
    setOpen(true);
  }

  async function save() {
    if (!editId) return;
    if (!email.trim()) { Alert.alert('Validation', 'Email is required'); return; }
    try {
      await updateUser(editId, {
        name,
        username,
        email,
        grade,
        chapter,
        ...(isAdmin ? { role } : {}), // only admins can change roles
      });
      setOpen(false);
    } catch (e: any) {
      Alert.alert('Update failed', e.message || String(e));
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search members..."
        value={q}
        onChangeText={setQ}
        style={styles.search}
        autoCapitalize="none"
      />
      <FlatList
        data={filtered.sort((a,b)=> (a.name||'').localeCompare(b.name||''))}
        keyExtractor={u => u.id}
        ListEmptyComponent={<Text style={styles.empty}>No members</Text>}
        renderItem={({ item }) => {
          const mine = currentUser?.id === item.id;
          const canEdit = isAdmin || mine;
          return (
            <View style={[styles.card, mine && styles.mine]}>
              <View style={styles.headerRow}>
                <Text style={styles.name}>{item.name || item.username || item.email}{mine ? ' (You)' : ''}</Text>
                <View style={[styles.roleTag, roleColor(item.role)]}>
                  <Text style={styles.roleText}>{item.role}</Text>
                </View>
              </View>
              {item.username ? <Text style={styles.line}>Username: {item.username}</Text> : null}
              <Text style={styles.line}>Email: {item.email}</Text>
              {item.grade ? <Text style={styles.line}>Grade: {item.grade}</Text> : null}
              {item.chapter ? <Text style={styles.line}>Chapter: {item.chapter}</Text> : null}
              {canEdit ? (
                <TouchableOpacity style={styles.editBtn} onPress={() => startEdit(item)}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          );
        }}
      />

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input}/>
          <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} autoCapitalize="none"/>
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address"/>
          <TextInput placeholder="Grade" value={grade} onChangeText={setGrade} style={styles.input}/>
          <TextInput placeholder="Chapter" value={chapter} onChangeText={setChapter} style={styles.input}/>
          {isAdmin ? (
            <View style={styles.roleRow}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  style={[styles.roleChip, role === r && styles.roleChipActive]}
                >
                  <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => setOpen(false)} style={styles.cancel}><Text>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={save} style={styles.save}><Text style={{color:'#fff'}}>Save</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#fff', padding:12 },
  search:{ borderWidth:1, borderColor:'#dbe9ff', padding:10, borderRadius:8, marginBottom:12 },
  card:{ borderWidth:1, borderColor:'#dbe9ff', padding:12, borderRadius:8, marginBottom:10 },
  mine:{ borderColor:'#1E66FF' },
  headerRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  name:{ fontSize:16, fontWeight:'700', marginBottom:4 },
  roleTag:{ paddingHorizontal:10, paddingVertical:4, borderRadius:14 },
  roleText:{ color:'#fff', fontSize:11, fontWeight:'700', textTransform:'uppercase' },
  line:{ color:'#444', fontSize:13 },
  empty:{ textAlign:'center', marginTop:40, color:'#666' },
  editBtn:{ alignSelf:'flex-end', marginTop:8, paddingVertical:6, paddingHorizontal:12, borderRadius:8, borderWidth:1, borderColor:'#1E66FF' },
  editText:{ color:'#1E66FF', fontWeight:'700' },
  modal:{ flex:1, padding:16, backgroundColor:'#fff' },
  modalTitle:{ fontSize:20, fontWeight:'700', marginBottom:12 },
  input:{ borderWidth:1, borderColor:'#dbe9ff', padding:10, borderRadius:8, marginBottom:10 },
  roleRow:{ flexDirection:'row', flexWrap:'wrap', marginBottom:12 },
  roleChip:{ paddingVertical:6, paddingHorizontal:12, borderRadius:20, borderWidth:1, borderColor:'#dbe9ff', marginRight:8, marginTop:6 },
  roleChipActive:{ backgroundColor:'#1E66FF', borderColor:'#1E66FF' },
  roleChipText:{ color:'#1E66FF', fontWeight:'600', fontSize:12 },
  roleChipTextActive:{ color:'#fff' },
  actions:{ flexDirection:'row', justifyContent:'flex-end', marginTop:6 },
  cancel:{ padding:12, marginRight:12 },
  save:{ backgroundColor:'#1E66FF', padding:12, borderRadius:8 },
});
```

Usage Summary
1. User registers (chooses role) or logs in with seeded credentials.
2. After login, News tab (initial) shows announcements.
3. Tabs provide access to Events, Resources, Profiles (with search & role-based editing), Social links.
4. All data persists locally.

End of Prompt