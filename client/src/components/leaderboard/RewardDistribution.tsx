import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Gift, 
  Trophy, 
  Star, 
  Users, 
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Target,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  Wallet,
  PieChart,
  BarChart3,
  Timer,
  Settings,
  Bell,
  Mail,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RewardPool {
  id: string;
  name: string;
  description: string;
  type: 'achievement' | 'milestone' | 'tournament' | 'referral' | 'bonus';
  totalAmount: number;
  currency: 'STX' | 'USD';
  distributedAmount: number;
  remainingAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'scheduled' | 'paused';
  eligibility: {
    minTier: string;
    minPoints: number;
    requiredAchievements?: string[];
  };
  distributionRules: {
    type: 'equal' | 'tiered' | 'performance' | 'lottery';
    tiers?: {
      rank: number;
      percentage: number;
      amount: number;
      winners: number;
    }[];
  };
  recipients: {
    userId: string;
    username: string;
    amount: number;
    rank?: number;
    status: 'pending' | 'distributed' | 'claimed';
    distributedAt?: string;
  }[];
}

interface DistributionRecord {
  id: string;
  poolId: string;
  poolName: string;
  userId: string;
  username: string;
  amount: number;
  currency: string;
  type: 'automatic' | 'manual';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionHash?: string;
  createdAt: string;
  processedAt?: string;
  notes?: string;
}

export const RewardDistribution: React.FC = () => {
  const [rewardPools, setRewardPools] = useState<RewardPool[]>([]);
  const [distributionRecords, setDistributionRecords] = useState<DistributionRecord[]>([]);
  const [selectedPool, setSelectedPool] = useState<RewardPool | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDistributeDialogOpen, setIsDistributeDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pools');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadRewardPools();
    loadDistributionRecords();
  }, []);

  const loadRewardPools = async () => {
    try {
      // Mock data - replace with actual API call
      const mockPools: RewardPool[] = [
        {
          id: '1',
          name: 'Q1 2024 Achievement Rewards',
          description: 'Rewards for top performers in Q1 2024',
          type: 'achievement',
          totalAmount: 10000,
          currency: 'STX',
          distributedAmount: 7500,
          remainingAmount: 2500,
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-03-31T23:59:59Z',
          status: 'active',
          eligibility: {
            minTier: 'Silver',
            minPoints: 500
          },
          distributionRules: {
            type: 'tiered',
            tiers: [
              { rank: 1, percentage: 30, amount: 3000, winners: 1 },
              { rank: 2, percentage: 20, amount: 2000, winners: 2 },
              { rank: 3, percentage: 15, amount: 1500, winners: 3 },
              { rank: 4, percentage: 10, amount: 1000, winners: 5 }
            ]
          },
          recipients: [
            { userId: 'user1', username: 'john_developer', amount: 3000, rank: 1, status: 'distributed', distributedAt: '2024-04-01T10:00:00Z' },
            { userId: 'user2', username: 'jane_designer', amount: 2000, rank: 2, status: 'distributed', distributedAt: '2024-04-01T10:05:00Z' },
            { userId: 'user3', username: 'bob_freelancer', amount: 1500, rank: 3, status: 'pending' }
          ]
        },
        {
          id: '2',
          name: 'Referral Program Bonus',
          description: 'Monthly bonus for successful referrals',
          type: 'referral',
          totalAmount: 5000,
          currency: 'STX',
          distributedAmount: 1200,
          remainingAmount: 3800,
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-12-31T23:59:59Z',
          status: 'active',
          eligibility: {
            minTier: 'Bronze',
            minPoints: 100
          },
          distributionRules: {
            type: 'equal'
          },
          recipients: [
            { userId: 'user4', username: 'alice_marketer', amount: 200, status: 'distributed', distributedAt: '2024-01-15T14:30:00Z' },
            { userId: 'user5', username: 'charlie_networker', amount: 200, status: 'distributed', distributedAt: '2024-01-20T09:15:00Z' },
            { userId: 'user6', username: 'diana_connector', amount: 200, status: 'distributed', distributedAt: '2024-01-25T16:45:00Z' },
            { userId: 'user7', username: 'evan_referrer', amount: 200, status: 'distributed', distributedAt: '2024-02-01T11:20:00Z' },
            { userId: 'user8', username: 'frank_builder', amount: 200, status: 'distributed', distributedAt: '2024-02-05T13:10:00Z' },
            { userId: 'user9', username: 'grace_grower', amount: 200, status: 'pending' }
          ]
        },
        {
          id: '3',
          name: 'Tournament Prize Pool',
          description: 'Hackathon tournament rewards',
          type: 'tournament',
          totalAmount: 15000,
          currency: 'STX',
          distributedAmount: 0,
          remainingAmount: 15000,
          startDate: '2024-02-15T00:00:00Z',
          endDate: '2024-02-20T23:59:59Z',
          status: 'scheduled',
          eligibility: {
            minTier: 'Gold',
            minPoints: 1500,
            requiredAchievements: ['hackathon_participant']
          },
          distributionRules: {
            type: 'performance',
            tiers: [
              { rank: 1, percentage: 40, amount: 6000, winners: 1 },
              { rank: 2, percentage: 25, amount: 3750, winners: 2 },
              { rank: 3, percentage: 15, amount: 2250, winners: 3 },
              { rank: 4, percentage: 10, amount: 1500, winners: 5 },
              { rank: 5, percentage: 5, amount: 750, winners: 10 }
            ]
          },
          recipients: []
        }
      ];

      setRewardPools(mockPools);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load reward pools",
        variant: "destructive"
      });
    }
  };

  const loadDistributionRecords = async () => {
    try {
      // Mock data - replace with actual API call
      const mockRecords: DistributionRecord[] = [
        {
          id: '1',
          poolId: '1',
          poolName: 'Q1 2024 Achievement Rewards',
          userId: 'user1',
          username: 'john_developer',
          amount: 3000,
          currency: 'STX',
          type: 'automatic',
          status: 'completed',
          transactionHash: '0x1234...5678',
          createdAt: '2024-04-01T10:00:00Z',
          processedAt: '2024-04-01T10:02:00Z'
        },
        {
          id: '2',
          poolId: '1',
          poolName: 'Q1 2024 Achievement Rewards',
          userId: 'user2',
          username: 'jane_designer',
          amount: 2000,
          currency: 'STX',
          type: 'automatic',
          status: 'completed',
          transactionHash: '0x2345...6789',
          createdAt: '2024-04-01T10:05:00Z',
          processedAt: '2024-04-01T10:07:00Z'
        },
        {
          id: '3',
          poolId: '2',
          poolName: 'Referral Program Bonus',
          userId: 'user3',
          username: 'bob_freelancer',
          amount: 200,
          currency: 'STX',
          type: 'manual',
          status: 'pending',
          createdAt: '2024-02-10T15:30:00Z',
          notes: 'Pending manual verification'
        }
      ];

      setDistributionRecords(mockRecords);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load distribution records",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-4 w-4" />;
      case 'milestone': return <Target className="h-4 w-4" />;
      case 'tournament': return <Award className="h-4 w-4" />;
      case 'referral': return <Users className="h-4 w-4" />;
      case 'bonus': return <Gift className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const filteredPools = rewardPools.filter(pool => {
    const matchesSearch = pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || pool.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredRecords = distributionRecords.filter(record => {
    const matchesSearch = record.poolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const distributeRewards = async (poolId: string) => {
    try {
      // API call to distribute rewards
      toast({
        title: "Distribution Started",
        description: "Reward distribution has been initiated"
      });
      setIsDistributeDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start distribution",
        variant: "destructive"
      });
    }
  };

  const createRewardPool = async (poolData: any) => {
    try {
      // API call to create reward pool
      toast({
        title: "Pool Created",
        description: "Reward pool has been created successfully"
      });
      setIsCreateDialogOpen(false);
      loadRewardPools();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create reward pool",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reward Distribution</h2>
          <p className="text-muted-foreground">Manage reward pools and distributions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Pool
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">
              {rewardPools.reduce((sum, pool) => sum + pool.totalAmount, 0).toLocaleString()} STX
            </div>
            <div className="text-sm text-muted-foreground">Total Pool Value</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">
              {rewardPools.reduce((sum, pool) => sum + pool.distributedAmount, 0).toLocaleString()} STX
            </div>
            <div className="text-sm text-muted-foreground">Distributed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">
              {rewardPools.reduce((sum, pool) => sum + pool.recipients.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Recipients</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{rewardPools.length}</div>
            <div className="text-sm text-muted-foreground">Active Pools</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pools">Reward Pools</TabsTrigger>
          <TabsTrigger value="records">Distribution Records</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reward pools..."
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reward Pools List */}
          <div className="space-y-4">
            {filteredPools.map((pool) => (
              <Card key={pool.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getTypeIcon(pool.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{pool.name}</h3>
                        <p className="text-sm text-muted-foreground">{pool.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(pool.status)}>
                            {pool.status}
                          </Badge>
                          <Badge variant="outline">
                            {pool.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{pool.totalAmount.toLocaleString()} {pool.currency}</div>
                      <div className="text-sm text-muted-foreground">Total Pool</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Distribution Progress</span>
                      <span>{pool.distributedAmount.toLocaleString()} / {pool.totalAmount.toLocaleString()} {pool.currency}</span>
                    </div>
                    <Progress 
                      value={(pool.distributedAmount / pool.totalAmount) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Pool Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="text-sm font-medium">
                        {new Date(pool.startDate).toLocaleDateString()} - {new Date(pool.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Eligibility</div>
                      <div className="text-sm font-medium">
                        {pool.eligibility.minTier}+ • {pool.eligibility.minPoints}+ points
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Recipients</div>
                      <div className="text-sm font-medium">
                        {pool.recipients.length} users
                      </div>
                    </div>
                  </div>

                  {/* Recipients Preview */}
                  {pool.recipients.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground mb-2">Recent Recipients</div>
                      <div className="flex flex-wrap gap-2">
                        {pool.recipients.slice(0, 5).map((recipient, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {recipient.username} • {recipient.amount} {pool.currency}
                          </Badge>
                        ))}
                        {pool.recipients.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{pool.recipients.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPool(pool)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {pool.status === 'active' && pool.remainingAmount > 0 && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPool(pool);
                          setIsDistributeDialogOpen(true);
                        }}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Distribute
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search distribution records..."
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribution Records */}
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Wallet className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{record.username}</h4>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {record.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {record.poolName} • {record.amount} {record.currency}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Created {new Date(record.createdAt).toLocaleDateString()}
                          {record.processedAt && (
                            <span> • Processed {new Date(record.processedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                        {record.notes && (
                          <div className="text-xs text-blue-600 mt-1">
                            {record.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold">{record.amount} {record.currency}</div>
                      {record.transactionHash && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {record.transactionHash.slice(0, 10)}...
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Distribution by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chart visualization will be implemented here</p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Distribution Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Timeline visualization will be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Pool Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Reward Pool</DialogTitle>
            <DialogDescription>
              Set up a new reward pool for distribution
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Pool Name</Label>
                <Input placeholder="Enter pool name" />
              </div>
              <div>
                <Label>Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="tournament">Tournament</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Description</Label>
              <Input placeholder="Describe the reward pool" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Amount</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div>
                <Label>Currency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STX">STX</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createRewardPool({})}>
              Create Pool
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Distribution Dialog */}
      <Dialog open={isDistributeDialogOpen} onOpenChange={setIsDistributeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Distribute Rewards</DialogTitle>
            <DialogDescription>
              Process reward distribution for {selectedPool?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedPool && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Pool Amount:</span>
                  <span className="font-medium">{selectedPool.totalAmount} {selectedPool.currency}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Already Distributed:</span>
                  <span className="font-medium">{selectedPool.distributedAmount} {selectedPool.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available to Distribute:</span>
                  <span className="font-medium text-green-600">{selectedPool.remainingAmount} {selectedPool.currency}</span>
                </div>
              </div>
              
              <div>
                <Label>Pending Recipients</Label>
                <div className="mt-2 space-y-2">
                  {selectedPool.recipients.filter(r => r.status === 'pending').map((recipient, index) => (
                    <div key={index} className="flex justify-between p-2 border rounded">
                      <span>{recipient.username}</span>
                      <span className="font-medium">{recipient.amount} {selectedPool.currency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDistributeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedPool && distributeRewards(selectedPool.id)}>
              Process Distribution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
