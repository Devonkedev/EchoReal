import { useState, useEffect } from 'react';
import { authService } from './lib/auth.js';
import { DatabaseService } from './lib/database.js';
import { recommendationService } from './lib/recommendations.js';
import { Sidebar } from './components/Sidebar';
import { JournalEntry } from './components/JournalEntry';
import { Dashboard } from './components/Dashboard';
import { MusicRecommendations } from './components/MusicRecommendations';
import { Friends } from './components/Friends';
import { Profile } from './components/Profile';
import { JournalList } from './components/JournalList';
import { ChatInterface } from './components/ChatInterface';
import { GroupInterface } from './components/GroupInterface';
import { AuthComponent } from './components/AuthComponent';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

export interface JournalEntryType {
  id: string;
  userId: string;
  mood: string;
  content: string;
  songs: any[];
  createdAt: any;
  updatedAt: any;
  timestamp?: Date;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [journalEntries, setJournalEntries] = useState<JournalEntryType[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryType | null>(null);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Initialize auth and listen for auth state changes
    const unsubscribe = authService.init();
    
    authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      
      // Check if we're in demo mode
      if (user && user.uid?.startsWith('demo-')) {
        setIsDemo(true);
        toast.info('🎭 Running in demo mode - data will not persist', {
          duration: 5000,
          description: 'Set up Firebase, Spotify, and Genius APIs for full functionality'
        });
      }
      
      if (user) {
        // Load user's journal entries
        loadJournalEntries(user.uid);
      } else {
        setJournalEntries([]);
      }
    });

    return unsubscribe;
  }, []);

  const loadJournalEntries = async (userId: string) => {
    try {
      const entries = await DatabaseService.getUserJournalEntries(userId);
      setJournalEntries(entries.map(entry => ({
        ...entry,
        // Convert Firestore timestamp to JS Date for compatibility
        timestamp: entry.createdAt?.toDate?.() || new Date(entry.createdAt)
      })));
    } catch (error) {
      console.error('Error loading journal entries:', error);
      if (!isDemo) {
        toast.error('Failed to load journal entries');
      }
    }
  };

  const addJournalEntry = async (entry: Omit<JournalEntryType, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const entryId = await DatabaseService.createJournalEntry(user.uid, entry);
      
      // Add to local state
      const newEntry: JournalEntryType = {
        id: entryId,
        userId: user.uid,
        ...entry,
        createdAt: new Date(),
        updatedAt: new Date(),
        timestamp: new Date()
      };
      
      setJournalEntries([newEntry, ...journalEntries]);
      
      // Update recommendation service with mood
      recommendationService.updateMoodHistory(entry.mood);
      
      toast.success('Journal entry saved successfully! 🎉');
    } catch (error) {
      console.error('Error saving journal entry:', error);
      if (!isDemo) {
        toast.error('Failed to save journal entry');
      }
    }
  };

  const renderActiveView = () => {
    if (activeChat) {
      return (
        <ChatInterface 
          friendId={activeChat} 
          onClose={() => setActiveChat(null)} 
        />
      );
    }

    if (activeGroup) {
      return (
        <GroupInterface 
          groupId={activeGroup} 
          onClose={() => setActiveGroup(null)} 
        />
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard journalEntries={journalEntries} />;
      case 'journal':
        return selectedEntry ? (
          <JournalList 
            entries={journalEntries}
            selectedEntry={selectedEntry}
            onSelectEntry={setSelectedEntry}
            onBack={() => setSelectedEntry(null)}
          />
        ) : (
          <JournalEntry 
            onSave={addJournalEntry}
            onViewEntries={() => setActiveView('journal-list')}
          />
        );
      case 'journal-list':
        return (
          <JournalList 
            entries={journalEntries}
            selectedEntry={selectedEntry}
            onSelectEntry={setSelectedEntry}
            onBack={() => setActiveView('journal')}
            onNewEntry={() => setActiveView('journal')}
          />
        );
      case 'music':
        return <MusicRecommendations journalEntries={journalEntries} />;
      case 'friends':
        return (
          <Friends 
            onStartChat={setActiveChat}
            onJoinGroup={setActiveGroup}
          />
        );
      case 'profile':
        return <Profile user={user} />;
      default:
        return <Dashboard journalEntries={journalEntries} />;
    }
  };

  if (loading) {
    return (
      <>
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading MoodSync...</p>
          </div>
        </div>
        <Toaster />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <AuthComponent />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <div className="h-screen bg-background flex">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          user={user}
        />
        <main className="flex-1 overflow-hidden">
          {isDemo && (
            <div className="bg-amber-50 border-b border-amber-200 p-2 text-center">
              <p className="text-sm text-amber-800">
                🎭 Demo Mode - <a href="/SETUP_SECURE.md" className="underline hover:no-underline">Set up APIs</a> for full functionality
              </p>
            </div>
          )}
          {renderActiveView()}
        </main>
      </div>
      <Toaster />
    </>
  );
}