import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Gem, 
  Crown, 
  Trophy, 
  Medal, 
  Award, 
  Star,
  Sparkles,
  Diamond,
  Shield,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Filter,
  Search,
  Settings,
  Eye,
  Edit,
  Plus,
  Grid,
  List,
  Activity,
  Users,
  Package,
  Calculator,
  Sliders,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RarityTier {
  id: string;
  name: string;
  level: number;
  color: string;
  gradient: string;
  icon: string;
  description: string;
  dropRate: number;
  supply: number;
  maxSupply: number;
  requirements: {
    minPoints: number;
    minAchievements: number;
    specialCriteria?: string;
  };
  benefits: string[];
  attributes: {
    multiplier: number;
    bonusPoints: number;
    exclusiveFeatures: string[];
  };
}

interface AchievementRarity {
  id: string;
  name: string;
  tier: string;
  category: string;
  dropChance: number;
  minted: number;
  maxSupply: number;
  holders: number;
  floorPrice: number;
  currency: string;
  lastUpdated: string;
  attributes: {
    type: string;
    value: string;
    rarity: string;
  }[];
}

interface RarityStats {
  totalAchievements: number;
  totalHolders: number;
  averageFloorPrice: number;
  totalVolume: number;
  distribution: {
    tier: string;
    count: number;
    percentage: number;
  }[];
}

export const AchievementRarity: React.FC = () => {
  const [rarityTiers, setRarityTiers] = useState<RarityTier[]>([]);
  const [achievements, setAchievements] = useState<AchievementRarity[]>([]);
  const [stats, setStats] = useState<RarityStats | null>(null);
  const [selectedTier, setSelectedTier] = useState<RarityTier | null>(null);
  const [activeTab, setActiveTab] = useState('tiers');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadRarityData();
  }, []);

  const loadRarityData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockRarityTiers: RarityTier[] = [
        {
          id: '1',
          name: 'Common',
          level: 1,
          color: '#9CA3AF',
          gradient: 'from-gray-500 to-gray-600',
          icon: '🥉',
          description: 'Basic achievements available to all users',
          dropRate: 45.0,
          supply: 10000,
          maxSupply: 10000,
          requirements: {
            minPoints: 0,
            minAchievements: 0
          },
          benefits: [
            'Basic profile badge',
            'Standard leaderboard access',
            'Community participation'
          ],
          attributes: {
            multiplier: 1.0,
            bonusPoints: 0,
            exclusiveFeatures: []
          }
        },
        {
          id: '2',
          name: 'Rare',
          level: 2,
          color: '#3B82F6',
          gradient: 'from-blue-500 to-cyan-600',
          icon: '🥈',
          description: 'Special achievements for dedicated users',
          dropRate: 30.0,
          supply: 5000,
          maxSupply: 5000,
          requirements: {
            minPoints: 500,
            minAchievements: 5
          },
          benefits: [
            'Enhanced profile badge',
            'Priority support',
            'Exclusive discord channels',
            'Early access to features'
          ],
          attributes: {
            multiplier: 1.2,
            bonusPoints: 50,
            exclusiveFeatures: ['priority_support', 'beta_access']
          }
        },
        {
          id: '3',
          name: 'Epic',
          level: 3,
          color: '#8B5CF6',
          gradient: 'from-purple-500 to-indigo-600',
          icon: '🥇',
          description: 'Exceptional achievements for top performers',
          dropRate: 15.0,
          supply: 2000,
          maxSupply: 2000,
          requirements: {
            minPoints: 2000,
            minAchievements: 15,
            specialCriteria: 'Top 25% leaderboard'
          },
          benefits: [
            'Premium profile badge',
            'VIP support',
            'Exclusive events access',
            'Higher earning rates',
            'Custom profile themes'
          ],
          attributes: {
            multiplier: 1.5,
            bonusPoints: 200,
            exclusiveFeatures: ['vip_support', 'event_access', 'custom_themes']
          }
        },
        {
          id: '4',
          name: 'Legendary',
          level: 4,
          color: '#F59E0B',
          gradient: 'from-yellow-500 to-orange-600',
          icon: '👑',
          description: 'Mythical achievements for elite contributors',
          dropRate: 8.0,
          supply: 500,
          maxSupply: 500,
          requirements: {
            minPoints: 5000,
            minAchievements: 30,
            specialCriteria: 'Top 5% leaderboard'
          },
          benefits: [
            'Legendary profile badge',
            'Dedicated account manager',
            'All previous benefits',
            'Revenue sharing',
            'Governance voting'
          ],
          attributes: {
            multiplier: 2.0,
            bonusPoints: 500,
            exclusiveFeatures: ['account_manager', 'revenue_share', 'governance']
          }
        },
        {
          id: '5',
          name: 'Mythic',
          level: 5,
          color: '#EC4899',
          gradient: 'from-pink-500 to-purple-600',
          icon: '💎',
          description: 'Divine achievements for platform pioneers',
          dropRate: 2.0,
          supply: 100,
          maxSupply: 100,
          requirements: {
            minPoints: 10000,
            minAchievements: 50,
            specialCriteria: 'Top 1% leaderboard + special contribution'
          },
          benefits: [
            'Mythic profile badge',
            'Platform partnership opportunities',
            'All previous benefits',
            'Exclusive NFT drops',
            'Advisory board access'
          ],
          attributes: {
            multiplier: 3.0,
            bonusPoints: 1000,
            exclusiveFeatures: ['partnership', 'exclusive_drops', 'advisory_board']
          }
        }
      ];

      const mockAchievements: AchievementRarity[] = [
        {
          id: '1',
          name: 'First Steps',
          tier: 'Common',
          category: 'Onboarding',
          dropChance: 45.0,
          minted: 8500,
          maxSupply: 10000,
          holders: 8500,
          floorPrice: 10,
          currency: 'STX',
          lastUpdated: '2024-01-20T10:00:00Z',
          attributes: [
            { type: 'Category', value: 'Onboarding', rarity: 'Common' },
            { type: 'Difficulty', value: 'Easy', rarity: 'Common' },
            { type: 'Points', value: '10', rarity: 'Common' }
          ]
        },
        {
          id: '2',
          name: 'Community Builder',
          tier: 'Rare',
          category: 'Social',
          dropChance: 30.0,
          minted: 3200,
          maxSupply: 5000,
          holders: 2800,
          floorPrice: 50,
          currency: 'STX',
          lastUpdated: '2024-01-19T15:30:00Z',
          attributes: [
            { type: 'Category', value: 'Social', rarity: 'Rare' },
            { type: 'Impact', value: 'High', rarity: 'Rare' },
            { type: 'Points', value: '100', rarity: 'Rare' }
          ]
        },
        {
          id: '3',
          name: 'Master Developer',
          tier: 'Epic',
          category: 'Skill',
          dropChance: 15.0,
          minted: 1200,
          maxSupply: 2000,
          holders: 950,
          floorPrice: 200,
          currency: 'STX',
          lastUpdated: '2024-01-18T09:15:00Z',
          attributes: [
            { type: 'Category', value: 'Skill', rarity: 'Epic' },
            { type: 'Expertise', value: 'Expert', rarity: 'Epic' },
            { type: 'Points', value: '500', rarity: 'Epic' }
          ]
        },
        {
          id: '4',
          name: 'Platform Pioneer',
          tier: 'Legendary',
          category: 'Platform',
          dropChance: 8.0,
          minted: 350,
          maxSupply: 500,
          holders: 280,
          floorPrice: 750,
          currency: 'STX',
          lastUpdated: '2024-01-17T14:20:00Z',
          attributes: [
            { type: 'Category', value: 'Platform', rarity: 'Legendary' },
            { type: 'Contribution', value: 'Exceptional', rarity: 'Legendary' },
            { type: 'Points', value: '1000', rarity: 'Legendary' }
          ]
        },
        {
          id: '5',
          name: 'Genesis Creator',
          tier: 'Mythic',
          category: 'Special',
          dropChance: 2.0,
          minted: 45,
          maxSupply: 100,
          holders: 42,
          floorPrice: 2500,
          currency: 'STX',
          lastUpdated: '2024-01-16T11:45:00Z',
          attributes: [
            { type: 'Category', value: 'Special', rarity: 'Mythic' },
            { type: 'Status', value: 'Founder', rarity: 'Mythic' },
            { type: 'Points', value: '2000', rarity: 'Mythic' }
          ]
        }
      ];

      const mockStats: RarityStats = {
        totalAchievements: 13295,
        totalHolders: 12472,
        averageFloorPrice: 156.8,
        totalVolume: 2085000,
        distribution: [
          { tier: 'Common', count: 8500, percentage: 63.9 },
          { tier: 'Rare', count: 3200, percentage: 24.1 },
          { tier: 'Epic', count: 1200, percentage: 9.0 },
          { tier: 'Legendary', count: 350, percentage: 2.6 },
          { tier: 'Mythic', count: 45, percentage: 0.4 }
        ]
      };

      setRarityTiers(mockRarityTiers);
      setAchievements(mockAchievements);
      setStats(mockStats);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load rarity data",
        variant: "destructive"
      });
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'mythic': return <Gem className="h-4 w-4" />;
      case 'legendary': return <Crown className="h-4 w-4" />;
      case 'epic': return <Trophy className="h-4 w-4" />;
      case 'rare': return <Medal className="h-4 w-4" />;
      case 'common': return <Award className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getTierGradient = (tier: string) => {
    const tierData = rarityTiers.find(t => t.name === tier);
    return tierData?.gradient || 'from-gray-500 to-gray-600';
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || achievement.tier === filterTier;
    const matchesCategory = filterCategory === 'all' || achievement.category === filterCategory;
    return matchesSearch && matchesTier && matchesCategory;
  });

  if (!stats) {
    return <div>Loading rarity system...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Achievement Rarity System</h2>
          <p className="text-muted-foreground">Explore achievement tiers and rarity distribution</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Rarity Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{stats.totalAchievements.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Achievements</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{stats.totalHolders.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Unique Holders</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Calculator className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{stats.averageFloorPrice.toFixed(1)} STX</div>
            <div className="text-sm text-muted-foreground">Avg Floor Price</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{(stats.totalVolume / 1000000).toFixed(1)}M STX</div>
            <div className="text-sm text-muted-foreground">Total Volume</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="tiers">Rarity Tiers</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rarityTiers.map((tier) => (
              <Card key={tier.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`h-2 bg-gradient-to-r ${tier.gradient}`}></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{tier.icon}</div>
                      <div>
                        <h3 className="font-bold text-lg">{tier.name}</h3>
                        <Badge variant="outline">Level {tier.level}</Badge>
                      </div>
                    </div>
                    {getTierIcon(tier.name)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Drop Rate:</span>
                      <span className="font-medium">{tier.dropRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Supply:</span>
                      <span className="font-medium">{tier.supply.toLocaleString()} / {tier.maxSupply.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Point Multiplier:</span>
                      <span className="font-medium">×{tier.attributes.multiplier}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Bonus Points:</span>
                      <span className="font-medium">+{tier.attributes.bonusPoints}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Supply Progress</span>
                      <span>{((tier.supply / tier.maxSupply) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(tier.supply / tier.maxSupply) * 100} className="h-2" />
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedTier(tier)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
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
                  <Select value={filterTier} onValueChange={setFilterTier}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="Common">Common</SelectItem>
                      <SelectItem value="Rare">Rare</SelectItem>
                      <SelectItem value="Epic">Epic</SelectItem>
                      <SelectItem value="Legendary">Legendary</SelectItem>
                      <SelectItem value="Mythic">Mythic</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Onboarding">Onboarding</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Skill">Skill</SelectItem>
                      <SelectItem value="Platform">Platform</SelectItem>
                      <SelectItem value="Special">Special</SelectItem>
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

          {/* Achievements Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement) => (
                <Card key={achievement.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`h-2 bg-gradient-to-r ${getTierGradient(achievement.tier)}`}></div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{achievement.name}</h3>
                      <Badge className={`bg-gradient-to-r ${getTierGradient(achievement.tier)} text-white`}>
                        {getTierIcon(achievement.tier)}
                        <span className="ml-1">{achievement.tier}</span>
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Drop Chance:</span>
                        <span className="font-medium">{achievement.dropChance}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Minted:</span>
                        <span className="font-medium">{achievement.minted.toLocaleString()} / {achievement.maxSupply.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Holders:</span>
                        <span className="font-medium">{achievement.holders.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Floor Price:</span>
                        <span className="font-medium">{achievement.floorPrice} {achievement.currency}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Mint Progress</span>
                        <span>{((achievement.minted / achievement.maxSupply) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(achievement.minted / achievement.maxSupply) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAchievements.map((achievement) => (
                <Card key={achievement.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 bg-gradient-to-r ${getTierGradient(achievement.tier)} rounded-lg`}>
                          {getTierIcon(achievement.tier)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">{achievement.name}</h4>
                            <Badge className={`bg-gradient-to-r ${getTierGradient(achievement.tier)} text-white`}>
                              {achievement.tier}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">{achievement.category}</div>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                            <span>Drop: {achievement.dropChance}%</span>
                            <span>Holders: {achievement.holders.toLocaleString()}</span>
                            <span>Floor: {achievement.floorPrice} {achievement.currency}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold">{achievement.floorPrice} {achievement.currency}</div>
                        <div className="text-sm text-muted-foreground">
                          {achievement.minted.toLocaleString()} / {achievement.maxSupply.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Rarity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.distribution.map((dist) => (
                    <div key={dist.tier} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTierIcon(dist.tier)}
                        <div>
                          <div className="font-medium">{dist.tier}</div>
                          <div className="text-sm text-muted-foreground">{dist.count.toLocaleString()} items</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{dist.percentage}%</div>
                        <Progress value={dist.percentage} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Supply Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Supply Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Supply analysis chart will be implemented here</p>
                  <p className="text-sm">Show supply trends and projections</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Rarity Calculator
              </CardTitle>
              <CardDescription>
                Calculate drop chances and probabilities for achievement tiers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Target Achievement</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select achievement" />
                    </SelectTrigger>
                    <SelectContent>
                      {achievements.map((achievement) => (
                        <SelectItem key={achievement.id} value={achievement.id}>
                          {achievement.name} ({achievement.tier})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Number of Attempts</Label>
                  <Input type="number" placeholder="100" defaultValue="100" />
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-3">Probability Calculations</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Single Drop Chance:</span>
                    <span className="font-medium">15.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>At Least One Success:</span>
                    <span className="font-medium">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Drops:</span>
                    <span className="font-medium">15</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost per Drop:</span>
                    <span className="font-medium">~200 STX</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Pro Tip
                </h4>
                <p className="text-sm text-blue-800">
                  Higher tier achievements have lower drop rates but provide better benefits and 
                  higher point multipliers. Consider your goals when choosing which achievements to pursue.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tier Details Dialog */}
      {selectedTier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{selectedTier.icon}</div>
                <div>
                  <h3 className="font-bold text-lg">{selectedTier.name} Tier</h3>
                  <Badge variant="outline">Level {selectedTier.level}</Badge>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedTier(null)}>
                ×
              </Button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedTier.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <div className="space-y-1 text-sm">
                    <div>• Minimum Points: {selectedTier.requirements.minPoints}</div>
                    <div>• Minimum Achievements: {selectedTier.requirements.minAchievements}</div>
                    {selectedTier.requirements.specialCriteria && (
                      <div>• Special: {selectedTier.requirements.specialCriteria}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Attributes</h4>
                  <div className="space-y-1 text-sm">
                    <div>• Point Multiplier: ×{selectedTier.attributes.multiplier}</div>
                    <div>• Bonus Points: +{selectedTier.attributes.bonusPoints}</div>
                    <div>• Drop Rate: {selectedTier.dropRate}%</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Benefits</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedTier.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Supply Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Supply:</span>
                    <span>{selectedTier.supply.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Max Supply:</span>
                    <span>{selectedTier.maxSupply.toLocaleString()}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Mint Progress:</span>
                      <span>{((selectedTier.supply / selectedTier.maxSupply) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(selectedTier.supply / selectedTier.maxSupply) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
