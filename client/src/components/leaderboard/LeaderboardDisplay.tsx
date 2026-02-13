import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trophy, 
  Medal, 
  Award, 
  Star, 
  TrendingUp, 
  Users, 
  DollarSign,
  Target,
  Crown,
  ChevronUp,
  ChevronDown,
  Minus,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  reputation: number;
  completedProjects: number;
  totalEarnings: number;
  lastUpdated: string;
  rankChange?: 'up' | 'down' | 'same';
  rankChangeAmount?: number;
  achievements?: Array<{
    type: string;
    name: string;
    icon: string;
  }>;
}

interface LeaderboardStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalVolume: number;
  averageReputation: number;
  topScore: number;
}

interface LeaderboardDisplayProps {
  className?: string;
}

export function LeaderboardDisplay({ className }: LeaderboardDisplayProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('total-earnings');
  const [timeRange, setTimeRange] = useState('all-time');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTopOnly, setShowTopOnly] = useState(false);
  
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        rank: 1,
        userId: 'user1',
        username: 'Alice Johnson',
        avatar: '/api/placeholder/40/40',
        score: 985000,
        reputation: 9800,
        completedProjects: 127,
        totalEarnings: 985000000, // 985 STX in microstacks
        lastUpdated: '2024-01-15T10:30:00Z',
        rankChange: 'up',
        rankChangeAmount: 2,
        achievements: [
          { type: 'platinum', name: 'Platinum Master', icon: '🏆' },
          { type: 'verified', name: 'X Verified', icon: '✓' }
        ]
      },
      {
        rank: 2,
        userId: 'user2',
        username: 'Bob Smith',
        avatar: '/api/placeholder/40/40',
        score: 875000,
        reputation: 8700,
        completedProjects: 98,
        totalEarnings: 875000000, // 875 STX
        lastUpdated: '2024-01-15T09:45:00Z',
        rankChange: 'down',
        rankChangeAmount: 1,
        achievements: [
          { type: 'gold', name: 'Gold Expert', icon: '🥇' },
          { type: 'verified', name: 'X Verified', icon: '✓' }
        ]
      },
      {
        rank: 3,
        userId: 'user3',
        username: 'Carol Davis',
        avatar: '/api/placeholder/40/40',
        score: 750000,
        reputation: 7500,
        completedProjects: 85,
        totalEarnings: 750000000, // 750 STX
        lastUpdated: '2024-01-15T08:20:00Z',
        rankChange: 'same',
        rankChangeAmount: 0,
        achievements: [
          { type: 'gold', name: 'Gold Expert', icon: '🥇' }
        ]
      },
      {
        rank: 4,
        userId: 'user4',
        username: 'David Wilson',
        avatar: '/api/placeholder/40/40',
        score: 650000,
        reputation: 6500,
        completedProjects: 72,
        totalEarnings: 650000000, // 650 STX
        lastUpdated: '2024-01-15T07:15:00Z',
        rankChange: 'up',
        rankChangeAmount: 3,
        achievements: [
          { type: 'silver', name: 'Silver Professional', icon: '🥈' }
        ]
      },
      {
        rank: 5,
        userId: 'user5',
        username: 'Eva Brown',
        avatar: '/api/placeholder/40/40',
        score: 550000,
        reputation: 5500,
        completedProjects: 61,
        totalEarnings: 550000000, // 550 STX
        lastUpdated: '2024-01-15T06:30:00Z',
        rankChange: 'down',
        rankChangeAmount: 1,
        achievements: [
          { type: 'silver', name: 'Silver Professional', icon: '🥈' }
        ]
      }
    ];

    const mockStats: LeaderboardStats = {
      totalUsers: 1247,
      activeUsers: 892,
      totalProjects: 3456,
      totalVolume: 12500000000, // 12,500 STX
      averageReputation: 3450,
      topScore: 985000
    };

    setLeaderboard(mockLeaderboard);
    setStats(mockStats);
    setIsLoading(false);
  }, []);

  // Filter leaderboard based on search
  const filteredLeaderboard = searchTerm
    ? leaderboard.filter(entry =>
        entry.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : showTopOnly ? leaderboard.slice(0, 10) : leaderboard;

  // Get rank icon
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-600">{rank}</span>;
    }
  };

  // Get rank change icon
  const getRankChangeIcon = (change?: 'up' | 'down' | 'same', amount?: number) => {
    if (!change || change === 'same') return <Minus className="h-4 w-4 text-gray-400" />;
    if (change === 'up') return <ChevronUp className="h-4 w-4 text-green-500" />;
    return <ChevronDown className="h-4 w-4 text-red-500" />;
  };

  // Format earnings
  const formatEarnings = (earnings: number) => {
    const stx = earnings / 1000000; // Convert from microstacks
    if (stx >= 1000) {
      return `${(stx / 1000).toFixed(1)}k STX`;
    }
    return `${stx.toFixed(2)} STX`;
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'total-earnings': return 'Total Earnings';
      case 'project-completion': return 'Projects Completed';
      case 'reputation': return 'Reputation';
      case 'nft-achievements': return 'NFT Achievements';
      case 'social-verification': return 'Social Score';
      default: return 'Overall Score';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'total-earnings': return <DollarSign className="h-4 w-4" />;
      case 'project-completion': return <Target className="h-4 w-4" />;
      case 'reputation': return <Star className="h-4 w-4" />;
      case 'nft-achievements': return <Trophy className="h-4 w-4" />;
      case 'social-verification': return <Users className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Loading leaderboard data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Volume</p>
                  <p className="text-2xl font-bold">{formatEarnings(stats.totalVolume)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Top Score</p>
                  <p className="text-2xl font-bold">{stats.topScore.toLocaleString()}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance Leaderboard</CardTitle>
              <CardDescription>
                Top performers on the STXWORX platform
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(selectedCategory)}
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total-earnings">Total Earnings</SelectItem>
                  <SelectItem value="project-completion">Projects Completed</SelectItem>
                  <SelectItem value="reputation">Reputation</SelectItem>
                  <SelectItem value="nft-achievements">NFT Achievements</SelectItem>
                  <SelectItem value="social-verification">Social Score</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="all-time">All Time</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTopOnly(!showTopOnly)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showTopOnly ? 'Show All' : 'Top 10'}
              </Button>
            </div>

            {/* Leaderboard Table */}
            <div className="rounded-md border">
              <div className="space-y-1">
                {filteredLeaderboard.map((entry, index) => (
                  <div
                    key={entry.userId}
                    className={`p-4 flex items-center justify-between hover:bg-gray-50 ${
                      index === 0 ? 'border-t-0' : 'border-t'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(entry.rank)}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={entry.avatar} />
                          <AvatarFallback>{entry.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{entry.username}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-500">
                              {entry.completedProjects} projects • {entry.reputation} rep
                            </p>
                            {entry.achievements && entry.achievements.length > 0 && (
                              <div className="flex items-center space-x-1">
                                {entry.achievements.map((achievement, idx) => (
                                  <span key={idx} className="text-xs" title={achievement.name}>
                                    {achievement.icon}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      {/* Score */}
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {selectedCategory === 'total-earnings' 
                            ? formatEarnings(entry.score)
                            : entry.score.toLocaleString()
                          }
                        </p>
                        <p className="text-sm text-gray-500">
                          {getCategoryLabel(selectedCategory)}
                        </p>
                      </div>
                      
                      {/* Rank Change */}
                      <div className="flex items-center space-x-1">
                        {getRankChangeIcon(entry.rankChange, entry.rankChangeAmount)}
                        {entry.rankChangeAmount && entry.rankChangeAmount > 0 && (
                          <span className="text-sm font-medium">{entry.rankChangeAmount}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {filteredLeaderboard.length === 0 && (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LeaderboardDisplay;
