import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Import screen components
import HomePage from './HomePage';
import Settings from './settings';
import MoodDetector from './MoodDetector';
import Playlists from './Playlists';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack Navigator
const HomeStack = () => (
  <Stack.Navigator initialRouteName="Home">
    <Stack.Screen 
      name="Home" 
      component={HomePage} 
      options={{ headerShown: false }} // No header for the Home screen
    />
    <Stack.Screen 
      name="Settings" 
      component={Settings} 
      options={{ headerTitle: "Settings" }} // Add a header for Settings screen
    />
  </Stack.Navigator>
);

// Bottom Tab Navigator
const AppNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Mood Detector" component={MoodDetector} />
    <Tab.Screen name="Playlists" component={Playlists} />
  </Tab.Navigator>
);

// App Component
const App = () => {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;
