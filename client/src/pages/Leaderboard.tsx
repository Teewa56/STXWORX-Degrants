import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Medal, 
  Award, 
  Star, 
  TrendingUp, 
  Users, 
  Search, 
  Filter,
  Crown,
  Gem,
  Target,
  Zap,
  Twitter,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { type User, type XIntegration } from '@shared/schema';

interface LeaderboardUser extends User {
  rank: number;
  xIntegration?: XIntegration;
  earningsThisMonth: number;
  completedProjects: number;
  reputationScore: number;
}

export default function Leaderboard() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all-time');

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading, refetch } = useQuery({
    queryKey: ['leaderboard', categoryFilter, timeFilter],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/leaderboard?category=${categoryFilter}&time=${timeFilter}`);
      return response as LeaderboardUser[];
    },
  });

  // Fetch X integrations for verified users
  const { data: xIntegrations } = useQuery({
    queryKey: ['x-integrations-all'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/x/all');
      return response.data as XIntegration[];
    },
  });

  // Combine leaderboard data with X integrations
  const enrichedLeaderboard = leaderboardData?.map(user => ({
    ...user,
    xIntegration: xIntegrations?.find(x => x.userId === user.id)
  })) || [];

  // Filter users
  const filteredUsers = enrichedLeaderboard.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Get rank icon and color
  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-100', label: '🥇' };
      case 2:
        return { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-100', label: '🥈' };
      case 3:
        return { icon: Award, color: 'text-amber-600', bg: 'bg-amber-100', label: '🥉' };
      default:
        return { icon: Star, color: 'text-blue-500', bg: 'bg-blue-50', label: `#${rank}` };
    }
  };

  // Get reputation badge
  const getReputationBadge = (score: number) => {
    if (score >= 1000) return <Badge className="bg-purple-500">Elite</Badge>;
    if (score >= 500) return <Badge className="bg-blue-500">Expert</Badge>;
    if (score >= 250) return <Badge className="bg-green-500">Pro</Badge>;
    if (score >= 100) return <Badge className="bg-yellow-500">Rising</Badge>;
    return <Badge variant="secondary">New</Badge>;
  };

  // Calculate statistics
  const stats = {
    totalFreelancers: enrichedLeaderboard.length,
    verifiedUsers: enrichedLeaderboard.filter(u => u.xIntegration?.verified).length,
    totalEarnings: enrichedLeaderboard.reduce((sum, u) => sum + u.totalEarnings, 0),
    avgReputation: enrichedLeaderboard.length > 0 
      ? Math.round(enrichedLeaderboard.reduce((sum, u) => sum + u.reputationScore, 0) / enrichedLeaderboard.length)
      : 0,
  };

  return (
    <div className="min-h-screen text-foreground">
      <Navigation currentPage="leaderboard" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Freelancer Leaderboard</h1>
                <p className="text-muted-foreground">Top performers and rising talent in the community</p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Freelancers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFreelancers}</div>
                <p className="text-xs text-muted-foreground">Active contributors</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
                <p className="text-xs text-muted-foreground">X-verified users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEarnings.toLocaleString()} STX</div>
                <p className="text-xs text-muted-foreground">Platform earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Reputation</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgReputation}</div>
                <p className="text-xs text-muted-foreground">Community score</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by username or display name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="writing">Writing</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="blockchain">Blockchain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-48">
                  <Label htmlFor="time">Time Period</Label>
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-time">All Time</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top 3 Podium */}
          {!isLoading && filteredUsers.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {filteredUsers.slice(0, 3).map((user, index) => {
                const rankDisplay = getRankDisplay(user.rank);
                const RankIcon = rankDisplay.icon;
                
                return (
                  <Card key={user.id} className={`${rankDisplay.bg} border-2 ${user.rank === 1 ? 'border-yellow-300' : user.rank === 2 ? 'border-gray-300' : 'border-amber-300'}`}>
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-2">
                        <RankIcon className={`h-8 w-8 ${rankDisplay.color}`} />
                      </div>
                      <CardTitle className="text-2xl">{rankDisplay.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <Avatar className="w-20 h-20 mx-auto mb-4">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="text-lg">
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg">{user.displayName || user.username}</h3>
                      <p className="text-sm text-muted-foreground mb-4">@{user.username}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          {user.xIntegration?.verified && (
                            <Twitter className="h-4 w-4 text-blue-500" />
                          )}
                          {getReputationBadge(user.reputationScore)}
                        </div>
                        <div className="text-2xl font-bold">{user.totalEarnings.toLocaleString()} STX</div>
                        <p className="text-sm text-muted-foreground">Total Earnings</p>
                        <div className="flex justify-around text-sm">
                          <div>
                            <div className="font-medium">{user.completedProjects}</div>
                            <div className="text-muted-foreground">Projects</div>
                          </div>
                          <div>
                            <div className="font-medium">{user.reputationScore}</div>
                            <div className="text-muted-foreground">Reputation</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Leaderboard Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Leaderboard ({filteredUsers.length})</span>
                <Button onClick={() => refetch()} variant="outline" size="sm">
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading leaderboard...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No freelancers found matching your criteria
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((user) => {
                    const rankDisplay = getRankDisplay(user.rank);
                    const RankIcon = rankDisplay.icon;
                    
                    return (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full ${rankDisplay.bg} flex items-center justify-center`}>
                            <RankIcon className={`h-5 w-5 ${rankDisplay.color}`} />
                          </div>
                          
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user.avatar || undefined} />
                            <AvatarFallback>
                              {user.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{user.displayName || user.username}</h3>
                              {user.xIntegration?.verified && (
                                <Twitter className="h-4 w-4 text-blue-500" />
                              )}
                              {getReputationBadge(user.reputationScore)}
                            </div>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                            {user.bio && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{user.bio}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-semibold text-lg">{user.totalEarnings.toLocaleString()} STX</div>
                            <div className="text-sm text-muted-foreground">Total Earnings</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{user.completedProjects}</div>
                            <div className="text-sm text-muted-foreground">Projects</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{user.reputationScore}</div>
                            <div className="text-sm text-muted-foreground">Reputation</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}