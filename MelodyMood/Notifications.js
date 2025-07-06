import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { NotificationContext } from './context/NotificationContext';
import { ThemeContext } from './ThemeContext';


const Notifications = () => {
  const { notifications } = useContext(NotificationContext);
  const { theme } = useContext(ThemeContext);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.time}>{item.timestamp}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No notifications yet</Text>}
      />
    </View>
  );
};

export default Notifications;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8f9fa',
      paddingHorizontal: 16,
      paddingTop: 20,
    },
    header: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#212529',
      marginBottom: 24,
      textAlign: 'center',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      marginBottom: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: '#f0f0f0',
      borderLeftWidth: 4,
      borderLeftColor: '#1DB954',
    },
    message: {
      fontSize: 16,
      fontWeight: '500',
      color: '#212529',
      marginBottom: 8,
      lineHeight: 20,
    },
    time: {
      fontSize: 14,
      color: '#6c757d',
      fontWeight: '400',
    },
    empty: {
      textAlign: 'center',
      fontSize: 16,
      color: '#6c757d',
      marginTop: 60,
      fontWeight: '500',
    },
  });