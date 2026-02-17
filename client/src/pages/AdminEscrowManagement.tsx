import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { type Escrow, type Project } from '@shared/schema';

export default function AdminEscrowManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEscrow, setSelectedEscrow] = useState<Escrow | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch all escrows
  const { data: escrows, isLoading, refetch } = useQuery({
    queryKey: ['admin-escrows'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/escrows');
      return response as Escrow[];
    },
  });

  // Fetch all projects
  const { data: projects } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/projects');
      return response as Project[];
    },
  });

  // Update escrow mutation
  const updateEscrowMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Escrow> }) => {
      await apiRequest('PATCH', `/api/escrows/${id}`, updates);
    },
    onSuccess: () => {
      toast({
        title: 'Escrow updated',
        description: 'Escrow status has been updated successfully',
      });
      refetch();
      setEditDialogOpen(false);
    },
    onError: () => {
      toast({
        title: 'Update failed',
        description: 'Failed to update escrow. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Delete escrow mutation
  const deleteEscrowMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/escrows/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Escrow deleted',
        description: 'Escrow has been deleted successfully',
      });
      refetch();
    },
    onError: () => {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete escrow. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Filter escrows
  const filteredEscrows = escrows?.filter(escrow => {
    const matchesSearch = escrow.clientAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         escrow.freelancerAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         escrow.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || escrow.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'created':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Created</Badge>;
      case 'funded':
        return <Badge variant="default"><DollarSign className="w-3 h-3 mr-1" />Funded</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'released':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Released</Badge>;
      case 'disputed':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Disputed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate statistics
  const stats = {
    total: escrows?.length || 0,
    created: escrows?.filter(e => e.status === 'created').length || 0,
    funded: escrows?.filter(e => e.status === 'funded').length || 0,
    completed: escrows?.filter(e => e.status === 'completed').length || 0,
    released: escrows?.filter(e => e.status === 'released').length || 0,
    disputed: escrows?.filter(e => e.status === 'disputed').length || 0,
    totalValue: escrows?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0,
  };

  return (
    <div className="min-h-screen text-foreground">
      <Navigation currentPage="admin" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Escrow Management</h1>
                <p className="text-muted-foreground">Monitor and manage all escrow transactions</p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Escrows</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All escrow contracts</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.funded}</div>
                <p className="text-xs text-muted-foreground">Funded escrows</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">Work completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalValue.toLocaleString()} STX</div>
                <p className="text-xs text-muted-foreground">Total escrow value</p>
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
                      placeholder="Search by address, category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="funded">Funded</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="released">Released</SelectItem>
                      <SelectItem value="disputed">Disputed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escrows Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Escrows ({filteredEscrows.length})</span>
                <Button onClick={() => refetch()} variant="outline" size="sm">
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading escrows...</div>
              ) : filteredEscrows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No escrows found matching your criteria
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEscrows.map((escrow) => (
                    <div key={escrow.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(escrow.status)}
                            <span className="font-medium">{escrow.category}</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(escrow.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Client: </span>
                              <span className="font-mono">{escrow.clientAddress.slice(0, 8)}...{escrow.clientAddress.slice(-8)}</span>
                            </div>
                            {escrow.freelancerAddress && (
                              <div>
                                <span className="text-muted-foreground">Freelancer: </span>
                                <span className="font-mono">{escrow.freelancerAddress.slice(0, 8)}...{escrow.freelancerAddress.slice(-8)}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-muted-foreground">Amount: </span>
                              <span className="font-medium">{escrow.amount} {escrow.tokenType || 'STX'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEscrow(escrow);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEscrow(escrow);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this escrow?')) {
                                deleteEscrowMutation.mutate(escrow.id);
                              }
                            }}
                            disabled={deleteEscrowMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Escrow Details</DialogTitle>
            <DialogDescription>
              Full information about this escrow contract
            </DialogDescription>
          </DialogHeader>
          {selectedEscrow && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ID</Label>
                  <p className="font-mono text-sm">{selectedEscrow.id}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedEscrow.status)}</div>
                </div>
                <div>
                  <Label>Category</Label>
                  <p>{selectedEscrow.category}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="font-medium">{selectedEscrow.amount} {selectedEscrow.tokenType || 'STX'}</p>
                </div>
                <div>
                  <Label>Client Address</Label>
                  <p className="font-mono text-sm">{selectedEscrow.clientAddress}</p>
                </div>
                <div>
                  <Label>Freelancer Address</Label>
                  <p className="font-mono text-sm">{selectedEscrow.freelancerAddress || 'Not assigned'}</p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p>{new Date(selectedEscrow.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Funded</Label>
                  <p>{selectedEscrow.funded ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <Label>Completed</Label>
                  <p>{selectedEscrow.completed ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <Label>Released</Label>
                  <p>{selectedEscrow.released ? 'Yes' : 'No'}</p>
                </div>
              </div>
              {selectedEscrow.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground">{selectedEscrow.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Escrow</DialogTitle>
            <DialogDescription>
              Update escrow status and information
            </DialogDescription>
          </DialogHeader>
          {selectedEscrow && (
            <EscrowEditForm
              escrow={selectedEscrow}
              onSubmit={(updates) => {
                updateEscrowMutation.mutate({ id: selectedEscrow.id, updates });
              }}
              onCancel={() => setEditDialogOpen(false)}
              isPending={updateEscrowMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

function EscrowEditForm({ 
  escrow, 
  onSubmit, 
  onCancel, 
  isPending 
}: { 
  escrow: Escrow; 
  onSubmit: (updates: Partial<Escrow>) => void; 
  onCancel: () => void; 
  isPending: boolean;
}) {
  const [status, setStatus] = useState(escrow.status);
  const [description, setDescription] = useState(escrow.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ status, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="funded">Funded</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="released">Released</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Escrow description..."
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Updating...' : 'Update Escrow'}
        </Button>
      </DialogFooter>
    </form>
  );
}