import { useState, useEffect } from 'react';
import { Heart, X, SkipForward, Shuffle, TrendingUp, Sliders, Music, ExternalLink, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { recommendationService } from '../lib/recommendations.js';
import { JournalEntryType } from '../App';
import { toast } from 'sonner';
import react from 'react';

interface MusicRecommendationsProps {
  journalEntries: JournalEntryType[];
}

export function MusicRecommendations({ journalEntries }: MusicRecommendationsProps) {
  const [positiveRatio, setPositiveRatio] = useState([70]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [acceptedSongs, setAcceptedSongs] = useState<any[]>([]);
  const [rejectedSongs, setRejectedSongs] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string>('😌');

  const moods = ['😊', '😌', '😔', '😤', '😴', '😍', '😰', '😎'];

  useEffect(() => {
    loadRecommendations();
  }, [selectedMood]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      // Get the latest journal entry for context
      const latestEntry = journalEntries[0];
      const journalContent = latestEntry?.content || '';

      const newRecommendations = await recommendationService.getRecommendationsForMood(
        selectedMood,
        journalContent,
        10
      );
      
      setRecommendations(newRecommendations);
      setCurrentSongIndex(0);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error('Failed to load music recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const currentSong = recommendations[currentSongIndex];

  const handleAccept = () => {
    if (currentSong) {
      setAcceptedSongs([...acceptedSongs, currentSong]);
      recommendationService.acceptSong(currentSong.id);
      toast.success(`Added "${currentSong.name}" to your healing playlist! 🎵`);
      nextSong();
    }
  };

  const handleReject = () => {
    if (currentSong) {
      setRejectedSongs([...rejectedSongs, currentSong]);
      recommendationService.rejectSong(currentSong.id);
      nextSong();
    }
  };

  const nextSong = () => {
    if (currentSongIndex < recommendations.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
    } else {
      // Load more recommendations
      loadRecommendations();
    }
  };

  const getMoodColor = (mood: string) => {
    const colors = {
      '😊': 'bg-yellow-100 text-yellow-800',
      '😌': 'bg-blue-100 text-blue-800',
      '😔': 'bg-gray-100 text-gray-800',
      '😤': 'bg-red-100 text-red-800',
      '😴': 'bg-purple-100 text-purple-800',
      '😍': 'bg-pink-100 text-pink-800',
      '😰': 'bg-orange-100 text-orange-800',
      '😎': 'bg-indigo-100 text-indigo-800'
    };
    return colors[mood as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const openSpotify = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-2xl font-medium mb-2">Music Healing</h1>
        <p className="text-muted-foreground">Discover songs that match your emotional journey</p>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({acceptedSongs.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-6">
          {/* Mood Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Your Current Mood</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center p-2 transition-all hover:bg-muted ${
                      selectedMood === mood 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <span className="text-2xl">{mood}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Healing Balance Slider */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                Healing Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>More Processing</span>
                  <span>More Uplifting</span>
                </div>
                <Slider
                  value={positiveRatio}
                  onValueChange={setPositiveRatio}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {positiveRatio[0]}% uplifting songs, {100 - positiveRatio[0]}% processing songs
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Recommendation */}
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Finding the perfect songs for you...</p>
              </CardContent>
            </Card>
          ) : currentSong ? (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{currentSong.name}</CardTitle>
                    <p className="text-muted-foreground">{currentSong.artist} • {currentSong.album}</p>
                    <p className="text-sm text-muted-foreground mt-1">Duration: {currentSong.duration}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge className={getMoodColor(selectedMood)}>
                      {selectedMood} mood match
                    </Badge>
                    {currentSong.matchScore && (
                      <Badge variant="secondary">
                        {Math.round(currentSong.matchScore * 100)}% match
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentSong.image && (
                  <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden mx-auto">
                    <img 
                      src={currentSong.image} 
                      alt={`${currentSong.name} album art`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm">
                    <strong>Why this song?</strong> {currentSong.reason}
                  </p>
                </div>

                {currentSong.lyricsAnalysis && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Lyrical Analysis</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Overall Sentiment: </span>
                        <Badge variant="outline" className="ml-1">
                          {currentSong.lyricsAnalysis.overall}
                        </Badge>
                      </div>
                      {currentSong.lyricsAnalysis.dominantEmotion && (
                        <div>
                          <span className="font-medium">Dominant Emotion: </span>
                          <Badge variant="outline" className="ml-1">
                            {currentSong.lyricsAnalysis.dominantEmotion}
                          </Badge>
                        </div>
                      )}
                    </div>
                    {currentSong.lyricsAnalysis.recommendation && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {currentSong.lyricsAnalysis.recommendation.message}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-4 justify-center pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleReject}
                    className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <X className="w-5 h-5" />
                    Not for me
                  </Button>
                  
                  {currentSong.preview_url && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2"
                      onClick={() => window.open(currentSong.preview_url, '_blank')}
                    >
                      <Play className="w-5 h-5" />
                      Preview
                    </Button>
                  )}
                  
                  <Button
                    size="lg"
                    onClick={handleAccept}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Heart className="w-5 h-5" />
                    Add to playlist
                  </Button>
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="ghost" size="sm" onClick={nextSong} className="gap-2">
                    <SkipForward className="w-4 h-4" />
                    Skip for now
                  </Button>
                  
                  {currentSong.external_urls?.spotify && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => openSpotify(currentSong.external_urls.spotify)}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in Spotify
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">No recommendations available</p>
                <Button onClick={loadRecommendations}>
                  Load Recommendations
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Progress Indicator */}
          {recommendations.length > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              Song {currentSongIndex + 1} of {recommendations.length}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{acceptedSongs.length}</div>
                <p className="text-sm text-muted-foreground">Songs Accepted</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{rejectedSongs.length}</div>
                <p className="text-sm text-muted-foreground">Songs Rejected</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((acceptedSongs.length / Math.max(acceptedSongs.length + rejectedSongs.length, 1) * 100))}%
                </div>
                <p className="text-sm text-muted-foreground">Match Rate</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Your Healing Playlist</h3>
            <Button variant="outline" className="gap-2">
              <Shuffle className="w-4 h-4" />
              Shuffle Play
            </Button>
          </div>
          
          {acceptedSongs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No songs in your playlist yet.</p>
                <p className="text-sm text-muted-foreground">Start accepting recommendations to build your healing playlist.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {acceptedSongs.map((song, index) => (
                <Card key={song.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {song.image && (
                        <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                          <img 
                            src={song.image} 
                            alt={`${song.name} album art`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{song.name}</p>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {song.preview_url && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(song.preview_url, '_blank')}
                        >
                          Preview
                        </Button>
                      )}
                      {song.external_urls?.spotify && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openSpotify(song.external_urls.spotify)}
                        >
                          Spotify
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommendation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={loadRecommendations} className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Refresh Recommendations
              </Button>
              
              <div>
                <label className="text-sm font-medium">Preferred Genres</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Pop', 'Rock', 'Classical', 'Ambient', 'Folk', 'R&B', 'Electronic', 'Jazz'].map((genre) => (
                    <Badge key={genre} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Language Preferences</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['English', 'Instrumental', 'Spanish', 'French', 'Any Language'].map((lang) => (
                    <Badge key={lang} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}