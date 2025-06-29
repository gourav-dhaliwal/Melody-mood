import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Buffer } from 'buffer';


global.Buffer = Buffer;

const CLIENT_ID = '790aa2a5b8514453afc433623add1fb8';
const CLIENT_SECRET = 'd9d344d4f89947dfa826698d127ee783';

const ProfileScreen = () => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const getSpotifyToken = async () => {
    const creds = `${CLIENT_ID}:${CLIENT_SECRET}`;
    const encodedCreds = Buffer.from(creds).toString('base64');

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${encodedCreds}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Spotify token');
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error fetching token:', error);
      throw error;
    }
  };

  const fetchTrackInfo = async (token, trackUrlOrId) => {
    let trackId = trackUrlOrId;

    if (trackUrlOrId.includes('spotify.com/track/')) {
      const parts = trackUrlOrId.split('track/');
      trackId = parts[1].split('?')[0];
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch track info. Check the URL or try again.');
      }

      const track = await response.json();
      return {
        id: track.id,
        name: track.name,
        artist: track.artists.map((a) => a.name).join(', '),
        image: track.album.images[0]?.url,
        url: track.external_urls.spotify,
      };
    } catch (error) {
      console.error('Error fetching track info:', error);
      throw error;
    }
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
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Cannot open Spotify URL');
        }
      })
      .catch((err) => console.error('Error opening URL:', err));
  };

  const renderPlaylist = ({ item }) => (
    <View style={styles.playlistItem}>
      <Text style={styles.playlistName}>{item.name}</Text>
      <TextInput
        placeholder="Spotify Track URL or ID"
        value={spotifyUrl}
        onChangeText={setSpotifyUrl}
        style={styles.input}
      />
      <Button title="Add Song" onPress={() => handleAddSong(item.id)} />
      <Text style={styles.songsTitle}>Songs:</Text>
      {item.songs.length > 0 ? (
        item.songs.map((song) => (
          <View key={song.id} style={styles.songItem}>
            <Image source={{ uri: song.image }} style={styles.songImage} />
            <Text style={styles.songName}>
              {song.name} — {song.artist}
            </Text>
            <View style={styles.songActions}>
              <TouchableOpacity onPress={() => openSpotify(song.url)}>
                <Text style={styles.playText}>Play</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRemoveSong(item.id, song.id)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noSongsText}>No songs added yet.</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="New Playlist Name"
        value={newPlaylistName}
        onChangeText={setNewPlaylistName}
      />
      <Button title="Create Playlist" onPress={handleAddPlaylist} />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text>Loading...</Text>
        </View>
      )}
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPlaylist}
        style={styles.playlistList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8, borderRadius: 4 },
  playlistList: { marginTop: 16 },
  playlistItem: { marginBottom: 16, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8 },
  playlistName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  songsTitle: { marginTop: 8, fontWeight: 'bold' },
  songItem: { marginVertical: 6 },
  songImage: { width: 50, height: 50, marginRight: 12, borderRadius: 4 },
  songName: { fontSize: 16 },
  songActions: { flexDirection: 'row', marginTop: 4 },
  playText: { color: 'blue', fontWeight: 'bold', marginRight: 12 },
  removeText: { color: 'red', fontWeight: 'bold' },
  noSongsText: { fontStyle: 'italic', marginTop: 8 },
  loadingContainer: { marginTop: 16, alignItems: 'center' },
});

export default ProfileScreen;
