import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Trophy, 
  Medal, 
  Star, 
  Award, 
  Crown, 
  CheckCircle, 
  Eye, 
  ExternalLink, 
  Download,
  RefreshCw,
  Gem,
  Shield,
  Sparkles,
  Gift,
  Lock,
  Unlock
  Share2
  Filter
  Search
  Calendar
  TrendingUp
  Users
  Heart
  MessageSquare
  Link
  Image
  FileText
  AlertCircle
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface Achievement {
  id: string;
  userId: string;
  tokenId: number;
  achievementType: 'bronze' | 'silver' | 'gold' | 'platinum' | 'verified';
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  mintedAt: string;
  mintedTxId: string;
  metadata: {
    image: string;
    animation_url: string;
    external_url: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  isTransferable: boolean;
  transferCount: number;
  owner: string;
  ownerName: string;
  ownerAvatar?: string;
  requirements: {
    minProjects?: number;
    minReputation?: number;
    xVerified?: boolean;
    description: string;
  };
  isEligible: boolean;
  missingRequirements?: string[];
}

interface AchievementStats {
  totalAchievements: number;
  uniqueUsers: number;
  recentMints: number;
  achievementsByType: Record<string, number>;
  totalSupply: Record<string, number>;
}

interface AchievementSystemProps {
  currentUserId: string;
  className?: string;
}

export function AchievementSystem({ currentUserId, className }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showAchievementDetails, setShowAchievementDetails] = useState(false);
  const [showMintDialog, setShowMintDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [isMinting, setIsMinting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockAchievements: Achievement[] = [
      {
        id: 'ach_001',
        userId: currentUserId,
        tokenId: 1001,
        achievementType: 'bronze',
        name: 'Bronze Achiever',
        description: 'Completed 10+ projects with good reputation',
        icon: '🥉',
        rarity: 'common',
        mintedAt: '2024-01-10T10:30:00Z',
        mintedTxId: '0xabc123...',
        metadata: {
          image: 'https://ipfs.io/ipfs/QmBronzeAchievement',
          animation_url: 'https://ipfs.io/ipfs/QmBronzeAnimation',
          external_url: 'https://stxworx.com/achievements/bronze',
          attributes: [
            { trait_type: 'tier', value: 'bronze' },
            { trait_type: 'category', value: 'milestone' },
            { trait_type: 'requirement', value: '10_projects' }
          ]
        },
        isTransferable: true,
        transferCount: 0,
        owner: currentUserId,
        ownerName: 'Alice Developer',
        ownerAvatar: '/api/placeholder/40/40',
        requirements: {
          minProjects: 10,
          minReputation: 1000,
          xVerified: false,
          description: 'Complete 10 projects with minimum 1000 reputation'
        },
        isEligible: true
      },
      {
        id: 'ach_002',
        userId: currentUserId,
        tokenId: 1002,
        achievementType: 'silver',
        name: 'Silver Professional',
        description: 'Completed 25+ projects with X verification',
        icon: '🥈',
        rarity: 'rare',
        mintedAt: '2024-01-12T14:20:00Z',
        mintedTxId: '0xdef456...',
        metadata: {
          image: 'https://ipfs.io/ipfs/QmSilverAchievement',
          animation_url: 'https://ipfs.io/ipfs/QmSilverAnimation',
          external_url: 'https://stxworx.com/achievements/silver',
          attributes: [
            { trait_type: 'tier', value: 'silver' },
            { trait_type: 'category', value: 'milestone' },
            { trait_type: 'requirement', value: '25_projects' },
            { trait_type: 'social', value: 'x_verified' }
          ]
        },
        isTransferable: true,
        transferCount: 0,
        owner: currentUserId,
        ownerName: 'Alice Developer',
        ownerAvatar: '/api/placeholder/40/40',
        requirements: {
          minProjects: 25,
          minReputation: 2000,
          xVerified: true,
          description: 'Complete 25 projects with minimum 2000 reputation and X verification'
        },
        isEligible: true
      },
      {
        id: 'ach_003',
        userId: currentUserId,
        tokenId: 1003,
        achievementType: 'gold',
        name: 'Gold Expert',
        description: 'Completed 50+ projects with excellent reputation',
        icon: '🥇',
        rarity: 'epic',
        mintedAt: '2024-01-15T09:15:00Z',
        mintedTxId: '0xghi789...',
        metadata: {
          image: 'https://ipfs.io/ipfs/QmGoldAchievement',
          animation_url: 'https://ipfs.io/ipfs/QmGoldAnimation',
          external_url: 'https://stxworx.com/achievements/gold',
          attributes: [
            { trait_type: 'tier', value: 'gold' },
            { trait_type: 'category', value: 'milestone' },
            { trait_type: 'requirement', value: '50_projects' },
            { trait_type: 'social', value: 'x_verified' }
          ]
        },
        isTransferable: false,
        transferCount: 0,
        owner: currentUserId,
        ownerName: 'Alice Developer',
        ownerAvatar: '/api/placeholder/40/40',
        requirements: {
          minProjects: 50,
          minReputation: 5000,
          xVerified: true,
          description: 'Complete 50 projects with minimum 5000 reputation and X verification'
        },
        isEligible: false,
        missingRequirements: ['Need 40 more projects', 'Need 3000 more reputation']
      },
      {
        id: 'ach_004',
        userId: currentUserId,
        tokenId: 1004,
        achievementType: 'platinum',
        name: 'Platinum Master',
        description: 'Completed 100+ projects with outstanding reputation',
        icon: '🏆',
        rarity: 'legendary',
        mintedAt: '2024-01-18T16:45:00Z',
        mintedTxId: '0xjkl012...',
        metadata: {
          image: 'https://ipfs.io/ipfs/QmPlatinumAchievement',
          animation_url: 'https://ipfs.io/ipfs/QmPlatinumAnimation',
          external_url: 'https://stxworx.com/achievements/platinum',
          attributes: [
            { trait_type: 'tier', value: 'platinum' },
            { trait_type: 'category', value: 'milestone' },
            { trait_type: 'requirement', value: '100_projects' },
            { trait_type: 'social', value: 'x_verified' }
          ]
        },
        isTransferable: false,
        transferCount: 0,
        owner: currentUserId,
        ownerName: 'Alice Developer',
        ownerAvatar: '/api/placeholder/40/40',
        requirements: {
          minProjects: 100,
          minReputation: 10000,
          xVerified: true,
          description: 'Complete 100 projects with minimum 10000 reputation and X verification'
        },
        isEligible: false,
        missingRequirements: ['Need 90 more projects', 'Need 8500 more reputation']
      },
      {
        id: 'ach_005',
        userId: currentUserId,
        tokenId: 1005,
        achievementType: 'verified',
        name: 'X Verified',
        description: 'Verified X (Twitter) account holder',
        icon: '✓',
        rarity: 'common',
        mintedAt: '2024-01-05T11:30:00Z',
        mintedTxId: '0xmno345...',
        metadata: {
          image: 'https://ipfs.io/ipfs/QmVerifiedAchievement',
          animation_url: 'https://ipfs.io/ipfs/QmVerifiedAnimation',
          external_url: 'https://stxworx.com/achievements/verified',
          attributes: [
            { trait_type: 'tier', value: 'verified' },
            { trait_type: 'category', value: 'social' },
            { trait_type: 'platform', value: 'x_twitter' }
          ]
        },
        isTransferable: false,
        transferCount: 0,
        owner: currentUserId,
        ownerName: 'Alice Developer',
        ownerAvatar: '/api/placeholder/40/40',
        requirements: {
          xVerified: true,
          description: 'Verify your X (Twitter) account'
        },
        isEligible: true
      }
    ];

    const mockStats: AchievementStats = {
      totalAchievements: 5,
      uniqueUsers: 1,
      recentMints: 2,
      achievementsByType: {
        bronze: 1,
        silver: 1,
        gold: 1,
        platinum: 1,
        verified: 1
      },
      totalSupply: {
        bronze: 1000,
        silver: 500,
        gold: 100,
        platinum: 50,
        verified: 10000
      }
    };
    
    setAchievements(mockAchievements);
    setStats(mockStats);
    setIsLoading(false);
  }, [currentUserId]);

  // Filter achievements
  const filteredAchievements = searchTerm
    ? achievements.filter(achievement =>
        achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : typeFilter !== 'all'
    ? achievements.filter(achievement => achievement.achievementType === typeFilter)
    : achievements;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierIcon = (type: string) => {
    switch (type) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '🏆';
      case 'verified': return '✓';
      default: return '🏆';
    }
  };

  const getTierColor = (type: string) => {
    switch (type) {
      case 'bronze': return 'bg-orange-100 text-orange-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      handle: 'bg-purple-100 text-purple-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMintAchievement = async (type: string) => {
    setIsMinting(true);
    
    try {
      // TODO: Implement actual API call
      console.log(`Minting ${type} achievement...`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add new achievement
      const newAchievement: Achievement = {
        id: `ach_${Date.now()}`,
        userId: currentUserId,
        tokenId: Date.now(),
        achievementType: type as any,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Achiever`,
        description: `Achievement for ${type} tier`,
        icon: getTierIcon(type),
        rarity: type === 'verified' ? 'common' : type === 'bronze' ? 'common' : type === 'silver' ? 'rare' : type === 'gold' ? 'epic' : 'legendary',
        mintedAt: new Date().toISOString(),
        mintedTxId: `0x${Math.random().toString(36).substr(2, 8)}`,
        metadata: {
          image: `https://ipfs.io/ipfs/Qm${type}Achievement`,
          animation_url: `https://ipfs.io/ipfs/Qm${type}Animation`,
          external_url: `https://stxworx.com/achievements/${type}`,
          attributes: [
            { trait_type: 'tier', value: type },
            { trait_type: 'category', value: 'milestone' }
          ]
        },
        isTransferable: type !== 'verified',
        transferCount: 0,
        owner: currentUserId,
        ownerName: 'Alice Developer',
        ownerAvatar: '/api/placeholder/40/40',
        requirements: {
          minProjects: type === 'verified' ? 0 : undefined,
          minReputation: type === 'verified' ? 0 : undefined,
          xVerified: type === 'verified' ? true : false,
          description: `Achievement for ${type} tier`
        },
        isEligible: true
      };
      
      setAchievements(prev => [...prev, newAchievement]);
      setShowMintDialog(false);
      setSelectedType('');
      
      toast({
        title: "Achievement Minted!",
        description: `${newAchievement.name} has been added to your collection`,
      });
    } catch (error) {
      toast({
        title: "Minting Failed",
        description: "Failed to mint achievement",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  const handleShareAchievement = (achievement: Achievement) => {
    // TODO: Implement sharing functionality
    const shareText = `🎉 Just unlocked the ${achievement.name} achievement on @STXWORX_Degrants! 🚀 #Web3 #Achievement #NFT`;
    
    if (navigator.share) {
      navigator.share({
        title: achievement.name,
        text: shareText,
        url: achievement.metadata.external_url
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`${shareText} ${achievement.metadata.external_url}`);
      toast({
        title: "Link Copied",
        description: "Achievement link copied to clipboard",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Achievement System</CardTitle>
          <CardDescription>Loading achievement data...</CardDescription>
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
                <Trophy className="h-5 w-5 text-yellow-500" />
                Achievement System
              </CardTitle>
              <CardDescription>
                Mint and collect achievement NFTs for your accomplishments
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Gift className="h-4 w-4 mr-2" />
                    Mint Achievement
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mint Achievement</DialogTitle>
                    <DialogDescription>
                      Choose an achievement to mint to your collection
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Achievement Type</Label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select achievement type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bronze">Bronze Achiever</SelectItem>
                          <SelectItem value="silver">Silver Professional</SelectItem>
                          <SelectItem value="gold">Gold Expert</SelectItem>
                          <SelectItem value="platinum">Platinum Master</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleMintAchievement(selectedType)}
                        disabled={!selectedType || isMinting}
                        className="flex-1"
                      >
                        {isMinting ? 'Minting...' : 'Mint Achievement'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowMintDialog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Achievements</p>
                        <p className="text-2xl font-bold">{stats.totalAchievements}</p>
                      </div>
                      <Trophy className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Unique Holders</p>
                        <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Recent Mints</p>
                        <p className="text-2xl font-bold">{stats.recentMints}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Collection Value</p>
                        <p className="text-2xl font-bold">Legendary</p>
                      </div>
                      <Gem className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search achievements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                    achievement.rarity === 'legendary' ? 'ring-2 ring-yellow-400' : ''
                  }`}
                  onClick={() => {
                    setSelectedAchievement(achievement);
                    setShowAchievementDetails(true);
                  }}
                >
                  <div className="relative">
                    {/* Achievement Image */}
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-4xl">{achievement.icon}</div>
                      {achievement.rarity === 'legendary' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent"></div>
                      )}
                    </div>
                    
                    {/* Rarity Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    
                    {/* Transfer Lock */}
                    {!achievement.isTransferable && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary">
                          <Lock className="h-3 w-3 mr-1" />
                          Soul-bound
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold">{achievement.name}</h3>
                        <Badge className={getTierColor(achievement.achievementType)}>
                          {achievement.achievementType}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp">
                        {achievement.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Token #{achievement.tokenId}</span>
                        <span>Minted {formatDate(achievement.mintedAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAchievements.length === 0 && (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No achievements found</p>
                <p className="text-sm text-gray-400 mt-2">
                  Complete milestones to unlock achievements
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Details Dialog */}
      <Dialog open={showAchievementDetails} onOpenChange={setShowAchievementDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-2xl">{selectedAchievement?.icon}</span>
              <DialogTitle>{selectedAchievement?.name}</DialogTitle>
            </DialogTitle>
            <DialogDescription>
              Achievement details and metadata
            </DialogDescription>
          </DialogHeader>
          
          {selectedAchievement && (
            <div className="space-y-6">
              {/* Achievement Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tier</Label>
                  <Badge className={getTierColor(selectedAchievement.achievementType)}>
                    {selectedAchievement.achievementType}
                  </Badge>
                </div>
                <div>
                  <Label>Rarity</Label>
                  <Badge className={getRarityColor(selectedAchievement.rarity)}>
                    {selectedAchievement.rarity}
                  </Badge>
                </div>
                <div>
                  <Label>Token ID</Label>
                  <p className="font-mono">#{selectedAchievement.tokenId}</p>
                </div>
                <div>
                  <Label>Minted Date</Label>
                  <p>{formatDate(selectedAchievement.mintedAt)}</p>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <Label className="text-base font-medium">Requirements</Label>
                <div className="mt-2 p-3 border rounded-lg">
                  <p className="text-sm text-gray-600">{selectedAchievement.requirements.description}</p>
                  <div className="mt-2 space-y-1">
                    {selectedAchievement.requirements.minProjects && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Minimum Projects</span>
                        <Badge variant="outline">
                          {selectedAchievement.requirements.minProjects}
                        </Badge>
                      </div>
                    )}
                    {selectedAchievement.requirements.minReputation && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Minimum Reputation</span>
                        <Badge variant="outline">
                          {selectedAchievement.requirements.minReputation}
                        </Badge>
                      </div>
                    )}
                    {selectedAchievement.requirements.xVerified && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">X Verification</span>
                        <Badge variant="outline">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Required
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div>
                <Label className="text-base font-medium">Metadata</Label>
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>External URL</Label>
                      <a 
                        href={selectedAchievement.metadata.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:underline"
                      >
                      <ExternalLink className="h-4 w-4" />
                      <span className="text-sm truncate">View on IPFS</span>
                    </a>
                    </div>
                    <div>
                      <Label>Transferable</Label>
                      <Badge variant={selectedAchievement.isTransferable ? 'default' : 'secondary'}>
                        {selectedAchievement.isTransferable ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Attributes</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedAchievement.metadata.attributes.map((attr, index) => (
                        <Badge key={index} variant="outline">
                          {attr.trait_type}: {attr.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleShareAchievement(selectedAchievement)}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedAchievement.metadata.external_url);
                    toast({
                      title: "Link Copied",
                      description: "Achievement link copied to clipboard",
                    });
                  }}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AchievementSystem;
