import React, { createContext, useState } from 'react';

export const LikedPlaylistsContext = createContext();

export const LikedPlaylistsProvider = ({ children }) => {
  const [likedPlaylists, setLikedPlaylists] = useState([]);

  const toggleLike = (playlist) => {
    setLikedPlaylists((prev) => {
      const exists = prev.find((p) => p.id === playlist.id);
      if (exists) {
        return prev.filter((p) => p.id !== playlist.id); // unlike
      } else {
        return [...prev, playlist]; // like
      }
    });
  };

  return (
    <LikedPlaylistsContext.Provider value={{ likedPlaylists, toggleLike }}>
      {children}
    </LikedPlaylistsContext.Provider>
  );
};
