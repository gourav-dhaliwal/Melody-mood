import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Buffer } from 'buffer';
import { AuthContext } from './context/AuthContext';
import { ThemeContext } from './ThemeContext';

global.Buffer = Buffer;

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const CLIENT_ID = '790aa2a5b8514453afc433623add1fb8';
const CLIENT_SECRET = 'd9d344d4f89947dfa826698d127ee783';

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  const themed = {
    background: { backgroundColor: theme.background },
    card: { backgroundColor: theme.card },
    text: { color: theme.text },
    border: { borderColor: theme.border || '#ddd' },
  };

  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const getSpotifyToken = async () => {
    const creds = `${CLIENT_ID}:${CLIENT_SECRET}`;
    const encodedCreds = Buffer.from(creds).toString('base64');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${encodedCreds}`,
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return data.access_token;
  };

  const fetchTrackInfo = async (token, trackUrlOrId) => {
    let trackId = trackUrlOrId;

    if (trackUrlOrId.includes('spotify.com/track/')) {
      const parts = trackUrlOrId.split('track/');
      trackId = parts[1].split('?')[0];
    }

    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const track = await response.json();
    return {
      id: track.id,
      name: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      image: track.album.images[0]?.url,
      url: track.external_urls.spotify,
    };
  };

  const handleAddPlaylist = () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Playlist name cannot be empty');
      return;
    }
    setPlaylists((prev) => [
      ...prev,
      { id: Date.now(), name: newPlaylistName, songs: [] },
    ]);
    setNewPlaylistName('');
  };

  const handleAddSong = async (playlistId) => {
    if (!spotifyUrl.trim()) {
      Alert.alert('Error', 'Please enter a track URL or ID');
      return;
    }

    setLoading(true);
    try {
      const token = await getSpotifyToken();
      const trackInfo = await fetchTrackInfo(token, spotifyUrl);

      setPlaylists((prev) =>
        prev.map((playlist) =>
          playlist.id === playlistId
            ? { ...playlist, songs: [...playlist.songs, trackInfo] }
            : playlist
        )
      );
      setSpotifyUrl('');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSong = (playlistId, songId) => {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId
          ? { ...playlist, songs: playlist.songs.filter((s) => s.id !== songId) }
          : playlist
      )
    );
  };

  const openSpotify = (url) => {
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Cannot open URL'));
  };

  const renderSong = ({ item, playlistId }) => (
    <View style={[styles.songCard, themed.card]}>
      <Image source={{ uri: item.image }} style={styles.songImage} />
      <View style={styles.songInfo}>
        <Text style={[styles.songName, themed.text]}>{item.name}</Text>
        <Text style={[styles.songArtist, themed.text]}>{item.artist}</Text>
      </View>
      <View style={styles.songButtons}>
        <TouchableOpacity onPress={() => openSpotify(item.url)}>
          <Text style={styles.playText}>▶ Play</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleRemoveSong(playlistId, item.id)}>
          <Text style={styles.removeText}>✕ Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPlaylist = ({ item }) => (
    <View style={[styles.playlistCard, themed.card]}>
      <Text style={[styles.playlistTitle, themed.text]}>{item.name}</Text>

      <TextInput
        placeholder="Track URL or ID"
        placeholderTextColor="#aaa"
        value={spotifyUrl}
        onChangeText={setSpotifyUrl}
        style={[styles.input, themed.text, themed.card, themed.border]}
      />
      <TouchableOpacity
        style={styles.addSongButton}
        onPress={() => handleAddSong(item.id)}
      >
        <Text style={styles.addSongButtonText}>Add Song</Text>
      </TouchableOpacity>

      <Text style={[styles.songsHeading, themed.text]}>Songs</Text>

      {item.songs.length === 0 ? (
        <Text style={styles.noSongsText}>No songs added yet.</Text>
      ) : (
        <FlatList
          data={item.songs}
          keyExtractor={(song) => song.id}
          renderItem={({ item: song }) => renderSong({ item: song, playlistId: item.id })}
          scrollEnabled={false}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, themed.background]}>
      <View style={[styles.header, themed.card]}>
        <Text style={[styles.userText, themed.text]}>
          Logged in as: {user?.email || user?.name || user?.username || 'Welcome!'}
        </Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.newPlaylistSection}>
        <TextInput
          style={[styles.input, themed.text, themed.card, themed.border]}
          placeholder="New Playlist Name"
          placeholderTextColor="#aaa"
          value={newPlaylistName}
          onChangeText={setNewPlaylistName}
        />
        <TouchableOpacity style={styles.createPlaylistBtn} onPress={handleAddPlaylist}>
          <Text style={styles.createPlaylistBtnText}>Create Playlist</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={{ color: '#1DB954', marginTop: 8 }}>Loading...</Text>
        </View>
      )}

      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPlaylist}
        contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userText: { fontSize: 20, fontWeight: '600' },
  logoutBtn: {
    backgroundColor: '#ff5c5c',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutBtnText: { color: '#fff', fontWeight: '600' },
  newPlaylistSection: { paddingHorizontal: 16, marginBottom: 20 },
  input: {
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  createPlaylistBtn: {
    backgroundColor: '#1DB954',
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
  },
  createPlaylistBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  playlistCard: {
    marginBottom: 20,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  playlistTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  addSongButton: {
    backgroundColor: '#1DB954',
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  addSongButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  songsHeading: { fontWeight: '700', fontSize: 18, marginBottom: 8 },
  noSongsText: { fontStyle: 'italic', color: '#7f8c8d' },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  songImage: { width: 55, height: 55, borderRadius: 10, marginRight: 12 },
  songInfo: { flex: 1 },
  songName: { fontWeight: '700', fontSize: 16 },
  songArtist: { marginTop: 2 },
  songButtons: { flexDirection: 'row', alignItems: 'center' },
  playText: { color: '#1DB954', fontWeight: '700', marginRight: 15, fontSize: 14 },
  removeText: { color: '#ff5c5c', fontWeight: '700', fontSize: 14 },
  loadingContainer: { alignItems: 'center', marginBottom: 20 },
});

export default ProfileScreen;
