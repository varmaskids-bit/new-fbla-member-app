import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import ThemedText from './ThemedText';

type Resource = { id: string; title: string; fileType?: string };

export default function ResourceCard({ resource }: { resource: Resource }){
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <ThemedText size={16} weight="600">{resource.title}</ThemedText>
      {resource.fileType ? <ThemedText color="#9aa0a6" style={{marginTop:6}}>{resource.fileType.toUpperCase()}</ThemedText> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor:'#151617', padding:16, borderRadius:12, marginBottom:12 }
});
