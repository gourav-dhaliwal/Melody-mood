import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { LikedPlaylistsContext } from './context/LikedPlaylistsContext';
import { NotificationContext } from './context/NotificationContext';

const ManagePlaylists = ({ navigation }) => {
  const { likedPlaylists, toggleLike } = useContext(LikedPlaylistsContext);
  const { addNotification } = useContext(NotificationContext);

  const handleRemove = (playlist) => {
    toggleLike(playlist);
    addNotification(`Removed "${playlist.name}" from your playlists`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Playlists</Text>
      
      {likedPlaylists.length === 0 ? (
        <Text style={styles.emptyText}>You haven't liked any playlists yet</Text>
      ) : (
        <FlatList
          data={likedPlaylists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.playlistItem}>
              <View style={styles.playlistInfo}>
                <Text style={styles.playlistName}>{item.name}</Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('TrackList', {
                    playlistId: item.id,
                    playlistName: item.name,
                  })}
                >
                  <Text style={styles.viewText}>View Tracks</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleRemove(item)}
              >
                <Text style={styles.actionButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  playlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5,
  },
  viewText: {
    color: '#1DB954',
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontSize: 16,
    marginTop: 20,
  },
});

export default ManagePlaylists;