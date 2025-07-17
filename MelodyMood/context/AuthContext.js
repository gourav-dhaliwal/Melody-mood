import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check if user is remembered on app launch
  useEffect(() => {
    const loadRememberedUser = async () => {
      const rememberedEmail = await AsyncStorage.getItem('userEmail');
      if (rememberedEmail) {
        setUser(rememberedEmail);
      }
    };
    loadRememberedUser();
  }, []);

  const login = async (email, password, rememberMe) => {
    try {
      const existing = await AsyncStorage.getItem('users');
      const users = existing ? JSON.parse(existing) : [];

      const matchedUser = users.find(
        (u) => u.email === email && u.password === password
      );

      if (!matchedUser) {
        Alert.alert('Login Failed', 'Invalid email or password');
        return;
      }

      setUser(email);

      if (rememberMe) {
        await AsyncStorage.setItem('userEmail', email);
      } else {
        await AsyncStorage.removeItem('userEmail');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const signup = async (email, password) => {
    try {
      const existing = await AsyncStorage.getItem('users');
      const users = existing ? JSON.parse(existing) : [];

      const userExists = users.some((u) => u.email === email);
      if (userExists) {
        Alert.alert('Signup Failed', 'User already exists');
        return;
      }

      users.push({ email, password });
      await AsyncStorage.setItem('users', JSON.stringify(users));
      setUser(email);
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('userEmail');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
