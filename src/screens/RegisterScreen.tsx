// Remove password suggestion overlay impact by:
// 1. Disabling all autofill/textContentType hints
// 2. Using automatic scroll-to-focused field so top fields aren't covered
// 3. Adding bottom padding so accessory overlays stay away from inputs

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const ROLES: Array<'admin'|'secretary'|'treasurer'|'dealer'|'member'> = ['admin','secretary','treasurer','dealer','member'];

export default function RegisterScreen() {
  const auth = useAuth();
  const nav = useNavigation<any>();
  const passRef = React.useRef<TextInput>(null);
  const confirmRef = React.useRef<TextInput>(null);
  const scrollRef = React.useRef<ScrollView>(null);

  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [name, setName] = React.useState('');
  const [grade, setGrade] = React.useState('');
  const [chapter, setChapter] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [role, setRole] = React.useState<'admin'|'secretary'|'treasurer'|'dealer'|'member'>('member');

  function validate(): string | null {
    if (!username.trim()) return 'Username is required';
    if (!name.trim()) return 'Full name is required';
    if (!email.trim()) return 'Email is required';
    if (!password) return 'Password is required';
    if (!confirm) return 'Confirm password is required';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  }

  async function onRegister() {
    const err = validate();
    if (err) return Alert.alert('Validation', err);
    try {
      await auth.register(email.trim(), password, username.trim(), name.trim(), grade.trim(), chapter.trim(), role);
      Alert.alert('Success', 'Account created! Please sign in.');
      nav.navigate('Login');
    } catch (e: any) {
      Alert.alert('Registration failed', e.message || String(e));
    }
  }

  function ensureVisible(ref: React.RefObject<TextInput | null>) {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
      ref.current?.focus();
    }, 30);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Register</Text>

          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
            textContentType="none"
            autoComplete="off"
            importantForAutofill="no"
          />
          <TextInput
            placeholder="Full name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            textContentType="none"
            autoComplete="off"
            importantForAutofill="no"
          />
          <TextInput
            placeholder="Grade (e.g. 10)"
            value={grade}
            onChangeText={setGrade}
            style={styles.input}
            keyboardType="numeric"
            textContentType="none"
            autoComplete="off"
            importantForAutofill="no"
          />
          <TextInput
            placeholder="Chapter (e.g. Central HS)"
            value={chapter}
            onChangeText={setChapter}
            style={styles.input}
            textContentType="none"
            autoComplete="off"
            importantForAutofill="no"
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="none"
            autoComplete="off"
            importantForAutofill="no"
          />

          <View style={styles.passRow}>
            <TextInput
              ref={passRef}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              style={[styles.input, { flex: 1 }]}
              secureTextEntry={!showPass}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="oneTimeCode"
              autoComplete="off"
              importantForAutofill="no"
              onFocus={() => ensureVisible(passRef)}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => {
                setShowPass(p => !p);
                setTimeout(() => passRef.current?.focus(), 0);
              }}
            >
              <Text style={styles.eyeText}>{showPass ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.passRow}>
            <TextInput
              ref={confirmRef}
              placeholder="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              style={[styles.input, { flex: 1 }]}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="oneTimeCode"
              autoComplete="off"
              importantForAutofill="no"
              onFocus={() => ensureVisible(confirmRef)}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => {
                setShowConfirm(p => !p);
                setTimeout(() => confirmRef.current?.focus(), 0);
              }}
            >
              <Text style={styles.eyeText}>{showConfirm ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subLabel}>Role</Text>
          <View style={styles.roleRow}>
            {ROLES.map(r => (
              <TouchableOpacity
                key={r}
                onPress={() => setRole(r)}
                style={[styles.roleChip, role === r && styles.roleChipActive]}
              >
                <Text style={[styles.roleText, role === r && styles.roleTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={onRegister}>
            <Text style={styles.buttonText}>Create account</Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.smallText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => nav.navigate('Login')}>
              <Text style={styles.linkText}> Sign in</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingTop: 40 },
  title: { fontSize: 22, fontWeight: '700', color: '#1E66FF', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#dbe9ff', padding: 12, borderRadius: 8, marginBottom: 8, backgroundColor: '#fff' },
  passRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { marginLeft: 8, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#1E66FF' },
  eyeText: { color: '#1E66FF', fontWeight: '700' },
  button: { backgroundColor: '#1E66FF', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: 'white', fontWeight: '700' },
  smallText: { color: '#0b2b66' },
  linkText: { color: '#1E66FF', fontWeight: '700' },
  bottomRow: { flexDirection: 'row', marginTop: 12, alignItems: 'center', justifyContent: 'center' },
  roleRow: { flexDirection:'row', flexWrap:'wrap', marginBottom:12 },
  roleChip: { paddingVertical:6, paddingHorizontal:12, borderRadius:20, borderWidth:1, borderColor:'#dbe9ff', marginRight:8, marginTop:6 },
  roleChipActive: { backgroundColor:'#1E66FF', borderColor:'#1E66FF' },
  roleText: { color:'#1E66FF', fontWeight:'600', fontSize:12 },
  roleTextActive: { color:'#fff' },
  subLabel: { fontSize:13, fontWeight:'600', marginBottom:4, color:'#0b2b66' },
});
