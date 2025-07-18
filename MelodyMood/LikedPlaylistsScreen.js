import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LikedPlaylistsContext } from './context/LikedPlaylistsContext';
import { ThemeContext } from './ThemeContext';



const LikedPlaylistsScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);

  const { likedPlaylists } = useContext(LikedPlaylistsContext);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card,{ backgroundColor: theme.card, borderColor: theme.text + '20' }]}
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {likedPlaylists.length === 0 ? (
        <Text
        style={[
          styles.empty,
          { color: theme === 'dark' ? '#fff' : theme.text },
        ]}
      >No liked playlists yet.</Text>
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
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  card: {

    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  empty: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 60,
    fontWeight: '500',
  },
});