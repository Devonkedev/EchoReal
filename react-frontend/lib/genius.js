// Check if we're in a browser environment and import.meta.env is available
const env = typeof import !== 'undefined' && import.meta && import.meta.env ? import.meta.env : {};

export class GeniusService {
  constructor() {
    this.accessToken = env.VITE_GENIUS_ACCESS_TOKEN || 'demo-token';
    this.baseUrl = 'https://api.genius.com';
    this.isDemoMode = this.accessToken === 'demo-token';
    
    if (this.isDemoMode) {
      console.warn('🎤 Genius API is running in demo mode');
      console.warn('📋 To use real Genius API:');
      console.warn('1. Get Genius API token from https://genius.com/api-clients');
      console.warn('2. Add VITE_GENIUS_ACCESS_TOKEN to your .env file');
      console.warn('3. Restart your development server');
    }
  }

  async getLyrics(artist, title) {
    try {
      // First try to get lyrics from lyrics.ovh API (free and doesn't require auth)
      const lyricsFromAPI = await this.getLyricsFromAPI(artist, title);
      if (lyricsFromAPI) {
        return {
          title: title,
          artist: artist,
          lyrics: lyricsFromAPI,
          source: 'lyrics.ovh'
        };
      }

      // Fallback to mock lyrics
      return {
        title: title,
        artist: artist,
        lyrics: await this.getMockLyrics(title, artist),
        source: 'demo'
      };
    } catch (error) {
      console.error('Error getting lyrics:', error);
      return {
        title: title,
        artist: artist,
        lyrics: await this.getMockLyrics(title, artist),
        source: 'demo'
      };
    }
  }

  async getMockLyrics(title, artist) {
    // Return appropriate mock lyrics based on song characteristics
    const lowerTitle = title.toLowerCase();
    const lowerArtist = artist.toLowerCase();
    
    if (lowerTitle.includes('happy') || lowerTitle.includes('joy') || lowerTitle.includes('smile') || lowerTitle.includes('upbeat')) {
      return `Verse 1:
Sunshine breaking through the clouds today
Everything's gonna be okay
Dancing through the pain away
Living for a brighter day

Chorus:
We're gonna rise above it all
Never gonna let us fall
Together we can stand so tall
Happiness will come to call

Verse 2:
Every step we take is progress made
Through the light and through the shade
Love will guide us on our way
To a bright and better day`;
    }
    
    if (lowerTitle.includes('sad') || lowerTitle.includes('cry') || lowerTitle.includes('pain') || lowerTitle.includes('melancholy')) {
      return `Verse 1:
Tears are falling like the rain
Can't escape this endless pain
Memories of what we had
Now I'm feeling oh so sad

Chorus:
But I know that healing comes
With the rising of the sun
Though my heart feels so undone
Better days will surely come

Verse 2:
In the darkness I will find
Peace within my troubled mind
Every scar will make me strong
This is where I now belong`;
    }
    
    if (lowerTitle.includes('calm') || lowerTitle.includes('peace') || lowerTitle.includes('meditation') || lowerTitle.includes('healing')) {
      return `Verse 1:
Breathing in the morning air
Peace is found when we don't care
About the troubles of the day
Let them gently drift away

Chorus:
In this moment we are free
From anxiety's decree
Peaceful mind and soul at ease
That's the way it's meant to be

Verse 2:
Still waters run so deep
In this quiet we can keep
All the wisdom that we need
For our hearts and souls to feed`;
    }
    
    // Default peaceful healing lyrics
    return `Verse 1:
Every breath brings healing light
Through the darkness of the night
Step by step we'll find our way
To a peaceful, brighter day

Chorus:
Healing comes in its own time
With each heartbeat and each rhyme
We are stronger than we know
In this journey we will grow

Verse 2:
Music soothes the weary soul
Makes the broken spirit whole
In this moment we can see
We are exactly where we need to be`;
  }

  // Alternative: Use a lyrics API service like lyrics.ovh (free, no auth required)
  async getLyricsFromAPI(artist, title) {
    try {
      const response = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.lyrics;
    } catch (error) {
      console.error('Error getting lyrics from API:', error);
      return null;
    }
  }
}

// Create singleton instance
export const geniusService = new GeniusService();