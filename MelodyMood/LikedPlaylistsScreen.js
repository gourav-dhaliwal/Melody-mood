import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LikedPlaylistsContext } from './context/LikedPlaylistsContext';

const LikedPlaylistsScreen = ({ navigation }) => {
  const { likedPlaylists } = useContext(LikedPlaylistsContext);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('TrackList', {
          playlistId: item.id,
          playlistName: item.name,
        })
      }
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {likedPlaylists.length === 0 ? (
        <Text style={styles.empty}>No liked playlists yet.</Text>
      ) : (
        <FlatList
          data={likedPlaylists}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

export default LikedPlaylistsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e1e', padding: 16 },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 50, fontSize: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b2b2b',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  image: { width: 64, height: 64, borderRadius: 8, marginRight: 12 },
  info: { flex: 1 },
  name: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
