import { useState } from 'react';
import { ArrowLeft, Send, Users, Settings, UserPlus, Music, Heart, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface GroupInterfaceProps {
  groupId: string;
  onClose: () => void;
}

export function GroupInterface({ groupId, onClose }: GroupInterfaceProps) {
  const [newMessage, setNewMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState('chat');

  const group = {
    id: groupId,
    name: 'Mindfulness Circle',
    description: 'Daily meditation and mindfulness practices',
    members: 8,
    isAdmin: false,
    color: 'bg-blue-100 text-blue-800'
  };

  const members = [
    { id: '1', name: 'Sarah Johnson', avatar: '/placeholder-1.jpg', role: 'admin', status: 'online' },
    { id: '2', name: 'Mike Chen', avatar: '/placeholder-2.jpg', role: 'member', status: 'online' },
    { id: '3', name: 'Emma Davis', avatar: '/placeholder-3.jpg', role: 'member', status: 'offline' },
    { id: '4', name: 'Alex Rivera', avatar: '/placeholder-4.jpg', role: 'member', status: 'online' },
    { id: '5', name: 'Jordan Kim', avatar: '/placeholder-5.jpg', role: 'member', status: 'offline' },
  ];

  const messages = [
    {
      id: '1',
      sender: 'Sarah Johnson',
      content: 'Good morning everyone! How did yesterday\'s meditation session go?',
      timestamp: '9:30 AM',
      type: 'text'
    },
    {
      id: '2',
      sender: 'Mike Chen',
      content: 'It was really helpful! I felt much calmer afterward.',
      timestamp: '9:45 AM',
      type: 'text'
    },
    {
      id: '3',
      sender: 'Emma Davis',
      content: 'I shared a journal entry about my progress',
      timestamp: '10:15 AM',
      type: 'journal',
      data: {
        mood: '😌',
        preview: 'Week 3 of daily meditation and I can already feel the difference...'
      }
    },
    {
      id: '4',
      sender: 'Alex Rivera',
      content: 'Found this perfect meditation music for our sessions',
      timestamp: '10:30 AM',
      type: 'song',
      data: {
        name: 'Tibetan Singing Bowls',
        artist: 'Meditation Music'
      }
    }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Group Meditation Session',
      date: 'Today, 7:00 PM',
      participants: 5
    },
    {
      id: '2',
      title: 'Mindfulness Workshop',
      date: 'Tomorrow, 2:00 PM',
      participants: 8
    }
  ];

  const sharedContent = [
    {
      id: '1',
      type: 'entry',
      author: 'Emma Davis',
      content: 'Week 3 of daily meditation and I can already feel the difference in my anxiety levels...',
      mood: '😌',
      timestamp: '2h ago',
      supportCount: 3
    },
    {
      id: '2',
      type: 'song',
      author: 'Mike Chen',
      songName: 'Peaceful Mind',
      artist: 'Meditation Sounds',
      timestamp: '4h ago',
      supportCount: 5
    }
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // Mock sending message
    alert(`Message sent to ${group.name}: ${newMessage}`);
    setNewMessage('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            
            <div>
              <h2 className="font-medium">{group.name}</h2>
              <p className="text-xs text-muted-foreground">{group.members} members</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Invite
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-2">{group.description}</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 flex flex-col p-4 space-y-4">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{message.sender.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{message.sender}</span>
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  </div>
                  
                  {message.type === 'text' && (
                    <p className="text-sm">{message.content}</p>
                  )}
                  
                  {message.type === 'journal' && (
                    <div className="space-y-2">
                      <p className="text-sm">{message.content}</p>
                      <Card className="max-w-md">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span>{message.data.mood}</span>
                            <Badge variant="outline" className="text-xs">Journal Entry</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{message.data.preview}</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  
                  {message.type === 'song' && (
                    <div className="space-y-2">
                      <p className="text-sm">{message.content}</p>
                      <Card className="max-w-md">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                              <Music className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{message.data.name}</p>
                              <p className="text-xs text-muted-foreground">{message.data.artist}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Music className="w-4 h-4" />
              Song
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Heart className="w-4 h-4" />
              Entry
            </Button>
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="shared" className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {sharedContent.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{item.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">{item.author}</span>
                        <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                      </div>
                      
                      {item.type === 'entry' ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span>{item.mood}</span>
                            <Badge variant="outline">Journal Entry</Badge>
                          </div>
                          <p className="text-sm">{item.content}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Badge variant="outline">Song Share</Badge>
                          <div className="flex items-center gap-3 p-2 bg-muted rounded">
                            <Music className="w-4 h-4" />
                            <div>
                              <p className="text-sm font-medium">{item.songName}</p>
                              <p className="text-xs text-muted-foreground">{item.artist}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 mt-3">
                        <Button size="sm" variant="ghost" className="gap-2">
                          <Heart className="w-4 h-4" />
                          Support ({item.supportCount})
                        </Button>
                        <Button size="sm" variant="ghost">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Upcoming Events</h3>
              <Button size="sm" className="gap-2">
                <Calendar className="w-4 h-4" />
                Create Event
              </Button>
            </div>
            
            {upcomingEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                      <p className="text-xs text-muted-foreground">{event.participants} participants</p>
                    </div>
                    <Button size="sm">Join</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="members" className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Members ({members.length})</h3>
              <Button size="sm" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Invite
              </Button>
            </div>
            
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{member.name}</span>
                    {member.role === 'admin' && (
                      <Badge variant="secondary" className="text-xs">Admin</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{member.status}</p>
                </div>
                <Button size="sm" variant="outline">
                  Message
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}