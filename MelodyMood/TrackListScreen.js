import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlaylists } from '../context/PlaylistContext';

const TrackListScreen = ({ route }) => {
  const { playlistId, playlistName, songs: initialSongs } = route.params;
  const [songs, setSongs] = useState(initialSongs || []);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const { playlists, addSongToPlaylist, removeSongFromPlaylist } = usePlaylists();
  
  const allTracks = [
    { id: '1', title: 'Blinding Lights', artist: 'The Weeknd' },
    { id: '2', title: 'Save Your Tears', artist: 'The Weeknd' },
    { id: '3', title: 'Stay', artist: 'The Kid LAROI, Justin Bieber' },
    { id: '4', title: 'Levitating', artist: 'Dua Lipa' },
    { id: '5', title: 'Good 4 U', artist: 'Olivia Rodrigo' },
  ];

  React.useEffect(() => {
    if (!initialSongs) {
      setSongs(allTracks);
    }
  }, []);

  const handleAddToPlaylist = (song) => {
    setSelectedSong(song);
    setShowPlaylistModal(true);
  };

  const handleRemoveFromPlaylist = (songId) => {
    removeSongFromPlaylist(playlistId, songId);
    setSongs(songs.filter(song => song.id !== songId));
  };

  const addToSelectedPlaylist = (targetPlaylistId) => {
    addSongToPlaylist(targetPlaylistId, selectedSong);
    setShowPlaylistModal(false);
  };

  const renderTrackItem = ({ item }) => (
    <View style={styles.trackItem}>
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{item.title}</Text>
        <Text style={styles.trackArtist}>{item.artist}</Text>
      </View>
      {playlistId ? (
        <TouchableOpacity onPress={() => handleRemoveFromPlaylist(item.id)}>
          <Ionicons name="trash" size={20} color="#ff4444" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => handleAddToPlaylist(item)}>
          <Ionicons name="add" size={24} color="#1DB954" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {playlistName && (
        <View style={styles.playlistHeader}>
          <Text style={styles.playlistTitle}>{playlistName}</Text>
          <Text style={styles.songCount}>{songs.length} songs</Text>
        </View>
      )}
      
      <FlatList
        data={songs}
        renderItem={renderTrackItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      
      <Modal
        visible={showPlaylistModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPlaylistModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Playlist</Text>
            <FlatList
              data={playlists.filter(p => p.id !== playlistId)}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.playlistOption}
                  onPress={() => addToSelectedPlaylist(item.id)}
                >
                  <Text style={styles.playlistOptionText}>{item.name}</Text>
                  <Text style={styles.playlistSongCount}>{item.songs.length} songs</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
            />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowPlaylistModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  playlistHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  playlistTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  songCount: {
    color: '#888',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  trackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 4,
  },
  trackArtist: {
    color: '#888',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  playlistOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  playlistOptionText: {
    color: 'white',
    fontSize: 16,
  },
  playlistSongCount: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#1DB954',
    fontSize: 16,
  },
});

export default TrackListScreen;