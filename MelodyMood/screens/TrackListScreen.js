import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  StyleSheet,
  Image,
  Alert,
  Share,
} from 'react-native';
import { fetchTracksFromPlaylist } from '../utils/spotifyApi.js';
import { DownloadContext } from '../context/DownloadContext';
import { useHistory } from '../context/HistoryContext';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';

const TrackListScreen = ({ route, navigation }) => {
  const { playlistId, playlistName } = route.params;
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isShuffling, setIsShuffling] = useState(false);

  const { downloadSong } = useContext(DownloadContext);
  const { addToHistory } = useHistory();
  const { theme } = useContext(ThemeContext);

  const themed = {
    background: { backgroundColor: theme.background },
    text: { color: theme.text },
    card: { backgroundColor: theme.card },
    border: { borderColor: theme.border || '#333' },
  };

  useEffect(() => {
    const getTracks = async () => {
      setLoading(true);
      try {
        const data = await fetchTracksFromPlaylist(playlistId);
        const shuffled = isShuffling ? [...data].sort(() => Math.random() - 0.5) : data;
        setTracks(shuffled);

        if (data.length > 0) {
          addToHistory({
            id: playlistId,
            name: playlistName,
            type: 'playlist',
            image: data[0].track?.album?.images?.[0]?.url,
          });
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load playlist tracks');
      } finally {
        setLoading(false);
      }
    };
    getTracks();
  }, [playlistId, isShuffling]);

  const handleTrackPress = async (track) => {
    addToHistory({
      id: track.id,
      name: track.name,
      type: 'song',
      artist: track.artists?.[0]?.name,
       spotifyUrl: track.external_urls?.spotify, 
      image: track.album?.images?.[0]?.url,
    });

    const url = track.external_urls.spotify;
    if (url) {
      await Linking.openURL(url);
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

  const handleSharePress = async (track) => {
    try {
      const message = `🎵 Check out this song: "${track.name}" by ${track.artists
        .map((a) => a.name)
        .join(', ')}\nListen here: ${track.external_urls?.spotify}`;
      await Share.share({ message });
    } catch (error) {
      Alert.alert('Error', 'Unable to share the track.');
    }
  };

  const renderItem = ({ item }) => {
    const track = item.track;
    if (!track) return null;

    return (
      <View style={[styles.trackItem, themed.card, themed.border]}>
        <TouchableOpacity onPress={() => handleTrackPress(track)} style={styles.trackContent}>
          {track.album?.images?.[0]?.url && (
            <Image source={{ uri: track.album.images[0].url }} style={styles.albumArt} />
          )}
          <View style={styles.trackInfo}>
            <Text style={[styles.trackName, themed.text]} numberOfLines={1}>
              {track.name}
            </Text>
            <Text style={[styles.artistName, themed.text]} numberOfLines={1}>
              {track.artists.map((a) => a.name).join(', ')}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => handleDownloadPress(track)} style={styles.downloadButton}>
            <Ionicons name="download" size={20} color="#1DB954" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleSharePress(track)} style={styles.downloadButton}>
            <Ionicons name="share-social" size={20} color="#1DB954" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, themed.background]}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={[styles.loadingText, themed.text]}>Loading tracks...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, themed.background]}>
      <View style={[styles.headerContainer, themed.card, themed.border]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1DB954" />
        </TouchableOpacity>
        <Text style={[styles.header, themed.text]} numberOfLines={1}>
          {playlistName || 'Playlist Tracks'}
        </Text>
      </View>

      <View style={[styles.controlBar, themed.card, themed.border]}>
        <TouchableOpacity onPress={() => setIsShuffling((prev) => !prev)} style={styles.controlButton}>
          <Ionicons
            name={isShuffling ? 'shuffle' : 'shuffle-outline'}
            size={24}
            color={isShuffling ? '#1DB954' : theme.text}
          />
          <Text style={[styles.controlLabel, themed.text]}>Shuffle</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tracks}
        keyExtractor={(item, index) => item.track?.id || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, themed.text]}>No tracks found in this playlist</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  backButton: { marginRight: 15 },
  header: { flex: 1, fontSize: 18, fontWeight: 'bold' },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    borderBottomWidth: 1,
  },
  controlButton: { alignItems: 'center' },
  controlLabel: { fontSize: 12, marginTop: 4 },
  trackItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 0.5,
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
  trackInfo: { flex: 1 },
  trackName: { fontSize: 16, fontWeight: '600' },
  artistName: { fontSize: 14, marginTop: 4 },
  downloadButton: { padding: 8 },
  listContent: { paddingBottom: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 10, fontSize: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: { fontSize: 16, textAlign: 'center' },
});

export default TrackListScreen;
