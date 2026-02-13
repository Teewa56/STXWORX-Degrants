import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trophy, 
  Star, 
  Gem, 
  Crown,
  Shield,
  Zap,
  Flame,
  Rocket,
  Award,
  Medal,
  Diamond,
  Eye,
  Share2,
  Download,
  Heart,
  MessageSquare,
  ExternalLink,
  Filter,
  Search,
  Grid,
  List,
  Calendar,
  TrendingUp,
  Users,
  QrCode,
  Copy,
  MoreVertical,
  Lock,
  Unlock,
  CheckCircle,
  Clock,
  Image,
  Video,
  Music
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NFTAchievement {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  animationUrl?: string;
  category: 'project' | 'social' | 'skill' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isTransferable: boolean;
  isSoulBound: boolean;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  mintedAt: string;
  mintPrice: string;
  currentPrice?: string;
  attributes: {
    trait_type: string;
    value: string;
    rarity?: string;
  }[];
  stats: {
    views: number;
    likes: number;
    shares: number;
    offers: number;
  };
  blockchain: {
    contract: string;
    network: string;
    tokenId: string;
    transactionHash: string;
  };
  ipfs: {
    image: string;
    metadata: string;
  };
}

interface GalleryStats {
  totalNFTs: number;
  totalValue: string;
  uniqueCollectors: number;
  totalViews: number;
  topCollections: {
    name: string;
    count: number;
    value: string;
  }[];
}

export const AchievementGallery: React.FC = () => {
  const [nfts, setNfts] = useState<NFTAchievement[]>([]);
  const [galleryStats, setGalleryStats] = useState<GalleryStats | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFTAchievement | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'rarity' | 'value' | 'popular'>('recent');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadGalleryData();
  }, []);

  const loadGalleryData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockNFTs: NFTAchievement[] = [
        {
          id: '1',
          tokenId: '1001',
          name: 'Early Adopter Badge',
          description: 'Awarded to the first 100 users who joined the platform',
          image: '/nfts/early-adopter.png',
          category: 'special',
          rarity: 'legendary',
          isTransferable: false,
          isSoulBound: true,
          owner: {
            id: 'user1',
            name: 'John Developer',
            avatar: '/avatars/john.jpg'
          },
          creator: {
            id: 'platform',
            name: 'STXWORX',
            avatar: '/logo.png'
          },
          mintedAt: '2023-12-01T00:00:00Z',
          mintPrice: '0',
          attributes: [
            { trait_type: 'Generation', value: 'Genesis', rarity: 'legendary' },
            { trait_type: 'Tier', value: 'Founding Member', rarity: 'legendary' },
            { trait_type: 'Special', value: 'Soul Bound', rarity: 'unique' }
          ],
          stats: {
            views: 1250,
            likes: 89,
            shares: 12,
            offers: 0
          },
          blockchain: {
            contract: '0x1234...5678',
            network: 'Stacks Mainnet',
            tokenId: '1001',
            transactionHash: '0xabcd...efgh'
          },
          ipfs: {
            image: 'QmHash1',
            metadata: 'QmHash2'
          }
        },
        {
          id: '2',
          tokenId: '1002',
          name: 'Top Performer',
          description: 'Achieved top 10% performance for 3 consecutive months',
          image: '/nfts/top-performer.png',
          animationUrl: '/nfts/top-performer.mp4',
          category: 'milestone',
          rarity: 'epic',
          isTransferable: true,
          isSoulBound: false,
          owner: {
            id: 'user1',
            name: 'John Developer',
            avatar: '/avatars/john.jpg'
          },
          creator: {
            id: 'platform',
            name: 'STXWORX',
            avatar: '/logo.png'
          },
          mintedAt: '2024-01-15T10:30:00Z',
          mintPrice: '0.001 STX',
          currentPrice: '0.005 STX',
          attributes: [
            { trait_type: 'Performance', value: 'Top 10%', rarity: 'epic' },
            { trait_type: 'Duration', value: '3 Months', rarity: 'rare' },
            { trait_type: 'Edition', value: 'Limited', rarity: 'epic' }
          ],
          stats: {
            views: 890,
            likes: 67,
            shares: 8,
            offers: 3
          },
          blockchain: {
            contract: '0x1234...5678',
            network: 'Stacks Mainnet',
            tokenId: '1002',
            transactionHash: '0xijkl...mnop'
          },
          ipfs: {
            image: 'QmHash3',
            metadata: 'QmHash4'
          }
        },
        {
          id: '3',
          tokenId: '1003',
          name: 'Blockchain Expert',
          description: 'Completed 10+ blockchain projects with perfect ratings',
          image: '/nfts/blockchain-expert.png',
          category: 'skill',
          rarity: 'rare',
          isTransferable: true,
          isSoulBound: false,
          owner: {
            id: 'user1',
            name: 'John Developer',
            avatar: '/avatars/john.jpg'
          },
          creator: {
            id: 'platform',
            name: 'STXWORX',
            avatar: '/logo.png'
          },
          mintedAt: '2024-01-20T14:22:00Z',
          mintPrice: '0.0005 STX',
          currentPrice: '0.002 STX',
          attributes: [
            { trait_type: 'Skill', value: 'Blockchain', rarity: 'rare' },
            { trait_type: 'Projects', value: '10+', rarity: 'rare' },
            { trait_type: 'Rating', value: '5 Stars', rarity: 'rare' }
          ],
          stats: {
            views: 567,
            likes: 45,
            shares: 5,
            offers: 1
          },
          blockchain: {
            contract: '0x1234...5678',
            network: 'Stacks Mainnet',
            tokenId: '1003',
            transactionHash: '0xqrst...uvwx'
          },
          ipfs: {
            image: 'QmHash5',
            metadata: 'QmHash6'
          }
        }
      ];

      const mockStats: GalleryStats = {
        totalNFTs: 3,
        totalValue: '0.007 STX',
        uniqueCollectors: 1,
        totalViews: 2707,
        topCollections: [
          { name: 'STXWORX Achievements', count: 3, value: '0.007 STX' }
        ]
      };

      setNfts(mockNFTs);
      setGalleryStats(mockStats);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load gallery data",
        variant: "destructive"
      });
    }
  };

  const getRarityColor = (rarity: NFTAchievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getRarityGradient = (rarity: NFTAchievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
    }
  };

  const getCategoryIcon = (category: NFTAchievement['category']) => {
    switch (category) {
      case 'project': return <Trophy className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'skill': return <Star className="h-4 w-4" />;
      case 'milestone': return <Award className="h-4 w-4" />;
      case 'special': return <Crown className="h-4 w-4" />;
    }
  };

  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nft.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || nft.category === filterCategory;
    const matchesRarity = filterRarity === 'all' || nft.rarity === filterRarity;
    return matchesSearch && matchesCategory && matchesRarity;
  });

  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.mintedAt).getTime() - new Date(a.mintedAt).getTime();
      case 'rarity':
        const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      case 'value':
        const aValue = parseFloat(a.currentPrice || a.mintPrice);
        const bValue = parseFloat(b.currentPrice || b.mintPrice);
        return bValue - aValue;
      case 'popular':
        return b.stats.views - a.stats.views;
      default:
        return 0;
    }
  });

  const shareNFT = async (nft: NFTAchievement) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: nft.name,
          text: nft.description,
          url: window.location.href + `/nft/${nft.id}`
        });
      } else {
        await navigator.clipboard.writeText(window.location.href + `/nft/${nft.id}`);
        toast({
          title: "Link Copied",
          description: "NFT link copied to clipboard"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share NFT",
        variant: "destructive"
      });
    }
  };

  if (!galleryStats) {
    return <div>Loading gallery...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Achievement Gallery</h2>
          <p className="text-muted-foreground">Showcase your NFT achievements</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Gem className="h-4 w-4 mr-1" />
            {galleryStats.totalNFTs} NFTs
          </Badge>
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Trophy className="h-4 w-4 mr-1" />
            {galleryStats.totalValue}
          </Badge>
        </div>
      </div>

      {/* Gallery Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Gem className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{galleryStats.totalNFTs}</div>
            <div className="text-sm text-muted-foreground">Total NFTs</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{galleryStats.totalValue}</div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{galleryStats.uniqueCollectors}</div>
            <div className="text-sm text-muted-foreground">Collectors</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Eye className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{galleryStats.totalViews.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search NFTs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="skill">Skills</SelectItem>
                  <SelectItem value="milestone">Milestones</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterRarity} onValueChange={setFilterRarity}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Rarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rarities</SelectItem>
                  <SelectItem value="common">Common</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="epic">Epic</SelectItem>
                  <SelectItem value="legendary">Legendary</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="rarity">Rarity</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NFT Gallery */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedNFTs.map((nft) => (
            <Card 
              key={nft.id} 
              className="cursor-pointer transition-all hover:shadow-lg overflow-hidden group"
              onClick={() => {
                setSelectedNFT(nft);
                setIsDetailDialogOpen(true);
              }}
            >
              <div className="relative">
                <div className="aspect-square bg-gray-100">
                  {nft.animationUrl ? (
                    <video 
                      src={nft.animationUrl} 
                      autoPlay 
                      loop 
                      muted 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={nft.image} 
                      alt={nft.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  )}
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  {nft.isSoulBound && (
                    <Badge variant="secondary" className="text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Soul Bound
                    </Badge>
                  )}
                  <Badge className={getRarityColor(nft.rarity)}>
                    {nft.rarity}
                  </Badge>
                </div>
                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); shareNFT(nft); }}>
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold mb-1 truncate">{nft.name}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {nft.description}
                </p>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    {getCategoryIcon(nft.category)}
                    <span className="text-xs text-muted-foreground">{nft.category}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Eye className="h-3 w-3 inline mr-1" />
                    {nft.stats.views}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      {nft.currentPrice || nft.mintPrice} STX
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {nft.currentPrice ? 'Current' : 'Mint'} Price
                    </div>
                  </div>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={nft.owner.avatar} alt={nft.owner.name} />
                    <AvatarFallback className="text-xs">
                      {nft.owner.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedNFTs.map((nft) => (
            <Card 
              key={nft.id} 
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => {
                setSelectedNFT(nft);
                setIsDetailDialogOpen(true);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {nft.animationUrl ? (
                      <video 
                        src={nft.animationUrl} 
                        autoPlay 
                        loop 
                        muted 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img 
                        src={nft.image} 
                        alt={nft.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">{nft.name}</h3>
                      <Badge className={getRarityColor(nft.rarity)}>
                        {nft.rarity}
                      </Badge>
                      {nft.isSoulBound && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="h-3 w-3 mr-1" />
                          Soul Bound
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {nft.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(nft.category)}
                        <span>{nft.category}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{nft.stats.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{nft.stats.likes}</span>
                      </div>
                      <div>
                        Minted {new Date(nft.mintedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {nft.currentPrice || nft.mintPrice} STX
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {nft.currentPrice ? 'Current' : 'Mint'} Price
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={nft.owner.avatar} alt={nft.owner.name} />
                        <AvatarFallback className="text-xs">
                          {nft.owner.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{nft.owner.name}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* NFT Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>{selectedNFT?.name}</span>
              {selectedNFT && (
                <Badge className={getRarityColor(selectedNFT.rarity)}>
                  {selectedNFT.rarity}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedNFT?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedNFT && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Media */}
              <div>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {selectedNFT.animationUrl ? (
                    <video 
                      src={selectedNFT.animationUrl} 
                      autoPlay 
                      loop 
                      muted 
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={selectedNFT.image} 
                      alt={selectedNFT.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => shareNFT(selectedNFT)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                </div>
              </div>
              
              {/* Details */}
              <div className="space-y-6">
                {/* Price and Owner */}
                <div>
                  <h4 className="font-semibold mb-2">Price & Ownership</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Price</span>
                      <span className="font-medium">
                        {selectedNFT.currentPrice || selectedNFT.mintPrice} STX
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Owner</span>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={selectedNFT.owner.avatar} alt={selectedNFT.owner.name} />
                          <AvatarFallback className="text-xs">
                            {selectedNFT.owner.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{selectedNFT.owner.name}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Creator</span>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={selectedNFT.creator.avatar} alt={selectedNFT.creator.name} />
                          <AvatarFallback className="text-xs">
                            {selectedNFT.creator.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{selectedNFT.creator.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Properties */}
                <div>
                  <h4 className="font-semibold mb-2">Properties</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedNFT.attributes.map((attr, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="font-medium">{attr.trait_type}</div>
                        <div className="text-muted-foreground">{attr.value}</div>
                        {attr.rarity && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {attr.rarity}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <h4 className="font-semibold mb-2">Stats</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <Eye className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                      <div className="font-bold">{selectedNFT.stats.views}</div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <Heart className="h-5 w-5 mx-auto mb-1 text-red-600" />
                      <div className="font-bold">{selectedNFT.stats.likes}</div>
                      <div className="text-xs text-muted-foreground">Likes</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <Share2 className="h-5 w-5 mx-auto mb-1 text-green-600" />
                      <div className="font-bold">{selectedNFT.stats.shares}</div>
                      <div className="text-xs text-muted-foreground">Shares</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <MessageSquare className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                      <div className="font-bold">{selectedNFT.stats.offers}</div>
                      <div className="text-xs text-muted-foreground">Offers</div>
                    </div>
                  </div>
                </div>

                {/* Blockchain Info */}
                <div>
                  <h4 className="font-semibold mb-2">Blockchain</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network</span>
                      <span>{selectedNFT.blockchain.network}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Token ID</span>
                      <span className="font-mono">{selectedNFT.blockchain.tokenId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contract</span>
                      <span className="font-mono text-xs">{selectedNFT.blockchain.contract}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction</span>
                      <span className="font-mono text-xs">{selectedNFT.blockchain.transactionHash}</span>
                    </div>
                  </div>
                </div>

                {/* Transfer Status */}
                <div>
                  <h4 className="font-semibold mb-2">Transfer Status</h4>
                  <div className="flex items-center space-x-2">
                    {selectedNFT.isSoulBound ? (
                      <>
                        <Lock className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-600">Soul Bound - Cannot be transferred</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Transferable</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
            {selectedNFT && !selectedNFT.isSoulBound && (
              <Button>
                Make Offer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
