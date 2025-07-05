import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaylists } from '../context/PlaylistContext';

const PlaylistManagement = ({ navigation }) => {
  const { playlists, addPlaylist, deletePlaylist, updatePlaylist } = usePlaylists();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  
  const handleCreate = () => {
    if (!newPlaylistName.trim()) return;
    addPlaylist(newPlaylistName);
    setNewPlaylistName('');
  };

  
  const handleDelete = (id) => {
    Alert.alert(
      'Delete Playlist',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deletePlaylist(id) }
      ]
    );
  };

  // EDIT playlist
  const handleEdit = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName);
  };

  // SAVE edited name
  const saveEdit = (id) => {
    if (!editName.trim()) return;
    updatePlaylist(id, { name: editName });
    setEditingId(null);
  };

  // NAVIGATE to track list
  const openPlaylist = (playlist) => {
    navigation.navigate('TrackList', {
      playlistId: playlist.id,
      playlistName: playlist.name,
      songs: playlist.songs || []
    });
  };

  return (
    <View style={styles.container}>
      {/* Create new playlist input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New playlist name"
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

      {/* Playlist list */}
      <FlatList
        data={playlists}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.playlistItem}>
            {editingId === item.id ? (
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                autoFocus
                onSubmitEditing={() => saveEdit(item.id)}
              />
            ) : (
              <TouchableOpacity 
                style={styles.playlistInfo}
                onPress={() => openPlaylist(item)}
              >
                <Text style={styles.playlistName}>{item.name}</Text>
                <Text style={styles.songCount}>{item.songs?.length || 0} songs</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.actions}>
              {editingId === item.id ? (
                <TouchableOpacity onPress={() => saveEdit(item.id)}>
                  <Ionicons name="checkmark" size={24} color="#1DB954" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => handleEdit(item.id, item.name)}>
                  <Ionicons name="pencil" size={20} color="gray" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash" size={20} color="#ff4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,  
  },
  header: {
    marginBottom: 30,  
  },
  title: {
    color: 'white',
    fontSize: 28,  
    fontWeight: 'bold',
  },
  playlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,  
    marginBottom: 16,  
    height: 80,  
  },
  playlistName: {
    color: 'white',
    fontSize: 18,  
    fontWeight: '600',
  },
  songCount: {
    color: '#888',
    fontSize: 16,  
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 25,  
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: 'white',
    borderRadius: 8,
    padding: 16, 
    fontSize: 16,  
    marginRight: 12,
  },
  addButton: {
    backgroundColor: '#1DB954',
    borderRadius: 8,
    width: 56,  
    height: 56,  
    justifyContent: 'center',
    alignItems: 'center',
  },

  editInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 4,
  },
});

export default PlaylistManagement;