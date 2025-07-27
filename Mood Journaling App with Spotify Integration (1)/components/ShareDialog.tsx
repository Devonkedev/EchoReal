import { useState } from 'react';
import { X, Search, Send, Users, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ShareDialogProps {
  content: {
    mood: string;
    text: string;
    songs: any[];
  };
  onClose: () => void;
}

export function ShareDialog({ content, onClose }: ShareDialogProps) {
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [shareMessage, setShareMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const friends = [
    { id: '1', name: 'Sarah Johnson', avatar: '/placeholder-1.jpg', status: 'online' },
    { id: '2', name: 'Mike Chen', avatar: '/placeholder-2.jpg', status: 'offline' },
    { id: '3', name: 'Emma Davis', avatar: '/placeholder-3.jpg', status: 'online' },
    { id: '4', name: 'Alex Rivera', avatar: '/placeholder-4.jpg', status: 'online' },
    { id: '5', name: 'Jordan Kim', avatar: '/placeholder-5.jpg', status: 'offline' },
  ];

  const groups = [
    { id: '1', name: 'Mindfulness Circle', members: 8, color: 'bg-blue-100 text-blue-800' },
    { id: '2', name: 'Creative Healing', members: 12, color: 'bg-purple-100 text-purple-800' },
    { id: '3', name: 'Support Network', members: 6, color: 'bg-green-100 text-green-800' },
  ];

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleShare = () => {
    if (selectedFriends.length === 0 && selectedGroups.length === 0) {
      alert('Please select at least one friend or group to share with');
      return;
    }

    // Mock sharing functionality
    alert(`Shared with ${selectedFriends.length} friends and ${selectedGroups.length} groups!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Share Journal Entry
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 space-y-6 overflow-hidden">
          {/* Preview */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{content.mood}</span>
              <span className="font-medium">Your mood today</span>
            </div>
            <p className="text-sm line-clamp-3 mb-3">{content.text}</p>
            {content.songs.length > 0 && (
              <div className="flex gap-2">
                {content.songs.slice(0, 2).map((song, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {song.name}
                  </Badge>
                ))}
                {content.songs.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{content.songs.length - 2} more songs
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add a message (optional)</label>
            <Textarea
              placeholder="Share what this means to you or why you're sharing..."
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              className="h-20"
            />
          </div>

          <Tabs defaultValue="friends" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="friends">
                Friends ({selectedFriends.length} selected)
              </TabsTrigger>
              <TabsTrigger value="groups">
                Groups ({selectedGroups.length} selected)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="flex-1 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleFriend(friend.id)}
                  >
                    <Checkbox
                      checked={selectedFriends.includes(friend.id)}
                      onChange={() => toggleFriend(friend.id)}
                    />
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback>
                          {friend.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{friend.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{friend.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="groups" className="flex-1 space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleGroup(group.id)}
                  >
                    <Checkbox
                      checked={selectedGroups.includes(group.id)}
                      onChange={() => toggleGroup(group.id)}
                    />
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{group.name}</p>
                      <Badge className={`${group.color} text-xs`}>
                        {group.members} members
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Privacy Notice */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex gap-2">
              <Lock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Privacy Notice</p>
                <p className="text-xs text-blue-600">
                  Your journal entry will only be visible to selected friends and groups. 
                  You can remove shared entries at any time.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              className="flex-1 gap-2" 
              onClick={handleShare}
              disabled={selectedFriends.length === 0 && selectedGroups.length === 0}
            >
              <Send className="w-4 h-4" />
              Share Entry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}