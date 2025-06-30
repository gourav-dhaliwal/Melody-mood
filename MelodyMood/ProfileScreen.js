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

global.Buffer = Buffer;

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const CLIENT_ID = '790aa2a5b8514453afc433623add1fb8';
const CLIENT_SECRET = 'd9d344d4f89947dfa826698d127ee783';

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Logged in user:', user); // Debug to check user object
  }, [user]);

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
          Alert.alert('Error', 'Cannot open URL');
        }
      })
      .catch((err) => console.error('Error opening URL:', err));
  };

  const renderSong = ({ item, playlistId }) => (
    <View style={styles.songCard}>
      <Image source={{ uri: item.image }} style={styles.songImage} />
      <View style={styles.songInfo}>
        <Text style={styles.songName}>{item.name}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
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
    <View style={styles.playlistCard}>
      <Text style={styles.playlistTitle}>{item.name}</Text>

      <TextInput
        placeholder="Track URL or ID"
        value={spotifyUrl}
        onChangeText={setSpotifyUrl}
        style={styles.input}
      />
      <TouchableOpacity
        style={styles.addSongButton}
        onPress={() => handleAddSong(item.id)}
      >
        <Text style={styles.addSongButtonText}>Add Song</Text>
      </TouchableOpacity>

      <Text style={styles.songsHeading}>Songs</Text>

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.userText}>
          {user?.name
            ? `Logged in as: ${user.name}`
            : user?.username
            ? `Logged in as: ${user.username}`
            : user?.email
            ? `User: ${user.email}`
            : 'Welcome!'}
        </Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.newPlaylistSection}>
        <TextInput
          style={styles.input}
          placeholder="New Playlist Name"
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
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
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
  userText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  logoutBtn: {
    backgroundColor: '#ff5c5c',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  newPlaylistSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
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
  createPlaylistBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  playlistCard: {
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  playlistTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#2c3e50',
  },
  addSongButton: {
    backgroundColor: '#1DB954',
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  addSongButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  songsHeading: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 8,
    color: '#34495e',
  },
  noSongsText: {
    fontStyle: 'italic',
    color: '#7f8c8d',
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef5f4',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  songImage: {
    width: 55,
    height: 55,
    borderRadius: 10,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  songName: {
    fontWeight: '700',
    fontSize: 16,
    color: '#2c3e50',
  },
  songArtist: {
    color: '#7f8c8d',
    marginTop: 2,
  },
  songButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playText: {
    color: '#1DB954',
    fontWeight: '700',
    marginRight: 15,
    fontSize: 14,
  },
  removeText: {
    color: '#ff5c5c',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default ProfileScreen;
