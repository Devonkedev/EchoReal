import { useState } from 'react';
import { Save, Music, Share, Calendar, List, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { SpotifyIntegration } from './SpotifyIntegration';
import { ShareDialog } from './ShareDialog';

const moodEmojis = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '😍', label: 'Excited' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😎', label: 'Confident' },
];

interface JournalEntryProps {
  onSave: (entry: { date: string; mood: string; content: string; songs: any[] }) => void;
  onViewEntries: () => void;
}

export function JournalEntry({ onSave, onViewEntries }: JournalEntryProps) {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [entryText, setEntryText] = useState('');
  const [attachedSongs, setAttachedSongs] = useState<any[]>([]);
  const [showSpotifyIntegration, setShowSpotifyIntegration] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleSave = async () => {
    if (!selectedMood || !entryText.trim()) {
      alert('Please select a mood and write your thoughts');
      return;
    }
    
    setIsSaving(true);
    
    // Simulate saving delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSave({
      date: today,
      mood: selectedMood,
      content: entryText,
      songs: attachedSongs
    });
    
    // Reset form
    setSelectedMood('');
    setEntryText('');
    setAttachedSongs([]);
    setIsSaving(false);
    
    alert('Journal entry saved successfully! 🎉');
  };

  const handleAttachSong = (song: any) => {
    setAttachedSongs([...attachedSongs, song]);
    setShowSpotifyIntegration(false);
  };

  const removeSong = (index: number) => {
    setAttachedSongs(attachedSongs.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Today's Journal</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {today}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onViewEntries}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            View Entries
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowShareDialog(true)}
            className="gap-2"
            disabled={!selectedMood || !entryText.trim()}
          >
            <Share className="w-4 h-4" />
            Share
          </Button>
          <Button 
            onClick={handleSave} 
            className="gap-2"
            disabled={isSaving || !selectedMood || !entryText.trim()}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Entry'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How are you feeling today?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
            {moodEmojis.map((mood, index) => (
              <button
                key={index}
                onClick={() => setSelectedMood(mood.emoji)}
                className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-all hover:bg-muted ${
                  selectedMood === mood.emoji 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <span className="text-2xl mb-1">{mood.emoji}</span>
                <span className="text-xs text-center">{mood.label}</span>
              </button>
            ))}
          </div>

          {selectedMood && (
            <div className="mb-4">
              <Badge variant="secondary" className="text-sm">
                Current mood: {selectedMood} {moodEmojis.find(m => m.emoji === selectedMood)?.label}
              </Badge>
            </div>
          )}

          <Textarea
            placeholder="Write about your day, your thoughts, your feelings... Let it all out."
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            className="min-h-[200px] mb-4 resize-none"
          />

          {/* Character Count */}
          <div className="flex justify-end mb-4">
            <span className="text-xs text-muted-foreground">
              {entryText.length} characters
            </span>
          </div>

          {/* Attached Songs */}
          {attachedSongs.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Healing Songs ({attachedSongs.length})</h4>
              <div className="space-y-2">
                {attachedSongs.map((song, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                      <Music className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{song.name}</p>
                      <p className="text-sm text-muted-foreground">{song.artist}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSong(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => setShowSpotifyIntegration(true)}
            className="gap-2"
          >
            <Music className="w-4 h-4" />
            Attach Healing Song
          </Button>
        </CardContent>
      </Card>

      {/* Spotify Integration Modal */}
      {showSpotifyIntegration && (
        <SpotifyIntegration
          onAttachSong={handleAttachSong}
          onClose={() => setShowSpotifyIntegration(false)}
        />
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <ShareDialog
          content={{
            mood: selectedMood,
            text: entryText,
            songs: attachedSongs
          }}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
}