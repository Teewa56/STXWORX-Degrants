import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Check, 
  CheckCheck,
  Search,
  Phone,
  Video,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useSocket } from '@/hooks/useSocket';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  isOwn: boolean;
  isRead: boolean;
  replyTo?: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
}

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  isTyping: boolean;
  lastSeen?: string;
  unreadCount?: number;
}

interface ChatInterfaceProps {
  projectId: string;
  currentUserId: string;
  className?: string;
}

export function ChatInterface({ projectId, currentUserId, className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { socket, emit, on, off } = useSocket();
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockUsers: ChatUser[] = [
      {
        id: 'user1',
        name: 'John Doe',
        avatar: '/api/placeholder/40/40',
        isOnline: true,
        isTyping: false,
        unreadCount: 2
      },
      {
        id: 'user2',
        name: 'Jane Smith',
        avatar: '/api/placeholder/40/40',
        isOnline: false,
        isTyping: false,
        lastSeen: '2 hours ago'
      }
    ];

    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Hey! How\'s the project going?',
        senderId: 'user1',
        senderName: 'John Doe',
        senderAvatar: '/api/placeholder/40/40',
        timestamp: '2024-01-15T10:30:00Z',
        isOwn: false,
        isRead: true
      },
      {
        id: '2',
        content: 'Going great! Just finished the design phase.',
        senderId: currentUserId,
        senderName: 'You',
        timestamp: '2024-01-15T10:32:00Z',
        isOwn: true,
        isRead: true
      },
      {
        id: '3',
        content: 'That\'s awesome! Can you share the designs?',
        senderId: 'user1',
        senderName: 'John Doe',
        senderAvatar: '/api/placeholder/40/40',
        timestamp: '2024-01-15T10:33:00Z',
        isOwn: false,
        isRead: false
      }
    ];

    setUsers(mockUsers);
    setMessages(mockMessages);
    setSelectedUser(mockUsers[0]);
  }, [currentUserId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      emit('join-project', projectId);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Mark as read if it's not our own message
      if (!message.isOwn) {
        emit('mark-read', { messageId: message.id, projectId });
      }
    };

    const handleUserJoined = (data: { userId: string; timestamp: string }) => {
      setUsers(prev => prev.map(user => 
        user.id === data.userId ? { ...user, isOnline: true } : user
      ));
    };

    const handleUserLeft = (data: { userId: string; timestamp: string }) => {
      setUsers(prev => prev.map(user => 
        user.id === data.userId ? { ...user, isOnline: false } : user
      ));
    };

    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      setUsers(prev => prev.map(user => 
        user.id === data.userId ? { ...user, isTyping: data.isTyping } : user
      ));
    };

    const handleMessageDelivered = (data: { messageId: string; timestamp: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, isRead: true } : msg
      ));
    };

    const handleRecentMessages = (recentMessages: Message[]) => {
      setMessages(recentMessages);
    };

    // Register event listeners
    on('connect', handleConnect);
    on('disconnect', handleDisconnect);
    on('new-message', handleNewMessage);
    on('user-joined', handleUserJoined);
    on('user-left', handleUserLeft);
    on('user-typing', handleUserTyping);
    on('message-delivered', handleMessageDelivered);
    on('recent-messages', handleRecentMessages);

    // Cleanup
    return () => {
      off('connect', handleConnect);
      off('disconnect', handleDisconnect);
      off('new-message', handleNewMessage);
      off('user-joined', handleUserJoined);
      off('user-left', handleUserLeft);
      off('user-typing', handleUserTyping);
      off('message-delivered', handleMessageDelivered);
      off('recent-messages', handleRecentMessages);
    };
  }, [socket, projectId, emit, on, off]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Typing indicator
  const handleTyping = useCallback((text: string) => {
    setNewMessage(text);
    
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      emit('typing-start', projectId);
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emit('typing-stop', projectId);
    }, 1000);
  }, [isTyping, projectId, emit]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      projectId,
      content: newMessage.trim(),
      replyTo: undefined // TODO: Add reply functionality
    };

    try {
      emit('send-message', messageData);
      setNewMessage('');
      setIsTyping(false);
      emit('typing-stop', projectId);
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Filter messages based on search
  const filteredMessages = searchTerm 
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.senderName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages;

  return (
    <div className={`flex h-full ${className}`}>
      {/* Users Sidebar */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Chat</CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {showSearch && (
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-2"
            />
          )}
        </CardHeader>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {users.map((user) => (
              <div
                key={user.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedUser?.id === user.id 
                    ? 'bg-blue-100 border-blue-200' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.isTyping ? 'Typing...' : user.lastSeen || 'Online'}
                      </p>
                    </div>
                  </div>
                  {user.unreadCount && user.unreadCount > 0 && (
                    <Badge variant="secondary" className="bg-blue-600 text-white">
                      {user.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedUser.avatar} />
                      <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {selectedUser.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selectedUser.name}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {selectedUser.isOnline ? 'Active now' : selectedUser.lastSeen}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${
                      message.isOwn ? 'order-2' : 'order-1'
                    }`}>
                      {!message.isOwn && (
                        <div className="flex items-center space-x-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={message.senderAvatar} />
                            <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{message.senderName}</span>
                          <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                        </div>
                      )}
                      
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      
                      <div className={`flex items-center space-x-1 mt-1 ${
                        message.isOwn ? 'justify-end' : 'justify-start'
                      }`}>
                        {message.isOwn && (
                          <>
                            <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                            {message.isRead ? (
                              <CheckCheck className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Check className="h-4 w-4 text-gray-400" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {users.some(user => user.isTyping) && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-end space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Textarea
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[40px] max-h-32 resize-none"
                    rows={1}
                  />
                </div>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !isConnected}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
                <span className="text-xs text-gray-500">
                  Press Enter to send, Shift+Enter for new line
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Select a conversation</h3>
              <p className="text-gray-500 mt-1">Choose a user from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatInterface;
