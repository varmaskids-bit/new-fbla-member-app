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