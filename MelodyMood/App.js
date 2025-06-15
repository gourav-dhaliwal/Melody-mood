import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Import screen components
import HomePage from './HomePage';
import Settings from './settings';
import MoodJournal from './MoodJournal';
import Playlists from './Playlists';
import TrackListScreen from './screens/TrackListScreen';
import MoodSelector from './MoodSelector'; 
// import UserSearch from './UserSearch';


// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack Navigator
const HomeStack = () => (
  <Stack.Navigator initialRouteName="HomePage">
    <Stack.Screen 
      name="HomePage" 
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

// Playlists Stack Navigator
const PlaylistsStack = () => (
  <Stack.Navigator initialRouteName="PlaylistsList">
    <Stack.Screen 
      name="PlaylistsList" 
      component={Playlists} 
      options={{ headerShown: false }} // No header for the main playlists screen
    />
    <Stack.Screen 
      name="TrackList" 
      component={TrackListScreen} 
      options={{ 
        headerTitle: "Tracks",
        headerStyle: {
          backgroundColor: '#1DB954',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }} 
    />
  </Stack.Navigator>
);

// Bottom Tab Navigator
const AppNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Mood Selector" component={MoodSelector} /> 
    <Tab.Screen name="Mood journal" component={MoodJournal} />
    <Tab.Screen name="Playlists" component={PlaylistsStack} />
    {/* <Tab.Screen name="Community" component={UserSearch} /> */}

    
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