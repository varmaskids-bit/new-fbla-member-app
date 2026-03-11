import React from 'react';
import { View, StyleSheet, Image, TextInput, FlatList, ViewStyle } from 'react-native';
import ThemedText from '../components/ThemedText';
import { useProfiles, Profile } from '../context/ProfilesContext';

export default function ProfileScreen(){
  const { profiles } = useProfiles();
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if(!q) return profiles;
    return profiles.filter((p) => (p.name + ' ' + p.email + ' ' + p.chapter).toLowerCase().includes(q));
  }, [profiles, query]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search members"
        placeholderTextColor="#9aa0a6"
        value={query}
        onChangeText={setQuery}
        style={styles.search}
      />

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<ThemedText color="#9aa0a6">No members yet</ThemedText>}
        renderItem={({ item }) => (
          <View style={styles.row as ViewStyle}>
            <Image source={require('../../assets/placeholder.png')} style={styles.avatar} />
            <View style={{ marginLeft: 12 }}>
              <ThemedText size={16} weight="700">{item.name}</ThemedText>
              <ThemedText color="#9aa0a6">{item.email}</ThemedText>
              <ThemedText color="#9aa0a6">Chapter: {item.chapter}</ThemedText>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#101114',padding:12},
  avatar:{width:56,height:56,borderRadius:28},
  row:{flexDirection:'row',alignItems:'center',padding:12,backgroundColor:'#0f1113',borderRadius:8,marginBottom:8},
  search:{backgroundColor:'#1b1d22',borderRadius:8,padding:12,color:'white',marginBottom:12}
});
