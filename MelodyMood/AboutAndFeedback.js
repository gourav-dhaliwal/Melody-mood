import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const AboutAndFeedback = ({ route }) => {
  // Read initialTab param from route.params or default to 'about'
  const initialTab = route?.params?.initialTab || 'about';

  // Set activeTab state initialized with initialTab param
  const [activeTab, setActiveTab] = useState(initialTab);
  const [feedback, setFeedback] = useState('');

  // Optional: if route params might change (usually they don't), sync state with param
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleSubmit = () => {
    if (feedback.trim() === '') {
      Alert.alert('Please enter some feedback');
      return;
    }
    Alert.alert('Thank you for your feedback!', feedback);
    setFeedback('');
  };

  const renderTabButton = (label, tabKey) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabKey && styles.activeTab]}
      onPress={() => setActiveTab(tabKey)}
    >
      <Text style={[styles.tabText, activeTab === tabKey && styles.activeTabText]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('About', 'about')}
        {renderTabButton('Feedback', 'feedback')}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'about' ? (
          <>
            <Text style={styles.header}>🎵 About MelodyMood</Text>
            <Text style={styles.text}>Version: 1.0.0</Text>
            <Text style={styles.text}>
              MelodyMood is your personalized music companion that curates tracks based on your mood.
              Enjoy curated playlists, mood-based selections, and more. Our goal is to make your listening experience effortless and delightful.
            </Text>
            <Text style={styles.text}>
              Developed with ❤️ by Team MelodyMood:
              {"\n"}• Gouravdeep Singh
              {"\n"}• Gurleen Kaur
              {"\n"}• Monika Dhiman
              {"\n"}• Vikrant Walia
              {"\n"}• Ashok Palwa
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.header}>💬 Feedback</Text>
            <Text style={styles.text}>We’d love to hear your thoughts!</Text>
            <TextInput
              style={styles.input}
              placeholder="Type your feedback here..."
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={4}
            />
            <Button title="Submit Feedback" onPress={handleSubmit} color="#4CAF50" />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#E0E0E0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    lineHeight: 22,
  },
  input: {
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#FFF',
    textAlignVertical: 'top',
  },
});

export default AboutAndFeedback;
