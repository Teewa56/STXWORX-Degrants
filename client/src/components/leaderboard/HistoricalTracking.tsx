import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  BarChart3, 
  LineChart, 
  PieChart, 
  Target,
  Award,
  Clock,
  Filter,
  Download,
  Eye,
  Settings,
  Activity,
  Users,
  DollarSign,
  Star,
  Zap,
  Trophy,
  Medal,
  Crown,
  Gem,
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Share2,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PerformanceData {
  date: string;
  score: number;
  rank: number;
  tier: string;
  pointsEarned: number;
  achievementsUnlocked: number;
  projectsCompleted: number;
  earnings: number;
}

interface HistoricalStats {
  period: string;
  startScore: number;
  endScore: number;
  scoreChange: number;
  startRank: number;
  endRank: number;
  rankChange: number;
  tierProgress: {
    current: string;
    previous?: string;
    progress: number;
  };
  achievements: {
    unlocked: number;
    total: number;
  };
  earnings: number;
  projectsCompleted: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'rank_achievement' | 'tier_upgrade' | 'score_milestone' | 'special_event';
  value: number;
  icon: string;
}

export const HistoricalTracking: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [historicalStats, setHistoricalStats] = useState<HistoricalStats[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('score');
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadHistoricalData();
  }, [selectedPeriod]);

  const loadHistoricalData = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockPerformanceData: PerformanceData[] = [
        {
          date: '2024-01-20',
          score: 2850,
          rank: 42,
          tier: 'Gold',
          pointsEarned: 150,
          achievementsUnlocked: 2,
          projectsCompleted: 3,
          earnings: 1250
        },
        {
          date: '2024-01-19',
          score: 2700,
          rank: 48,
          tier: 'Gold',
          pointsEarned: 100,
          achievementsUnlocked: 1,
          projectsCompleted: 2,
          earnings: 800
        },
        {
          date: '2024-01-18',
          score: 2600,
          rank: 52,
          tier: 'Silver',
          pointsEarned: 200,
          achievementsUnlocked: 3,
          projectsCompleted: 1,
          earnings: 600
        },
        {
          date: '2024-01-17',
          score: 2400,
          rank: 58,
          tier: 'Silver',
          pointsEarned: 50,
          achievementsUnlocked: 0,
          projectsCompleted: 2,
          earnings: 400
        },
        {
          date: '2024-01-16',
          score: 2350,
          rank: 61,
          tier: 'Silver',
          pointsEarned: 120,
          achievementsUnlocked: 1,
          projectsCompleted: 1,
          earnings: 750
        }
      ];

      const mockHistoricalStats: HistoricalStats[] = [
        {
          period: 'Last 7 days',
          startScore: 2350,
          endScore: 2850,
          scoreChange: 500,
          startRank: 61,
          endRank: 42,
          rankChange: 19,
          tierProgress: {
            current: 'Gold',
            previous: 'Silver',
            progress: 75
          },
          achievements: {
            unlocked: 7,
            total: 50
          },
          earnings: 3800,
          projectsCompleted: 9
        },
        {
          period: 'Last 30 days',
          startScore: 1800,
          endScore: 2850,
          scoreChange: 1050,
          startRank: 89,
          endRank: 42,
          rankChange: 47,
          tierProgress: {
            current: 'Gold',
            previous: 'Bronze',
            progress: 75
          },
          achievements: {
            unlocked: 15,
            total: 50
          },
          earnings: 12500,
          projectsCompleted: 28
        },
        {
          period: 'Last 90 days',
          startScore: 1200,
          endScore: 2850,
          scoreChange: 1650,
          startRank: 156,
          endRank: 42,
          rankChange: 114,
          tierProgress: {
            current: 'Gold',
            previous: 'Bronze',
            progress: 75
          },
          achievements: {
            unlocked: 28,
            total: 50
          },
          earnings: 35700,
          projectsCompleted: 67
        }
      ];

      const mockMilestones: Milestone[] = [
        {
          id: '1',
          title: 'Reached Gold Tier',
          description: 'Achieved Gold tier status with exceptional performance',
          date: '2024-01-18T10:30:00Z',
          type: 'tier_upgrade',
          value: 2500,
          icon: '🏆'
        },
        {
          id: '2',
          title: 'Top 50 Ranking',
          description: 'Entered the top 50 leaderboard for the first time',
          date: '2024-01-17T15:45:00Z',
          type: 'rank_achievement',
          value: 50,
          icon: '🎯'
        },
        {
          id: '3',
          title: '1000 Points Milestone',
          description: 'Accumulated 1000 performance points',
          date: '2024-01-10T09:20:00Z',
          type: 'score_milestone',
          value: 1000,
          icon: '⭐'
        },
        {
          id: '4',
          title: 'First Project Completed',
          description: 'Successfully completed first freelance project',
          date: '2024-01-05T14:15:00Z',
          type: 'special_event',
          value: 1,
          icon: '🚀'
        }
      ];

      setPerformanceData(mockPerformanceData);
      setHistoricalStats(mockHistoricalStats);
      setMilestones(mockMilestones);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load historical data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'diamond': return <Gem className="h-4 w-4" />;
      case 'platinum': return <Crown className="h-4 w-4" />;
      case 'gold': return <Trophy className="h-4 w-4" />;
      case 'silver': return <Medal className="h-4 w-4" />;
      case 'bronze': return <Award className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'tier_upgrade': return <Trophy className="h-4 w-4" />;
      case 'rank_achievement': return <Target className="h-4 w-4" />;
      case 'score_milestone': return <Star className="h-4 w-4" />;
      case 'special_event': return <Zap className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const exportData = async () => {
    try {
      // API call to export historical data
      toast({
        title: "Export Started",
        description: "Historical data export has been initiated"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export historical data",
        variant: "destructive"
      });
    }
  };

  const currentStats = historicalStats.find(stat => stat.period === 'Last 7 days') || historicalStats[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Historical Performance</h2>
          <p className="text-muted-foreground">Track your progress over time</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={loadHistoricalData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <div className="flex items-center space-x-1">
                {getChangeIcon(currentStats?.scoreChange || 0)}
                <span className={`text-sm font-medium ${getChangeColor(currentStats?.scoreChange || 0)}`}>
                  {currentStats?.scoreChange || 0}
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold">{currentStats?.endScore || 0}</div>
            <div className="text-sm text-muted-foreground">Current Score</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-green-600" />
              <div className="flex items-center space-x-1">
                {getChangeIcon(-(currentStats?.rankChange || 0))}
                <span className={`text-sm font-medium ${getChangeColor(-(currentStats?.rankChange || 0))}`}>
                  {currentStats?.rankChange || 0}
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold">#{currentStats?.endRank || 0}</div>
            <div className="text-sm text-muted-foreground">Current Rank</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              {getTierIcon(currentStats?.tierProgress.current || 'Bronze')}
              <Badge variant="secondary" className="text-xs">
                {currentStats?.tierProgress.progress || 0}%
              </Badge>
            </div>
            <div className="text-2xl font-bold">{currentStats?.tierProgress.current || 'Bronze'}</div>
            <div className="text-sm text-muted-foreground">Current Tier</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +{((currentStats?.earnings || 0) / 1000).toFixed(1)}k
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold">${(currentStats?.earnings || 0).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Earnings</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Score Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Score progression chart will be implemented here</p>
                  <p className="text-sm">Showing data for {selectedPeriod}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tier Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Tier Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Current Tier Progress</span>
                    <span>{currentStats?.tierProgress.progress || 0}%</span>
                  </div>
                  <Progress value={currentStats?.tierProgress.progress || 0} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Previous Tier</span>
                    <span>{currentStats?.tierProgress.previous || 'None'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Current Tier</span>
                    <span className="font-medium">{currentStats?.tierProgress.current || 'Bronze'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Next Tier</span>
                    <span>Platinum</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentStats?.achievements.unlocked || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Achievements Unlocked</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    of {currentStats?.achievements.total || 0} total
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {currentStats?.projectsCompleted || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Projects Completed</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    This period
                  </div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {performanceData.reduce((sum, day) => sum + day.pointsEarned, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Points Earned</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Total this period
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historicalStats.map((stat, index) => (
                    <div key={index} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{stat.period}</span>
                        <Badge variant="outline">{stat.period}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Score Change:</span>
                          <div className="flex items-center space-x-1">
                            {getChangeIcon(stat.scoreChange)}
                            <span className={getChangeColor(stat.scoreChange)}>
                              {stat.scoreChange}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rank Change:</span>
                          <div className="flex items-center space-x-1">
                            {getChangeIcon(-stat.rankChange)}
                            <span className={getChangeColor(-stat.rankChange)}>
                              {stat.rankChange} positions
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceData.slice(0, 7).map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{new Date(day.date).toLocaleDateString()}</div>
                          <div className="text-sm text-muted-foreground">
                            Rank #{day.rank} • {day.tier}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{day.score}</div>
                        <div className="text-sm text-muted-foreground">+{day.pointsEarned} pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <Card key={milestone.id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{milestone.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{milestone.title}</h3>
                        <Badge variant="outline">
                          {milestone.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{milestone.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(milestone.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getMilestoneIcon(milestone.type)}
                          <span className="font-medium">{milestone.value}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peer Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Peer Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Peer comparison chart will be implemented here</p>
                  <p className="text-sm">Compare your performance with similar users</p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Performance Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Performance distribution chart will be implemented here</p>
                  <p className="text-sm">See how you rank among all users</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
