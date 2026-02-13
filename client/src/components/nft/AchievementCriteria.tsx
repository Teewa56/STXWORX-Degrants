import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Target, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Trophy, 
  Star, 
  Zap, 
  Award,
  Calendar,
  TrendingUp,
  Users,
  Filter,
  Search,
  Eye,
  Edit,
  Plus,
  Settings,
  RefreshCw,
  Info,
  AlertTriangle,
  CheckSquare,
  Square,
  BarChart3,
  Activity,
  Flag,
  Timer,
  Hash,
  Link,
  ExternalLink,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AchievementCriterion {
  id: string;
  name: string;
  description: string;
  type: 'numeric' | 'boolean' | 'categorical' | 'time_based' | 'cumulative' | 'conditional';
  category: 'skill' | 'social' | 'platform' | 'milestone' | 'special';
  required: boolean;
  weight: number;
  currentValue?: number | boolean | string;
  targetValue: number | boolean | string;
  unit?: string;
  conditions?: {
    operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'contains' | 'not_contains';
    value: any;
  }[];
  dependencies?: string[];
  timeLimit?: {
    start: string;
    end: string;
    duration: number;
  };
  verification: {
    method: 'automatic' | 'manual' | 'peer_review' | 'blockchain';
    verified: boolean;
    verifiedAt?: string;
    verifiedBy?: string;
  };
  rewards: {
    points: number;
    badge?: string;
    tier?: string;
    special?: string[];
  };
}

interface AchievementTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'legendary';
  estimatedTime: string;
  criteria: AchievementCriterion[];
  totalPoints: number;
  prerequisites: string[];
  tags: string[];
  createdAt: string;
  updated_at: string;
}

interface UserProgress {
  userId: string;
  achievementId: string;
  criteria: {
    [criterionId: string]: {
      completed: boolean;
      value: any;
      completedAt?: string;
      verified: boolean;
    };
  };
  overallProgress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'verified' | 'failed';
  startedAt?: string;
  completedAt?: string;
  lastActivity: string;
}

export const AchievementCriteria: React.FC = () => {
  const [templates, setTemplates] = useState<AchievementTemplate[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AchievementTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadCriteriaData();
  }, []);

  const loadCriteriaData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTemplates: AchievementTemplate[] = [
        {
          id: '1',
          name: 'Master Developer',
          description: 'Become a recognized expert developer with exceptional project delivery',
          category: 'skill',
          difficulty: 'expert',
          estimatedTime: '3-6 months',
          criteria: [
            {
              id: '1',
              name: 'Complete 50 Projects',
              description: 'Successfully complete 50 freelance projects',
              type: 'numeric',
              category: 'skill',
              required: true,
              weight: 30,
              targetValue: 50,
              unit: 'projects',
              verification: {
                method: 'automatic',
                verified: false
              },
              rewards: {
                points: 500,
                badge: 'Expert Developer',
                tier: 'Platinum'
              }
            },
            {
              id: '2',
              name: 'Maintain 4.5+ Rating',
              description: 'Keep an average rating of 4.5 or higher',
              type: 'numeric',
              category: 'skill',
              required: true,
              weight: 25,
              targetValue: 4.5,
              unit: 'stars',
              verification: {
                method: 'automatic',
                verified: false
              },
              rewards: {
                points: 250,
                tier: 'Platinum'
              }
            },
            {
              id: '3',
              name: 'Earn 10,000 STX',
              description: 'Accumulate 10,000 STX in earnings',
              type: 'numeric',
              category: 'skill',
              required: true,
              weight: 20,
              targetValue: 10000,
              unit: 'STX',
              verification: {
                method: 'blockchain',
                verified: false
              },
              rewards: {
                points: 200,
                tier: 'Platinum'
              }
            },
            {
              id: '4',
              name: 'Complete 5 Complex Projects',
              description: 'Successfully deliver 5 complex projects (10k+ STX each)',
              type: 'numeric',
              category: 'skill',
              required: false,
              weight: 15,
              targetValue: 5,
              unit: 'projects',
              verification: {
                method: 'manual',
                verified: false
              },
              rewards: {
                points: 150,
                tier: 'Platinum'
              }
            },
            {
              id: '5',
              name: 'Mentor 3 Developers',
              description: 'Successfully mentor 3 junior developers to completion',
              type: 'numeric',
              category: 'social',
              required: false,
              weight: 10,
              targetValue: 3,
              unit: 'mentees',
              verification: {
                method: 'peer_review',
                verified: false
              },
              rewards: {
                points: 100,
                special: ['Mentor Badge']
              }
            }
          ],
          totalPoints: 1200,
          prerequisites: ['Senior Developer', '100+ Projects Completed'],
          tags: ['development', 'expert', 'long-term'],
          createdAt: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-20T14:30:00Z'
        },
        {
          id: '2',
          name: 'Community Leader',
          description: 'Become a recognized leader in the community',
          category: 'social',
          difficulty: 'hard',
          estimatedTime: '2-4 months',
          criteria: [
            {
              id: '1',
              name: 'Help 100 Users',
              description: 'Provide meaningful help to 100 different users',
              type: 'numeric',
              category: 'social',
              required: true,
              weight: 40,
              targetValue: 100,
              unit: 'users helped',
              verification: {
                method: 'peer_review',
                verified: false
              },
              rewards: {
                points: 400,
                badge: 'Community Helper',
                tier: 'Gold'
              }
            },
            {
              id: '2',
              name: 'Receive 50 Thanks',
              description: 'Receive 50 "thank you" reactions from community members',
              type: 'numeric',
              category: 'social',
              required: true,
              weight: 30,
              targetValue: 50,
              unit: 'thanks',
              verification: {
                method: 'automatic',
                verified: false
              },
              rewards: {
                points: 300,
                tier: 'Gold'
              }
            },
            {
              id: '3',
              name: 'Create 20 Tutorials',
              description: 'Create and share 20 helpful tutorials or guides',
              type: 'numeric',
              category: 'social',
              required: false,
              weight: 20,
              targetValue: 20,
              unit: 'tutorials',
              verification: {
                method: 'manual',
                verified: false
              },
              rewards: {
                points: 200,
                special: ['Educator Badge']
              }
            },
            {
              id: '4',
              name: 'Active for 90 Days',
              description: 'Maintain daily activity for 90 consecutive days',
              type: 'time_based',
              category: 'platform',
              required: true,
              weight: 10,
              timeLimit: {
                duration: 90,
                start: '2024-01-01T00:00:00Z',
                end: '2024-04-01T00:00:00Z'
              },
              verification: {
                method: 'automatic',
                verified: false
              },
              rewards: {
                points: 100,
                tier: 'Gold'
              }
            }
          ],
          totalPoints: 1000,
          prerequisites: ['Active Member', 'Basic Social Skills'],
          tags: ['community', 'social', 'leadership'],
          createdAt: '2024-01-10T08:00:00Z',
          updated_at: '2024-01-18T16:45:00Z'
        }
      ];

      const mockUserProgress: UserProgress[] = [
        {
          userId: '0xCurrentUser',
          achievementId: '1',
          criteria: {
            '1': {
              completed: true,
              value: 52,
              completedAt: '2024-01-18T10:30:00Z',
              verified: true
            },
            '2': {
              completed: true,
              value: 4.7,
              completedAt: '2024-01-19T14:20:00Z',
              verified: true
            },
            '3': {
              completed: false,
              value: 8500,
              verified: false
            },
            '4': {
              completed: true,
              value: 3,
              completedAt: '2024-01-17T09:15:00Z',
              verified: true
            },
            '5': {
              completed: false,
              value: 1,
              verified: false
            }
          },
          overallProgress: 70,
          status: 'in_progress',
          startedAt: '2024-01-01T00:00:00Z',
          lastActivity: '2024-01-19T14:20:00Z'
        }
      ];

      setTemplates(mockTemplates);
      setUserProgress(mockUserProgress);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load criteria data",
        variant: "destructive"
      });
    }
  };

  const getCriterionIcon = (type: string) => {
    switch (type) {
      case 'numeric': return <BarChart3 className="h-4 w-4" />;
      case 'boolean': return <CheckSquare className="h-4 w-4" />;
      case 'categorical': return <Tag className="h-4 w-4" />;
      case 'time_based': return <Clock className="h-4 w-4" />;
      case 'cumulative': return <TrendingUp className="h-4 w-4" />;
      case 'conditional': return <Activity className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'hard': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      case 'legendary': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'verified': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || template.difficulty === filterDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getUserProgressForAchievement = (achievementId: string) => {
    return userProgress.find(progress => progress.achievementId === achievementId);
  };

  const calculateProgress = (template: AchievementTemplate) => {
    const progress = getUserProgressForAchievement(template.id);
    if (!progress) return 0;
    
    const requiredCriteria = template.criteria.filter(c => c.required);
    const completedCriteria = requiredCriteria.filter(c => 
      progress.criteria[c.id]?.completed
    );
    
    return requiredCriteria.length > 0 ? (completedCriteria.length / requiredCriteria.length) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Achievement Criteria</h2>
          <p className="text-muted-foreground">Define and track achievement requirements</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Criteria Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{templates.length}</div>
            <div className="text-sm text-muted-foreground">Templates</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{userProgress.length}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">
              {userProgress.filter(p => p.status === 'completed').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">
              {templates.reduce((sum, t) => sum + t.totalPoints, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Points Available</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search achievement templates..."
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
                      <SelectItem value="skill">Skill</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="platform">Platform</SelectItem>
                      <SelectItem value="milestone">Milestone</SelectItem>
                      <SelectItem value="special">Special</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                      <SelectItem value="legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const progress = getUserProgressForAchievement(template.id);
              const progressPercentage = calculateProgress(template);
              
              return (
                <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold mb-1">{template.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{template.category}</Badge>
                          <Badge className={getDifficultyColor(template.difficulty)}>
                            {template.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {template.description}
                    </p>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Criteria:</span>
                        <span>{template.criteria.length} total</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Required:</span>
                        <span>{template.criteria.filter(c => c.required).length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Points:</span>
                        <span className="font-medium">{template.totalPoints}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Est. Time:</span>
                        <span>{template.estimatedTime}</span>
                      </div>
                    </div>
                    
                    {progress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress:</span>
                          <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                        <Badge className={getStatusColor(progress.status)}>
                          {progress.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      {progress ? (
                        <Button size="sm" className="flex-1">
                          Continue
                        </Button>
                      ) : (
                        <Button size="sm" className="flex-1">
                          Start
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="space-y-4">
            {userProgress.map((progress) => {
              const template = templates.find(t => t.id === progress.achievementId);
              if (!template) return null;
              
              return (
                <Card key={progress.achievementId}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold mb-1">{template.name}</h3>
                        <Badge className={getStatusColor(progress.status)}>
                          {progress.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Started {new Date(progress.startedAt || '').toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {template.criteria.map((criterion) => {
                        const userCriterion = progress.criteria[criterion.id];
                        const isCompleted = userCriterion?.completed || false;
                        
                        return (
                          <div key={criterion.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                {getCriterionIcon(criterion.type)}
                              </div>
                              <div>
                                <div className="font-medium">{criterion.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {criterion.description}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Target: {criterion.targetValue} {criterion.unit || ''}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-2">
                                {isCompleted ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : userCriterion ? (
                                  <div className="text-sm font-medium">
                                    {userCriterion.value} / {criterion.targetValue}
                                  </div>
                                ) : (
                                  <Square className="h-4 w-4 text-gray-400" />
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {criterion.weight}%
                                </Badge>
                              </div>
                              {userCriterion?.completedAt && (
                                <div className="text-xs text-muted-foreground">
                                  {new Date(userCriterion.completedAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Completion Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Completion rate analytics will be implemented here</p>
                  <p className="text-sm">Show achievement completion statistics</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Progress Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Progress trend analysis will be implemented here</p>
                  <p className="text-sm">Track user progress over time</p>
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
                Criteria Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Auto-verification</Label>
                <Select defaultValue="enabled">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Default Difficulty</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Progress Notifications</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notify-completion" defaultChecked />
                    <Label htmlFor="notify-completion">Notify on completion</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notify-milestones" defaultChecked />
                    <Label htmlFor="notify-milestones">Notify on milestones</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="notify-deadlines" defaultChecked />
                    <Label htmlFor="notify-deadlines">Notify on approaching deadlines</Label>
                  </div>
                </div>
              </div>
              
              <Button className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Template Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Achievement Template Details
            </DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Template Name</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded font-medium">
                    {selectedTemplate.name}
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded">
                    {selectedTemplate.category}
                  </div>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <div className="mt-1">
                    <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                      {selectedTemplate.difficulty}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Estimated Time</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded">
                    {selectedTemplate.estimatedTime}
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded">
                  {selectedTemplate.description}
                </div>
              </div>
              
              <div>
                <Label>Prerequisites</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedTemplate.prerequisites.map((prereq, index) => (
                    <Badge key={index} variant="outline">{prereq}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Tags</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="font-medium mb-3">Criteria ({selectedTemplate.criteria.length})</Label>
                <div className="space-y-3">
                  {selectedTemplate.criteria.map((criterion, index) => {
                    const progress = getUserProgressForAchievement(selectedTemplate.id);
                    const userCriterion = progress?.criteria[criterion.id];
                    const isCompleted = userCriterion?.completed || false;
                    
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              {getCriterionIcon(criterion.type)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold">{criterion.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {criterion.weight}%
                                </Badge>
                                {criterion.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {criterion.description}
                              </div>
                            </div>
                          </div>
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : userCriterion ? (
                            <div className="text-sm font-medium">
                              {userCriterion.value} / {criterion.targetValue}
                            </div>
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <div className="font-medium capitalize">{criterion.type}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Target:</span>
                            <div className="font-medium">
                              {criterion.targetValue} {criterion.unit || ''}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Verification:</span>
                            <div className="font-medium capitalize">{criterion.verification.method}</div>
                          </div>
                        </div>
                        
                        {criterion.rewards && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="font-medium text-sm mb-1">Rewards:</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Points:</span>
                                <div className="font-medium">{criterion.rewards.points}</div>
                              </div>
                              {criterion.rewards.badge && (
                                <div>
                                  <span className="text-muted-foreground">Badge:</span>
                                  <div className="font-medium">{criterion.rewards.badge}</div>
                                </div>
                              )}
                              {criterion.rewards.tier && (
                                <div>
                                  <span className="text-muted-foreground">Tier:</span>
                                  <div className="font-medium">{criterion.rewards.tier}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-lg font-bold">Total Points: {selectedTemplate.totalPoints}</div>
                  <div className="text-sm text-muted-foreground">
                    Created {new Date(selectedTemplate.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export Template
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
