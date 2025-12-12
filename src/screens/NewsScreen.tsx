import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import ThemedText from '../components/ThemedText';
import NewsCard from '../components/NewsCard';
import { mockNews } from '../data/mock';

export default function NewsScreen(){
  return (
    <View style={styles.container}>
      <ThemedText size={24} weight="700">News</ThemedText>
      <FlatList
        data={mockNews}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => <NewsCard post={item} />}
        contentContainerStyle={{paddingTop:16}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#101114',padding:24}
});
