import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { NotificationContext } from './context/NotificationContext';

const NotificationBanner = () => {
  const { notifications } = useContext(NotificationContext);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (notifications.length > 0) {
      // Show newest notification
      const latest = notifications[0];
      setMessage(latest.message);
      setVisible(true);

      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
          setMessage('');
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.banner, { opacity: fadeAnim }]}>
      <Text style={styles.text}>{message}</Text>
      <TouchableOpacity onPress={() => setVisible(false)}>
        <Text style={styles.dismiss}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: '#1DB954',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 10,
  },
  text: {
    flex: 1,
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  dismiss: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
  },
});

export default NotificationBanner;
