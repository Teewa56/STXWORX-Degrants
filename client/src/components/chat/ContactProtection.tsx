import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  Unlock, 
  UserPlus, 
  UserX, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Ban,
  Clock,
  MessageSquare,
  Filter,
  Search,
  MoreVertical
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status: 'active' | 'blocked' | 'restricted';
  trustLevel: 'low' | 'medium' | 'high';
  isVerified: boolean;
  lastInteraction: string;
  messageCount: number;
  restrictions: {
    canMessage: boolean;
    canCall: boolean;
    canShareFiles: boolean;
    canSeeOnline: boolean;
  };
}

interface ProtectionSettings {
  requireVerification: boolean;
  blockUnverified: boolean;
  messageFiltering: boolean;
  autoBlockSpam: boolean;
  shareOnlineStatus: boolean;
  allowFileSharing: boolean;
  messageRetention: '7days' | '30days' | '90days' | 'forever';
}

export const ContactProtection: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [settings, setSettings] = useState<ProtectionSettings>({
    requireVerification: true,
    blockUnverified: false,
    messageFiltering: true,
    autoBlockSpam: true,
    shareOnlineStatus: true,
    allowFileSharing: true,
    messageRetention: '30days'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blocked' | 'restricted'>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load contacts and settings from API
    loadContacts();
    loadSettings();
  }, []);

  const loadContacts = async () => {
    try {
      // Mock data - replace with actual API call
      const mockContacts: Contact[] = [
        {
          id: '1',
          name: 'John Developer',
          status: 'active',
          trustLevel: 'high',
          isVerified: true,
          lastInteraction: '2024-01-15T10:30:00Z',
          messageCount: 245,
          restrictions: {
            canMessage: true,
            canCall: true,
            canShareFiles: true,
            canSeeOnline: true
          }
        },
        {
          id: '2',
          name: 'Unknown User',
          status: 'restricted',
          trustLevel: 'low',
          isVerified: false,
          lastInteraction: '2024-01-10T15:45:00Z',
          messageCount: 12,
          restrictions: {
            canMessage: true,
            canCall: false,
            canShareFiles: false,
            canSeeOnline: false
          }
        }
      ];
      setContacts(mockContacts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive"
      });
    }
  };

  const loadSettings = async () => {
    try {
      // Mock settings - replace with actual API call
      setSettings(settings);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      });
    }
  };

  const handleBlockContact = async (contactId: string) => {
    try {
      setContacts(prev => prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, status: 'blocked' as const }
          : contact
      ));
      
      toast({
        title: "Contact Blocked",
        description: "The contact has been blocked successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to block contact",
        variant: "destructive"
      });
    }
  };

  const handleUnblockContact = async (contactId: string) => {
    try {
      setContacts(prev => prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, status: 'active' as const }
          : contact
      ));
      
      toast({
        title: "Contact Unblocked",
        description: "The contact has been unblocked successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unblock contact",
        variant: "destructive"
      });
    }
  };

  const handleUpdateContactRestrictions = async (contactId: string, restrictions: Contact['restrictions']) => {
    try {
      setContacts(prev => prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, restrictions }
          : contact
      ));
      
      toast({
        title: "Restrictions Updated",
        description: "Contact restrictions have been updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update restrictions",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<ProtectionSettings>) => {
    try {
      setSettings(prev => ({ ...prev, ...newSettings }));
      
      toast({
        title: "Settings Updated",
        description: "Protection settings have been updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || contact.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getTrustLevelColor = (level: Contact['trustLevel']) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'restricted': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contact Protection</h2>
          <p className="text-muted-foreground">Manage your privacy and security settings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <Badge variant="outline">Protected</Badge>
        </div>
      </div>

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="settings">Protection Settings</TabsTrigger>
          <TabsTrigger value="blocked">Blocked Users</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Management</CardTitle>
              <CardDescription>
                Manage individual contact permissions and restrictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contacts</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredContacts.map((contact) => (
                  <Card key={contact.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{contact.name}</h3>
                            {contact.isVerified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <Badge className={getTrustLevelColor(contact.trustLevel)}>
                              {contact.trustLevel} trust
                            </Badge>
                            <Badge className={getStatusColor(contact.status)}>
                              {contact.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{contact.messageCount} messages</span>
                            <span>Last: {new Date(contact.lastInteraction).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedContact(contact);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        {contact.status === 'blocked' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnblockContact(contact.id)}
                          >
                            <Unlock className="h-4 w-4 mr-2" />
                            Unblock
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleBlockContact(contact.id)}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Block
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Protection Settings</CardTitle>
              <CardDescription>
                Configure your privacy and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Require Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Only allow verified users to contact you
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireVerification}
                    onCheckedChange={(checked) => 
                      handleUpdateSettings({ requireVerification: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Block Unverified Users</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically block messages from unverified users
                    </p>
                  </div>
                  <Switch
                    checked={settings.blockUnverified}
                    onCheckedChange={(checked) => 
                      handleUpdateSettings({ blockUnverified: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Message Filtering</Label>
                    <p className="text-sm text-muted-foreground">
                      Filter potentially harmful or inappropriate content
                    </p>
                  </div>
                  <Switch
                    checked={settings.messageFiltering}
                    onCheckedChange={(checked) => 
                      handleUpdateSettings({ messageFiltering: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto-Block Spam</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically block users who send spam messages
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoBlockSpam}
                    onCheckedChange={(checked) => 
                      handleUpdateSettings({ autoBlockSpam: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Share Online Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Let contacts see when you're online
                    </p>
                  </div>
                  <Switch
                    checked={settings.shareOnlineStatus}
                    onCheckedChange={(checked) => 
                      handleUpdateSettings({ shareOnlineStatus: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Allow File Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow contacts to share files with you
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowFileSharing}
                    onCheckedChange={(checked) => 
                      handleUpdateSettings({ allowFileSharing: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message Retention</Label>
                  <Select 
                    value={settings.messageRetention} 
                    onValueChange={(value: any) => 
                      handleUpdateSettings({ messageRetention: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">7 Days</SelectItem>
                      <SelectItem value="30days">30 Days</SelectItem>
                      <SelectItem value="90days">90 Days</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blocked Users</CardTitle>
              <CardDescription>
                Manage users you have blocked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contacts.filter(contact => contact.status === 'blocked').map((contact) => (
                  <Card key={contact.id} className="p-4 border-red-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Ban className="h-5 w-5 text-red-500" />
                        <div>
                          <h3 className="font-medium">{contact.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Blocked on {new Date(contact.lastInteraction).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleUnblockContact(contact.id)}
                      >
                        <Unlock className="h-4 w-4 mr-2" />
                        Unblock
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact Restrictions</DialogTitle>
            <DialogDescription>
              Manage what this contact can do
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Can Message</Label>
                <Switch
                  checked={selectedContact.restrictions.canMessage}
                  onCheckedChange={(checked) => 
                    setSelectedContact({
                      ...selectedContact,
                      restrictions: { ...selectedContact.restrictions, canMessage: checked }
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Can Call</Label>
                <Switch
                  checked={selectedContact.restrictions.canCall}
                  onCheckedChange={(checked) => 
                    setSelectedContact({
                      ...selectedContact,
                      restrictions: { ...selectedContact.restrictions, canCall: checked }
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Can Share Files</Label>
                <Switch
                  checked={selectedContact.restrictions.canShareFiles}
                  onCheckedChange={(checked) => 
                    setSelectedContact({
                      ...selectedContact,
                      restrictions: { ...selectedContact.restrictions, canShareFiles: checked }
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Can See Online Status</Label>
                <Switch
                  checked={selectedContact.restrictions.canSeeOnline}
                  onCheckedChange={(checked) => 
                    setSelectedContact({
                      ...selectedContact,
                      restrictions: { ...selectedContact.restrictions, canSeeOnline: checked }
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (selectedContact) {
                handleUpdateContactRestrictions(selectedContact.id, selectedContact.restrictions);
                setIsEditDialogOpen(false);
              }
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};