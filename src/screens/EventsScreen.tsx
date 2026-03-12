import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEvents } from '../context/EventsContext';

function pad(n:number){ return n.toString().padStart(2,'0'); }

export default function EventsScreen() {
  const { events, add, update, remove } = useEvents();
  const [open,setOpen]=React.useState(false);
  const [editingId,setEditingId]=React.useState<string|null>(null);
  const [title,setTitle]=React.useState('');
  const [description,setDescription]=React.useState('');
  const [location,setLocation]=React.useState('');
  const [year,setYear]=React.useState(new Date().getFullYear());
  const [month,setMonth]=React.useState(new Date().getMonth()+1);
  const [day,setDay]=React.useState(new Date().getDate());
  const [hour,setHour]=React.useState(9);
  const [minute,setMinute]=React.useState(0);

  function reset() {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setLocation('');
    const d=new Date();
    setYear(d.getFullYear()); setMonth(d.getMonth()+1); setDay(d.getDate()); setHour(9); setMinute(0);
  }

  function openNew(){ reset(); setOpen(true); }

  function openEdit(ev:any){
    setEditingId(ev.id);
    setTitle(ev.title);
    setDescription(ev.description||'');
    setLocation(ev.location||'');
    const date=new Date(ev.startISO);
    setYear(date.getFullYear());
    setMonth(date.getMonth()+1);
    setDay(date.getDate());
    setHour(date.getHours());
    setMinute(date.getMinutes());
    setOpen(true);
  }

  function save() {
    if (!title.trim()) { Alert.alert('Title required'); return; }
    const iso = new Date(`${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00`).toISOString();
    if (editingId) {
      update(editingId,{ title:title.trim(), description:description.trim(), location:location.trim(), startISO: iso });
    } else {
      add({ title:title.trim(), description:description.trim(), location:location.trim(), startISO: iso });
    }
    setOpen(false);
  }

  function del(id:string) {
    Alert.alert('Delete','Confirm delete?',[
      { text:'Cancel', style:'cancel'},
      { text:'Delete', style:'destructive', onPress:()=>remove(id)}
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={events.sort((a,b)=>a.startISO.localeCompare(b.startISO))}
        keyExtractor={i=>i.id}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addBtn} onPress={openNew}>
            <Text style={styles.addText}>+ Event</Text>
          </TouchableOpacity>
        }
        renderItem={({item}) => {
          const d=new Date(item.startISO);
          return (
            <TouchableOpacity style={styles.event} onPress={()=>openEdit(item)}>
              <View style={{flex:1}}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>{d.toLocaleDateString()} {pad(d.getHours())}:{pad(d.getMinutes())}</Text>
                {item.location ? <Text style={styles.location}>{item.location}</Text> : null}
              </View>
              <TouchableOpacity onPress={()=>del(item.id)}>
                <Text style={styles.delete}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={open} animationType="slide" onRequestClose={()=>setOpen(false)}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>{editingId?'Edit Event':'New Event'}</Text>
          <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input}/>
          <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input}/>
          <TextInput placeholder="Location" value={location} onChangeText={setLocation} style={styles.input}/>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <NumberPicker value={year} setValue={setYear} min={2020} max={2030}/>
            <NumberPicker value={month} setValue={setMonth} min={1} max={12}/>
            <NumberPicker value={day} setValue={setDay} min={1} max={31}/>
          </View>
            <View style={styles.row}>
              <Text style={styles.label}>Time:</Text>
              <NumberPicker value={hour} setValue={setHour} min={0} max={23}/>
              <NumberPicker value={minute} setValue={setMinute} min={0} max={59} step={5}/>
            </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={()=>{ setOpen(false); }} style={styles.cancel}><Text>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={save} style={styles.save}><Text style={{color:'#fff'}}>{editingId?'Update':'Create'}</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function NumberPicker({ value, setValue, min, max, step=1 }: { value:number; setValue:(v:number)=>void; min:number; max:number; step?:number }) {
  const nums: number[] = [];
  for (let i=min;i<=max;i+=step) nums.push(i);
  return (
    <View style={pickerStyles.wrap}>
      <Text style={pickerStyles.current}>{value}</Text>
      <View style={pickerStyles.buttons}>
        <TouchableOpacity disabled={value<=min} onPress={()=>setValue(value - step)}><Text style={pickerStyles.btn}>-</Text></TouchableOpacity>
        <TouchableOpacity disabled={value>=max} onPress={()=>setValue(value + step)}><Text style={pickerStyles.btn}>+</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  wrap:{ alignItems:'center', marginHorizontal:6 },
  current:{ fontSize:16, fontWeight:'600' },
  buttons:{ flexDirection:'row', marginTop:4 },
  btn:{ fontSize:18, paddingHorizontal:8 }
});

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#fff', padding:12 },
  addBtn:{ backgroundColor:'#1E66FF', padding:12, borderRadius:8, marginBottom:12, alignItems:'center'},
  addText:{ color:'#fff', fontWeight:'700' },
  event:{ flexDirection:'row', padding:12, borderWidth:1, borderColor:'#dbe9ff', borderRadius:8, marginBottom:8 },
  title:{ fontWeight:'700', fontSize:16 },
  meta:{ color:'#555', marginTop:4 },
  location:{ color:'#1E66FF', marginTop:2 },
  delete:{ color:'#D00', fontWeight:'600', paddingLeft:12, alignSelf:'center' },
  modal:{ flex:1, padding:16, backgroundColor:'#fff' },
  modalTitle:{ fontSize:20, fontWeight:'700', marginBottom:12 },
  input:{ borderWidth:1, borderColor:'#dbe9ff', padding:10, borderRadius:8, marginBottom:8 },
  row:{ flexDirection:'row', alignItems:'center', marginVertical:6 },
  label:{ width:50, fontWeight:'600' },
  actions:{ flexDirection:'row', justifyContent:'flex-end', marginTop:12 },
  cancel:{ padding:12, marginRight:12 },
  save:{ backgroundColor:'#1E66FF', padding:12, borderRadius:8 }
});
