import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Twitter, 
  Settings, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  Image,
  MessageSquare,
  Hash,
  AtSign,
  Calendar,
  TrendingUp,
  Users,
  Star,
  Award,
  Target,
  Zap,
  Camera,
  Link,
  Globe,
  Shield,
  Bell,
  Volume2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutoPostingRule {
  id: string;
  name: string;
  description: string;
  trigger: 'achievement_unlock' | 'tier_upgrade' | 'milestone_complete' | 'weekly_summary';
  enabled: boolean;
  template: string;
  includeImage: boolean;
  hashtags: string[];
  mentions: string[];
  delayMinutes: number;
  lastPosted?: string;
  postCount: number;
}

interface PostedTweet {
  id: string;
  content: string;
  achievementName: string;
  postedAt: string;
  status: 'posted' | 'scheduled' | 'failed';
  engagement?: {
    likes: number;
    retweets: number;
    replies: number;
  };
  imageUrl?: string;
}

export const AchievementAutoPosting: React.FC = () => {
  const [rules, setRules] = useState<AutoPostingRule[]>([]);
  const [postedTweets, setPostedTweets] = useState<PostedTweet[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutoPostingRule | null>(null);
  const [activeTab, setActiveTab] = useState('rules');
  const [xConnected, setXConnected] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAutoPostingRules();
    loadPostedTweets();
  }, []);

  const loadAutoPostingRules = async () => {
    try {
      // Mock data - replace with actual API call
      const mockRules: AutoPostingRule[] = [
        {
          id: '1',
          name: 'New Achievement Unlock',
          description: 'Post when user unlocks a new achievement',
          trigger: 'achievement_unlock',
          enabled: true,
          template: '🎉 Just unlocked the {achievement_name} achievement on @STXWORX_Degrants! {achievement_description} #STX #Stacks #Achievement',
          includeImage: true,
          hashtags: ['STX', 'Stacks', 'Achievement'],
          mentions: ['STXWORX_Degrants'],
          delayMinutes: 5,
          lastPosted: '2024-01-20T14:30:00Z',
          postCount: 12
        },
        {
          id: '2',
          name: 'Tier Upgrade Celebration',
          description: 'Post when user reaches a new reward tier',
          trigger: 'tier_upgrade',
          enabled: true,
          template: '🚀 Leveled up to {tier_name} tier on @STXWORX_Degrants! Now enjoying {tier_benefits} #STX #Crypto #DeFi',
          includeImage: true,
          hashtags: ['STX', 'Crypto', 'DeFi'],
          mentions: ['STXWORX_Degrants'],
          delayMinutes: 10,
          lastPosted: '2024-01-18T09:15:00Z',
          postCount: 3
        },
        {
          id: '3',
          name: 'Weekly Progress Summary',
          description: 'Post weekly achievement summary',
          trigger: 'weekly_summary',
          enabled: false,
          template: '📊 This week on @STXWORX_Degrants: {achievements_count} achievements unlocked, {points_earned} points earned! Join the community! #STX #Progress',
          includeImage: false,
          hashtags: ['STX', 'Progress'],
          mentions: ['STXWORX_Degrants'],
          delayMinutes: 0,
          postCount: 0
        }
      ];

      setRules(mockRules);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load auto-posting rules",
        variant: "destructive"
      });
    }
  };

  const loadPostedTweets = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTweets: PostedTweet[] = [
        {
          id: '1',
          content: '🎉 Just unlocked the "Early Adopter" achievement on @STXWORX_Degrants! One of the first 100 users to join the platform #STX #Stacks #Achievement',
          achievementName: 'Early Adopter',
          postedAt: '2024-01-20T14:30:00Z',
          status: 'posted',
          engagement: {
            likes: 45,
            retweets: 12,
            replies: 8
          },
          imageUrl: 'https://ipfs.io/ipfs/QmAchievementImage'
        },
        {
          id: '2',
          content: '🚀 Leveled up to Gold tier on @STXWORX_Degrants! Now enjoying exclusive rewards and higher earning rates #STX #Crypto #DeFi',
          achievementName: 'Gold Tier',
          postedAt: '2024-01-18T09:15:00Z',
          status: 'posted',
          engagement: {
            likes: 67,
            retweets: 23,
            replies: 15
          }
        },
        {
          id: '3',
          content: '🎯 Just completed my first milestone project on @STXWORX_Degrants! Successfully delivered and received 5-star rating #STX #Freelance',
          achievementName: 'First Milestone',
          postedAt: '2024-01-15T16:45:00Z',
          status: 'failed'
        }
      ];

      setPostedTweets(mockTweets);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load posted tweets",
        variant: "destructive"
      });
    }
  };

  const createRule = async (ruleData: Partial<AutoPostingRule>) => {
    try {
      // API call to create rule
      const newRule: AutoPostingRule = {
        id: Date.now().toString(),
        name: ruleData.name || '',
        description: ruleData.description || '',
        trigger: ruleData.trigger || 'achievement_unlock',
        enabled: ruleData.enabled || false,
        template: ruleData.template || '',
        includeImage: ruleData.includeImage || false,
        hashtags: ruleData.hashtags || [],
        mentions: ruleData.mentions || [],
        delayMinutes: ruleData.delayMinutes || 0,
        postCount: 0
      };

      setRules(prev => [...prev, newRule]);
      
      toast({
        title: "Rule Created",
        description: "Auto-posting rule has been created successfully"
      });
      
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create auto-posting rule",
        variant: "destructive"
      });
    }
  };

  const updateRule = async (ruleId: string, updates: Partial<AutoPostingRule>) => {
    try {
      // API call to update rule
      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      ));
      
      toast({
        title: "Rule Updated",
        description: "Auto-posting rule has been updated"
      });
      
      setIsEditDialogOpen(false);
      setSelectedRule(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update auto-posting rule",
        variant: "destructive"
      });
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      // API call to delete rule
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
      
      toast({
        title: "Rule Deleted",
        description: "Auto-posting rule has been deleted"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete auto-posting rule",
        variant: "destructive"
      });
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      // API call to toggle rule
      setRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled } : rule
      ));
      
      toast({
        title: "Rule Updated",
        description: `Auto-posting rule ${enabled ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle auto-posting rule",
        variant: "destructive"
      });
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'achievement_unlock': return <Award className="h-4 w-4" />;
      case 'tier_upgrade': return <TrendingUp className="h-4 w-4" />;
      case 'milestone_complete': return <Target className="h-4 w-4" />;
      case 'weekly_summary': return <Calendar className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Achievement Auto-Posting</h2>
          <p className="text-muted-foreground">Automatically share achievements on X (Twitter)</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={xConnected ? 'default' : 'destructive'}>
            <Twitter className="h-3 w-3 mr-1" />
            {xConnected ? 'Connected' : 'Not Connected'}
          </Badge>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Send className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{rules.filter(r => r.enabled).length}</div>
            <div className="text-sm text-muted-foreground">Active Rules</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{postedTweets.filter(t => t.status === 'posted').length}</div>
            <div className="text-sm text-muted-foreground">Posts Sent</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">
              {postedTweets.reduce((sum, tweet) => sum + (tweet.engagement?.likes || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Likes</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">
              {postedTweets.reduce((sum, tweet) => sum + (tweet.engagement?.retweets || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Retweets</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Posting Rules</TabsTrigger>
          <TabsTrigger value="history">Post History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="space-y-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getTriggerIcon(rule.trigger)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{rule.name}</h3>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">
                            {rule.trigger.replace('_', ' ')}
                          </Badge>
                          {rule.enabled && (
                            <Badge className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRule(rule);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Template</Label>
                      <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                        {rule.template}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Include Image</Label>
                        <div className="mt-1">
                          {rule.includeImage ? (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Image className="h-3 w-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="outline">No</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Delay</Label>
                        <div className="mt-1 text-sm">{rule.delayMinutes} minutes</div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Posts Sent</Label>
                        <div className="mt-1 text-sm">{rule.postCount}</div>
                      </div>
                    </div>
                    
                    {rule.hashtags.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Hashtags</Label>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {rule.hashtags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Hash className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {rule.mentions.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Mentions</Label>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {rule.mentions.map((mention, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <AtSign className="h-3 w-3 mr-1" />
                              {mention}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-3">
            {postedTweets.map((tweet) => (
              <Card key={tweet.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Twitter className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{tweet.achievementName}</h4>
                          <Badge className={getStatusColor(tweet.status)}>
                            {tweet.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Posted {new Date(tweet.postedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {tweet.status === 'posted' && tweet.engagement && (
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span>{tweet.engagement.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <span>{tweet.engagement.replies}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <RefreshCw className="h-4 w-4 text-green-500" />
                          <span>{tweet.engagement.retweets}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{tweet.content}</p>
                  </div>
                  
                  {tweet.imageUrl && (
                    <div className="mt-3">
                      <img 
                        src={tweet.imageUrl} 
                        alt="Achievement" 
                        className="h-32 w-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Auto-Posting Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Auto-Posting</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow automatic posting of achievements to X
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Include Images</Label>
                  <p className="text-sm text-muted-foreground">
                    Attach achievement images to posts
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    Review posts before they are published
                  </p>
                </div>
                <Switch />
              </div>
              
              <div>
                <Label>Daily Post Limit</Label>
                <Input type="number" defaultValue="5" />
              </div>
              
              <div>
                <Label>Default Delay (minutes)</Label>
                <Input type="number" defaultValue="5" />
              </div>
              
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Rule Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Auto-Posting Rule</DialogTitle>
            <DialogDescription>
              Set up a new rule for automatic achievement posting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rule Name</Label>
                <Input placeholder="Enter rule name" />
              </div>
              <div>
                <Label>Trigger</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="achievement_unlock">Achievement Unlock</SelectItem>
                    <SelectItem value="tier_upgrade">Tier Upgrade</SelectItem>
                    <SelectItem value="milestone_complete">Milestone Complete</SelectItem>
                    <SelectItem value="weekly_summary">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Description</Label>
              <Input placeholder="Describe when this rule triggers" />
            </div>
            
            <div>
              <Label>Post Template</Label>
              <Textarea
                placeholder="Enter post template with variables like {achievement_name}, {tier_name}, etc."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Delay (minutes)</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div>
                <Label>Include Image</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Hashtags (comma separated)</Label>
              <Input placeholder="STX, Stack, Achievement" />
            </div>
            
            <div>
              <Label>Mentions (comma separated)</Label>
              <Input placeholder="@STXWORX_Degrants, @Stacks" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createRule({})}>
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Auto-Posting Rule</DialogTitle>
            <DialogDescription>
              Update the auto-posting rule configuration
            </DialogDescription>
          </DialogHeader>
          {selectedRule && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rule Name</Label>
                  <Input defaultValue={selectedRule.name} />
                </div>
                <div>
                  <Label>Trigger</Label>
                  <Select defaultValue={selectedRule.trigger}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="achievement_unlock">Achievement Unlock</SelectItem>
                      <SelectItem value="tier_upgrade">Tier Upgrade</SelectItem>
                      <SelectItem value="milestone_complete">Milestone Complete</SelectItem>
                      <SelectItem value="weekly_summary">Weekly Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <Input defaultValue={selectedRule.description} />
              </div>
              
              <div>
                <Label>Post Template</Label>
                <Textarea
                  defaultValue={selectedRule.template}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Delay (minutes)</Label>
                  <Input type="number" defaultValue={selectedRule.delayMinutes} />
                </div>
                <div>
                  <Label>Include Image</Label>
                  <Select defaultValue={selectedRule.includeImage.toString()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Hashtags (comma separated)</Label>
                <Input defaultValue={selectedRule.hashtags.join(', ')} />
              </div>
              
              <div>
                <Label>Mentions (comma separated)</Label>
                <Input defaultValue={selectedRule.mentions.join(', ')} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedRule && updateRule(selectedRule.id, {})}>
              Update Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
