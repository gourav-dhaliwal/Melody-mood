import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import screen components
import HomePage from './HomePage';
import Settings from './settings';
import MoodJournal from './MoodJournal';
import Playlists from './Playlists';
import TrackListScreen from './screens/TrackListScreen';
import MoodSelector from './MoodSelector';
import DownloadedSongs from './DownloadedSongs';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack Navigator
const HomeStack = () => (
  <Stack.Navigator initialRouteName="HomePage">
    <Stack.Screen 
      name="HomePage" 
      component={HomePage} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Settings" 
      component={Settings} 
      options={{ headerTitle: "Settings" }}
    />
  <Stack.Screen 
  name="Downloaded" 
  component={DownloadedSongs} 
   options={{ headerTitle: 'Downloaded Songs' }} 
/>

  </Stack.Navigator>
);

// Playlists Stack Navigator
const PlaylistsStack = () => (
  <Stack.Navigator initialRouteName="PlaylistsList">
    <Stack.Screen 
      name="PlaylistsList" 
      component={Playlists} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="TrackList" 
      component={TrackListScreen} 
      options={{ 
        headerTitle: "Tracks",
        headerStyle: { backgroundColor: '#1DB954' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }} 
    />
  </Stack.Navigator>
);

// Bottom Tab Navigator with icons
const AppNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Mood Selector') {
          iconName = focused ? 'happy' : 'happy-outline';
        } else if (route.name === 'Mood journal') {
          iconName = focused ? 'journal' : 'journal-outline';
        } else if (route.name === 'Playlists') {
          iconName = focused ? 'musical-notes' : 'musical-notes-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#1DB954',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        backgroundColor: '#121212',
        borderTopColor: '#333',
      },
      tabBarLabelStyle: {
        fontSize: 12,
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Mood Selector" component={MoodSelector} /> 
    <Tab.Screen name="Mood journal" component={MoodJournal} />
    <Tab.Screen name="Playlists" component={PlaylistsStack} />
  </Tab.Navigator>
);

// App Component
const App = () => (
  <NavigationContainer>
    <AppNavigator />
  </NavigationContainer>
);

export default App;
