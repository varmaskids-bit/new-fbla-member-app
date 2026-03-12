import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
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
  const [pickerMode, setPickerMode] = React.useState<'date' | 'time' | null>(null);

  const eventDate = React.useMemo(() => new Date(year, month - 1, day, hour, minute), [year, month, day, hour, minute]);

  function syncFromDate(next: Date) {
    setYear(next.getFullYear());
    setMonth(next.getMonth() + 1);
    setDay(next.getDate());
    setHour(next.getHours());
    setMinute(next.getMinutes());
  }

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

  function handlePickerChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS !== 'ios') {
      setPickerMode(null);
    }
    if (event.type === 'dismissed' || !selectedDate) {
      return;
    }

    if (pickerMode === 'date') {
      const merged = new Date(selectedDate);
      merged.setHours(hour, minute, 0, 0);
      syncFromDate(merged);
      return;
    }

    if (pickerMode === 'time') {
      const merged = new Date(eventDate);
      merged.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
      syncFromDate(merged);
    }
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
            <Text style={styles.addText}>＋ Create Event</Text>
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
        <ScrollView contentContainerStyle={styles.modal} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalTitle}>{editingId?'Edit Event':'New Event'}</Text>
          <Text style={styles.helperText}>Use the fields below to give your event a clear title, location, and an easy-to-read start time.</Text>

          <Text style={styles.fieldLabel}>Event title</Text>
          <TextInput placeholder="Example: FBLA Chapter Mixer" value={title} onChangeText={setTitle} style={styles.input}/>

          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput placeholder="Example: Join members for networking, snacks, and chapter updates." value={description} onChangeText={setDescription} style={[styles.input, styles.multilineInput]} multiline textAlignVertical="top"/>

          <Text style={styles.fieldLabel}>Location</Text>
          <TextInput placeholder="Example: Central HS Room 201 or Online Webinar" value={location} onChangeText={setLocation} style={styles.input}/>

          <Text style={styles.fieldLabel}>Event date</Text>
          <TouchableOpacity style={styles.nativePickerButton} onPress={() => setPickerMode('date')}>
            <Text style={styles.nativePickerLabel}>Choose date</Text>
            <Text style={styles.selectedValue}>{eventDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</Text>
          </TouchableOpacity>

          <Text style={styles.fieldLabel}>Start time</Text>
          <TouchableOpacity style={styles.nativePickerButton} onPress={() => setPickerMode('time')}>
            <Text style={styles.nativePickerLabel}>Choose time</Text>
            <Text style={styles.selectedValue}>{eventDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
          </TouchableOpacity>

          {pickerMode ? (
            <View style={styles.nativePickerWrap}>
              <DateTimePicker
                value={eventDate}
                mode={pickerMode}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handlePickerChange}
              />
            </View>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity onPress={()=>{ setOpen(false); }} style={styles.cancel}><Text>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={save} style={styles.save}><Text style={{color:'#fff'}}>{editingId?'Update':'Create'}</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#fff', padding:12 },
  addBtn:{ backgroundColor:'#1E66FF', padding:12, borderRadius:8, marginBottom:12, alignItems:'center'},
  addText:{ color:'#fff', fontWeight:'700' },
  event:{ flexDirection:'row', padding:12, borderWidth:1, borderColor:'#dbe9ff', borderRadius:8, marginBottom:8 },
  title:{ fontWeight:'700', fontSize:16 },
  meta:{ color:'#555', marginTop:4 },
  location:{ color:'#1E66FF', marginTop:2 },
  delete:{ color:'#D00', fontWeight:'600', paddingLeft:12, alignSelf:'center' },
  modal:{ padding:16, backgroundColor:'#fff', paddingBottom:36 },
  modalTitle:{ fontSize:20, fontWeight:'700', marginBottom:12 },
  helperText:{ color:'#5b6b85', lineHeight:20, marginBottom:12 },
  fieldLabel:{ fontWeight:'700', color:'#102a56', marginBottom:6 },
  selectedValue:{ color:'#1E66FF', fontWeight:'600', marginBottom:10 },
  nativePickerButton:{ borderWidth:1, borderColor:'#dbe9ff', borderRadius:12, padding:14, backgroundColor:'#fff', marginBottom:12 },
  nativePickerLabel:{ color:'#5b6b85', fontSize:12, fontWeight:'600', marginBottom:6 },
  nativePickerWrap:{ borderWidth:1, borderColor:'#dbe9ff', borderRadius:12, backgroundColor:'#fff', marginBottom:12, overflow:'hidden' },
  input:{ borderWidth:1, borderColor:'#dbe9ff', padding:10, borderRadius:8, marginBottom:12 },
  multilineInput:{ minHeight:90 },
  actions:{ flexDirection:'row', justifyContent:'flex-end', marginTop:12 },
  cancel:{ padding:12, marginRight:12 },
  save:{ backgroundColor:'#1E66FF', padding:12, borderRadius:8 }
});
