import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import ThemedText from '../components/ThemedText';
import { mockEvents, mockNews } from '../data/mock';
import EventCard from '../components/EventCard';
import NewsCard from '../components/NewsCard';
import { ScrollView } from 'react-native';

export default function HomeScreen(){
  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom:40}}>
      <ThemedText size={24} weight="700">Home</ThemedText>
      <ThemedText color="#9aa0a6" style={{marginTop:8}}>Welcome to the FBLA member app.</ThemedText>

      <ThemedText size={18} weight="600" style={{marginTop:18}}>Upcoming Events</ThemedText>
      {mockEvents.map(e => <EventCard key={e.id} event={e} />)}

      <ThemedText size={18} weight="600" style={{marginTop:12}}>Latest News</ThemedText>
      {mockNews.map(n => <NewsCard key={n.id} post={n} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#101114',padding:24}
});
