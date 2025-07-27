// Check if we're in a browser environment and import.meta.env is available
const env = typeof import !== 'undefined' && import.meta && import.meta.env ? import.meta.env : {};

export class SpotifyService {
  constructor() {
    this.clientId = env.VITE_SPOTIFY_CLIENT_ID || 'demo-client-id';
    this.clientSecret = env.VITE_SPOTIFY_CLIENT_SECRET || 'demo-client-secret';
    this.accessToken = null;
    this.tokenExpiry = null;
    this.isDemoMode = this.clientId === 'demo-client-id';
    
    if (this.isDemoMode) {
      console.warn('🎵 Spotify is running in demo mode');
      console.warn('📋 To use real Spotify API:');
      console.warn('1. Get Spotify API credentials from https://developer.spotify.com');
      console.warn('2. Add VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET to your .env file');
      console.warn('3. Restart your development server');
    }
  }

  async getAccessToken() {
    if (this.isDemoMode) {
      return 'demo-token';
    }

    if (this.accessToken && this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`Failed to get Spotify access token: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      throw error;
    }
  }

  async searchTracks(query, limit = 20) {
    try {
      if (this.isDemoMode) {
        return this.getMockTracks(query, limit);
      }

      const token = await this.getAccessToken();
      
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search Spotify tracks: ${response.status}`);
      }

      const data = await response.json();
      
      return data.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        album: track.album?.name || 'Unknown Album',
        duration: this.formatDuration(track.duration_ms),
        preview_url: track.preview_url,
        external_urls: track.external_urls,
        image: track.album?.images[0]?.url,
        popularity: track.popularity,
        explicit: track.explicit
      }));
    } catch (error) {
      console.error('Error searching Spotify tracks:', error);
      // Return mock data as fallback
      return this.getMockTracks(query, limit);
    }
  }

  getMockTracks(query, limit) {
    const mockTracks = [
      {
        id: 'demo1',
        name: 'Peaceful Mind',
        artist: 'Healing Sounds',
        album: 'Calm Collection',
        duration: '3:45',
        preview_url: null,
        external_urls: { spotify: '#' },
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        popularity: 75,
        explicit: false
      },
      {
        id: 'demo2',
        name: 'Inner Strength',
        artist: 'Mindful Music',
        album: 'Emotional Healing',
        duration: '4:20',
        preview_url: null,
        external_urls: { spotify: '#' },
        image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
        popularity: 82,
        explicit: false
      },
      {
        id: 'demo3',
        name: 'Healing Journey',
        artist: 'Calm Collective',
        album: 'Therapeutic Tunes',
        duration: '5:15',
        preview_url: null,
        external_urls: { spotify: '#' },
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        popularity: 68,
        explicit: false
      },
      {
        id: 'demo4',
        name: 'Emotional Release',
        artist: 'Therapy Sessions',
        album: 'Processing Pain',
        duration: '3:30',
        preview_url: null,
        external_urls: { spotify: '#' },
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop',
        popularity: 71,
        explicit: false
      },
      {
        id: 'demo5',
        name: 'Hope Rising',
        artist: 'Uplifting Vibes',
        album: 'Tomorrow\'s Light',
        duration: '4:05',
        preview_url: null,
        external_urls: { spotify: '#' },
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        popularity: 79,
        explicit: false
      }
    ];

    // Filter based on query and return requested limit
    const filtered = mockTracks.filter(track => 
      track.name.toLowerCase().includes(query.toLowerCase()) ||
      track.artist.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes('calm') ||
      query.toLowerCase().includes('peace') ||
      query.toLowerCase().includes('heal')
    );

    return filtered.slice(0, limit);
  }

  async searchByMood(mood, limit = 20) {
    const moodQueries = {
      '😊': 'happy upbeat positive',
      '😌': 'calm peaceful relaxing meditation',
      '😔': 'sad melancholy emotional healing',
      '😤': 'angry frustrated rock metal',
      '😴': 'sleepy lullaby ambient peaceful',
      '😍': 'love romantic upbeat energetic',
      '😰': 'anxiety calming soothing peaceful',
      '😎': 'confident cool upbeat energetic'
    };

    const query = moodQueries[mood] || 'healing peaceful';
    return this.searchTracks(query, limit);
  }

  formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  }
}

// Create singleton instance
export const spotifyService = new SpotifyService();