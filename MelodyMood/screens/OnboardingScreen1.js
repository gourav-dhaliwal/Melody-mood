import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OnboardingScreen1 = ({ navigation }) => {
  return (
    <ImageBackground
      source={require('../assets/mood.jpg')} // full screen background image
      style={styles.background}
      resizeMode="cover"
    >
      {/* Dark overlay */}
      <View style={styles.overlay} />

      <View style={styles.content}>
        <Image
          source={require('../assets/mood.jpg')} // smaller preview image on top
          style={styles.image}
          resizeMode="cover"
        />

        <Text style={styles.title}>Detect Your Mood</Text>
        <Text style={styles.description}>
          Melody Mood detects your emotions and suggests music accordingly.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => navigation.navigate('Onboarding2')}
          >
            <Text style={styles.buttonText}>
              Next <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.replace('MainApp')}
          >
            <Text style={styles.buttonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default OnboardingScreen1;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',   // full width and height for background image
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)', // dark transparent overlay
  },
  content: {
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1DB954',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#fff',  // white text for better contrast on dark overlay
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  nextButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#555',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
