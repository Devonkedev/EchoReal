import { useState } from 'react';
import { Search, UserPlus, Users, Share, MessageCircle, Music, Heart, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface FriendsProps {
  onStartChat: (friendId: string) => void;
  onJoinGroup: (groupId: string) => void;
}

export function Friends({ onStartChat, onJoinGroup }: FriendsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const friends = [
    {
      id: 'friend1',
      name: 'Sarah Johnson',
      avatar: '/placeholder-avatar-1.jpg',
      status: 'online',
      lastActive: 'now',
      sharedEntries: 3,
      sharedSongs: 7,
      supportLevel: 'close'
    },
    {
      id: 'friend2',
      name: 'Mike Chen',
      avatar: '/placeholder-avatar-2.jpg',
      status: 'offline',
      lastActive: '2h ago',
      sharedEntries: 1,
      sharedSongs: 12,
      supportLevel: 'friend'
    },
    {
      id: 'friend3',
      name: 'Emma Davis',
      avatar: '/placeholder-avatar-3.jpg',
      status: 'online',
      lastActive: 'now',
      sharedEntries: 5,
      sharedSongs: 3,
      supportLevel: 'close'
    },
  ];

  const peerGroups = [
    {
      id: 'group1',
      name: 'Mindfulness Circle',
      members: 8,
      description: 'Daily meditation and mindfulness practices',
      recentActivity: '2 new songs shared',
      color: 'bg-blue-100 text-blue-800',
      isJoined: true
    },
    {
      id: 'group2',
      name: 'Creative Healing',
      members: 12,
      description: 'Art, music, and creative expression for healing',
      recentActivity: '5 new journal shares',
      color: 'bg-purple-100 text-purple-800',
      isJoined: true
    },
    {
      id: 'group3',
      name: 'Support Network',
      members: 6,
      description: 'Trusted friends for deeper emotional support',
      recentActivity: '1 new member',
      color: 'bg-green-100 text-green-800',
      isJoined: false
    },
  ];

  const sharedContent = [
    {
      id: 1,
      type: 'entry',
      author: 'Sarah Johnson',
      content: 'Had a breakthrough in therapy today. Feeling hopeful for the first time in weeks...',
      mood: '😌',
      timestamp: '2h ago',
      supportCount: 3
    },
    {
      id: 2,
      type: 'song',
      author: 'Mike Chen',
      content: 'This song helped me through a tough moment',
      songName: 'Breathe Easy',
      artist: 'Relaxation Sounds',
      timestamp: '4h ago',
      supportCount: 7
    },
  ];

  const getStatusColor = (status: string) => {
    return status === 'online' ? 'bg-green-500' : 'bg-gray-400';
  };

  const getSupportColor = (level: string) => {
    switch (level) {
      case 'close': return 'bg-red-100 text-red-800';
      case 'friend': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleJoinGroup = (groupId: string) => {
    // Update group membership
    const group = peerGroups.find(g => g.id === groupId);
    if (group && !group.isJoined) {
      group.isJoined = true;
      alert(`Joined ${group.name}!`);
    }
    onJoinGroup(groupId);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-medium">Friends & Support</h1>
          <p className="text-muted-foreground">Connect with your support network</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Friend
        </Button>
      </div>

      <Tabs defaultValue="friends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="groups">Peer Groups</TabsTrigger>
          <TabsTrigger value="shared">Shared Content</TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Friends List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map((friend) => (
              <Card key={friend.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback>{friend.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(friend.status)} rounded-full border-2 border-white`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium truncate">{friend.name}</h3>
                        <Badge className={getSupportColor(friend.supportLevel)} variant="secondary">
                          {friend.supportLevel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Active {friend.lastActive}</p>
                      
                      <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {friend.sharedEntries} entries
                        </span>
                        <span className="flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          {friend.sharedSongs} songs
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => onStartChat(friend.id)}
                        >
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Chat
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Share className="w-3 h-3 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="grid gap-4">
            {peerGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        {group.name}
                        {group.isJoined && (
                          <Badge variant="secondary" className="text-xs">Joined</Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                    </div>
                    <Badge className={group.color}>
                      {group.members} members
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">{group.recentActivity}</p>
                    <div className="flex gap-2">
                      {group.isJoined ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onJoinGroup(group.id)}
                          >
                            View
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => onJoinGroup(group.id)}
                          >
                            Join Chat
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => handleJoinGroup(group.id)}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Join Group
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-4">
          <div className="space-y-4">
            {sharedContent.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback>{item.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{item.author}</h4>
                        <Badge variant="outline">
                          {item.type === 'entry' ? 'Journal Entry' : 'Song'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                      </div>

                      {item.type === 'entry' ? (
                        <div className="bg-muted/30 p-3 rounded-lg mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{item.mood}</span>
                            <p className="text-sm text-muted-foreground">Mood</p>
                          </div>
                          <p className="text-sm">{item.content}</p>
                        </div>
                      ) : (
                        <div className="bg-green-50 p-3 rounded-lg mb-3 border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Music className="w-4 h-4 text-green-600" />
                            <p className="font-medium text-sm">{item.songName}</p>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{item.artist}</p>
                          <p className="text-sm">{item.content}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <Button size="sm" variant="ghost" className="gap-2">
                          <Heart className="w-4 h-4" />
                          Support ({item.supportCount})
                        </Button>
                        <Button size="sm" variant="ghost" className="gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Comment
                        </Button>
                        <Button size="sm" variant="ghost" className="gap-2">
                          <Share className="w-4 h-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}