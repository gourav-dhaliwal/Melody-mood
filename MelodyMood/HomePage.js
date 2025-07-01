import React, { useState, useEffect, useContext } from 'react';
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
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationContext } from './context/NotificationContext';
import { AuthContext } from './context/AuthContext';
import { searchArtist, searchTracks } from './utils/spotifyApi';
import { useHistory } from './context/HistoryContext';

const HomePage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [mainMenuVisible, setMainMenuVisible] = useState(false);
  const navigation = useNavigation();
  const { addNotification } = useContext(NotificationContext);
  const { logout } = useContext(AuthContext);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [songHistory, setSongHistory] = useState([]);
  const { addToHistory } = useHistory();

  useEffect(() => {
    const loadHistory = async () => {
      const search = await AsyncStorage.getItem('searchHistory');
      const songs = await AsyncStorage.getItem('songHistory');
      if (search) setSearchHistory(JSON.parse(search));
      if (songs) setSongHistory(JSON.parse(songs));
    };
    loadHistory();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const [artists, tracks] = await Promise.all([
        searchArtist(query),
        searchTracks(query),
      ]);
      const combinedResults = [...artists, ...tracks];
      setResults(combinedResults);

      const updatedHistory = [query, ...searchHistory.filter(q => q !== query)];
      setSearchHistory(updatedHistory);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const clearHistory = async () => {
    await AsyncStorage.removeItem('searchHistory');
    setSearchHistory([]);
  };

  const toggleFollow = (artistId, artistName) => {
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

  const renderItem = ({ item }) => {
    const isArtist = item.type === 'artist';
    const imageUrl =
      item.images?.[0]?.url || item.album?.images?.[0]?.url || 'https://via.placeholder.com/100';
    const spotifyUrl = item.external_urls?.spotify;

    const handlePlay = async () => {
      const songData = {
        id: item.id,
        name: item.name,
        artist: item.artists?.[0]?.name || 'Unknown',
        image: item.album?.images?.[0]?.url || '',
        url: item.external_urls?.spotify || '',
        timestamp: Date.now(),
        type: 'song',
      };

      addToHistory(songData);

      const updatedSongHistory = [songData, ...songHistory.filter(s => s.id !== item.id)];
      setSongHistory(updatedSongHistory);
      await AsyncStorage.setItem('songHistory', JSON.stringify(updatedSongHistory));

      if (spotifyUrl) Linking.openURL(spotifyUrl);
    };

    return (
      <View style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.subText} numberOfLines={1}>
            {isArtist ? 'Artist' : `Song by ${item.artists?.[0]?.name}`}
          </Text>
        </View>

        {isArtist ? (
          <TouchableOpacity
            style={[
              styles.smallBtn,
              followedArtists.includes(item.id) ? styles.unfollowBtn : styles.followBtn,
            ]}
            onPress={() => toggleFollow(item.id, item.name)}
          >
            <Text style={styles.btnTextSmall}>
              {followedArtists.includes(item.id) ? 'Unfollow' : 'Follow'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.smallBtn, styles.playBtn]}
            onPress={handlePlay}
          >
            <Text style={styles.btnTextSmall}>▶</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderMenu = () => (
    <Modal
      visible={mainMenuVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setMainMenuVisible(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setMainMenuVisible(false)}
      >
        <View style={styles.smallSidebarMenu}>
          {['Downloaded', 'LikedPlaylists', 'Notifications', 'History'].map((screen) => (
            <TouchableOpacity
              key={screen}
              style={styles.modalOption}
              onPress={() => {
                navigation.navigate(screen);
                setMainMenuVisible(false);
              }}
            >
              <Text style={styles.modalText}>{screen.replace(/([A-Z])/g, ' $1')}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Melody Mood</Text>
        <TouchableOpacity
          style={styles.menuIcon}
          onPress={() => setMainMenuVisible(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Search for an artist or song..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            if (text.trim() === '') setResults([]);
          }}
          onSubmitEditing={handleSearch}
          style={styles.inputWithIcon}
        />
        <TouchableOpacity style={styles.iconWrapper} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#888" />
        </TouchableOpacity>
      </View>

      {searchHistory.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Recent Searches:</Text>
          <FlatList
            data={searchHistory}
            horizontal
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setQuery(item)}>
                <View style={{ padding: 8, marginHorizontal: 4, backgroundColor: '#e9ecef', borderRadius: 20 }}>
                  <Text>{item}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListHeaderComponent={
              <TouchableOpacity onPress={clearHistory}>
                <Text style={{ color: 'red', marginRight: 10 }}>Clear</Text>
              </TouchableOpacity>
            }
          />
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {renderMenu()}
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
  input: {
    margin: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  openBtn: {
  backgroundColor: '#1DB954',
  marginTop: 8,
},

 card: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 12,
  marginHorizontal: 16,
  marginBottom: 8,
  borderRadius: 10,
  backgroundColor: '#fff',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},

image: {
  width: 50,
  height: 50,
  borderRadius: 25,
  marginRight: 12,
},
 details: {
  flex: 1,
  justifyContent: 'center',
},

name: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#333',
},
  followBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  subText: {
  fontSize: 13,
  color: '#777',
},
inputWrapper: {
  marginHorizontal: 16,
  marginTop: 16,
  marginBottom: 8,
  position: 'relative',
},

inputWithIcon: {
  padding: 10,
  paddingRight: 40, // space for icon
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  backgroundColor: '#fff',
},

iconWrapper: {
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: [{ translateY: -10 }],
  height: 20,
  width: 20,
  justifyContent: 'center',
  alignItems: 'center',
},


  follow: { backgroundColor: '#1DB954' },
  unfollow: { backgroundColor: '#d9534f' },
  btnText: { color: '#fff', fontSize: 14 },
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
  smallBtn: {
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: 70,
  marginLeft: 8,
},

followBtn: {
  backgroundColor: '#1DB954',
},

unfollowBtn: {
  backgroundColor: '#d9534f',
},

playBtn: {
  backgroundColor: '#1DB954',
  minWidth: 40,
  paddingHorizontal: 10,
  borderRadius: 20,
},

btnTextSmall: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600',
  textAlign: 'center',
},
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 2,
  },
  modalText: { color: '#2c3e50', fontSize: 17, fontWeight: '600' },
});
