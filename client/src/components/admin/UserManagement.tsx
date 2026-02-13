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
  Edit, 
  Ban, 
  Shield, 
  UserPlus,
  Users,
  Mail,
  Calendar,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'freelancer' | 'client' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  reputation: number;
  completedProjects: number;
  totalEarnings: number;
  joinedAt: string;
  lastActive: string;
  xVerified: boolean;
  xHandle?: string;
  nftAchievements: number;
  isOnline: boolean;
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected';
}

interface UserManagementProps {
  className?: string;
}

export function UserManagement({ className }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  
  const { toast } = useToast();

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: 'user1',
        username: 'alice_freelancer',
        email: 'alice@example.com',
        role: 'freelancer',
        status: 'active',
        reputation: 8500,
        completedProjects: 42,
        totalEarnings: 850000000, // 850 STX in microstacks
        joinedAt: '2023-06-15T10:30:00Z',
        lastActive: '2024-01-15T14:20:00Z',
        xVerified: true,
        xHandle: '@alice_dev',
        nftAchievements: 3,
        isOnline: true,
        kycStatus: 'verified'
      },
      {
        id: 'user2',
        username: 'bob_client',
        email: 'bob@company.com',
        role: 'client',
        status: 'active',
        reputation: 3200,
        completedProjects: 8,
        totalEarnings: 0,
        joinedAt: '2023-08-20T09:15:00Z',
        lastActive: '2024-01-14T16:45:00Z',
        xVerified: false,
        nftAchievements: 0,
        isOnline: false,
        kycStatus: 'pending'
      },
      {
        id: 'user3',
        username: 'charlie_freelance',
        email: 'charlie@freelance.com',
        role: 'freelancer',
        status: 'suspended',
        reputation: 1200,
        completedProjects: 3,
        totalEarnings: 120000000, // 120 STX
        joinedAt: '2023-09-10T11:00:00Z',
        lastActive: '2024-01-10T08:30:00Z',
        xVerified: true,
        xHandle: '@charlie_codes',
        nftAchievements: 1,
        isOnline: false,
        kycStatus: 'verified'
      },
      {
        id: 'user4',
        username: 'diana_admin',
        email: 'diana@stxworx.com',
        role: 'admin',
        status: 'active',
        reputation: 10000,
        completedProjects: 0,
        totalEarnings: 0,
        joinedAt: '2023-05-01T12:00:00Z',
        lastActive: '2024-01-15T15:30:00Z',
        xVerified: true,
        xHandle: '@diana_stxworx',
        nftAchievements: 5,
        isOnline: true,
        kycStatus: 'verified'
      }
    ];
    
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    setIsLoading(false);
  }, []);

  // Filter users
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.xHandle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'freelancer': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKycColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatEarnings = (earnings: number) => {
    const stx = earnings / 1000000; // Convert from microstacks
    return `${stx.toFixed(2)} STX`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleUserAction = async (userId: string, action: string, reason?: string) => {
    setActionLoading(userId);
    
    try {
      // TODO: Implement actual API call
      console.log(`Performing ${action} on user ${userId}`, reason);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          switch (action) {
            case 'suspend':
              return { ...user, status: 'suspended' as any };
            case 'activate':
              return { ...user, status: 'active' as any };
            case 'verify_kyc':
              return { ...user, kycStatus: 'verified' as any };
            case 'reject_kyc':
              return { ...user, kycStatus: 'rejected' as any };
            default:
              return user;
          }
        }
        return user;
      }));
      
      toast({
        title: "Action Completed",
        description: `User ${action} successful`,
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: `Failed to ${action} user`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const refreshUsers = () => {
    setIsLoading(true);
    // TODO: Implement actual refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Loading user data...</CardDescription>
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
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage platform users and their permissions
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={refreshUsers} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                      Create a new user account on the platform
                    </DialogDescription>
                  </DialogHeader>
                  {/* TODO: Add user creation form */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" placeholder="Enter username" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Enter email" />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="freelancer">Freelancer</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">Create User</Button>
                  </div>
                </DialogContent>
              </Dialog>
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
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">{users.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active</p>
                      <p className="text-2xl font-bold">
                        {users.filter(u => u.status === 'active').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Online</p>
                      <p className="text-2xl font-bold">
                        {users.filter(u => u.isOnline).length}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">KYC Verified</p>
                      <p className="text-2xl font-bold">
                        {users.filter(u => u.kycStatus === 'verified').length}
                      </p>
                    </div>
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reputation</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>X</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {user.isOnline && (
                              <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">
                              Joined {formatDate(user.joinedAt)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">{user.reputation}</span>
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        </div>
                      </TableCell>
                      <TableCell>{user.completedProjects}</TableCell>
                      <TableCell>
                        {user.role === 'freelancer' ? formatEarnings(user.totalEarnings) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getKycColor(user.kycStatus)}>
                          {user.kycStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {user.xVerified ? (
                            <>
                              <span className="text-sm text-blue-600">{user.xHandle}</span>
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                            </>
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditUser(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.status === 'active' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'suspend')}
                              disabled={actionLoading === user.id}
                            >
                              <Ban className="h-4 w-4 text-red-500" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'activate')}
                              disabled={actionLoading === user.id}
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <Badge className={getRoleColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedUser.status)}>
                    {selectedUser.status}
                  </Badge>
                </div>
                <div>
                  <Label>Reputation</Label>
                  <p className="font-medium">{selectedUser.reputation}</p>
                </div>
                <div>
                  <Label>Completed Projects</Label>
                  <p className="font-medium">{selectedUser.completedProjects}</p>
                </div>
                <div>
                  <Label>Total Earnings</Label>
                  <p className="font-medium">
                    {selectedUser.role === 'freelancer' ? formatEarnings(selectedUser.totalEarnings) : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label>NFT Achievements</Label>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{selectedUser.nftAchievements}</span>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Verification Status</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>KYC Status</span>
                    <Badge className={getKycColor(selectedUser.kycStatus)}>
                      {selectedUser.kycStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>X Verification</span>
                    <Badge variant={selectedUser.xVerified ? 'default' : 'secondary'}>
                      {selectedUser.xVerified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Activity */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Activity</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="font-medium">{formatDate(selectedUser.joinedAt)}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-500">Last Active</p>
                    <p className="font-medium">{formatDate(selectedUser.lastActive)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                {selectedUser.kycStatus === 'pending' && (
                  <>
                    <Button 
                      onClick={() => handleUserAction(selectedUser.id, 'verify_kyc')}
                      disabled={actionLoading === selectedUser.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve KYC
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleUserAction(selectedUser.id, 'reject_kyc')}
                      disabled={actionLoading === selectedUser.id}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject KYC
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserManagement;
