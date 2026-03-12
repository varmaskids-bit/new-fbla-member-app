import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput,
  FlatList, Alert, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useResources } from '../context/ResourcesContext';

type PathEntry = { id: string; name: string };

export default function ResourcesScreen() {
  const { root, addFolder, addFile, rename, remove } = useResources();
  const [path, setPath] = React.useState<PathEntry[]>([]);
  const [newFolder, setNewFolder] = React.useState('');

  // Rename modal state (replaces iOS-only Alert.prompt)
  const [renameVisible, setRenameVisible] = React.useState(false);
  const [renameTarget, setRenameTarget] = React.useState<any>(null);
  const [renameText, setRenameText] = React.useState('');

  const currentNode = React.useMemo(() => {
    let cur = root;
    for (const seg of path) {
      cur = cur.children?.find((c: any) => c.id === seg.id) || cur;
    }
    return cur;
  }, [root, path]);

  function createFolder() {
    if (!newFolder.trim()) return;
    addFolder(path.map(p => p.id), newFolder.trim());
    setNewFolder('');
  }

  async function pickFile() {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
    if (!res.canceled && res.assets && res.assets.length > 0) {
      const file = res.assets[0];
      addFile(path.map(p => p.id), { name: file.name, uri: file.uri });
    }
  }

  function goInto(node: any) {
    if (node.type === 'folder') {
      setPath(p => [...p, { id: node.id, name: node.name }]);
    }
  }

  function goUp(index: number) {
    setPath(p => p.slice(0, index + 1));
  }

  function rootBack() {
    setPath([]);
  }

  function openRename(node: any) {
    setRenameTarget(node);
    setRenameText(node.name);
    setRenameVisible(true);
  }

  function confirmRename() {
    if (renameText.trim() && renameTarget) {
      rename([...path.map(p => p.id), renameTarget.id], renameText.trim());
    }
    setRenameVisible(false);
    setRenameTarget(null);
    setRenameText('');
  }

  function onDelete(node: any) {
    Alert.alert('Delete', `Delete "${node.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove([...path.map(p => p.id), node.id]) },
    ]);
  }

  return (
    <View style={styles.container}>
      {/* Breadcrumb */}
      <View style={styles.pathBar}>
        <TouchableOpacity onPress={rootBack}>
          <Text style={styles.pathItem}>root</Text>
        </TouchableOpacity>
        {path.map((p, i) => (
          <TouchableOpacity key={p.id} onPress={() => goUp(i)}>
            <Text style={styles.pathItem}> / {p.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TextInput
          placeholder="Folder name"
          value={newFolder}
          onChangeText={setNewFolder}
          style={styles.inputMini}
        />
        <TouchableOpacity style={styles.btn} onPress={createFolder}>
          <Text style={styles.btnText}>+ Folder</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={pickFile}>
          <Text style={styles.btnText}>+ File</Text>
        </TouchableOpacity>
      </View>

      {/* File list */}
      <FlatList
        data={currentNode.children || []}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.node} onPress={() => goInto(item)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nodeName}>{item.type === 'folder' ? '📁 ' : '📄 '}{item.name}</Text>
              {item.type === 'file' ? <Text style={styles.uri} numberOfLines={1}>{item.uri}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => openRename(item)}>
              <Text style={styles.action}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item)}>
              <Text style={[styles.action, { color: '#D00' }]}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Empty</Text>}
      />

      {/* Cross-platform Rename Modal (replaces Alert.prompt which is iOS-only) */}
      <Modal
        visible={renameVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameVisible(false)}
      >
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.dialog}>
              <Text style={styles.dialogTitle}>Rename</Text>
              <TextInput
                style={styles.dialogInput}
                value={renameText}
                onChangeText={setRenameText}
                autoFocus
                selectTextOnFocus
                returnKeyType="done"
                onSubmitEditing={confirmRename}
              />
              <View style={styles.dialogBtns}>
                <TouchableOpacity style={styles.dialogCancelBtn} onPress={() => setRenameVisible(false)}>
                  <Text style={styles.dialogCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dialogOkBtn} onPress={confirmRename}>
                  <Text style={styles.dialogOkText}>Rename</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12 },
  pathBar: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  pathItem: { fontWeight: '600', color: '#1E66FF' },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 },
  inputMini: { borderWidth: 1, borderColor: '#dbe9ff', padding: 8, borderRadius: 6, width: 140, marginRight: 8, marginBottom: 8 },
  btn: { backgroundColor: '#1E66FF', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginRight: 8, marginBottom: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  node: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#dbe9ff', padding: 10, borderRadius: 8, marginBottom: 8 },
  nodeName: { fontWeight: '600' },
  uri: { color: '#555', fontSize: 12, marginTop: 2, maxWidth: 180 },
  action: { marginLeft: 10, color: '#1E66FF', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: '#666' },
  // Rename Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  dialog: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: 300, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  dialogTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12, color: '#1E66FF' },
  dialogInput: { borderWidth: 1, borderColor: '#dbe9ff', borderRadius: 8, padding: 10, fontSize: 15, marginBottom: 16 },
  dialogBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  dialogCancelBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  dialogCancelText: { color: '#555', fontWeight: '600' },
  dialogOkBtn: { backgroundColor: '#1E66FF', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  dialogOkText: { color: '#fff', fontWeight: '700' },
});
