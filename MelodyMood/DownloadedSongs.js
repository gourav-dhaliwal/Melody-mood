// DownloadedSongs.js
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const DownloadedSongs = ({ route }) => {
  const { downloadedSongs, allArtists } = route.params;

  const downloadedList = allArtists.filter((artist) =>
    downloadedSongs.includes(artist.id)
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Downloaded Songs</Text>
      <FlatList
        data={downloadedList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default DownloadedSongs;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e1e', padding: 16 },
  title: { fontSize: 24, color: 'white', fontWeight: 'bold', marginBottom: 16 },
  card: {
    padding: 16,
    backgroundColor: '#2b2b2b',
    borderRadius: 10,
    marginBottom: 12,
  },
  name: { color: 'white', fontSize: 18 },
});
