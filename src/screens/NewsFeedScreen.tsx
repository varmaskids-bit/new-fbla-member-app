import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useNews } from '../context/NewsContext';

export default function NewsFeedScreen() {
  const { items, add, update, remove } = useNews();
  const [open,setOpen]=React.useState(false);
  const [editing,setEditing]=React.useState<string|null>(null);
  const [title,setTitle]=React.useState('');
  const [body,setBody]=React.useState('');

  function startNew(){ setEditing(null); setTitle(''); setBody(''); setOpen(true); }
  function startEdit(a:any){ setEditing(a.id); setTitle(a.title); setBody(a.body); setOpen(true); }
  function save(){
    if(!title.trim()) return Alert.alert('Title required');
    if(editing) update(editing,{ title:title.trim(), body:body.trim() });
    else add(title, body);
    setOpen(false);
  }
  function del(id:string){
    Alert.alert('Delete','Confirm?',[
      { text:'Cancel', style:'cancel'},
      { text:'Delete', style:'destructive', onPress:()=>remove(id)}
    ]);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addBtn} onPress={startNew}><Text style={styles.addText}>+ Announcement</Text></TouchableOpacity>
      <FlatList
        data={items}
        keyExtractor={i=>i.id}
        ListEmptyComponent={<Text style={styles.empty}>No announcements</Text>}
        renderItem={({item})=>{
          const d=new Date(item.createdISO);
          return (
            <TouchableOpacity style={styles.card} onPress={()=>startEdit(item)}>
              <View style={{flex:1}}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.date}>{d.toLocaleDateString()} {d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</Text>
                <Text style={styles.body} numberOfLines={4}>{item.body}</Text>
              </View>
              <TouchableOpacity onPress={()=>del(item.id)}><Text style={styles.del}>Delete</Text></TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
      <Modal visible={open} animationType="slide" onRequestClose={()=>setOpen(false)}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>{editing?'Edit Announcement':'New Announcement'}</Text>
          <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input}/>
          <TextInput
            placeholder="Body"
            value={body}
            onChangeText={setBody}
            style={[styles.input,{height:140,textAlignVertical:'top'}]}
            multiline
          />
          <View style={styles.actions}>
            <TouchableOpacity onPress={()=>setOpen(false)} style={styles.cancel}><Text>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={save} style={styles.save}><Text style={{color:'#fff'}}>{editing?'Update':'Post'}</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles=StyleSheet.create({
  container:{ flex:1, backgroundColor:'#fff', padding:12 },
  addBtn:{ backgroundColor:'#1E66FF', padding:12, borderRadius:8, alignItems:'center', marginBottom:12 },
  addText:{ color:'#fff', fontWeight:'700' },
  empty:{ textAlign:'center', marginTop:40, color:'#666' },
  card:{ flexDirection:'row', borderWidth:1, borderColor:'#dbe9ff', padding:12, borderRadius:8, marginBottom:10 },
  title:{ fontSize:16, fontWeight:'700' },
  date:{ color:'#555', fontSize:12, marginVertical:4 },
  body:{ color:'#333', fontSize:13 },
  del:{ color:'#D00', fontWeight:'600', paddingLeft:10, alignSelf:'center' },
  modal:{ flex:1, padding:16, backgroundColor:'#fff' },
  modalTitle:{ fontSize:20, fontWeight:'700', marginBottom:12 },
  input:{ borderWidth:1, borderColor:'#dbe9ff', padding:10, borderRadius:8, marginBottom:10 },
  actions:{ flexDirection:'row', justifyContent:'flex-end' },
  cancel:{ padding:12, marginRight:12 },
  save:{ backgroundColor:'#1E66FF', padding:12, borderRadius:8 }
});