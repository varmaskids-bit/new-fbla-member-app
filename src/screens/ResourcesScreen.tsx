import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useResources } from '../context/ResourcesContext';

type PathEntry = { id:string; name:string };

export default function ResourcesScreen() {
  const { root, addFolder, addFile, rename, remove } = useResources();
  const [path,setPath]=React.useState<PathEntry[]>([]);
  const [newFolder,setNewFolder]=React.useState('');
  const currentNode = React.useMemo(()=>{
    let cur = root;
    for (const seg of path){
      cur = cur.children?.find(c=>c.id===seg.id) || cur;
    }
    return cur;
  },[root,path]);

  function createFolder() {
    if (!newFolder.trim()) return;
    addFolder(path.map(p=>p.id), newFolder.trim());
    setNewFolder('');
  }

  async function pickFile() {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory:true, multiple:false });
    if (res.type === 'success') {
      addFile(path.map(p=>p.id), { name: res.name, uri: res.uri });
    }
  }

  function goInto(node:any) {
    if (node.type==='folder') {
      setPath(p=>[...p,{ id:node.id, name:node.name }]);
    }
  }

  function goUp(index:number) {
    setPath(p=>p.slice(0,index+1));
  }

  function rootBack() {
    setPath([]);
  }

  function onRename(node:any) {
    Alert.prompt('Rename', 'Enter new name', text => {
      if (text?.trim()) rename([...path.map(p=>p.id), node.id], text.trim());
    }, 'plain-text', node.name);
  }

  function onDelete(node:any) {
    Alert.alert('Delete', 'Confirm?', [
      { text:'Cancel', style:'cancel'},
      { text:'Delete', style:'destructive', onPress:()=>remove([...path.map(p=>p.id), node.id])}
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.pathBar}>
        <TouchableOpacity onPress={rootBack}><Text style={styles.pathItem}>root</Text></TouchableOpacity>
        {path.map((p,i)=>(
          <TouchableOpacity key={p.id} onPress={()=>goUp(i)}>
            <Text style={styles.pathItem}> / {p.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actions}>
        <TextInput
          placeholder="Folder name"
          value={newFolder}
          onChangeText={setNewFolder}
          style={styles.inputMini}
        />
        <TouchableOpacity style={styles.btn} onPress={createFolder}><Text style={styles.btnText}>+ Folder</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={pickFile}><Text style={styles.btnText}>+ File</Text></TouchableOpacity>
      </View>

      <FlatList
        data={currentNode.children || []}
        keyExtractor={i=>i.id}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.node} onPress={()=>goInto(item)}>
            <View style={{flex:1}}>
              <Text style={styles.nodeName}>{item.type==='folder' ? '📁 ' : '📄 '}{item.name}</Text>
              {item.type==='file' ? <Text style={styles.uri} numberOfLines={1}>{item.uri}</Text> : null}
            </View>
            <TouchableOpacity onPress={()=>onRename(item)}><Text style={styles.action}>Rename</Text></TouchableOpacity>
            <TouchableOpacity onPress={()=>onDelete(item)}><Text style={[styles.action,{color:'#D00'}]}>Delete</Text></TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Empty</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#fff', padding:12 },
  pathBar:{ flexDirection:'row', flexWrap:'wrap', marginBottom:8 },
  pathItem:{ fontWeight:'600', color:'#1E66FF' },
  actions:{ flexDirection:'row', alignItems:'center', flexWrap:'wrap', marginBottom:12 },
  inputMini:{ borderWidth:1, borderColor:'#dbe9ff', padding:8, borderRadius:6, width:140, marginRight:8, marginBottom:8 },
  btn:{ backgroundColor:'#1E66FF', paddingVertical:8, paddingHorizontal:12, borderRadius:6, marginRight:8, marginBottom:8 },
  btnText:{ color:'#fff', fontWeight:'700' },
  node:{ flexDirection:'row', alignItems:'center', borderWidth:1, borderColor:'#dbe9ff', padding:10, borderRadius:8, marginBottom:8 },
  nodeName:{ fontWeight:'600' },
  uri:{ color:'#555', fontSize:12, marginTop:2, maxWidth:180 },
  action:{ marginLeft:10, color:'#1E66FF', fontWeight:'600' },
  empty:{ textAlign:'center', marginTop:40, color:'#666' }
});
