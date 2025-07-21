import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Pressable,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NotificationContext } from './context/NotificationContext';
import { ThemeContext } from './ThemeContext';
import { searchArtist, searchTracks } from './utils/spotifyApi';
import { useHistory } from './context/HistoryContext';

const dailySongsList = [
  {
    id: '1',
    name: 'Shape of You',
    artist: 'Ed Sheeran',
    url: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3',
  },
  {
    id: '2',
    name: 'Blinding Lights',
    artist: 'The Weeknd',
    url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
  },
  {
    id: '3',
    name: 'Levitating',
    artist: 'Dua Lipa',
    url: 'https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9',
  },
];

const HomePage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [mainMenuVisible, setMainMenuVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [songHistory, setSongHistory] = useState([]);
  const [dailySongModalVisible, setDailySongModalVisible] = useState(false);
  const [dailySong, setDailySong] = useState(null);
  const [quote, setQuote] = useState('');

  const navigation = useNavigation();
  const { addNotification } = useContext(NotificationContext);
  const { addToHistory } = useHistory();
  const { themeName, theme, changeTheme } = useContext(ThemeContext);

  useEffect(() => {
    const loadHistory = async () => {
      const search = await AsyncStorage.getItem('searchHistory');
      const songs = await AsyncStorage.getItem('songHistory');
      if (search) setSearchHistory(JSON.parse(search));
      if (songs) setSongHistory(JSON.parse(songs));
    };
    loadHistory();
    loadDailySong();
  }, []);

  const loadDailySong = async () => {
    try {
      const savedSongJSON = await AsyncStorage.getItem('dailySong');
      const savedDate = await AsyncStorage.getItem('dailySongDate');
      const today = new Date().toDateString();

      if (savedSongJSON && savedDate === today) {
        setDailySong(JSON.parse(savedSongJSON));
      } else {
        const randomSong = dailySongsList[Math.floor(Math.random() * dailySongsList.length)];
        setDailySong(randomSong);
        await AsyncStorage.setItem('dailySong', JSON.stringify(randomSong));
        await AsyncStorage.setItem('dailySongDate', today);
      }
    } catch (error) {
      console.error('Failed to load daily song:', error);
    }
  };

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

  const fetchQuote = async () => {
    try {
      const res = await fetch('https://zenquotes.io/api/random');
      const data = await res.json();
      if (data && data[0]) {
        setQuote(`${data[0].q} — ${data[0].a}`);
      }
    } catch (err) {
      console.error(err);
      setQuote("Couldn’t fetch quote, try again!");
    }
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
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.details}>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.subText, { color: theme.text }]}>
            {isArtist ? 'Artist' : `Song by ${item.artists?.[0]?.name}`}
          </Text>
        </View>

        {isArtist ? (
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: followedArtists.includes(item.id) ? '#d9534f' : '#1DB954' },
            ]}
            onPress={() => toggleFollow(item.id, item.name)}
          >
            <Text style={styles.buttonText}>
              {followedArtists.includes(item.id) ? 'Unfollow' : 'Follow'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#1DB954', minWidth: 60 }]}
            onPress={handlePlay}
          >
            <Text style={styles.buttonText}>▶️ Play</Text>
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
          {['Downloaded', 'LikedPlaylists', 'Notifications', 'History', 'Theme'].map((screen) => (
            <TouchableOpacity
              key={screen}
              style={styles.modalOption}
              onPress={() => {
                if (screen === 'Theme') {
                  setThemeModalVisible(true);
                } else {
                  navigation.navigate(screen);
                }
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

  const renderThemeModal = () => (
    <Modal
      visible={themeModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setThemeModalVisible(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setThemeModalVisible(false)}
      >
        <View style={styles.smallSidebarMenu}>
          {['light', 'dark', 'colorful'].map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.modalOption}
              onPress={() => {
                changeTheme(option);
                setThemeModalVisible(false);
                addNotification(`Theme changed to ${option}`);
              }}
            >
              <Text style={styles.modalText}>{option.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.header }]}>
        <Text style={[styles.headerTitle, { color: theme.headerText }]}>Melody Mood</Text>
        <TouchableOpacity
          style={styles.menuIcon}
          onPress={() => setMainMenuVisible(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={theme.headerText} />
        </TouchableOpacity>
      </View>

      <View style={{ padding: 16, alignItems: 'center' }}>
        <TouchableOpacity
          onPress={fetchQuote}
          style={{
            backgroundColor: '#1DB954',
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 20,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Show Quote</Text>
        </TouchableOpacity>

        {quote !== '' && (
          <View style={{ marginTop: 8, paddingHorizontal: 12 }}>
            <Text style={{ textAlign: 'center', fontStyle: 'italic', color: theme.text }}>
              {quote}
            </Text>
          </View>
        )}
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
        <View style={{ marginHorizontal: 16, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>Search History</Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text style={{ color: 'red' }}>Clear</Text>
            </TouchableOpacity>
          </View>

          {searchHistory.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setQuery(item);
                handleSearch();
              }}
              style={{
                paddingVertical: 6,
                borderBottomWidth: 1,
                borderBottomColor: '#ddd',
              }}
            >
              <Text style={{ color: theme.text }}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <View style={{ margin: 16 }}>
        <TouchableOpacity
          style={[styles.bigButton, { backgroundColor: '#1DB954' }]}
          onPress={() => setDailySongModalVisible(true)}
        >
          <Text style={styles.bigButtonText}>
            Discover a New Song
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
        <TouchableOpacity
          style={[styles.bigButton, { backgroundColor: '#007AFF' }]}
          onPress={() => navigation.navigate('About & Feedback')}
        >
          <Text style={styles.bigButtonText}>
            About & Feedback
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={dailySongModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDailySongModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDailySongModalVisible(false)}
        >
          <View style={[styles.dailySongModal, { backgroundColor: theme.card }]}>
            {dailySong ? (
              <>
                <Text style={[styles.dailySongTitle, { color: theme.text }]}>
                  {dailySong.name}
                </Text>
                <Text style={[styles.dailySongArtist, { color: theme.text }]}>
                  by {dailySong.artist}
                </Text>
                <TouchableOpacity
                  style={[styles.bigButton, { backgroundColor: '#1DB954', marginTop: 20 }]}
                  onPress={() => {
                    if (dailySong.url) Linking.openURL(dailySong.url);
                  }}
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

      {renderMenu()}
      {renderThemeModal()}
    </View>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', letterSpacing: 0.5 },
  menuIcon: { padding: 8, borderRadius: 20 },
  inputWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    position: 'relative',
  },
  inputWithIcon: {
    padding: 10,
    paddingRight: 40,
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  details: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: 'bold' },
  subText: { fontSize: 13 },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginLeft: 8,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  bigButton: {
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 220,
    alignSelf: 'center',
    marginVertical: 8,
  },
  bigButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  smallSidebarMenu: {
    width: 220,
    backgroundColor: '#fff',
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
  modalText: { fontSize: 17, fontWeight: '600' },
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
});
