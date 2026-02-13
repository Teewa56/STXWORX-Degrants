import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ShoppingBag, 
  Sell, 
  TrendingUp, 
  Clock, 
  Star, 
  Award, 
  Gem,
  DollarSign,
  Users,
  Filter,
  Search,
  Eye,
  Heart,
  Share2,
  ExternalLink,
  BarChart3,
  Activity,
  Zap,
  Crown,
  Trophy,
  Medal,
  Target,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle,
  AlertCircle,
  Timer,
  Gavel,
  Wallet,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  category: string;
  owner: string;
  ownerAvatar: string;
  price: number;
  currency: 'STX' | 'USD';
  listed: boolean;
  tradable: boolean;
  soulbound: boolean;
  createdAt: string;
  listedAt?: string;
  attributes: {
    type: string;
    value: string;
  }[];
  stats: {
    views: number;
    likes: number;
    offers: number;
    trades: number;
  };
}

interface Trade {
  id: string;
  achievementId: string;
  achievementName: string;
  fromUser: string;
  toUser: string;
  price: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

interface Offer {
  id: string;
  achievementId: string;
  achievementName: string;
  fromUser: string;
  fromUserAvatar: string;
  price: number;
  currency: string;
  message?: string;
  expiresAt: string;
  status: 'active' | 'accepted' | 'rejected' | 'expired';
}

export const AchievementTrading: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [listingPrice, setListingPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          name: 'Early Adopter',
          description: 'One of the first 100 users to join the platform',
          image: 'https://ipfs.io/ipfs/QmEarlyAdopter',
          rarity: 'legendary',
          category: 'Platform',
          owner: '0x1234...5678',
          ownerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=early',
          price: 500,
          currency: 'STX',
          listed: true,
          tradable: true,
          soulbound: false,
          createdAt: '2024-01-15T10:00:00Z',
          listedAt: '2024-01-20T14:30:00Z',
          attributes: [
            { type: 'Tier', value: 'Legendary' },
            { type: 'Series', value: 'Genesis' },
            { type: 'Supply', value: '100' }
          ],
          stats: {
            views: 245,
            likes: 89,
            offers: 12,
            trades: 3
          }
        },
        {
          id: '2',
          name: 'Master Developer',
          description: 'Completed 50+ successful projects with 5-star ratings',
          image: 'https://ipfs.io/ipfs/QmMasterDev',
          rarity: 'epic',
          category: 'Skill',
          owner: '0x2345...6789',
          ownerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master',
          price: 350,
          currency: 'STX',
          listed: true,
          tradable: true,
          soulbound: false,
          createdAt: '2024-01-10T08:00:00Z',
          listedAt: '2024-01-18T16:45:00Z',
          attributes: [
            { type: 'Tier', value: 'Epic' },
            { type: 'Projects', value: '50+' },
            { type: 'Rating', value: '5.0' }
          ],
          stats: {
            views: 189,
            likes: 67,
            offers: 8,
            trades: 2
          }
        },
        {
          id: '3',
          name: 'Community Leader',
          description: 'Helped 100+ community members and received 50+ thanks',
          image: 'https://ipfs.io/ipfs/QmCommunity',
          rarity: 'rare',
          category: 'Social',
          owner: '0x3456...7890',
          ownerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=community',
          price: 200,
          currency: 'STX',
          listed: true,
          tradable: true,
          soulbound: false,
          createdAt: '2024-01-08T12:00:00Z',
          listedAt: '2024-01-19T09:20:00Z',
          attributes: [
            { type: 'Tier', value: 'Rare' },
            { type: 'Impact', value: '100+' },
            { type: 'Recognition', value: '50+' }
          ],
          stats: {
            views: 156,
            likes: 45,
            offers: 5,
            trades: 1
          }
        }
      ];

      const mockTrades: Trade[] = [
        {
          id: '1',
          achievementId: '4',
          achievementName: 'First Million',
          fromUser: '0x4567...8901',
          toUser: '0x5678...9012',
          price: 750,
          currency: 'STX',
          status: 'completed',
          createdAt: '2024-01-19T11:30:00Z',
          completedAt: '2024-01-19T11:35:00Z'
        },
        {
          id: '2',
          achievementId: '5',
          achievementName: 'Speed Demon',
          fromUser: '0x6789...0123',
          toUser: '0x7890...1234',
          price: 150,
          currency: 'STX',
          status: 'pending',
          createdAt: '2024-01-20T15:45:00Z'
        }
      ];

      const mockOffers: Offer[] = [
        {
          id: '1',
          achievementId: '1',
          achievementName: 'Early Adopter',
          fromUser: '0x8901...2345',
          fromUserAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=buyer1',
          price: 450,
          currency: 'STX',
          message: 'Really want this achievement for my collection!',
          expiresAt: '2024-01-25T23:59:59Z',
          status: 'active'
        },
        {
          id: '2',
          achievementId: '2',
          achievementName: 'Master Developer',
          fromUser: '0x9012...3456',
          fromUserAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=buyer2',
          price: 320,
          currency: 'STX',
          expiresAt: '2024-01-24T23:59:59Z',
          status: 'active'
        }
      ];

      setAchievements(mockAchievements);
      setTrades(mockTrades);
      setOffers(mockOffers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load marketplace data",
        variant: "destructive"
      });
    }
  };

  const listAchievement = async (achievementId: string, price: number) => {
    try {
      // API call to list achievement
      setAchievements(prev => prev.map(achievement => 
        achievement.id === achievementId 
          ? { ...achievement, listed: true, price, listedAt: new Date().toISOString() }
          : achievement
      ));
      
      toast({
        title: "Achievement Listed",
        description: "Your achievement has been listed for sale"
      });
      
      setIsListDialogOpen(false);
      setListingPrice('');
    } catch (error) {
      toast({
        title: "Listing Failed",
        description: "Failed to list achievement",
        variant: "destructive"
      });
    }
  };

  const makeOffer = async (achievementId: string, price: number, message?: string) => {
    try {
      // API call to make offer
      const newOffer: Offer = {
        id: Date.now().toString(),
        achievementId,
        achievementName: achievements.find(a => a.id === achievementId)?.name || '',
        fromUser: '0xCurrentUser',
        fromUserAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
        price,
        currency: 'STX',
        message,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active'
      };

      setOffers(prev => [...prev, newOffer]);
      
      toast({
        title: "Offer Sent",
        description: "Your offer has been sent to the owner"
      });
      
      setIsOfferDialogOpen(false);
      setOfferPrice('');
    } catch (error) {
      toast({
        title: "Offer Failed",
        description: "Failed to send offer",
        variant: "destructive"
      });
    }
  };

  const buyAchievement = async (achievementId: string, price: number) => {
    try {
      // API call to buy achievement
      setAchievements(prev => prev.map(achievement => 
        achievement.id === achievementId 
          ? { ...achievement, listed: false, owner: '0xCurrentUser' }
          : achievement
      ));
      
      const newTrade: Trade = {
        id: Date.now().toString(),
        achievementId,
        achievementName: achievements.find(a => a.id === achievementId)?.name || '',
        fromUser: achievements.find(a => a.id === achievementId)?.owner || '',
        toUser: '0xCurrentUser',
        price,
        currency: 'STX',
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      setTrades(prev => [newTrade, ...prev]);
      
      toast({
        title: "Purchase Successful",
        description: "You have successfully purchased the achievement"
      });
      
      setIsBuyDialogOpen(false);
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Failed to purchase achievement",
        variant: "destructive"
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
      case 'legendary': return 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white';
      case 'epic': return 'bg-gradient-to-r from-purple-600 to-blue-600 text-white';
      case 'rare': return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white';
      case 'common': return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return <Gem className="h-4 w-4" />;
      case 'legendary': return <Crown className="h-4 w-4" />;
      case 'epic': return <Trophy className="h-4 w-4" />;
      case 'rare': return <Medal className="h-4 w-4" />;
      case 'common': return <Award className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = filterRarity === 'all' || achievement.rarity === filterRarity;
    const matchesCategory = filterCategory === 'all' || achievement.category === filterCategory;
    const isListed = achievement.listed;
    return matchesSearch && matchesRarity && matchesCategory && isListed;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Achievement Trading</h2>
          <p className="text-muted-foreground">Buy, sell, and trade achievement NFTs</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <ShoppingBag className="h-4 w-4 mr-2" />
            My Collection
          </Button>
        </div>
      </div>

      {/* Marketplace Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{achievements.length}</div>
            <div className="text-sm text-muted-foreground">Listed Items</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">
              {achievements.reduce((sum, a) => sum + a.price, 0).toLocaleString()} STX
            </div>
            <div className="text-sm text-muted-foreground">Total Volume</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{offers.filter(o => o.status === 'active').length}</div>
            <div className="text-sm text-muted-foreground">Active Offers</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{trades.filter(t => t.status === 'completed').length}</div>
            <div className="text-sm text-muted-foreground">Completed Trades</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="trades">Trade History</TabsTrigger>
          <TabsTrigger value="collection">My Collection</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search achievements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterRarity} onValueChange={setFilterRarity}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Rarity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rarities</SelectItem>
                      <SelectItem value="common">Common</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                      <SelectItem value="legendary">Legendary</SelectItem>
                      <SelectItem value="mythic">Mythic</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Platform">Platform</SelectItem>
                      <SelectItem value="Skill">Skill</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Milestone">Milestone</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Recently Listed</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="rarity">Rarity</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marketplace Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAchievements.map((achievement) => (
              <Card key={achievement.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={achievement.image} 
                    alt={achievement.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={getRarityColor(achievement.rarity)}>
                      {getRarityIcon(achievement.rarity)}
                      <span className="ml-1">{achievement.rarity}</span>
                    </Badge>
                  </div>
                  {achievement.soulbound && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />
                        Soulbound
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold mb-1">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {achievement.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <img 
                        src={achievement.ownerAvatar} 
                        alt="Owner"
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-muted-foreground font-mono">
                        {achievement.owner.slice(0, 6)}...{achievement.owner.slice(-4)}
                      </span>
                    </div>
                    <Badge variant="outline">{achievement.category}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-lg font-bold">{achievement.price} {achievement.currency}</div>
                      <div className="text-xs text-muted-foreground">
                        Listed {new Date(achievement.listedAt || '').toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>{achievement.stats.views}</span>
                      <Heart className="h-3 w-3 ml-2" />
                      <span>{achievement.stats.likes}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedAchievement(achievement);
                        setIsBuyDialogOpen(true);
                      }}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedAchievement(achievement);
                        setIsOfferDialogOpen(true);
                      }}
                    >
                      <Gavel className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <div className="space-y-3">
            {offers.map((offer) => (
              <Card key={offer.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={offer.fromUserAvatar} 
                        alt="Buyer"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{offer.achievementName}</h4>
                          <Badge className={getStatusColor(offer.status)}>
                            {offer.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Offer from {offer.fromUser.slice(0, 6)}...{offer.fromUser.slice(-4)}
                        </div>
                        {offer.message && (
                          <div className="text-sm text-blue-600 mt-1">
                            "{offer.message}"
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Expires {new Date(offer.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold">{offer.price} {offer.currency}</div>
                      <div className="flex space-x-2 mt-2">
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <div className="space-y-3">
            {trades.map((trade) => (
              <Card key={trade.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{trade.achievementName}</h4>
                          <Badge className={getStatusColor(trade.status)}>
                            {trade.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {trade.fromUser.slice(0, 6)}...{trade.fromUser.slice(-4)} → {trade.toUser.slice(0, 6)}...{trade.toUser.slice(-4)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(trade.createdAt).toLocaleString()}
                          {trade.completedAt && (
                            <span> • Completed {new Date(trade.completedAt).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold">{trade.price} {trade.currency}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="collection" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Your Achievement Collection</h3>
              <p className="text-muted-foreground mb-4">
                View and manage your achievement NFT collection
              </p>
              <Button>
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet to View
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Buy Dialog */}
      <Dialog open={isBuyDialogOpen} onOpenChange={setIsBuyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Complete the purchase of this achievement NFT
            </DialogDescription>
          </DialogHeader>
          {selectedAchievement && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img 
                  src={selectedAchievement.image} 
                  alt={selectedAchievement.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold">{selectedAchievement.name}</h3>
                  <Badge className={getRarityColor(selectedAchievement.rarity)}>
                    {selectedAchievement.rarity}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Price:</span>
                  <span className="font-bold">{selectedAchievement.price} {selectedAchievement.currency}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Service Fee:</span>
                  <span>{(selectedAchievement.price * 0.025).toFixed(2)} {selectedAchievement.currency}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{(selectedAchievement.price * 1.025).toFixed(2)} {selectedAchievement.currency}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBuyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedAchievement && buyAchievement(selectedAchievement.id, selectedAchievement.price)}>
              Confirm Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offer Dialog */}
      <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
            <DialogDescription>
              Submit an offer to buy this achievement NFT
            </DialogDescription>
          </DialogHeader>
          {selectedAchievement && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img 
                  src={selectedAchievement.image} 
                  alt={selectedAchievement.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold">{selectedAchievement.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Listed at: {selectedAchievement.price} {selectedAchievement.currency}
                  </p>
                </div>
              </div>
              
              <div>
                <Label>Your Offer ({selectedAchievement.currency})</Label>
                <Input
                  type="number"
                  placeholder="Enter your offer"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Message (optional)</Label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Add a message for the owner..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOfferDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedAchievement && makeOffer(selectedAchievement.id, parseFloat(offerPrice))}>
              Submit Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
