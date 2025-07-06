import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Sentiment from 'sentiment';
import { ThemeContext } from './ThemeContext';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

const moodRecommendations = {
  happy: ['Happy Beats', 'Feel Good Hits', 'Sunny Day Vibes'],
  sad: ['Heartbreak Anthems', 'Melancholy Melodies', 'Blue Mood'],
  energetic: ['Workout Bangers', 'Party Time', 'Upbeat Energy'],
  relaxed: ['Lo-Fi Beats', 'Acoustic Chill', 'Wind-Down Vibes'],
  angry: ['Anger Release', 'Power Rock', 'Aggressive Beats'],
  neutral: ['Popular Picks', 'Mixed Bag', 'Top Charts'],
};

const keywords = {
  happy: ['happy', 'joy', 'cheerful', 'excited', /* … */],
  sad: ['sad', 'cry', 'tears', /* … */],
  energetic: ['energetic', 'active', /* … */],
  relaxed: ['relaxed', 'calm', /* … */],
  angry: ['angry', 'mad', /* … */],
  neutral: ['okay', 'meh', /* … */],
};

const MoodJournal = () => {
  const [journal, setJournal] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [mood, setMood] = useState(null);
  const sentiment = new Sentiment();

  const { theme } = useContext(ThemeContext);

  const analyzeMood = () => {
    const result = sentiment.analyze(journal);
    const score = result.score;
    const tokens = result.tokens.map((t) => t.toLowerCase());
    let detectedMood = 'neutral';

    for (const moodKey in keywords) {
      if (tokens.some((token) => keywords[moodKey].includes(token))) {
        detectedMood = moodKey;
        break;
      }
    }

    if (detectedMood === 'neutral') {
      if (score > 4) detectedMood = 'happy';
      else if (score > 0) detectedMood = 'energetic';
      else if (score < -4) detectedMood = 'sad';
      else if (score < 0) detectedMood = 'relaxed';
    }

    setMood(detectedMood);
    setRecommendations(moodRecommendations[detectedMood]);
  };

  const renderRecommendationItem = ({ item }) => (
    <View
      style={[
        styles.recommendationCard,
        { backgroundColor: theme.card, shadowColor: theme.text },
      ]}
    >
      <Text style={[styles.recommendationText, { color: theme.text }]}>{item}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <FlatList
        data={recommendations}
        keyExtractor={(item) => item}
        numColumns={2}
        renderItem={renderRecommendationItem}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={
          <>
            <View
              style={[
                styles.header,
                { backgroundColor: theme.card, shadowColor: theme.text },
              ]}
            >
              <Text style={[styles.mainTitle, { color: theme.text }]}>✍️ Mood Journal</Text>
              <Text style={[styles.subtitle, { color: theme.text }]}>
                Express your feelings and discover matching playlists
              </Text>
            </View>

            <View
              style={[
                styles.journalSection,
                { backgroundColor: theme.card, shadowColor: theme.text },
              ]}
            >
              <TextInput
                style={[
                  styles.textInput,
                  { color: theme.text, borderColor: theme.text },
                ]}
                multiline
                placeholder="How are you feeling today?"
                placeholderTextColor={theme.background === '#222' ? '#bbbbbbcc' : theme.text + '77'}
                value={journal}
                onChangeText={setJournal}
              />
              <TouchableOpacity
                style={[styles.analyzeButton, { backgroundColor: theme.header }]}
                onPress={analyzeMood}
              >
                <Text style={styles.analyzeButtonText}>Analyze Mood</Text>
              </TouchableOpacity>
            </View>

            {mood && (
              <View style={styles.resultSection}>
                <Text style={[styles.resultText, { color: theme.text }]}>
                  Detected Mood:{' '}
                  <Text style={[styles.moodText, { color: theme.header }]}>
                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </Text>
                </Text>
                <Text style={[styles.recommendationsTitle, { color: theme.text }]}>
                  Recommended Playlists:
                </Text>
              </View>
            )}
          </>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.text }]}>
              Powered by Sentiment Analysis ✨
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 4,
    paddingBottom: 10,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  journalSection: {
    padding: 15,
    borderRadius: 15,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 25,
  },
  textInput: {
    height: 120,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  analyzeButton: {
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
    marginBottom: 10,
    fontWeight: '600',
  },
  moodText: {
    fontWeight: '700',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recommendationCard: {
    width: ITEM_WIDTH,
    borderRadius: 15,
    padding: 12,
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
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default MoodJournal;
