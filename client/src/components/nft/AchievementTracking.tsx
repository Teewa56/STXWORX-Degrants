import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Activity, 
  Calendar,
  Users,
  Filter,
  Search,
  Eye,
  Settings,
  RefreshCw,
  BarChart3,
  LineChart,
  Award,
  Star,
  Zap,
  Flag,
  Bell,
  Download,
  Share2,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AchievementTracker {
  id: string;
  userId: string;
  achievementId: string;
  achievementName: string;
  achievementImage: string;
  category: string;
  rarity: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'verified' | 'expired';
  progress: number;
  startDate?: string;
  completedDate?: string;
  lastActivity: string;
  milestones: {
    id: string;
    name: string;
    description: string;
    completed: boolean;
    completedDate?: string;
    value: number;
    maxValue: number;
  }[];
  notifications: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
    types: string[];
  };
}

interface TrackingAnalytics {
  totalTracked: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  averageCompletionTime: number;
  completionRate: number;
  categoryProgress: {
    category: string;
    total: number;
    completed: number;
    percentage: number;
  }[];
  monthlyProgress: {
    month: string;
    completed: number;
    started: number;
  }[];
}

export const AchievementTracking: React.FC = () => {
  const [trackers, setTrackers] = useState<AchievementTracker[]>([]);
  const [analytics, setAnalytics] = useState<TrackingAnalytics | null>(null);
  const [selectedTracker, setSelectedTracker] = useState<AchievementTracker | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadTrackingData();
  }, []);

  const loadTrackingData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTrackers: AchievementTracker[] = [
        {
          id: '1',
          userId: '0xCurrentUser',
          achievementId: '1',
          achievementName: 'Master Developer',
          achievementImage: 'https://ipfs.io/ipfs/QmMasterDev',
          category: 'Skill',
          rarity: 'Epic',
          status: 'in_progress',
          progress: 65,
          startDate: '2024-01-01T00:00:00Z',
          lastActivity: '2024-01-19T14:20:00Z',
          milestones: [
            {
              id: '1',
              name: 'Complete 25 Projects',
              description: 'Successfully complete 25 projects',
              completed: true,
              completedDate: '2024-01-10T10:30:00Z',
              value: 25,
              maxValue: 50
            },
            {
              id: '2',
              name: 'Maintain 4.5+ Rating',
              description: 'Keep average rating above 4.5',
              completed: true,
              completedDate: '2024-01-15T09:15:00Z',
              value: 4.7,
              maxValue: 4.5
            },
            {
              id: '3',
              name: 'Earn 5,000 STX',
              description: 'Accumulate 5,000 STX in earnings',
              completed: false,
              value: 3500,
              maxValue: 5000
            }
          ],
          notifications: {
            enabled: true,
            frequency: 'daily',
            types: ['milestone_completed', 'achievement_completed']
          }
        },
        {
          id: '2',
          userId: '0xCurrentUser',
          achievementId: '2',
          achievementName: 'Community Leader',
          achievementImage: 'https://ipfs.io/ipfs/QmCommunity',
          category: 'Social',
          rarity: 'Rare',
          status: 'completed',
          progress: 100,
          startDate: '2024-01-05T00:00:00Z',
          completedDate: '2024-01-18T16:45:00Z',
          lastActivity: '2024-01-18T16:45:00Z',
          milestones: [
            {
              id: '1',
              name: 'Help 50 Users',
              description: 'Provide help to 50 users',
              completed: true,
              completedDate: '2024-01-12T14:20:00Z',
              value: 50,
              maxValue: 100
            },
            {
              id: '2',
              name: 'Receive 25 Thanks',
              description: 'Get 25 thank you reactions',
              completed: true,
              completedDate: '2024-01-16T11:30:00Z',
              value: 25,
              maxValue: 50
            },
            {
              id: '3',
              name: 'Active 30 Days',
              description: 'Daily activity for 30 days',
              completed: true,
              completedDate: '2024-01-18T16:45:00Z',
              value: 30,
              maxValue: 30
            }
          ],
          notifications: {
            enabled: true,
            frequency: 'immediate',
            types: ['milestone_completed', 'achievement_completed']
          }
        }
      ];

      const mockAnalytics: TrackingAnalytics = {
        totalTracked: 15,
        completed: 8,
        inProgress: 4,
        notStarted: 3,
        averageCompletionTime: 14.5,
        completionRate: 73.3,
        categoryProgress: [
          { category: 'Skill', total: 6, completed: 3, percentage: 50.0 },
          { category: 'Social', total: 5, completed: 4, percentage: 80.0 },
          { category: 'Platform', total: 4, completed: 1, percentage: 25.0 }
        ],
        monthlyProgress: [
          { month: '2024-01', completed: 3, started: 2 },
          { month: '2023-12', completed: 2, started: 3 },
          { month: '2023-11', completed: 1, started: 1 }
        ]
      };

      setTrackers(mockTrackers);
      setAnalytics(mockAnalytics);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tracking data",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'verified': return 'bg-purple-100 text-purple-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white';
      case 'epic': return 'bg-gradient-to-r from-purple-600 to-blue-600 text-white';
      case 'rare': return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white';
      case 'common': return 'bg-gradient-to-r from-gray-600 to-gray-700 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTrackers = trackers.filter(tracker => {
    const matchesSearch = tracker.achievementName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tracker.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tracker.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || tracker.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (!analytics) {
    return <div>Loading tracking system...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Achievement Tracking</h2>
          <p className="text-muted-foreground">Monitor and track achievement progress</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Tracking Settings
          </Button>
        </div>
      </div>

      {/* Tracking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{analytics.totalTracked}</div>
            <div className="text-sm text-muted-foreground">Tracked Achievements</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{analytics.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{analytics.inProgress}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Category Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Category Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.categoryProgress.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">{category.category}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.completed} / {category.total} achievements
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{category.percentage.toFixed(0)}%</div>
                      <Progress value={category.percentage} className="w-24 h-2 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trackers.slice(0, 5).map((tracker) => (
                  <div key={tracker.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={tracker.achievementImage} 
                        alt={tracker.achievementName}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div>
                        <div className="font-medium">{tracker.achievementName}</div>
                        <div className="text-sm text-muted-foreground">
                          Last activity: {new Date(tracker.lastActivity).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(tracker.status)}>
                        {tracker.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-sm font-medium mt-1">
                        {tracker.progress.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
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
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Skill">Skill</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Platform">Platform</SelectItem>
                      <SelectItem value="Milestone">Milestone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress List */}
          <div className="space-y-3">
            {filteredTrackers.map((tracker) => (
              <Card key={tracker.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={tracker.achievementImage} 
                        alt={tracker.achievementName}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{tracker.achievementName}</h4>
                          <Badge variant="outline">{tracker.category}</Badge>
                          <Badge className={getRarityColor(tracker.rarity)}>
                            {tracker.rarity}
                          </Badge>
                          <Badge className={getStatusColor(tracker.status)}>
                            {tracker.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Started {new Date(tracker.startDate || '').toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold mb-2">{tracker.progress.toFixed(0)}%</div>
                      <Progress value={tracker.progress} className="w-32 h-2 mb-2" />
                      <div className="text-sm text-muted-foreground">
                        {tracker.milestones.filter(m => m.completed).length} / {tracker.milestones.length} milestones
                      </div>
                    </div>
                  </div>
                  
                  {/* Milestones */}
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Milestones:</div>
                    <div className="space-y-2">
                      {tracker.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            {milestone.completed ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400" />
                            )}
                            <div>
                              <div className="font-medium text-sm">{milestone.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {milestone.description}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {milestone.value} / {milestone.maxValue}
                            </div>
                            {milestone.completedDate && (
                              <div className="text-xs text-muted-foreground">
                                {new Date(milestone.completedDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Completion Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Completion Time:</span>
                    <span className="font-medium">{analytics.averageCompletionTime} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overall Completion Rate:</span>
                    <span className="font-medium">{analytics.completionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Completed:</span>
                    <span className="font-medium">{analytics.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Currently In Progress:</span>
                    <span className="font-medium">{analytics.inProgress}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Monthly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Monthly progress chart will be implemented here</p>
                  <p className="text-sm">Show completion trends over time</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Tracking Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Default Notification Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily Summary</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Auto-Start Tracking</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="auto-start" defaultChecked />
                    <Label htmlFor="auto-start">Automatically start tracking new achievements</Label>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Progress Reminders</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="reminders" defaultChecked />
                    <Label htmlFor="reminders">Enable progress reminders</Label>
                  </div>
                </div>
              </div>
              
              <Button className="w-full">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
