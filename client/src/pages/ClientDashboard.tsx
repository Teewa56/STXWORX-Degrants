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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertProjectSchema, type Project, type Category, type Application } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Briefcase, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import type { TokenType } from '@/components/TokenSelector';
import ChatWidget from '@/components/chat/ChatWidget';

// Extended type for enriched applications
type EnrichedApplication = Application & {
  freelancer?: {
    username: string;
    stxAddress: string;
  }
};

// Modified schema for creation (freelancer optional)
const createProjectFormSchema = insertProjectSchema.pick({
  totalAmount: true,
  tokenType: true,
  description: true,
  category: true,
  subcategory: true,
  milestone1Title: true,
  milestone1Description: true,
  milestone1Attachment: true,
  milestone2Title: true,
  milestone2Description: true,
  milestone2Attachment: true,
  milestone3Title: true,
  milestone3Description: true,
  milestone3Attachment: true,
  milestone4Title: true,
  milestone4Description: true,
  milestone4Attachment: true,
});

type CreateProjectForm = z.infer<typeof createProjectFormSchema>;

export default function ClientDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeChat, setActiveChat] = useState<{ projectId: string; projectTitle: string; otherUserName: string; otherUserRole: string } | null>(null);

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      totalAmount: 0,
      tokenType: 'STX',
      description: '',
      category: '',
      subcategory: '',
      milestone1Title: 'Milestone 1',
      milestone1Description: '',
      milestone2Title: 'Milestone 2',
      milestone2Description: '',
      milestone3Title: 'Milestone 3',
      milestone3Description: '',
      milestone4Title: 'Milestone 4',
      milestone4Description: '',
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: !!user,
  });

  // Filter projects for this client
  const myProjects = projects?.filter(p => p.clientAddress === user?.stxAddress || p.clientAddress === user?.username) || [];

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectForm) => {
      const amount = Number(data.totalAmount);
      const milestoneAmount = Math.floor(amount / 4);
      const remainder = amount - (milestoneAmount * 3);

      const payload = {
        ...data,
        clientAddress: user?.stxAddress || user?.username,
        milestone1Amount: milestoneAmount,
        milestone2Amount: milestoneAmount,
        milestone3Amount: milestoneAmount,
        milestone4Amount: remainder,
        platformFee: 0
      };

      const res = await apiRequest('POST', '/api/projects/new', payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Project Posted",
        description: "Your project is now open for applications.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post project",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  function onSubmit(data: CreateProjectForm) {
    createProjectMutation.mutate(data);
  }

  return (
    <div className="min-h-screen text-foreground">
      <Navigation currentPage="client" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Client Dashboard</h1>
                <p className="text-muted-foreground">Manage your projects and hire freelancers</p>
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

          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList>
              <TabsTrigger value="projects">My Projects</TabsTrigger>
              <TabsTrigger value="post">Post New Project</TabsTrigger>
            </TabsList>

            <TabsContent value="projects">
              <div className="grid gap-6">
                <h2 className="text-xl font-semibold">Project Management</h2>
                {isLoading ? (
                  <p>Loading projects...</p>
                ) : myProjects.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No projects found. Post a new one to get started!
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {myProjects.map(project => (
                      <ProjectRow
                        key={project.id}
                        project={project}
                        onChatClick={(p, name) => setActiveChat({
                          projectId: p.id,
                          projectTitle: p.milestone1Title || 'Untitled',
                          otherUserName: name,
                          otherUserRole: 'freelancer'
                        })}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="post">
              <Card>
                <CardHeader>
                  <CardTitle>Post a New Project</CardTitle>
                  <CardDescription>Create a job listing. Funds will be locked only when you hire a freelancer.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Basic Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="totalAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total Budget</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="tokenType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Token</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Token" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="STX">STX</SelectItem>
                                  <SelectItem value="sBTC">sBTC</SelectItem>
                                </SelectContent>
                              </Select>
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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Project details..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={(val) => { field.onChange(val); setSelectedCategory(val); }}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories?.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="subcategory"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subcategory</FormLabel>
                              <Select onValueChange={field.onChange} disabled={!selectedCategory}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Subcategory" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories?.find(c => c.name === selectedCategory)?.subcategories.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4 border-t pt-4">
                        <h3 className="font-medium">Milestones</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="milestone1Title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Milestone 1 Title</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="milestone1Description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Input {...field} placeholder="Deliverable details" /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="milestone2Title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Milestone 2 Title</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="milestone2Description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Input {...field} placeholder="Deliverable details" /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={createProjectMutation.isPending}>
                        {createProjectMutation.isPending && "Posting..."}
                        {!createProjectMutation.isPending && "Post Project"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      {activeChat && (
        <ChatWidget
          key={activeChat.projectId} // Force re-mount on project change
          projectId={activeChat.projectId}
          projectTitle={activeChat.projectTitle}
          otherUserName={activeChat.otherUserName}
          otherUserRole="freelancer"
        />
      )}
    </div>
  );
}

function ProjectRow({ project, onChatClick }: { project: Project; onChatClick: (project: Project, freelancerName: string) => void }) {
  const { data: applications } = useQuery<EnrichedApplication[]>({
    queryKey: [`/api/projects/${project.id}/applications`],
    enabled: !!project.id
  });

  const isHired = project.status === 'ACTIVE' || project.status === 'COMPLETED';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{project.milestone1Title || "Untitled"} (Total: {project.totalAmount} {project.tokenType})</CardTitle>
            <CardDescription>Status: <Badge variant={isHired ? "default" : "secondary"}>{project.status}</Badge></CardDescription>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            Posted: {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isHired && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Applications ({applications?.length || 0})</h4>
            <div className="space-y-2">
              {applications?.map(app => (
                <ApplicationItem key={app.id} application={app} project={project} />
              ))}
              {applications?.length === 0 && <p className="text-sm text-muted-foreground">No applications yet.</p>}
            </div>
          </div>
        )}
        {isHired && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">Freelancer Hired</p>
            <p className="text-xs text-muted-foreground">Address: {project.freelancerAddress}</p>
            <p className="text-xs text-muted-foreground">On-Chain ID: {project.onChainId} (Tx: {project.txId})</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => {
              const app = applications?.find(a => a.freelancer?.stxAddress === project.freelancerAddress);
              const name = app?.freelancer?.username || project.freelancerAddress || "Freelancer";
              onChatClick(project, name);
            }}>
              <MessageSquare className="w-4 h-4 mr-2" /> Chat with Freelancer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ApplicationItem({ application, project }: { application: EnrichedApplication; project: Project }) {
  const { toast } = useToast();

  const handleHire = async () => {
    if (!application.freelancer?.stxAddress) {
      toast({ title: "Error", description: "Freelancer address missing. Cannot create escrow.", variant: "destructive" });
      return;
    }

    try {
      const { createEscrowOnChain, getProjectCount } = await import('@/lib/stacks');

      // Fetch current count to predict onChainId
      const count = await getProjectCount();

      // 1. Lock funds on chain
      createEscrowOnChain(
        application.freelancer.stxAddress,
        project.totalAmount,
        project.tokenType as TokenType,
        async (txData) => {
          try {
            // 2. Call backend to finalize hire
            await apiRequest('POST', `/api/projects/${project.id}/hire`, {
              applicationId: application.id,
              onChainId: count + 1, // Contract increments ID
              txId: txData.txId
            });

            queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
            toast({ title: "Freelancer Hired", description: "Project is now active." });
          } catch (err: any) {
            toast({ title: "Backend Error", description: err.message, variant: "destructive" });
          }
        },
        () => toast({ title: "Cancelled", description: "Transaction cancelled" })
      );
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: "Failed to initiate transaction", variant: "destructive" });
    }
  };

  return (
    <div className="flex justify-between items-start p-3 border rounded-lg bg-card/50">
      <div>
        <div className="font-medium flex items-center gap-2">
          {application.freelancer?.username || "Unknown"}
          <Badge variant="outline">{application.bidAmount} STX</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-1 mb-2">
          {application.freelancer?.stxAddress}
        </div>
        <div className="text-sm bg-muted/30 p-2 rounded">{application.proposal}</div>
      </div>
      <Button size="sm" onClick={handleHire}>Hire</Button>
    </div>
  )
}
