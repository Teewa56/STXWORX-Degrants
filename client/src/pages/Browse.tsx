import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Escrow, type Category } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: escrows, isLoading } = useQuery<Escrow[]>({
    queryKey: ['/api/escrows'],
  });

  const filteredEscrows = escrows?.filter((escrow) => {
    const matchesSearch = 
      searchQuery === '' ||
      escrow.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      escrow.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      escrow.subcategory?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      escrow.category === selectedCategory;

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
                  placeholder="Search by description, category, or service..."
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
                {filteredEscrows.length} project{filteredEscrows.length !== 1 ? 's' : ''} found
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
          ) : filteredEscrows.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-lg" data-testid="text-no-projects">
                  No projects found
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Projects will appear here once clients create escrows'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEscrows.map((escrow) => (
                <Card
                  key={escrow.id}
                  className="group"
                  data-testid={`card-project-${escrow.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <CardTitle className="text-2xl font-bold">
                            {escrow.amount} STX
                          </CardTitle>
                          {escrow.category && (
                            <Badge variant="outline" className="text-xs" data-testid={`badge-category-${escrow.id}`}>
                              {escrow.category}
                            </Badge>
                          )}
                        </div>
                        {escrow.subcategory && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {escrow.subcategory}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={escrow.status === 'locked' ? 'default' : 'secondary'}
                        className={escrow.status === 'locked' ? 'bg-primary' : 'bg-green-500'}
                        data-testid={`badge-status-${escrow.id}`}
                      >
                        {escrow.status === 'locked' ? '🔒 Active' : '✅ Completed'}
                      </Badge>
                    </div>

                    <CardDescription className="font-mono text-xs">
                      Client: {escrow.clientAddress.slice(0, 10)}...{escrow.clientAddress.slice(-6)}
                    </CardDescription>
                  </CardHeader>

                  {escrow.description && (
                    <CardContent>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm line-clamp-3">{escrow.description}</p>
                      </div>
                    </CardContent>
                  )}

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                      <span>Created {new Date(escrow.createdAt).toLocaleDateString()}</span>
                      {escrow.status === 'locked' && (
                        <span className="text-primary font-medium">Available</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
