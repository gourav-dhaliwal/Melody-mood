import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UserPlaylists = ({ navigation }) => {
  const [playlists, setPlaylists] = useState([
    { id: '1', name: 'Favorites', songs: 12 },
    { id: '2', name: 'Workout Mix', songs: 8 },
    { id: '3', name: 'Chill Vibes', songs: 15 },
  ]);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreate = () => {
    if (!newPlaylistName.trim()) return;
    setPlaylists([...playlists, {
      id: Date.now().toString(),
      name: newPlaylistName,
      songs: 0
    }]);
    setNewPlaylistName('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="New playlist name"
          placeholderTextColor="#888"
          value={newPlaylistName}
          onChangeText={setNewPlaylistName}
          onSubmitEditing={handleCreate}
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleCreate}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.playlistItem}
            onPress={() => navigation.navigate('TrackList', {
              playlistId: item.id,
              playlistName: item.name
            })}
          >
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.count}>{item.songs} songs</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: 'white',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#1DB954',
    borderRadius: 8,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  name: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  count: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
});

export default UserPlaylists;