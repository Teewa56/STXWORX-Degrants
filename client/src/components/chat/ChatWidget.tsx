import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, X, Send, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatWidgetProps {
    projectId: string;
    projectTitle: string;
    otherUserName: string;
    otherUserRole: string; // 'client' or 'freelancer'
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    timestamp: string;
}

export default function ChatWidget({ projectId, projectTitle, otherUserName, otherUserRole }: ChatWidgetProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Poll for messages every 3 seconds when open
    const { data: messages, isLoading } = useQuery({
        queryKey: [`/api/chat/messages/${projectId}`],
        queryFn: async () => {
            const res = await apiRequest('GET', `/api/chat/messages/${projectId}?limit=100`);
            const data = await res.json();
            return data.data as Message[];
        },
        enabled: isOpen && !!projectId,
        refetchInterval: isOpen ? 3000 : false,
    });

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: async (content: string) => {
            await apiRequest('POST', '/api/chat/messages', {
                projectId,
                content,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/chat/messages/${projectId}`] });
            setNewMessage('');
            // Scroll to bottom
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
        if (!newMessage.trim()) return;
        sendMessageMutation.mutate(newMessage);
    };

    useEffect(() => {
        if (isOpen && messages) {
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    }, [isOpen, messages?.length]);

    if (!isOpen) {
        return (
            <Button
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
                onClick={() => setIsOpen(true)}
            >
                <MessageCircle className="h-6 w-6" />
            </Button>
        );
    }

    return (
        <Card className={`fixed bottom-6 right-6 z-50 shadow-xl transition-all duration-200 flex flex-col ${isMinimized ? 'w-72 h-14' : 'w-80 md:w-96 h-[500px]'}`}>
            <CardHeader className="p-3 border-b flex flex-row items-center justify-between bg-primary/5">
                <div className="flex flex-col">
                    <CardTitle className="text-sm font-medium">{projectTitle}</CardTitle>
                    {!isMinimized && <span className="text-xs text-muted-foreground">Chatting with {otherUserName}</span>}
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMinimized(!isMinimized)}>
                        {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            {!isMinimized && (
                <>
                    <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                        <ScrollArea className="flex-1 p-4">
                            {isLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : messages?.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8 text-sm">
                                    No messages yet. Start the conversation!
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages?.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${msg.senderId === user?.id
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted'
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={scrollRef} />
                                </div>
                            )}
                        </ScrollArea>

                        <div className="p-3 border-t bg-background">
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
                                <Button type="submit" size="icon" disabled={sendMessageMutation.isPending || !newMessage.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </>
            )}
        </Card>
    );
}
