import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import Sentiment from 'sentiment';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

const moodRecommendations = {
  happy: ['Happy Beats', 'Feel Good Hits', 'Sunny Day Vibes'],
  sad: ['Heartbreak Anthems', 'Melancholy Melodies', 'Blue Mood'],
  energetic: ['Workout Bangers', 'Party Time', 'Upbeat Energy'],
  relaxed: ['Lo-Fi Beats', 'Acoustic Chill', 'Wind-Down Vibes'],
  neutral: ['Popular Picks', 'Mixed Bag', 'Top Charts']
};

const MoodJournal = () => {
  const [journal, setJournal] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [mood, setMood] = useState(null);
  const sentiment = new Sentiment();

  const analyzeMood = () => {
    const result = sentiment.analyze(journal);
    let detectedMood = 'neutral';

    if (result.score > 2) detectedMood = 'happy';
    else if (result.score < -2) detectedMood = 'sad';
    else if (result.score > 0) detectedMood = 'energetic';
    else if (result.score < 0) detectedMood = 'relaxed';

    setMood(detectedMood);
    setRecommendations(moodRecommendations[detectedMood]);
  };

  const renderRecommendationItem = ({ item }) => (
    <View style={styles.recommendationCard}>
      <Text style={styles.recommendationText}>{item}</Text>
    </View>
  );

  // Compose a combined data array for FlatList:
  // We'll pass recommendations as data if mood is detected, else empty array
  const data = recommendations;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item}
      numColumns={2}
      renderItem={renderRecommendationItem}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <Text style={styles.mainTitle}>✍️ Mood Journal</Text>
            <Text style={styles.subtitle}>Express your feelings and discover matching playlists</Text>
          </View>

          <View style={styles.journalSection}>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="How are you feeling today?"
              value={journal}
              onChangeText={setJournal}
            />
            <TouchableOpacity style={styles.analyzeButton} onPress={analyzeMood}>
              <Text style={styles.analyzeButtonText}>Analyze Mood</Text>
            </TouchableOpacity>
          </View>

          {mood && (
            <View style={styles.resultSection}>
              <Text style={styles.resultText}>
                Detected Mood: <Text style={styles.moodText}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</Text>
              </Text>
              <Text style={styles.recommendationsTitle}>Recommended Playlists:</Text>
            </View>
          )}
        </>
      }
      ListFooterComponent={
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Sentiment Analysis ✨</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 4,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: 10,
  },
  journalSection: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 25,
  },
  textInput: {
    height: 120,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#2c3e50',
  },
  analyzeButton: {
    backgroundColor: '#1DB954',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultSection: {
    marginBottom: 20,
  },
  resultText: {
    fontSize: 18,
    color: '#2c3e50',
    marginBottom: 10,
    fontWeight: '600',
  },
  moodText: {
    color: '#1DB954',
    fontWeight: '700',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#7f8c8d',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recommendationCard: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  recommendationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default MoodJournal;
