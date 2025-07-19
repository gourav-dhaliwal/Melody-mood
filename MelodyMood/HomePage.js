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
import { ThemeContext } from './ThemeContext';
import { searchArtist, searchTracks } from './utils/spotifyApi';
import { useHistory } from './context/HistoryContext';

const dailySongList = [
  { id: '1', name: 'Blinding Lights', artist: 'The Weeknd', url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b' },
  { id: '2', name: 'Shape of You', artist: 'Ed Sheeran', url: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3' },
  { id: '3', name: 'Levitating', artist: 'Dua Lipa', url: 'https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9' },
  { id: '4', name: 'Stay', artist: 'The Kid LAROI & Justin Bieber', url: 'https://open.spotify.com/track/5HCyWlXZPP0y6Gqq8TgA20' },
  { id: '5', name: 'Bad Habits', artist: 'Ed Sheeran', url: 'https://open.spotify.com/track/6PQ88X9TkUIAUIZJHW2upE' },
  { id: '6', name: 'Watermelon Sugar', artist: 'Harry Styles', url: 'https://open.spotify.com/track/6UelLqGlWMcVH1E5c4H7lY' },
  { id: '7', name: 'Sunflower', artist: 'Post Malone & Swae Lee', url: 'https://open.spotify.com/track/3KkXRkHbMCARz0aVfEt68P' },
  { id: '8', name: 'Peaches', artist: 'Justin Bieber', url: 'https://open.spotify.com/track/4iJyoBOLtHqaGxP12qzhQI' },
  { id: '9', name: 'Dance Monkey', artist: 'Tones and I', url: 'https://open.spotify.com/track/2XU0oxnq2qxCpomAAuJY8K' },
  { id: '10', name: 'Someone You Loved', artist: 'Lewis Capaldi', url: 'https://open.spotify.com/track/7qEHsqek33rTcFNT9PFqLf' },
];

const STORAGE_KEY_DAILY_SONG = 'dailySongData';

const HomePage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [mainMenuVisible, setMainMenuVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [songHistory, setSongHistory] = useState([]);

  const [dailyModalVisible, setDailyModalVisible] = useState(false);
  const [dailySong, setDailySong] = useState(null);

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
  }, []);

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const onDiscoverPress = async () => {
    try {
      const storedDataStr = await AsyncStorage.getItem(STORAGE_KEY_DAILY_SONG);
      const todayStr = getTodayDateString();

      if (storedDataStr) {
        const storedData = JSON.parse(storedDataStr);
        if (storedData.date === todayStr) {
          setDailySong(storedData.song);
          setDailyModalVisible(true);
          return;
        }
      }

      const randomSong = dailySongList[Math.floor(Math.random() * dailySongList.length)];
      const newData = { date: todayStr, song: randomSong };
      await AsyncStorage.setItem(STORAGE_KEY_DAILY_SONG, JSON.stringify(newData));
      setDailySong(randomSong);
      setDailyModalVisible(true);
    } catch (error) {
      console.error('Error fetching daily song:', error);
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
            <Text style={styles.btnTextSmall}>▶️</Text>
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

      {/* Discover New Song Button */}
      <TouchableOpacity
        style={[styles.smallBtn, { alignSelf: 'center', marginVertical: 16, backgroundColor: '#1DB954' }]}
        onPress={onDiscoverPress}
      >
        <Text style={styles.btnTextSmall}>🎵 Discover a New Song</Text>
      </TouchableOpacity>

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

      {renderMenu()}
      {renderThemeModal()}

      {/* Daily Song Modal */}
      <Modal
        visible={dailyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDailyModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlayCentered}
          onPress={() => setDailyModalVisible(false)}
        >
          <View style={[styles.smallSidebarMenu, { padding: 24, width: 280, alignItems: 'center' }]}>
            {dailySong && (
              <>
                <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>{dailySong.name}</Text>
                <Text style={{ fontSize: 18, marginBottom: 16 }}>by {dailySong.artist}</Text>
                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: '#1DB954' }]}
                  onPress={() => Linking.openURL(dailySong.url)}
                >
                  <Text style={styles.btnTextSmall}>Play on Spotify</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallBtn, { backgroundColor: '#ccc', marginTop: 12 }]}
                  onPress={() => setDailyModalVisible(false)}
                >
                  <Text style={[styles.btnTextSmall, { color: '#333' }]}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
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
  smallBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
    marginLeft: 8,
  },
  followBtn: { backgroundColor: '#1DB954' },
  unfollowBtn: { backgroundColor: '#d9534f' },
  playBtn: {
    backgroundColor: '#1DB954',
    minWidth: 40,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  btnTextSmall: { color: '#fff', fontSize: 14, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  modalOverlayCentered: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallSidebarMenu: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    // width adjusted where used inline
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
});
