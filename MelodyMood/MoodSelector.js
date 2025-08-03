import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  ActivityIndicator,
  ScrollView,
  Linking,
} from 'react-native';
import { ThemeContext } from './ThemeContext';
import { fetchMoodPlaylists } from './utils/spotifyApi'; // Adjust path if needed

const moods = [
  { label: '😊 Happy', color: '#ffeb3b' },
  { label: '😢 Sad', color: '#90caf9' },
  { label: '💪 Energetic', color: '#ff9800' },
  { label: '😌 Relaxed', color: '#aed581' },
  { label: '😠 Angry', color: '#ef5350' },
  { label: '😇 Calm', color: '#b39ddb' },
];

const MoodSelector = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

  const { theme } = useContext(ThemeContext);

  const handleMoodPress = async (mood) => {
    setSelectedMood(mood);
    setLoading(true);
    setPlaylists([]);

    try {
      const results = await fetchMoodPlaylists(mood.label.split(' ')[1]); // Extract mood word
      setPlaylists(results.slice(0, 6));
    } catch (err) {
      console.error('Error loading playlists:', err);
    } finally {
      setLoading(false);
    }

    scaleAnim.setValue(1);
    Animated.spring(scaleAnim, {
      toValue: 1.1,
      friction: 3,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: theme.text }]}>🎵 Select Your Mood 🎵</Text>

      <View style={styles.moodContainer}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.label}
            style={[
              styles.moodButton,
              { backgroundColor: theme.card, borderColor: theme.text },
              selectedMood?.label === mood.label && { backgroundColor: mood.color },
            ]}
            onPress={() => handleMoodPress(mood)}
          >
            <Animated.Text
              style={[
                styles.moodButtonText,
                { color: theme.text },
                selectedMood?.label === mood.label && styles.selectedMoodButtonText,
                {
                  transform: [
                    { scale: selectedMood?.label === mood.label ? scaleAnim : 1 }
                  ]
                },
              ]}
            >
              {mood.label}
            </Animated.Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedMood && (
        <Text style={[styles.selectedMoodText, { color: theme.text }]}>
          You selected: {selectedMood.label}
        </Text>
      )}

      {loading && (
        <ActivityIndicator
          size="large"
          color="#1DB954"
          style={{ marginTop: 20 }}
        />
      )}

      {!loading && playlists.length > 0 && (
        <View style={{ marginTop: 20, width: '100%' }}>
          <Text style={[styles.playlistHeader, { color: theme.text }]}>
            {selectedMood.label} Playlist
          </Text>
          {playlists.map((playlist) => (
            <TouchableOpacity
              key={playlist.id}
              style={[styles.playlistCard, { backgroundColor: theme.card }]}
              onPress={() => {
                const url = `https://open.spotify.com/playlist/${playlist.id}`;
                Linking.openURL(url).catch((err) =>
                  console.error('Failed to open playlist URL:', err)
                );
              }}
            >
              <Image
                source={{ uri: playlist.images?.[0]?.url || 'https://via.placeholder.com/150' }}
                style={styles.playlistImage}
              />
              <Text style={[styles.playlistName, { color: theme.text }]}>{playlist.name}</Text>
              <Text style={[styles.trackCount, { color: theme.text }]}>
                {playlist.tracks?.total || 0} tracks
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  moodButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    borderWidth: 2,
    margin: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  moodButtonText: {
    fontSize: 18,
    fontWeight: '500',
  },
  selectedMoodButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  selectedMoodText: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: '600',
  },
  playlistHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  playlistCard: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
  },
  playlistImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackCount: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default MoodSelector;
