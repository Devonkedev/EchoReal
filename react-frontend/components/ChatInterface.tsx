import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Music, Heart, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

interface ChatInterfaceProps {
  friendId: string;
  onClose: () => void;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'journal' | 'song';
  timestamp: Date;
  data?: any;
}

export function ChatInterface({ friendId, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'friend',
      content: "Hey! How are you feeling today? 💛",
      type: 'text',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      senderId: 'me',
      content: "Been better, but trying to stay positive. Thanks for checking in ❤️",
      type: 'text',
      timestamp: new Date(Date.now() - 3300000)
    },
    {
      id: '3',
      senderId: 'friend',
      content: "I found this song that always helps me when I'm feeling down. Hope it helps you too!",
      type: 'song',
      timestamp: new Date(Date.now() - 3000000),
      data: {
        name: 'Three Little Birds',
        artist: 'Bob Marley',
        message: 'This always reminds me that everything will be alright 🎵'
      }
    },
    {
      id: '4',
      senderId: 'me',
      content: "I wrote something today that I wanted to share with you...",
      type: 'journal',
      timestamp: new Date(Date.now() - 1800000),
      data: {
        mood: '😌',
        preview: 'Today I realized that it\'s okay to have difficult days. They make the good ones more meaningful...',
        message: 'Your friendship means so much to me'
      }
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const friend = {
    id: friendId,
    name: 'Sarah Johnson',
    avatar: '/placeholder-avatar.jpg',
    status: 'online',
    lastSeen: 'Active now'
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      content: newMessage,
      type: 'text',
      timestamp: new Date()
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessage = (message: Message) => {
    const isMe = message.senderId === 'me';
    
    return (
      <div key={message.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
        {!isMe && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={friend.avatar} />
            <AvatarFallback>{friend.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
          {message.type === 'text' && (
            <div className={`p-3 rounded-lg ${
              isMe 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}>
              <p className="text-sm">{message.content}</p>
            </div>
          )}
          
          {message.type === 'song' && (
            <div className="space-y-2">
              {message.content && (
                <div className={`p-3 rounded-lg ${
                  isMe 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{message.content}</p>
                </div>
              )}
              <Card className="w-full">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                      <Music className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{message.data.name}</p>
                      <p className="text-xs text-muted-foreground">{message.data.artist}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Play
                    </Button>
                  </div>
                  {message.data.message && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      "{message.data.message}"
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {message.type === 'journal' && (
            <div className="space-y-2">
              {message.content && (
                <div className={`p-3 rounded-lg ${
                  isMe 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{message.content}</p>
                </div>
              )}
              <Card className="w-full">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{message.data.mood}</span>
                    <Badge variant="outline" className="text-xs">Journal Entry</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {message.data.preview}
                  </p>
                  {message.data.message && (
                    <p className="text-xs text-blue-600 mt-2 italic">
                      "{message.data.message}"
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Heart className="w-3 h-3" />
                      Support
                    </Button>
                    <Button size="sm" variant="outline">
                      Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <span className="text-xs text-muted-foreground mt-1">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={friend.avatar} />
              <AvatarFallback>{friend.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          
          <div>
            <h2 className="font-medium">{friend.name}</h2>
            <p className="text-xs text-muted-foreground">{friend.lastSeen}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border">
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
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}