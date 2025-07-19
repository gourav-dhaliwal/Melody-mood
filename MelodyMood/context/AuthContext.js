// context/AuthContext.js
import React, { createContext, useEffect, useState } from 'react';
import { auth } from '../utils/firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const remember = await AsyncStorage.getItem('rememberMe');
        if (remember === 'true') {
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);
const login = async (email, password, rememberMe) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // ✅ Force immediate state update so UI switches to AppNavigator
    setUser(userCredential.user);

    if (rememberMe) {
      await AsyncStorage.setItem('rememberMe', 'true');
    } else {
      await AsyncStorage.removeItem('rememberMe');
    }
  } catch (e) {
    alert('Login failed: ' + e.message);
  }
};



const signup = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    return true; // indicate success
  } catch (e) {
    alert('Signup failed: ' + e.message);
    return false; // indicate failure
  }
};

const logout = async () => {
  await signOut(auth);
  await AsyncStorage.removeItem('rememberMe');
  await AsyncStorage.removeItem('loggedInUser'); // 👈 clear stored flag
  setUser(null);
};


  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
