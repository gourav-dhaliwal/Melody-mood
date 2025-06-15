import React, { useContext } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { DownloadContext } from './context/DownloadContext'; // adjust path if needed

const DownloadedSongs = () => {
  const { downloadedSongs } = useContext(DownloadContext);

  const renderItem = ({ item }) => {
    if (!item) return null;
    return (
      <View style={styles.card}>
        <Image
          source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/100' }}
          style={styles.image}
        />
        <Text style={styles.name}>{item.name}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Downloaded Songs</Text>
      {downloadedSongs.length === 0 ? (
        <Text style={styles.emptyText}>No songs downloaded yet.</Text>
      ) : (
        <FlatList
          data={downloadedSongs}
          keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
};

export default DownloadedSongs;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e1e', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1DB954', marginBottom: 20 },
  emptyText: { color: '#aaa', fontSize: 16, textAlign: 'center', marginTop: 50 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b2b2b',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
  },
  image: { width: 64, height: 64, borderRadius: 32, marginRight: 12 },
  name: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
