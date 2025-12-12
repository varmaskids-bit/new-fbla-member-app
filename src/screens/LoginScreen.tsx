import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const auth = useAuth();
  const nav = useNavigation<any>();
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');

  function validate(): string | null {
    if (!identifier.trim()) return 'Username or email is required';
    if (!password) return 'Password is required';
    return null;
  }

  async function onLogin() {
    const err = validate();
    if (err) return Alert.alert('Validation', err);
    try {
      await auth.login(identifier.trim(), password);
      // Do not navigate/reset; Navigation switches to Main when currentUser is set
    } catch (e: any) {
      Alert.alert('Login failed', e.message || String(e));
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Username or Email"
        value={identifier}
        onChangeText={setIdentifier}
        style={styles.input}
        autoCapitalize="none"
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />

      <TouchableOpacity style={styles.button} onPress={onLogin}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <Text style={styles.smallText}>No account?</Text>
        <TouchableOpacity onPress={() => nav.navigate('Register')}>
          <Text style={styles.linkText}> Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#1E66FF', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#dbe9ff', padding: 12, borderRadius: 8, marginBottom: 10, backgroundColor: '#fff' },
  button: { backgroundColor: '#1E66FF', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  buttonText: { color: 'white', fontWeight: '700' },
  row: { flexDirection: 'row', marginTop: 12, alignItems: 'center', justifyContent: 'center' },
  smallText: { color: '#666' },
  linkText: { color: '#1E66FF', fontWeight: '700' },
});
