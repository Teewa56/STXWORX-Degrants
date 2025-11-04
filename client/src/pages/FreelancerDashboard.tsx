import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Coins, TrendingUp, Clock, CheckCircle2, Upload, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type Escrow } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Helper function to get token decimals
const getTokenDecimals = (tokenType: string): number => {
  return tokenType === 'sBTC' ? 100_000_000 : 1_000_000; // sBTC uses 8 decimals, STX uses 6
};

// Helper function to convert micro-units to display amount
const microStacksToStx = (microStacks: number, tokenType: string = 'STX'): number => {
  const decimals = getTokenDecimals(tokenType);
  return microStacks / decimals;
};

export default function FreelancerDashboard() {
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState<string | null>(
    localStorage.getItem('stx_wallet_address')
  );
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<{
    projectId: string;
    onChainId: number | null;
    milestoneNum: number;
  } | null>(null);
  const [completionDescription, setCompletionDescription] = useState('');
  const [completionAttachment, setCompletionAttachment] = useState('');

  const { data: projects, isLoading } = useQuery<any[]>({
    queryKey: ['/api/projects'],
    enabled: !!walletAddress,
  });
  
  // Debug: Log projects data
  if (projects) {
    console.log('📋 All Projects:', projects);
    projects.forEach(p => {
      console.log(`Project ${p.id}:`, {
        onChainId: p.onChainId,
        onChainIdType: typeof p.onChainId,
        totalAmount: p.totalAmount,
        totalAmountType: typeof p.totalAmount
      });
    });
  }

  const completeEscrowMutation = useMutation({
    mutationFn: async ({ 
      id, 
      onChainId, 
      milestoneNum, 
      completionDescription, 
      completionAttachment 
    }: { 
      id: string; 
      onChainId: number | null; 
      milestoneNum: number;
      completionDescription?: string;
      completionAttachment?: string;
    }) => {
      return new Promise((resolve, reject) => {
        if (!onChainId) {
          reject(new Error('No on-chain ID found for this project'));
          return;
        }
        
        console.log('🔍 Complete Milestone Debug:');
        console.log('Database ID:', id);
        console.log('On-Chain ID:', onChainId);
        console.log('Milestone Number:', milestoneNum);
        console.log('On-Chain ID type:', typeof onChainId);
        console.log('On-Chain ID is safe integer:', Number.isSafeInteger(onChainId));
        
        // Validate on-chain ID is a reasonable value (should be small sequential number)
        if (!Number.isSafeInteger(onChainId) || onChainId < 0 || onChainId > 100000) {
          reject(new Error(`Invalid on-chain ID: ${onChainId}. This project may have corrupted data. Please create a new project.`));
          return;
        }
        
        import('@/lib/stacks').then(({ markCompleteOnChain }) => {
          markCompleteOnChain(
            onChainId,
            milestoneNum,
            async (txData) => {
              try {
                // Mark milestone as complete in backend with attachment and description
                console.log('📤 Sending completion data:', {
                  completionDescription,
                  completionAttachment,
                  milestoneNum
                });
                
                const result = await apiRequest('PATCH', `/api/projects/${id}/milestone/${milestoneNum}/complete`, {
                  completionDescription,
                  completionAttachment,
                });
                
                console.log('📥 Server response:', result);
                resolve({ ...result, txId: txData.txId });
              } catch (err) {
                reject(err);
              }
            },
            () => {
              reject(new Error('Transaction cancelled'));
            }
          );
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Milestone Marked Complete',
        description: 'Blockchain transaction confirmed! Waiting for client to release payment.',
      });
      setCompletionDialogOpen(false);
      setCompletionDescription('');
      setCompletionAttachment('');
      setSelectedMilestone(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Transaction Failed',
        description: error.message || 'Failed to mark milestone complete',
        variant: 'destructive',
      });
    },
  });

  const myEscrows = projects?.filter(e => e.freelancerAddress === walletAddress) || [];
  
  // Calculate totals per token type
  const totalLockedSTX = microStacksToStx(
    myEscrows
      .filter(e => (e.status === 'ACTIVE' || e.status === 'PENDING') && e.tokenType === 'STX')
      .reduce((sum, e) => sum + e.totalAmount, 0),
    'STX'
  );
  const totalLockedSBTC = microStacksToStx(
    myEscrows
      .filter(e => (e.status === 'ACTIVE' || e.status === 'PENDING') && e.tokenType === 'sBTC')
      .reduce((sum, e) => sum + e.totalAmount, 0),
    'sBTC'
  );
  const totalReleasedSTX = microStacksToStx(
    myEscrows
      .filter(e => e.status === 'COMPLETED' && e.tokenType === 'STX')
      .reduce((sum, e) => sum + e.totalAmount, 0),
    'STX'
  );
  const totalReleasedSBTC = microStacksToStx(
    myEscrows
      .filter(e => e.status === 'COMPLETED' && e.tokenType === 'sBTC')
      .reduce((sum, e) => sum + e.totalAmount, 0),
    'sBTC'
  );
  const activeCount = myEscrows.filter(e => e.status === 'ACTIVE' || e.status === 'PENDING').length;

  return (
    <div className="min-h-screen text-foreground">
      <Navigation currentPage="freelancer" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
                <p className="text-muted-foreground">Track your earnings and active projects</p>
              </div>
            </div>
          </div>

          {!walletAddress ? (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Connect Wallet Required</CardTitle>
                <CardDescription>
                  Please connect your Stacks wallet from the navigation bar to view your freelancer dashboard
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-6 mb-12">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-primary flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Locked in Escrow
                    </CardDescription>
                    <div className="space-y-1">
                      {totalLockedSTX > 0 && (
                        <CardTitle className="text-3xl font-bold text-primary" data-testid="text-locked-stx">
                          {totalLockedSTX.toFixed(2)} STX
                        </CardTitle>
                      )}
                      {totalLockedSBTC > 0 && (
                        <CardTitle className="text-3xl font-bold text-orange-500" data-testid="text-locked-sbtc">
                          {totalLockedSBTC.toFixed(2)} sBTC
                        </CardTitle>
                      )}
                      {totalLockedSTX === 0 && totalLockedSBTC === 0 && (
                        <CardTitle className="text-3xl font-bold text-muted-foreground">
                          0
                        </CardTitle>
                      )}
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-green-500 flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      Total Earned
                    </CardDescription>
                    <div className="space-y-1">
                      {totalReleasedSTX > 0 && (
                        <CardTitle className="text-3xl font-bold text-green-500" data-testid="text-released-stx">
                          {totalReleasedSTX.toFixed(2)} STX
                        </CardTitle>
                      )}
                      {totalReleasedSBTC > 0 && (
                        <CardTitle className="text-3xl font-bold text-green-400" data-testid="text-released-sbtc">
                          {totalReleasedSBTC.toFixed(2)} sBTC
                        </CardTitle>
                      )}
                      {totalReleasedSTX === 0 && totalReleasedSBTC === 0 && (
                        <CardTitle className="text-3xl font-bold text-muted-foreground">
                          0
                        </CardTitle>
                      )}
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-blue-500 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Active Projects
                    </CardDescription>
                    <CardTitle className="text-4xl font-bold text-blue-500">
                      {activeCount}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-amber-500">Total Projects</CardDescription>
                    <CardTitle className="text-4xl font-bold text-amber-500">
                      {myEscrows.length}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Wallet Address Card */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-lg">Your Wallet Address</CardTitle>
                  <CardDescription className="font-mono text-sm break-all">
                    {walletAddress}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Share this address with clients to receive escrow payments
                  </p>
                </CardContent>
              </Card>

              {/* Offers Section */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Active Offers</h2>
                <Badge variant="outline" className="text-sm">
                  {myEscrows.length} total
                </Badge>
              </div>
              
              {isLoading ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                      <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                    </div>
                    <p className="text-muted-foreground mt-4">Loading offers...</p>
                  </CardContent>
                </Card>
              ) : myEscrows.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground text-lg" data-testid="text-no-offers">
                      No offers yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Share your wallet address with clients to start receiving projects!
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-6"
                      onClick={() => {
                        navigator.clipboard.writeText(walletAddress || '');
                        alert('Address copied to clipboard!');
                      }}
                    >
                      Copy Wallet Address
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {myEscrows.map((project) => (
                    <Card 
                      key={project.id} 
                      className="group hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5"
                      data-testid={`card-offer-${project.id}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              project.status === 'COMPLETED'
                                ? 'bg-green-500/20'
                                : 'bg-primary/20'
                            }`}>
                              {project.status === 'COMPLETED' ? (
                                <Coins className="h-6 w-6 text-green-500" />
                              ) : (
                                <Clock className="h-6 w-6 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <CardTitle className="text-3xl font-bold">
                                  {microStacksToStx(project.totalAmount, project.tokenType).toFixed(2)} {project.tokenType}
                                </CardTitle>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs font-bold ${project.tokenType === 'STX' ? 'border-primary text-primary' : 'border-orange-500 text-orange-500'}`}
                                  data-testid={`badge-token-${project.id}`}
                                >
                                  {project.tokenType}
                                </Badge>
                                {project.category && (
                                  <Badge variant="outline" className="text-xs" data-testid={`badge-category-${project.id}`}>
                                    {project.category}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant={project.status === 'COMPLETED' ? 'secondary' : 'default'}
                                  className={`${project.status === 'COMPLETED' ? 'bg-green-500' : 'bg-primary'}`}
                                  data-testid={`badge-status-${project.id}`}
                                >
                                  {project.status === 'COMPLETED' ? '✅ Completed' : '🔒 Active'}
                                </Badge>
                                {project.subcategory && (
                                  <span className="text-xs text-muted-foreground">
                                    {project.subcategory}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <CardDescription className="font-mono text-xs mt-2">
                          Client: {project.clientAddress.slice(0, 10)}...{project.clientAddress.slice(-6)}
                        </CardDescription>
                      </CardHeader>

                      {project.description && (
                        <CardContent className="pb-3">
                          <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">PROJECT DESCRIPTION</p>
                            <p className="text-sm">{project.description}</p>
                          </div>
                        </CardContent>
                      )}

                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                          <div>
                            Created: {new Date(project.createdAt).toLocaleDateString()}
                          </div>
                          <div>
                            {new Date(project.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </CardContent>

                      {project.status !== 'COMPLETED' && (
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                              <p className="text-xs font-semibold text-blue-400 mb-2">📋 Milestone Status</p>
                              <div className="grid grid-cols-4 gap-2 text-xs">
                                {[1, 2, 3, 4].map((num) => {
                                  const funded = project[`milestone${num}Funded`];
                                  const complete = project[`milestone${num}Complete`];
                                  const released = project[`milestone${num}Released`];
                                  return (
                                    <div key={num} className="text-center">
                                      <div className={`text-lg ${released ? 'text-green-500' : complete ? 'text-yellow-500' : funded ? 'text-blue-500' : 'text-muted-foreground'}`}>
                                        {released ? '✅' : complete ? '⏳' : funded ? '💰' : '○'}
                                      </div>
                                      <div className="text-muted-foreground">M{num}</div>
                                      <div className="text-[10px] text-muted-foreground mt-1">
                                        {(microStacksToStx(project.totalAmount, project.tokenType) / 4).toFixed(2)}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2 text-center">
                                💰 Funded (in escrow) | ⏳ Waiting for approval | ✅ Payment Received
                              </p>
                            </div>

                            {/* Show milestone descriptions */}
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-primary">What You Need to Deliver:</p>
                              {[1, 2, 3, 4].map((num) => {
                                const description = project[`milestone${num}Description`];
                                const attachment = project[`milestone${num}Attachment`];
                                const complete = project[`milestone${num}Complete`];
                                const released = project[`milestone${num}Released`];
                                
                                if (description) {
                                  return (
                                    <div key={`desc-${num}`} className="bg-muted/50 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-semibold">Milestone {num}</p>
                                        <div className="text-xs">
                                          {released ? '✅ Paid' : complete ? '⏳ Pending' : '🚀 Active'}
                                        </div>
                                      </div>
                                      <p className="text-xs text-muted-foreground">{description}</p>
                                      {attachment && (
                                        <div className="mt-2 flex items-center gap-1 text-xs">
                                          <FileText className="h-3 w-3 text-primary" />
                                          <a 
                                            href={attachment} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                          >
                                            View Requirements Document
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Mark work as complete (after delivering):</p>
                              <div className="grid grid-cols-4 gap-2">
                                {[1, 2, 3, 4].map((milestoneNum) => {
                                  const funded = project[`milestone${milestoneNum}Funded`];
                                  const complete = project[`milestone${milestoneNum}Complete`];
                                  const released = project[`milestone${milestoneNum}Released`];
                                  const canComplete = funded && !complete && !released;
                                  
                                  return (
                                    <Button
                                      key={milestoneNum}
                                      size="sm"
                                      onClick={() => {
                                        setSelectedMilestone({
                                          projectId: project.id,
                                          onChainId: project.onChainId,
                                          milestoneNum,
                                        });
                                        setCompletionDialogOpen(true);
                                      }}
                                      disabled={!canComplete}
                                      className={`${released || complete ? 'bg-muted' : canComplete ? 'bg-primary hover:bg-white hover:text-primary hover:border-primary border-2 border-primary' : 'bg-muted'}`}
                                      data-testid={`button-complete-milestone-${project.id}-${milestoneNum}`}
                                    >
                                      {released ? '✅' : complete ? '⏳' : <><CheckCircle2 className="h-3 w-3 mr-1" />M{milestoneNum}</>}
                                    </Button>
                                  );
                                })}
                              </div>
                              <p className="text-xs text-muted-foreground text-center mt-2">
                                {project.milestone1Complete && project.milestone2Complete && project.milestone3Complete && project.milestone4Complete 
                                  ? 'All milestones complete! Waiting for client approval.'
                                  : 'Mark milestones complete after delivering the work'}
                              </p>
                              <p className="text-xs text-green-500 text-center mt-1">
                                💰 Payment is already in escrow - will be released to you after client approval
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      )}

                      {project.status === 'COMPLETED' && (
                        <CardContent className="pt-0">
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-xs text-green-400 flex items-center gap-2">
                            <Coins className="h-4 w-4" />
                            All milestones completed and paid! {microStacksToStx(project.totalAmount, project.tokenType).toFixed(2)} {project.tokenType} earned
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Completion Dialog */}
      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Complete Milestone {selectedMilestone?.milestoneNum}
            </DialogTitle>
            <DialogDescription>
              Provide details about your completed work to help the client review and approve
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="completion-description">
                Completion Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="completion-description"
                placeholder="Describe what you've delivered, key features implemented, testing done, etc..."
                value={completionDescription}
                onChange={(e) => setCompletionDescription(e.target.value)}
                className="min-h-32"
              />
              <p className="text-xs text-muted-foreground">
                Provide a detailed summary of the work completed for this milestone
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="completion-attachment" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Deliverable URL (Optional)
              </Label>
              <Input
                id="completion-attachment"
                placeholder="https://github.com/... or https://drive.google.com/..."
                value={completionAttachment}
                onChange={(e) => setCompletionAttachment(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Link to your deliverable (GitHub repo, design files, demo, documentation, etc.)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCompletionDialogOpen(false);
                setCompletionDescription('');
                setCompletionAttachment('');
                setSelectedMilestone(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!completionDescription.trim()) {
                  toast({
                    title: 'Description Required',
                    description: 'Please provide a description of your completed work',
                    variant: 'destructive',
                  });
                  return;
                }
                if (selectedMilestone) {
                  completeEscrowMutation.mutate({
                    id: selectedMilestone.projectId,
                    onChainId: selectedMilestone.onChainId,
                    milestoneNum: selectedMilestone.milestoneNum,
                    completionDescription,
                    completionAttachment: completionAttachment || undefined,
                  });
                }
              }}
              disabled={completeEscrowMutation.isPending}
              className="bg-primary hover:bg-white hover:text-primary hover:border-primary border-2 border-primary"
            >
              {completeEscrowMutation.isPending ? 'Submitting...' : 'Submit & Mark Complete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
