import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Dimensions, 
  SafeAreaView
} from 'react-native';
import Sentiment from 'sentiment';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

const moodRecommendations = {
  happy: ['Happy Beats', 'Feel Good Hits', 'Sunny Day Vibes'],
  sad: ['Heartbreak Anthems', 'Melancholy Melodies', 'Blue Mood'],
  energetic: ['Workout Bangers', 'Party Time', 'Upbeat Energy'],
  relaxed: ['Lo-Fi Beats', 'Acoustic Chill', 'Wind-Down Vibes'],
  angry: ['Anger Release', 'Power Rock', 'Aggressive Beats'],
  neutral: ['Popular Picks', 'Mixed Bag', 'Top Charts']
};

const keywords = {
  happy: ['happy', 'joy', 'cheerful', 'excited', 'delighted', 'glad', 'content', 'pleased', 'smiling', 'laughing', 'grateful', 'blessed', 'ecstatic', 'thrilled', 'elated', 'euphoric', 'awesome', 'fantastic', 'wonderful'],
  sad: ['sad', 'cry', 'tears', 'depressed', 'unhappy', 'melancholy', 'blue', 'gloomy', 'heartbroken', 'miserable', 'down', 'lonely', 'sorrow', 'grief', 'despair', 'hopeless', 'empty', 'forlorn'],
  energetic: ['energetic', 'active', 'motivated', 'pumped', 'hyped', 'lively', 'powerful', 'determined', 'strong', 'inspired', 'driven', 'productive', 'enthusiastic', 'focused', 'alert'],
  relaxed: ['relaxed', 'calm', 'peaceful', 'serene', 'chill', 'unwind', 'zen', 'tranquil', 'soothing', 'easygoing', 'restful', 'cozy', 'composed', 'quiet', 'balanced', 'laid-back', 'content'],
  angry: ['angry', 'mad', 'furious', 'rage', 'irritated', 'annoyed', 'frustrated', 'upset', 'enraged', 'fuming', 'outraged', 'resentful', 'bitter', 'pissed', 'aggravated', 'exasperated', 'hostile'],
  neutral: ['okay', 'meh', 'fine', 'neutral', 'alright', 'indifferent', 'nothing', 'unsure', 'blank', 'normal', 'balanced', 'even', 'stable', 'regular', 'typical'],
};

const MoodJournal = () => {
  const [journal, setJournal] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [mood, setMood] = useState(null);
  const sentiment = new Sentiment();

  const analyzeMood = () => {
    const result = sentiment.analyze(journal);
    const score = result.score;
    const tokens = result.tokens.map(token => token.toLowerCase());

    let detectedMood = 'neutral';

    // Check keywords first
    for (const moodKey in keywords) {
      if (tokens.some(token => keywords[moodKey].includes(token))) {
        detectedMood = moodKey;
        break;
      }
    }

    // If no keyword matched, fallback to sentiment score logic
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
    <View style={styles.recommendationCard}>
      <Text style={styles.recommendationText}>{item}</Text>
    </View>
  );

  const data = recommendations;

  return (
    <SafeAreaView style={styles.safeArea}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  header: {
    paddingTop: 40,
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
