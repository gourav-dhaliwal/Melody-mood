import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Contexts
import { DownloadProvider } from './context/DownloadContext';
import { LikedPlaylistsProvider } from './context/LikedPlaylistsContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { HistoryProvider } from './context/HistoryContext';
import AboutAndFeedback from './AboutAndFeedback'; 


// Screens
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
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './ProfileScreen';
import NotificationBanner from './NotificationBanner';
import { ThemeProvider } from './ThemeContext';
import { ThemeContext } from './ThemeContext';

// Onboarding Screens
import OnboardingScreen1 from './screens/OnboardingScreen1';
import OnboardingScreen2 from './screens/OnboardingScreen2';
import OnboardingScreen3 from './screens/OnboardingScreen3';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const RootStack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator initialRouteName="HomePage">
    <Stack.Screen name="HomePage" component={HomePage} options={{ headerShown: false }} />
    <Stack.Screen name="Settings" component={Settings} options={{ headerTitle: 'Settings' }} />
    <Stack.Screen name="Downloaded" component={DownloadedSongs} options={{ headerTitle: 'Saved Songs' }} />
    <Stack.Screen name="LikedPlaylists" component={LikedPlaylistsScreen} options={{ headerTitle: 'Liked Playlists' }} />
    <Stack.Screen name="Notifications" component={Notifications} options={{ headerTitle: 'Notifications' }} />
    <Stack.Screen name="History" component={HistoryScreen} options={{ headerTitle: 'Listening History' }} />
    <Stack.Screen name="Change Theme" component={ThemeContext} options={{ headerTitle: 'Theme' }} />
<<<<<<< HEAD
    {/* 
      Moved TrackList here as well, so accessible from HomeStack if needed 
      (optional, but useful if you want to navigate by name globally)
    */}
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
=======
    <Stack.Screen name="About & Feedback" component={AboutAndFeedback} options={{ headerTitle: 'About & Feedback' }} />

>>>>>>> 70fddf5a24b3561051a5d9465b630654ec373c81
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
        else if (route.name === 'Mood Selector') iconName = focused ? 'color-palette' : 'color-palette-outline';
        else if (route.name === 'Mood journal') iconName = focused ? 'book' : 'book-outline';
        else if (route.name === 'Playlists') iconName = focused ? 'musical-notes' : 'musical-notes-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
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
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const MainApp = () => {
  const { user } = useContext(AuthContext);
  const [showLogin, setShowLogin] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const stored = await AsyncStorage.getItem('loggedInUser');
        if (stored) {
          setShowLogin(false);
        }
      } catch (error) {
        console.error("Error fetching stored user:", error);
      } finally {
        setInitializing(false);
      }
    };
    checkUser();
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return user
    ? <AppNavigator />
    : showLogin
      ? <LoginScreen switchToSignup={() => setShowLogin(false)} />
      : <SignupScreen switchToLogin={() => setShowLogin(true)} setShowLogin={setShowLogin} />;
};

const RootNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(seen === 'true');
      setIsLoading(false);
    };
    checkOnboarding();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!hasSeenOnboarding ? (
        <>
          <RootStack.Screen name="Onboarding1" component={OnboardingScreen1} />
          <RootStack.Screen name="Onboarding2" component={OnboardingScreen2} />
          <RootStack.Screen name="Onboarding3" component={OnboardingScreen3} />
        </>
      ) : null}
      <RootStack.Screen name="MainApp" component={MainApp} />
    </RootStack.Navigator>
  );
};

const App = () => (
  <AuthProvider>
    <DownloadProvider>
      <LikedPlaylistsProvider>
        <NotificationProvider>
          <HistoryProvider>
            <ThemeProvider>
              <NavigationContainer>
                <View style={{ flex: 1 }}>
                  <NotificationBanner />
                  <RootNavigator />
                </View>
              </NavigationContainer>
            </ThemeProvider>
          </HistoryProvider>
        </NotificationProvider>
      </LikedPlaylistsProvider>
    </DownloadProvider>
  </AuthProvider>
);

export default App;
