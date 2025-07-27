import { useState } from 'react';
import { ArrowLeft, Plus, Search, Calendar, Music, Heart, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { JournalEntryType } from '../App';

interface JournalListProps {
  entries: JournalEntryType[];
  selectedEntry: JournalEntryType | null;
  onSelectEntry: (entry: JournalEntryType) => void;
  onBack: () => void;
  onNewEntry?: () => void;
}

export function JournalList({ entries, selectedEntry, onSelectEntry, onBack, onNewEntry }: JournalListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState<string>('');

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = !filterMood || entry.mood === filterMood;
    return matchesSearch && matchesMood;
  });

  const uniqueMoods = Array.from(new Set(entries.map(entry => entry.mood)));

  const formatDate = (timestamp: Date) => {
    const now = new Date();
    const entryDate = new Date(timestamp);
    const diffInDays = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return entryDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: entryDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  if (selectedEntry) {
    return (
      <div className="p-6 space-y-6 overflow-y-auto h-full">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onSelectEntry(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </Button>
          <div>
            <h1 className="text-2xl font-medium">Journal Entry</h1>
            <p className="text-muted-foreground">{selectedEntry.date}</p>
          </div>
        </div>

        {/* Entry Detail */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">{selectedEntry.mood}</span>
                <span>Mood Reflection</span>
              </CardTitle>
              <Badge variant="outline">
                {formatDate(selectedEntry.timestamp)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {selectedEntry.content}
              </p>
            </div>

            {selectedEntry.songs.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Healing Songs ({selectedEntry.songs.length})
                  </h4>
                  <div className="grid gap-3">
                    {selectedEntry.songs.map((song, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                          <Music className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{song.name}</p>
                          <p className="text-sm text-muted-foreground">{song.artist}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />
            
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Heart className="w-4 h-4" />
                Add to Favorites
              </Button>
              <Button variant="outline" className="gap-2">
                <Music className="w-4 h-4" />
                Create Playlist
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-medium">Your Journal Entries</h1>
            <p className="text-muted-foreground">{entries.length} total entries</p>
          </div>
        </div>
        {onNewEntry && (
          <Button onClick={onNewEntry} className="gap-2">
            <Plus className="w-4 h-4" />
            New Entry
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search your entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filterMood ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterMood('')}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            All Moods
          </Button>
          {uniqueMoods.slice(0, 4).map((mood) => (
            <Button
              key={mood}
              variant={filterMood === mood ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMood(filterMood === mood ? '' : mood)}
            >
              {mood}
            </Button>
          ))}
        </div>
      </div>

      {/* Entries Grid */}
      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-medium mb-2">No entries found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || filterMood 
                ? "Try adjusting your search or filter criteria."
                : "Start journaling to see your entries here."
              }
            </p>
            {onNewEntry && (
              <Button onClick={onNewEntry} className="gap-2">
                <Plus className="w-4 h-4" />
                Write Your First Entry
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEntries.map((entry) => (
            <Card 
              key={entry.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectEntry(entry)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">{entry.mood}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{entry.date}</h3>
                      <div className="flex items-center gap-2">
                        {entry.songs.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <Music className="w-3 h-3 mr-1" />
                            {entry.songs.length} songs
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {entry.content}
                    </p>
                    
                    {entry.songs.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {entry.songs.slice(0, 2).map((song, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {song.name}
                          </Badge>
                        ))}
                        {entry.songs.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{entry.songs.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}