import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Image, 
  ScrollView,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { fetchMoodPlaylists } from './utils/spotifyApi';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // For 2 columns with margins

const Playlists = ({ navigation }) => {
  const [moodPlaylists, setMoodPlaylists] = useState({});
  const [loading, setLoading] = useState(true);

  // Define moods to display
  const moods = [
    { name: 'Happy', emoji: '😊', color: '#FFD700' },
    { name: 'Sad', emoji: '😢', color: '#87CEEB' },
    { name: 'Chill', emoji: '😌', color: '#98FB98' },
    { name: 'Energetic', emoji: '⚡', color: '#FF6347' },
    { name: 'Romantic', emoji: '💕', color: '#FFB6C1' },
    { name: 'Focus', emoji: '🎯', color: '#DDA0DD' },
  ];

  useEffect(() => {
    loadAllMoodPlaylists();
  }, []);

  const loadAllMoodPlaylists = async () => {
    setLoading(true);
    const allPlaylists = {};

    try {
      // Fetch playlists for each mood
      for (const mood of moods) {
        const playlists = await fetchMoodPlaylists(mood.name);
        allPlaylists[mood.name] = playlists.slice(0, 6); // Limit to 6 playlists per mood
      }
      setMoodPlaylists(allPlaylists);
    } catch (error) {
      console.error('Error loading mood playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPlaylistItem = ({ item, moodColor }) => (
    <TouchableOpacity 
      style={[styles.playlistCard, { borderLeftColor: moodColor }]}
      onPress={() => navigation.navigate('TrackList', { 
        playlistId: item.id, 
        playlistName: item.name 
      })}
    >
      <Image 
        source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/150' }} 
        style={styles.playlistImage} 
      />
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.trackCount}>{item.tracks?.total || 0} tracks</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMoodSection = (mood) => {
    const playlists = moodPlaylists[mood.name] || [];
    
    if (playlists.length === 0) return null;

    return (
      <View key={mood.name} style={styles.moodSection}>
        <View style={[styles.moodHeader, { backgroundColor: mood.color }]}>
          <Text style={styles.moodEmoji}>{mood.emoji}</Text>
          <Text style={styles.moodTitle}>{mood.name} Vibes</Text>
        </View>
        
        <FlatList
          data={playlists}
          renderItem={({ item }) => renderPlaylistItem({ item, moodColor: mood.color })}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.playlistGrid}
          scrollEnabled={false}
          columnWrapperStyle={styles.row}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.loadingText}>Loading mood playlists...</Text>
          <Text style={styles.loadingSubText}>Discovering your perfect vibes ✨</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.mainTitle}>🎵 Mood Playlists</Text>
          <Text style={styles.subtitle}>Find the perfect soundtrack for your feelings</Text>
        </View>

        {moods.map(mood => renderMoodSection(mood))}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Spotify 🎶</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#7f8c8d',
  },
  moodSection: {
    marginTop: 25,
    marginHorizontal: 16,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  moodEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  moodTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  playlistGrid: {
    paddingHorizontal: 4,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  playlistCard: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 4,
    marginHorizontal: 4,
  },
  playlistImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  playlistInfo: {
    alignItems: 'center',
  },
  playlistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 18,
  },
  trackCount: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default Playlists;
