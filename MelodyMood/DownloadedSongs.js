import React, { useContext } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { DownloadContext } from './context/DownloadContext';
import { ThemeContext } from './ThemeContext';

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const SavedSongs = () => {
  const { downloadedSongs } = useContext(DownloadContext);
  const { theme } = useContext(ThemeContext);

  const renderItem = ({ item }) => {
    if (!item) return null;

    const handlePress = () => {
      if (item.url && typeof item.url === 'string' && item.url.trim() !== '') {
        Linking.openURL(item.url).catch(() => {
          alert('Cannot open this URL.');
        });
      } else {
        alert('No valid URL available for this song.');
      }
    };

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={handlePress}
      >
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/100' }}
          style={styles.image}
        />
        <View style={styles.details}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.artist, { color: theme.secondaryText }]} numberOfLines={1}>
            Artist: {item.artist || 'Unknown Artist'}
          </Text>
          <Text style={[styles.duration, { color: theme.secondaryText }]}>
            Duration: {item.duration ? formatDuration(item.duration) : 'Unknown'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {downloadedSongs.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No songs saved yet.</Text>
      ) : (
        <FlatList
          data={downloadedSongs}
          keyExtractor={(item, index) => `${item?.id || 'no-id'}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
};

export default SavedSongs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  card: {
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#e9ecef',
    marginRight: 16,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 22,
  },
  artist: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  duration: {
    fontSize: 13,
    fontWeight: '400',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 60,
    fontWeight: '500',
  },
});
