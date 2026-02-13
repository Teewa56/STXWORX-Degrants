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
  Send, 
  Receive, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Shield, 
  Lock,
  Unlock,
  Users,
  Search,
  Filter,
  Eye,
  Copy,
  ExternalLink,
  Activity,
  ArrowRightLeft,
  ArrowRight,
  Calendar,
  Wallet,
  Gift,
  Key,
  AlertTriangle,
  Info,
  Settings,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransferRestriction {
  id: string;
  type: 'soulbound' | 'timelock' | 'approval' | 'whitelist';
  description: string;
  enabled: boolean;
  parameters: {
    lockTime?: number;
    minReputation?: number;
    allowedAddresses?: string[];
    requireSignature?: boolean;
  };
}

interface TransferRequest {
  id: string;
  from: string;
  to: string;
  achievementId: string;
  achievementName: string;
  achievementImage: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  message?: string;
  restrictions: {
    requiresApproval: boolean;
    timelock: number;
    fee: number;
  };
}

interface TransferHistory {
  id: string;
  from: string;
  to: string;
  achievementId: string;
  achievementName: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: string;
  gasUsed: number;
  fee: number;
  status: 'success' | 'failed' | 'pending';
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  tradable: boolean;
  soulbound: boolean;
  transferRestrictions: TransferRestriction[];
  lastTransferred?: string;
  transferCount: number;
}

export const AchievementTransfer: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [transferHistory, setTransferHistory] = useState<TransferHistory[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('transfer');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferMessage, setTransferMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTransferData();
  }, []);

  const loadTransferData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          name: 'Early Adopter',
          description: 'One of the first 100 users to join the platform',
          image: 'https://ipfs.io/ipfs/QmEarlyAdopter',
          owner: '0xCurrentUser',
          tradable: true,
          soulbound: false,
          transferRestrictions: [
            {
              id: '1',
              type: 'timelock',
              description: '30-day transfer lock after acquisition',
              enabled: true,
              parameters: { lockTime: 30 }
            },
            {
              id: '2',
              type: 'approval',
              description: 'Requires admin approval for transfers',
              enabled: false,
              parameters: { minReputation: 100 }
            }
          ],
          transferCount: 2,
          lastTransferred: '2024-01-10T15:30:00Z'
        },
        {
          id: '2',
          name: 'Community Leader',
          description: 'Recognized community contributor with significant impact',
          image: 'https://ipfs.io/ipfs/QmCommunityLeader',
          owner: '0xCurrentUser',
          tradable: true,
          soulbound: false,
          transferRestrictions: [
            {
              id: '3',
              type: 'whitelist',
              description: 'Can only be transferred to verified addresses',
              enabled: true,
              parameters: { allowedAddresses: ['0xVerified1', '0xVerified2'] }
            }
          ],
          transferCount: 1,
          lastTransferred: '2024-01-05T09:20:00Z'
        },
        {
          id: '3',
          name: 'Genesis Creator',
          description: 'Original platform creator with special privileges',
          image: 'https://ipfs.io/ipfs/QmGenesisCreator',
          owner: '0xCurrentUser',
          tradable: false,
          soulbound: true,
          transferRestrictions: [
            {
              id: '4',
              type: 'soulbound',
              description: 'Permanently bound to current owner',
              enabled: true,
              parameters: {}
            }
          ],
          transferCount: 0
        }
      ];

      const mockTransferRequests: TransferRequest[] = [
        {
          id: '1',
          from: '0xCurrentUser',
          to: '0xRecipient1',
          achievementId: '1',
          achievementName: 'Early Adopter',
          achievementImage: 'https://ipfs.io/ipfs/QmEarlyAdopter',
          status: 'pending',
          createdAt: '2024-01-20T10:30:00Z',
          message: 'Transfer to new community member',
          restrictions: {
            requiresApproval: false,
            timelock: 0,
            fee: 5
          }
        },
        {
          id: '2',
          from: '0xSender1',
          to: '0xCurrentUser',
          achievementId: '2',
          achievementName: 'Community Leader',
          achievementImage: 'https://ipfs.io/ipfs/QmCommunityLeader',
          status: 'approved',
          createdAt: '2024-01-18T14:20:00Z',
          message: 'Thank you for your community contributions',
          restrictions: {
            requiresApproval: true,
            timelock: 86400,
            fee: 10
          }
        }
      ];

      const mockTransferHistory: TransferHistory[] = [
        {
          id: '1',
          from: '0xPreviousOwner',
          to: '0xCurrentUser',
          achievementId: '1',
          achievementName: 'Early Adopter',
          transactionHash: '0x1234...5678',
          blockNumber: 12345,
          timestamp: '2024-01-10T15:30:00Z',
          gasUsed: 21000,
          fee: 5,
          status: 'success'
        },
        {
          id: '2',
          from: '0xCurrentUser',
          to: '0xNewOwner',
          achievementId: '2',
          achievementName: 'Community Leader',
          transactionHash: '0x2345...6789',
          blockNumber: 12350,
          timestamp: '2024-01-05T09:20:00Z',
          gasUsed: 25000,
          fee: 10,
          status: 'success'
        }
      ];

      setAchievements(mockAchievements);
      setTransferRequests(mockTransferRequests);
      setTransferHistory(mockTransferHistory);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transfer data",
        variant: "destructive"
      });
    }
  };

  const initiateTransfer = async (achievementId: string, recipient: string, message?: string) => {
    setIsProcessing(true);
    try {
      // API call to initiate transfer
      const newRequest: TransferRequest = {
        id: Date.now().toString(),
        from: '0xCurrentUser',
        to: recipient,
        achievementId,
        achievementName: achievements.find(a => a.id === achievementId)?.name || '',
        achievementImage: achievements.find(a => a.id === achievementId)?.image || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        message,
        restrictions: {
          requiresApproval: false,
          timelock: 0,
          fee: 5
        }
      };

      setTransferRequests(prev => [newRequest, ...prev]);
      
      toast({
        title: "Transfer Initiated",
        description: "Achievement transfer request has been sent"
      });
      
      setIsTransferDialogOpen(false);
      setRecipientAddress('');
      setTransferMessage('');
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "Failed to initiate transfer",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const approveTransfer = async (requestId: string) => {
    try {
      // API call to approve transfer
      setTransferRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'approved' } : req
      ));
      
      toast({
        title: "Transfer Approved",
        description: "Transfer request has been approved"
      });
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Failed to approve transfer",
        variant: "destructive"
      });
    }
  };

  const rejectTransfer = async (requestId: string) => {
    try {
      // API call to reject transfer
      setTransferRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'rejected' } : req
      ));
      
      toast({
        title: "Transfer Rejected",
        description: "Transfer request has been rejected"
      });
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject transfer",
        variant: "destructive"
      });
    }
  };

  const getRestrictionIcon = (type: string) => {
    switch (type) {
      case 'soulbound': return <Lock className="h-4 w-4" />;
      case 'timelock': return <Clock className="h-4 w-4" />;
      case 'approval': return <Shield className="h-4 w-4" />;
      case 'whitelist': return <Users className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const isTradable = achievement.tradable && !achievement.soulbound;
    return matchesSearch && isTradable;
  });

  const filteredRequests = transferRequests.filter(request => {
    const matchesSearch = request.achievementName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Achievement Transfer</h2>
          <p className="text-muted-foreground">Manage achievement NFT transfers and restrictions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Transfer Settings
          </Button>
        </div>
      </div>

      {/* Transfer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Send className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{achievements.filter(a => a.tradable).length}</div>
            <div className="text-sm text-muted-foreground">Transferable</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Lock className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold">{achievements.filter(a => a.soulbound).length}</div>
            <div className="text-sm text-muted-foreground">Soulbound</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{transferRequests.filter(r => r.status === 'pending').length}</div>
            <div className="text-sm text-muted-foreground">Pending Requests</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{transferHistory.filter(h => h.status === 'success').length}</div>
            <div className="text-sm text-muted-foreground">Completed Transfers</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
        </TabsList>

        <TabsContent value="transfer" className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search achievements to transfer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transferable Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <Card key={achievement.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={achievement.image} 
                        alt={achievement.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold">{achievement.name}</h3>
                        <div className="flex items-center space-x-2">
                          {achievement.soulbound ? (
                            <Badge variant="destructive">
                              <Lock className="h-3 w-3 mr-1" />
                              Soulbound
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Unlock className="h-3 w-3 mr-1" />
                              Transferable
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {achievement.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Transfers:</span>
                      <span className="ml-2 font-medium">{achievement.transferCount}</span>
                    </div>
                    {achievement.lastTransferred && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Last transferred:</span>
                        <span className="ml-2 font-medium">
                          {new Date(achievement.lastTransferred).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {achievement.transferRestrictions.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Transfer Restrictions:</div>
                      <div className="space-y-1">
                        {achievement.transferRestrictions.filter(r => r.enabled).slice(0, 2).map((restriction, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs">
                            {getRestrictionIcon(restriction.type)}
                            <span>{restriction.description}</span>
                          </div>
                        ))}
                        {achievement.transferRestrictions.filter(r => r.enabled).length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{achievement.transferRestrictions.filter(r => r.enabled).length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full"
                    disabled={!achievement.tradable || achievement.soulbound}
                    onClick={() => {
                      setSelectedAchievement(achievement);
                      setIsTransferDialogOpen(true);
                    }}
                  >
                    {achievement.soulbound ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Soulbound
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Transfer
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {/* Request Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transfer requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Requests */}
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={request.achievementImage} 
                        alt={request.achievementName}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{request.achievementName}</h4>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.from.slice(0, 6)}...{request.from.slice(-4)} → {request.to.slice(0, 6)}...{request.to.slice(-4)}
                        </div>
                        {request.message && (
                          <div className="text-sm text-blue-600">
                            "{request.message}"
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Requested {new Date(request.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium mb-2">
                        Fee: {request.restrictions.fee} STX
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => approveTransfer(request.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => rejectTransfer(request.id)}
                          >
                            <AlertCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-3">
            {transferHistory.map((transfer) => (
              <Card key={transfer.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{transfer.achievementName}</h4>
                          <Badge className={getStatusColor(transfer.status)}>
                            {transfer.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transfer.from.slice(0, 6)}...{transfer.from.slice(-4)} → {transfer.to.slice(0, 6)}...{transfer.to.slice(-4)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(transfer.timestamp).toLocaleString()} • Block #{transfer.blockNumber}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium mb-2">
                        {transfer.fee} STX
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {transfer.transactionHash.slice(0, 10)}...
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        asChild
                      >
                        <a 
                          href={`https://explorer.stacks.co/txid/${transfer.transactionHash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="restrictions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Transfer Restrictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Lock className="h-4 w-4 text-red-600" />
                      <div>
                        <div className="font-medium">Soulbound</div>
                        <div className="text-sm text-muted-foreground">
                          Permanently bound to owner
                        </div>
                      </div>
                    </div>
                    <Badge variant="destructive">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <div>
                        <div className="font-medium">Timelock</div>
                        <div className="text-sm text-muted-foreground">
                          Transfer lock period
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">30 days</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium">Whitelist</div>
                        <div className="text-sm text-muted-foreground">
                          Verified addresses only
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">Optional</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Transfer Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Default Transfer Fee</Label>
                  <Input type="number" defaultValue="5" />
                </div>
                
                <div>
                  <Label>Approval Requirement</Label>
                  <Select defaultValue="none">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Approval Required</SelectItem>
                      <SelectItem value="admin">Admin Approval</SelectItem>
                      <SelectItem value="reputation">Minimum Reputation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Default Timelock</Label>
                  <Input type="number" defaultValue="0" placeholder="0 days" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="auto-approve" defaultChecked />
                  <Label htmlFor="auto-approve">Auto-approve incoming transfers</Label>
                </div>
                
                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Transfer Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2" />
              Transfer Achievement
            </DialogTitle>
            <DialogDescription>
              Transfer this achievement to another wallet
            </DialogDescription>
          </DialogHeader>
          {selectedAchievement && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <img 
                  src={selectedAchievement.image} 
                  alt={selectedAchievement.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold">{selectedAchievement.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedAchievement.description}
                  </p>
                </div>
              </div>
              
              <div>
                <Label>Recipient Address</Label>
                <Input
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Message (optional)</Label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Add a message for the recipient..."
                  value={transferMessage}
                  onChange={(e) => setTransferMessage(e.target.value)}
                />
              </div>
              
              {selectedAchievement.transferRestrictions.length > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Transfer Restrictions</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    {selectedAchievement.transferRestrictions.filter(r => r.enabled).map((restriction, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {getRestrictionIcon(restriction.type)}
                        <span>{restriction.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span>Transfer Fee:</span>
                  <span className="font-medium">5 STX</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Estimated Gas:</span>
                  <span className="font-medium">~25,000</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedAchievement && initiateTransfer(selectedAchievement.id, recipientAddress, transferMessage)}
              disabled={!recipientAddress || isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Transfer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
