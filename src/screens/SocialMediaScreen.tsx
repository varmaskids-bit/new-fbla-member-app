import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet, Linking } from 'react-native';
import { useSocial } from '../context/SocialContext';

export default function SocialMediaScreen() {
  const { links, add, remove, clear } = useSocial();
  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');

  const sorted = useMemo(() => [...links].sort((a, b) => a.platform.localeCompare(b.platform)), [links]);

  function open(raw: string) {
    const u = raw.trim().startsWith('http') ? raw.trim() : `https://${raw.trim()}`;
    Linking.openURL(u).catch(() => Alert.alert('Error', 'Cannot open link'));
  }

  function onAdd() {
    if (!platform.trim() || !url.trim()) return;
    add(platform, url);
    setPlatform('');
    setUrl('');
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput value={platform} onChangeText={setPlatform} placeholder="Platform" style={styles.input} />
        <TextInput value={url} onChangeText={setUrl} placeholder="URL" style={styles.input} autoCapitalize="none" />
        <TouchableOpacity onPress={onAdd} style={styles.addBtn}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={clear} style={styles.resetBtn}>
        <Text style={styles.resetText}>Reset to defaults</Text>
      </TouchableOpacity>

      <FlatList
        data={sorted}
        keyExtractor={(x) => x.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.platform}>{item.platform}</Text>
              <TouchableOpacity onPress={() => open(item.url)}>
                <Text style={styles.url}>{item.url}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => remove(item.id)} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 },
  addBtn: { backgroundColor: '#1E66FF', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: '700' },
  resetBtn: { alignSelf: 'flex-start', marginBottom: 10 },
  resetText: { color: '#1E66FF', fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 10, marginBottom: 10 },
  platform: { fontSize: 16, fontWeight: '700' },
  url: { color: '#1E66FF', marginTop: 4 },
  deleteBtn: { marginLeft: 12, padding: 8 },
  deleteText: { color: '#D7263D', fontWeight: '700' },
});