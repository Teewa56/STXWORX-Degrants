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
  Image,
  Video,
  Plus,
  Trash2,
  Copy,
  QrCode
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  phone?: string;
  bio: string;
  location: string;
  website?: string;
  avatar?: string;
  coverImage?: string;
  joinDate: string;
  lastActive: string;
  isVerified: boolean;
  isOnline: boolean;
  
  // Professional Info
  title: string;
  company?: string;
  experience: string;
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
  responseTime: string;
  
  // Social Links
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    portfolio?: string;
  };
  
  // Achievements
  achievements: {
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Mock data - replace with actual API call
      const mockProfile: UserProfile = {
        id: 'user1',
        username: 'johndeveloper',
        displayName: 'John Developer',
        email: 'john@example.com',
        phone: '+1-555-0123',
        bio: 'Full-stack developer with 5+ years of experience in React, Node.js, and blockchain technologies. Passionate about building decentralized applications and contributing to open-source projects.',
        location: 'San Francisco, CA',
        website: 'https://johndeveloper.dev',
        avatar: '/avatars/john.jpg',
        coverImage: '/covers/john-cover.jpg',
        joinDate: '2023-01-15T10:30:00Z',
        lastActive: '2024-01-20T14:22:00Z',
        isVerified: true,
        isOnline: true,
        
        title: 'Senior Full-Stack Developer',
        company: 'TechCorp Inc.',
        experience: '5+ years',
        skills: ['React', 'Node.js', 'TypeScript', 'Blockchain', 'Smart Contracts', 'Web3'],
        languages: ['English (Native)', 'Spanish (Fluent)'],
        education: [
          {
            degree: 'B.S. Computer Science',
            institution: 'Stanford University',
            year: '2018'
          }
        ],
        
        completedProjects: 47,
        totalEarnings: 125000,
        reputation: 4850,
        rating: 4.8,
        reviews: 32,
        responseRate: 98,
        responseTime: '2 hours',
        
        socialLinks: {
          github: 'https://github.com/johndeveloper',
          twitter: 'https://twitter.com/johndeveloper',
          linkedin: 'https://linkedin.com/in/johndeveloper',
          portfolio: 'https://johndeveloper.dev'
        },
        
        achievements: [
          {
            id: 'early_adopter',
            name: 'Early Adopter',
            icon: '🚀',
            unlockedAt: '2023-01-15T10:30:00Z'
          },
          {
            id: 'top_rated',
            name: 'Top Rated',
            icon: '⭐',
            unlockedAt: '2023-06-20T09:15:00Z'
          },
          {
            id: 'quick_responder',
            name: 'Quick Responder',
            icon: '⚡',
            unlockedAt: '2023-03-10T16:45:00Z'
          }
        ],
        
        portfolioItems: [
          {
            id: '1',
            title: 'DeFi Trading Platform',
            description: 'A decentralized trading platform built with React and Solidity',
            image: '/portfolio/defi-platform.jpg',
            link: 'https://defi-platform.example.com',
            tags: ['React', 'Solidity', 'Web3', 'DeFi'],
            completedAt: '2024-01-10T10:30:00Z'
          },
          {
            id: '2',
            title: 'NFT Marketplace',
            description: 'Full-featured NFT marketplace with auction functionality',
            image: '/portfolio/nft-marketplace.jpg',
            link: 'https://nft-marketplace.example.com',
            tags: ['Next.js', 'TypeScript', 'IPFS', 'NFT'],
            completedAt: '2023-11-15T14:20:00Z'
          }
        ],
        
        preferences: {
          emailNotifications: true,
          publicProfile: true,
          showEarnings: false,
          allowMessages: true
        }
      };

      setProfile(mockProfile);
      setEditedProfile(mockProfile);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    }
  };

  const saveProfile = async () => {
    try {
      // API call to save profile
      setProfile(editedProfile);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      // API call to upload avatar
      toast({
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully"
      });
      setIsAvatarDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive"
      });
    }
  };

  const addPortfolioItem = async (item: any) => {
    try {
      // API call to add portfolio item
      toast({
        title: "Portfolio Updated",
        description: "New portfolio item added successfully"
      });
      setIsPortfolioDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add portfolio item",
        variant: "destructive"
      });
    }
  };

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-0">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            {profile.coverImage && (
              <img 
                src={profile.coverImage} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            )}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Cover
            </Button>
          </div>
          
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-12 mb-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white">
                  <AvatarImage src={profile.avatar} alt={profile.displayName} />
                  <AvatarFallback className="text-2xl">
                    {profile.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full"
                  onClick={() => setIsAvatarDialogOpen(true)}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="ml-6 flex-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                  {profile.isVerified && (
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  )}
                  {profile.isOnline && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>
                <p className="text-muted-foreground">@{profile.username}</p>
                <p className="text-sm text-muted-foreground">{profile.title}</p>
                {profile.company && (
                  <p className="text-sm text-muted-foreground">{profile.company}</p>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                  {isEditing ? 'Save' : 'Edit Profile'}
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {profile.website}
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bio & Info */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editedProfile?.bio}
                      onChange={(e) => setEditedProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                      rows={4}
                    />
                  ) : (
                    <p className="text-muted-foreground">{profile.bio}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.education.map((edu, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <h4 className="font-semibold">{edu.degree}</h4>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      <p className="text-sm text-muted-foreground">{edu.year}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Projects</span>
                    <span className="font-semibold">{profile.completedProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{profile.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Response Rate</span>
                    <span className="font-semibold">{profile.responseRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Response Time</span>
                    <span className="font-semibold">{profile.responseTime}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {profile.socialLinks.github && (
                    <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm text-blue-600 hover:underline">
                      <Github className="h-4 w-4" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {profile.socialLinks.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm text-blue-600 hover:underline">
                      <Twitter className="h-4 w-4" />
                      <span>Twitter</span>
                    </a>
                  )}
                  {profile.socialLinks.linkedin && (
                    <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm text-blue-600 hover:underline">
                      <Linkedin className="h-4 w-4" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {profile.socialLinks.portfolio && (
                    <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm text-blue-600 hover:underline">
                      <Globe className="h-4 w-4" />
                      <span>Portfolio</span>
                    </a>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Portfolio</h3>
            <Button onClick={() => setIsPortfolioDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.portfolioItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                {item.image && (
                  <div className="h-48 bg-gray-200">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.completedAt).toLocaleDateString()}
                    </span>
                    {item.link && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>
                Your earned achievements and badges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.achievements.map((achievement) => (
                  <Card key={achievement.id} className="text-center p-4">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <h4 className="font-semibold">{achievement.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Briefcase className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{profile.completedProjects}</div>
                <div className="text-sm text-muted-foreground">Completed Projects</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">${profile.totalEarnings.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Earnings</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold">{profile.reputation}</div>
                <div className="text-sm text-muted-foreground">Reputation Points</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">{profile.rating}</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Reviews</CardTitle>
              <CardDescription>
                What your clients say about your work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Reviews will appear here once clients leave feedback on your projects.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your profile preferences and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your projects
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.preferences.emailNotifications}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your profile visible to everyone
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.preferences.publicProfile}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Earnings</Label>
                  <p className="text-sm text-muted-foreground">
                    Display your total earnings on your profile
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.preferences.showEarnings}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Let other users send you messages
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={profile.preferences.allowMessages}
                  className="rounded"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Avatar Upload Dialog */}
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Avatar</DialogTitle>
            <DialogDescription>
              Upload a new profile picture
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAvatarDialogOpen(false)}>
              Cancel
            </Button>
            <Button>
              Upload Avatar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
