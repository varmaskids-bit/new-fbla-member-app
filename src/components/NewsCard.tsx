import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import ThemedText from './ThemedText';

type Post = { id: string; title: string; body?: string; imageUrl?: string };

export default function NewsCard({ post }: { post: Post }){
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <ThemedText size={18} weight="600">{post.title}</ThemedText>
      {post.imageUrl ? <Image source={{uri: post.imageUrl}} style={styles.img} /> : null}
      {post.body ? <ThemedText color="#9aa0a6" style={{marginTop:8}}>{post.body}</ThemedText> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor:'#151617', padding:16, borderRadius:12, marginBottom:12 },
  img: { width:'100%', height:160, borderRadius:8, marginTop:8 }
});
