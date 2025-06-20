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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { searchArtist, getAccessToken } from './utils/spotifyApi';
import { Ionicons } from '@expo/vector-icons';
import { DownloadContext } from './context/DownloadContext';

const HomePage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const navigation = useNavigation();
  const { downloadSong } = useContext(DownloadContext);

  const handleSearch = async () => {
    try {
      const artists = await searchArtist(query);
      setResults(artists);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const toggleFollow = async (artistId) => {
    try {
      setFollowedArtists((prev) =>
        prev.includes(artistId)
          ? prev.filter((id) => id !== artistId)
          : [...prev, artistId]
      );
    } catch (error) {
      console.error('Follow failed:', error);
    }
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
        duration: typeof topTrack.duration_ms === 'number' ? topTrack.duration_ms : 0,
        image: topTrack.album?.images?.[0]?.url || '',
        url: topTrack?.external_urls?.spotify ?? '',
      };

      downloadSong(songData);
      navigation.navigate('Saved');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download song');
    }

    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/100' }}
        style={styles.image}
      />
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <TouchableOpacity
          style={[styles.followBtn, followedArtists.includes(item.id) ? styles.unfollow : styles.follow]}
          onPress={() => toggleFollow(item.id)}
        >
          <Text style={styles.btnText}>{followedArtists.includes(item.id) ? 'Unfollow' : 'Follow'}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.menuIcon}
        onPress={() => {
          setSelectedArtist(item);
          setModalVisible(true);
        }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="white" />
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
            setModalVisible(true);
          }}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Search for an artist..."
        placeholderTextColor="#aaa"
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
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.smallSidebarMenu}>
            {selectedArtist && (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleDownload(selectedArtist.id)}
              >
                <Text style={styles.modalText}>Download Top Track</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                navigation.navigate('Downloaded');
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalText}>Save to Library</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                navigation.navigate('LikedPlaylists');
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalText}>Liked Playlists</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e1e', paddingHorizontal: 16 },
  header: {
    backgroundColor: '#1DB954',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  menuIcon: { padding: 5 },
  input: {
    backgroundColor: '#2b2b2b',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: '#2b2b2b',
    padding: 12,
    borderRadius: 10,
  },
  image: { width: 64, height: 64, borderRadius: 32, marginRight: 12 },
  details: { flex: 1 },
  name: { fontSize: 18, fontWeight: '600', color: '#fff' },
  followBtn: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    width: 100,
  },
  follow: { backgroundColor: '#1DB954' },
  unfollow: { backgroundColor: '#555' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOption: { paddingVertical: 12 },
  modalText: { color: 'white', fontSize: 16 },
  smallSidebarMenu: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 180,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
});
