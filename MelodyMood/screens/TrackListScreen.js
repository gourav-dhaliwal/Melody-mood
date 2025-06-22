import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking, ActivityIndicator, StyleSheet, Image, Alert } from 'react-native';
import { fetchTracksFromPlaylist } from '../utils/spotifyApi.js';
import { DownloadContext } from '../context/DownloadContext';
import { useHistory } from '../context/HistoryContext'; // New import
import { Ionicons } from '@expo/vector-icons';

const TrackListScreen = ({ route, navigation }) => {
  const { playlistId, playlistName } = route.params;
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { downloadSong } = useContext(DownloadContext);
  const { addToHistory } = useHistory(); // New history hook

  useEffect(() => {
    const getTracks = async () => {
      setLoading(true);
      try {
        const data = await fetchTracksFromPlaylist(playlistId);
        setTracks(data);
        
        // Add playlist to history when loaded
        if (data.length > 0) {
          addToHistory({
            id: playlistId,
            name: playlistName,
            type: 'playlist',
            image: data[0].track?.album?.images?.[0]?.url
          });
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load playlist tracks');
      } finally {
        setLoading(false);
      }
    };
    getTracks();
  }, [playlistId]);

  const handleTrackPress = (track) => {
    // Add track to history when played
    addToHistory({
      id: track.id,
      name: track.name,
      type: 'song',
      artist: track.artists?.[0]?.name,
      image: track.album?.images?.[0]?.url
    });

    const url = track.external_urls.spotify;
    if (url) {
      Linking.openURL(url);
    }
  };

  const handleDownloadPress = (track) => {
    const song = {
      id: track.id,
      name: track.name || 'Unknown Title',
      artist: track.artists?.[0]?.name || 'Unknown Artist',
      duration: track.duration_ms || 0,
      image: track.album?.images?.[0]?.url || '',
      url: track.external_urls?.spotify || '',
    };

    downloadSong(song);
    Alert.alert('Saved', `"${track.name}" has been added to your library.`);
  };

  const renderItem = ({ item }) => {
    const track = item.track;
    if (!track) return null;

    return (
      <View style={styles.trackItem}>
        <TouchableOpacity 
          onPress={() => handleTrackPress(track)} 
          style={styles.trackContent}
        >
          {track.album?.images?.[0]?.url && (
            <Image 
              source={{ uri: track.album.images[0].url }} 
              style={styles.albumArt} 
            />
          )}
          <View style={styles.trackInfo}>
            <Text style={styles.trackName} numberOfLines={1}>{track.name}</Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {track.artists.map(a => a.name).join(', ')}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => handleDownloadPress(track)}
          style={styles.downloadButton}
        >
          <Ionicons name="download" size={20} color="#1DB954" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Loading tracks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1DB954" />
        </TouchableOpacity>
        <Text style={styles.header} numberOfLines={1}>{playlistName || 'Playlist Tracks'}</Text>
      </View>
      
      <FlatList
        data={tracks}
        keyExtractor={(item, index) => item.track?.id || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tracks found in this playlist</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 15,
  },
  header: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  trackItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  trackContent: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 15,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  artistName: {
    fontSize: 14,
    color: '#b3b3b3',
    marginTop: 4,
  },
  downloadButton: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#b3b3b3',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#b3b3b3',
    textAlign: 'center',
  },
});

export default TrackListScreen;