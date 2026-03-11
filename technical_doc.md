# FBLA Member App – Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Module Breakdown](#module-breakdown)
3. [State Management Layer Deep Dive](#state-management-layer-deep-dive)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Component Architecture](#component-architecture)
6. [Security Architecture](#security-architecture)
7. [Navigation Architecture](#navigation-architecture)
8. [Scaling Considerations](#scaling-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Deployment & Build Configuration](#deployment--build-configuration)
11. [UI/UX Features](#uiux-features)
12. [Known Issues & Fixes](#known-issues--fixes)

---

## Architecture Overview

### High-Level Architecture Pattern
**Local-First Context-Based MVC Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Provider Hierarchy                       │   │
│  │  AuthProvider                                         │   │
│  │    └─ NewsProvider                                    │   │
│  │         └─ EventsProvider                             │   │
│  │              └─ ResourcesProvider                     │   │
│  │                   └─ Navigation                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌───────────────────────────────────────────────┐
    │         Navigation Container                   │
    │  ┌─────────────────────────────────────────┐  │
    │  │  Auth Stack (if !currentUser)           │  │
    │  │    - LoginScreen                        │  │
    │  │    - RegisterScreen                     │  │
    │  └─────────────────────────────────────────┘  │
    │  ┌─────────────────────────────────────────┐  │
    │  │  Main Tabs (if currentUser)             │  │
    │  │    - News (NewsFeedScreen)              │  │
    │  │    - Events (EventsScreen)              │  │
    │  │    - Resources (ResourcesScreen)        │  │
    │  │    - Profiles (ProfilesScreen)          │  │
    │  │    - Social (SocialMediaScreen)         │  │
    │  └─────────────────────────────────────────┘  │
    └───────────────────────────────────────────────┘
```

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│              (Screens - React Components)                    │
│   LoginScreen, RegisterScreen, NewsFeedScreen, etc.         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ useContext() hooks
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  State Management Layer                      │
│              (Context Providers - Business Logic)            │
│   AuthContext, NewsContext, EventsContext, etc.             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ AsyncStorage API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Persistence Layer                          │
│                  (AsyncStorage - Local DB)                   │
│   fbla:auth:v1, fbla:news:v1, fbla:events:v1, etc.          │
└─────────────────────────────────────────────────────────────┘
```

---

## Module Breakdown

### 1. Context Modules (State Management Layer)

#### AuthContext.tsx
**Purpose**: User authentication, registration, session management, profile updates  
**Pattern**: Context API + AsyncStorage persistence  
**Key**: `fbla:auth:v1`

**Data Model**:
```typescript
type User = {
  id: string;
  email: string;
  password: string; // plaintext (demo only)
  name?: string;
  grade?: string;
  chapter?: string;
  username?: string;
  role: 'admin' | 'secretary' | 'treasurer' | 'member';
}

type AuthState = {
  users: Record<string, User>;
  currentUserId: string | null;
}
```

**API Surface**:
```typescript
interface AuthContextValue {
  users: Record<string, User>;
  currentUser: User | null;
  register(email, password, username?, name?, grade?, chapter?, role?): Promise<User>;
  login(identifier, password): Promise<User>;
  logout(): void;
  updateUser(id, patch): Promise<User>;
}
```

**Seeding Logic**:
```typescript
// On first launch (no storage key found)
samples = [
  { id:'u_admin', email:'admin@chapter.org', password:'pass123', 
    username:'admin', name:'Alex Johnson', grade:'12', 
    chapter:'Central HS', role:'admin' },
  { id:'u_sec', email:'secretary@chapter.org', password:'pass123',
    username:'secretary', name:'Bella Smith', grade:'11',
    chapter:'Central HS', role:'secretary' },
  { id:'u_treas', email:'treasurer@chapter.org', password:'pass123',
    username:'treasurer', name:'Carlos Nguyen', grade:'12',
    chapter:'Central HS', role:'treasurer' },
  { id:'u_dana', email:'dana@chapter.org', password:'pass123',
    username:'dana', name:'Dana Lee', grade:'10',
    chapter:'Central HS', role:'member' },
  { id:'u_evan', email:'evan@chapter.org', password:'pass123',
    username:'evan', name:'Evan Patel', grade:'9',
    chapter:'Central HS', role:'member' }
]
```

**Persistence Flow**:
```
Component Action → setState() → useEffect(state) → AsyncStorage.setItem()
                                                         ↓
App Launch → useEffect([]) → AsyncStorage.getItem() → setState()
```

---

#### NewsContext.tsx
**Purpose**: CRUD operations for chapter announcements  
**Pattern**: Context + seed on empty storage  
**Key**: `fbla:news:v1`

**Data Model**:
```typescript
type Announcement = {
  id: string;
  title: string;
  body: string;
  createdISO: string; // ISO timestamp
}

interface NewsContextValue {
  items: Announcement[];
  add: (title: string, body: string) => void;
  update: (id: string, patch: Partial<Pick<Announcement, 'title' | 'body'>>) => void;
  remove: (id: string) => void;
}
```

**Sample Seeds**:
```typescript
[
  {
    id: 'n1',
    title: 'Welcome to FBLA App',
    body: 'Stay tuned for updates on chapter activities, events, and opportunities!',
    createdISO: new Date().toISOString()
  },
  {
    id: 'n2',
    title: 'Officer Elections Next Week',
    body: 'Elections for next year\'s officer team will be held next week. Please submit nominations by Friday.',
    createdISO: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'n3',
    title: 'Community Service Drive',
    body: 'Bring donations for our community service project. Collection runs through the end of the month.',
    createdISO: new Date(Date.now() - 7200000).toISOString()
  },
  // Added FBLA news announcements - public information for all users
  {
    id: 'n4',
    title: 'FBLA National Leadership Conference 2025',
    body: 'The FBLA National Leadership Conference will be held in Chicago, IL from June 25-28, 2025. Register now for competitive events, leadership workshops, and networking opportunities.',
    createdISO: new Date('2025-06-25T00:00:00').toISOString()
  },
  {
    id: 'n5',
    title: 'FBLA Scholarship Opportunities',
    body: 'FBLA offers numerous scholarships for members pursuing higher education. Applications are now open for the 2025-2026 academic year. Visit fbla.org/scholarships for details.',
    createdISO: new Date('2024-12-15T00:00:00').toISOString()
  },
  {
    id: 'n6',
    title: 'Chapter of the Year Winners Announced',
    body: 'Congratulations to all Chapter of the Year winners! The 2024 winners include: Large Chapter - Central High School (FL), Medium Chapter - Lincoln Academy (ME), and Small Chapter - Valley View High School (TX).',
    createdISO: new Date('2024-11-20T00:00:00').toISOString()
  },
  {
    id: 'n7',
    title: 'FBLA Competitive Events Registration Open',
    body: 'Registration for the 2025 FBLA Competitive Events is now open. Choose from over 60 events in business, technology, and leadership categories. Early registration deadline: February 15, 2025.',
    createdISO: new Date('2024-12-01T00:00:00').toISOString()
  },
  {
    id: 'n8',
    title: 'FBLA-PBL National Awards Program',
    body: 'The FBLA-PBL National Awards Program recognizes outstanding achievements in academics, leadership, and community service. Nominations are due by March 1, 2025.',
    createdISO: new Date('2024-12-10T00:00:00').toISOString()
  }
]
```

---

#### EventsContext.tsx
**Purpose**: Manage chapter events with date/time  
**Pattern**: Context + manual date pickers (no library)  
**Key**: `fbla:events:v1`

**Data Model**:
```typescript
type EventItem = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startISO: string; // full ISO timestamp
}

interface EventsContextValue {
  events: EventItem[];
  add: (event: Omit<EventItem, 'id'>) => void;
  update: (id: string, patch: Partial<EventItem>) => void;
  remove: (id: string) => void;
}
```

**Sample Seeds (Based on FBLA Official Events)**:
```typescript
[
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
]
```

---

#### ResourcesContext.tsx
**Purpose**: Hierarchical folder/file tree management  
**Pattern**: Nested JSON tree with deep clone via JSON.parse/stringify  
**Key**: `fbla:resources:v1`

**Data Model**:
```typescript
type NodeItem = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: NodeItem[];
  uri?: string; // file only (local device URI)
}

interface ResourcesContextValue {
  root: NodeItem;
  addFolder: (path: string[], name: string) => void;
  addFile: (path: string[], { name: string, uri: string }) => void;
  rename: (path: string[], newName: string) => void;
  remove: (path: string[]) => void;
}
```

**Root Structure**:
```json
{
  "id": "root",
  "name": "root",
  "type": "folder",
  "children": []
}
```

**Path Navigation**: Array of node IDs from root to target
```typescript
// Example: ["root", "child_folder_id", "nested_folder_id"]
```

**Deep Clone Pattern**:
```typescript
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
```

---

### 2. Screen Components (UI Layer)

#### LoginScreen.tsx
**Responsibilities**:
- Email/username + password input
- Logo display (40x40 image at top center)
- Calls `auth.login(identifier, password)`
- Navigation to RegisterScreen

**Flow**:
```
User Input → Validate → auth.login() → Success → Navigation switches to MainTabs
                                      ↓ Failure
                                      Alert error
```

---

#### RegisterScreen.tsx
**Responsibilities**:
- Multi-field form (email, username, password, name, grade, chapter)
- Role selection chips (admin/secretary/treasurer/member)
- Calls `auth.register(...)`

**Validation Chain**:
```typescript
1. Email required
2. Password min 6 chars
3. Password confirmation match
4. Unique email check (in AuthContext.register)
5. Unique username check (if provided)
```

**Role Selection UI**:
```tsx
<View style={roleRow}>
  {['admin','secretary','treasurer','member'].map(r =>
    <TouchableOpacity onPress={() => setRole(r)}>
      <Text style={role===r ? active : inactive}>{r}</Text>
    </TouchableOpacity>
  )}
</View>
```

---

#### NewsFeedScreen.tsx
**Responsibilities**:
- Display announcements (reverse chronological)
- Modal for add/edit announcement
- Delete with confirmation
- "Clear Data" button (dev/testing feature)

**CRUD Operations**:
```
Add:    news.add(title, body) → createdISO=now
Edit:   news.update(id, {title, body})
Delete: Alert.alert → news.remove(id)
```

**UI Structure**:
```
Top Bar: [+ Announcement] [Clear Data]
FlatList → AnnouncementCard
             - Title
             - Timestamp
             - Body preview
             - Edit button (opens Modal)
             - Delete button
Modal → TextInput(title), TextInput(body), Save/Cancel
```

---

#### EventsScreen.tsx
**Responsibilities**:
- List events sorted by startISO
- CRUD with custom date/time pickers (NumberPicker component)
- Modal form for add/edit

**Date Handling**:
```typescript
// State: year, month, day, hour, minute (all numbers)
// On save:
const iso = new Date(
  `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00`
).toISOString();
```

**NumberPicker Component**:
```tsx
function NumberPicker({value, setValue, min, max, step=1}) {
  return (
    <View>
      <Text>{value}</Text>
      <View>
        <Button onPress={() => setValue(value - 1)} disabled={value <= min}>-</Button>
        <Button onPress={() => setValue(value + 1)} disabled={value >= max}>+</Button>
      </View>
    </View>
  );
}
```

**Example Usage**:
```tsx
<NumberPicker value={year} setValue={setYear} min={2020} max={2030} />
<NumberPicker value={month} setValue={setMonth} min={1} max={12} />
<NumberPicker value={day} setValue={setDay} min={1} max={31} />
<NumberPicker value={hour} setValue={setHour} min={0} max={23} />
<NumberPicker value={minute} setValue={setMinute} min={0} max={59} step={5} />
```

---

#### ResourcesScreen.tsx
**Responsibilities**:
- Tree navigation (breadcrumb path bar)
- Add folder/file (via expo-document-picker)
- Rename/delete nodes
- Display files with local URI

**Navigation State**:
```typescript
const [path, setPath] = useState<{id:string, name:string}[]>([]);
// path=[] → root
// path=[{id:'c1', name:'Docs'}] → root/Docs
// path=[{id:'c1', name:'Docs'},{id:'c2', name:'2024'}] → root/Docs/2024
```

**Path Bar UI**:
```tsx
<TouchableOpacity onPress={rootBack}>root</TouchableOpacity>
{path.map((p,i) =>
  <TouchableOpacity key={p.id} onPress={() => goUp(i)}>
    / {p.name}
  </TouchableOpacity>
)}
```

**File Picker Integration**:
```typescript
import * as DocumentPicker from 'expo-document-picker';

async function pickFile() {
  const res = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false
  });
  if (res.type === 'success') {
    addFile(path.map(p=>p.id), { name: res.name, uri: res.uri });
  }
}
```

---

#### ProfilesScreen.tsx
**Responsibilities**:
- List all users (searchable by name/username/email/grade/chapter/role)
- Role-based edit permissions:
  - Users can edit their own profile
  - Admins can edit any profile
- Admin-only role change UI

**Search Filter**:
```typescript
const filtered = useMemo(() => {
  const term = q.trim().toLowerCase();
  if (!term) return allUsers;
  return allUsers.filter(u =>
    (u.name||'').toLowerCase().includes(term) ||
    (u.username||'').toLowerCase().includes(term) ||
    u.email.toLowerCase().includes(term) ||
    (u.grade||'').toLowerCase().includes(term) ||
    (u.chapter||'').toLowerCase().includes(term) ||
    (u.role||'').toLowerCase().includes(term)
  );
}, [allUsers, q]);
```

**Edit Permission Logic**:
```typescript
const isAdmin = currentUser?.role === 'admin';
const canEdit = isAdmin || currentUser?.id === item.id;
```

**Edit Modal Fields**:
```
- Name (text)
- Username (text, unique validation)
- Email (email, unique validation)
- Grade (text)
- Chapter (text)
- Role (chips, ADMIN ONLY)
```

**Role Chip Conditional Render**:
```tsx
{isAdmin ? (
  <View style={roleRow}>
    {ROLES.map(r =>
      <TouchableOpacity onPress={() => setRole(r)}>
        <Text style={role===r ? active : inactive}>{r}</Text>
      </TouchableOpacity>
    )}
  </View>
) : null}
```

**Role Color Mapping**:
```typescript
function roleColor(role: string) {
  switch (role) {
    case 'admin': return { backgroundColor: '#D7263D' };
    case 'secretary': return { backgroundColor: '#FF9500' };
    case 'treasurer': return { backgroundColor: '#2E8B57' };
    default: return { backgroundColor: '#1E66FF' };
  }
}
```

---

#### SocialMediaScreen.tsx
**Responsibilities**:
- Manage social media links (platform + URL)
- Clickable links via Linking API
- Local storage under `fbla:social:v1`

**Data Model**:
```typescript
type LinkItem = {
  id: string;
  platform: string; // user-entered text
  url: string;
}
```

**Link Opening**:
```typescript
import { Linking } from 'react-native';

function openLink(raw: string) {
  const url = raw.startsWith('http') ? raw : `https://${raw}`;
  Linking.openURL(url).catch(() => Alert.alert('Cannot open link'));
}
```

**UI Components**:
```
Input Row: [Platform TextInput] [URL TextInput] [Add Button]
FlatList → LinkCard
             - Platform name
             - URL (clickable)
             - Delete button
```

---

### 3. Navigation Layer

#### Navigation Structure (index.tsx)
**Pattern**: Conditional stack switching based on `currentUser`

```typescript
export default function Navigation() {
  const auth = useAuth();
  const isLoggedIn = !!auth.currentUser;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Group key="auth">
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group key="app">
            <Stack.Screen name="Main" component={MainTabs} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**MainTabs Component**:
```typescript
function MainTabs() {
  const auth = useAuth();
  return (
    <Tab.Navigator
      initialRouteName="News"
      screenOptions={{
        headerLeft: () => (  // Logo in top left (20x20)
          <Image source={require('../../assets/logo.png')} style={{ width: 20, height: 20, marginLeft: 10 }} />
        ),
        headerRight: () => (
          <TouchableOpacity onPress={auth.logout}>
            <Text>Logout</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen name="News" component={NewsFeedScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
      <Tab.Screen name="Profiles" component={ProfilesScreen} />
      <Tab.Screen name="Social" component={SocialMediaScreen} />
    </Tab.Navigator>
  );
}
```

---

## State Management Layer Deep Dive

### Core Responsibilities

#### 1. Centralized State Storage

Acts as a **single source of truth** for application data:

```typescript
// AuthContext - Manages ALL user data
type AuthState = {
  users: Record<string, User>;
  currentUserId: string | null;
}

// NewsContext - Manages ALL announcements
type NewsState = Announcement[];    // Array of all announcements

// EventsContext - Manages ALL events
type EventsState = EventItem[];     // Array of all events
```

**Why centralized?**
- ✅ Multiple screens can access same data (no prop drilling)
- ✅ Data consistency (one update reflects everywhere)
- ✅ Easier debugging (state in one place)

**Example**:
```typescript
// Without Context (bad - duplicated state)
function ProfilesScreen() {
  const [users, setUsers] = useState([...]);  // ❌ Local copy
}
function HeaderScreen() {
  const [users, setUsers] = useState([...]);  // ❌ Duplicate copy
}
// Problem: Updating users in one screen doesn't update the other!

// With Context (good - shared state)
function ProfilesScreen() {
  const { users } = useAuth();  // ✅ Shared state
}
function HeaderScreen() {
  const { users } = useAuth();  // ✅ Same state
}
// Benefit: One source of truth, auto-syncs everywhere
```

---

#### 2. Business Logic Encapsulation

All data manipulation logic lives in Context, **not** in UI components:

```typescript
// ❌ BAD: Business logic in component
function NewsFeedScreen() {
  const [items, setItems] = useState([]);
  
  function addAnnouncement(title, body) {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
    const newItem = {
      id,
      title,
      body,
      createdISO: new Date().toISOString()
    };
    setItems(prev => [newItem, ...prev]);  // Logic in component
    AsyncStorage.setItem('fbla:news:v1', JSON.stringify([newItem, ...items]));
  }
}

// ✅ GOOD: Business logic in Context
// NewsContext.tsx
function add(title: string, body: string) {
  const id = makeId();
  const newItem = {
    id,
    title: title.trim(),
    body: body.trim(),
    createdISO: new Date().toISOString()
  };
  setItems(prev => [newItem, ...prev]);  // Logic centralized
  // Persistence handled by useEffect automatically
}

// Component just calls the method
function NewsFeedScreen() {
  const { add } = useNews();
  
  function handleSave() {
    add(title, body);  // Simple, no logic
  }
}
```

---

#### 3. Data Persistence Coordination

Automatically syncs state changes to AsyncStorage:

```typescript
// AuthContext.tsx
export function AuthProvider({ children }) {
  const [state, setState] = useState<AuthState>({ users: {}, currentUserId: null });
  
  // 🔄 Load from disk on app start
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('fbla:auth:v1');
      if (raw) {
        setState(JSON.parse(raw));  // Hydrate state from disk
      } else {
        seedSampleUsers();  // First launch, create samples
      }
    })();
  }, []); // Runs once on mount
  
  // 🔄 Save to disk on every state change
  useEffect(() => {
    AsyncStorage.setItem('fbla:auth:v1', JSON.stringify(state));
  }, [state]); // Runs whenever state updates
  
  // ...
}
```

**Flow Diagram**:
```
App Launch
    ↓
useEffect([])  ← Runs once
    ↓
AsyncStorage.getItem('fbla:auth:v1')
    ↓
setState(loadedData)  → Triggers re-render
    ↓
Components get hydrated state

---

User Action (e.g., "Login")
    ↓
Context method: login(email, password)
    ↓
setState({ currentUserId: user.id })
    ↓
useEffect([state])  ← Detects state change
    ↓
AsyncStorage.setItem('fbla:auth:v1', JSON.stringify(state))
    ↓
Data saved to disk
```

---

#### 4. API Surface for Components

Provides a clean, typed interface for UI components:

```typescript
// What components can do (API methods)
interface AuthContextValue {
  // READ operations
  users: Record<string, User>;      // Get all users
  currentUser: User | null;         // Get logged-in user
  
  // WRITE operations
  register(...): Promise<User>;     // Create new user
  login(...): Promise<User>;        // Authenticate user
  logout(): void;                   // End session
  updateUser(...): Promise<User>;   // Modify user profile
}

// How components use it
function ProfilesScreen() {
  const { users, updateUser } = useAuth();  // Get what you need
  
  function saveProfile(id, patch) {
    updateUser(id, patch);  // Simple method call
  }
}
```

---

#### 5. State Derivation (Computed Properties)

Creates derived/computed values from raw state:

```typescript
// AuthContext
const value: AuthContextValue = {
  users: state.users,
  currentUser: state.currentUserId 
    ? state.users[state.currentUserId] ?? null  // ← Computed!
    : null,
  // ...methods
};

// Why computed?
// Instead of storing currentUser separately:
// BAD: { users: {...}, currentUserId: '123', currentUser: {...} }  ← Duplication!
// GOOD: { users: {...}, currentUserId: '123' }  ← Compute currentUser on demand
```

---

#### 6. State Mutation with Immutability

Ensures React detects changes correctly:

```typescript
// ❌ BAD: Mutating state directly
function updateUser(id, patch) {
  state.users[id].name = patch.name;  // Direct mutation - React won't re-render!
}

// ✅ GOOD: Immutable update
function updateUser(id, patch) {
  setState(prev => ({
    ...prev,  // Copy outer state
    users: {
      ...prev.users,  // Copy users object
      [id]: {
        ...prev.users[id],  // Copy user object
        ...patch  // Apply changes
      }
    }
  }));
  // React sees new object reference → triggers re-render
}
```

---

## Data Flow Diagrams

### Authentication Flow
```
┌──────────────┐
│ LoginScreen  │
└──────┬───────┘
       │ login(identifier, password)
       ▼
┌─────────────────────────────────────┐
│      AuthContext.login()            │
│  1. Find user by email/username     │
│  2. Verify password (plain compare) │
│  3. setState({currentUserId})       │
│  4. Persist to AsyncStorage         │
└─────────────┬───────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │ Navigation observes │
    │ currentUser != null │
    │   → switch to Main  │
    └─────────────────────┘
```

### News CRUD Flow
```
┌──────────────────┐
│ NewsFeedScreen   │
└────────┬─────────┘
         │ add(title, body)
         ▼
┌────────────────────────────────────┐
│     NewsContext.add()              │
│  1. Create Announcement object     │
│  2. Prepend to items array         │
│  3. setState → trigger useEffect   │
└────────┬───────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  useEffect([items])                │
│   AsyncStorage.setItem(            │
│     'fbla:news:v1',                │
│     JSON.stringify(items)          │
│   )                                │
└────────────────────────────────────┘
```

### Resource Tree Navigation Flow
```
User clicks folder → goInto(node)
                        │
                        ▼
              setPath(p => [...p, {id:node.id, name:node.name}])
                        │
                        ▼
              useMemo recomputes currentNode
                        │
                        ▼
              Traverse tree: root → path[0] → path[1] → ...
                        │
                        ▼
              FlatList renders currentNode.children
```

### Profile Edit Authorization Flow
```
User clicks Edit on ProfileCard
         │
         ▼
startEdit(user) checks:
  isAdmin || currentUser.id === user.id
         │
         ▼
   Open Modal with fields
         │
   If isAdmin → show role chips
         │
         ▼
User clicks Save → updateUser(id, patch)
         │
         ▼
AuthContext.updateUser():
  - Validate unique email/username
  - Merge patch into existing user
  - Apply role only if isAdmin
  - setState → persist to AsyncStorage
```

---

## Component Architecture

### Architectural Patterns in Use

#### 1. Provider Pattern (Composition Root)

**Implementation**:
```tsx
// App.tsx
export default function App() {
  return (
    <AuthProvider>
      <NewsProvider>
        <EventsProvider>
          <ResourcesProvider>
            <NavigationContainer>
              <Navigation />
            </NavigationContainer>
          </ResourcesProvider>
        </EventsProvider>
      </NewsProvider>
    </AuthProvider>
  );
}
```

**Benefits**:
- Single source of truth for each domain
- Automatic re-render propagation
- Easy to add new contexts without refactoring

---

#### 2. Repository Pattern (Context as Data Access Layer)

Each Context acts as a **repository** for its domain:

```typescript
// Abstract Repository Interface
interface Repository<T> {
  getAll(): T[];
  getById(id: string): T | null;
  add(item: Omit<T, 'id'>): void;
  update(id: string, patch: Partial<T>): void;
  remove(id: string): void;
}

// Concrete Implementation (NewsContext)
export function NewsProvider() {
  const [items, setItems] = useState<Announcement[]>([]);
  
  function add(title: string, body: string) {
    const id = generateId();
    setItems(prev => [{ id, title, body, createdISO: new Date().toISOString() }, ...prev]);
  }
  
  function update(id: string, patch: Partial<Announcement>) {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
  }
  
  function remove(id: string) {
    setItems(prev => prev.filter(item => item.id !== id));
  }
  
  return <NewsContext.Provider value={{ items, add, update, remove }}>...</NewsContext.Provider>;
}
```

---

#### 3. Observer Pattern (React's Built-in)

Components **observe** Context state via `useContext()`:

```typescript
// Component subscribes to state changes
function ProfilesScreen() {
  const { users } = useAuth(); // Observer subscription
  
  // Re-renders automatically when users changes
  return <FlatList data={Object.values(users)} />;
}
```

**Flow**:
```
setState() in Context
    ↓
React triggers re-render
    ↓
All subscribers (useContext consumers) re-execute
    ↓
Virtual DOM diffing
    ↓
Minimal UI updates
```

---

#### 4. Facade Pattern (Navigation Abstraction)

Navigation logic hides complexity from screens:

```typescript
// Navigation facade
export default function Navigation() {
  const { currentUser } = useAuth();
  const isLoggedIn = !!currentUser;
  
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isLoggedIn ? (
          <Stack.Group key="auth">
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group key="app">
            <Stack.Screen name="Main" component={MainTabs} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

#### 5. Factory Pattern (ID Generation)

```typescript
// ID Factory
function makeId(): string {
  return String(Date.now()) + Math.random().toString(36).slice(2, 8);
}

// Usage
const user: User = {
  id: makeId(), // Generated by factory
  email: 'test@example.com',
  // ...
};
```

---

#### 6. Strategy Pattern (Role-Based UI)

Different UI strategies based on user role:

```typescript
// ProfilesScreen.tsx
function ProfilesScreen() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  
  // Strategy selection
  const canEdit = (user: User) => isAdmin || currentUser?.id === user.id;
  const showRoleEditor = (user: User) => isAdmin;
  
  return (
    <FlatList
      data={users}
      renderItem={({ item }) => (
        <View>
          {canEdit(item) && <Button onPress={() => edit(item)}>Edit</Button>}
          {showRoleEditor(item) && <RoleSelector />}
        </View>
      )}
    />
  );
}
```

---

### Unidirectional Data Flow (Flux-like)

```
User Action (e.g., "Add Announcement")
    ↓
Component Handler (onPress)
    ↓
Context Method Call (news.add(title, body))
    ↓
setState() with new data
    ↓
useEffect triggers AsyncStorage.setItem()
    ↓
React re-renders subscribed components
    ↓
UI updates (new announcement appears)
```

---

## Security Architecture

### Current Implementation (v1)

```
┌──────────────────────────────────────────┐
│          UI Layer (Authorization)        │
│  if (isAdmin) { showRoleEditor() }       │
└──────────────────┬───────────────────────┘
                   │
                   │ No backend validation
                   │
┌──────────────────▼───────────────────────┐
│         Business Logic Layer             │
│  updateUser(id, patch) {                 │
│    // No role check here (v1)            │
│    setState(...)                         │
└──────────────────┬───────────────────────┘
                   │
                   │ Plaintext storage
                   │
┌──────────────────▼───────────────────────┐
│        AsyncStorage (No Encryption)      │
│  { "password": "pass123" }  ← Plaintext! │
└──────────────────────────────────────────┘
```

**Vulnerabilities**:
1. ❌ Passwords stored in plaintext
2. ❌ No server-side validation
3. ❌ Users can edit AsyncStorage directly
4. ❌ No session timeout/expiry

**Recommended v2 Architecture**:
```
┌──────────────────────────────────────────┐
│          UI Layer                        │
│  Authorization checks (unchanged)        │
└──────────────────┬───────────────────────┘
                   │
                   │ JWT tokens
                   │
┌──────────────────▼───────────────────────┐
│         Backend API (NEW)                │
│  POST /api/users/:id                     │
│    - Verify JWT token                    │
│    - Check user.role === 'admin'         │
│    - Validate patch                      │
│    - Return updated user                 │
└──────────────────┬───────────────────────┘
                   │
                   │ Hashed passwords (bcrypt)
                   │
┌──────────────────▼───────────────────────┐
│         Database (Supabase/Firebase)     │
│  { "password": "$2b$10$..." }  ← Hashed  │
└──────────────────────────────────────────┘
```

---

## Navigation Architecture

### State Machine Pattern

```
┌─────────────────────────────────────────────────────────┐
│                  Navigation State Machine                │
│                                                          │
│   State: isLoggedIn = !!currentUser                     │
│                                                          │
│   ┌──────────────┐                 ┌─────────────────┐ │
│   │  Auth Stack  │ ←──────────────→│   Main Tabs     │ │
│   │  - Login     │   logout/login  │   - News        │ │
│   │  - Register  │                 │   - Events      │ │
│   └──────────────┘                 │   - Resources   │ │
│                                     │   - Profiles    │ │
│                                     │   - Social      │ │
│                                     └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:
```typescript
{!isLoggedIn ? (
  <AuthStack />  // State A
) : (
  <MainTabs />   // State B
)}
```

**Transition Triggers**:
- Login success → `setState({ currentUserId: user.id })` → Switch to MainTabs
- Logout → `setState({ currentUserId: null })` → Switch to AuthStack

---

## Scaling Considerations

### Current Limitations

| Aspect | Limit | Reason |
|--------|-------|--------|
| Max Users | ~1000 | AsyncStorage size limits (~6MB) |
| Max Events | ~500 | FlatList performance degrades |
| Max Resources | ~100 files | No pagination |
| Search Speed | O(n) | Linear scan of arrays |

### Optimization Strategies for v2

#### 1. Pagination
```typescript
// Before (loads all)
const { events } = useEvents();

// After (loads 20 at a time)
const { events, loadMore, hasMore } = useEvents();
<FlatList
  data={events}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

#### 2. Indexing
```typescript
// Before (O(n) search)
users.filter(u => u.name.includes(query))

// After (O(1) lookup with index)
const usersByName = useMemo(() => {
  const index = new Map<string, User[]>();
  users.forEach(u => {
    const key = u.name.toLowerCase();
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(u);
  });
  return index;
}, [users]);
```

#### 3. Virtual Scrolling
```typescript
import { VirtualizedList } from 'react-native';

<VirtualizedList
  data={events}
  getItem={(data, index) => data[index]}
  getItemCount={() => events.length}
  renderItem={({ item }) => <EventCard event={item} />}
/>
```

---

## Testing Strategy

### Unit Test Structure (Recommended)

```typescript
// AuthContext.test.ts
describe('AuthContext', () => {
  let result: { current: AuthContextValue };
  
  beforeEach(() => {
    const { result: r } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });
    result = r;
  });
  
  test('register creates user with unique email', async () => {
    await act(() => result.current.register('test@example.com', 'pass123'));
    expect(result.current.users).toHaveProperty('test@example.com');
  });
  
  test('login fails with wrong password', async () => {
    await expect(
      result.current.login('admin@chapter.org', 'wrong')
    ).rejects.toThrow('Invalid credentials');
  });
});
```

### Integration Tests

```typescript
// EventsScreen.test.tsx
test('creating event updates list', async () => {
  const { getByText, getByPlaceholderText } = render(<EventsScreen />);
  fireEvent.press(getByText('+ Event'));
  fireEvent.changeText(getByPlaceholderText('Title'), 'Test Event');
  fireEvent.press(getByText('Create'));
  await waitFor(() => {
    expect(getByText('Test Event')).toBeInTheDocument();
  });
});
```

### Manual Testing Checklist

- [ ] Register new user → verify in Profiles tab
- [ ] Login with wrong password → see error
- [ ] Login with correct credentials → load main tabs
- [ ] Add announcement → appears in feed
- [ ] Edit announcement → changes save
- [ ] Delete announcement → confirm + disappears
- [ ] Add event with future date → shows in list
- [ ] Edit event time → updates persist
- [ ] Delete event → confirm + disappears
- [ ] Create folder → navigate into → breadcrumb correct
- [ ] Add file → displays in folder
- [ ] Rename file → updates persist
- [ ] Delete folder with contents → confirm + disappears
- [ ] Search profiles for "dan" → finds Dana Lee
- [ ] Edit own profile as member → saves
- [ ] Try to edit other profile as member → no Edit button
- [ ] Edit any profile as admin → role changes allowed
- [ ] Add social link → clickable → opens browser
- [ ] Delete social link → confirm + disappears
- [ ] Clear Data → restart → see seeded data
- [ ] Logout → return to login screen
- [ ] Test on iOS device
- [ ] Test on Android device

---

## Deployment & Build Configuration

### Technology Stack

```json
{
  "dependencies": {
    "expo": "~54.0.0",
    "react": "18.3.1",
    "react-native": "0.76.5",
    "@react-native-async-storage/async-storage": "^2.1.0",
    "@react-navigation/native": "^6.1.18",
    "@react-navigation/native-stack": "^6.11.0",
    "@react-navigation/bottom-tabs": "^6.6.1",
    "expo-document-picker": "~12.0.2",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.4.0"
  },
  "devDependencies": {
    "@types/react": "~18.3.0",
    "typescript": "~5.3.3"
  }
}
```

### Expo Configuration (app.json)

```json
{
  "expo": {
    "name": "FBLA Member App",
    "slug": "fbla-member-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/logo.png",  // Updated to use custom logo
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1E66FF"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "org.fbla.memberapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/logo.png",  // Updated for Android adaptive icon
        "backgroundColor": "#FFFFFF"
      },
      "package": "org.fbla.memberapp"
    }
  }
}
```

### Build Commands

```bash
# Development
npx expo start

# Production builds
eas build --platform ios --profile production
eas build --platform android --profile production

# OTA updates
eas update --branch production
```

---

## UI/UX Features

### Logo Integration
- **Login Screen**: 40x40 logo displayed at top center for branding
- **Main Screens**: 20x20 logo in top left corner of all tab headers
- **App Icon**: Custom logo used as app icon (iOS/Android)
- **Adaptive Icon**: Android uses logo as foreground image

### Responsive Design
- Components adapt to screen sizes
- Safe area handling for notched devices
- Portrait-only orientation

### Accessibility
- Text inputs with placeholders
- Touchable areas with sufficient size
- Color-coded roles for visual distinction

---

## Known Issues & Fixes

### 1. Text Rendering Error
**Issue**: "Text strings must be rendered within a <Text> component"
**Cause**: Plain strings in JSX not wrapped in `<Text>`
**Fix**: Ensure all text is inside `<Text>` tags, e.g., `<Text>{variable}</Text>`

### 2. File Upload Not Working
**Issue**: Document picker fails in Expo Go
**Cause**: Expo Go limitations with native modules
**Fix**: Test with development build or physical device

### 3. Announcements Not Showing
**Issue**: Empty news feed on first launch
**Cause**: AsyncStorage not seeded
**Fix**: Use "Clear Data" button to reseed sample data

### 4. Logo Not Visible
**Issue**: Logo appears cropped or too small
**Cause**: Image size or styling
**Fix**: Ensure logo.png is square, adjust width/height in styles

---

## File Structure

```
fbla-member-app/
├── App.tsx                      # Root component with provider nesting
├── src/
│   ├── context/
│   │   ├── AuthContext.tsx      # User auth + profile management
│   │   ├── NewsContext.tsx      # Announcements CRUD
│   │   ├── EventsContext.tsx    # Events CRUD
│   │   └── ResourcesContext.tsx # File/folder tree
│   ├── screens/
│   │   ├── LoginScreen.tsx      # Login with logo (40x40)
│   │   ├── RegisterScreen.tsx
│   │   ├── NewsFeedScreen.tsx
│   │   ├── EventsScreen.tsx
│   │   ├── ResourcesScreen.tsx
│   │   ├── ProfilesScreen.tsx
│   │   └── SocialMediaScreen.tsx
│   └── navigation/
│       └── index.tsx            # Stack + Tab navigation with logo (20x20)
├── docs/
│   └── project_prompt.md        # Feature specification
├── technical_doc.md             # This file
├── package.json
└── tsconfig.json
```

---

## Architecture Strengths

✅ **Separation of Concerns**: Clear boundaries between layers  
✅ **Testability**: Contexts can be tested independently  
✅ **Scalability**: Easy to add new domains (new Context)  
✅ **Maintainability**: Single Responsibility Principle per Context  
✅ **Performance**: Minimal re-renders (only subscribed components)  
✅ **Type Safety**: TypeScript enforces contracts  
✅ **Offline-First**: No network dependency  

---

## Architecture Weaknesses

❌ **No Backend**: All data local (no sync, no backup)  
❌ **Security**: Plaintext passwords, UI-only auth  
❌ **Scalability**: AsyncStorage size limits  
❌ **Real-Time**: No push notifications/live updates  
❌ **Deep Clone**: JSON parse/stringify loses functions/Dates  
❌ **No Middleware**: Can't intercept/log actions  

---

## Summary

**Architecture Type**: **Layered + Context-Based MVC**  
**State Pattern**: **Unidirectional Data Flow (Flux-inspired)**  
**Persistence**: **Local-First (AsyncStorage)**  
**Navigation**: **State Machine (Auth ↔ Main)**

The FBLA Member App uses a three-layer architecture with React Context providers managing all state and business logic. Data persists locally via AsyncStorage with automatic synchronization. The app follows React best practices with unidirectional data flow, immutable state updates, and separation of concerns between presentation and business logic layers.

---

**Document Version**: 2.0  
**Last Updated**: December 2024  
**Maintainer**: FBLA Chapter Development Team