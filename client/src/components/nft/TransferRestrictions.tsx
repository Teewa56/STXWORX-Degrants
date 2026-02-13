import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Lock, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Save, 
  Ban, 
  Unlock, 
  Timer, 
  Key, 
  Globe, 
  Filter, 
  Search, 
  AlertCircle, 
  Info, 
  Zap, 
  Target, 
  Crown, 
  Award, 
  Star, 
  Hash, 
  Calendar, 
  Activity, 
  BarChart3, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  ShieldOff, 
  LockOpen, 
  LockKeyhole
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransferRestriction {
  id: string;
  name: string;
  type: 'soulbound' | 'timelock' | 'approval' | 'whitelist' | 'blacklist' | 'reputation' | 'geographic' | 'tier_based';
  description: string;
  enabled: boolean;
  global: boolean;
  parameters: {
    lockTime?: number;
    minReputation?: number;
    allowedAddresses?: string[];
    blockedAddresses?: string[];
    requireSignature?: boolean;
    allowedCountries?: string[];
    blockedCountries?: string[];
    minTier?: string;
    maxTransfers?: number;
    cooldownPeriod?: number;
  };
  conditions: {
    operator: 'and' | 'or';
    rules: {
      field: string;
      operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in';
      value: any;
    }[];
  }[];
  exceptions: {
    type: string;
    description: string;
    allowed: boolean;
    conditions: any;
  }[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface RestrictionTemplate {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'compliance' | 'trading' | 'special';
  restrictions: Omit<TransferRestriction, 'id' | 'name' | 'description' | 'createdAt' | 'updatedAt' | 'createdBy'>[];
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

interface RestrictionViolation {
  id: string;
  restrictionId: string;
  restrictionName: string;
  from: string;
  to: string;
  achievementId: string;
  achievementName: string;
  violationType: 'blocked' | 'pending_approval' | 'timelock' | 'reputation' | 'whitelist' | 'geographic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  attemptedAt: string;
  resolved: boolean;
  resolvedAt?: string;
  resolution?: string;
}

export const TransferRestrictions: React.FC = () => {
  const [restrictions, setRestrictions] = useState<TransferRestriction[]>([]);
  const [templates, setTemplates] = useState<RestrictionTemplate[]>([]);
  const [violations, setViolations] = useState<RestrictionViolation[]>([]);
  const [selectedRestriction, setSelectedRestriction] = useState<TransferRestriction | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('restrictions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadRestrictionData();
  }, []);

  const loadRestrictionData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockRestrictions: TransferRestriction[] = [
        {
          id: '1',
          name: 'Genesis Soulbound',
          type: 'soulbound',
          description: 'Genesis achievements are permanently bound to their original owners',
          enabled: true,
          global: true,
          parameters: {},
          conditions: [],
          exceptions: [],
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          createdBy: '0xPlatformAdmin'
        },
        {
          id: '2',
          name: '30-Day Timelock',
          type: 'timelock',
          description: 'Newly acquired achievements cannot be transferred for 30 days',
          enabled: true,
          global: true,
          parameters: {
            lockTime: 30,
            cooldownPeriod: 0
          },
          conditions: [
            {
              operator: 'and',
              rules: [
                {
                  field: 'acquiredAt',
                  operator: 'greater_than',
                  value: 'now() - 30 days'
                }
              ]
            }
          ],
          exceptions: [
            {
              type: 'admin_override',
              description: 'Admins can bypass timelock',
              allowed: true,
              conditions: {
                role: 'admin'
              }
            }
          ],
          createdAt: '2024-01-10T08:00:00Z',
          updatedAt: '2024-01-18T14:30:00Z',
          createdBy: '0xPlatformAdmin'
        },
        {
          id: '3',
          name: 'High-Value Approval',
          type: 'approval',
          description: 'Achievements worth >1000 STX require admin approval for transfer',
          enabled: true,
          global: true,
          parameters: {
            requireSignature: true,
            minReputation: 100
          },
          conditions: [
            {
              operator: 'or',
              rules: [
                {
                  field: 'floorPrice',
                  operator: 'greater_than',
                  value: 1000
                },
                {
                  field: 'rarity',
                  operator: 'in',
                  value: ['legendary', 'mythic']
                }
              ]
            }
          ],
          exceptions: [],
          createdAt: '2024-01-12T12:00:00Z',
          updatedAt: '2024-01-20T09:15:00Z',
          createdBy: '0xPlatformAdmin'
        },
        {
          id: '4',
          name: 'Verified Addresses Only',
          type: 'whitelist',
          description: 'Only transfers to verified addresses are allowed',
          enabled: false,
          global: false,
          parameters: {
            allowedAddresses: [
              '0xVerified1',
              '0xVerified2',
              '0xVerified3'
            ]
          },
          conditions: [
            {
              operator: 'and',
              rules: [
                {
                  field: 'toAddress',
                  operator: 'in',
                  value: ['0xVerified1', '0xVerified2', '0xVerified3']
                }
              ]
            }
          ],
          exceptions: [],
          createdAt: '2024-01-08T15:30:00Z',
          updatedAt: '2024-01-16T11:20:00Z',
          createdBy: '0xPlatformAdmin'
        },
        {
          id: '5',
          name: 'Minimum Reputation',
          type: 'reputation',
          description: 'Users need minimum reputation score to transfer certain achievements',
          enabled: true,
          global: true,
          parameters: {
            minReputation: 50
          },
          conditions: [
            {
              operator: 'and',
              rules: [
                {
                  field: 'fromReputation',
                  operator: 'greater_than',
                  value: 50
                },
                {
                  field: 'achievementRarity',
                  operator: 'in',
                  value: ['epic', 'legendary', 'mythic']
                }
              ]
            }
          ],
          exceptions: [],
          createdAt: '2024-01-05T09:45:00Z',
          updatedAt: '2024-01-19T16:45:00Z',
          createdBy: '0xPlatformAdmin'
        }
      ];

      const mockTemplates: RestrictionTemplate[] = [
        {
          id: '1',
          name: 'Security First',
          description: 'Maximum security restrictions for valuable assets',
          category: 'security',
          restrictions: [
            {
              type: 'soulbound',
              enabled: true,
              global: true,
              parameters: {}
            },
            {
              type: 'approval',
              enabled: true,
              global: true,
              parameters: {
                requireSignature: true,
                minReputation: 100
              }
            },
            {
              type: 'timelock',
              enabled: true,
              global: true,
              parameters: {
                lockTime: 90
              }
            }
          ],
          icon: '🔒',
          difficulty: 'expert'
        },
        {
          id: '2',
          name: 'Balanced Trading',
          description: 'Moderate restrictions for healthy trading',
          category: 'trading',
          restrictions: [
            {
              type: 'timelock',
              enabled: true,
              global: true,
              parameters: {
                lockTime: 7
              }
            },
            {
              type: 'reputation',
              enabled: true,
              global: true,
              parameters: {
                minReputation: 25
              }
            }
          ],
          icon: '⚖️',
          difficulty: 'medium'
        },
        {
          id: '3',
          name: 'Open Market',
          description: 'Minimal restrictions for free trading',
          category: 'trading',
          restrictions: [
            {
              type: 'approval',
              enabled: false,
              global: false,
              parameters: {}
            },
            {
              type: 'timelock',
              enabled: true,
              global: true,
              parameters: {
                lockTime: 1
              }
            }
          ],
          icon: '🌍',
          difficulty: 'easy'
        }
      ];

      const mockViolations: RestrictionViolation[] = [
        {
          id: '1',
          restrictionId: '2',
          restrictionName: '30-Day Timelock',
          from: '0xUser1',
          to: '0xUser2',
          achievementId: '1',
          achievementName: 'Early Adopter',
          violationType: 'timelock',
          severity: 'medium',
          description: 'Transfer attempted before 30-day timelock period expired',
          attemptedAt: '2024-01-20T14:30:00Z',
          resolved: false
        },
        {
          id: '2',
          restrictionId: '3',
          restrictionName: 'High-Value Approval',
          from: '0xUser3',
          to: '0xUser4',
          achievementId: '2',
          achievementName: 'Master Developer',
          violationType: 'pending_approval',
          severity: 'high',
          description: 'High-value achievement transfer requires admin approval',
          attemptedAt: '2024-01-19T10:15:00Z',
          resolved: false
        },
        {
          id: '3',
          restrictionId: '4',
          restrictionName: 'Verified Addresses Only',
          from: '0xUser5',
          to: '0xUnverified',
          achievementId: '3',
          achievementName: 'Community Leader',
          violationType: 'whitelist',
          severity: 'high',
          description: 'Transfer to non-verified address blocked',
          attemptedAt: '2024-01-18T16:45:00Z',
          resolved: true,
          resolvedAt: '2024-01-18T17:00:00Z',
          resolution: 'User cancelled transfer'
        }
      ];

      setRestrictions(mockRestrictions);
      setTemplates(mockTemplates);
      setViolations(mockViolations);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load restriction data",
        variant: "destructive"
      });
    }
  };

  const getRestrictionIcon = (type: string) => {
    switch (type) {
      case 'soulbound': return <LockKeyhole className="h-4 w-4" />;
      case 'timelock': return <Clock className="h-4 w-4" />;
      case 'approval': return <ShieldCheck className="h-4 w-4" />;
      case 'whitelist': return <Users className="h-4 w-4" />;
      case 'blacklist': return <Ban className="h-4 w-4" />;
      case 'reputation': return <Star className="h-4 w-4" />;
      case 'geographic': return <Globe className="h-4 w-4" />;
      case 'tier_based': return <Crown className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleRestriction = async (restrictionId: string, enabled: boolean) => {
    try {
      // API call to toggle restriction
      setRestrictions(prev => prev.map(restriction => 
        restriction.id === restrictionId ? { ...restriction, enabled } : restriction
      ));
      
      toast({
        title: "Restriction Updated",
        description: `Transfer restriction ${enabled ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update restriction",
        variant: "destructive"
      });
    }
  };

  const createRestriction = async (restrictionData: Partial<TransferRestriction>) => {
    try {
      // API call to create restriction
      const newRestriction: TransferRestriction = {
        id: Date.now().toString(),
        name: restrictionData.name || '',
        type: restrictionData.type || 'approval',
        description: restrictionData.description || '',
        enabled: restrictionData.enabled || false,
        global: restrictionData.global || false,
        parameters: restrictionData.parameters || {},
        conditions: restrictionData.conditions || [],
        exceptions: restrictionData.exceptions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: '0xCurrentUser'
      };

      setRestrictions(prev => [newRestriction, ...prev]);
      
      toast({
        title: "Restriction Created",
        description: "Transfer restriction has been created successfully"
      });
      
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create restriction",
        variant: "destructive"
      });
    }
  };

  const applyTemplate = async (template: RestrictionTemplate) => {
    try {
      // API call to apply template
      const newRestrictions = template.restrictions.map((restriction, index) => ({
        ...restriction,
        id: `template_${template.id}_${index}`,
        name: `${template.name} - ${restriction.type}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: '0xCurrentUser'
      }));

      setRestrictions(prev => [...newRestrictions, ...prev]);
      
      toast({
        title: "Template Applied",
        description: `${template.name} template has been applied`
      });
      
      setIsTemplateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Template Failed",
        description: "Failed to apply template",
        variant: "destructive"
      });
    }
  };

  const filteredRestrictions = restrictions.filter(restriction => {
    const matchesSearch = restriction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restriction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || restriction.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'enabled' && restriction.enabled) ||
                         (filterStatus === 'disabled' && !restriction.enabled);
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transfer Restrictions</h2>
          <p className="text-muted-foreground">Manage achievement NFT transfer restrictions and policies</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Restriction
          </Button>
          <Button onClick={() => setIsTemplateDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Templates
          </Button>
        </div>
      </div>

      {/* Restriction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{restrictions.length}</div>
            <div className="text-sm text-muted-foreground">Total Restrictions</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <LockKeyhole className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="text-2xl font-bold">{restrictions.filter(r => r.enabled).length}</div>
            <div className="text-sm text-muted-foreground">Active Restrictions</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{violations.filter(v => !v.resolved).length}</div>
            <div className="text-sm text-muted-foreground">Pending Violations</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{restrictions.filter(r => r.global).length}</div>
            <div className="text-sm text-muted-foreground">Global Restrictions</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="restrictions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search restrictions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="soulbound">Soulbound</SelectItem>
                      <SelectItem value="timelock">Timelock</SelectItem>
                      <SelectItem value="approval">Approval</SelectItem>
                      <SelectItem value="whitelist">Whitelist</SelectItem>
                      <SelectItem value="blacklist">Blacklist</SelectItem>
                      <SelectItem value="reputation">Reputation</SelectItem>
                      <SelectItem value="geographic">Geographic</SelectItem>
                      <SelectItem value="tier_based">Tier Based</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Restrictions List */}
          <div className="space-y-3">
            {filteredRestrictions.map((restriction) => (
              <Card key={restriction.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getRestrictionIcon(restriction.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{restriction.name}</h4>
                          <Badge variant="outline" className="capitalize">
                            {restriction.type.replace('_', ' ')}
                          </Badge>
                          {restriction.global && (
                            <Badge variant="secondary">Global</Badge>
                          )}
                          <Badge variant={restriction.enabled ? 'default' : 'secondary'}>
                            {restriction.enabled ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {restriction.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Created {new Date(restriction.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Switch
                        checked={restriction.enabled}
                        onCheckedChange={(checked) => toggleRestriction(restriction.id, checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRestriction(restriction);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Delete restriction
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Parameters */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium mb-2">Parameters:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {Object.entries(restriction.parameters).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize text-muted-foreground">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="font-medium">
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <div className="space-y-3">
            {violations.map((violation) => (
              <Card key={violation.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{violation.achievementName}</h4>
                          <Badge className={getSeverityColor(violation.severity)}>
                            {violation.severity}
                          </Badge>
                          <Badge variant={violation.resolved ? 'default' : 'secondary'}>
                            {violation.resolved ? 'Resolved' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {violation.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {violation.from.slice(0, 6)}...{violation.from.slice(-4)} → {violation.to.slice(0, 6)}...{violation.to.slice(-4)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Attempted {new Date(violation.attemptedAt).toLocaleString()}
                        </div>
                        {violation.resolved && violation.resolvedAt && (
                          <div className="text-xs text-green-600">
                            Resolved {new Date(violation.resolvedAt).toLocaleString()}: {violation.resolution}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium mb-2">
                        {violation.restrictionName}
                      </div>
                      {!violation.resolved && (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{template.icon}</div>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Restrictions:</span>
                      <span>{template.restrictions.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Difficulty:</span>
                      <span className="capitalize">{template.difficulty}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => applyTemplate(template)}
                  >
                    Apply Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Restriction Effectiveness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Restriction effectiveness analytics will be implemented here</p>
                  <p className="text-sm">Show how well restrictions are working</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Violation Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Violation trend analysis will be implemented here</p>
                  <p className="text-sm">Track violation patterns over time</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Restriction Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Create Transfer Restriction
            </DialogTitle>
            <DialogDescription>
              Define a new transfer restriction rule
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Restriction Name</Label>
                <Input placeholder="Enter restriction name" />
              </div>
              <div>
                <Label>Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soulbound">Soulbound</SelectItem>
                    <SelectItem value="timelock">Timelock</SelectItem>
                    <SelectItem value="approval">Approval Required</SelectItem>
                    <SelectItem value="whitelist">Whitelist</SelectItem>
                    <SelectItem value="blacklist">Blacklist</SelectItem>
                    <SelectItem value="reputation">Reputation Based</SelectItem>
                    <SelectItem value="geographic">Geographic</SelectItem>
                    <SelectItem value="tier_based">Tier Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Describe the restriction" rows={3} />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="global" />
              <Label htmlFor="global">Apply globally to all achievements</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="enabled" defaultChecked />
              <Label htmlFor="enabled">Enable restriction immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createRestriction({})}>
              Create Restriction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Restriction Templates
            </DialogTitle>
            <DialogDescription>
              Choose a pre-configured restriction template
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{template.icon}</div>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Restrictions:</span>
                      <span>{template.restrictions.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Difficulty:</span>
                      <span className="capitalize">{template.difficulty}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => applyTemplate(template)}
                  >
                    Apply Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
