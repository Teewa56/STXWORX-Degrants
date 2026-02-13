import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Trophy, 
  Crown, 
  Gem, 
  Star, 
  Shield,
  Zap,
  Flame,
  Rocket,
  Award,
  Medal,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Gift,
  Lock,
  Unlock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Diamond
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RewardTier {
  id: string;
  name: string;
  level: number;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  minPoints: number;
  maxPoints: number;
  benefits: {
    type: 'percentage' | 'fixed' | 'feature' | 'badge' | 'nft';
    value: string | number;
    description: string;
  }[];
  requirements: {
    type: string;
    value: number;
    description: string;
  }[];
  isUnlocked: boolean;
  currentProgress: number;
  nextTierProgress?: number;
}

interface UserTierProgress {
  currentTier: RewardTier;
  nextTier?: RewardTier;
  currentPoints: number;
  pointsToNext: number;
  totalUsersInTier: number;
  rankInTier: number;
  tierProgress: number;
}

export const RewardTiers: React.FC = () => {
  const [userTierProgress, setUserTierProgress] = useState<UserTierProgress | null>(null);
  const [selectedTier, setSelectedTier] = useState<RewardTier | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadTierProgress();
  }, []);

  const loadTierProgress = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTiers: RewardTier[] = [
        {
          id: 'bronze',
          name: 'Bronze',
          level: 1,
          icon: '🥉',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          description: 'Starting your freelance journey',
          minPoints: 0,
          maxPoints: 499,
          benefits: [
            { type: 'percentage', value: 2, description: '2% fee reduction' },
            { type: 'feature', value: 'basic_profile', description: 'Basic profile customization' },
            { type: 'badge', value: 'bronze_badge', description: 'Bronze achievement badge' }
          ],
          requirements: [
            { type: 'points', value: 0, description: 'Join the platform' }
          ],
          isUnlocked: true,
          currentProgress: 100
        },
        {
          id: 'silver',
          name: 'Silver',
          level: 2,
          icon: '🥈',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          description: 'Building your reputation',
          minPoints: 500,
          maxPoints: 1499,
          benefits: [
            { type: 'percentage', value: 5, description: '5% fee reduction' },
            { type: 'feature', value: 'advanced_profile', description: 'Advanced profile features' },
            { type: 'feature', value: 'priority_support', description: 'Priority customer support' },
            { type: 'badge', value: 'silver_badge', description: 'Silver achievement badge' }
          ],
          requirements: [
            { type: 'points', value: 500, description: 'Earn 500 reputation points' },
            { type: 'projects', value: 5, description: 'Complete 5 projects' }
          ],
          isUnlocked: true,
          currentProgress: 100
        },
        {
          id: 'gold',
          name: 'Gold',
          level: 3,
          icon: '🥇',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          description: 'Established professional',
          minPoints: 1500,
          maxPoints: 4999,
          benefits: [
            { type: 'percentage', value: 10, description: '10% fee reduction' },
            { type: 'feature', value: 'verified_profile', description: 'Verified profile badge' },
            { type: 'feature', value: 'exclusive_projects', description: 'Access to exclusive projects' },
            { type: 'percentage', value: 5, description: '5% bonus on earnings' },
            { type: 'nft', value: 'gold_nft', description: 'Exclusive Gold NFT' }
          ],
          requirements: [
            { type: 'points', value: 1500, description: 'Earn 1,500 reputation points' },
            { type: 'projects', value: 20, description: 'Complete 20 projects' },
            { type: 'rating', value: 4.5, description: 'Maintain 4.5+ star rating' }
          ],
          isUnlocked: false,
          currentProgress: 65,
          nextTierProgress: 35
        },
        {
          id: 'platinum',
          name: 'Platinum',
          level: 4,
          icon: '💎',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          description: 'Elite freelancer',
          minPoints: 5000,
          maxPoints: 14999,
          benefits: [
            { type: 'percentage', value: 15, description: '15% fee reduction' },
            { type: 'feature', value: 'vip_support', description: 'VIP dedicated support' },
            { type: 'feature', value: 'early_access', description: 'Early access to new features' },
            { type: 'percentage', value: 10, description: '10% bonus on earnings' },
            { type: 'nft', value: 'platinum_nft', description: 'Exclusive Platinum NFT' },
            { type: 'feature', value: 'mentorship', description: 'Access to mentorship program' }
          ],
          requirements: [
            { type: 'points', value: 5000, description: 'Earn 5,000 reputation points' },
            { type: 'projects', value: 50, description: 'Complete 50 projects' },
            { type: 'rating', value: 4.8, description: 'Maintain 4.8+ star rating' },
            { type: 'earnings', value: 10000, description: 'Earn $10,000+ total' }
          ],
          isUnlocked: false,
          currentProgress: 0
        },
        {
          id: 'diamond',
          name: 'Diamond',
          level: 5,
          icon: '💠',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          description: 'Top tier professional',
          minPoints: 15000,
          maxPoints: Infinity,
          benefits: [
            { type: 'percentage', value: 20, description: '20% fee reduction' },
            { type: 'feature', value: 'concierge_service', description: 'Personal concierge service' },
            { type: 'feature', value: 'platform_influence', description: 'Influence platform development' },
            { type: 'percentage', value: 15, description: '15% bonus on earnings' },
            { type: 'nft', value: 'diamond_nft', description: 'Exclusive Diamond NFT' },
            { type: 'feature', value: 'advisory_board', description: 'Advisory board access' },
            { type: 'percentage', value: 2, description: 'Revenue sharing program' }
          ],
          requirements: [
            { type: 'points', value: 15000, description: 'Earn 15,000 reputation points' },
            { type: 'projects', value: 100, description: 'Complete 100 projects' },
            { type: 'rating', value: 4.9, description: 'Maintain 4.9+ star rating' },
            { type: 'earnings', value: 50000, description: 'Earn $50,000+ total' },
            { type: 'referrals', value: 25, description: 'Refer 25+ successful freelancers' }
          ],
          isUnlocked: false,
          currentProgress: 0
        }
      ];

      const currentTier = mockTiers[1]; // Silver
      const nextTier = mockTiers[2]; // Gold
      
      const mockUserProgress: UserTierProgress = {
        currentTier,
        nextTier,
        currentPoints: 1350,
        pointsToNext: 150,
        totalUsersInTier: 1250,
        rankInTier: 342,
        tierProgress: 65
      };

      setUserTierProgress(mockUserProgress);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tier progress",
        variant: "destructive"
      });
    }
  };

  const getTierIcon = (tier: RewardTier) => {
    switch (tier.level) {
      case 1: return <Medal className="h-6 w-6" />;
      case 2: return <Award className="h-6 w-6" />;
      case 3: return <Trophy className="h-6 w-6" />;
      case 4: return <Gem className="h-6 w-6" />;
      case 5: return <Crown className="h-6 w-6" />;
      default: return <Star className="h-6 w-6" />;
    }
  };

  const getBenefitIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <DollarSign className="h-4 w-4" />;
      case 'fixed': return <Gift className="h-4 w-4" />;
      case 'feature': return <Zap className="h-4 w-4" />;
      case 'badge': return <Award className="h-4 w-4" />;
      case 'nft': return <Diamond className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  if (!userTierProgress) {
    return <div>Loading reward tiers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reward Tiers</h2>
          <p className="text-muted-foreground">Climb the tiers and unlock exclusive benefits</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={`text-lg px-3 py-1 ${userTierProgress.currentTier.color} ${userTierProgress.currentTier.bgColor} ${userTierProgress.currentTier.borderColor}`}>
            <span className="mr-1">{userTierProgress.currentTier.icon}</span>
            {userTierProgress.currentTier.name} Tier
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="progression">Progression</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Current Tier Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getTierIcon(userTierProgress.currentTier)}
                <span>{userTierProgress.currentTier.name} Tier</span>
              </CardTitle>
              <CardDescription>
                {userTierProgress.currentTier.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">{userTierProgress.currentPoints}</div>
                  <div className="text-sm text-muted-foreground">Current Points</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">#{userTierProgress.rankInTier}</div>
                  <div className="text-sm text-muted-foreground">Rank in Tier</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">{userTierProgress.totalUsersInTier}</div>
                  <div className="text-sm text-muted-foreground">Total in Tier</div>
                </div>
              </div>

              {userTierProgress.nextTier && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress to {userTierProgress.nextTier.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {userTierProgress.pointsToNext} points to go
                    </span>
                  </div>
                  <Progress value={userTierProgress.tierProgress} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{userTierProgress.currentPoints} pts</span>
                    <span>{userTierProgress.nextTier.minPoints} pts</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Tiers Overview */}
          <Card>
            <CardHeader>
              <CardTitle>All Reward Tiers</CardTitle>
              <CardDescription>
                Complete overview of all available reward tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  userTierProgress.currentTier,
                  ...(userTierProgress.nextTier ? [userTierProgress.nextTier] : [])
                ].map((tier) => (
                  <Card 
                    key={tier.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      tier.isUnlocked ? tier.bgColor + ' ' + tier.borderColor : 'opacity-60'
                    }`}
                    onClick={() => {
                      setSelectedTier(tier);
                      setIsDetailDialogOpen(true);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`text-3xl ${tier.isUnlocked ? '' : 'grayscale'}`}>
                            {tier.icon}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{tier.name}</h3>
                              {tier.isUnlocked ? (
                                <Badge variant="outline" className="text-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Unlocked
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Locked
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{tier.description}</p>
                            <div className="text-sm text-muted-foreground">
                              {tier.minPoints.toLocaleString()} - {tier.maxPoints === Infinity ? '∞' : tier.maxPoints.toLocaleString()} points
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{tier.benefits.length} Benefits</div>
                          {tier.currentProgress > 0 && !tier.isUnlocked && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {tier.currentProgress}% complete
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Benefits</CardTitle>
              <CardDescription>
                Benefits you currently enjoy as a {userTierProgress.currentTier.name} member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userTierProgress.currentTier.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="text-green-600 mt-1">
                      {getBenefitIcon(benefit.type)}
                    </div>
                    <div>
                      <div className="font-medium text-green-800">{benefit.description}</div>
                      <div className="text-sm text-green-600">
                        {typeof benefit.value === 'number' && benefit.type === 'percentage' 
                          ? `${benefit.value}%` 
                          : benefit.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {userTierProgress.nextTier && (
            <Card>
              <CardHeader>
                <CardTitle>Next Tier Benefits</CardTitle>
                <CardDescription>
                  Unlock these benefits when you reach {userTierProgress.nextTier.name} tier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userTierProgress.nextTier.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg opacity-75">
                      <div className="text-gray-500 mt-1">
                        {getBenefitIcon(benefit.type)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-700">{benefit.description}</div>
                        <div className="text-sm text-gray-500">
                          {typeof benefit.value === 'number' && benefit.type === 'percentage' 
                            ? `${benefit.value}%` 
                            : benefit.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progression" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tier Progression</CardTitle>
              <CardDescription>
                Your journey through the reward tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Progress Timeline */}
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative z-10 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Bronze Tier</div>
                        <div className="text-sm text-muted-foreground">Completed • 0-499 points</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="relative z-10 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Silver Tier</div>
                        <div className="text-sm text-muted-foreground">Current • 500-1,499 points</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="relative z-10 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Target className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Gold Tier</div>
                        <div className="text-sm text-muted-foreground">
                          {userTierProgress.pointsToNext} points away • 1,500-4,999 points
                        </div>
                        <Progress value={userTierProgress.tierProgress} className="w-full mt-2 h-2" />
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="relative z-10 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Platinum Tier</div>
                        <div className="text-sm text-muted-foreground">Locked • 5,000-14,999 points</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="relative z-10 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Diamond Tier</div>
                        <div className="text-sm text-muted-foreground">Locked • 15,000+ points</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirements Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Next Tier Requirements</h4>
                  {userTierProgress.nextTier?.requirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-blue-700">
                      <ArrowRight className="h-3 w-3" />
                      <span>{req.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tier Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-2xl">{selectedTier?.icon}</span>
              <span>{selectedTier?.name} Tier</span>
            </DialogTitle>
            <DialogDescription>
              {selectedTier?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedTier && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Badge className={`${selectedTier.color} ${selectedTier.bgColor} ${selectedTier.borderColor}`}>
                  {selectedTier.isUnlocked ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Unlocked</>
                  ) : (
                    <><Lock className="h-3 w-3 mr-1" /> Locked</>
                  )}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {selectedTier.minPoints.toLocaleString()} - {selectedTier.maxPoints === Infinity ? '∞' : selectedTier.maxPoints.toLocaleString()} points
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Benefits</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTier.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-blue-600 mt-1">
                        {getBenefitIcon(benefit.type)}
                      </div>
                      <div>
                        <div className="font-medium">{benefit.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {typeof benefit.value === 'number' && benefit.type === 'percentage' 
                            ? `${benefit.value}%` 
                            : benefit.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Requirements</h4>
                <div className="space-y-2">
                  {selectedTier.requirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{req.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!selectedTier.isUnlocked && selectedTier.currentProgress > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Progress</h4>
                    <span className="text-sm text-muted-foreground">
                      {selectedTier.currentProgress}% complete
                    </span>
                  </div>
                  <Progress value={selectedTier.currentProgress} className="h-3" />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
            {selectedTier && !selectedTier.isUnlocked && (
              <Button>
                View Requirements
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
