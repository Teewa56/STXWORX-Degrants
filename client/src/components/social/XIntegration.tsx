import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Twitter, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Users, 
  TrendingUp, 
  Award, 
  Settings, 
  RefreshCw,
  Share2,
  Shield,
  Star,
  Eye,
  Link,
  MessageSquare,
  Heart
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface XProfile {
  id: string;
  userId: string;
  handle: string;
  displayName: string;
  verified: boolean;
  followerCount: number;
  followingCount: number;
  tweetCount: number;
  profileImageUrl: string;
  bannerImageUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: string;
  engagementScore: number;
  lastSync: string;
}

interface XIntegrationProps {
  currentUserId: string;
  className?: string;
}

export function XIntegration({ currentUserId, className }: XIntegrationProps) {
  const [profile, setProfile] = useState<XProfile | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [handleInput, setHandleInput] = useState('');
  const [oauthToken, setOAuthToken] = useState('');
  const [oauthTokenSecret, setOAuthTokenSecret] = useState('');
  const [socialSettings, setSocialSettings] = useState({
    autoPostAchievements: true,
    showXProfile: true,
    allowSocialSharing: true,
    syncFollowers: true
  });
  
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockProfile: XProfile = {
      id: 'x_profile_001',
      userId: currentUserId,
      handle: 'alice_dev',
      displayName: 'Alice Developer',
      verified: true,
      followerCount: 12500,
      followingCount: 890,
      tweetCount: 3420,
      profileImageUrl: '/api/placeholder/200/200',
      bannerImageUrl: '/api/placeholder/800/200',
      bio: 'Full-stack developer | Web3 enthusiast | Building the future of freelance work 🚀',
      location: 'San Francisco, CA',
      website: 'https://alice.dev',
      createdAt: '2020-03-15T10:30:00Z',
      engagementScore: 8500,
      lastSync: '2024-01-15T14:20:00Z'
    };
    
    // Simulate checking if user has X integration
    const hasIntegration = Math.random() > 0.5;
    if (hasIntegration) {
      setProfile(mockProfile);
      setIsConnected(true);
    }
  }, [currentUserId]);

  const handleConnectX = async () => {
    setIsConnecting(true);
    
    try {
      // TODO: Implement actual OAuth flow
      console.log('Starting X OAuth flow...');
      
      // Simulate OAuth process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful OAuth
      const mockProfile: XProfile = {
        id: 'x_profile_002',
        userId: currentUserId,
        handle: handleInput,
        displayName: handleInput.charAt(0).toUpperCase() + handleInput.slice(1),
        verified: false,
        followerCount: Math.floor(Math.random() * 10000),
        followingCount: Math.floor(Math.random() * 1000),
        tweetCount: Math.floor(Math.random() * 5000),
        profileImageUrl: '/api/placeholder/200/200',
        bio: 'New to the platform!',
        createdAt: new Date().toISOString(),
        engagementScore: Math.floor(Math.random() * 10000),
        lastSync: new Date().toISOString()
      };
      
      setProfile(mockProfile);
      setIsConnected(true);
      setShowConnectDialog(false);
      setHandleInput('');
      
      toast({
        title: "X Account Connected",
        description: `Successfully connected @${mockProfile.handle}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect X account",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectX = async () => {
    try {
      // TODO: Implement actual API call
      console.log('Disconnecting X account...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfile(null);
      setIsConnected(false);
      
      toast({
        title: "X Account Disconnected",
        description: "Your X account has been disconnected",
      });
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect X account",
        variant: "destructive",
      });
    }
  };

  const handleVerifyProfile = async () => {
    setIsVerifying(true);
    
    try {
      // TODO: Implement actual verification API call
      console.log('Verifying X profile...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update profile to verified
      if (profile) {
        setProfile({
          ...profile,
          verified: true,
          followerCount: profile.followerCount + Math.floor(Math.random() * 1000),
          engagementScore: profile.engagementScore + 1000
        });
        
        toast({
          title: "Profile Verified",
          description: `@${profile.handle} is now verified`,
        });
        
        // Mint verified NFT
        toast({
          title: "Achievement Unlocked",
          description: "X Verified NFT has been minted to your profile",
        });
      }
      
      setShowVerificationDialog(false);
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Failed to verify X profile",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSyncProfile = async () => {
    try {
      // TODO: Implement actual sync API call
      console.log('Syncing X profile...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (profile) {
        setProfile({
          ...profile,
          followerCount: profile.followerCount + Math.floor(Math.random() * 100),
          engagementScore: profile.engagementScore + Math.floor(Math.random() * 100),
          lastSync: new Date().toISOString()
        });
        
        toast({
          title: "Profile Synced",
          description: "Your X profile has been updated",
        });
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync X profile",
        variant: "destructive",
      });
    }
  };

  const handleShareAchievement = async (achievementType: string) => {
    if (!profile || !socialSettings.autoPostAchievements) return;
    
    try {
      // TODO: Implement actual X API call
      console.log(`Sharing ${achievementType} achievement to X...`);
      
      const tweetText = `🎉 Just unlocked the ${achievementType} achievement on @STXWORX_Degrants! 🚀 #Web3 #Freelance #Achievement`;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Shared to X",
        description: "Achievement posted to your X profile",
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Failed to share achievement to X",
        variant: "destructive",
      });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Twitter className="h-5 w-5 text-blue-500" />
                X (Twitter) Integration
              </CardTitle>
              <CardDescription>
                Connect your X account for social verification and rewards
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {isConnected && (
                <Button variant="outline" size="sm" onClick={handleSyncProfile}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isConnected ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {isConnected ? (
                    <Twitter className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Twitter className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">
                    {isConnected ? 'X Account Connected' : 'Connect X Account'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isConnected 
                      ? `@${profile?.handle} • ${formatNumber(profile?.followerCount || 0)} followers`
                      : 'Connect to unlock social verification and rewards'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {!isConnected ? (
                  <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Twitter className="h-4 w-4 mr-2" />
                        Connect X
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Connect X Account</DialogTitle>
                        <DialogDescription>
                          Connect your X (Twitter) account to enable social verification
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="handle">X Handle</Label>
                          <Input
                            id="handle"
                            placeholder="@yourhandle"
                            value={handleInput}
                            onChange={(e) => setHandleInput(e.target.value)}
                            className="mt-1"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Enter your X username without the @ symbol
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            onClick={handleConnectX}
                            disabled={isConnecting || !handleInput}
                            className="flex-1"
                          >
                            {isConnecting ? 'Connecting...' : 'Connect Account'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowConnectDialog(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleDisconnectX}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                    
                    {!profile?.verified && (
                      <Dialog open={showVerificationDialog && selectedUser?.id === currentUserId} onOpenChange={setShowVerificationDialog}>
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedUser(profile)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Verify X Profile</DialogTitle>
                            <DialogDescription>
                              Verify your X account to unlock the Verified achievement badge
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <Alert>
                              <Shield className="h-4 w-4" />
                              <AlertDescription>
                                Verification confirms your X account is authentic and boosts your social score.
                              This will mint a special "X Verified" NFT achievement badge.
                              </AlertDescription>
                            </Alert>
                            
                            <div className="p-4 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={profile?.profileImageUrl} />
                                  <AvatarFallback>
                                    {profile?.handle?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">@{profile?.handle}</p>
                                  <p className="text-sm text-gray-500">{profile?.displayName}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline">
                                      {formatNumber(profile?.followerCount || 0)} followers
                                    </Badge>
                                    <Badge variant="outline">
                                      {formatNumber(profile?.engagementScore || 0)} score
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button 
                                onClick={handleVerifyProfile}
                                disabled={isVerifying}
                                className="flex-1"
                              >
                                {isVerifying ? 'Verifying...' : 'Verify Profile'}
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setShowVerificationDialog(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Profile Details */}
            {isConnected && profile && (
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="social">Social</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Header */}
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg"></div>
                        <div className="absolute -bottom-8 left-4">
                          <Avatar className="h-16 w-16 border-4 border-white">
                            <AvatarImage src={profile.profileImageUrl} />
                            <AvatarFallback className="text-lg">
                              {profile.handle.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                      
                      <div className="mt-8 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xl font-bold">{profile.displayName}</h3>
                          {profile.verified && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600">@{profile.handle}</p>
                        {profile.bio && (
                          <p className="text-sm text-gray-600">{profile.bio}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {profile.location && (
                            <span>📍 {profile.location}</span>
                          )}
                          {profile.website && (
                            <a 
                              href={profile.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-blue-600 hover:underline"
                            >
                              <Link className="h-3 w-3" />
                              Website
                            </a>
                          )}
                          <span>📅 Joined {formatDate(profile.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Profile Statistics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Followers</span>
                            <Users className="h-4 w-4 text-gray-400" />
                          </div>
                          <p className="text-2xl font-bold">{formatNumber(profile.followerCount)}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Following</span>
                            <Users className="h-4 w-4 text-gray-400" />
                          </div>
                          <p className="text-2xl font-bold">{formatNumber(profile.followingCount)}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Tweets</span>
                            <MessageSquare className="h-4 w-4 text-gray-400" />
                          </div>
                          <p className="text-2xl font-bold">{formatNumber(profile.tweetCount)}</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Score</span>
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                          </div>
                          <p className="text-2xl font-bold">{formatNumber(profile.engagementScore)}</p>
                        </div>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Last Sync</span>
                          <RefreshCw className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-sm">{formatDate(profile.lastSync)}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="social" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Social Features</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Auto-Post Achievements</span>
                          <Badge variant={socialSettings.autoPostAchievements ? 'default' : 'secondary'}>
                            {socialSettings.autoPostAchievements ? 'On' : 'Off'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Automatically share new achievements to X
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Share2 className="h-4 w-4 mr-2" />
                          Test Post
                        </Button>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Show X Profile</span>
                          <Badge variant={socialSettings.showXProfile ? 'default' : 'secondary'}>
                            {socialSettings.showXProfile ? 'On' : 'Off'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Display X profile on your public profile
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Social Sharing</span>
                          <Badge variant={socialSettings.allowSocialSharing ? 'default' : 'secondary'}>
                            {socialSettings.allowSocialSharing ? 'On' : 'Off'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Allow sharing achievements to social media
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Sync Followers</span>
                          <Badge variant={socialSettings.syncFollowers ? 'default' : 'secondary'}>
                            {socialSettings.syncFollowers ? 'On' : 'Off'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Sync follower count with leaderboard
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button onClick={() => handleShareAchievement('bronze')} className="w-full">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Bronze Achievement
                      </Button>
                      <Button onClick={() => handleShareAchievement('silver')} variant="outline" className="w-full">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Silver Achievement
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="achievements" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">X-Based Achievements</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-4 border rounded-lg ${
                        profile.verified ? 'border-green-200 bg-green-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Award className="h-5 w-5 text-blue-500" />
                            <span className="font-medium">X Verified</span>
                          </div>
                          {profile.verified && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {profile.verified 
                            ? 'Your X account has been verified' 
                            : 'Verify your X account to unlock this achievement'
                          }
                        </p>
                        {!profile.verified && (
                          <Button 
                            onClick={() => setShowVerificationDialog(true)}
                            size="sm"
                            className="w-full"
                          >
                            Verify Now
                          </Button>
                        )}
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <span className="font-medium">Social Influence</span>
                          </div>
                          <Badge variant="outline">
                            {profile.engagementScore > 5000 ? 'Gold' : 
                             profile.engagementScore > 2000 ? 'Silver' : 'Bronze'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Score: {profile.engagementScore} • High social influence
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">X Integration Settings</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auto-Post Achievements</p>
                          <p className="text-sm text-gray-600">
                            Automatically share new achievements to your X profile
                          </p>
                        </div>
                        <Button
                          variant={socialSettings.autoPostAchievements ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSocialSettings(prev => ({
                            ...prev,
                            autoPostAchievements: !prev.autoPostAchievements
                          }))}
                        >
                          {socialSettings.autoPostAchievements ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Show X Profile</p>
                          <p className="text-sm text-gray-600">
                            Display your X profile on your public profile
                          </p>
                        </div>
                        <Button
                          variant={socialSettings.showXProfile ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSocialSettings(prev => ({
                            ...prev,
                            showXProfile: !prev.showXProfile
                          }))}
                        >
                          {socialSettings.showXProfile ? 'Visible' : 'Hidden'}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Social Sharing</p>
                          <p className="text-sm text-gray-600">
                            Allow sharing achievements to social media
                          </p>
                        </div>
                        <Button
                          variant={socialSettings.allowSocialSharing ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSocialSettings(prev => ({
                            ...prev,
                            allowSocialSharing: !prev.allowSocialSharing
                          }))}
                        >
                          {socialSettings.allowSocialSharing ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Sync Followers</p>
                          <p className="text-sm text-gray-600">
                            Sync follower count with leaderboard scoring
                          </p>
                        </div>
                        <Button
                          variant={socialSettings.syncFollowers ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSocialSettings(prev => ({
                            ...prev,
                            syncFollowers: !prev.syncFollowers
                          }))}
                        >
                          {socialSettings.syncFollowers ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default XIntegration;
