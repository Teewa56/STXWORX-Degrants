import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletConnect } from '@/components/WalletConnect';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Shield, Lock, Zap, TrendingUp, Users, CheckCircle, Palette, Code, Film, Briefcase, Bot, Link as LinkIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { type Category, type Escrow } from '@shared/schema';
import * as Icons from 'lucide-react';

export default function HomePage() {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: escrows } = useQuery<Escrow[]>({
    queryKey: ['/api/escrows'],
  });

  const getIconComponent = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons] as any;
    return Icon || Icons.Briefcase;
  };

  const getCategoryProjectCount = (categoryName: string) => {
    return escrows?.filter(e => e.category === categoryName).length || 0;
  };

  return (
    <div className="min-h-screen text-foreground">
      <Navigation currentPage="home" />

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Column - Hero Content */}
            <div className="space-y-6">
              <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1.5">
                <Shield className="h-3 w-3 mr-2 inline" />
                Blockchain-Secured Payments
              </Badge>
              
              <h2 className="text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Secure Freelance Payments on Stacks
              </h2>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Trustless escrow powered by smart contracts. Lock funds, complete work, get paid. No intermediaries, no disputes.
              </p>

              {/* Trust Indicators */}
              <div className="flex gap-6 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Secure</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">0%</div>
                  <div className="text-sm text-muted-foreground">Fees</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Available</div>
                </div>
              </div>
            </div>

            {/* Right Column - Feature Visual */}
            <div className="hidden md:block">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Smart Contract Escrow
                  </CardTitle>
                  <CardDescription>Funds locked on blockchain until work is complete</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Client locks 5 STX</p>
                      <p className="text-xs text-muted-foreground">Funds secured in smart contract</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Work delivered</p>
                      <p className="text-xs text-muted-foreground">Freelancer completes project</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Funds released</p>
                      <p className="text-xs text-muted-foreground">Payment sent to freelancer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1.5 mb-4">
              <Briefcase className="h-3 w-3 mr-2 inline" />
              Marketplace Categories
            </Badge>
            <h3 className="text-4xl font-bold mb-4">Explore Web3 Talent</h3>
            <p className="text-lg text-muted-foreground">
              Find skilled freelancers across blockchain, AI, and emerging tech categories
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {categories?.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              const projectCount = getCategoryProjectCount(category.name);
              
              return (
                <Link key={category.id} href="/browse">
                  <Card 
                    className="group hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer"
                    data-testid={`card-category-${category.id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-3 group-hover:bg-primary/30 transition-colors">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {category.subcategories.length} specialties
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {projectCount} {projectCount === 1 ? 'project' : 'projects'}
                        </span>
                        <span className="text-primary font-medium group-hover:translate-x-1 transition-transform">
                          Browse →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* View All Categories CTA */}
          <div className="text-center mt-12">
            <Link href="/browse">
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
                data-testid="button-view-all-categories"
              >
                View All Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h3 className="text-4xl font-bold mb-4">How It Works</h3>
            <p className="text-lg text-muted-foreground">
              Three simple steps to secure, blockchain-powered freelancing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 shadow-lg shadow-primary/30">
                  1
                </div>
                <CardTitle>Connect Wallet</CardTitle>
                <CardDescription className="text-base">
                  Use Xverse or Leather wallet to connect to Stacks Testnet
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 shadow-lg shadow-primary/30">
                  2
                </div>
                <CardTitle>Lock Funds in Escrow</CardTitle>
                <CardDescription className="text-base">
                  Clients create escrow and lock STX securely on-chain
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 shadow-lg shadow-primary/30">
                  3
                </div>
                <CardTitle>Complete & Release</CardTitle>
                <CardDescription className="text-base">
                  Work completed, client releases payment from smart contract
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Selection Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-3">Get Started</h3>
            <p className="text-muted-foreground">Choose your path</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="group" data-testid="card-client">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">I'm a Client</CardTitle>
                <CardDescription className="text-base">
                  Post gigs and securely lock funds in blockchain escrow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/client">
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-orange-600 hover:from-white hover:to-white hover:text-primary hover:shadow-lg hover:shadow-primary/30 transition-all border-2 border-transparent hover:border-primary" 
                    size="lg"
                    data-testid="button-client-dashboard"
                  >
                    Go to Client Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group" data-testid="card-freelancer">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">I'm a Freelancer</CardTitle>
                <CardDescription className="text-base">
                  Browse escrows and manage your guaranteed payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/freelancer">
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-orange-600 hover:from-white hover:to-white hover:text-primary hover:shadow-lg hover:shadow-primary/30 transition-all border-2 border-transparent hover:border-primary" 
                    size="lg"
                    data-testid="button-freelancer-dashboard"
                  >
                    Go to Freelancer Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/20 to-orange-600/20 border-t border-primary/30">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to start earning securely?</h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the future of freelancing with blockchain-secured payments on Stacks
          </p>
          <p className="text-sm text-muted-foreground">
            Connect your wallet from the navigation bar to get started
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
