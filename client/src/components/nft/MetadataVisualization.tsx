import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  Eye, 
  Download, 
  Filter,
  Search,
  Settings,
  Layers,
  Database,
  Globe,
  Hash,
  Tag,
  Calendar,
  Activity,
  Zap,
  Target,
  Award,
  Star,
  Grid,
  List,
  Maximize2,
  RefreshCw,
  Share2,
  FileText,
  Image,
  Palette,
  Sliders,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MetadataVisualization {
  id: string;
  name: string;
  type: 'chart' | 'graph' | 'heatmap' | 'timeline' | 'network' | 'distribution';
  title: string;
  description: string;
  data: any;
  config: {
    chartType: string;
    xAxis?: string;
    yAxis?: string;
    colorScheme?: string;
    animation?: boolean;
    interactive?: boolean;
  };
  created_at: string;
  updated_at: string;
  views: number;
  shares: number;
}

interface VisualizationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'analytics' | 'comparison' | 'trends' | 'distribution';
  thumbnail: string;
  config: {
    chartType: string;
    defaultData: any;
    customizable: boolean;
  };
}

interface MetadataField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  values: any[];
  distribution: {
    value: string | number;
    count: number;
    percentage: number;
  }[];
  trends: {
    date: string;
    value: number;
  }[];
}

export const MetadataVisualization: React.FC = () => {
  const [visualizations, setVisualizations] = useState<MetadataVisualization[]>([]);
  const [templates, setTemplates] = useState<VisualizationTemplate[]>([]);
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);
  const [selectedViz, setSelectedViz] = useState<MetadataVisualization | null>(null);
  const [activeTab, setActiveTab] = useState('gallery');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<VisualizationTemplate | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadVisualizationData();
  }, []);

  const loadVisualizationData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockVisualizations: MetadataVisualization[] = [
        {
          id: '1',
          name: 'Achievement Rarity Distribution',
          type: 'pie',
          title: 'Distribution of Achievement Rarities',
          description: 'Visual representation of achievement rarity distribution across all users',
          data: {
            labels: ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'],
            datasets: [{
              data: [45, 30, 15, 8, 2],
              backgroundColor: ['#9CA3AF', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899']
            }]
          },
          config: {
            chartType: 'pie',
            colorScheme: 'default',
            animation: true,
            interactive: true
          },
          created_at: '2024-01-20T10:00:00Z',
          updated_at: '2024-01-20T14:30:00Z',
          views: 245,
          shares: 18
        },
        {
          id: '2',
          name: 'Points Over Time',
          type: 'line',
          title: 'User Points Accumulation Timeline',
          description: 'Track how users accumulate points over time',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Average Points',
              data: [1200, 1900, 2500, 2800, 3200, 3800],
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)'
            }]
          },
          config: {
            chartType: 'line',
            xAxis: 'time',
            yAxis: 'points',
            animation: true,
            interactive: true
          },
          created_at: '2024-01-18T09:15:00Z',
          updated_at: '2024-01-19T16:45:00Z',
          views: 189,
          shares: 12
        },
        {
          id: '3',
          name: 'Category Performance',
          type: 'bar',
          title: 'Achievement Categories Performance',
          description: 'Compare performance across different achievement categories',
          data: {
            labels: ['Platform', 'Skill', 'Social', 'Milestone', 'Special'],
            datasets: [{
              label: 'Number of Achievements',
              data: [156, 234, 89, 67, 45],
              backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']
            }]
          },
          config: {
            chartType: 'bar',
            xAxis: 'category',
            yAxis: 'count',
            animation: true,
            interactive: true
          },
          created_at: '2024-01-15T14:20:00Z',
          updated_at: '2024-01-17T11:30:00Z',
          views: 167,
          shares: 8
        },
        {
          id: '4',
          name: 'User Engagement Heatmap',
          type: 'heatmap',
          title: 'User Engagement by Day and Hour',
          description: 'Heatmap showing user engagement patterns',
          data: {
            // Mock heatmap data
            grid: Array(7).fill(null).map(() => 
              Array(24).fill(null).map(() => Math.floor(Math.random() * 100))
            )
          },
          config: {
            chartType: 'heatmap',
            colorScheme: 'blues',
            animation: false,
            interactive: true
          },
          created_at: '2024-01-12T08:45:00Z',
          updated_at: '2024-01-16T10:20:00Z',
          views: 298,
          shares: 24
        }
      ];

      const mockTemplates: VisualizationTemplate[] = [
        {
          id: '1',
          name: 'Rarity Distribution',
          description: 'Pie chart showing achievement rarity distribution',
          category: 'distribution',
          thumbnail: '📊',
          config: {
            chartType: 'pie',
            defaultData: {},
            customizable: true
          }
        },
        {
          id: '2',
          name: 'Performance Trends',
          description: 'Line chart for tracking performance over time',
          category: 'trends',
          thumbnail: '📈',
          config: {
            chartType: 'line',
            defaultData: {},
            customizable: true
          }
        },
        {
          id: '3',
          name: 'Category Comparison',
          description: 'Bar chart for comparing different categories',
          category: 'comparison',
          thumbnail: '📊',
          config: {
            chartType: 'bar',
            defaultData: {},
            customizable: true
          }
        },
        {
          id: '4',
          name: 'Engagement Analytics',
          description: 'Complex analytics dashboard',
          category: 'analytics',
          thumbnail: '📊',
          config: {
            chartType: 'mixed',
            defaultData: {},
            customizable: true
          }
        }
      ];

      const mockMetadataFields: MetadataField[] = [
        {
          name: 'Rarity',
          type: 'string',
          values: ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'],
          distribution: [
            { value: 'Common', count: 4500, percentage: 45.0 },
            { value: 'Rare', count: 3000, percentage: 30.0 },
            { value: 'Epic', count: 1500, percentage: 15.0 },
            { value: 'Legendary', count: 800, percentage: 8.0 },
            { value: 'Mythic', count: 200, percentage: 2.0 }
          ],
          trends: [
            { date: '2024-01-01', value: 4200 },
            { date: '2024-01-02', value: 4350 },
            { date: '2024-01-03', value: 4500 },
            { date: '2024-01-04', value: 4600 },
            { date: '2024-01-05', value: 4800 }
          ]
        },
        {
          name: 'Points',
          type: 'number',
          values: [10, 50, 100, 500, 1000, 2000],
          distribution: [
            { value: '0-100', count: 6000, percentage: 60.0 },
            { value: '101-500', count: 2500, percentage: 25.0 },
            { value: '501-1000', count: 1000, percentage: 10.0 },
            { value: '1000+', count: 500, percentage: 5.0 }
          ],
          trends: [
            { date: '2024-01-01', value: 850 },
            { date: '2024-01-02', value: 920 },
            { date: '2024-01-03', value: 980 },
            { date: '2024-01-04', value: 1050 },
            { date: '2024-01-05', value: 1120 }
          ]
        },
        {
          name: 'Category',
          type: 'string',
          values: ['Platform', 'Skill', 'Social', 'Milestone', 'Special'],
          distribution: [
            { value: 'Platform', count: 2800, percentage: 28.0 },
            { value: 'Skill', count: 3200, percentage: 32.0 },
            { value: 'Social', count: 1800, percentage: 18.0 },
            { value: 'Milestone', count: 1500, percentage: 15.0 },
            { value: 'Special', count: 700, percentage: 7.0 }
          ],
          trends: [
            { date: '2024-01-01', value: 890 },
            { date: '2024-01-02', value: 920 },
            { date: '2024-01-03', value: 960 },
            { date: '2024-01-04', value: 990 },
            { date: '2024-01-05', value: 1020 }
          ]
        }
      ];

      setVisualizations(mockVisualizations);
      setTemplates(mockTemplates);
      setMetadataFields(mockMetadataFields);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load visualization data",
        variant: "destructive"
      });
    }
  };

  const getVisualizationIcon = (type: string) => {
    switch (type) {
      case 'pie': return <PieChart className="h-4 w-4" />;
      case 'line': return <LineChart className="h-4 w-4" />;
      case 'bar': return <BarChart3 className="h-4 w-4" />;
      case 'heatmap': return <Grid className="h-4 w-4" />;
      case 'network': return <Globe className="h-4 w-4" />;
      case 'timeline': return <Calendar className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      case 'comparison': return <TrendingUp className="h-4 w-4" />;
      case 'trends': return <LineChart className="h-4 w-4" />;
      case 'distribution': return <PieChart className="h-4 w-4" />;
      default: return <Grid className="h-4 w-4" />;
    }
  };

  const filteredVisualizations = visualizations.filter(viz => {
    const matchesSearch = viz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         viz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || viz.type === filterType;
    return matchesSearch && matchesType;
  });

  const renderChartPreview = (viz: MetadataVisualization) => {
    // Simple chart preview based on type
    switch (viz.type) {
      case 'pie':
        return (
          <div className="relative h-32 w-32 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-40"></div>
            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
          </div>
        );
      case 'line':
        return (
          <div className="h-32 w-32 mx-auto relative">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                points="10,80 25,60 40,65 55,40 70,45 85,30 90,25"
              />
              <circle cx="10" cy="80" r="2" fill="#3B82F6" />
              <circle cx="25" cy="60" r="2" fill="#3B82F6" />
              <circle cx="40" cy="65" r="2" fill="#3B82F6" />
              <circle cx="55" cy="40" r="2" fill="#3B82F6" />
              <circle cx="70" cy="45" r="2" fill="#3B82F6" />
              <circle cx="85" cy="30" r="2" fill="#3B82F6" />
              <circle cx="90" cy="25" r="2" fill="#3B82F6" />
            </svg>
          </div>
        );
      case 'bar':
        return (
          <div className="h-32 w-32 mx-auto flex items-end justify-around space-x-1">
            <div className="w-4 h-16 bg-blue-500 rounded-t"></div>
            <div className="w-4 h-24 bg-green-500 rounded-t"></div>
            <div className="w-4 h-20 bg-yellow-500 rounded-t"></div>
            <div className="w-4 h-28 bg-purple-500 rounded-t"></div>
            <div className="w-4 h-12 bg-red-500 rounded-t"></div>
          </div>
        );
      case 'heatmap':
        return (
          <div className="h-32 w-32 mx-auto grid grid-cols-7 gap-px">
            {Array(49).fill(null).map((_, i) => (
              <div 
                key={i}
                className="bg-blue-500"
                style={{ opacity: Math.random() * 0.8 + 0.2 }}
              ></div>
            ))}
          </div>
        );
      default:
        return (
          <div className="h-32 w-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
            <Eye className="h-8 w-8 text-gray-400" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Metadata Visualization</h2>
          <p className="text-muted-foreground">Visualize achievement metadata with interactive charts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Visualization
          </Button>
        </div>
      </div>

      {/* Visualization Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Eye className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">
              {visualizations.reduce((sum, viz) => sum + viz.views, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Share2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">
              {visualizations.reduce((sum, viz) => sum + viz.shares, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Shares</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Layers className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{visualizations.length}</div>
            <div className="text-sm text-muted-foreground">Visualizations</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Database className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{metadataFields.length}</div>
            <div className="text-sm text-muted-foreground">Metadata Fields</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search visualizations..."
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
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="heatmap">Heatmap</SelectItem>
                      <SelectItem value="network">Network</SelectItem>
                      <SelectItem value="timeline">Timeline</SelectItem>
                    </SelectContent>
                  </Select>
                  
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

          {/* Visualizations Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVisualizations.map((viz) => (
                <Card key={viz.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {getVisualizationIcon(viz.type)}
                        <Badge variant="outline">{viz.type}</Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <h3 className="font-semibold mb-2">{viz.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {viz.description}
                    </p>
                    
                    <div className="mb-4">
                      {renderChartPreview(viz)}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{viz.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Share2 className="h-3 w-3" />
                          <span>{viz.shares}</span>
                        </div>
                      </div>
                      <span>{new Date(viz.updated_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVisualizations.map((viz) => (
                <Card key={viz.id} className="cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getVisualizationIcon(viz.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">{viz.name}</h4>
                            <Badge variant="outline">{viz.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{viz.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                            <span>Views: {viz.views}</span>
                            <span>Shares: {viz.shares}</span>
                            <span>Updated: {new Date(viz.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
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

        <TabsContent value="fields" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {metadataFields.map((field, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    {field.name}
                  </CardTitle>
                  <CardDescription>
                    Type: {field.type}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Distribution */}
                  <div>
                    <h4 className="font-medium mb-2">Distribution</h4>
                    <div className="space-y-2">
                      {field.distribution.map((dist, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm">{dist.value}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{dist.count}</span>
                            <div className="w-20">
                              <Progress value={dist.percentage} className="h-2" />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {dist.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Trends */}
                  <div>
                    <h4 className="font-medium mb-2">Trends</h4>
                    <div className="h-24 relative">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <polyline
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="2"
                          points={field.trends.map((trend, i) => 
                            `${(i * 100 / (field.trends.length - 1))},${100 - (trend.value / Math.max(...field.trends.map(t => t.value)) * 80)}`
                          ).join(' ')}
                        />
                        {field.trends.map((trend, i) => (
                          <circle
                            key={i}
                            cx={(i * 100 / (field.trends.length - 1))}
                            cy={100 - (trend.value / Math.max(...field.trends.map(t => t.value)) * 80)}
                            r="2"
                            fill="#3B82F6"
                          />
                        ))}
                      </svg>
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{template.thumbnail}</div>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {template.config.chartType}
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create New Visualization
              </CardTitle>
              <CardDescription>
                Build a custom metadata visualization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Visualization Name</Label>
                  <Input placeholder="Enter visualization name" />
                </div>
                <div>
                  <Label>Chart Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="heatmap">Heatmap</SelectItem>
                      <SelectItem value="network">Network Graph</SelectItem>
                      <SelectItem value="timeline">Timeline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Describe your visualization"
                />
              </div>
              
              <div>
                <Label>Metadata Field</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field to visualize" />
                  </SelectTrigger>
                  <SelectContent>
                    {metadataFields.map((field, index) => (
                      <SelectItem key={index} value={field.name}>
                        {field.name} ({field.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Color Scheme</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="blues">Blues</SelectItem>
                      <SelectItem value="greens">Greens</SelectItem>
                      <SelectItem value="warm">Warm Colors</SelectItem>
                      <SelectItem value="cool">Cool Colors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Animation</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Animation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Create Visualization
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
