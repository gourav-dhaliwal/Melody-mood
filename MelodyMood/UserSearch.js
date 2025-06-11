import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';

const mockUsers = [
  { id: '1', name: 'Alice', playlists: ['Chill Vibes', 'Workout'] },
  { id: '2', name: 'Bob', playlists: ['Rock Hits', 'Focus'] },
  { id: '3', name: 'Carol', playlists: ['Jazz Nights', 'Sleep'] },
];

const UserSearch = () => {
  const [search, setSearch] = useState('');
  const [followed, setFollowed] = useState([]);

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFollow = (userId) => {
    setFollowed(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Find Users to Follow</Text>
      <TextInput
        style={styles.input}
        placeholder="Search users..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.playlists}>Playlists: {item.playlists.join(', ')}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => toggleFollow(item.id)}
            >
              <Text style={styles.buttonText}>
                {followed.includes(item.id) ? 'Unfollow' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default UserSearch;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 16 },
  userCard: { marginBottom: 16, padding: 12, borderRadius: 10, backgroundColor: '#f2f2f2' },
  name: { fontSize: 18, fontWeight: '600' },
  playlists: { fontSize: 14, color: '#666' },
  button: { marginTop: 8, backgroundColor: '#1DB954', padding: 8, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
