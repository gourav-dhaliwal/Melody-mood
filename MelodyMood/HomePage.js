import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Pressable,
  Button
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { searchArtist, getAccessToken } from './utils/spotifyApi';
import { Ionicons } from '@expo/vector-icons';
import { DownloadContext } from './context/DownloadContext';
import { NotificationContext } from './context/NotificationContext';
import { AuthContext } from './context/AuthContext';

const HomePage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [mainMenuVisible, setMainMenuVisible] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const navigation = useNavigation();
  const { downloadSong } = useContext(DownloadContext);
  const { addNotification } = useContext(NotificationContext);
  const { user, logout } = useContext(AuthContext);

  const handleSearch = async () => {
    try {
      const artists = await searchArtist(query);
      setResults(artists);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const toggleFollow = async (artistId, artistName) => {
    setFollowedArtists((prev) => {
      const isFollowing = prev.includes(artistId);
      const updatedList = isFollowing
        ? prev.filter((id) => id !== artistId)
        : [...prev, artistId];

      addNotification(
        isFollowing
          ? `You unfollowed ${artistName}`
          : `You followed ${artistName}`
      );

      return updatedList;
    });
  };

  const handleDownload = async (artistId) => {
    const token = await getAccessToken();
    try {
      const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const topTrack = data.tracks?.[0];

      if (!topTrack || !topTrack.external_urls?.spotify) {
        alert('No valid track URL available');
        return;
      }

      const songData = {
        id: topTrack.id,
        name: topTrack.name || 'Unknown Title',
        artist: topTrack.artists?.[0]?.name || 'Unknown Artist',
        duration: topTrack.duration_ms || 0,
        image: topTrack.album?.images?.[0]?.url || '',
        url: topTrack?.external_urls?.spotify ?? '',
      };

      downloadSong(songData);
      navigation.navigate('Saved');
      addNotification(`You downloaded "${topTrack.name}" by ${topTrack.artists?.[0]?.name}`);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download song');
    }
    setMainMenuVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/100' }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <TouchableOpacity
          style={[styles.followBtn, followedArtists.includes(item.id) ? styles.unfollow : styles.follow]}
          onPress={() => toggleFollow(item.id, item.name)}
        >
          <Text style={styles.btnText}>{followedArtists.includes(item.id) ? 'Unfollow' : 'Follow'}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.menuIcon}>
        <Ionicons name="ellipsis-vertical" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Melody Mood</Text>
        <TouchableOpacity
          style={styles.menuIcon}
          onPress={() => {
            setSelectedArtist(null);
            setMainMenuVisible(true);
          }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {user && (
        <View style={styles.userBar}>
          <Text style={styles.userEmail}>Logged in as: {user.email}</Text>
          <Button title="Logout" onPress={logout} color="#d9534f" />
        </View>
      )}

      <TextInput
        placeholder="Search for an artist..."
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        style={styles.input}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <Modal
        visible={mainMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMainMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMainMenuVisible(false)}>
          <View style={styles.smallSidebarMenu}>
            <TouchableOpacity style={styles.modalOption} onPress={() => { navigation.navigate('Downloaded'); setMainMenuVisible(false); }}>
              <Text style={styles.modalText}>Save to Library</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => { navigation.navigate('LikedPlaylists'); setMainMenuVisible(false); }}>
              <Text style={styles.modalText}>Liked Playlists</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => { navigation.navigate('Notifications'); setMainMenuVisible(false); }}>
              <Text style={styles.modalText}>Notifications</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    backgroundColor: '#1DB954',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 },
  menuIcon: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  userBar: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    borderColor: '#e1e5e9',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  userEmail: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 20,
    borderColor: '#f0f2f5',
    borderWidth: 1,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 18,
    borderWidth: 2,
    borderColor: '#e1e5e9',
  },
  details: { flex: 1 },
  name: {
    fontSize: 19,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  followBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    width: 110,
  },
  follow: { backgroundColor: '#1DB954' },
  unfollow: { backgroundColor: '#6c757d' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  smallSidebarMenu: {
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 2,
  },
  modalText: {
    color: '#2c3e50',
    fontSize: 17,
    fontWeight: '600',
  },
});
