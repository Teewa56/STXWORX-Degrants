import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Download, 
  RefreshCw,
  Calendar,
  User,
  Shield,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Activity,
  Users,
  TrendingUp,
  AlertCircle,
  Info,
  Hash,
  Globe,
  Database,
  Lock,
  Unlock,
  Key,
  Mail,
  MessageSquare,
  DollarSign,
  Award,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  actionType: string;
  actionData: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'escrow' | 'user' | 'system' | 'security' | 'nft' | 'social';
  status: 'success' | 'failed' | 'warning';
  description: string;
  affectedUserId?: string;
  affectedUserName?: string;
  resourceId?: string;
  resourceType?: string;
}

interface AuditLogViewerProps {
  className?: string;
}

export function AuditLogViewer({ className }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [isExporting, setIsExporting] = useState(false);
  
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockLogs: AuditLog[] = [
      {
        id: 'log_001',
        adminId: 'admin_001',
        adminName: 'Admin User',
        actionType: 'LOGIN_SUCCESS',
        actionData: { method: 'mfa', sessionId: 'sess_123' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: '2024-01-15T10:30:00Z',
        sessionId: 'sess_123',
        severity: 'low',
        category: 'auth',
        status: 'success',
        description: 'Admin login successful with MFA verification'
      },
      {
        id: 'log_002',
        adminId: 'admin_001',
        adminName: 'Admin User',
        actionType: 'ESCROW_APPROVE',
        actionData: { escrowId: 'escrow_001', amount: 50000000, tokenType: 'STX' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: '2024-01-15T11:15:00Z',
        sessionId: 'sess_123',
        severity: 'medium',
        category: 'escrow',
        status: 'success',
        description: 'Approved escrow release for project #001',
        affectedUserId: 'user_001',
        affectedUserName: 'John Doe',
        resourceId: 'escrow_001',
        resourceType: 'escrow'
      },
      {
        id: 'log_003',
        adminId: 'admin_001',
        adminName: 'Admin User',
        actionType: 'USER_SUSPEND',
        actionData: { userId: 'user_002', reason: 'Violation of terms' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: '2024-01-15T12:00:00Z',
        sessionId: 'sess_123',
        severity: 'high',
        category: 'user',
        status: 'success',
        description: 'Suspended user account for policy violation',
        affectedUserId: 'user_002',
        affectedUserName: 'Jane Smith',
        resourceId: 'user_002',
        resourceType: 'user'
      },
      {
        id: 'log_004',
        adminId: 'admin_001',
        adminName: 'Admin User',
        actionType: 'MULTISIG_CREATE',
        actionData: { 
          proposalId: 'prop_001', 
          targetContract: 'freelance-logic-v1',
          functionName: 'emergency-withdraw'
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: '2024-01-15T13:30:00Z',
        sessionId: 'sess_123',
        severity: 'critical',
        category: 'security',
        status: 'success',
        description: 'Created multi-signature proposal for emergency withdrawal',
        resourceId: 'prop_001',
        resourceType: 'proposal'
      },
      {
        id: 'log_005',
        adminId: 'admin_001',
        adminName: 'Admin User',
        actionType: 'NFT_MINT',
        actionData: { 
          userId: 'user_001',
          achievementType: 'gold',
          tokenId: 1001
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: '2024-01-15T14:45:00Z',
        sessionId: 'sess_123',
        severity: 'low',
        category: 'nft',
        status: 'success',
        description: 'Minted gold achievement NFT for user',
        affectedUserId: 'user_001',
        affectedUserName: 'John Doe',
        resourceId: '1001',
        resourceType: 'nft'
      },
      {
        id: 'log_006',
        adminId: 'admin_001',
        adminName: 'Admin User',
        actionType: 'LOGIN_FAILED',
        actionData: { reason: 'Invalid MFA code', attempts: 3 },
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        timestamp: '2024-01-15T15:20:00Z',
        sessionId: 'sess_124',
        severity: 'medium',
        category: 'auth',
        status: 'failed',
        description: 'Failed admin login attempt - Invalid MFA code'
      },
      {
        id: 'log_007',
        adminId: 'admin_001',
        adminName: 'Admin User',
        actionType: 'SYSTEM_BACKUP',
        actionData: { 
          backupType: 'database',
          size: '2.5GB',
          duration: '45s'
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: '2024-01-15T16:00:00Z',
        sessionId: 'sess_123',
        severity: 'low',
        category: 'system',
        status: 'success',
        description: 'Completed scheduled system backup'
      },
      {
        id: 'log_008',
        adminId: 'admin_001',
        adminName: 'Admin User',
        actionType: 'X_VERIFY_USER',
        actionData: { 
          userId: 'user_003',
          xHandle: '@alice_dev',
          followerCount: 12500
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timestamp: '2024-01-15T17:15:00Z',
        sessionId: 'sess_123',
        severity: 'medium',
        category: 'social',
        status: 'success',
        description: 'Verified X (Twitter) account for user',
        affectedUserId: 'user_003',
        affectedUserName: 'Alice Developer',
        resourceId: 'user_003',
        resourceType: 'user'
      }
    ];
    
    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
    setIsLoading(false);
  }, []);

  // Filter logs
  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.affectedUserName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(log => log.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // Date filtering
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(log => 
        new Date(log.timestamp) >= filterDate
      );
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, severityFilter, categoryFilter, statusFilter, dateFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth': return <Shield className="h-4 w-4" />;
      case 'escrow': return <DollarSign className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      case 'security': return <Lock className="h-4 w-4" />;
      case 'nft': return <Award className="h-4 w-4" />;
      case 'social': return <MessageSquare className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const toggleRowExpansion = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // TODO: Implement actual export functionality
      console.log(`Exporting logs as ${exportFormat}`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Export Completed",
        description: `Audit logs exported as ${exportFormat.toUpperCase()}`,
      });
      
      setShowExportDialog(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export audit logs",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const refreshLogs = () => {
    setIsLoading(true);
    // TODO: Implement actual refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Audit Log Viewer</CardTitle>
          <CardDescription>Loading audit logs...</CardDescription>
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
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Audit Log Viewer
              </CardTitle>
              <CardDescription>
                Monitor and review all admin activities
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={refreshLogs} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Audit Logs</DialogTitle>
                    <DialogDescription>
                      Choose format for exporting audit logs
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Export Format</Label>
                      <Select value={exportFormat} onValueChange={(value: 'json' | 'csv' | 'pdf') => setExportFormat(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex-1"
                      >
                        {isExporting ? 'Exporting...' : 'Export Logs'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowExportDialog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Log Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Logs</p>
                      <p className="text-2xl font-bold">{logs.length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Critical</p>
                      <p className="text-2xl font-bold text-red-600">
                        {logs.filter(log => log.severity === 'critical').length}
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
                      <p className="text-sm font-medium text-gray-600">Failed</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {logs.filter(log => log.status === 'failed').length}
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today</p>
                      <p className="text-2xl font-bold text-green-600">
                        {logs.filter(log => {
                          const logDate = new Date(log.timestamp);
                          const today = new Date();
                          return logDate.toDateString() === today.toDateString();
                        }).length}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
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
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="escrow">Escrow</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="nft">NFT</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Audit Logs Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <React.Fragment key={log.id}>
                      <TableRow 
                        className={`cursor-pointer hover:bg-gray-50 ${
                          expandedRows.has(log.id) ? 'bg-gray-50' : ''
                        }`}
                        onClick={() => toggleRowExpansion(log.id)}
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{formatDate(log.timestamp)}</div>
                            <div className="text-xs text-gray-500">{formatTime(log.timestamp)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{log.adminName}</div>
                              <div className="text-xs text-gray-500">{log.adminId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{log.actionType}</div>
                            <div className="text-xs text-gray-500 line-clamp-1">
                              {log.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(log.category)}
                            <Badge variant="outline" className="capitalize">
                              {log.category}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(log.status)}
                            <Badge className={getStatusColor(log.status)}>
                              {log.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">{log.ipAddress}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLog(log);
                                setShowLogDetails(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRowExpansion(log.id);
                              }}
                            >
                              {expandedRows.has(log.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {expandedRows.has(log.id) && (
                        <TableRow>
                          <TableCell colSpan={8} className="bg-gray-50 p-4">
                            <div className="space-y-4">
                              {/* Action Details */}
                              <div>
                                <Label className="text-sm font-medium">Action Details</Label>
                                <div className="mt-1 p-3 bg-white rounded border">
                                  <p className="text-sm text-gray-700">{log.description}</p>
                                </div>
                              </div>
                              
                              {/* Action Data */}
                              <div>
                                <Label className="text-sm font-medium">Action Data</Label>
                                <div className="mt-1 p-3 bg-white rounded border">
                                  <pre className="text-xs text-gray-600 overflow-x-auto">
                                    {JSON.stringify(log.actionData, null, 2)}
                                  </pre>
                                </div>
                              </div>
                              
                              {/* Affected Resources */}
                              {(log.affectedUserId || log.resourceId) && (
                                <div>
                                  <Label className="text-sm font-medium">Affected Resources</Label>
                                  <div className="mt-1 space-y-2">
                                    {log.affectedUserId && (
                                      <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <div>
                                          <p className="text-sm font-medium">{log.affectedUserName}</p>
                                          <p className="text-xs text-gray-500">{log.affectedUserId}</p>
                                        </div>
                                      </div>
                                    )}
                                    {log.resourceId && (
                                      <div className="flex items-center space-x-2 p-2 bg-white rounded border">
                                        <Hash className="h-4 w-4 text-gray-500" />
                                        <div>
                                          <p className="text-sm font-medium">{log.resourceType}</p>
                                          <p className="text-xs text-gray-500">{log.resourceId}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Technical Details */}
                              <div>
                                <Label className="text-sm font-medium">Technical Details</Label>
                                <div className="mt-1 grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs text-gray-500">Session ID</p>
                                    <p className="text-sm font-mono">{log.sessionId}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">User Agent</p>
                                    <p className="text-sm truncate">{log.userAgent}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No audit logs found matching your criteria</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={showLogDetails} onOpenChange={setShowLogDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about log entry #{selectedLog?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              {/* Log Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Log ID</Label>
                  <p className="font-mono text-xs">{selectedLog.id}</p>
                </div>
                <div>
                  <Label>Timestamp</Label>
                  <p className="text-sm">{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <Label>Admin</Label>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedLog.adminName}</p>
                      <p className="text-xs text-gray-500">{selectedLog.adminId}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Action</Label>
                  <p className="text-sm font-medium">{selectedLog.actionType}</p>
                </div>
                <div>
                  <Label>Category</Label>
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(selectedLog.category)}
                    <Badge variant="outline" className="capitalize">
                      {selectedLog.category}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Badge className={getSeverityColor(selectedLog.severity)}>
                    {selectedLog.severity}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedLog.status)}
                    <Badge className={getStatusColor(selectedLog.status)}>
                      {selectedLog.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>IP Address</Label>
                  <p className="text-sm font-mono">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <Label>Session ID</Label>
                  <p className="text-sm font-mono">{selectedLog.sessionId}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-base font-medium">Description</Label>
                <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-700">{selectedLog.description}</p>
                </div>
              </div>

              {/* Action Data */}
              <div>
                <Label className="text-base font-medium">Action Data</Label>
                <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(selectedLog.actionData, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Affected Resources */}
              {(selectedLog.affectedUserId || selectedLog.resourceId) && (
                <div>
                  <Label className="text-base font-medium">Affected Resources</Label>
                  <div className="mt-2 space-y-2">
                    {selectedLog.affectedUserId && (
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{selectedLog.affectedUserName}</p>
                          <p className="text-xs text-gray-500">{selectedLog.affectedUserId}</p>
                        </div>
                      </div>
                    )}
                    {selectedLog.resourceId && (
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <Hash className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{selectedLog.resourceType}</p>
                          <p className="text-xs text-gray-500">{selectedLog.resourceId}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Technical Details */}
              <div>
                <Label className="text-base font-medium">Technical Details</Label>
                <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm">User Agent</Label>
                      <p className="text-sm text-gray-600">{selectedLog.userAgent}</p>
                    </div>
                    <div>
                      <Label className="text-sm">Session ID</Label>
                      <p className="text-sm font-mono">{selectedLog.sessionId}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AuditLogViewer;
