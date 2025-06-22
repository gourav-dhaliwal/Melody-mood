import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DownloadProvider } from './context/DownloadContext';
import { LikedPlaylistsProvider } from './context/LikedPlaylistsContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, AuthContext } from './context/AuthContext';

import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';

import HomePage from './HomePage';
import Settings from './settings';
import MoodJournal from './MoodJournal';
import Playlists from './Playlists';
import TrackListScreen from './screens/TrackListScreen';
import MoodSelector from './MoodSelector';
import DownloadedSongs from './DownloadedSongs';
import LikedPlaylistsScreen from './LikedPlaylistsScreen';
import Notifications from './Notifications';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator initialRouteName="HomePage">
    <Stack.Screen name="HomePage" component={HomePage} options={{ headerShown: false }} />
    <Stack.Screen name="Settings" component={Settings} options={{ headerTitle: 'Settings' }} />
    <Stack.Screen name="Downloaded" component={DownloadedSongs} options={{ headerTitle: 'Saved Songs' }} />
    <Stack.Screen name="LikedPlaylists" component={LikedPlaylistsScreen} options={{ headerTitle: 'Liked Playlists' }} />
    <Stack.Screen name="Notifications" component={Notifications} options={{ headerTitle: 'Notifications' }} />
  </Stack.Navigator>
);

const PlaylistsStack = () => (
  <Stack.Navigator initialRouteName="PlaylistsList">
    <Stack.Screen name="PlaylistsList" component={Playlists} options={{ headerShown: false }} />
    <Stack.Screen
      name="TrackList"
      component={TrackListScreen}
      options={{
        headerTitle: 'Tracks',
        headerStyle: { backgroundColor: '#1DB954' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Mood Selector') iconName = focused ? 'happy' : 'happy-outline';
        else if (route.name === 'Mood journal') iconName = focused ? 'journal' : 'journal-outline';
        else if (route.name === 'Playlists') iconName = focused ? 'musical-notes' : 'musical-notes-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#1DB954',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#333' },
      tabBarLabelStyle: { fontSize: 12 },
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Mood Selector" component={MoodSelector} />
    <Tab.Screen name="Mood journal" component={MoodJournal} />
    <Tab.Screen name="Playlists" component={PlaylistsStack} />
  </Tab.Navigator>
);

const MainApp = () => {
  const { user } = useContext(AuthContext);
  const [showLogin, setShowLogin] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const stored = await AsyncStorage.getItem('loggedInUser');
      if (stored) {
        
      } else {
        setShowLogin(true);
      }
      setInitializing(false);
    };
    checkUser();
  }, []);

  if (initializing) return null;

  if (user) return <AppNavigator />;

  return showLogin
    ? <LoginScreen switchToSignup={() => setShowLogin(false)} />
    : <SignupScreen switchToLogin={() => setShowLogin(true)} />;
};

const App = () => (
  <AuthProvider>
    <DownloadProvider>
      <LikedPlaylistsProvider>
        <NotificationProvider>
          <NavigationContainer>
            <MainApp />
          </NavigationContainer>
        </NotificationProvider>
      </LikedPlaylistsProvider>
    </DownloadProvider>
  </AuthProvider>
);

export default App;
