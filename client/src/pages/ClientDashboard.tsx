import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TokenSelector, type TokenType } from '@/components/TokenSelector';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertEscrowSchema, type InsertEscrow, type Escrow, type Category, type Project } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Lock, CheckCircle2, Briefcase, TrendingUp, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';

// Extended schema for milestone descriptions
const createProjectSchema = insertEscrowSchema.extend({
  milestone1Description: z.string().min(1, "Milestone 1 description required"),
  milestone1Attachment: z.string().optional(),
  milestone2Description: z.string().min(1, "Milestone 2 description required"),
  milestone2Attachment: z.string().optional(),
  milestone3Description: z.string().min(1, "Milestone 3 description required"),
  milestone3Attachment: z.string().optional(),
  milestone4Description: z.string().min(1, "Milestone 4 description required"),
  milestone4Attachment: z.string().optional(),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

// Helper function to convert micro-units to token units
function microStacksToStx(microStacks: number, tokenType: string = 'STX'): number {
  const decimals = getTokenDecimals(tokenType);
  return microStacks / decimals;
}

// Get decimal multiplier based on token type
function getTokenDecimals(tokenType: string): number {
  return tokenType === 'sBTC' ? 100_000_000 : 1_000_000; // sBTC uses 8 decimals, STX uses 6
}

export default function ClientDashboard() {
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState<string | null>(
    localStorage.getItem('stx_wallet_address')
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      clientAddress: walletAddress || '',
      freelancerAddress: '',
      amount: 0,
      tokenType: 'STX',
      description: '',
      category: '',
      subcategory: '',
      milestone1Description: '',
      milestone1Attachment: '',
      milestone2Description: '',
      milestone2Attachment: '',
      milestone3Description: '',
      milestone3Attachment: '',
      milestone4Description: '',
      milestone4Attachment: '',
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: projects, isLoading } = useQuery<any[]>({
    queryKey: ['/api/projects'],
    enabled: !!walletAddress,
  });

  const createEscrowMutation = useMutation({
    mutationFn: async (data: CreateProjectForm) => {
      // Get correct decimal multiplier for token type
      const decimals = getTokenDecimals(data.tokenType);
      
      // Round to prevent floating point errors
      const roundedAmount = Math.round(data.amount * decimals) / decimals;
      
      // Calculate milestone amounts as integers (in micro-units)
      const totalMicroUnits = Math.round(roundedAmount * decimals);
      const milestoneAmount = Math.floor(totalMicroUnits / 4);
      const remainder = totalMicroUnits - (milestoneAmount * 4);
      const lastMilestoneAmount = milestoneAmount + remainder;      // Step 1: Create project in database with milestone descriptions
      const projectResponse = await apiRequest('POST', '/api/projects', {
        clientAddress: data.clientAddress,
        freelancerAddress: data.freelancerAddress,
        totalAmount: totalMicroUnits,
        tokenType: data.tokenType,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        milestone1Amount: milestoneAmount,
        milestone1Description: data.milestone1Description,
        milestone1Attachment: data.milestone1Attachment,
        milestone2Amount: milestoneAmount,
        milestone2Description: data.milestone2Description,
        milestone2Attachment: data.milestone2Attachment,
        milestone3Amount: milestoneAmount,
        milestone3Description: data.milestone3Description,
        milestone3Attachment: data.milestone3Attachment,
        milestone4Amount: lastMilestoneAmount,
        milestone4Description: data.milestone4Description,
        milestone4Attachment: data.milestone4Attachment,
      });
      
      const projectResult = await projectResponse.json();
      console.log('✅ Step 1 complete: Project saved to database', projectResult);
      
      // Show toast that wallet approval is needed
      toast({
        title: 'Approve Transaction',
        description: 'Please approve the transaction in your wallet to lock funds on blockchain.',
      });

      // Step 2: Create project on blockchain - ALL FUNDS TRANSFERRED TO CONTRACT
      return new Promise(async (resolve, reject) => {
        try {
          console.log('✅ Database save successful. Now creating on blockchain...');
          const { createEscrowOnChain, getProjectCount } = await import('@/lib/stacks');
          
          // Get current project count before creating
          const projectCountBefore = await getProjectCount();
          console.log('📊 Project count before creation:', projectCountBefore);
          console.log('📊 Project count type:', typeof projectCountBefore);
          console.log('� Project count is safe integer:', Number.isSafeInteger(projectCountBefore));
          
          // Validate project count is reasonable
          if (!Number.isSafeInteger(projectCountBefore) || projectCountBefore < 0 || projectCountBefore > 100000) {
            reject(new Error(`Invalid project count from blockchain: ${projectCountBefore}`));
            return;
          }
          
          console.log('�🔐 Opening wallet for transaction approval...');
          console.log('⚠️ IMPORTANT: You must APPROVE the transaction in your wallet!');
          
          createEscrowOnChain(
            data.freelancerAddress,
            data.amount,
            data.tokenType as TokenType, // Pass the selected token type
            async (createTxData) => {
              try {
                console.log('✅ Blockchain transaction successful!');
                console.log('Project created, all funds locked in treasury:', createTxData);
                
                // The new project ID will be projectCountBefore + 1
                const onChainProjectId = projectCountBefore + 1;
                console.log('On-chain project ID:', onChainProjectId);
                console.log('On-chain project ID is safe integer:', Number.isSafeInteger(onChainProjectId));
                
                // Step 3: Update project with on-chain details and mark all milestones as funded
                await apiRequest('PATCH', `/api/projects/${projectResult.id}/on-chain`, {
                  onChainId: onChainProjectId,
                  txId: createTxData.txId
                });
                
                // Mark all milestones as funded since money is in contract
                for (let i = 1; i <= 4; i++) {
                  await apiRequest('PATCH', `/api/projects/${projectResult.id}/milestone/${i}/fund`, {});
                }
                
                toast({
                  title: 'Project Created & Funded!',
                  description: `${data.amount} ${data.tokenType} locked in escrow. Freelancer can now start work.`,
                });
                
                resolve({ ...projectResult, onChainId: onChainProjectId, txId: createTxData.txId });
              } catch (err: any) {
                console.error('Error updating project with on-chain data:', err);
                reject(err);
              }
            },
            () => {
              console.error('❌ User cancelled wallet transaction');
              reject(new Error('Transaction cancelled by user'));
            }
          );
        } catch (err: any) {
          console.error('❌ Error in blockchain creation:', err);
          reject(err);
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Success!',
        description: 'Project created and all funds are now locked in escrow.',
      });
      setSelectedCategory('');
      form.reset({
        clientAddress: walletAddress || '',
        freelancerAddress: '',
        amount: 0,
        tokenType: 'STX',
        description: '',
        category: '',
        subcategory: '',
        milestone1Description: '',
        milestone1Attachment: '',
        milestone2Description: '',
        milestone2Attachment: '',
        milestone3Description: '',
        milestone3Attachment: '',
        milestone4Description: '',
        milestone4Attachment: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Transaction Failed',
        description: error.message || 'Failed to create project. Make sure your wallet is connected and you have sufficient funds.',
        variant: 'destructive',
      });
    },
  });

  // Remove fund milestone mutation - no longer needed
  // Funds are transferred when project is created

  const releaseEscrowMutation = useMutation({
    mutationFn: async ({ 
      id, 
      onChainId, 
      milestoneNum, 
      freelancerAddress, 
      milestoneAmount,
      tokenType 
    }: { 
      id: string; 
      onChainId: number | null; 
      milestoneNum: number;
      freelancerAddress?: string;
      milestoneAmount?: number;
      tokenType: TokenType;
    }) => {
      return new Promise((resolve, reject) => {
        if (!onChainId) {
          reject(new Error('No on-chain ID found for this project'));
          return;
        }
        
        // Validate on-chain ID is a reasonable value (should be small sequential number)
        if (!Number.isSafeInteger(onChainId) || onChainId < 0 || onChainId > 100000) {
          reject(new Error(`Invalid on-chain ID: ${onChainId}. This project may have corrupted data. Please create a new project.`));
          return;
        }
        
        import('@/lib/stacks').then(({ releaseEscrowOnChain }) => {
          releaseEscrowOnChain(
            onChainId,
            milestoneNum,
            tokenType, // Use the passed token type
            async (txData) => {
              try {
                // Mark milestone as released in backend
                const result = await apiRequest('PATCH', `/api/projects/${id}/milestone/${milestoneNum}/release`, {});
                resolve({ ...result, txId: txData.txId });
              } catch (err) {
                reject(err);
              }
            },
            () => {
              reject(new Error('Transaction cancelled'));
            },
            freelancerAddress,
            milestoneAmount
          );
        });
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: 'Milestone Payment Released',
        description: 'Blockchain transaction confirmed! Payment sent to freelancer.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Release Failed',
        description: error.message || 'Failed to release milestone. Make sure milestone is marked complete.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateProjectForm) => {
    if (!walletAddress) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate amount is divisible by 4 (for 4 milestones)
    const milestoneAmount = data.amount / 4;
    if (!Number.isInteger(milestoneAmount * 1_000_000)) { // Check in microstacks
      toast({
        title: 'Invalid Amount',
        description: 'Amount must be evenly divisible by 4 for the 4 milestones',
        variant: 'destructive',
      });
      return;
    }
    
    createEscrowMutation.mutate({
      ...data,
      clientAddress: walletAddress,
    });
  };

  const myEscrows = projects?.filter(e => e.clientAddress === walletAddress) || [];
  
  // Calculate totals per token type (only count active/pending projects)
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

  return (
    <div className="min-h-screen text-foreground">
      <Navigation currentPage="client" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Client Dashboard</h1>
                <p className="text-muted-foreground">Manage your freelance projects</p>
              </div>
            </div>
          </div>

          {!walletAddress ? (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Connect Wallet Required</CardTitle>
                <CardDescription>
                  Please connect your Stacks wallet from the navigation bar to access the client dashboard
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-primary">Total Locked</CardDescription>
                    <div className="space-y-1">
                      {totalLockedSTX > 0 && (
                        <CardTitle className="text-3xl font-bold text-primary" data-testid="text-locked-stx">
                          {totalLockedSTX} STX
                        </CardTitle>
                      )}
                      {totalLockedSBTC > 0 && (
                        <CardTitle className="text-3xl font-bold text-orange-500" data-testid="text-locked-sbtc">
                          {totalLockedSBTC} sBTC
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
                    <CardDescription className="text-green-500">Total Released</CardDescription>
                    <div className="space-y-1">
                      {totalReleasedSTX > 0 && (
                        <CardTitle className="text-3xl font-bold text-green-500" data-testid="text-released-stx">
                          {totalReleasedSTX} STX
                        </CardTitle>
                      )}
                      {totalReleasedSBTC > 0 && (
                        <CardTitle className="text-3xl font-bold text-green-400" data-testid="text-released-sbtc">
                          {totalReleasedSBTC} sBTC
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
                    <CardDescription className="text-blue-500">Active Gigs</CardDescription>
                    <CardTitle className="text-4xl font-bold text-blue-500" data-testid="text-active-gigs">
                      {myEscrows.filter(e => e.status === 'ACTIVE' || e.status === 'PENDING').length}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Create Escrow Form */}
                <div>
                  <Card>
                    <CardHeader className="space-y-1 pb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Lock className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Create New Escrow</CardTitle>
                      </div>
                      <CardDescription className="text-base">
                        Lock STX or sBTC funds securely on-chain for your freelance project
                      </CardDescription>
                      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-xs text-blue-400 font-medium mb-1">� Automatic Escrow System</p>
                        <p className="text-xs text-muted-foreground">
                          All funds are transferred to the smart contract immediately when you create the project. Funds are released to the freelancer after you approve each completed milestone.
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <FormField
                            control={form.control}
                            name="freelancerAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">Freelancer Wallet Address</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                                    data-testid="input-freelancer-address"
                                    className="font-mono text-sm h-12 bg-background/50"
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                  Enter the freelancer's Stacks wallet address
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="tokenType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">Token</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-12 bg-background/50" data-testid="select-token-type">
                                        <SelectValue placeholder="Select token" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="STX">STX</SelectItem>
                                      <SelectItem value="sBTC">sBTC</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-muted-foreground">
                                    Token to lock
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-base">Amount</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      step="any"
                                      placeholder="100"
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        // Keep the exact value as entered without rounding
                                        field.onChange(value === '' ? 0 : parseFloat(value));
                                      }}
                                      data-testid="input-amount"
                                      className="h-12 text-lg bg-background/50"
                                    />
                                  </FormControl>
                                  <p className="text-xs text-muted-foreground">
                                    Split into 4 milestones ({field.value ? (Math.round((field.value / 4) * 1000000) / 1000000).toString() : '0'} each)
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">Project Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Website redesign, logo creation, smart contract audit..."
                                    data-testid="input-description"
                                    className="min-h-24 bg-background/50"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-base">Category</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    setSelectedCategory(value);
                                    form.setValue('subcategory', '');
                                  }} 
                                  value={field.value || ''}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-12 bg-background/50" data-testid="select-category">
                                      <SelectValue placeholder="Select project category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categories?.map((cat) => (
                                      <SelectItem key={cat.id} value={cat.name}>
                                        {cat.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                  Choose the work category
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {selectedCategory && (
                            <FormField
                              control={form.control}
                              name="subcategory"
                              render={({ field }) => {
                                const selectedCat = categories?.find(c => c.name === selectedCategory);
                                return (
                                  <FormItem>
                                    <FormLabel className="text-base">Subcategory</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                      <FormControl>
                                        <SelectTrigger className="h-12 bg-background/50" data-testid="select-subcategory">
                                          <SelectValue placeholder="Select specific service" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {selectedCat?.subcategories.map((sub) => (
                                          <SelectItem key={sub} value={sub}>
                                            {sub}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                      Specify the type of work
                                    </p>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />
                          )}

                          {/* Milestone Descriptions */}
                          <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-base font-semibold">Milestone Descriptions</h3>
                            <p className="text-xs text-muted-foreground">
                              Define what needs to be delivered for each milestone
                            </p>
                            
                            <FormField
                              control={form.control}
                              name="milestone1Description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Milestone 1 - Setup & Planning</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      {...field}
                                      placeholder="Initial research, wireframes, project setup..."
                                      className="min-h-20 bg-background/50"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="milestone1Attachment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    Attachment URL (Optional)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="https://drive.google.com/file/... or link to requirements doc"
                                      className="bg-background/50"
                                    />
                                  </FormControl>
                                  <p className="text-xs text-muted-foreground">
                                    Provide a link to requirements, design files, or reference materials
                                  </p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="milestone2Description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Milestone 2 - Development Phase 1</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      {...field}
                                      placeholder="Core functionality, first iteration..."
                                      className="min-h-20 bg-background/50"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="milestone2Attachment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    Attachment URL (Optional)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="https://drive.google.com/file/..."
                                      className="bg-background/50"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="milestone3Description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Milestone 3 - Development Phase 2</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      {...field}
                                      placeholder="Advanced features, testing, refinements..."
                                      className="min-h-20 bg-background/50"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="milestone3Attachment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    Attachment URL (Optional)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="https://drive.google.com/file/..."
                                      className="bg-background/50"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="milestone4Description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Milestone 4 - Final Delivery</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      {...field}
                                      placeholder="Final testing, documentation, deployment..."
                                      className="min-h-20 bg-background/50"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="milestone4Attachment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    Attachment URL (Optional)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="https://drive.google.com/file/..."
                                      className="bg-background/50"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Button
                            type="submit"
                            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-orange-600 hover:from-white hover:to-white hover:text-primary hover:shadow-2xl hover:shadow-primary/30 transition-all border-2 border-transparent hover:border-primary"
                            disabled={createEscrowMutation.isPending}
                            data-testid="button-create-escrow"
                          >
                            <Lock className="h-5 w-5 mr-2" />
                            {createEscrowMutation.isPending ? 'Processing Transaction...' : 'Create Project & Lock Funds'}
                          </Button>
                          <p className="text-xs text-center text-muted-foreground">
                            🔐 All funds will be transferred to escrow immediately. Your wallet will prompt you to sign the transaction.
                          </p>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>

                {/* Active Escrows List */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">My Escrows</h2>
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
                        <p className="text-muted-foreground mt-4">Loading escrows...</p>
                      </CardContent>
                    </Card>
                  ) : myEscrows.length === 0 ? (
                    <Card>
                      <CardContent className="py-16 text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground text-lg" data-testid="text-no-escrows">
                          No projects created yet
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Create your first project to get started
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {myEscrows.map((project) => (
                        <Card 
                          key={project.id} 
                          className="group hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5"
                          data-testid={`card-project-${project.id}`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <CardTitle className="text-2xl font-bold">
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
                                <CardDescription className="font-mono text-xs">
                                  To: {project.freelancerAddress.slice(0, 10)}...{project.freelancerAddress.slice(-6)}
                                </CardDescription>
                                {project.subcategory && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {project.subcategory}
                                  </p>
                                )}
                              </div>
                              <Badge
                                variant={project.status === 'COMPLETED' ? 'secondary' : 'default'}
                                className={project.status === 'COMPLETED' ? 'bg-green-500' : 'bg-primary'}
                                data-testid={`badge-status-${project.id}`}
                              >
                                {project.status === 'COMPLETED' ? '✅ Completed' : '🔒 Active'}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          {project.description && (
                            <CardContent className="pb-3">
                              <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-sm text-muted-foreground">{project.description}</p>
                              </div>
                            </CardContent>
                          )}
                          
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
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2 text-center">
                                    💰 Funded (in escrow) | ⏳ Waiting for approval | ✅ Payment Released
                                  </p>
                                </div>

                                {/* Show milestone descriptions */}
                                <div className="space-y-2">
                                  {[1, 2, 3, 4].map((num) => {
                                    const description = project[`milestone${num}Description`];
                                    const attachment = project[`milestone${num}Attachment`];
                                    const complete = project[`milestone${num}Complete`];
                                    const released = project[`milestone${num}Released`];
                                    const completionAttachment = project[`milestone${num}CompletionAttachment`];
                                    const completionDescription = project[`milestone${num}CompletionDescription`];
                                    
                                    // Debug logging
                                    if (complete) {
                                      console.log(`🔍 Milestone ${num} completion data:`, {
                                        complete,
                                        completionDescription,
                                        completionAttachment,
                                        hasDescription: !!completionDescription,
                                        hasAttachment: !!completionAttachment
                                      });
                                    }
                                    
                                    // Show milestone if it has description OR if it's been completed by freelancer
                                    if (description || complete) {
                                      return (
                                        <div key={`desc-${num}`} className="bg-muted/50 rounded-lg p-3">
                                          <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-semibold">Milestone {num}</p>
                                            <div className="text-xs">
                                              {released ? '✅ Released' : complete ? '⏳ Awaiting Approval' : '⚪ In Progress'}
                                            </div>
                                          </div>
                                          {description && (
                                            <p className="text-xs text-muted-foreground">{description}</p>
                                          )}
                                          {attachment && (
                                            <div className="mt-2 flex items-center gap-1 text-xs">
                                              <FileText className="h-3 w-3 text-primary" />
                                              <a 
                                                href={attachment} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                              >
                                                View Requirements
                                              </a>
                                            </div>
                                          )}
                                          {complete && (completionDescription || completionAttachment) && (
                                            <div className="mt-2 pt-2 border-t border-border/50">
                                              <p className="text-xs font-semibold text-green-600 mb-1">📦 Freelancer's Submission:</p>
                                              {completionDescription && (
                                                <p className="text-xs text-muted-foreground mb-2">{completionDescription}</p>
                                              )}
                                              {completionAttachment && (
                                                <div className="flex items-center gap-1 text-xs">
                                                  <FileText className="h-3 w-3 text-green-600" />
                                                  <a 
                                                    href={completionAttachment} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:underline font-semibold"
                                                  >
                                                    View Deliverable
                                                  </a>
                                                </div>
                                              )}
                                              {!completionDescription && !completionAttachment && (
                                                <p className="text-xs text-muted-foreground italic">No additional details provided</p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>

                                <div>
                                  <p className="text-xs text-muted-foreground mb-2">Approve and release payment after freelancer completes work:</p>
                                  <div className="grid grid-cols-4 gap-2">
                                    {[1, 2, 3, 4].map((milestoneNum) => {
                                      const funded = project[`milestone${milestoneNum}Funded`];
                                      const complete = project[`milestone${milestoneNum}Complete`];
                                      const released = project[`milestone${milestoneNum}Released`];
                                      const canRelease = funded && complete && !released;
                                      
                                      return (
                                        <Button
                                          key={milestoneNum}
                                          size="sm"
                                          onClick={() => releaseEscrowMutation.mutate({ 
                                            id: project.id, 
                                            onChainId: project.onChainId,
                                            milestoneNum,
                                            freelancerAddress: project.freelancerAddress,
                                            milestoneAmount: project[`milestone${milestoneNum}Amount`],
                                            tokenType: project.tokenType as TokenType
                                          })}
                                          disabled={!canRelease || releaseEscrowMutation.isPending}
                                          className={`${released ? 'bg-green-600' : canRelease ? 'bg-primary hover:bg-white hover:text-primary hover:border-primary border-2 border-primary' : 'bg-muted'}`}
                                          data-testid={`button-release-milestone-${project.id}-${milestoneNum}`}
                                        >
                                          {released ? '✅' : canRelease ? `Approve M${milestoneNum}` : `M${milestoneNum}`}
                                        </Button>
                                      );
                                    })}
                                  </div>
                                  <p className="text-xs text-muted-foreground text-center mt-2">
                                    Each milestone = {(microStacksToStx(project.totalAmount, project.tokenType) / 4).toFixed(2)} {project.tokenType}
                                  </p>
                                  <p className="text-xs text-green-500 text-center mt-1">
                                    💰 All funds are locked in escrow and will be released directly to freelancer
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
