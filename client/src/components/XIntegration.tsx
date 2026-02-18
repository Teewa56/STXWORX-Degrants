import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Twitter, Link2, CheckCircle, RefreshCw, Users, TrendingUp, Unlink } from 'lucide-react';
import { useErrorHandler } from '@/lib/toastHandler';

interface XIntegrationData {
  id: string;
  userId: string;
  handle: string;
  verified: boolean;
  followerCount: number;
  engagementScore: number;
  lastSync: string;
}

export default function XIntegration() {
  const { user } = useAuth();
  const { handleError, handleSuccess } = useErrorHandler();
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: xIntegration, refetch } = useQuery({
    queryKey: ['x-integration', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not found');
      const response = await apiRequest('GET', `/api/x/user/${user.id}`);
      const data = await response.json();
      return data.data as XIntegrationData;
    },
    enabled: !!user?.id,
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not found');
      setIsConnecting(true);
      const response = await apiRequest('GET', `/api/x/authorize?userId=${user.id}`);
      const data = await response.json();
      window.location.href = data.url;
    },
    onSuccess: () => {
      handleSuccess('Redirecting to X', 'You\'ll be redirected to authorize your X account');
    },
    onError: (error) => {
      handleError(error, 'Failed to connect X account. Please try again.');
      setIsConnecting(false);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not found');
      await apiRequest('DELETE', `/api/x/disconnect/${user.id}`);
    },
    onSuccess: () => {
      handleSuccess('X account disconnected', 'Your X account has been disconnected successfully');
      refetch();
    },
    onError: (error) => {
      handleError(error, 'Failed to disconnect X account. Please try again.');
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not found');
      await apiRequest('POST', `/api/x/sync/${user.id}`);
    },
    onSuccess: () => {
      handleSuccess('X data synced', 'Your X profile data has been updated');
      refetch();
    },
    onError: (error) => {
      handleError(error, 'Failed to sync X data. Please try again.');
    },
  });

  if (!xIntegration) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Twitter className="h-5 w-5" />
            Connect X (Twitter) Account
          </CardTitle>
          <CardDescription>
            Connect your X account to verify your profile and increase your reputation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => connectMutation.mutate()}
            disabled={isConnecting || connectMutation.isPending}
            className="w-full"
          >
            <Link2 className="mr-2 h-4 w-4" />
            {isConnecting ? 'Connecting...' : 'Connect X Account'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Twitter className="h-5 w-5" />
            X Account Connected
            {xIntegration.verified && (
              <Badge variant="default" className="bg-blue-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => disconnectMutation.mutate()}
            disabled={disconnectMutation.isPending}
          >
            <Unlink className="h-4 w-4 mr-1" />
            Disconnect
          </Button>
        </CardTitle>
        <CardDescription>
          @{xIntegration.handle} • Last synced: {new Date(xIntegration.lastSync).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">{xIntegration.followerCount.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">{xIntegration.engagementScore.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Engagement Score</div>
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="w-full"
        >
          {syncMutation.isPending ? 'Syncing...' : 'Sync X Data'}
        </Button>
      </CardContent>
    </Card>
  );
}
