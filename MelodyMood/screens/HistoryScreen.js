import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHistory } from '../context/HistoryContext';

// Color constants for light theme
const COLORS = {
  primary: '#1DB954',    // Spotify green
  song: '#FF9F43',       // Vibrant orange
  playlist: '#4BC0C8',   // Cool teal
  text: '#000000',       // Black text
  subtext: '#666666',    // Dark gray
  background: '#FFFFFF', // White background
  card: '#F8F8F8',       // Light gray cards
  divider: '#E0E0E0'     // Light divider
};

export default function HistoryScreen({ navigation }) {
  const { history } = useHistory();

  // Unique key generator combining id, timestamp and index as fallback
  const keyExtractor = (item, index) => 
    `${item.id}-${item.timestamp}-${index}`;

  const getItemColor = (type) => type === 'song' ? COLORS.song : COLORS.playlist;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listening History</Text>
      
      <FlatList
        data={history}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.item,
              { 
                borderLeftWidth: 4, 
                borderLeftColor: getItemColor(item.type),
                marginBottom: 8
              }
            ]}
            onPress={() => navigation.navigate('TrackList', { 
              playlistId: item.id,
              playlistName: item.name
            })}
          >
            <Ionicons 
              name={item.type === 'song' ? 'musical-notes' : 'list'} 
              size={20} 
              color={getItemColor(item.type)} 
              style={styles.icon}
            />
            <View style={styles.textContainer}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <View style={styles.details}>
                <Text style={styles.detailText}>{item.type === 'song' ? 'Song' : 'Playlist'}</Text>
                <Text style={styles.dot}> • </Text>
                <Text style={styles.detailText}>
                  {new Date(item.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={18} 
              color={COLORS.subtext} 
            />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color={COLORS?.subtext || '#999'} />
            <Text style={styles.emptyText}>No recent activity</Text>
          </View>
        )}
        
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 20
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    marginLeft: 8
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 1, // subtle shadow on Android
    shadowColor: '#000', // subtle shadow on iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  icon: {
    marginRight: 12
  },
  textContainer: {
    flex: 1
  },
  name: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailText: {
    color: COLORS.subtext,
    fontSize: 13
  },
  dot: {
    color: COLORS.subtext,
    fontSize: 13,
    marginHorizontal: 4
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 8
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyText: {
    color: COLORS.subtext,
    fontSize: 16,
    marginTop: 16
  }
});