import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageCenterProps {
  isOpen: boolean;
  onClose: () => void;
  initialProjectId?: string | null;
  initialProjectTitle?: string;
  initialOtherUserName?: string;
  initialOtherUserRole?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  senderName?: string;
}

interface ChatConversation {
  projectId: string;
  projectTitle: string;
  otherUserName: string;
  otherUserRole: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  otherUserAvatar?: string;
}

export default function MessageCenter({ 
  isOpen, 
  onClose, 
  initialProjectId,
  initialProjectTitle,
  initialOtherUserName,
  initialOtherUserRole
}: MessageCenterProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(
    initialProjectId ? {
      projectId: initialProjectId,
      projectTitle: initialProjectTitle || 'Chat',
      otherUserName: initialOtherUserName || 'Unknown',
      otherUserRole: initialOtherUserRole || 'unknown'
    } : null
  );
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConversationList, setShowConversationList] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch conversations from API
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/chat/conversations'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/chat/conversations');
      const data = await res.json();
      return data.data || [];
    },
    enabled: isOpen,
    refetchInterval: isOpen ? 10000 : false,
  });

  // Fetch messages for selected chat
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: [`/api/chat/messages/${selectedChat?.projectId}`],
    queryFn: async () => {
      if (!selectedChat) return [];
      const res = await apiRequest('GET', `/api/chat/messages/${selectedChat.projectId}?limit=100`);
      const data = await res.json();
      return data.data || [];
    },
    enabled: isOpen && !!selectedChat?.projectId,
    refetchInterval: isOpen && !!selectedChat?.projectId ? 3000 : false,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedChat) throw new Error('No chat selected');
      await apiRequest('POST', '/api/chat/messages', {
        projectId: selectedChat.projectId,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chat/messages/${selectedChat?.projectId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/chat/conversations'] });
      setNewMessage('');
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!newMessage.trim() || !selectedChat) return;
    sendMessageMutation.mutate(newMessage);
  };

  const handleSelectChat = (chat: ChatConversation) => {
    setSelectedChat(chat);
    // On mobile, hide conversation list when chat is selected
    if (window.innerWidth < 768) {
      setShowConversationList(false);
    }
  };

  const handleBackToList = () => {
    setShowConversationList(true);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherUserName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (selectedChat && messages) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [selectedChat, messages?.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full h-[90vh] max-h-[900px] flex flex-col md:max-w-6xl md:h-[80vh] md:max-h-[800px]">
        <CardHeader className="border-b flex flex-row items-center justify-between bg-primary/5 shrink-0">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden hidden md:flex">
          {/* Desktop Layout - Side by Side */}
          {/* Conversations List */}
          <div className="w-80 border-r flex flex-col shrink-0">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              {conversationsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 px-4">
                  {searchTerm ? 'No conversations found' : 'No conversations yet'}
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.projectId}
                      onClick={() => setSelectedChat(conv)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedChat?.projectId === conv.projectId ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conv.otherUserAvatar} />
                          <AvatarFallback>
                            {conv.otherUserName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm truncate">{conv.otherUserName}</h4>
                            {conv.lastMessageTime && (
                              <span className="text-xs text-muted-foreground">
                                {formatTime(conv.lastMessageTime)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1 truncate">{conv.projectTitle}</p>
                          {conv.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                          )}
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <Badge variant="destructive" className="mt-1 text-xs">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-4 border-b bg-primary/5 shrink-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {selectedChat.otherUserName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{selectedChat.otherUserName}</h3>
                      <p className="text-sm text-muted-foreground">{selectedChat.projectTitle}</p>
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="flex items-end gap-2 max-w-[80%]">
                            {msg.senderId !== user?.id && (
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {msg.senderName?.slice(0, 2).toUpperCase() || 'UN'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`px-3 py-2 rounded-lg text-sm ${
                                msg.senderId === user?.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p>{msg.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {formatTime(msg.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={scrollRef} />
                    </div>
                  )}
                </ScrollArea>

                <div className="p-4 border-t bg-background shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={sendMessageMutation.isPending || !newMessage.trim()}
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p>Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        {/* Mobile Layout - Switchable Views */}
        <CardContent className="flex-1 p-0 overflow-hidden md:hidden">
          {showConversationList ? (
            /* Mobile Conversation List */
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                {conversationsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 px-4">
                    {searchTerm ? 'No conversations found' : 'No conversations yet'}
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredConversations.map((conv) => (
                      <div
                        key={conv.projectId}
                        onClick={() => handleSelectChat(conv)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedChat?.projectId === conv.projectId ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conv.otherUserAvatar} />
                            <AvatarFallback>
                              {conv.otherUserName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm truncate">{conv.otherUserName}</h4>
                              {conv.lastMessageTime && (
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(conv.lastMessageTime)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-1 truncate">{conv.projectTitle}</p>
                            {conv.lastMessage && (
                              <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                            )}
                            {conv.unreadCount && conv.unreadCount > 0 && (
                              <Badge variant="destructive" className="mt-1 text-xs">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            /* Mobile Chat View */
            <div className="flex flex-col h-full">
              {selectedChat && (
                <>
                  <div className="p-4 border-b bg-primary/5 shrink-0 flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleBackToList}
                      className="mr-2"
                    >
                      <X className="h-4 w-4 rotate-180" />
                    </Button>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {selectedChat.otherUserName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{selectedChat.otherUserName}</h3>
                      <p className="text-sm text-muted-foreground">{selectedChat.projectTitle}</p>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className="flex items-end gap-2 max-w-[80%]">
                              {msg.senderId !== user?.id && (
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {msg.senderName?.slice(0, 2).toUpperCase() || 'UN'}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`px-3 py-2 rounded-lg text-sm ${
                                  msg.senderId === user?.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p>{msg.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {formatTime(msg.timestamp)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={scrollRef} />
                      </div>
                    )}
                  </ScrollArea>

                  <div className="p-4 border-t bg-background shrink-0">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                      />
                      <Button 
                        type="submit" 
                        size="icon" 
                        disabled={sendMessageMutation.isPending || !newMessage.trim()}
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
