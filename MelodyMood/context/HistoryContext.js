import React, { createContext, useState, useContext } from 'react';

const HistoryContext = createContext();

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);

  const addToHistory = (item) => {
    setHistory(prev => [
      { ...item, timestamp: Date.now() }, 
      ...prev.filter(i => i.id !== item.id)
    ].slice(0, 50)); // Keep last 50 items
  };

  return (
    <HistoryContext.Provider value={{ history, addToHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => useContext(HistoryContext);
