import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Edit,
  Save,
  Camera,
  Award,
  Trophy,
  Star,
  TrendingUp,
  Briefcase,
  Clock,
  DollarSign,
  Users,
  MessageSquare,
  ThumbsUp,
  Eye,
  Shield,
  CheckCircle,
  XCircle,
  Upload,
  Download,
  Share2,
  Settings,
  Bell,
  Lock,
  Globe,
  Github,
  Twitter,
  Linkedin,
  ExternalLink,
  FileText,
  Plus,
  Trash2,
  Copy,
  QrCode
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  email: string | null;
  phone?: string | null;
  bio: string | null;
  location: string | null;
  website?: string | null;
  avatar?: string | null;
  coverImage?: string | null;
  joinDate?: string;
  lastActive?: string;
  isVerified?: boolean;
  isOnline?: boolean;

  // Professional Info
  title: string | null;
  company?: string | null;
  experience: string | null;
  skills: string[];
  languages: string[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];

  // Stats
  completedProjects: number;
  totalEarnings: number;
  reputation: number;
  rating: number;
  reviews: number;
  responseRate: number;
  responseTime: string | null;

  // Social Links
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    portfolio?: string;
  };

  // Achievements
  achievements?: {
    id: string;
    name: string;
    icon: string;
    unlockedAt: string;
  }[];

  // Portfolio
  portfolioItems: {
    id: string;
    title: string;
    description: string;
    image?: string;
    link?: string;
    tags: string[];
    completedAt: string;
  }[];

  // Preferences
  preferences: {
    emailNotifications: boolean;
    publicProfile: boolean;
    showEarnings: boolean;
    allowMessages: boolean;
  };
}

export const UserProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real profile from API
  const { data: profile, isLoading, error } = useQuery<UserProfile>({
    queryKey: ['/api/users/profile'],
  });

  // Mutation for updating profile
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const response = await apiRequest('PATCH', '/api/users/profile', updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (profile) {
      setEditedProfile(profile);
    }
  }, [profile]);

  const saveProfile = () => {
    updateMutation.mutate(editedProfile);
  };

  const uploadAvatar = async (file: File) => {
    // In a real app, you would upload to IPFS or S3 and get a URL
    // Here we'll just mock it and save the URL
    const mockUrl = `/avatars/${file.name}`;
    updateMutation.mutate({ avatar: mockUrl });
    setIsAvatarDialogOpen(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading profile...</div>;
  }

  if (error || !profile) {
    return (
      <Card className="p-8 text-center">
        <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <CardTitle>Error Loading Profile</CardTitle>
        <CardDescription>We couldn't load your profile data. Please try again later.</CardDescription>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] })} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-0">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative">
            {profile.coverImage && (
              <img
                src={profile.coverImage}
                alt="Cover"
                className="w-full h-full object-cover opacity-60"
              />
            )}
            <div className="absolute inset-0 bg-black/20" />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Change Cover
            </Button>
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-4 space-y-4 md:space-y-0">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  <AvatarImage src={profile.avatar || undefined} alt={profile.displayName || profile.username} />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                    {(profile.displayName || profile.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => setIsAvatarDialogOpen(true)}
                >
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="md:ml-6 flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-3">
                  <h1 className="text-3xl font-bold tracking-tight">{profile.displayName || profile.username}</h1>
                  <div className="flex items-center space-x-2">
                    {profile.isVerified && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </Badge>
                    )}
                    {profile.isOnline && (
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-lg text-muted-foreground font-medium">@{profile.username}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                  {profile.title && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-1.5" /> {profile.title}
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1.5" /> {profile.location}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1.5" /> Joined {new Date(profile.joinDate || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 w-full md:w-auto mt-4 md:mt-0">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 md:flex-none">
                      Cancel
                    </Button>
                    <Button onClick={saveProfile} disabled={updateMutation.isPending} className="flex-1 md:flex-none shadow-indigo-500/25 shadow-lg bg-indigo-600 hover:bg-indigo-700">
                      {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700">
                      <Edit className="h-4 w-4 mr-2" /> Edit Profile
                    </Button>
                    <Button variant="outline" className="flex-1 md:flex-none">
                      <Share2 className="h-4 w-4 mr-2" /> Share
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-gray-100">
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                  <Globe className="h-4 w-4 mr-2" /> {new URL(profile.website).hostname}
                </a>
              )}
              {profile.socialLinks.github && (
                <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                  <Github className="h-4 w-4 mr-2" /> GitHub
                </a>
              )}
              {profile.socialLinks.twitter && (
                <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-blue-400 hover:text-blue-500 transition-colors">
                  <Twitter className="h-4 w-4 mr-2" /> Twitter
                </a>
              )}
              {profile.socialLinks.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors">
                  <Linkedin className="h-4 w-4 mr-2" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto p-1 bg-gray-100/50 backdrop-blur-sm rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">Overview</TabsTrigger>
          <TabsTrigger value="portfolio" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">Portfolio</TabsTrigger>
          <TabsTrigger value="achievements" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">NFTs</TabsTrigger>
          <TabsTrigger value="stats" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">Stats</TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2" disabled>Reviews</TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-2">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bio & Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-gray-50/50">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-500" /> About
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Display Name</Label>
                          <Input
                            value={editedProfile.displayName || ''}
                            onChange={e => setEditedProfile(p => ({ ...p, displayName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={editedProfile.title || ''}
                            onChange={e => setEditedProfile(p => ({ ...p, title: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Bio</Label>
                        <Textarea
                          value={editedProfile.bio || ''}
                          onChange={e => setEditedProfile(p => ({ ...p, bio: e.target.value }))}
                          rows={4}
                          placeholder="Tell us about yourself..."
                          className="resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {profile.bio || "No bio information provided yet."}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-gray-50/50">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-indigo-500" /> Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.length > 0 ? (
                      profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1 bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 transition-colors">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No skills listed yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-gray-50/50">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-indigo-500" /> Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {profile.education.length > 0 ? (
                      profile.education.map((edu, index) => (
                        <div key={index} className="flex gap-4 relative">
                          {index !== profile.education.length - 1 && (
                            <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-gray-100" />
                          )}
                          <div className="mt-1 h-[24px] w-[24px] rounded-full border-2 border-indigo-500 bg-white z-10" />
                          <div>
                            <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                            <p className="text-indigo-600 font-medium">{edu.institution}</p>
                            <p className="text-sm text-gray-500">{edu.year}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">Educational background hasn't been added.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              <Card className="border-none shadow-md overflow-hidden bg-indigo-600 text-white">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" /> Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="flex justify-between items-center py-2 border-b border-indigo-500/30">
                    <span className="text-indigo-100">Rating</span>
                    <div className="flex items-center space-x-1 font-bold">
                      <Star className="h-4 w-4 fill-current text-yellow-400" />
                      <span>{profile.rating.toFixed(1)} <span className="text-indigo-200 font-normal text-xs ml-1">({profile.reviews})</span></span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-indigo-500/30">
                    <span className="text-indigo-100">Response Rate</span>
                    <span className="font-bold">{profile.responseRate}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-indigo-500/30">
                    <span className="text-indigo-100">Completed Projects</span>
                    <span className="font-bold">{profile.completedProjects}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-indigo-100">Response Time</span>
                    <span className="font-bold">{profile.responseTime || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="bg-gray-50/50">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-indigo-500" /> Web Presence
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-gray-500 font-bold">Personal Website</Label>
                        <Input
                          placeholder="https://yourlink.com"
                          value={editedProfile.website || ''}
                          onChange={e => setEditedProfile(p => ({ ...p, website: e.target.value }))}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-gray-500 font-bold">Twitter URL</Label>
                        <Input
                          placeholder="https://twitter.com/handle"
                          value={editedProfile.socialLinks?.twitter || ''}
                          onChange={e => setEditedProfile(p => ({ ...p, socialLinks: { ...(p.socialLinks || {}), twitter: e.target.value } }))}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-gray-500 font-bold">GitHub URL</Label>
                        <Input
                          placeholder="https://github.com/user"
                          value={editedProfile.socialLinks?.github || ''}
                          onChange={e => setEditedProfile(p => ({ ...p, socialLinks: { ...(p.socialLinks || {}), github: e.target.value } }))}
                          className="h-9"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      {profile.website && (
                        <div className="flex items-center justify-between group">
                          <span className="text-sm text-gray-500">Website</span>
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 truncate max-w-[150px]">{new URL(profile.website).hostname}</a>
                        </div>
                      )}
                      {profile.socialLinks.twitter && (
                        <div className="flex items-center justify-between group">
                          <span className="text-sm text-gray-500">Twitter</span>
                          <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 truncate max-w-[150px]">View Profile</a>
                        </div>
                      )}
                      {profile.socialLinks.github && (
                        <div className="flex items-center justify-between group">
                          <span className="text-sm text-gray-500">GitHub</span>
                          <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 truncate max-w-[150px]">View Profile</a>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900 line-clamp-1">Portfolio Showcase</h3>
              <p className="text-sm text-muted-foreground">Displaying {profile.portfolioItems.length} curated projects</p>
            </div>
            <Button onClick={() => setIsPortfolioDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
              <Plus className="h-4 w-4 mr-2" /> Add Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profile.portfolioItems.length > 0 ? (
              profile.portfolioItems.map((item) => (
                <Card key={item.id} className="overflow-hidden border-none shadow-md group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-48 bg-gray-100 relative overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <FileText className="h-10 w-10 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="sm" asChild className="w-full bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
                        <a href={item.link || '#'} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" /> View Project
                        </a>
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h4 className="font-bold text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-[10px] px-2 py-0 h-5 font-normal uppercase tracking-wider">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && <span className="text-[10px] text-gray-400 font-bold ml-1">+{item.tags.length - 3}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-900">No portfolio items yet</h4>
                <p className="text-sm text-gray-500 mb-6">Start showcasing your work to attract more clients.</p>
                <Button variant="outline" onClick={() => setIsPortfolioDialogOpen(true)}>
                  Upload Your First Project
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6" /> Achievement NFTs
              </CardTitle>
              <CardDescription className="text-white/80">
                Exclusive digital badges earned for your contributions and excellence.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {(profile.achievements || []).length > 0 ? (
                  profile.achievements?.map((achievement) => (
                    <div key={achievement.id} className="text-center group">
                      <div className="relative mx-auto mb-4 h-24 w-24 flex items-center justify-center text-5xl bg-gray-50 rounded-full border-4 border-white shadow-inner group-hover:scale-110 transition-transform duration-300">
                        <div className="absolute inset-[-10px] bg-gradient-to-tr from-yellow-200/50 to-orange-200/50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative z-10">{achievement.icon}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">{achievement.name}</h4>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">
                        {new Date(achievement.unlockedAt).getFullYear()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center bg-gray-50 rounded-xl">
                    <Award className="h-12 w-12 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">Earn your first Achievement NFT by completing projects!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-md group hover:bg-indigo-600 transition-colors duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-indigo-50 group-hover:bg-white/20 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Briefcase className="h-8 w-8 text-indigo-600 group-hover:text-white" />
                </div>
                <div className="text-3xl font-black text-gray-900 group-hover:text-white transition-colors">{profile.completedProjects}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-indigo-100 transition-colors mt-2">Projects</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md group hover:bg-green-600 transition-colors duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-green-50 group-hover:bg-white/20 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                  <DollarSign className="h-8 w-8 text-green-600 group-hover:text-white" />
                </div>
                <div className="text-3xl font-black text-gray-900 group-hover:text-white transition-colors">STX {profile.totalEarnings.toLocaleString()}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-green-100 transition-colors mt-2">Earned</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md group hover:bg-yellow-500 transition-colors duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-yellow-50 group-hover:bg-white/20 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Trophy className="h-8 w-8 text-yellow-600 group-hover:text-white" />
                </div>
                <div className="text-3xl font-black text-gray-900 group-hover:text-white transition-colors">{profile.reputation}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-yellow-50 transition-colors mt-2">Repitation</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md group hover:bg-purple-600 transition-colors duration-300">
              <CardContent className="p-6 text-center">
                <div className="bg-purple-50 group-hover:bg-white/20 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Star className="h-8 w-8 text-purple-600 group-hover:text-white" />
                </div>
                <div className="text-3xl font-black text-gray-900 group-hover:text-white transition-colors">{profile.rating.toFixed(1)}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-purple-100 transition-colors mt-2">Rating</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-gray-50/50">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-500" /> Account Settings
              </CardTitle>
              <CardDescription>
                Manage your credentials and core account information
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={profile.username} disabled className="bg-gray-50" />
                  <p className="text-[10px] text-muted-foreground px-1">Username cannot be changed.</p>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editedProfile.email || ''}
                    onChange={e => setEditedProfile(p => ({ ...p, email: e.target.value }))}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-gray-50' : ''}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-gray-50/50">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-500" /> Privacy & Visibility
              </CardTitle>
              <CardDescription>
                Control what others see on your public profile
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold">Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive updates about project milestones and bids.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={profile.preferences.emailNotifications}
                  onChange={e => updateMutation.mutate({ preferences: { ...profile.preferences, emailNotifications: e.target.checked } })}
                  className="rounded h-4 w-4 text-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold">Public Profile</Label>
                    <p className="text-xs text-muted-foreground">Allow anyone on the network to view your profile.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={profile.preferences.publicProfile}
                  onChange={e => updateMutation.mutate({ preferences: { ...profile.preferences, publicProfile: e.target.checked } })}
                  className="rounded h-4 w-4 text-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-sm font-bold">Show Earnings</Label>
                    <p className="text-xs text-muted-foreground">Display total volume earned from projects.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={profile.preferences.showEarnings}
                  onChange={e => updateMutation.mutate({ preferences: { ...profile.preferences, showEarnings: e.target.checked } })}
                  className="rounded h-4 w-4 text-indigo-600"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Avatar Upload Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Update Avatar</DialogTitle>
            <DialogDescription>
              Represent yourself with a profile picture. High-res PNG/JPG works best.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-2xl p-8 text-center cursor-pointer hover:bg-indigo-50 transition-colors group">
              <input type="file" className="hidden" id="avatar-upload" onChange={e => e.target.files && uploadAvatar(e.target.files[0])} />
              <label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="h-8 w-8 text-indigo-600" />
                </div>
                <p className="text-sm font-bold text-gray-900">Click to upload image</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG or GIF up to 5MB</p>
              </label>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button variant="outline" onClick={() => setIsAvatarDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
