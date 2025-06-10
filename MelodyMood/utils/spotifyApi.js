import { Buffer } from 'buffer';

const clientId = '790aa2a5b8514453afc433623add1fb8';
const clientSecret = 'd9d344d4f89947dfa826698d127ee783';

let cachedToken = null;
let tokenExpiry = null;

const getAccessToken = async () => {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const json = await res.json();
    if (json.access_token) {
      cachedToken = json.access_token;
      tokenExpiry = now + json.expires_in * 1000 - 60000; // expire 1 minute early for safety
      console.log('ACCESS TOKEN:', cachedToken);
      return cachedToken;
    } else {
      console.error('Failed to get access token:', json);
      return null;
    }
  } catch (err) {
    console.error('Error fetching Spotify token:', err);
    return null;
  }
};

export const fetchMoodPlaylists = async (mood) => {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(mood)}&type=playlist&limit=10`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    if (json.error) {
      console.error('Spotify API error:', json.error);
      return [];
    }

    console.log('Fetched Playlists:', json.playlists?.items);
    // Filter out null/undefined items and return only valid playlists
    const playlists = json.playlists?.items || [];
    return playlists.filter(playlist => playlist !== null && playlist !== undefined);
  } catch (err) {
    console.error('Playlist fetch error:', err);
    return [];
  }
};

export const fetchTracksFromPlaylist = async (playlistId) => {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error('Error fetching playlist tracks:', err);
    return [];
  }
};