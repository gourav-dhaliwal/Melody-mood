import React, { useContext } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { DownloadContext } from './context/DownloadContext';

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const SavedSongs = () => {
  const { downloadedSongs } = useContext(DownloadContext); // you may want to rename this in context too

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
      <TouchableOpacity style={styles.card} onPress={handlePress}>
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/100' }}
          style={styles.image}
        />
        <View style={styles.details}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.artist}>Artist: {item.artist || 'Unknown Artist'}</Text>
          <Text style={styles.duration}>Duration: {item.duration ? formatDuration(item.duration) : 'Unknown'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {downloadedSongs.length === 0 ? (
        <Text style={styles.emptyText}>No songs saved yet.</Text>
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
  container: { flex: 1, backgroundColor: '#1e1e1e', padding: 16 },
  emptyText: { color: '#aaa', fontSize: 16, textAlign: 'center', marginTop: 50 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b2b2b',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
  },
  image: { width: 64, height: 64, borderRadius: 8, marginRight: 12 },
  details: { flex: 1 },
  name: { color: '#fff', fontSize: 18, fontWeight: '600' },
  artist: { color: '#ccc', fontSize: 14, marginTop: 4 },
  duration: { color: '#999', fontSize: 14, marginTop: 2 },
});
