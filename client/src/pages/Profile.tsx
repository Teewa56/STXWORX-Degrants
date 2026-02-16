import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Twitter, Edit2, Save, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Schema for profile updates
const profileSchema = z.object({
    displayName: z.string().min(2, "Display name must be at least 2 characters"),
    bio: z.string().optional(),
    title: z.string().optional(),
    company: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    location: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);

    // Fetch X Integration Data
    const { data: xIntegration, isLoading: isLoadingX } = useQuery({
        queryKey: ['/api/x/user', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            try {
                const res = await apiRequest('GET', `/api/x/user/${user.id}`);
                const data = await res.json();
                return data.data; // The API returns { success: true, data: ... }
            } catch (e) {
                return null;
            }
        },
        enabled: !!user?.id
    });

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: user?.displayName || '',
            bio: user?.bio || '',
            title: user?.title || '',
            company: user?.company || '',
            website: user?.website || '',
            location: user?.location || '',
        },
    });

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (data: ProfileFormValues) => {
            const res = await apiRequest('PATCH', '/api/users/me', data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
            setIsEditing(false);
            toast({
                title: "Profile updated",
                description: "Your changes have been saved successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update profile",
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: ProfileFormValues) => {
        updateProfileMutation.mutate(data);
    };

    const handleDisconnectX = async () => {
        if (!confirm("Are you sure you want to disconnect your X account?")) return;
        try {
            await apiRequest('DELETE', `/api/x/disconnect/${user?.id}`);
            queryClient.invalidateQueries({ queryKey: ['/api/x/user', user?.id] });
            toast({ title: "Disconnected", description: "X account disconnected." });
        } catch (e) {
            toast({ title: "Error", description: "Failed to disconnect", variant: "destructive" });
        }
    };

    if (!user) return null;

    return (
        <div className="container max-w-4xl py-10 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="w-24 h-24 border-2 border-primary/20">
                    <AvatarImage src={user.avatar || ''} />
                    <AvatarFallback className="text-2xl">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">{user.displayName || user.username}</h1>
                            <p className="text-muted-foreground flex items-center gap-2">
                                {user.role === 'client' ? 'Client' : 'Freelancer'}
                                {user.title && <span>• {user.title}</span>}
                            </p>
                        </div>
                        {!isEditing && (
                            <Button variant="outline" onClick={() => setIsEditing(true)}>
                                <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                            </Button>
                        )}
                    </div>

                    {!isEditing && (
                        <div className="space-y-4 mt-4">
                            <p className="whitespace-pre-wrap">{user.bio || "No bio yet."}</p>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                {user.company && <div>🏢 {user.company}</div>}
                                {user.location && <div>📍 {user.location}</div>}
                                {user.website && (
                                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary">
                                        🔗 Website <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="socials">Social Connections</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    {isEditing ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Edit Profile</CardTitle>
                                <CardDescription>Update your public profile information.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Display Name</Label>
                                            <Input {...form.register('displayName')} />
                                            {form.formState.errors.displayName && <p className="text-red-500 text-sm">{form.formState.errors.displayName.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Title</Label>
                                            <Input {...form.register('title')} placeholder="e.g. Senior Developer" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Company</Label>
                                            <Input {...form.register('company')} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Location</Label>
                                            <Input {...form.register('location')} placeholder="e.g. New York, USA" />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Website</Label>
                                            <Input {...form.register('website')} placeholder="https://..." />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Bio</Label>
                                            <Textarea {...form.register('bio')} rows={4} />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                                            {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader><CardTitle className="text-lg">Reputation</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{user.reputation || 0}</div>
                                    <p className="text-muted-foreground text-sm">Points based on completed jobs</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="text-lg">Completed Projects</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{user.completedProjects || 0}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle className="text-lg">Total Earnings</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{user.totalEarnings || 0} STX</div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="socials" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Connected Accounts</CardTitle>
                            <CardDescription>Manage your social media integrations.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                                        <Twitter className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold flex items-center gap-2">
                                            X (Twitter)
                                            {xIntegration?.verified && (
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                                                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                                                </Badge>
                                            )}
                                        </h3>
                                        {xIntegration ? (
                                            <div className="text-sm text-muted-foreground space-y-1">
                                                <p>@{xIntegration.handle}</p>
                                                <div className="flex gap-3 mt-1">
                                                    <span><strong>{xIntegration.followerCount}</strong> Followers</span>
                                                    <span><strong>{xIntegration.engagementScore}</strong> Engagement Score</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">Connect your X account to verify your identity.</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    {xIntegration ? (
                                        <Button variant="outline" size="sm" onClick={handleDisconnectX}>
                                            Disconnect
                                        </Button>
                                    ) : (
                                        <Button size="sm" onClick={() => window.open('/api/x/authorize', '_blank')}>
                                            Connect
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
