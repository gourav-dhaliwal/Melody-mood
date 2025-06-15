// context/DownloadContext.js
import React, { createContext, useState } from 'react';

export const DownloadContext = createContext();

export const DownloadProvider = ({ children }) => {
  const [downloadedSongs, setDownloadedSongs] = useState([]);

  const downloadSong = (song) => {
    setDownloadedSongs(prev => [...prev, song]);
  };

  return (
    <DownloadContext.Provider value={{ downloadedSongs, downloadSong }}>
      {children}
    </DownloadContext.Provider>
  );
};
