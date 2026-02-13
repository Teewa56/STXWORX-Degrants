import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Download, 
  Copy, 
  Shield,
  Globe,
  Database,
  HardDrive,
  Activity,
  Search,
  Grid,
  List,
  Eye,
  RefreshCw,
  Settings,
  ExternalLink,
  BarChart3,
  Image,
  FileText,
  Folder,
  Video,
  Music,
  Archive,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IPFSFile {
  cid: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  pinned: boolean;
  hash: string;
  url: string;
  gatewayUrl: string;
  metadata?: {
    description?: string;
    tags?: string[];
    attributes?: Record<string, any>;
  };
}

interface IPFSStats {
  totalFiles: number;
  totalSize: number;
  pinnedFiles: number;
  storageUsed: number;
  storageLimit: number;
  bandwidthUsed: number;
  bandwidthLimit: number;
  lastSync: string;
}

interface IPFSNode {
  id: string;
  status: 'online' | 'offline' | 'syncing';
  peers: number;
  repoSize: number;
  version: string;
}

export const IPFSIntegration: React.FC = () => {
  const [files, setFiles] = useState<IPFSFile[]>([]);
  const [stats, setStats] = useState<IPFSStats | null>(null);
  const [nodeInfo, setNodeInfo] = useState<IPFSNode | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<IPFSFile | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('files');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadIPFSData();
  }, []);

  const loadIPFSData = async () => {
    try {
      await Promise.all([
        loadFiles(),
        loadStats(),
        loadNodeInfo()
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load IPFS data",
        variant: "destructive"
      });
    }
  };

  const loadFiles = async () => {
    try {
      const mockFiles: IPFSFile[] = [
        {
          cid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
          name: 'achievement-metadata.json',
          size: 2048,
          type: 'application/json',
          uploadedAt: '2024-01-20T10:30:00Z',
          pinned: true,
          hash: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
          url: 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
          gatewayUrl: 'https://ipfs.io/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
          metadata: {
            description: 'Achievement NFT metadata',
            tags: ['nft', 'achievement', 'metadata'],
            attributes: {
              type: 'achievement',
              rarity: 'legendary'
            }
          }
        },
        {
          cid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH',
          name: 'early-adopter-badge.png',
          size: 524288,
          type: 'image/png',
          uploadedAt: '2024-01-15T14:22:00Z',
          pinned: true,
          hash: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdj',
          url: 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH',
          gatewayUrl: 'https://ipfs.io/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH',
          metadata: {
            description: 'Early adopter achievement badge image',
            tags: ['image', 'badge', 'achievement']
          }
        }
      ];

      setFiles(mockFiles);
    } catch (error) {
      throw error;
    }
  };

  const loadStats = async () => {
    try {
      const mockStats: IPFSStats = {
        totalFiles: 2,
        totalSize: 526336,
        pinnedFiles: 2,
        storageUsed: 526336,
        storageLimit: 10737418240,
        bandwidthUsed: 5242880,
        bandwidthLimit: 107374182400,
        lastSync: '2024-01-20T10:30:00Z'
      };

      setStats(mockStats);
    } catch (error) {
      throw error;
    }
  };

  const loadNodeInfo = async () => {
    try {
      const mockNodeInfo: IPFSNode = {
        id: '12D3KooWExampleNodeID',
        status: 'online',
        peers: 42,
        repoSize: 526336,
        version: '0.28.0'
      };

      setNodeInfo(mockNodeInfo);
    } catch (error) {
      throw error;
    }
  };

  const uploadToIPFS = async (file: File, metadata?: any) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const newFile: IPFSFile = {
        cid: 'QmNewUpload' + Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        pinned: false,
        hash: 'bafybeinewuploadhash',
        url: `ipfs://QmNewUpload${Date.now()}`,
        gatewayUrl: `https://ipfs.io/ipfs/QmNewUpload${Date.now()}`,
        metadata
      };

      setFiles(prev => [newFile, ...prev]);
      
      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded to IPFS`
      });
      
      setIsUploadDialogOpen(false);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload file to IPFS",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "CID copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />;
    if (type.includes('json')) return <FileText className="h-4 w-4" />;
    if (type.includes('zip') || type.includes('tar')) return <Archive className="h-4 w-4" />;
    return <Folder className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.cid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || file.type.startsWith(filterType);
    return matchesSearch && matchesType;
  });

  if (!stats || !nodeInfo) {
    return <div>Loading IPFS integration...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">IPFS Integration</h2>
          <p className="text-muted-foreground">Decentralized storage for NFT assets and metadata</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={nodeInfo.status === 'online' ? 'default' : 'destructive'}>
            <Activity className="h-3 w-3 mr-1" />
            {nodeInfo.status}
          </Badge>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Database className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
            <div className="text-sm text-muted-foreground">Total Files</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <HardDrive className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{formatFileSize(stats.storageUsed)}</div>
            <div className="text-sm text-muted-foreground">Storage Used</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{stats.pinnedFiles}</div>
            <div className="text-sm text-muted-foreground">Pinned Files</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{nodeInfo.peers}</div>
            <div className="text-sm text-muted-foreground">Connected Peers</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="node">Node Info</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Storage Used</span>
                  <span>{formatFileSize(stats.storageUsed)} / {formatFileSize(stats.storageLimit)}</span>
                </div>
                <Progress value={(stats.storageUsed / stats.storageLimit) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files by name or CID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <div className="flex gap-2">
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="all">All Types</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="audio">Audio</option>
                    <option value="application">Documents</option>
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

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <Card key={file.cid} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex items-center space-x-1">
                        {file.pinned && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold mb-1 truncate">{file.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2 truncate">
                      {file.cid}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(file.cid)}
                        className="flex-1"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(file);
                          setIsDetailDialogOpen(true);
                        }}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFiles.map((file) => (
                <Card key={file.cid}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getFileIcon(file.type)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">{file.name}</h4>
                            {file.pinned && (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Pinned
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            {file.cid}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{formatFileSize(file.size)}</span>
                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                            <span>{file.type}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(file.cid)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(file);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="node" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Node Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={nodeInfo.status === 'online' ? 'default' : 'destructive'}>
                    {nodeInfo.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Node ID</span>
                  <span className="font-mono text-sm">{nodeInfo.id.slice(0, 20)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span>{nodeInfo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connected Peers</span>
                  <span>{nodeInfo.peers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Repository Size</span>
                  <span>{formatFileSize(nodeInfo.repoSize)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Network Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bandwidth Used</span>
                  <span>{formatFileSize(stats.bandwidthUsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bandwidth Limit</span>
                  <span>{formatFileSize(stats.bandwidthLimit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Sync</span>
                  <span>{new Date(stats.lastSync).toLocaleString()}</span>
                </div>
                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Node
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                IPFS Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Gateway URL</Label>
                <Input defaultValue="https://ipfs.io/ipfs/" />
              </div>
              <div>
                <Label>API Endpoint</Label>
                <Input defaultValue="/ip4/127.0.0.1/tcp/5001" />
              </div>
              <div>
                <Label>Auto-pin Files</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-md">
                  <option>Enabled</option>
                  <option>Disabled</option>
                </select>
              </div>
              <div>
                <Label>Replication Factor</Label>
                <Input type="number" defaultValue="3" />
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload to IPFS</DialogTitle>
            <DialogDescription>
              Upload files to decentralized IPFS storage
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select File</Label>
              <input
                type="file"
                onChange={(e) => e.target.files?.[0] && uploadToIPFS(e.target.files[0])}
                className="w-full mt-1"
                disabled={isUploading}
              />
            </div>
            
            {isUploading && (
              <div>
                <Label>Upload Progress</Label>
                <Progress value={uploadProgress} className="mt-2" />
                <div className="text-sm text-muted-foreground mt-1">
                  {uploadProgress}% complete
                </div>
              </div>
            )}
            
            <div>
              <Label>Metadata (optional)</Label>
              <Textarea
                placeholder="Add metadata in JSON format"
                className="mt-1"
                rows={4}
                defaultValue='{"description": "", "tags": []}'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>File Details</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>File Name</Label>
                  <div className="font-medium">{selectedFile.name}</div>
                </div>
                <div>
                  <Label>File Size</Label>
                  <div className="font-medium">{formatFileSize(selectedFile.size)}</div>
                </div>
                <div>
                  <Label>Content Type</Label>
                  <div className="font-medium">{selectedFile.type}</div>
                </div>
                <div>
                  <Label>Uploaded</Label>
                  <div className="font-medium">{new Date(selectedFile.uploadedAt).toLocaleString()}</div>
                </div>
              </div>
              
              <div>
                <Label>CID</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input value={selectedFile.cid} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedFile.cid)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>IPFS URL</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input value={selectedFile.url} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedFile.url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Gateway URL</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input value={selectedFile.gatewayUrl} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={selectedFile.gatewayUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
              
              {selectedFile.metadata && (
                <div>
                  <Label>Metadata</Label>
                  <pre className="mt-1 p-3 bg-gray-50 rounded text-sm overflow-auto">
                    {JSON.stringify(selectedFile.metadata, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
