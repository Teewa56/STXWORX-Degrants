import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Zap, Coins, TrendingUp, Clock, CheckCircle2, Upload, FileText, Briefcase, MessageSquare, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type Project, type Application } from '@shared/schema';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/use-auth';
import ChatWidget from '@/components/chat/MessageCenter';
import XIntegration from '@/components/XIntegration';

// Helper function to get token decimals
const getTokenDecimals = (tokenType: string): number => {
  return tokenType === 'sBTC' ? 100_000_000 : 1_000_000;
};

// Helper function to convert micro-units to display amount
const microStacksToStx = (microStacks: number, tokenType: string = 'STX'): number => {
  const decimals = getTokenDecimals(tokenType);
  return microStacks / decimals;
};

type EnrichedApplication = Application & {
  project: Project;
};

export default function FreelancerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<{ projectId: string; projectTitle: string; otherUserName: string; otherUserRole: string } | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<{
    projectId: string;
    onChainId: number | null;
    milestoneNum: number;
  } | null>(null);
  const [completionDescription, setCompletionDescription] = useState('');
  const [completionAttachment, setCompletionAttachment] = useState('');

  // 1. Fetch ALL projects (for active gigs where I am the freelancer)
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // 2. Fetch MY applications
  const { data: applications, isLoading: isLoadingApps } = useQuery<EnrichedApplication[]>({
    queryKey: ['/api/projects/applied'],
    enabled: !!user && user.role === 'freelancer'
  });

  // Filter for ACTIVE gigs
  const activeGigs = projects?.filter(p =>
    (p.freelancerAddress === user?.stxAddress || p.freelancerId === user?.id) &&
    (p.status === 'ACTIVE' || p.status === 'COMPLETED' || p.status === 'PENDING') // Pending might mean waiting for on-chain, but usually ACTIVE
  ) || [];

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

        import('@/lib/stacks').then(({ markCompleteOnChain }) => {
          markCompleteOnChain(
            onChainId,
            milestoneNum,
            async (txData) => {
              try {
                apiRequest('PATCH', `/api/projects/${id}/milestone/${milestoneNum}/complete`, {
                  completionDescription,
                  completionAttachment,
                }).then(res => res.json()).then(result => {
                  resolve({ ...result.updated, txId: txData.txId });
                }).catch(reject);
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

  return (
    <div className="min-h-screen text-foreground">
      <Navigation currentPage="freelancer" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
                <p className="text-muted-foreground">Track your earnings and active projects</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setActiveChat({
                projectId: null,
                projectTitle: 'All Messages',
                otherUserName: 'Chat List',
                otherUserRole: 'system'
              })}
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Messages
            </Button>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Tabs defaultValue="active" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="active">Active Jobs</TabsTrigger>
                  <TabsTrigger value="applications">My Applications</TabsTrigger>
                </TabsList>

                <TabsContent value="active">
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Current Jobs</h2>
                    {isLoadingProjects ? <p>Loading...</p> : activeGigs.length === 0 ? (
                      <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                          No active jobs found. Apply to projects in the Browse section!
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6">
                        {activeGigs.map(project => (
                          <ActiveProjectCard
                            key={project.id}
                            project={project}
                            onChatClick={(p) => setActiveChat({
                              projectId: p.id,
                              projectTitle: p.milestone1Title || 'Untitled',
                              otherUserName: p.clientAddress,
                              otherUserRole: 'client'
                            })}
                            onComplete={(milestoneNum) => {
                              setSelectedMilestone({
                                projectId: project.id,
                                onChainId: project.onChainId,
                                milestoneNum
                              });
                              setCompletionDialogOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="applications">
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Application Status</h2>
                    {isLoadingApps ? (
                      <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4" />
                          <p>Loading applications...</p>
                        </CardContent>
                      </Card>
                    ) : applications?.length === 0 ? (
                      <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                          <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                          <p className="text-sm mb-4">You haven't applied to any projects yet.</p>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                              💡 <strong>Tip:</strong> Browse available projects and submit proposals to get started.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              🎯 <strong>Next Steps:</strong> 
                            </p>
                            <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1 ml-4">
                              <li>Find projects that match your skills</li>
                              <li>Write compelling proposals</li>
                              <li>Track your application status</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4">
                        {applications?.map(app => (
                          <ApplicationStatusCard key={app.id} application={app} />
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-6">
              <XIntegration />
            </div>
          </div>
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
              Provide details about your completed work
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="completion-description">Completion Description</Label>
              <Textarea
                id="completion-description"
                placeholder="Describe your work..."
                value={completionDescription}
                onChange={(e) => setCompletionDescription(e.target.value)}
                className="min-h-32"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="completion-attachment">Deliverable URL (Optional)</Label>
              <Input
                id="completion-attachment"
                placeholder="https://..."
                value={completionAttachment}
                onChange={(e) => setCompletionAttachment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompletionDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => completeEscrowMutation.mutate({
                id: selectedMilestone!.projectId,
                onChainId: selectedMilestone!.onChainId,
                milestoneNum: selectedMilestone!.milestoneNum,
                completionDescription,
                completionAttachment
              })}
              disabled={completeEscrowMutation.isPending}
            >
              {completeEscrowMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {activeChat && (
        <ChatWidget
          isOpen={true}
          onClose={() => setActiveChat(null)}
          initialProjectId={activeChat.projectId}
          initialProjectTitle={activeChat.projectTitle}
          initialOtherUserName={activeChat.otherUserName}
          initialOtherUserRole={activeChat.otherUserRole}
        />
      )}

      <Footer />
    </div>
  );
}

function ApplicationStatusCard({ application }: { application: EnrichedApplication }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'text-green-600';
      case 'REJECTED': return 'text-red-600';
      case 'PENDING': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return '✅';
      case 'REJECTED': return '❌';
      case 'PENDING': return '⏳';
      default: return '📋';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'Application Accepted';
      case 'REJECTED': return 'Application Rejected';
      case 'PENDING': return 'Application Pending';
      default: return 'Application Submitted';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="py-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{application.project?.milestone1Title || "Untitled Project"}</CardTitle>
            <CardDescription className="text-sm">
              Bid: {application.bidAmount} STX • Status: <span className={`font-semibold ${getStatusColor(application.status)}`}>{getStatusText(application.status)}</span>
            </CardDescription>
          </div>
          <Badge variant={application.status === 'ACCEPTED' ? 'default' : application.status === 'REJECTED' ? 'destructive' : 'secondary'} className="ml-2">
            {getStatusIcon(application.status)} {application.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Your Proposal</h4>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                {application.proposal || "No proposal provided"}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Project Response</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {application.status === 'PENDING' && "Awaiting client review..."}
                {application.status === 'ACCEPTED' && "Congratulations! Your proposal was accepted."}
                {application.status === 'REJECTED' && "This proposal was not selected."}
                {application.status === 'COMPLETED' && "Project completed successfully!"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActiveProjectCard({ project, onComplete, onChatClick }: { project: Project; onComplete: (m: number) => void; onChatClick: (p: Project) => void }) {
  // Simplified card, logic similar to previous implementation but focused on actions
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>{project.milestone1Title}</CardTitle>
          <Badge variant="default" className="bg-green-500">Active</Badge>
        </div>
        <CardDescription>Total: {microStacksToStx(project.totalAmount, project.tokenType)} {project.tokenType}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[1, 2, 3, 4].map(num => {
            const released = project[`milestone${num}Released` as keyof Project];
            const complete = project[`milestone${num}Complete` as keyof Project];
            return (
              <div key={num} className="text-center">
                <div className={`text-lg ${released ? 'text-green-500' : complete ? 'text-yellow-500' : 'text-blue-500'}`}>
                  {released ? '✅' : complete ? '⏳' : '○'}
                </div>
                <div className="text-xs text-muted-foreground">M{num}</div>
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map(num => {
            const canComplete = !project[`milestone${num}Complete` as keyof Project] && !project[`milestone${num}Released` as keyof Project];
            return (
              <Button
                key={num}
                size="sm"
                variant="outline"
                disabled={!canComplete}
                onClick={() => onComplete(num)}
              >
                Complete M{num}
              </Button>
            )
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="w-full" onClick={() => onChatClick(project)}>
          <MessageSquare className="w-4 h-4 mr-2" /> Chat with Client
        </Button>
      </CardFooter>
    </Card >
  )
}
