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
import { Loader2, Twitter, Edit2, Save, X, ExternalLink, ShieldCheck, MapPin, Globe, Building, Briefcase, Award, TrendingUp } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

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
        <div className="min-h-screen text-foreground">
            <Navigation currentPage="profile" />
            <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                <div className="flex flex-col items-center lg:items-start gap-4">
                    <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-lg">
                        <AvatarImage src={user.avatar || ''} alt={user.username} />
                        <AvatarFallback className="text-3xl font-bold">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Badge variant={user.role === 'client' ? 'default' : 'secondary'} className="mt-2">
                        {user.role === 'client' ? 'Client' : 'Freelancer'}
                    </Badge>
                </div>

                <div className="flex-1 space-y-4 text-center lg:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                {user.displayName || user.username}
                            </h1>
                            <p className="text-muted-foreground text-lg flex items-center justify-center sm:justify-start gap-2">
                                <span className="capitalize">{user.role}</span>
                                {user.title && <span className="text-primary">• {user.title}</span>}
                            </p>
                        </div>
                        {!isEditing && (
                            <Button variant="outline" onClick={() => setIsEditing(true)} className="shrink-0">
                                <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                            </Button>
                        )}
                    </div>

                    {!isEditing && (
                        <div className="space-y-4">
                            <p className="text-base leading-relaxed whitespace-pre-wrap">{user.bio || "No bio yet."}</p>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-center lg:justify-start">
                                {user.company && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-full">
                                        <Building className="w-4 h-4" />
                                        <span>{user.company}</span>
                                    </div>
                                )}
                                {user.location && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-full">
                                        <MapPin className="w-4 h-4" />
                                        <span>{user.location}</span>
                                    </div>
                                )}
                                {user.website && (
                                    <a 
                                        href={user.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-full hover:bg-primary/20 hover:text-primary transition-colors"
                                    >
                                        <Globe className="w-4 h-4" />
                                        <span>Website</span>
                                        <ExternalLink className="w-3 h-3 ml-1" />
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
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="displayName" className="text-sm font-medium">Display Name</Label>
                                    <Input 
                                        id="displayName"
                                        {...form.register('displayName')} 
                                        className="focus:ring-primary focus:border-primary"
                                    />
                                    {form.formState.errors.displayName && (
                                        <p className="text-red-500 text-sm flex items-center gap-1">
                                            <X className="w-3 h-3" />
                                            {form.formState.errors.displayName.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                                    <Input 
                                        id="title"
                                        {...form.register('title')} 
                                        placeholder="e.g. Senior Developer" 
                                        className="focus:ring-primary focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                                    <Input 
                                        id="company"
                                        {...form.register('company')} 
                                        className="focus:ring-primary focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                                    <Input 
                                        id="location"
                                        {...form.register('location')} 
                                        placeholder="e.g. New York, USA" 
                                        className="focus:ring-primary focus:border-primary"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="space-y-2">
                                    <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                                    <Input 
                                        id="website"
                                        {...form.register('website')} 
                                        placeholder="https://..." 
                                        className="focus:ring-primary focus:border-primary"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                                    <Textarea 
                                        id="bio"
                                        {...form.register('bio')} 
                                        rows={4} 
                                        placeholder="Tell us about yourself..."
                                        className="focus:ring-primary focus:border-primary resize-none"
                                    />
                                </div>
                            </div>
                                    <div className="flex flex-col sm:flex-row justify-end gap-2 pt-6">
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            onClick={() => setIsEditing(false)}
                                            className="w-full sm:w-auto"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={updateProfileMutation.isPending}
                                            className="w-full sm:w-auto"
                                        >
                                            {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {user.role === 'client' && (
                        <>
                            <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Building className="w-5 h-5 text-primary" />
                                        <CardTitle className="text-lg">Active Projects</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="text-3xl lg:text-4xl font-bold text-primary">{user.activeProjects || 0}</div>
                                    <p className="text-muted-foreground text-sm mt-1">Currently managing</p>
                                </CardContent>
                            </Card>
                            <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Award className="w-5 h-5 text-primary" />
                                        <CardTitle className="text-lg">Reputation</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="text-3xl lg:text-4xl font-bold text-primary">{user.reputation || 0}</div>
                                    <p className="text-muted-foreground text-sm mt-1">Points based on successful collaborations</p>
                                </CardContent>
                            </Card>
                        </>
                    )}
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
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full shadow-lg">
                                        <Twitter className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            X (Twitter)
                                            {xIntegration?.verified && (
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300">
                                                    <ShieldCheck className="w-4 h-4 mr-1" /> Verified
                                                </Badge>
                                            )}
                                        </h3>
                                        {xIntegration ? (
                                            <div className="text-sm text-muted-foreground space-y-2 mt-2">
                                                <p className="font-medium">@{xIntegration.handle}</p>
                                                <div className="flex flex-wrap gap-4">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-lg font-bold">{xIntegration.followerCount}</span>
                                                        <span className="text-xs">Followers</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-lg font-bold">{xIntegration.engagementScore}</span>
                                                        <span className="text-xs">Engagement</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground mt-2">Connect your X account to verify your identity and boost your reputation.</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    {xIntegration ? (
                                        <Button 
                                            variant="outline" 
                                            onClick={handleDisconnectX}
                                            className="w-full sm:w-auto"
                                        >
                                            Disconnect Account
                                        </Button>
                                    ) : (
                                        <Button 
                                            onClick={() => window.open('/api/x/authorize', '_blank')}
                                            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600"
                                        >
                                            <Twitter className="w-4 h-4 mr-2" />
                                            Connect X Account
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
        <Footer />
    </div>
    );
}
