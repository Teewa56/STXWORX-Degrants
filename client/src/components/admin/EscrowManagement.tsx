import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  Eye, 
  Pause, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface Escrow {
  id: string;
  projectId: string;
  clientId: string;
  freelancerId: string;
  totalAmount: number;
  tokenType: string;
  status: 'PENDING' | 'FUNDED' | 'ACTIVE' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
  createdAt: string;
  milestones: Array<{
    id: number;
    title: string;
    amount: number;
    completed: boolean;
    released: boolean;
  }>;
  clientName?: string;
  freelancerName?: string;
  projectTitle?: string;
}

interface EscrowManagementProps {
  className?: string;
}

export function EscrowManagement({ className }: EscrowManagementProps) {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [filteredEscrows, setFilteredEscrows] = useState<Escrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEscrow, setSelectedEscrow] = useState<Escrow | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockEscrows: Escrow[] = [
      {
        id: '1',
        projectId: 'proj_001',
        clientId: 'client_001',
        freelancerId: 'freelancer_001',
        totalAmount: 100000000, // 100 STX in microstacks
        tokenType: 'STX',
        status: 'ACTIVE',
        createdAt: '2024-01-15T10:30:00Z',
        milestones: [
          { id: 1, title: 'Design Phase', amount: 25000000, completed: true, released: true },
          { id: 2, title: 'Development', amount: 25000000, completed: true, released: false },
          { id: 3, title: 'Testing', amount: 25000000, completed: false, released: false },
          { id: 4, title: 'Deployment', amount: 25000000, completed: false, released: false },
        ],
        clientName: 'John Doe',
        freelancerName: 'Jane Smith',
        projectTitle: 'E-commerce Website Development'
      },
      {
        id: '2',
        projectId: 'proj_002',
        clientId: 'client_002',
        freelancerId: 'freelancer_002',
        totalAmount: 75000000, // 75 STX
        tokenType: 'STX',
        status: 'FUNDED',
        createdAt: '2024-01-14T14:20:00Z',
        milestones: [
          { id: 1, title: 'Research', amount: 18750000, completed: false, released: false },
          { id: 2, title: 'Design', amount: 18750000, completed: false, released: false },
          { id: 3, title: 'Implementation', amount: 18750000, completed: false, released: false },
          { id: 4, title: 'Documentation', amount: 18750000, completed: false, released: false },
        ],
        clientName: 'Alice Johnson',
        freelancerName: 'Bob Wilson',
        projectTitle: 'Mobile App UI/UX'
      },
      {
        id: '3',
        projectId: 'proj_003',
        clientId: 'client_003',
        freelancerId: 'freelancer_003',
        totalAmount: 50000000, // 50 STX
        tokenType: 'sBTC',
        status: 'DISPUTED',
        createdAt: '2024-01-13T09:15:00Z',
        milestones: [
          { id: 1, title: 'Setup', amount: 12500000, completed: true, released: true },
          { id: 2, title: 'Core Features', amount: 12500000, completed: true, released: true },
          { id: 3, title: 'Advanced Features', amount: 12500000, completed: false, released: false },
          { id: 4, title: 'Testing & QA', amount: 12500000, completed: false, released: false },
        ],
        clientName: 'Charlie Brown',
        freelancerName: 'Diana Prince',
        projectTitle: 'Blockchain Integration'
      }
    ];
    
    setEscrows(mockEscrows);
    setFilteredEscrows(mockEscrows);
    setIsLoading(false);
  }, []);

  // Filter escrows
  useEffect(() => {
    let filtered = escrows;

    if (searchTerm) {
      filtered = filtered.filter(escrow =>
        escrow.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        escrow.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        escrow.freelancerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        escrow.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(escrow => escrow.status === statusFilter);
    }

    setFilteredEscrows(filtered);
  }, [escrows, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FUNDED': return 'bg-blue-100 text-blue-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800';
      case 'DISPUTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'FUNDED': return <CheckCircle className="h-4 w-4" />;
      case 'ACTIVE': return <Play className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'DISPUTED': return <AlertTriangle className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatAmount = (amount: number, tokenType: string) => {
    const formatted = (amount / 1000000).toFixed(2);
    return `${formatted} ${tokenType}`;
  };

  const handleEscrowAction = async (escrowId: string, action: string, reason?: string) => {
    setActionLoading(escrowId);
    
    try {
      // TODO: Implement actual API call
      console.log(`Performing ${action} on escrow ${escrowId}`, reason);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setEscrows(prev => prev.map(escrow => {
        if (escrow.id === escrowId) {
          switch (action) {
            case 'pause':
              return { ...escrow, status: 'CANCELLED' as any };
            case 'unpause':
              return { ...escrow, status: 'ACTIVE' as any };
            case 'approve':
              return { ...escrow, status: 'COMPLETED' as any };
            case 'reject':
              return { ...escrow, status: 'CANCELLED' as any };
            default:
              return escrow;
          }
        }
        return escrow;
      }));
      
      toast({
        title: "Action Completed",
        description: `Escrow ${action} successful`,
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: `Failed to ${action} escrow`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const refreshEscrows = () => {
    setIsLoading(true);
    // TODO: Implement actual refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Escrow Management</CardTitle>
          <CardDescription>Loading escrow data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Escrow Management</CardTitle>
              <CardDescription>
                Manage and monitor all platform escrows
              </CardDescription>
            </div>
            <Button onClick={refreshEscrows} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
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
                  placeholder="Search escrows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FUNDED">Funded</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="DISPUTED">Disputed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Escrow Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Freelancer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEscrows.map((escrow) => (
                    <TableRow key={escrow.id}>
                      <TableCell className="font-mono text-xs">
                        {escrow.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{escrow.projectTitle}</div>
                          <div className="text-sm text-gray-500">{escrow.projectId}</div>
                        </div>
                      </TableCell>
                      <TableCell>{escrow.clientName}</TableCell>
                      <TableCell>{escrow.freelancerName}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatAmount(escrow.totalAmount, escrow.tokenType)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {escrow.tokenType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(escrow.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(escrow.status)}
                            <span>{escrow.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full"
                                style={{ 
                                  width: `${(escrow.milestones.filter(m => m.released).length / escrow.milestones.length) * 100}%` 
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {escrow.milestones.filter(m => m.released).length}/{escrow.milestones.length}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedEscrow(escrow)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Escrow Details</DialogTitle>
                              <DialogDescription>
                                Review and manage escrow #{escrow.id}
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedEscrow && (
                              <div className="space-y-6">
                                {/* Escrow Overview */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Project</Label>
                                    <p className="font-medium">{selectedEscrow.projectTitle}</p>
                                  </div>
                                  <div>
                                    <Label>Amount</Label>
                                    <p className="font-medium">
                                      {formatAmount(selectedEscrow.totalAmount, selectedEscrow.tokenType)}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Client</Label>
                                    <p className="font-medium">{selectedEscrow.clientName}</p>
                                  </div>
                                  <div>
                                    <Label>Freelancer</Label>
                                    <p className="font-medium">{selectedEscrow.freelancerName}</p>
                                  </div>
                                </div>

                                {/* Milestones */}
                                <div>
                                  <Label className="text-base font-medium">Milestones</Label>
                                  <div className="space-y-2 mt-2">
                                    {selectedEscrow.milestones.map((milestone) => (
                                      <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                          <div className={`w-3 h-3 rounded-full ${
                                            milestone.released ? 'bg-green-500' : 
                                            milestone.completed ? 'bg-blue-500' : 'bg-gray-300'
                                          }`} />
                                          <div>
                                            <p className="font-medium">{milestone.title}</p>
                                            <p className="text-sm text-gray-500">
                                              {formatAmount(milestone.amount, selectedEscrow.tokenType)}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          {milestone.completed && (
                                            <Badge variant="outline">Completed</Badge>
                                          )}
                                          {milestone.released && (
                                            <Badge className="bg-green-100 text-green-800">Released</Badge>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex space-x-2">
                                  {selectedEscrow.status === 'ACTIVE' && (
                                    <Button 
                                      variant="outline"
                                      onClick={() => handleEscrowAction(selectedEscrow.id, 'pause')}
                                      disabled={actionLoading === selectedEscrow.id}
                                    >
                                      <Pause className="h-4 w-4 mr-2" />
                                      Pause
                                    </Button>
                                  )}
                                  
                                  {selectedEscrow.status === 'DISPUTED' && (
                                    <>
                                      <Button 
                                        onClick={() => handleEscrowAction(selectedEscrow.id, 'approve')}
                                        disabled={actionLoading === selectedEscrow.id}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                      </Button>
                                      <Button 
                                        variant="destructive"
                                        onClick={() => handleEscrowAction(selectedEscrow.id, 'reject')}
                                        disabled={actionLoading === selectedEscrow.id}
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredEscrows.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No escrows found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EscrowManagement;
