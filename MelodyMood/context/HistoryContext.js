import React, { createContext, useContext, useState } from 'react';

const HistoryContext = createContext();

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);

  const addToHistory = (item) => {
    setHistory(prev => [
      { ...item, timestamp: Date.now() },
      ...prev.filter(i => i.id !== item.id)
    ].slice(0, 50));
  };

  const clearHistory = () => {
    console.log('Clearing history'); // Debug
    setHistory([]); // Clear all
  };

  return (
    <HistoryContext.Provider value={{ history, addToHistory, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
