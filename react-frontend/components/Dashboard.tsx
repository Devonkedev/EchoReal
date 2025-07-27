import { Calendar, Flame, Music, Heart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { JournalEntryType } from '../App';

interface DashboardProps {
  journalEntries: JournalEntryType[];
}

export function Dashboard({ journalEntries }: DashboardProps) {
  const currentStreak = 7;
  const longestStreak = 23;
  const totalEntries = journalEntries.length;
  
  // Calculate mood statistics from actual entries
  const moodCounts = journalEntries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const moodLabels: Record<string, string> = {
    '😊': 'Happy',
    '😌': 'Calm',
    '😔': 'Sad',
    '😤': 'Frustrated',
    '😴': 'Tired',
    '😍': 'Excited',
    '😰': 'Anxious',
    '😎': 'Confident'
  };

  const moodColors: Record<string, string> = {
    '😊': 'bg-green-100',
    '😌': 'bg-blue-100',
    '😔': 'bg-gray-100',
    '😤': 'bg-red-100',
    '😴': 'bg-purple-100',
    '😍': 'bg-yellow-100',
    '😰': 'bg-orange-100',
    '😎': 'bg-indigo-100'
  };

  const moodData = Object.entries(moodCounts).map(([emoji, count]) => ({
    emoji,
    label: moodLabels[emoji] || 'Unknown',
    count,
    color: moodColors[emoji] || 'bg-gray-100'
  })).sort((a, b) => b.count - a.count);

  const totalSongs = journalEntries.reduce((total, entry) => total + entry.songs.length, 0);

  const formatDate = (timestamp: Date) => {
    const now = new Date();
    const entryDate = new Date(timestamp);
    const diffInDays = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    
    return entryDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const recentEntries = journalEntries.slice(0, 3).map(entry => ({
    date: formatDate(entry.timestamp),
    mood: entry.mood,
    preview: entry.content.substring(0, 60) + (entry.content.length > 60 ? '...' : ''),
    songCount: entry.songs.length
  }));

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium mb-2">Welcome back, John!</h1>
        <p className="text-muted-foreground">How are you feeling today?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} days</div>
            <p className="text-xs text-muted-foreground">Keep it up! 🔥</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntries}</div>
            <p className="text-xs text-muted-foreground">+{Math.min(3, totalEntries)} this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Songs Saved</CardTitle>
            <Music className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSongs}</div>
            <p className="text-xs text-muted-foreground">Healing playlist growing</p>
          </CardContent>
        </Card>
      </div>

      {/* Mood Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Mood Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {moodData.length > 0 ? (
              moodData.map((mood, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${mood.color} flex items-center justify-center`}>
                    <span className="text-sm">{mood.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{mood.label}</span>
                      <span className="text-xs text-muted-foreground">{mood.count} times</span>
                    </div>
                    <Progress value={(mood.count / totalEntries) * 100} className="h-2" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start journaling to see your mood insights!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Recent Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentEntries.length > 0 ? (
              recentEntries.map((entry, index) => (
                <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border">
                    <span className="text-sm">{entry.mood}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium">{entry.date}</p>
                      <Badge variant="secondary" className="text-xs">
                        {entry.songCount} songs
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{entry.preview}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No entries yet. Start journaling to see them here!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Positive Reinforcement */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Flame className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-800">
                {totalEntries === 0 
                  ? "Welcome to your journey!" 
                  : totalEntries === 1 
                    ? "Great start!" 
                    : "Amazing progress!"
                }
              </h3>
              <p className="text-sm text-green-600">
                {totalEntries === 0 
                  ? "Start by writing your first journal entry and begin your healing journey."
                  : `You're on a ${currentStreak}-day streak with ${totalEntries} entries. Your longest was ${longestStreak} days. Keep journaling to beat your record!`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}