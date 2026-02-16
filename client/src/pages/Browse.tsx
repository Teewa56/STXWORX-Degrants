import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Project, type Category, insertApplicationSchema } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Briefcase, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

// Schema for application form
const applicationSchema = z.object({
  bidAmount: z.coerce.number().positive("Bid amount must be positive"),
  proposal: z.string().min(10, "Proposal must be at least 10 characters"),
});

type ApplicationData = z.infer<typeof applicationSchema>;

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const filteredProjects = projects?.filter((project) => {
    // Only show PENDING projects that are public (unless user is the client, but this is browse)
    if (project.status !== 'PENDING' || project.visibility === 'private') {
      return false;
    }

    const matchesSearch =
      searchQuery === '' ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.subcategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.milestone1Title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      project.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="min-h-screen text-foreground">
      <Navigation currentPage="browse" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Browse Projects</h1>
                <p className="text-muted-foreground mt-1">
                  Explore available freelance opportunities on the blockchain
                </p>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by description, category, or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-background/50"
                  data-testid="input-search"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12 bg-background/50" data-testid="select-filter-category">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                {filteredProjects.length} open project{filteredProjects.length !== 1 ? 's' : ''} found
              </p>
              {(searchQuery || selectedCategory !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-lg" data-testid="text-no-projects">
                  No open projects found
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Projects will appear here once clients post them'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} user={user} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProjectCard({ project, user }: { project: Project; user: any }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<ApplicationData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      bidAmount: project.totalAmount,
      proposal: "",
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (data: ApplicationData) => {
      const res = await apiRequest("POST", `/api/projects/${project.id}/apply`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted",
        description: "The client will review your proposal shortly.",
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to apply",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return (
    <Card className="group flex flex-col h-full hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                {project.totalAmount} STX
              </CardTitle>
              {project.category && (
                <Badge variant="outline" className="text-xs">
                  {project.category}
                </Badge>
              )}
            </div>
            <h3 className="font-medium text-lg truncate" title={project.milestone1Title}>
              {project.milestone1Title || "Untitled Project"}
            </h3>
          </div>
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
            Open
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {project.description || "No description provided."}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          {project.subcategory && (
            <Badge variant="secondary" className="text-xs">{project.subcategory}</Badge>
          )}
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(project.createdAt).toLocaleDateString()}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-0 mt-auto">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" disabled={user?.role === 'client' || !user}>
              {user?.role === 'client' ? 'Clients cannot apply' : !user ? 'Login to Apply' : 'Apply Now'}
            </Button>
          </DialogTrigger>
          {user?.role === 'freelancer' && (
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Apply for Project</DialogTitle>
                <DialogDescription>
                  Submit your proposal and bid amount for this project.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => applyMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bidAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bid Amount (STX)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="proposal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposal</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Explain why you are the best fit for this job..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit" disabled={applyMutation.isPending}>
                      {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit Application
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          )}
        </Dialog>
      </CardFooter>
    </Card>
  );
}
