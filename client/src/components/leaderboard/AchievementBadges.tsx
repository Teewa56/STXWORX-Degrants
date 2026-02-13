import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Trophy, 
  Medal, 
  Award, 
  Star, 
  Target,
  Crown,
  Gem,
  Shield,
  Zap,
  Flame,
  Rocket,
  Heart,
  ThumbsUp,
  CheckCircle,
  Lock,
  Unlock,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Code,
  Briefcase,
  Clock,
  MessageSquare,
  Eye,
  Share2,
  Download,
  Filter,
  Search,
  Grid,
  List
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'project' | 'social' | 'skill' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  points: number;
  requirements: {
    type: string;
    value: number;
    description: string;
  }[];
  rewards?: {
    type: 'points' | 'badge' | 'title' | 'nft';
    value: string | number;
    description: string;
  }[];
}

interface UserAchievements {
  userId: string;
  achievements: Achievement[];
  totalPoints: number;
  currentLevel: number;
  nextLevelPoints: number;
  unlockedCount: number;
  totalCount: number;
  recentUnlocks: Achievement[];
}

export const AchievementBadges: React.FC = () => {
  const [userAchievements, setUserAchievements] = useState<UserAchievements | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadUserAchievements();
  }, []);

  const loadUserAchievements = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAchievements: Achievement[] = [
        {
          id: 'first_project',
          name: 'First Steps',
          description: 'Complete your first freelance project',
          icon: '🎯',
          category: 'project',
          rarity: 'common',
          isUnlocked: true,
          unlockedAt: '2024-01-15T10:30:00Z',
          progress: 1,
          maxProgress: 1,
          points: 100,
          requirements: [
            { type: 'completed_projects', value: 1, description: 'Complete 1 project' }
          ],
          rewards: [
            { type: 'points', value: 100, description: '100 reputation points' },
            { type: 'badge', value: 'first_project', description: 'First Project Badge' }
          ]
        },
        {
          id: 'social_butterfly',
          name: 'Social Butterfly',
          description: 'Connect with 50 other freelancers',
          icon: '🦋',
          category: 'social',
          rarity: 'rare',
          isUnlocked: true,
          unlockedAt: '2024-01-20T14:22:00Z',
          progress: 50,
          maxProgress: 50,
          points: 250,
          requirements: [
            { type: 'connections', value: 50, description: 'Connect with 50 users' }
          ]
        },
        {
          id: 'code_master',
          name: 'Code Master',
          description: 'Complete 25 projects with perfect ratings',
          icon: '💻',
          category: 'skill',
          rarity: 'epic',
          isUnlocked: false,
          progress: 18,
          maxProgress: 25,
          points: 500,
          requirements: [
            { type: 'perfect_projects', value: 25, description: '25 projects with 5-star ratings' }
          ]
        },
        {
          id: 'early_adopter',
          name: 'Early Adopter',
          description: 'Join the platform in the first month',
          icon: '🚀',
          category: 'special',
          rarity: 'legendary',
          isUnlocked: true,
          unlockedAt: '2023-12-01T00:00:00Z',
          progress: 1,
          maxProgress: 1,
          points: 1000,
          requirements: [
            { type: 'join_date', value: 1, description: 'Join in first month' }
          ],
          rewards: [
            { type: 'nft', value: 'early_adopter', description: 'Exclusive Early Adopter NFT' },
            { type: 'title', value: 'Pioneer', description: 'Pioneer title' }
          ]
        }
      ];

      const mockUserAchievements: UserAchievements = {
        userId: 'user1',
        achievements: mockAchievements,
        totalPoints: 1350,
        currentLevel: 5,
        nextLevelPoints: 1500,
        unlockedCount: 3,
        totalCount: 4,
        recentUnlocks: mockAchievements.filter(a => a.isUnlocked).slice(-2)
      };

      setUserAchievements(mockUserAchievements);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load achievements",
        variant: "destructive"
      });
    }
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getRarityGradient = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
    }
  };

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'project': return <Briefcase className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'skill': return <Code className="h-4 w-4" />;
      case 'milestone': return <Target className="h-4 w-4" />;
      case 'special': return <Star className="h-4 w-4" />;
    }
  };

  const filteredAchievements = userAchievements?.achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || achievement.category === activeCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = [
    { id: 'all', name: 'All', icon: <Grid className="h-4 w-4" /> },
    { id: 'project', name: 'Projects', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'social', name: 'Social', icon: <Users className="h-4 w-4" /> },
    { id: 'skill', name: 'Skills', icon: <Code className="h-4 w-4" /> },
    { id: 'milestone', name: 'Milestones', icon: <Target className="h-4 w-4" /> },
    { id: 'special', name: 'Special', icon: <Star className="h-4 w-4" /> }
  ];

  if (!userAchievements) {
    return <div>Loading achievements...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Achievement Badges</h2>
          <p className="text-muted-foreground">Track your progress and earn rewards</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Trophy className="h-4 w-4 mr-1" />
            Level {userAchievements.currentLevel}
          </Badge>
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Star className="h-4 w-4 mr-1" />
            {userAchievements.totalPoints} pts
          </Badge>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
          <CardDescription>
            Your achievement progress and next level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Level Progress</span>
              <span className="text-sm text-muted-foreground">
                {userAchievements.totalPoints} / {userAchievements.nextLevelPoints} XP
              </span>
            </div>
            <Progress 
              value={(userAchievements.totalPoints / userAchievements.nextLevelPoints) * 100} 
              className="h-2"
            />
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {userAchievements.unlockedCount}
                </div>
                <div className="text-sm text-muted-foreground">Unlocked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {userAchievements.totalCount - userAchievements.unlockedCount}
                </div>
                <div className="text-sm text-muted-foreground">Locked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((userAchievements.unlockedCount / userAchievements.totalCount) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Unlocks */}
      {userAchievements.recentUnlocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Unlocks</CardTitle>
            <CardDescription>
              Your latest achievement unlocks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userAchievements.recentUnlocks.map((achievement) => (
                <div key={achievement.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <div className="font-medium">{achievement.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {achievement.points} points • {achievement.rarity}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(achievement.unlockedAt!).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement List */}
      <Card>
        <CardHeader>
          <CardTitle>All Achievements</CardTitle>
          <CardDescription>
            Browse and track all available achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex gap-2">
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="grid w-full grid-cols-6">
                  {categories.map((category) => (
                    <TabsTrigger key={category.id} value={category.id} className="text-xs">
                      {category.icon}
                      <span className="hidden sm:inline ml-1">{category.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
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

          {/* Achievement Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    achievement.isUnlocked ? '' : 'opacity-75'
                  }`}
                  onClick={() => {
                    setSelectedAchievement(achievement);
                    setIsDetailDialogOpen(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="relative">
                        <div className={`text-3xl ${!achievement.isUnlocked && 'grayscale'}`}>
                          {achievement.icon}
                        </div>
                        {!achievement.isUnlocked && (
                          <div className="absolute -top-1 -right-1 bg-gray-500 rounded-full p-1">
                            <Lock className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <Badge className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {achievement.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(achievement.category)}
                        <span>{achievement.category}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>{achievement.points} pts</span>
                      </div>
                    </div>
                    {!achievement.isUnlocked && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-1"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAchievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    achievement.isUnlocked ? '' : 'opacity-75'
                  }`}
                  onClick={() => {
                    setSelectedAchievement(achievement);
                    setIsDetailDialogOpen(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`text-2xl ${!achievement.isUnlocked && 'grayscale'}`}>
                          {achievement.icon}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{achievement.name}</h3>
                            <Badge className={getRarityColor(achievement.rarity)}>
                              {achievement.rarity}
                            </Badge>
                            {!achievement.isUnlocked && (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                            <div className="flex items-center space-x-1">
                              {getCategoryIcon(achievement.category)}
                              <span>{achievement.category}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3" />
                              <span>{achievement.points} pts</span>
                            </div>
                            {achievement.unlockedAt && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {!achievement.isUnlocked && (
                        <div className="text-right">
                          <div className="text-sm font-medium mb-1">
                            {achievement.progress}/{achievement.maxProgress}
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.maxProgress) * 100} 
                            className="w-20 h-2"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-2xl">{selectedAchievement?.icon}</span>
              <span>{selectedAchievement?.name}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedAchievement?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedAchievement && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Badge className={getRarityColor(selectedAchievement.rarity)}>
                  {selectedAchievement.rarity}
                </Badge>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  {getCategoryIcon(selectedAchievement.category)}
                  <span>{selectedAchievement.category}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4" />
                  <span>{selectedAchievement.points} points</span>
                </div>
                {selectedAchievement.isUnlocked && (
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Unlocked
                  </Badge>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Requirements</h4>
                <div className="space-y-2">
                  {selectedAchievement.requirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{req.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!selectedAchievement.isUnlocked && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Progress</h4>
                    <span className="text-sm text-muted-foreground">
                      {selectedAchievement.progress} / {selectedAchievement.maxProgress}
                    </span>
                  </div>
                  <Progress 
                    value={(selectedAchievement.progress / selectedAchievement.maxProgress) * 100} 
                    className="h-3"
                  />
                </div>
              )}

              {selectedAchievement.rewards && selectedAchievement.rewards.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Rewards</h4>
                  <div className="space-y-2">
                    {selectedAchievement.rewards.map((reward, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
                        <Award className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">{reward.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAchievement.unlockedAt && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold text-green-800">Achievement Unlocked!</div>
                  <div className="text-sm text-green-600">
                    {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
            {selectedAchievement && !selectedAchievement.isUnlocked && (
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
