import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
const PlaylistContext = createContext();

export const PlaylistProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState([]);

  
  React.useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const savedPlaylists = await AsyncStorage.getItem('playlists');
        if (savedPlaylists) {
          setPlaylists(JSON.parse(savedPlaylists));
        } else {
          
          setPlaylists([
            { id: '1', name: 'Favorites', songs: [] },
            { id: '2', name: 'Workout Mix', songs: [] },
            { id: '3', name: 'Chill Vibes', songs: [] },
          ]);
        }
      } catch (error) {
        console.error('Failed to load playlists:', error);
      }
    };
    
    loadPlaylists();
  }, []);

  React.useEffect(() => {
    const savePlaylists = async () => {
      try {
        await AsyncStorage.setItem('playlists', JSON.stringify(playlists));
      } catch (error) {
        console.error('Failed to save playlists:', error);
      }
    };
    
    savePlaylists();
  }, [playlists]);

  const addPlaylist = (name) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      songs: [],
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  const deletePlaylist = (id) => {
    setPlaylists(playlists.filter(playlist => playlist.id !== id));
  };

  const updatePlaylist = (id, updatedData) => {
    setPlaylists(playlists.map(playlist => 
      playlist.id === id ? { ...playlist, ...updatedData } : playlist
    ));
  };

  const addSongToPlaylist = (playlistId, song) => {
    setPlaylists(playlists.map(playlist => {
      if (playlist.id === playlistId) {
        // Check if song already exists
        if (!playlist.songs.some(s => s.id === song.id)) {
          return { ...playlist, songs: [...playlist.songs, song] };
        }
      }
      return playlist;
    }));
  };

  const removeSongFromPlaylist = (playlistId, songId) => {
    setPlaylists(playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          songs: playlist.songs.filter(song => song.id !== songId)
        };
      }
      return playlist;
    }));
  };

  return (
    <PlaylistContext.Provider 
      value={{ 
        playlists, 
        addPlaylist, 
        deletePlaylist, 
        updatePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylists = () => useContext(PlaylistContext);