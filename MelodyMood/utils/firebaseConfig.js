import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCmMvsGzvBUR8J6YuN6K5sW23rshdKlSmc",
  authDomain: "melodymood-ff460.firebaseapp.com",
  projectId: "melodymood-ff460",
  storageBucket: "melodymood-ff460.appspot.com", 
  appId: "1:884049151327:web:ab8c96fa4325adb18b62ea",
  measurementId: "G-DZM3L9CSCN"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth };
