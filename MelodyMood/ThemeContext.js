import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from './theme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('light');

  useEffect(() => {
    const loadTheme = async () => {
      const stored = await AsyncStorage.getItem('appTheme');
      if (stored) setThemeName(stored);
    };
    loadTheme();
  }, []);

  const changeTheme = async (newTheme) => {
    setThemeName(newTheme);
    await AsyncStorage.setItem('appTheme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ themeName, theme: themes[themeName], changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
