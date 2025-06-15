import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { searchArtist, followArtist } from './utils/spotifyApi';
import { Ionicons } from '@expo/vector-icons'; // For 3-dot icon

const HomePage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);

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
      await followArtist(artistId);
      setFollowedArtists((prev) =>
        prev.includes(artistId)
          ? prev.filter((id) => id !== artistId)
          : [...prev, artistId]
      );
    } catch (error) {
      console.error('Follow failed:', error);
    }
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
          style={[
            styles.followBtn,
            followedArtists.includes(item.id) ? styles.unfollow : styles.follow,
          ]}
          onPress={() => toggleFollow(item.id)}
        >
          <Text style={styles.btnText}>
            {followedArtists.includes(item.id) ? 'Unfollow' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* App Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Melody Mood</Text>
        <TouchableOpacity style={styles.menuIcon}>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <TextInput
        placeholder="Search for an artist..."
        placeholderTextColor="#aaa"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        style={styles.input}
      />

      {/* Artist List */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
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

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },

  menuIcon: {
    padding: 5,
  },

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

  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
  },

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
});
