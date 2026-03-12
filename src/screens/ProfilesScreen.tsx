import React from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const ROLES: Array<'admin'|'secretary'|'treasurer'|'dealer'|'member'> = ['admin','secretary','treasurer','dealer','member'];
const ELEVATED_ROLES: Array<'admin'|'secretary'|'treasurer'|'dealer'> = ['admin', 'secretary', 'treasurer', 'dealer'];

function roleColor(role: string) {
  switch (role) {
    case 'admin': return { backgroundColor: '#D7263D' };
    case 'secretary': return { backgroundColor: '#FF9500' };
    case 'treasurer': return { backgroundColor: '#2E8B57' };
    case 'dealer': return { backgroundColor: '#6A4CFF' };
    default: return { backgroundColor: '#1E66FF' };
  }
}

export default function ProfilesScreen() {
  const { users, currentUser, updateUser, register } = useAuth();
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
  const [role, setRole] = React.useState<'admin'|'secretary'|'treasurer'|'dealer'|'member'>('member');
  const [password, setPassword] = React.useState('pass123');
  const [mode, setMode] = React.useState<'edit' | 'create-member' | 'create-role'>('edit');

  const isAdmin = currentUser?.role === 'admin';

  function resetForm() {
    setEditId(null);
    setName('');
    setUsername('');
    setEmail('');
    setGrade('');
    setChapter(currentUser?.chapter || '');
    setPassword('pass123');
    setRole('member');
  }

  function startEdit(u: any) {
    const canEdit = isAdmin || currentUser?.id === u.id;
    if (!canEdit) return;
    setMode('edit');
    setEditId(u.id);
    setName(u.name || '');
    setUsername(u.username || '');
    setEmail(u.email);
    setGrade(u.grade || '');
    setChapter(u.chapter || '');
    setRole(u.role || 'member');
    setOpen(true);
  }

  function startCreateMember() {
    if (!isAdmin) return;
    resetForm();
    setMode('create-member');
    setRole('member');
    setOpen(true);
  }

  function startCreateRole() {
    if (!isAdmin) return;
    resetForm();
    setMode('create-role');
    setRole('dealer');
    setOpen(true);
  }

  async function save() {
    if (!email.trim()) { Alert.alert('Validation', 'Email is required'); return; }
    if (!name.trim()) { Alert.alert('Validation', 'Name is required'); return; }
    if (!username.trim()) { Alert.alert('Validation', 'Username is required'); return; }
    try {
      if (mode === 'create-member' || mode === 'create-role') {
        const nextRole = mode === 'create-member' ? 'member' : role;
        if (mode === 'create-role' && !ELEVATED_ROLES.includes(nextRole as typeof ELEVATED_ROLES[number])) {
          Alert.alert('Validation', 'Choose an elevated role to create.');
          return;
        }
        await register(
          email.trim(),
          password,
          username.trim(),
          name.trim(),
          grade.trim(),
          chapter.trim(),
          nextRole
        );
        Alert.alert('Success', `${name.trim()} was added successfully.`);
        setOpen(false);
        return;
      }

      if (!editId) return;
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.toolbar}>
        <TextInput
          placeholder="Search members by name, username, email, chapter, or role"
          value={q}
          onChangeText={setQ}
          style={styles.search}
          autoCapitalize="none"
        />
        {isAdmin ? (
          <View style={styles.adminActions}>
            <TouchableOpacity style={styles.iconAction} onPress={startCreateMember}>
              <Text style={styles.iconActionGlyph}>➕</Text>
              <Text style={styles.iconActionText}>Add member</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconAction} onPress={startCreateRole}>
              <Text style={styles.iconActionGlyph}>🛡️</Text>
              <Text style={styles.iconActionText}>Create role</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
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
        <ScrollView contentContainerStyle={styles.modal} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalTitle}>
            {mode === 'edit' ? 'Edit Profile' : mode === 'create-member' ? 'Add Member' : 'Create Elevated Role'}
          </Text>
          <Text style={styles.helperText}>
            {mode === 'edit'
              ? 'Update member details. Only admins can change roles.'
              : mode === 'create-member'
                ? 'Only admins can add new members. New member accounts default to the member role.'
                : 'Only admins can create privileged accounts such as dealer, secretary, treasurer, or another admin.'}
          </Text>

          <Text style={styles.fieldLabel}>Full name</Text>
          <TextInput placeholder="Example: Jordan Carter" value={name} onChangeText={setName} style={styles.input}/>

          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput placeholder="Example: jordanc" value={username} onChangeText={setUsername} style={styles.input} autoCapitalize="none"/>

          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput placeholder="Example: jordan@chapter.org" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address"/>

          {(mode === 'create-member' || mode === 'create-role') ? (
            <>
              <Text style={styles.fieldLabel}>Temporary password</Text>
              <TextInput placeholder="Example: pass123" value={password} onChangeText={setPassword} style={styles.input} autoCapitalize="none"/>
            </>
          ) : null}

          <Text style={styles.fieldLabel}>Grade</Text>
          <TextInput placeholder="Example: 11" value={grade} onChangeText={setGrade} style={styles.input}/>

          <Text style={styles.fieldLabel}>Chapter</Text>
          <TextInput placeholder="Example: Central HS Chapter" value={chapter} onChangeText={setChapter} style={styles.input}/>

          {(isAdmin && mode !== 'create-member') ? (
            <>
              <Text style={styles.fieldLabel}>Role</Text>
              <View style={styles.roleRow}>
                {(mode === 'create-role' ? ELEVATED_ROLES : ROLES).map(r => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(r)}
                    style={[styles.roleChip, role === r && styles.roleChipActive]}
                  >
                    <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => setOpen(false)} style={styles.cancel}><Text>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={save} style={styles.save}><Text style={{color:'#fff'}}>{mode === 'edit' ? 'Save' : 'Create'}</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#fff', padding:12 },
  toolbar:{ marginBottom:12 },
  search:{ borderWidth:1, borderColor:'#dbe9ff', padding:10, borderRadius:8, marginBottom:10 },
  adminActions:{ flexDirection:'row', justifyContent:'flex-end' },
  iconAction:{ flexDirection:'row', alignItems:'center', backgroundColor:'#eef4ff', paddingVertical:10, paddingHorizontal:12, borderRadius:12, marginLeft:10, borderWidth:1, borderColor:'#dbe9ff' },
  iconActionGlyph:{ fontSize:16, marginRight:6 },
  iconActionText:{ color:'#1E66FF', fontWeight:'700' },
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
  modal:{ padding:16, backgroundColor:'#fff', paddingBottom:40 },
  modalTitle:{ fontSize:20, fontWeight:'700', marginBottom:12 },
  helperText:{ color:'#5b6b85', marginBottom:12, lineHeight:20 },
  fieldLabel:{ fontWeight:'700', color:'#102a56', marginBottom:6 },
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