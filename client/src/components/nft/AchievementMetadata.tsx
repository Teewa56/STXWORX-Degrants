import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Code, 
  Image, 
  Link, 
  Copy, 
  Download, 
  Upload,
  Eye,
  Edit,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  Settings,
  Database,
  Globe,
  Shield,
  Hash,
  Calendar,
  User,
  Tag,
  Layers,
  Package,
  ExternalLink,
  Search,
  Filter,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Grid,
  List
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MetadataField {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  required: boolean;
  editable: boolean;
}

interface AchievementMetadata {
  id: string;
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: {
    trait_type: string;
    value: string | number;
    display_type?: string;
    trait_count?: number;
  }[];
  properties: {
    category: string;
    rarity: string;
    tier: string;
    points: number;
    created_at: string;
    creator: string;
    contract_address: string;
    token_id: string;
    blockchain: string;
  };
  custom_fields: Record<string, any>;
  ipfs_hash: string;
  version: string;
  last_updated: string;
}

interface MetadataTemplate {
  id: string;
  name: string;
  description: string;
  fields: MetadataField[];
  category: string;
  version: string;
}

export const AchievementMetadata: React.FC = () => {
  const [metadata, setMetadata] = useState<AchievementMetadata[]>([]);
  const [templates, setTemplates] = useState<MetadataTemplate[]>([]);
  const [selectedMetadata, setSelectedMetadata] = useState<AchievementMetadata | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingMetadata, setEditingMetadata] = useState<AchievementMetadata | null>(null);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadMetadata();
    loadTemplates();
  }, []);

  const loadMetadata = async () => {
    try {
      // Mock data - replace with actual API call
      const mockMetadata: AchievementMetadata[] = [
        {
          id: '1',
          name: 'Early Adopter',
          description: 'One of the first 100 users to join the STXWORX-Degrants platform',
          image: 'https://ipfs.io/ipfs/QmEarlyAdopterImage',
          external_url: 'https://stxworx-degrants.com/achievement/early-adopter',
          attributes: [
            {
              trait_type: 'Rarity',
              value: 'Legendary',
              display_type: 'string'
            },
            {
              trait_type: 'Series',
              value: 'Genesis',
              display_type: 'string'
            },
            {
              trait_type: 'Supply',
              value: 100,
              display_type: 'number'
            },
            {
              trait_type: 'Points',
              value: 500,
              display_type: 'number'
            }
          ],
          properties: {
            category: 'Platform',
            rarity: 'Legendary',
            tier: 'Gold',
            points: 500,
            created_at: '2024-01-15T10:00:00Z',
            creator: '0xPlatformContract',
            contract_address: 'SP1...AchievementContract',
            token_id: '1',
            blockchain: 'Stacks'
          },
          custom_fields: {
            special_benefits: ['Early access features', 'Exclusive discord role'],
            unlock_criteria: 'Be one of first 100 users',
            verification_method: 'On-chain timestamp'
          },
          ipfs_hash: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
          version: '1.0.0',
          last_updated: '2024-01-20T14:30:00Z'
        },
        {
          id: '2',
          name: 'Master Developer',
          description: 'Completed 50+ successful projects with 5-star ratings',
          image: 'https://ipfs.io/ipfs/QmMasterDevImage',
          attributes: [
            {
              trait_type: 'Rarity',
              value: 'Epic',
              display_type: 'string'
            },
            {
              trait_type: 'Skill Level',
              value: 'Expert',
              display_type: 'string'
            },
            {
              trait_type: 'Projects Completed',
              value: 50,
              display_type: 'number'
            }
          ],
          properties: {
            category: 'Skill',
            rarity: 'Epic',
            tier: 'Platinum',
            points: 1000,
            created_at: '2024-01-10T08:00:00Z',
            creator: '0xPlatformContract',
            contract_address: 'SP1...AchievementContract',
            token_id: '2',
            blockchain: 'Stacks'
          },
          custom_fields: {
            average_rating: 5.0,
            total_earnings: '50000 STX',
            special_skills: ['Smart Contracts', 'Frontend', 'Backend']
          },
          ipfs_hash: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdj',
          version: '1.0.0',
          last_updated: '2024-01-18T16:45:00Z'
        }
      ];

      setMetadata(mockMetadata);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load metadata",
        variant: "destructive"
      });
    }
  };

  const loadTemplates = async () => {
    try {
      // Mock data - replace with actual API call
      const mockTemplates: MetadataTemplate[] = [
        {
          id: '1',
          name: 'Standard Achievement',
          description: 'Basic achievement metadata template',
          fields: [
            {
              key: 'name',
              value: '',
              type: 'string',
              description: 'Achievement name',
              required: true,
              editable: true
            },
            {
              key: 'description',
              value: '',
              type: 'string',
              description: 'Achievement description',
              required: true,
              editable: true
            },
            {
              key: 'image',
              value: '',
              type: 'string',
              description: 'Achievement image URL',
              required: true,
              editable: true
            }
          ],
          category: 'Basic',
          version: '1.0.0'
        },
        {
          id: '2',
          name: 'Skill Achievement',
          description: 'Skill-based achievement metadata template',
          fields: [
            {
              key: 'skill_level',
              value: '',
              type: 'string',
              description: 'Skill level required',
              required: true,
              editable: true
            },
            {
              key: 'projects_completed',
              value: 0,
              type: 'number',
              description: 'Number of projects completed',
              required: true,
              editable: true
            }
          ],
          category: 'Skill',
          version: '1.0.0'
        }
      ];

      setTemplates(mockTemplates);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      });
    }
  };

  const saveMetadata = async (updatedMetadata: AchievementMetadata) => {
    try {
      // API call to save metadata
      setMetadata(prev => prev.map(meta => 
        meta.id === updatedMetadata.id ? updatedMetadata : meta
      ));
      
      toast({
        title: "Metadata Saved",
        description: "Achievement metadata has been updated"
      });
      
      setIsEditDialogOpen(false);
      setEditingMetadata(null);
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save metadata",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Content copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const exportMetadata = async (metadata: AchievementMetadata) => {
    try {
      const dataStr = JSON.stringify(metadata, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `achievement-${metadata.id}-metadata.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Export Successful",
        description: "Metadata exported successfully"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export metadata",
        variant: "destructive"
      });
    }
  };

  const toggleFieldExpansion = (field: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(field)) {
      newExpanded.delete(field);
    } else {
      newExpanded.add(field);
    }
    setExpandedFields(newExpanded);
  };

  const renderFieldValue = (value: any, type: string) => {
    if (type === 'object' || type === 'array') {
      return (
        <div className="ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFieldExpansion(type)}
            className="text-xs"
          >
            {expandedFields.has(type) ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expandedFields.has(type) ? 'Hide' : 'Show'} {type}
          </Button>
          {expandedFields.has(type) && (
            <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(value, null, 2)}
            </pre>
          )}
        </div>
      );
    }
    
    return <span className="font-mono text-sm">{String(value)}</span>;
  };

  const filteredMetadata = metadata.filter(meta => {
    const matchesSearch = meta.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meta.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || meta.properties.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Achievement Metadata</h2>
          <p className="text-muted-foreground">View and manage achievement NFT metadata</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Metadata
          </Button>
        </div>
      </div>

      {/* Metadata Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{metadata.length}</div>
            <div className="text-sm text-muted-foreground">Total Metadata</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Layers className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{templates.length}</div>
            <div className="text-sm text-muted-foreground">Templates</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{metadata.filter(m => m.ipfs_hash).length}</div>
            <div className="text-sm text-muted-foreground">IPFS Stored</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{metadata.filter(m => m.version === '1.0.0').length}</div>
            <div className="text-sm text-muted-foreground">Latest Version</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="validator">Validator</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search metadata..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <div className="flex gap-2">
                  <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Categories</option>
                    <option value="Platform">Platform</option>
                    <option value="Skill">Skill</option>
                    <option value="Social">Social</option>
                    <option value="Milestone">Milestone</option>
                  </select>
                  
                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMetadata.map((meta) => (
                <Card key={meta.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold mb-1">{meta.name}</h3>
                        <Badge variant="outline">{meta.properties.category}</Badge>
                      </div>
                      <Badge variant="secondary">{meta.version}</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {meta.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Attributes:</span>
                        <span>{meta.attributes.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IPFS:</span>
                        <span className="font-mono text-xs">{meta.ipfs_hash.slice(0, 10)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Updated:</span>
                        <span>{new Date(meta.last_updated).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedMetadata(meta);
                          setIsViewDialogOpen(true);
                        }}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingMetadata(meta);
                          setIsEditDialogOpen(true);
                        }}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportMetadata(meta)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMetadata.map((meta) => (
                <Card key={meta.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">{meta.name}</h4>
                            <Badge variant="outline">{meta.properties.category}</Badge>
                            <Badge variant="secondary">{meta.version}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {meta.attributes.length} attributes • Updated {new Date(meta.last_updated).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMetadata(meta);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingMetadata(meta);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportMetadata(meta)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{template.name}</span>
                    <Badge variant="outline">{template.category}</Badge>
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Version:</span>
                      <span>{template.version}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fields:</span>
                      <span>{template.fields.length}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Fields:</div>
                      <div className="space-y-1">
                        {template.fields.slice(0, 3).map((field, index) => (
                          <div key={index} className="text-xs text-muted-foreground">
                            • {field.key} ({field.type})
                          </div>
                        ))}
                        {template.fields.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            • ...and {template.fields.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Metadata Schema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Standard Fields</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="font-medium text-sm">name</div>
                      <div className="text-xs text-muted-foreground">string - Required</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="font-medium text-sm">description</div>
                      <div className="text-xs text-muted-foreground">string - Required</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="font-medium text-sm">image</div>
                      <div className="text-xs text-muted-foreground">string - Required</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="font-medium text-sm">attributes</div>
                      <div className="text-xs text-muted-foreground">array - Optional</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Custom Properties</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="font-medium text-sm">category</div>
                      <div className="text-xs text-muted-foreground">Achievement category</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="font-medium text-sm">rarity</div>
                      <div className="text-xs text-muted-foreground">Achievement rarity</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="font-medium text-sm">points</div>
                      <div className="text-xs text-muted-foreground">Point value</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="font-medium text-sm">tier</div>
                      <div className="text-xs text-muted-foreground">Reward tier</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Metadata Validator
              </CardTitle>
              <CardDescription>
                Validate achievement metadata against standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Upload Metadata JSON</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-muted-foreground">
                    Drop JSON file here or click to browse
                  </p>
                  <Button variant="outline" className="mt-2">
                    Choose File
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Or Paste JSON</Label>
                <Textarea
                  placeholder="Paste your metadata JSON here..."
                  className="mt-2"
                  rows={8}
                />
              </div>
              
              <Button className="w-full">
                <CheckCircle className="h-4 w-4 mr-2" />
                Validate Metadata
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Metadata Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Achievement Metadata
            </DialogTitle>
          </DialogHeader>
          {selectedMetadata && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded font-medium">
                    {selectedMetadata.name}
                  </div>
                </div>
                <div>
                  <Label>Version</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded font-medium">
                    {selectedMetadata.version}
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <div className="mt-1 p-2 bg-gray-50 rounded">
                  {selectedMetadata.description}
                </div>
              </div>
              
              {/* Image */}
              <div>
                <Label>Image</Label>
                <div className="mt-1">
                  <img 
                    src={selectedMetadata.image} 
                    alt={selectedMetadata.name}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="mt-2 flex items-center space-x-2">
                    <Input value={selectedMetadata.image} readOnly className="font-mono text-sm" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedMetadata.image)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Attributes */}
              <div>
                <Label>Attributes</Label>
                <div className="mt-2 space-y-2">
                  {selectedMetadata.attributes.map((attr, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{attr.trait_type}</div>
                        <div className="text-sm text-muted-foreground">
                          {attr.display_type || 'string'}
                        </div>
                      </div>
                      <div className="font-mono text-sm">
                        {String(attr.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Properties */}
              <div>
                <Label>Properties</Label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedMetadata.properties).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded">
                      <div className="font-medium text-sm capitalize">{key.replace('_', ' ')}</div>
                      <div className="font-mono text-sm">
                        {String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Custom Fields */}
              {Object.keys(selectedMetadata.custom_fields).length > 0 && (
                <div>
                  <Label>Custom Fields</Label>
                  <div className="mt-2">
                    <pre className="p-3 bg-gray-50 rounded text-xs overflow-auto">
                      {JSON.stringify(selectedMetadata.custom_fields, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {/* Technical Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>IPFS Hash</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Input value={selectedMetadata.ipfs_hash} readOnly className="font-mono text-sm" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedMetadata.ipfs_hash)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded">
                    {new Date(selectedMetadata.last_updated).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => selectedMetadata && exportMetadata(selectedMetadata)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Metadata Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2" />
              Edit Metadata
            </DialogTitle>
          </DialogHeader>
          {editingMetadata && (
            <div className="space-y-6">
              <div>
                <Label>Name</Label>
                <Input
                  value={editingMetadata.name}
                  onChange={(e) => setEditingMetadata({...editingMetadata, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingMetadata.description}
                  onChange={(e) => setEditingMetadata({...editingMetadata, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Image URL</Label>
                <Input
                  value={editingMetadata.image}
                  onChange={(e) => setEditingMetadata({...editingMetadata, image: e.target.value})}
                />
              </div>
              
              <div>
                <Label>External URL</Label>
                <Input
                  value={editingMetadata.external_url || ''}
                  onChange={(e) => setEditingMetadata({...editingMetadata, external_url: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => editingMetadata && saveMetadata(editingMetadata)}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
