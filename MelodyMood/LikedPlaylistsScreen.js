import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LikedPlaylistsContext } from './context/LikedPlaylistsContext';
import { ThemeContext } from './ThemeContext';

const LikedPlaylistsScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { likedPlaylists, setLikedPlaylists } = useContext(LikedPlaylistsContext);

  const clearAllLikedPlaylists = () => {
    Alert.alert(
      "Clear All",
      "Are you sure you want to remove all liked playlists?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Clear All", 
          onPress: async () => {
            try {
              setLikedPlaylists([]); // Clear in context
              await AsyncStorage.removeItem('likedPlaylists'); // Clear in storage
            } catch (err) {
              console.error("Error clearing liked playlists:", err);
            }
          } 
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.text + '20' }]}
      onPress={() =>
    navigation.navigate('Playlists', {
  screen: 'TrackList',
  params: {
    playlistId: item.id,
    playlistName: item.name,}
        })
      }
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {likedPlaylists.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={clearAllLikedPlaylists}>
          <Text style={styles.clearBtnText}>Clear All Liked Playlists</Text>
        </TouchableOpacity>
      )}

      {likedPlaylists.length === 0 ? (
        <Text style={[styles.empty, { color: theme === 'dark' ? '#fff' : theme.text }]}>
          No liked playlists yet.
        </Text>
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
  clearBtn: {
    backgroundColor: '#d9534f',
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 12,
  },
  clearBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
