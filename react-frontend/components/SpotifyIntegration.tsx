import { useState, useEffect } from 'react';
import { Search, Music, X, Plus, Play, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { spotifyService } from '../lib/spotify.js';
import { toast } from 'sonner@2.0.3';

interface SpotifyIntegrationProps {
  onAttachSong: (song: any) => void;
  onClose: () => void;
}

export function SpotifyIntegration({ onAttachSong, onClose }: SpotifyIntegrationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    connectSpotify();
  }, []);

  const connectSpotify = async () => {
    try {
      await spotifyService.getAccessToken();
      setIsConnected(true);
      // Load some default healing songs
      handleSearch('healing peaceful calm');
    } catch (error) {
      console.error('Error connecting to Spotify:', error);
      toast.error('Failed to connect to Spotify. Using demo mode.');
      setIsConnected(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await spotifyService.searchTracks(query, 10);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching songs:', error);
      toast.error('Failed to search songs');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const quickSearchOptions = [
    'healing music',
    'peaceful songs',
    'calming melodies',
    'uplifting music',
    'meditation songs',
    'emotional healing'
  ];

  if (!isConnected) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5 text-green-500" />
              Connecting to Spotify
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">
                Connecting to Spotify to search for healing songs...
              </p>
            </div>
            <Button onClick={connectSpotify} className="w-full bg-green-500 hover:bg-green-600">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-green-500" />
            Search Healing Songs
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 space-y-4 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search for songs that help you heal..."
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Search Options */}
          <div className="flex flex-wrap gap-2">
            {quickSearchOptions.map((option) => (
              <Badge
                key={option}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => {
                  setSearchQuery(option);
                  handleSearch(option);
                }}
              >
                {option}
              </Badge>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Searching Spotify...</p>
            </div>
          )}

          {/* Search Results */}
          <div className="space-y-2 overflow-y-auto flex-1">
            {searchResults.map((song) => (
              <div key={song.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                {song.image && (
                  <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={song.image} 
                      alt={`${song.name} album art`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{song.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {song.artist} • {song.album}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{song.duration}</span>
                    {song.explicit && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        E
                      </Badge>
                    )}
                    <div className="flex items-center">
                      <span className="text-xs text-muted-foreground">Popularity: </span>
                      <div className="w-12 h-1 bg-muted rounded-full ml-1">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${song.popularity}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {song.preview_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(song.preview_url, '_blank')}
                      className="gap-1"
                    >
                      <Play className="w-3 h-3" />
                      Preview
                    </Button>
                  )}
                  
                  {song.external_urls?.spotify && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(song.external_urls.spotify, '_blank')}
                      className="gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Spotify
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    onClick={() => onAttachSong(song)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Attach
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {!isLoading && searchResults.length === 0 && searchQuery && (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No songs found for "{searchQuery}"</p>
              <p className="text-sm">Try a different search term or check the quick options above.</p>
            </div>
          )}

          {/* Default State */}
          {!isLoading && searchResults.length === 0 && !searchQuery && (
            <div className="text-center py-8 text-muted-foreground">
              <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Search for songs or try one of the quick options above</p>
              <p className="text-sm">Find music that helps with your healing journey</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}