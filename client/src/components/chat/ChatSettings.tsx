import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Settings, 
  Bell, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  MessageSquare, 
  Users, 
  Shield, 
  Palette, 
  Download, 
  Upload, 
  Trash2, 
  Save,
  RefreshCw,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Smartphone,
  Globe,
  Lock,
  Unlock,
  Clock,
  Calendar,
  Hash,
  Star,
  Archive,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatSettings {
  // Notifications
  enableNotifications: boolean;
  soundEnabled: boolean;
  messagePreview: boolean;
  desktopNotifications: boolean;
  emailNotifications: boolean;
  
  // Privacy
  readReceipts: boolean;
  typingIndicators: boolean;
  onlineStatus: boolean;
  lastSeen: boolean;
  profilePhoto: boolean;
  
  // Appearance
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  messageStyle: 'bubble' | 'compact' | 'modern';
  showTimestamps: boolean;
  showAvatars: boolean;
  
  // Chat Behavior
  enterToSend: boolean;
  autoSave: boolean;
  messageHistory: '7days' | '30days' | '90days' | 'forever';
  autoDelete: boolean;
  
  // Media
  autoDownloadImages: boolean;
  autoDownloadFiles: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  
  // Calls
  autoAnswerCalls: boolean;
  videoQuality: 'low' | 'medium' | 'high';
  audioQuality: 'low' | 'medium' | 'high';
  
  // Advanced
  encryptionEnabled: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: number;
  apiEndpoint: string;
}

export const ChatSettings: React.FC = () => {
  const [settings, setSettings] = useState<ChatSettings>({
    // Notifications
    enableNotifications: true,
    soundEnabled: true,
    messagePreview: true,
    desktopNotifications: true,
    emailNotifications: false,
    
    // Privacy
    readReceipts: true,
    typingIndicators: true,
    onlineStatus: true,
    lastSeen: true,
    profilePhoto: true,
    
    // Appearance
    theme: 'system',
    fontSize: 'medium',
    messageStyle: 'bubble',
    showTimestamps: true,
    showAvatars: true,
    
    // Chat Behavior
    enterToSend: true,
    autoSave: true,
    messageHistory: '30days',
    autoDelete: false,
    
    // Media
    autoDownloadImages: false,
    autoDownloadFiles: false,
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    
    // Calls
    autoAnswerCalls: false,
    videoQuality: 'medium',
    audioQuality: 'medium',
    
    // Advanced
    encryptionEnabled: true,
    twoFactorAuth: false,
    sessionTimeout: 30,
    apiEndpoint: 'https://api.stxworx.com'
  });

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load settings from API or localStorage
      const savedSettings = localStorage.getItem('chatSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      });
    }
  };

  const saveSettings = async () => {
    try {
      localStorage.setItem('chatSettings', JSON.stringify(settings));
      toast({
        title: "Settings Saved",
        description: "Your chat settings have been updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    }
  };

  const resetSettings = () => {
    const defaultSettings: ChatSettings = {
      enableNotifications: true,
      soundEnabled: true,
      messagePreview: true,
      desktopNotifications: true,
      emailNotifications: false,
      readReceipts: true,
      typingIndicators: true,
      onlineStatus: true,
      lastSeen: true,
      profilePhoto: true,
      theme: 'system',
      fontSize: 'medium',
      messageStyle: 'bubble',
      showTimestamps: true,
      showAvatars: true,
      enterToSend: true,
      autoSave: true,
      messageHistory: '30days',
      autoDelete: false,
      autoDownloadImages: false,
      autoDownloadFiles: false,
      maxFileSize: 10,
      allowedFileTypes: ['jpg', 'png', 'gif', 'pdf', 'doc', 'docx'],
      autoAnswerCalls: false,
      videoQuality: 'medium',
      audioQuality: 'medium',
      encryptionEnabled: true,
      twoFactorAuth: false,
      sessionTimeout: 30,
      apiEndpoint: 'https://api.stxworx.com'
    };
    setSettings(defaultSettings);
    setIsResetDialogOpen(false);
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default"
    });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'chat-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setIsExportDialogOpen(false);
    toast({
      title: "Settings Exported",
      description: "Your settings have been exported"
    });
  };

  const updateSetting = <K extends keyof ChatSettings>(key: K, value: ChatSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chat Settings</h2>
          <p className="text-muted-foreground">Customize your chat experience</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={saveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Turn all notifications on or off
                  </p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for incoming messages
                  </p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Message Preview</Label>
                  <p className="text-sm text-muted-foreground">
                    Show message content in notifications
                  </p>
                </div>
                <Switch
                  checked={settings.messagePreview}
                  onCheckedChange={(checked) => updateSetting('messagePreview', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Desktop Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show desktop notifications when app is in background
                  </p>
                </div>
                <Switch
                  checked={settings.desktopNotifications}
                  onCheckedChange={(checked) => updateSetting('desktopNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email summaries of missed messages
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control your privacy and what others can see
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Read Receipts</Label>
                  <p className="text-sm text-muted-foreground">
                    Let others know when you've read their messages
                  </p>
                </div>
                <Switch
                  checked={settings.readReceipts}
                  onCheckedChange={(checked) => updateSetting('readReceipts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Typing Indicators</Label>
                  <p className="text-sm text-muted-foreground">
                    Show when you're typing a message
                  </p>
                </div>
                <Switch
                  checked={settings.typingIndicators}
                  onCheckedChange={(checked) => updateSetting('typingIndicators', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Online Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Let others see when you're online
                  </p>
                </div>
                <Switch
                  checked={settings.onlineStatus}
                  onCheckedChange={(checked) => updateSetting('onlineStatus', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Last Seen</Label>
                  <p className="text-sm text-muted-foreground">
                    Show when you were last active
                  </p>
                </div>
                <Switch
                  checked={settings.lastSeen}
                  onCheckedChange={(checked) => updateSetting('lastSeen', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Profile Photo</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your profile picture
                  </p>
                </div>
                <Switch
                  checked={settings.profilePhoto}
                  onCheckedChange={(checked) => updateSetting('profilePhoto', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your chat interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(value: any) => updateSetting('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Font Size</Label>
                <Select 
                  value={settings.fontSize} 
                  onValueChange={(value: any) => updateSetting('fontSize', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Message Style</Label>
                <Select 
                  value={settings.messageStyle} 
                  onValueChange={(value: any) => updateSetting('messageStyle', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bubble">Bubble</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Timestamps</Label>
                  <p className="text-sm text-muted-foreground">
                    Display timestamps on messages
                  </p>
                </div>
                <Switch
                  checked={settings.showTimestamps}
                  onCheckedChange={(checked) => updateSetting('showTimestamps', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Show Avatars</Label>
                  <p className="text-sm text-muted-foreground">
                    Display user profile pictures
                  </p>
                </div>
                <Switch
                  checked={settings.showAvatars}
                  onCheckedChange={(checked) => updateSetting('showAvatars', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Chat Behavior
              </CardTitle>
              <CardDescription>
                Configure how chats work and behave
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enter to Send</Label>
                  <p className="text-sm text-muted-foreground">
                    Press Enter to send messages (Ctrl+Enter for new line)
                  </p>
                </div>
                <Switch
                  checked={settings.enterToSend}
                  onCheckedChange={(checked) => updateSetting('enterToSend', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-Save Drafts</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save unsent messages
                  </p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Message History</Label>
                <Select 
                  value={settings.messageHistory} 
                  onValueChange={(value: any) => updateSetting('messageHistory', value)}
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

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-Delete Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically delete messages after retention period
                  </p>
                </div>
                <Switch
                  checked={settings.autoDelete}
                  onCheckedChange={(checked) => updateSetting('autoDelete', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Media & Files
              </CardTitle>
              <CardDescription>
                Configure media and file handling settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-Download Images</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically download received images
                  </p>
                </div>
                <Switch
                  checked={settings.autoDownloadImages}
                  onCheckedChange={(checked) => updateSetting('autoDownloadImages', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-Download Files</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically download received files
                  </p>
                </div>
                <Switch
                  checked={settings.autoDownloadFiles}
                  onCheckedChange={(checked) => updateSetting('autoDownloadFiles', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Maximum File Size (MB)</Label>
                <div className="px-3">
                  <Slider
                    value={[settings.maxFileSize]}
                    onValueChange={([value]) => updateSetting('maxFileSize', value)}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>1MB</span>
                    <span>{settings.maxFileSize}MB</span>
                    <span>100MB</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                Advanced configuration and security options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>End-to-End Encryption</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable end-to-end encryption for all messages
                  </p>
                </div>
                <Switch
                  checked={settings.encryptionEnabled}
                  onCheckedChange={(checked) => updateSetting('encryptionEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for account access
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <div className="px-3">
                  <Slider
                    value={[settings.sessionTimeout]}
                    onValueChange={([value]) => updateSetting('sessionTimeout', value)}
                    max={120}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>5min</span>
                    <span>{settings.sessionTimeout}min</span>
                    <span>120min</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>API Endpoint</Label>
                <Input
                  value={settings.apiEndpoint}
                  onChange={(e) => updateSetting('apiEndpoint', e.target.value)}
                  placeholder="https://api.stxworx.com"
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Settings
                </Button>
                <Button variant="outline" onClick={() => setIsResetDialogOpen(true)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Settings</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset all settings to their default values? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={resetSettings}>
              Reset All Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Settings</DialogTitle>
            <DialogDescription>
              Export your current settings to a JSON file that you can import later or share.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={exportSettings}>
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
