import React, { useState, useContext } from 'react';
import {
  View,
  TextInput,
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
  Modal,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Buffer } from 'buffer';
import { AuthContext } from './context/AuthContext';
import { ThemeContext } from './ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

global.Buffer = Buffer;

const { width } = Dimensions.get('window');
const { user, logout } = useContext(AuthContext);


const dailySongsList = [
  { id: '1', name: 'Shape of You', artist: 'Ed Sheeran', url: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3' },
  { id: '2', name: 'Blinding Lights', artist: 'The Weeknd', url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b' },
  { id: '3', name: 'Levitating', artist: 'Dua Lipa', url: 'https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9' },
];

const CLIENT_ID = '790aa2a5b8514453afc433623add1fb8';
const CLIENT_SECRET = 'd9d344d4f89947dfa826698d127ee783';

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

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
  const [quote, setQuote] = useState('');
  const [dailySongModalVisible, setDailySongModalVisible] = useState(false);
  const [dailySong, setDailySong] = useState(null);

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
    let trackId = trackUrlOrId.includes('spotify.com/track/')
      ? trackUrlOrId.split('track/')[1].split('?')[0]
      : trackUrlOrId;

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
    if (!newPlaylistName.trim()) return Alert.alert('Error', 'Playlist name cannot be empty');
    setPlaylists([...playlists, { id: Date.now(), name: newPlaylistName, songs: [] }]);
    setNewPlaylistName('');
  };

  const handleAddSong = async (playlistId) => {
    if (!spotifyUrl.trim()) return Alert.alert('Error', 'Enter a valid Spotify track URL or ID');
    setLoading(true);
    try {
      const token = await getSpotifyToken();
      const trackInfo = await fetchTrackInfo(token, spotifyUrl);
      setPlaylists(playlists.map(pl => pl.id === playlistId ? { ...pl, songs: [...pl.songs, trackInfo] } : pl));
      setSpotifyUrl('');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSong = (playlistId, songId) => {
    setPlaylists(playlists.map(pl => pl.id === playlistId ? { ...pl, songs: pl.songs.filter(s => s.id !== songId) } : pl));
  };

  const openSpotify = (url) => {
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Cannot open Spotify link'));
  };

  const fetchQuote = async () => {
    try {
      const res = await fetch('https://zenquotes.io/api/random');
      const data = await res.json();
      setQuote(data?.[0] ? `${data[0].q} — ${data[0].a}` : '');
    } catch {
      setQuote("Couldn't fetch quote. Try again!");
    }
  };

  const handleOpenDailySongModal = () => {
    setDailySong(dailySongsList[Math.floor(Math.random() * dailySongsList.length)]);
    setDailySongModalVisible(true);
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
      <TouchableOpacity style={styles.addSongButton} onPress={() => handleAddSong(item.id)}>
        <Text style={styles.addSongButtonText}>Add Song</Text>
      </TouchableOpacity>

      <Text style={[styles.songsHeading, themed.text]}>Songs</Text>
      {item.songs.length === 0 ? (
        <Text style={styles.noSongsText}>No songs added yet.</Text>
      ) : (
        <FlatList
          data={item.songs}
          keyExtractor={(s) => s.id}
          renderItem={({ item: song }) => renderSong({ item: song, playlistId: item.id })}
          scrollEnabled={false}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, themed.background]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
          <View style={[styles.header, themed.card]}>
  <View style={styles.headerTop}>
    <Ionicons name="person-circle-outline" size={28} color={theme.text} style={{ marginRight: 8 }} />
    <Text style={[styles.userText, themed.text]}>
      {user?.email || 'Guest'}
    </Text>
  </View>
</View>


          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={fetchQuote}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Quote</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleOpenDailySongModal}>
              <Ionicons name="musical-notes-outline" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Discover</Text>
            </TouchableOpacity>
          </View>

          {quote !== '' && (
            <Text style={{ textAlign: 'center', fontStyle: 'italic', color: theme.text, marginBottom: 16 }}>
              {quote}
            </Text>
          )}

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
            scrollEnabled={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </ScrollView>

     
        <View style={styles.bottomActions}>
          <View style={styles.rowButtons}>
           <TouchableOpacity
  style={styles.bottomBtn}
  onPress={() => navigation.navigate('AboutAndFeedback', { initialTab: 'about' })}
>
  <Ionicons name="information-circle-outline" size={18} color="#1DB954" />
  <Text style={styles.bottomBtnText}>About</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.bottomBtn}
  onPress={() => navigation.navigate('AboutAndFeedback', { initialTab: 'feedback' })}
>
  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#1DB954" />
  <Text style={styles.bottomBtnText}>Feedback</Text>
</TouchableOpacity>

            <TouchableOpacity style={styles.bottomBtn} onPress={logout}>
              <Ionicons name="log-out-outline" size={18} color="#ff5c5c" />
              <Text style={[styles.bottomBtnText, { color: '#ff5c5c' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Daily Song Modal */}
      <Modal
        visible={dailySongModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDailySongModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDailySongModalVisible(false)}>
          <View style={[styles.dailySongModal, { backgroundColor: theme.card }]}>
            {dailySong ? (
              <>
                <Text style={[styles.dailySongTitle, { color: theme.text }]}>{dailySong.name}</Text>
                <Text style={[styles.dailySongArtist, { color: theme.text }]}>by {dailySong.artist}</Text>
                <TouchableOpacity
                  style={[styles.bigButton, { backgroundColor: '#1DB954', marginTop: 20 }]}
                  onPress={() => dailySong.url && Linking.openURL(dailySong.url)}
                >
                  <Text style={styles.bigButtonText}>Play on Spotify</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={[styles.dailySongTitle, { color: theme.text }]}>No song available</Text>
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    padding: 16,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 4,
    marginBottom: 16,
  },
 headerTop: {
  flexDirection: 'row',
  alignItems: 'center',
},
userText: { 
  fontSize: 20, 
  fontWeight: '600',
  marginTop: 4,  
},

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  actionBtnText: { color: '#fff', fontWeight: '600', marginLeft: 8 },

  newPlaylistSection: { paddingHorizontal: 16, marginBottom: 20 },
  input: {
    borderRadius: 15,
    borderWidth: 1,
    padding: 10,
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
    elevation: 3,
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

  bottomActions: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomBtn: {
    alignItems: 'center',
  },
  bottomBtnText: {
    fontSize: 14,
    color: '#1DB954',
    fontWeight: '600',
    marginTop: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dailySongModal: {
    width: 280,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dailySongTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dailySongArtist: {
    fontSize: 18,
    marginTop: 4,
    fontStyle: 'italic',
  },
  bigButton: {
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 220,
    alignSelf: 'center',
  },
  bigButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default ProfileScreen;
