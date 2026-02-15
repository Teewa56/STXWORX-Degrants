import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Award,
  Star,
  Zap,
  Flag,
  Shield,
  ExternalLink,
  Trophy,
  Loader2,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface AchievementRequirement {
  minProjects: number;
  minReputation: number;
  xVerified: boolean;
  description: string;
}

interface AchievementRequirements {
  [key: string]: AchievementRequirement;
}

interface UserAchievement {
  nftAchievements: {
    id: string;
    tokenId: number | null;
    achievementType: string;
    mintedAt: string;
  };
  users: {
    username: string;
    id: string;
  };
}

interface UserProfile {
  id: string;
  reputation: number;
  completedProjects: number;
  totalEarnings: number;
}

interface AchievementTrackingProps {
  currentUserId: string;
  className?: string;
}

export const AchievementTracking: React.FC<AchievementTrackingProps> = ({ currentUserId, className }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch achievement requirements
  const { data: requirementsResponse } = useQuery<{ success: boolean; data: AchievementRequirements }>({
    queryKey: ['/api/nft/requirements'],
  });

  // Fetch user's earned achievements
  const { data: earnedResponse, isLoading: loadingEarned } = useQuery<{ success: boolean; data: UserAchievement[] }>({
    queryKey: [`/api/nft/user/${currentUserId}`],
  });

  // Fetch user profile for progress stats
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['/api/users/profile'],
  });

  const requirements = requirementsResponse?.data || {};
  const earnedAchievements = earnedResponse?.data || [];
  const earnedTypes = new Set(earnedAchievements.map(a => a.nftAchievements.achievementType));

  // Mutation for minting achievement
  const mintMutation = useMutation({
    mutationFn: async (achievementType: string) => {
      const response = await apiRequest('POST', '/api/nft/mint', { achievementType, userId: currentUserId });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/nft/user/${currentUserId}`] });
      toast({
        title: "Minting Initiated",
        description: `Your ${data.data.achievementType} NFT is being minted. TxID: ${data.data.txid.substring(0, 10)}...`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to mint achievement NFT",
        variant: "destructive"
      });
    }
  });

  const getStatusColor = (type: string) => {
    if (earnedTypes.has(type)) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-500 border-gray-200';
  };

  const calculateProgress = (type: string) => {
    if (earnedTypes.has(type)) return 100;
    const req = requirements[type];
    if (!req || !profile) return 0;

    const projectProgress = req.minProjects > 0 ? (profile.completedProjects / req.minProjects) * 100 : 100;
    const reputationProgress = req.minReputation > 0 ? (profile.reputation / req.minReputation) * 100 : 100;

    // Weighted progress
    return Math.min(Math.floor((projectProgress + reputationProgress) / 2), 100);
  };

  const isEligible = (type: string) => {
    if (earnedTypes.has(type)) return false;
    const req = requirements[type];
    if (!req || !profile) return false;

    return (
      profile.completedProjects >= req.minProjects &&
      profile.reputation >= req.minReputation
      // Note: xVerified check usually happens on backend or requires fetching x integration status
    );
  };

  if (loadingEarned) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-muted-foreground font-medium">Syncing on-chain achievements...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">Achievement Tracking</h2>
          <p className="text-muted-foreground font-medium">Earn exclusive on-chain NFT badges for your contributions</p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="flex items-center px-4 py-2 border-none shadow-sm bg-indigo-50 text-indigo-700">
            <Trophy className="h-5 w-5 mr-2" />
            <span className="font-black">{earnedAchievements.length}</span>
            <span className="text-xs font-bold uppercase tracking-widest ml-1">Earned</span>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100/50 p-1 rounded-xl">
          <TabsTrigger value="dashboard" className="rounded-lg px-6">Available</TabsTrigger>
          <TabsTrigger value="earned" className="rounded-lg px-6">Earned</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(requirements).map(([type, req]) => {
              const earned = earnedTypes.has(type);
              const progress = calculateProgress(type);
              const eligible = isEligible(type);

              return (
                <Card key={type} className={`overflow-hidden border-none shadow-md transition-all duration-300 ${earned ? 'opacity-60 grayscale' : 'hover:shadow-xl hover:-translate-y-1'}`}>
                  <CardHeader className={`pb-4 ${type === 'gold' ? 'bg-gradient-to-br from-yellow-400 to-amber-600' :
                      type === 'platinum' ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                        type === 'silver' ? 'bg-gradient-to-br from-gray-200 to-gray-400' :
                          type === 'bronze' ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                            'bg-gradient-to-br from-indigo-500 to-purple-600'
                    } text-white`}>
                    <div className="flex justify-between items-start">
                      <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Award className="h-7 w-7" />
                      </div>
                      {earned && <Badge className="bg-white/20 text-white border-none backdrop-blur-md">Earned</Badge>}
                    </div>
                    <CardTitle className="mt-4 text-xl font-black uppercase tracking-tight">{type}</CardTitle>
                    <p className="text-xs text-white/80 font-medium line-clamp-1">{req.description}</p>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {!earned && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />

                        <div className="grid grid-cols-1 gap-2 mt-4 pt-4 border-t border-gray-50">
                          <div className={`flex justify-between items-center text-xs p-2 rounded-lg ${profile && profile.completedProjects >= req.minProjects ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                            <span>Projects: {profile?.completedProjects || 0} / {req.minProjects}</span>
                            {profile && profile.completedProjects >= req.minProjects ? <CheckCircle className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                          </div>
                          <div className={`flex justify-between items-center text-xs p-2 rounded-lg ${profile && profile.reputation >= req.minReputation ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                            <span>Reputation: {profile?.reputation || 0} / {req.minReputation}</span>
                            {profile && profile.reputation >= req.minReputation ? <CheckCircle className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                          </div>
                          {req.xVerified && (
                            <div className={`flex justify-between items-center text-xs p-2 rounded-lg bg-gray-50 text-gray-500`}>
                              <span>X Verification Required</span>
                              <Lock className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Button
                      disabled={!eligible || mintMutation.isPending}
                      onClick={() => mintMutation.mutate(type)}
                      className={`w-full font-bold shadow-lg ${eligible ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20' : 'bg-gray-100 text-gray-400 shadow-none'
                        }`}
                    >
                      {mintMutation.isPending && mintMutation.variables === type ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Zap className={`h-4 w-4 mr-2 ${eligible ? 'animate-pulse' : ''}`} />
                      )}
                      {earned ? 'Already Earned' : eligible ? 'Mint Now' : 'Locked'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="earned" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {earnedAchievements.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl">
              <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                < Award className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No achievements yet</h3>
              <p className="text-muted-foreground max-w-xs mx-auto mt-2 mb-6">Complete milestones and contribute to the network to earn on-chain rewards.</p>
              <Button variant="outline" onClick={() => setActiveTab('dashboard')}>Browse Requirements</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {earnedAchievements.map((earned) => (
                <Card key={earned.nftAchievements.id} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="aspect-square bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-8 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-white shadow-xl flex items-center justify-center text-indigo-600">
                        < trophy className="h-12 w-12" />
                      </div>
                      <Badge className="absolute -top-2 -right-2 bg-indigo-600 text-white font-black border-4 border-white">
                        ID: {earned.nftAchievements.tokenId || '...'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 text-center">
                    <h4 className="font-black uppercase tracking-tight text-gray-900">{earned.nftAchievements.achievementType}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                      Minted {new Date(earned.nftAchievements.mintedAt).toLocaleDateString()}
                    </p>
                    <Button variant="ghost" size="sm" className="w-full mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" asChild>
                      <a href={`https://explorer.stacks.co/txid/${earned.nftAchievements.id}?chain=mainnet`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-2" /> View Transaction
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
