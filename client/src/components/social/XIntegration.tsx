import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Twitter,
  CheckCircle,
  XCircle,
  ExternalLink,
  Users,
  TrendingUp,
  Award,
  Settings,
  RefreshCw,
  Share2,
  Shield,
  Star,
  Eye,
  Link,
  MessageSquare,
  Heart,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface XIntegrationData {
  id: string;
  userId: string;
  handle: string;
  verified: boolean;
  followerCount: number;
  engagementScore: number;
  lastSync: string;
}

interface XIntegrationProps {
  currentUserId: string;
  className?: string;
}

export function XIntegration({ currentUserId, className }: XIntegrationProps) {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [socialSettings, setSocialSettings] = useState({
    autoPostAchievements: true,
    showXProfile: true,
    allowSocialSharing: true,
    syncFollowers: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real integration status
  const { data: integrationResponse, isLoading, error } = useQuery<{ success: boolean; data: XIntegrationData }>({
    queryKey: [`/api/x/user/${currentUserId}`],
    retry: false,
  });

  const integration = integrationResponse?.data;
  const isConnected = !!integration;

  // Mutation for initiating OAuth
  const authorizeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/x/authorize');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Authorization Failed",
        description: error.message || "Failed to initiate X authorization",
        variant: "destructive"
      });
    }
  });

  // Mutation for syncing profile
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/x/sync/${currentUserId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/x/user/${currentUserId}`] });
      toast({
        title: "Profile Synced",
        description: "Your X profile data has been updated"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync X profile",
        variant: "destructive"
      });
    }
  });

  // Mutation for disconnecting
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/x/disconnect/${currentUserId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData([`/api/x/user/${currentUserId}`], null);
      toast({
        title: "Account Disconnected",
        description: "Your X account has been disconnected"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Disconnection Failed",
        description: error.message || "Failed to disconnect X account",
        variant: "destructive"
      });
    }
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-3" />
          <span className="text-muted-foreground font-medium">Checking X connection...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white pb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center space-x-2 text-white">
                <Twitter className="h-6 w-6" />
                <span>X Integration</span>
              </CardTitle>
              <CardDescription className="text-blue-100/80">
                Connect your X (Twitter) account for social verification and rewards
              </CardDescription>
            </div>
            {isConnected && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
                className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                {syncMutation.isPending ? 'Syncing...' : 'Sync'}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 -mt-4 bg-white rounded-t-2xl relative z-10">
          <div className="space-y-6">
            {/* Connection Status Indicator */}
            <div className={`flex items-center justify-between p-5 rounded-xl border-2 ${isConnected ? 'border-blue-50 bg-blue-50/30' : 'border-gray-50 bg-gray-50/30'
              }`}>
              <div className="flex items-center space-x-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${isConnected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                  <Twitter className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-none mb-2">
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {isConnected ? `@${integration?.handle}` : 'X profile integration'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {!isConnected ? (
                  <Button
                    onClick={() => authorizeMutation.mutate()}
                    disabled={authorizeMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 shadow-lg"
                  >
                    {authorizeMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Twitter className="h-4 w-4 mr-2" />
                    )}
                    Connect X
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => disconnectMutation.mutate()}
                    disabled={disconnectMutation.isPending}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    {disconnectMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Disconnect
                  </Button>
                )}
              </div>
            </div>

            {/* Profile Insights */}
            {isConnected && integration && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center group hover:bg-blue-50 hover:border-blue-100 transition-colors">
                    <Users className="h-5 w-5 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-2xl font-black text-gray-900">{formatNumber(integration.followerCount)}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Followers</span>
                  </div>
                  <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center group hover:bg-indigo-50 hover:border-indigo-100 transition-colors">
                    <TrendingUp className="h-5 w-5 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-2xl font-black text-gray-900">{formatNumber(integration.engagementScore)}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Social Score</span>
                  </div>
                  <div className="col-span-2 md:col-span-1 p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center group hover:bg-emerald-50 hover:border-emerald-100 transition-colors">
                    {integration.verified ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                    ) : (
                      <Shield className="h-5 w-5 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-lg font-black text-gray-900">{integration.verified ? 'VERIFIED' : 'PENDING'}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Status</span>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-100 text-blue-800">
                  <RefreshCw className="h-4 w-4" />
                  <AlertDescription className="text-xs font-medium">
                    Profile last synced on {formatDate(integration.lastSync)}. Social metrics affect your platform reputation.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-bold uppercase tracking-tight text-gray-400">Social Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between group">
                      <Label className="font-semibold text-gray-700 cursor-pointer">Auto-share Achievements</Label>
                      <div className="h-6 w-11 bg-gray-200 rounded-full relative cursor-pointer" onClick={() => setSocialSettings(s => ({ ...s, autoPostAchievements: !s.autoPostAchievements }))}>
                        <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${socialSettings.autoPostAchievements ? 'translate-x-5 bg-blue-500' : ''}`} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between group">
                      <Label className="font-semibold text-gray-700 cursor-pointer">Show X handle on Profile</Label>
                      <div className="h-6 w-11 bg-gray-200 rounded-full relative cursor-pointer" onClick={() => setSocialSettings(s => ({ ...s, showXProfile: !s.showXProfile }))}>
                        <div className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${socialSettings.showXProfile ? 'translate-x-5 bg-blue-500' : ''}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isConnected && (
              <div className="py-8 text-center space-y-4">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 text-blue-600 mb-2">
                  <Award className="h-10 w-10" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">Unlock Social Rewards</h4>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Linking your X account allows for automatic verification of your identity and social influence scoring.
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">✓ Social Score</Badge>
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">✓ Verification NFT</Badge>
                  <Badge variant="secondary" className="bg-amber-50 text-amber-700">✓ Engagement Bonus</Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default XIntegration;
