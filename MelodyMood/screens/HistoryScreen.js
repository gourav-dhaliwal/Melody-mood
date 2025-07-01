// In HistoryScreen.js

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHistory } from '../context/HistoryContext';
const COLORS = {
  background: '#FFFFFF',
  text: '#000000',
  subtext: '#666666',
  card: '#F8F8F8',
  divider: '#E0E0E0',
  song: '#FF9F43',
  playlist: '#4BC0C8',
  danger: '#FF3B30'
};
export default function HistoryScreen({ navigation }) {
  const { history, clearHistory } = useHistory(); // <- Now includes clearHistory

  const confirmClear = () => {
  Alert.alert(
    'Clear History',
    'Are you sure you want to delete all playback history?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          clearHistory(); // <- Must be a function call with ()
        }
      }
    ]
  );
};


  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Listening History</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={confirmClear}>
            <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={history}
        keyExtractor={(item, index) => `${item.id}-${item.timestamp}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, {
              borderLeftWidth: 4,
              borderLeftColor: item.type === 'song' ? '#FF9F43' : '#4BC0C8',
              marginBottom: 8
            }]}
            onPress={() => navigation.navigate('TrackList', {
              playlistId: item.id,
              playlistName: item.name
            })}
          >
            <Ionicons
              name={item.type === 'song' ? 'musical-notes' : 'list'}
              size={20}
              color={item.type === 'song' ? '#FF9F43' : '#4BC0C8'}
              style={styles.icon}
            />
            <View style={styles.textContainer}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <View style={styles.details}>
                <Text style={styles.detailText}>
                  {item.type === 'song' ? 'Song' : 'Playlist'}
                </Text>
                <Text style={styles.dot}> • </Text>
                <Text style={styles.detailText}>
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#666" />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color="#666666" />
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
    elevation: 1,
    shadowColor: '#000',
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
  headerRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
  marginLeft: 8,
  marginRight: 8
},

  emptyText: {
    color: COLORS.subtext,
    fontSize: 16,
    marginTop: 16
  
  }
  
});
