import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { fetchTracksFromPlaylist } from '../utils/spotifyApi.js';
import { DownloadContext } from '../context/DownloadContext';  // import your context

const TrackListScreen = ({ route }) => {
  const { playlistId, playlistName } = route.params;
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get downloadSong function from context
  const { downloadSong } = useContext(DownloadContext);

  useEffect(() => {
    const getTracks = async () => {
      setLoading(true);
      const data = await fetchTracksFromPlaylist(playlistId);
      setTracks(data);
      setLoading(false);
    };
    getTracks();
  }, [playlistId]);

  const handleTrackPress = (track) => {
    const url = track.external_urls.spotify;
    if (url) {
      Linking.openURL(url);
    }
  };

  // Handle download button press
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
alert(`"${track.name}" has been saved to your library.`);
};


  const renderItem = ({ item }) => {
    const track = item.track;
    if (!track) return null;

    return (
      <View style={styles.trackItem}>
        <TouchableOpacity onPress={() => handleTrackPress(track)} style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
          {track.album && track.album.images.length > 0 && (
            <Image source={{ uri: track.album.images[0].url }} style={styles.albumArt} />
          )}
          <View style={styles.trackInfo}>
            <Text style={styles.trackName}>{track.name}</Text>
            <Text style={styles.artistName}>{track.artists.map(a => a.name).join(', ')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.downloadButton} onPress={() => handleDownloadPress(track)}>
<Text style={styles.downloadButtonText}>Saved to Library</Text>
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

  if (tracks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No tracks found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{playlistName || 'Playlist Tracks'}</Text>
      <FlatList
        data={tracks}
        keyExtractor={(item, index) => item.track?.id || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  trackItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  trackInfo: {
    marginLeft: 12,
    flex: 1,
  },
  trackName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  artistName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  downloadButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 12,
  },
  downloadButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default TrackListScreen;
