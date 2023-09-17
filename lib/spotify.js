const fetch = require('node-fetch');
const querystring = require('querystring');
require('dotenv').config();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

const getAccessToken = async () => {
  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await response.json();
    return tokenData.access_token;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const USER_ENDPOINT = 'https://api.spotify.com/v1/me';
const getUser = async () => {
  try {
    const access_token = await getAccessToken();
    const response = await fetch(USER_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';
const getNowPlaying = async () => {
  try {
    const access_token = await getAccessToken();
    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch currently playing data');
    }

    const nowPlaying = await response.json();
    return nowPlaying;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const LAST_PLAYED_ENDPOINT = `https://api.spotify.com/v1/me/player/recently-played`
const getLastPlayed = async () => {
  try {
    const access_token = await getAccessToken();
    const response = await fetch(LAST_PLAYED_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch last played data');
    }

    const lastPlayed = await response.json();
    return lastPlayed;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/top/tracks`;
const getTopTracks = async () => {
  try {
    const access_token = await getAccessToken();
    const response = await fetch(TOP_TRACKS_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch top tracks data');
    }

    const topTracks = await response.json();
    return topTracks;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = { getUser, getNowPlaying, getLastPlayed, getTopTracks };
