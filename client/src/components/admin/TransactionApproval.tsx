import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Shield, 
  ExternalLink, 
  RefreshCw,
  Eye,
  Download,
  Users,
  Calendar,
  DollarSign,
  Hash,
  CheckSquare,
  AlertCircle,
  Info,
  Timer
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface Transaction {
  id: string;
  type: 'escrow_release' | 'dao_fee' | 'emergency_withdraw' | 'contract_update';
  status: 'pending' | 'approved' | 'executed' | 'failed' | 'expired';
  proposer: string;
  proposerName: string;
  targetContract: string;
  functionName: string;
  functionArgs: string[];
  description: string;
  amount?: number;
  tokenType: string;
  createdAt: string;
  executeAt?: string;
  expiresAt?: string;
  approvals: Array<{
    signerId: string;
    signerName: string;
    timestamp: string;
  }>;
  executionResult?: {
    success: boolean;
    txHash?: string;
    error?: string;
    executedAt?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface TransactionApprovalProps {
  className?: string;
}

export function TransactionApproval({ className }: TransactionApprovalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalData, setApprovalData] = useState({
    reason: '',
    notes: ''
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showBatchApproval, setShowBatchApproval] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockTransactions: Transaction[] = [
      {
        id: 'tx_001',
        type: 'escrow_release',
        status: 'pending',
        proposer: 'admin_001',
        proposerName: 'Admin User',
        targetContract: 'freelance-logic-v1',
        functionName: 'release-milestone-payment',
        functionArgs: ['0', '1'],
        description: 'Release milestone 1 payment for project #001',
        amount: 9000000, // 0.09 STX
        tokenType: 'STX',
        createdAt: '2024-01-15T10:30:00Z',
        executeAt: '2024-01-15T16:30:00Z',
        expiresAt: '2024-01-15T16:30:00Z',
        approvals: [
          { signerId: 'signer_001', signerName: 'Signer 1', timestamp: '2024-01-15T11:00:00Z' },
          { signerId: 'signer_002', signerName: 'Signer 2', timestamp: '2024-01-15T11:00:00Z' }
        ],
        priority: 'medium'
      },
      {
        id: 'tx_002',
        type: 'dao_fee',
        status: 'approved',
        proposer: 'system',
        proposerName: 'System',
        targetContract: 'freelance-logic-v1',
        functionName: 'collect-dao-fee',
        functionArgs: [],
        description: 'Collect 10% platform fee from milestone payment',
        amount: 1000000, // 0.01 STX
        tokenType: 'STX',
        createdAt: '2024-01-15T09:15:00Z',
        approvals: [
          { signerId: 'signer_001', signerName: 'Signer 1', timestamp: '2024-01-15T09:30:00Z' },
          { signerId: 'signer_002', signerName: 'Signer 2', timestamp: '2024-01-15T09:30:00Z' },
          { signerId: 'signer_003', signerName: 'Signer 3', timestamp: '2024-01-15T09:30:00Z' }
        ],
        priority: 'low'
      },
      {
        id: 'tx_003',
        type: 'emergency_withdraw',
        status: 'pending',
        proposer: 'admin_001',
        proposerName: 'Admin User',
        targetContract: 'freelance-security-v1',
        functionName: 'emergency-withdraw-all-funds',
        functionArgs: [],
        description: 'Emergency withdraw all funds from escrow contracts',
        createdAt: '2024-01-14T16:45:00Z',
        executeAt: '2024-01-14T17:00:00Z',
        expiresAt: '2024-01-14T17:00:00Z',
        approvals: [],
        priority: 'critical'
      },
      {
        id: 'tx_004',
        type: 'contract_update',
        status: 'executed',
        proposer: 'admin_001',
        proposerName: 'Admin User',
        targetContract: 'freelance-data-v1',
        functionName: 'update-category',
        functionArgs: ['category_id', 'name', 'icon'],
        description: 'Add new development category',
        createdAt: '2024-01-13T14:20:00Z',
        approvals: [
          { signerId: 'signer_001', signerName: 'Signer 1', timestamp: '2024-01-13T14:30:00Z' },
          { signerId: 'signer_002', signerName: 'Calendar', timestamp: '2024-01-13T14:30:00Z' }
        ],
        executionResult: {
          success: true,
          txHash: '0xabc123...',
          executedAt: '2024-01-13T15:00:00Z'
        },
        priority: 'medium'
      }
    ];
    
    setTransactions(mockTransactions);
    setFilteredTransactions(mockTransactions);
    setIsLoading(false);
  }, []);

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(tx => tx.priority === priorityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }

    setFilteredTransactions(filtered);
  }, [transactions, statusFilter, priorityFilter, typeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'executed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'escrow_release': return <DollarSign className="h-4 w-4" />;
      case 'dao_fee': return <DollarSign className="h-4 w-4" />;
      case 'emergency_withdraw': return <AlertTriangle className="h-4 w-4" />;
      case 'contract_update': return <RefreshCw className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'executed': return <CheckSquare className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'expired': return <Timer className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatAmount = (amount: number, tokenType: string) => {
    const formatted = (amount / 1000000).toFixed(2);
    return `${formatted} ${tokenType}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const handleApproveTransaction = async (transactionId: string, reason: string, notes?: string) => {
    setActionLoading(transactionId);
    
    try {
      // TODO: Implement actual API call
      console.log(`Approving transaction ${transactionId}`, { reason, notes });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update local state
      setTransactions(prev => prev.map(tx => {
        if (tx.id === transactionId) {
          return {
            ...tx,
            status: 'approved' as any,
            approvals: [
              ...tx.approvals,
              { signerId: 'admin_001', signerName: 'Admin User', timestamp: new Date().toISOString() }
            ]
          };
        }
        return tx;
      }));
      
      toast({
        title: "Transaction Approved",
        description: `Transaction ${transactionId} has been approved`,
      });
      
      setShowApprovalDialog(false);
      setApprovalData({ reason: '', notes: '' });
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Failed to approve transaction",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectTransaction = async (transactionId: string, reason: string) => {
    setActionLoading(transactionId);
    
    try {
      // TODO: Implement actual API call
      console.log(`Rejecting transaction ${transactionId}`, reason);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setTransactions(prev => prev.map(tx => {
        if (tx.id === transactionId) {
          return {
            ...tx,
            status: 'failed' as any,
            executionResult: {
              success: false,
              error: 'Rejected by admin',
              executedAt: new Date().toISOString()
            }
          };
        }
        return tx;
      }));
      
      toast({
        title: "Transaction Rejected",
        description: `Transaction ${transactionId} has been rejected`,
      });
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject transaction",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleExecuteTransaction = async (transactionId: string) => {
    setActionLoading(transactionId);
    
    try {
      // TODO: Implement actual API call
      console.log(`Executing transaction ${transactionId}`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update local state
      setTransactions(prev => prev.map(tx => {
        if (tx.id === transactionId) {
          return {
            ...tx,
            status: 'executed' as any,
            executionResult: {
              success: true,
              txHash: `0x${Math.random().toString(36).substr(2, 8)}`,
              executedAt: new Date().toISOString()
            }
          };
        }
        return tx;
      }));
      
      toast({
        title: "Transaction Executed",
        description: `Transaction ${transactionId} has been executed successfully`,
      });
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: "Failed to execute transaction",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBatchApproval = async () => {
    setActionLoading('batch');
    
    try {
      // TODO: Implement actual API call
      console.log('Batch approving transactions...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update local state for all pending transactions except critical ones
      setTransactions(prev => prev.map(tx => {
        if (tx.status === 'pending' && tx.priority !== 'critical') {
          return {
            ...tx,
            status: 'approved' as any,
            approvals: [
              ...tx.approvals,
              { signerId: 'admin_001', signerName: 'Admin User', timestamp: new Date().toISOString() }
            ]
          };
        }
        return tx;
      }));
      
      setShowBatchApproval(false);
      
      toast({
        title: "Batch Approval Completed",
        description: `${filteredTransactions.filter(tx => tx.status === 'pending' && tx.priority !== 'critical').length} transactions approved`,
      });
    } catch (error) {
      toast({
        title: "Batch Approval Failed",
        description: "Failed to batch approve transactions",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const refreshTransactions = () => {
    setIsLoading(true);
    // TODO: Implement actual refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (isLoading) {
    return (
        <Card className={className}>
          <CardHeader>
            <CardTitle>Transaction Approval</CardTitle>
            <CardDescription>Loading transaction data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          </CardContent>
        </Card>
      );
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Multi-Sig Transaction Approval
              </CardTitle>
              <CardDescription>
                Review and approve multi-signature transactions
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={refreshTransactions} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={showBatchApproval} onOpenChange={setShowBatchApproval}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Batch Approve
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Batch Approval</DialogTitle>
                    <DialogDescription>
                      Approve multiple pending transactions at once
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This will approve all pending transactions except critical ones. Critical transactions require individual review.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                      <div className="p-3 border rounded-lg">
                        <p className="font-medium">Transactions to Approve:</p>
                        <div className="space-y-1">
                          {filteredTransactions
                            .filter(tx => tx.status === 'pending' && tx.priority !== 'critical')
                            .map(tx => (
                              <div key={tx.id} className="flex items-center justify-between p-2 border-b">
                                <span className="text-sm font-medium">{tx.id}</span>
                                <span className="text-sm text-gray-500">{tx.functionName}</span>
                              </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          onClick={handleBatchApproval}
                          disabled={actionLoading === 'batch'}
                          className="flex-1"
                        >
                          {actionLoading === 'batch' ? 'Approving...' : 'Approve All Non-Critical'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowBatchApproval(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Transaction Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-red-600">
                        {transactions.filter(tx => tx.status === 'pending').length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {transactions.filter(tx => tx.status === 'approved').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Executed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {transactions.filter(tx => tx.status === 'executed').length}
                      </p>
                    </div>
                    <CheckSquare className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Failed</p>
                      <p className="text-2xl font-bold text-red-600">
                        {transactions.filter(tx => tx.status === 'failed').length}
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Expired</p>
                      <p className="text-2xl font-bold text-gray-600">
                        {transactions.filter(tx => tx.status === 'expired').length}
                      </p>
                    </div>
                    <Timer className="h-8 w-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="executed">Executed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
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
                  <SelectItem value="escrow_release">Escrow Release</SelectItem>
                  <SelectItem value="dao_fee">DAO Fee Collection</SelectItem>
                  <SelectItem value="emergency_withdraw">Emergency Withdraw</SelectItem>
                  <SelectItem value="contract_update">Contract Update</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transactions Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Proposer</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">
                        {transaction.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(transaction.type)}
                          <span className="text-sm font-medium">{transaction.functionName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(transaction.priority)}>
                          {transaction.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(transaction.status)}
                            <span>{transaction.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{transaction.proposerName}</div>
                          <div className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</div>
                        </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {transaction.expiresAt ? formatDate(transaction.expiresAt) : 'No expiry'}
                        </TableCell>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {transaction.status === 'pending' && (
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setShowApprovalDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {transaction.status === 'approved' && (
                            <Button 
                              size="sm"
                              onClick={() => handleExecuteTransaction(transaction.id)}
                              disabled={actionLoading === transaction.id}
                            >
                              <CheckSquare className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {transaction.status === 'executed' && transaction.executionResult && (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Success
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatTime(transaction.executionResult?.executedAt)}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {transaction.status === 'failed' && (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <Badge className="bg-red-100 text-red-800">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Failed
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatTime(transaction.executionResult?.executedAt)}
                                </span>
                              </div>
                          )}
                          
                          {transaction.status === 'expired' && (
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <Badge className="bg-gray-100 text-gray-800">
                                  <Timer className="h-3 w-3 mr-1" />
                                  Expired
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatDate(transaction.expiresAt)}
                                </span>
                              </div>
                          )}
                        </TableCell>
                      </TableRow>
                </TableBody>
              </Table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No transactions found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={showTransactionDetails} onOpenChange={setShowTransactionDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about transaction #{selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Transaction ID</Label>
                  <p className="font-mono text-xs">{selectedTransaction.id}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(selectedTransaction.type)}
                    <span className="text-sm font-medium">{selectedTransaction.functionName}</span>
                  </div>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge className={getPriorityColor(selectedTransaction.priority)}>
                    {selectedTransaction.priority}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedTransaction.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(selectedTransaction.status)}
                      <span>{selectedTransaction.status}</span>
                    </div>
                </div>
                <div>
                  <Label>Proposer</Label>
                  <p className="font-medium">{selectedTransaction.proposerName}</p>
                  <p className="text-sm text-gray-500">{formatDate(selectedTransaction.createdAt)}</p>
                </div>
                <div>
                  <Label>Target Contract</Label>
                  <p className="font-mono text-xs">{selectedTransaction.targetContract}</p>
                </div>
                <div>
                  <Label>Execute At</Label>
                  <p className="text-sm text-gray-500">
                    {selectedTransaction.executeAt ? formatTime(selectedTransaction.executeAt) : 'Not executed'}
                  </p>
                </div>
              </div>

              {/* Function Details */}
              <div>
                <Label className="text-base font-medium">Function Details</Label>
                <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-2">
                    <div>
                      <Label>Function Name</Label>
                      <p className="font-mono text-sm">{selectedTransaction.functionName}</p>
                    </div>
                    <div className="space-y-1">
                      {selectedTransaction.functionArgs.map((arg, index) => (
                        <div key={index} className="p-2 border rounded bg-white">
                          <p className="font-mono text-xs">{arg}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <Label>Description</Label>
                      <p className="text-sm text-gray-700 mt-2">
                        {selectedTransaction.description}
                      </p>
                    </div>
                  </div>
                </div>

              {/* Approvals */}
              <div>
                <Label className="text-base font-medium">Approvals</Label>
                <div className="space-y-2">
                  {selectedTransaction.approvals.map((approval, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {approval.signerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            {formatDate(approval.timestamp)}
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>

              {/* Execution Result */}
              {selectedTransaction.executionResult && (
                <div>
                  <Label className="text-base font-medium">Execution Result</Label>
                  <div className={`p-4 border rounded-lg ${
                    selectedTransaction.executionResult.success ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center space-x-2">
                      {selectedTransaction.executionResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium">
                        {selectedTransaction.executionResult.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {selectedTransaction.executionResult.error || 'No error details'}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                {selectedTransaction.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                      setSelectedTransaction(selectedTransaction);
                      setShowApprovalDialog(true);
                    }}
                      className="flex-1"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRejectTransaction(selectedTransaction.id, 'Rejected by admin')}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                
                {selectedTransaction.status === 'approved' && (
                  <Button
                    onClick={() => handleExecuteTransaction(selectedTransaction.id)}
                    disabled={actionLoading === selectedTransaction.id}
                    className="flex-1"
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Execute
                  </Button>
                )}
                
                {selectedTransaction.status === 'failed' && (
                  <Button
                    onClick={() => {
                      // TODO: Implement retry functionality
                      toast({
                        title: "Retry Transaction",
                        description: "Retrying failed transaction",
                      });
                    }}
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                )}
                
                {selectedTransaction.status === 'expired' && (
                  <Button
                    onClick={() => {
                      // TODO: Implement retry functionality
                      toast({
                        title: "Transaction Expired",
                        description: "Transaction has expired and cannot be retried",
                      });
                    }}
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}

export default TransactionApproval;
