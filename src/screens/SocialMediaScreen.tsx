import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LinkItem = { id: string; platform: string; url: string };

const KEY = 'fbla:social:v1';

export default function SocialMediaScreen() {
  const [items,setItems]=React.useState<LinkItem[]>([]);
  const [platform,setPlatform]=React.useState('');
  const [url,setUrl]=React.useState('');

  React.useEffect(()=>{ (async()=>{ const raw=await AsyncStorage.getItem(KEY); if(raw) setItems(JSON.parse(raw)); })(); },[]);
  React.useEffect(()=>{ AsyncStorage.setItem(KEY, JSON.stringify(items)).catch(()=>{}); },[items]);

  function add() {
    if(!url.trim()) return;
    setItems(s=>[{ id:Date.now()+Math.random().toString(36).slice(2), platform: platform.trim() || 'Link', url:url.trim() }, ...s]);
    setUrl('');
  }
  function remove(id:string){
    Alert.alert('Delete','Confirm?',[
      { text:'Cancel', style:'cancel'},
      { text:'Delete', style:'destructive', onPress:()=>setItems(s=>s.filter(i=>i.id!==id))}
    ]);
  }
  function openLink(raw: string) {
    const url = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
    Linking.openURL(url).catch(()=>Alert.alert('Cannot open link'));
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          value={platform}
          onChangeText={setPlatform}
          placeholder="Platform (e.g. Facebook)"
          style={[styles.input,{width:180}]}
          autoCapitalize="none"
        />
        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder="https://chapter.example"
          style={[styles.input,{flex:1}]}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.addBtn} onPress={add}><Text style={styles.addText}>Add</Text></TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={i=>i.id}
        ListEmptyComponent={<Text style={styles.empty}>No links</Text>}
        renderItem={({item})=>(
          <View style={styles.card}>
            <View style={{flex:1}}>
              <Text style={styles.platform}>{item.platform}</Text>
              <TouchableOpacity onPress={()=>openLink(item.url)}>
                <Text style={styles.url} numberOfLines={1}>{item.url}</Text>
                <Text style={styles.open}>Open</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={()=>remove(item.id)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#fff', padding:12 },
  row:{ flexDirection:'row', marginBottom:12, alignItems:'center' },
  input:{ borderWidth:1, borderColor:'#dbe9ff', padding:10, borderRadius:8, marginRight:8 },
  addBtn:{ backgroundColor:'#1E66FF', paddingVertical:10, paddingHorizontal:14, borderRadius:8 },
  addText:{ color:'#fff', fontWeight:'700' },
  card:{ flexDirection:'row', borderWidth:1, borderColor:'#dbe9ff', padding:12, borderRadius:8, marginBottom:10 },
  platform:{ fontWeight:'700', marginBottom:4 },
  url:{ color:'#1E66FF', fontSize:12, textDecorationLine:'underline' },
  open:{ color:'#1E66FF', fontSize:11, marginTop:2 },
  delete:{ color:'#D00', fontWeight:'600', paddingLeft:12, alignSelf:'center' },
  empty:{ textAlign:'center', marginTop:40, color:'#666' }
});