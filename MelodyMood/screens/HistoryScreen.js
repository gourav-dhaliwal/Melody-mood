import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHistory } from '../context/HistoryContext';
import { ThemeContext } from '../ThemeContext';

export default function HistoryScreen({ navigation }) {
  const { history, clearHistory } = useHistory();
  const { theme } = useContext(ThemeContext);

  const confirmClear = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all playback history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearHistory()
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>Listening History</Text>
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
            style={[
              styles.item,
              {
                backgroundColor: theme.card,
                borderLeftWidth: 4,
                borderLeftColor: item.type === 'song' ? '#FF9F43' : '#4BC0C8'
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
              color={item.type === 'song' ? '#FF9F43' : '#4BC0C8'}
              style={styles.icon}
            />
            <View style={styles.textContainer}>
              <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
              <View style={styles.details}>
                <Text style={[styles.detailText, { color: theme.text }]}>{item.type === 'song' ? 'Song' : 'Playlist'}</Text>
                <Text style={[styles.dot, { color: theme.text }]}> • </Text>
                <Text style={[styles.detailText, { color: theme.text }]}>
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.text} />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={[styles.divider, { backgroundColor: theme.text + '22' }]} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color={theme.text} />
            <Text style={[styles.emptyText, { color: theme.text }]}>No recent activity</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    marginLeft: 8
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    marginBottom: 8
  },
  icon: {
    marginRight: 12
  },
  textContainer: {
    flex: 1
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailText: {
    fontSize: 13
  },
  dot: {
    fontSize: 13,
    marginHorizontal: 4
  },
  divider: {
    height: 1,
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
    fontSize: 16,
    marginTop: 16
  }
});
