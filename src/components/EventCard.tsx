import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import ThemedText from './ThemedText';

type Event = {
  id: string;
  title: string;
  startAt: number;
  location?: string;
};

export default function EventCard({ event, onDelete }: { event: Event; onDelete?: (id: string) => void }){
  return (
    <View style={styles.card}>
      <ThemedText size={18} weight="600">{event.title}</ThemedText>
      <ThemedText color="#9aa0a6" style={{marginTop:6}}>{new Date(event.startAt).toLocaleString()}</ThemedText>
      {event.location ? <ThemedText color="#9aa0a6" style={{marginTop:6}}>{event.location}</ThemedText> : null}
      {onDelete ? (
        <TouchableOpacity onPress={() => onDelete(event.id)} style={styles.delete}>
          <ThemedText color="#ff6b6b">Delete</ThemedText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor:'#151617', padding:16, borderRadius:12, marginBottom:12 },
  delete: { marginTop: 8 }
});
