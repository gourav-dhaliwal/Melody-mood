
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

const moods = [
  { label: '😊 Happy', color: '#ffeb3b' },
  { label: '😢 Sad', color: '#90caf9' },
  { label: '💪 Energetic', color: '#ff9800' },
  { label: '😌 Relaxed', color: '#aed581' },
  { label: '😠 Angry', color: '#ef5350' },
  { label: '😇 Calm', color: '#b39ddb' },
];

const MoodSelector = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleMoodPress = (mood) => {
    setSelectedMood(mood);


    scaleAnim.setValue(1);
    Animated.spring(scaleAnim, {
      toValue: 1.1,
      friction: 3,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 Select Your Mood 🎵</Text>
      <View style={styles.moodContainer}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.label}
            style={[
              styles.moodButton,
              selectedMood === mood && { backgroundColor: mood.color },
            ]}
            onPress={() => handleMoodPress(mood)}
          >
            <Animated.Text
              style={[
                styles.moodButtonText,
                selectedMood === mood && styles.selectedMoodButtonText,
                { transform: [{ scale: selectedMood === mood ? scaleAnim : 1 }] },
              ]}
            >
              {mood.label}
            </Animated.Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedMood && (
        <Text style={styles.selectedMoodText}>
          You selected: {selectedMood.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  moodButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#00bfff',
    margin: 10,
    backgroundColor: '#fff',
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  moodButtonText: {
    fontSize: 18,
    color: '#00bfff',
    fontWeight: '500',
  },
  selectedMoodButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  selectedMoodText: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
  },
});

export default MoodSelector;
