import React, { createContext, useState } from 'react';

export const UserPlaylistsContext = createContext();

export const UserPlaylistsProvider = ({ children }) => {
  const [userPlaylists, setUserPlaylists] = useState([
    // Sample data (optional)
    { id: '1', name: 'My Favorites', tracks: [] },
    { id: '2', name: 'Workout Mix', tracks: [] },
  ]);

  const addPlaylist = (name) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      tracks: []
    };
    setUserPlaylists([...userPlaylists, newPlaylist]);
  };

  const editPlaylist = (id, newName) => {
    setUserPlaylists(
      userPlaylists.map(playlist =>
        playlist.id === id ? { ...playlist, name: newName } : playlist
      )
    );
  };

  const deletePlaylist = (id) => {
    setUserPlaylists(userPlaylists.filter(playlist => playlist.id !== id));
  };

  return (
    <UserPlaylistsContext.Provider
      value={{ userPlaylists, addPlaylist, editPlaylist, deletePlaylist }}
    >
      {children}
    </UserPlaylistsContext.Provider>
  );
};