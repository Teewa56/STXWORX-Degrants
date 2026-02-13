import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  FileText,
  Download,
  RefreshCw,
  Gavel,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface Dispute {
  id: string;
  projectId: string;
  projectTitle: string;
  escrowId: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  type: 'payment' | 'quality' | 'deadline' | 'communication' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  description: string;
  amount: number;
  tokenType: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  assignedTo?: string;
  assignedToName?: string;
  evidence: Array<{
    id: string;
    type: 'screenshot' | 'document' | 'message' | 'other';
    name: string;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
  }>;
  timeline: Array<{
    id: string;
    action: string;
    description: string;
    actor: string;
    actorName: string;
    timestamp: string;
  }>;
  resolution?: {
    outcome: 'refund' | 'partial_refund' | 'release' | 'escalate';
    amount: number;
    description: string;
    resolvedBy: string;
    resolvedByName: string;
    resolvedAt: string;
  };
}

interface DisputeResolutionProps {
  className?: string;
}

export function DisputeResolution({ className }: DisputeResolutionProps) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [filteredDisputes, setFilteredDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDisputeDetails, setShowDisputeDetails] = useState(false);
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);
  const [resolutionData, setResolutionData] = useState({
    outcome: '',
    amount: '',
    description: ''
  });
  
  const { toast } = useToast();

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockDisputes: Dispute[] = [
      {
        id: 'disp_001',
        projectId: 'proj_001',
        projectTitle: 'E-commerce Website Development',
        escrowId: 'escrow_001',
        clientId: 'client_001',
        clientName: 'John Doe',
        freelancerId: 'freelancer_001',
        freelancerName: 'Jane Smith',
        type: 'quality',
        severity: 'high',
        status: 'open',
        description: 'Client claims the delivered website does not meet the quality standards specified in the requirements. Multiple bugs and design inconsistencies were found.',
        amount: 50000000, // 50 STX in microstacks
        tokenType: 'STX',
        createdAt: '2024-01-14T10:30:00Z',
        updatedAt: '2024-01-15T14:20:00Z',
        deadline: '2024-01-20T23:59:59Z',
        assignedTo: 'admin_001',
        assignedToName: 'Admin User',
        evidence: [
          {
            id: 'ev_001',
            type: 'screenshot',
            name: 'bug_screenshot_1.png',
            url: '/api/placeholder/300/200',
            uploadedBy: 'client_001',
            uploadedAt: '2024-01-14T10:35:00Z'
          },
          {
            id: 'ev_002',
            type: 'document',
            name: 'requirements.pdf',
            url: '/api/placeholder/100/150',
            uploadedBy: 'client_001',
            uploadedAt: '2024-01-14T10:40:00Z'
          }
        ],
        timeline: [
          {
            id: 'tl_001',
            action: 'created',
            description: 'Dispute created by client',
            actor: 'client_001',
            actorName: 'John Doe',
            timestamp: '2024-01-14T10:30:00Z'
          },
          {
            id: 'tl_002',
            action: 'assigned',
            description: 'Dispute assigned to admin',
            actor: 'admin_001',
            actorName: 'Admin User',
            timestamp: '2024-01-14T11:00:00Z'
          },
          {
            id: 'tl_003',
            action: 'evidence_added',
            description: 'Client added evidence files',
            actor: 'client_001',
            actorName: 'John Doe',
            timestamp: '2024-01-14T10:40:00Z'
          }
        ]
      },
      {
        id: 'disp_002',
        projectId: 'proj_002',
        projectTitle: 'Mobile App UI/UX',
        escrowId: 'escrow_002',
        clientId: 'client_002',
        clientName: 'Alice Johnson',
        freelancerId: 'freelancer_002',
        freelancerName: 'Bob Wilson',
        type: 'payment',
        severity: 'medium',
        status: 'investigating',
        description: 'Freelancer claims they have not received payment for completed milestone 2. Client disputes the quality of work.',
        amount: 25000000, // 25 STX
        tokenType: 'STX',
        createdAt: '2024-01-13T15:45:00Z',
        updatedAt: '2024-01-15T09:20:00Z',
        assignedTo: 'admin_002',
        assignedToName: 'Senior Admin',
        evidence: [],
        timeline: [
          {
            id: 'tl_004',
            action: 'created',
            description: 'Dispute created by freelancer',
            actor: 'freelancer_002',
            actorName: 'Bob Wilson',
            timestamp: '2024-01-13T15:45:00Z'
          },
          {
            id: 'tl_005',
            action: 'investigation_started',
            description: 'Admin began investigation',
            actor: 'admin_002',
            actorName: 'Senior Admin',
            timestamp: '2024-01-14T09:00:00Z'
          }
        ]
      },
      {
        id: 'disp_003',
        projectId: 'proj_003',
        projectTitle: 'Blockchain Integration',
        escrowId: 'escrow_003',
        clientId: 'client_003',
        clientName: 'Charlie Brown',
        freelancerId: 'freelancer_003',
        freelancerName: 'Diana Prince',
        type: 'deadline',
        severity: 'critical',
        status: 'resolved',
        description: 'Project was delivered 2 weeks past the agreed deadline. Client requests partial refund for delay.',
        amount: 75000000, // 75 STX
        tokenType: 'sBTC',
        createdAt: '2024-01-10T08:15:00Z',
        updatedAt: '2024-01-12T16:30:00Z',
        resolution: {
          outcome: 'partial_refund',
          amount: 15000000, // 15 STX refund
          description: 'Partial refund approved for delay. 80% of payment released to freelancer.',
          resolvedBy: 'admin_001',
          resolvedByName: 'Admin User',
          resolvedAt: '2024-01-12T16:30:00Z'
        },
        evidence: [],
        timeline: [
          {
            id: 'tl_006',
            action: 'created',
            description: 'Dispute created by client',
            actor: 'client_003',
            actorName: 'Charlie Brown',
            timestamp: '2024-01-10T08:15:00Z'
          },
          {
            id: 'tl_007',
            action: 'resolved',
            description: 'Dispute resolved with partial refund',
            actor: 'admin_001',
            actorName: 'Admin User',
            timestamp: '2024-01-12T16:30:00Z'
          }
        ]
      }
    ];
    
    setDisputes(mockDisputes);
    setFilteredDisputes(mockDisputes);
    setIsLoading(false);
  }, []);

  // Filter disputes
  useEffect(() => {
    let filtered = disputes;

    if (searchTerm) {
      filtered = filtered.filter(dispute =>
        dispute.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dispute.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dispute.freelancerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dispute.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(dispute => dispute.status === statusFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(dispute => dispute.severity === severityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(dispute => dispute.type === typeFilter);
    }

    setFilteredDisputes(filtered);
  }, [disputes, searchTerm, statusFilter, severityFilter, typeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-green-100 text-green-800';
      case 'quality': return 'bg-purple-100 text-purple-800';
      case 'deadline': return 'bg-orange-100 text-orange-800';
      case 'communication': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number, tokenType: string) => {
    const formatted = (amount / 1000000).toFixed(2);
    return `${formatted} ${tokenType}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDisputeAction = async (disputeId: string, action: string, data?: any) => {
    setActionLoading(disputeId);
    
    try {
      // TODO: Implement actual API call
      console.log(`Performing ${action} on dispute ${disputeId}`, data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      if (action === 'resolve' && data) {
        setDisputes(prev => prev.map(dispute => {
          if (dispute.id === disputeId) {
            return {
              ...dispute,
              status: 'resolved' as any,
              resolution: {
                outcome: data.outcome,
                amount: parseInt(data.amount) * 1000000, // Convert to microstacks
                description: data.description,
                resolvedBy: 'admin_001',
                resolvedByName: 'Admin User',
                resolvedAt: new Date().toISOString()
              }
            };
          }
          return dispute;
        }));
      } else {
        setDisputes(prev => prev.map(dispute => {
          if (dispute.id === disputeId) {
            switch (action) {
              case 'investigate':
                return { ...dispute, status: 'investigating' as any };
              case 'escalate':
                return { ...dispute, status: 'escalated' as any };
              case 'close':
                return { ...dispute, status: 'resolved' as any };
              default:
                return dispute;
            }
          }
          return dispute;
        }));
      }
      
      toast({
        title: "Action Completed",
        description: `Dispute ${action} successful`,
      });
      
      setShowResolutionDialog(false);
      setResolutionData({ outcome: '', amount: '', description: '' });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: `Failed to ${action} dispute`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const refreshDisputes = () => {
    setIsLoading(true);
    // TODO: Implement actual refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Dispute Resolution</CardTitle>
          <CardDescription>Loading dispute data...</CardDescription>
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
              <CardTitle>Dispute Resolution</CardTitle>
              <CardDescription>
                Manage and resolve platform disputes
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={refreshDisputes} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search disputes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dispute Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Disputes</p>
                      <p className="text-2xl font-bold">{disputes.length}</p>
                    </div>
                    <Gavel className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Open</p>
                      <p className="text-2xl font-bold text-red-600">
                        {disputes.filter(d => d.status === 'open').length}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Investigating</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {disputes.filter(d => d.status === 'investigating').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Resolved</p>
                      <p className="text-2xl font-bold text-green-600">
                        {disputes.filter(d => d.status === 'resolved').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Disputes Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Parties</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDisputes.map((dispute) => (
                    <TableRow key={dispute.id}>
                      <TableCell className="font-mono text-xs">
                        {dispute.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{dispute.projectTitle}</div>
                          <div className="text-sm text-gray-500">{dispute.projectId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(dispute.type)}>
                          {dispute.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(dispute.severity)}>
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{dispute.severity}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">{dispute.clientName}</span>
                            <span className="text-gray-500"> vs </span>
                            <span className="font-medium">{dispute.freelancerName}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatAmount(dispute.amount, dispute.tokenType)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {dispute.tokenType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(dispute.status)}>
                          {dispute.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium">{dispute.assignedToName}</div>
                          {dispute.deadline && (
                            <div className="text-xs text-gray-500">
                              Due: {formatDate(dispute.deadline)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedDispute(dispute);
                              setShowDisputeDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {dispute.status === 'open' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDisputeAction(dispute.id, 'investigate')}
                              disabled={actionLoading === dispute.id}
                            >
                              <Scale className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {(dispute.status === 'open' || dispute.status === 'investigating') && (
                            <Dialog open={showResolutionDialog && selectedDispute?.id === dispute.id} onOpenChange={setShowResolutionDialog}>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm"
                                  onClick={() => setSelectedDispute(dispute)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Resolve Dispute</DialogTitle>
                                  <DialogDescription>
                                    Resolve dispute #{dispute.id}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-4">
                                  <div>
                                    <Label>Resolution Outcome</Label>
                                    <Select 
                                      value={resolutionData.outcome} 
                                      onValueChange={(value) => setResolutionData(prev => ({ ...prev, outcome: value }))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select outcome" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="refund">Full Refund</SelectItem>
                                        <SelectItem value="partial_refund">Partial Refund</SelectItem>
                                        <SelectItem value="release">Release Payment</SelectItem>
                                        <SelectItem value="escalate">Escalate</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  {(resolutionData.outcome === 'refund' || resolutionData.outcome === 'partial_refund') && (
                                    <div>
                                      <Label>Refund Amount (STX)</Label>
                                      <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={resolutionData.amount}
                                        onChange={(e) => setResolutionData(prev => ({ ...prev, amount: e.target.value }))}
                                      />
                                    </div>
                                  )}
                                  
                                  <div>
                                    <Label>Description</Label>
                                    <Textarea
                                      placeholder="Describe the resolution details..."
                                      value={resolutionData.description}
                                      onChange={(e) => setResolutionData(prev => ({ ...prev, description: e.target.value }))}
                                      rows={3}
                                    />
                                  </div>
                                  
                                  <div className="flex space-x-2">
                                    <Button 
                                      onClick={() => handleDisputeAction(dispute.id, 'resolve', resolutionData)}
                                      disabled={actionLoading === dispute.id || !resolutionData.outcome}
                                    >
                                      Resolve Dispute
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setShowResolutionDialog(false)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredDisputes.length === 0 && (
              <div className="text-center py-8">
                <Gavel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No disputes found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dispute Details Dialog */}
      <Dialog open={showDisputeDetails} onOpenChange={setShowDisputeDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about dispute #{selectedDispute?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDispute && (
            <div className="space-y-6">
              {/* Dispute Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Project</Label>
                  <p className="font-medium">{selectedDispute.projectTitle}</p>
                </div>
                <div>
                  <Label>Dispute Type</Label>
                  <Badge className={getTypeColor(selectedDispute.type)}>
                    {selectedDispute.type}
                  </Badge>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Badge className={getSeverityColor(selectedDispute.severity)}>
                    {selectedDispute.severity}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedDispute.status)}>
                    {selectedDispute.status}
                  </Badge>
                </div>
                <div>
                  <Label>Amount in Dispute</Label>
                  <p className="font-medium">
                    {formatAmount(selectedDispute.amount, selectedDispute.tokenType)}
                  </p>
                </div>
                <div>
                  <Label>Assigned To</Label>
                  <p className="font-medium">{selectedDispute.assignedToName}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-base font-medium">Description</Label>
                <p className="mt-2 text-gray-700">{selectedDispute.description}</p>
              </div>

              {/* Parties */}
              <div>
                <Label className="text-base font-medium">Involved Parties</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Client</p>
                    <p className="text-sm text-gray-600">{selectedDispute.clientName}</p>
                    <p className="text-xs text-gray-500">ID: {selectedDispute.clientId}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Freelancer</p>
                    <p className="text-sm text-gray-600">{selectedDispute.freelancerName}</p>
                    <p className="text-xs text-gray-500">ID: {selectedDispute.freelancerId}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <Label className="text-base font-medium">Timeline</Label>
                <div className="space-y-2 mt-2">
                  {selectedDispute.timeline.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{event.action}</p>
                          <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                        </div>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <p className="text-xs text-gray-500">by {event.actorName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence */}
              {selectedDispute.evidence.length > 0 && (
                <div>
                  <Label className="text-base font-medium">Evidence</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {selectedDispute.evidence.map((evidence) => (
                      <div key={evidence.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{evidence.name}</p>
                          <Badge variant="outline">{evidence.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Uploaded by {evidence.uploadedBy} on {formatDate(evidence.uploadedAt)}
                        </p>
                        <Button variant="outline" size="sm" className="mt-2">
                          <FileText className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution */}
              {selectedDispute.resolution && (
                <div>
                  <Label className="text-base font-medium">Resolution</Label>
                  <div className="p-4 border rounded-lg bg-green-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Outcome</Label>
                        <p className="font-medium capitalize">{selectedDispute.resolution.outcome}</p>
                      </div>
                      <div>
                        <Label>Amount</Label>
                        <p className="font-medium">
                          {formatAmount(selectedDispute.resolution.amount, selectedDispute.tokenType)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label>Description</Label>
                      <p className="text-gray-700">{selectedDispute.resolution.description}</p>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Resolved by {selectedDispute.resolvedByName} on {formatDate(selectedDispute.resolution.resolvedAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DisputeResolution;
