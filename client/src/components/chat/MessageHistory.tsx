import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  RefreshCw,
  MessageSquare,
  Users,
  Clock,
  Eye,
  Trash2,
  Star,
  Bookmark,
  Share2,
  FileText,
  Image,
  Link,
  Paperclip,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Hash,
  Globe,
  Shield,
  Lock,
  Unlock,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  projectId: string;
  projectTitle: string;
  timestamp: string;
  isRead: boolean;
  isEncrypted: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    type: 'image' | 'document' | 'link' | 'other';
    size: number;
    url: string;
  }>;
  replyTo?: string;
  deletedAt?: string;
  editedAt?: string;
  reactions?: Array<{
    emoji: string;
    userId: string;
    userName: string;
    timestamp: string;
  }>;
}

interface MessageHistoryProps {
  projectId: string;
  currentUserId: string;
  className?: string;
}

export function MessageHistory({ projectId, currentUserId, className }: MessageHistoryProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [senderFilter, setSenderFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [showMessageDetails, setShowMessageDetails] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_reactions'>('newest');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [isExporting, setIsExporting] = useState(false);
  
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockMessages: ChatMessage[] = [
      {
        id: 'msg_001',
        content: 'Hey! How\'s the project going? I\'ve completed the design phase and would love to get your feedback.',
        senderId: 'user_001',
        senderName: 'John Doe',
        senderAvatar: '/api/placeholder/40/40',
        recipientId: 'user_002',
        recipientName: 'Jane Smith',
        projectId: projectId,
        projectTitle: 'E-commerce Website Development',
        timestamp: '2024-01-15T10:30:00Z',
        isRead: true,
        isEncrypted: true,
        attachments: [
          {
            id: 'att_001',
            name: 'design-mockup.png',
            type: 'image',
            size: 2048576,
            url: '/api/placeholder/300/200'
          }
        ],
        reactions: [
          { emoji: '👍', userId: 'user_002', userName: 'Jane Smith', timestamp: '2024-01-15T10:35:00Z' },
          { emoji: '❤️', userId: 'user_002', userName: 'Jane Smith', timestamp: '2024-01-15T10:36:00Z' }
        ]
      },
      {
        id: 'msg_002',
        content: 'The design looks great! I love the color scheme and the layout is very clean. I have a few minor suggestions for the navigation menu.',
        senderId: 'user_002',
        senderName: 'Jane Smith',
        senderAvatar: '/api/placeholder/40/40',
        recipientId: 'user_001',
        recipientName: 'John Doe',
        projectId: projectId,
        projectTitle: 'E-commerce Website Development',
        timestamp: '2024-01-15T10:45:00Z',
        isRead: true,
        isEncrypted: true,
        replyTo: 'msg_001',
        reactions: [
          { emoji: '👍', userId: 'user_001', userName: 'John Doe', timestamp: '2024-01-15T10:50:00Z' }
        ]
      },
      {
        id: 'msg_003',
        content: 'Thanks! I\'d love to hear your suggestions. Should I implement them in the next iteration or make the changes now?',
        senderId: 'user_001',
        senderName: 'John Doe',
        senderAvatar: '/api/placeholder/40/40',
        recipientId: 'user_002',
        recipientName: 'Jane Smith',
        projectId: projectId,
        projectTitle: 'E-commerce Website Development',
        timestamp: '2024-01-15T11:00:00Z',
        isRead: true,
        isEncrypted: true,
        replyTo: 'msg_002'
      },
      {
        id: 'msg_004',
        content: 'Let\'s discuss them in our next meeting. For now, please proceed with the development phase as planned.',
        senderId: 'user_002',
        senderName: 'Jane Smith',
        senderAvatar: '/api/placeholder/40/40',
        recipientId: 'user_001',
        recipientName: 'John Doe',
        projectId: projectId,
        projectTitle: 'E-commerce Website Development',
        timestamp: '2024-01-15T11:15:00Z',
        isRead: true,
        isEncrypted: true,
        replyTo: 'msg_003'
      },
      {
        id: 'msg_005',
        content: 'Perfect! I\'ll start working on the backend implementation. I\'ll keep you updated on my progress.',
        senderId: 'user_001',
        senderName: 'John Doe',
        senderAvatar: '/api/placeholder/40/40',
        recipientId: 'user_002',
        recipientName: 'Jane Smith',
        projectId: projectId,
        projectTitle: 'E-commerce Website Development',
        timestamp: '2024-01-15T11:30:00Z',
        isRead: true,
        isEncrypted: true,
        replyTo: 'msg_004'
      },
      {
        id: 'msg_006',
        content: 'I\'ve completed the user authentication module. Here\'s the API documentation for your review.',
        senderId: 'user_001',
        senderName: 'John Doe',
        senderAvatar: '/api/placeholder/40/40',
        recipientId: 'user_002',
        recipientName: 'Jane Smith',
        projectId: projectId,
        projectTitle: 'E-commerce Website Development',
        timestamp: '2024-01-16T09:00:00Z',
        isRead: false,
        isEncrypted: true,
        attachments: [
          {
            id: 'att_002',
            name: 'api-documentation.pdf',
            type: 'document',
            size: 1048576,
            url: '/api/placeholder/100/150'
          }
        ]
      }
    ];
    
    setMessages(mockMessages);
    setFilteredMessages(mockMessages);
    setIsLoading(false);
  }, [projectId]);

  // Filter messages
  useEffect(() => {
    let filtered = messages;

    if (searchTerm) {
      filtered = filtered.filter(msg =>
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(msg => 
        new Date(msg.timestamp) >= filterDate
      );
    }

    if (senderFilter !== 'all') {
      filtered = filtered.filter(msg => {
        if (senderFilter === 'sent') {
          return msg.senderId === currentUserId;
        } else if (senderFilter === 'received') {
          return msg.recipientId === currentUserId;
        }
        return false;
      });
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(msg => {
        if (typeFilter === 'with_attachments') {
          return msg.attachments && msg.attachments.length > 0;
        } else if (typeFilter === 'unread') {
          return !msg.isRead;
        } else if (typeFilter === 'with_reactions') {
          return msg.reactions && msg.reactions.length > 0;
        }
        return false;
      });
    }

    // Sort messages
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'most_reactions':
          return (b.reactions?.length || 0) - (a.reactions?.length || 0);
        default:
          return 0;
      }
    });

    setFilteredMessages(filtered);
  }, [messages, searchTerm, dateFilter, senderFilter, typeFilter, sortBy, currentUserId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const toggleMessageExpansion = (messageId: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedMessages(newExpanded);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // TODO: Implement actual export functionality
      console.log(`Exporting messages as ${exportFormat}`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Export Completed",
        description: `Message history exported as ${exportFormat.toUpperCase()}`,
      });
      
      setShowExportDialog(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export message history",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // TODO: Implement actual API call
      console.log(`Deleting message ${messageId}`);
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, deletedAt: new Date().toISOString() }
          : msg
      ));
      
      toast({
        title: "Message Deleted",
        description: "Message has been deleted",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      // TODO: Implement actual API call
      console.log(`Marking message ${messageId} as read`);
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isRead: true }
          : msg
      ));
      
      toast({
        title: "Message Marked as Read",
        description: "Message has been marked as read",
      });
    } catch (error) {
      toast({
        title: "Mark as Read Failed",
        description: "Failed to mark message as read",
        variant: "destructive",
      });
    }
  };

  const refreshMessages = () => {
    setIsLoading(true);
    // TODO: Implement actual refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <CardDescription>Loading message history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Message History
              </CardTitle>
              <CardDescription>
                Search and review all chat messages for this project
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={refreshMessages} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Message History</DialogTitle>
                    <DialogDescription>
                      Choose format for exporting message history
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Export Format</Label>
                      <Select value={exportFormat} onValueChange={(value: 'json' | 'csv' | 'pdf') => setExportFormat(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex-1"
                      >
                        {isExporting ? 'Exporting...' : 'Export Messages'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowExportDialog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={senderFilter} onValueChange={setSenderFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="with_attachments">With Attachments</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="with_reactions">With Reactions</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-32">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="most_reactions">Most Reactions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Messages List */}
            <div className="space-y-2">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                    !message.isRead ? 'bg-blue-50 border-blue-200' : ''
                  } ${message.deletedAt ? 'opacity-50' : ''}`}
                  onClick={() => toggleMessageExpansion(message.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{message.senderName}</span>
                            <span className="text-xs text-gray-500">→</span>
                            <span className="font-medium text-sm">{message.recipientName}</span>
                            {message.isEncrypted && (
                              <div className="flex items-center space-x-1">
                                <Lock className="h-3 w-3 text-green-600" />
                                <span className="text-xs text-green-600">Encrypted</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{formatDate(message.timestamp)}</span>
                            <span>{formatTime(message.timestamp)}</span>
                            {message.editedAt && (
                              <span className="text-orange-600">Edited</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-700 mb-2">
                          {message.content}
                        </div>
                        
                        {message.replyTo && (
                          <div className="mb-2 p-2 bg-gray-50 rounded border-l-2 border-blue-200">
                            <div className="text-xs text-gray-500 mb-1">
                              Replying to message from {formatDate(message.replyTo)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {filteredMessages.find(m => m.id === message.replyTo)?.content}
                            </div>
                          </div>
                        )}
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center space-x-2 p-2 border rounded bg-gray-50">
                                {attachment.type === 'image' ? (
                                  <Image className="h-4 w-4 text-gray-500" />
                                ) : attachment.type === 'document' ? (
                                  <FileText className="h-4 w-4 text-gray-500" />
                                ) : attachment.type === 'link' ? (
                                  <Link className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Paperclip className="h-4 w-4 text-gray-500" />
                                )}
                                <div>
                                  <p className="text-sm font-medium">{attachment.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(attachment.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex items-center space-x-2">
                            {message.reactions.map((reaction, index) => (
                              <div key={index} className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full">
                                <span>{reaction.emoji}</span>
                                <span className="text-xs text-gray-600">{reaction.userName}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!message.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(message.id);
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMessage(message);
                            setShowMessageDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {!message.deletedAt && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMessage(message.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMessages.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No messages found matching your criteria</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Details Dialog */}
      <Dialog open={showMessageDetails} onOpenChange={setShowMessageDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about message #{selectedMessage?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-6">
              {/* Message Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Message ID</Label>
                  <p className="font-mono text-xs">{selectedMessage.id}</p>
                </div>
                <div>
                  <Label>Timestamp</Label>
                  <p className="text-sm">{formatDate(selectedMessage.timestamp)} at {formatTime(selectedMessage.timestamp)}</p>
                </div>
                <div>
                  <Label>From</Label>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedMessage.senderName}</p>
                      <p className="text-xs text-gray-500">{selectedMessage.senderId}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>To</Label>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedMessage.recipientName}</p>
                      <p className="text-xs text-gray-500">{selectedMessage.recipientId}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    {selectedMessage.isRead ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className="text-sm">
                      {selectedMessage.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Encryption</Label>
                  <div className="flex items-center space-x-2">
                    {selectedMessage.isEncrypted ? (
                      <Lock className="h-4 w-4 text-green-600" />
                    ) : (
                      <Unlock className="h-4 w-4 text-gray-600" />
                    )}
                    <span className="text-sm">
                      {selectedMessage.isEncrypted ? 'Encrypted' : 'Not Encrypted'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <Label className="text-base font-medium">Message Content</Label>
                <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-700">{selectedMessage.content}</p>
                </div>
              </div>

              {/* Attachments */}
              {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                <div>
                  <Label className="text-base font-medium">Attachments</Label>
                  <div className="mt-2 space-y-2">
                    {selectedMessage.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {attachment.type === 'image' ? (
                            <Image className="h-8 w-8 text-gray-500" />
                          ) : attachment.type === 'document' ? (
                            <FileText className="h-8 w-8 text-gray-500" />
                          ) : attachment.type === 'link' ? (
                            <Link className="h-8 w-8 text-gray-500" />
                          ) : (
                            <Paperclip className="h-8 w-8 text-gray-500" />
                          )}
                          <div>
                            <p className="font-medium">{attachment.name}</p>
                            <p className="text-sm text-gray-500">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reactions */}
              {selectedMessage.reactions && selectedMessage.reactions.length > 0 && (
                <div>
                  <Label className="text-base font-medium">Reactions</Label>
                  <div className="mt-2 space-y-2">
                    {selectedMessage.reactions.map((reaction, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{reaction.emoji}</span>
                          <div>
                            <p className="text-sm font-medium">{reaction.userName}</p>
                            <p className="text-xs text-gray-500">{formatDate(reaction.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div>
                <Label className="text-base font-medium">Technical Details</Label>
                <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-gray-500">Project ID</Label>
                      <p className="font-mono">{selectedMessage.projectId}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Project Title</Label>
                      <p>{selectedMessage.projectTitle}</p>
                    </div>
                    {selectedMessage.replyTo && (
                      <div>
                        <Label className="text-xs text-gray-500">Reply To</Label>
                        <p className="font-mono">{selectedMessage.replyTo}</p>
                      </div>
                    )}
                    {selectedMessage.editedAt && (
                      <div>
                        <Label className="text-xs text-gray-500">Edited At</Label>
                        <p>{formatDate(selectedMessage.editedAt)} at {formatTime(selectedMessage.editedAt)}</p>
                      </div>
                    )}
                    {selectedMessage.deletedAt && (
                      <div>
                        <Label className="text-xs text-gray-500">Deleted At</Label>
                        <p>{formatDate(selectedMessage.deletedAt)} at {formatTime(selectedMessage.deletedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                {!selectedMessage.isRead && (
                  <Button
                    onClick={() => handleMarkAsRead(selectedMessage.id)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
                
                {!selectedMessage.deletedAt && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Message
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MessageHistory;
