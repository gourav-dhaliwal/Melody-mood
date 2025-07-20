import React, { createContext, useState } from 'react';

export const DownloadContext = createContext();

export const DownloadProvider = ({ children }) => {
  const [downloadedSongs, setDownloadedSongs] = useState([]);

  const downloadSong = (song) => {
    setDownloadedSongs(prev => {
      const exists = prev.some(item => item.id === song.id);
      return exists ? prev : [...prev, song];
    });
  };

  return (
    <DownloadContext.Provider value={{ downloadedSongs, setDownloadedSongs, downloadSong }}>
      {children}
    </DownloadContext.Provider>
  );
};
