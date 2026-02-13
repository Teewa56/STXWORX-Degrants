import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Shield, 
  Database, 
  Globe, 
  Mail, 
  Bell, 
  Users, 
  Lock, 
  Key, 
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  Server,
  Wifi,
  HardDrive,
  Activity,
  Zap,
  Clock,
  DollarSign,
  FileText,
  Download,
  Upload,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  Minus,
  Edit,
  ExternalLink,
  HelpCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface SystemSettings {
  general: {
    platformName: string;
    platformVersion: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
    supportEmail: string;
    timezone: string;
    dateFormat: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireMFA: boolean;
    mfaTimeout: number;
    ipWhitelist: string[];
    rateLimitEnabled: boolean;
    rateLimitWindow: number;
    rateLimitMaxRequests: number;
  };
  database: {
    maxConnections: number;
    connectionTimeout: number;
    queryTimeout: number;
    backupEnabled: boolean;
    backupFrequency: string;
    backupRetention: number;
    autoVacuum: boolean;
    vacuumFrequency: string;
  };
  notifications: {
    emailEnabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpFrom: string;
    pushNotifications: boolean;
    webhookUrl: string;
    webhookSecret: string;
  };
  blockchain: {
    network: 'mainnet' | 'testnet';
    nodeUrl: string;
    confirmationBlocks: number;
    maxFeeRate: number;
    defaultFeeRate: number;
    multisigThreshold: number;
    multisigTimelock: number;
  };
  features: {
    chatEnabled: boolean;
    xIntegrationEnabled: boolean;
    nftAchievementsEnabled: boolean;
    leaderboardEnabled: boolean;
    socialSharingEnabled: boolean;
    autoNftMinting: boolean;
    publicProfiles: boolean;
  };
}

interface SystemSettingsProps {
  className?: string;
}

export function SystemSettings({ className }: SystemSettingsProps) {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      platformName: 'STXWORX Degrants',
      platformVersion: '2.0.0',
      maintenanceMode: false,
      maintenanceMessage: 'Platform is under maintenance. Please check back later.',
      supportEmail: 'support@stxworx.com',
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD'
    },
    security: {
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireMFA: true,
      mfaTimeout: 300,
      ipWhitelist: [],
      rateLimitEnabled: true,
      rateLimitWindow: 900,
      rateLimitMaxRequests: 100
    },
    database: {
      maxConnections: 100,
      connectionTimeout: 30,
      queryTimeout: 60,
      backupEnabled: true,
      backupFrequency: 'daily',
      backupRetention: 30,
      autoVacuum: true,
      vacuumFrequency: 'weekly'
    },
    notifications: {
      emailEnabled: true,
      smtpHost: 'smtp.postmarkapp.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      smtpFrom: 'noreply@stxworx.com',
      pushNotifications: true,
      webhookUrl: '',
      webhookSecret: ''
    },
    blockchain: {
      network: 'testnet',
      nodeUrl: 'https://api.testnet.hiro.so',
      confirmationBlocks: 6,
      maxFeeRate: 1000,
      defaultFeeRate: 500,
      multisigThreshold: 3,
      multisigTimelock: 86400
    },
    features: {
      chatEnabled: true,
      xIntegrationEnabled: true,
      nftAchievementsEnabled: true,
      leaderboardEnabled: true,
      socialSharingEnabled: true,
      autoNftMinting: false,
      publicProfiles: true
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  
  const { toast } = useToast();

  const handleSettingChange = (category: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual API call
      console.log('Saving system settings:', settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setHasChanges(false);
      
      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save system settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = async () => {
    try {
      // TODO: Implement actual API call
      console.log('Resetting system settings to defaults');
      
      // Reset to default values
      setSettings({
        general: {
          platformName: 'STXWORX Degrants',
          platformVersion: '2.0.0',
          maintenanceMode: false,
          maintenanceMessage: 'Platform is under maintenance. Please check back later.',
          supportEmail: 'support@stxworx.com',
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD'
        },
        security: {
          sessionTimeout: 24,
          maxLoginAttempts: 5,
          passwordMinLength: 8,
          requireMFA: true,
          mfaTimeout: 300,
          ipWhitelist: [],
          rateLimitEnabled: true,
          rateLimitWindow: 900,
          rateLimitMaxRequests: 100
        },
        database: {
          maxConnections: 100,
          connectionTimeout: 30,
          queryTimeout: 60,
          backupEnabled: true,
          backupFrequency: 'daily',
          backupRetention: 30,
          autoVacuum: true,
          vacuumFrequency: 'weekly'
        },
        notifications: {
          emailEnabled: true,
          smtpHost: 'smtp.postmarkapp.com',
          smtpPort: 587,
          smtpUser: '',
          smtpPassword: '',
          smtpFrom: 'noreply@stxworx.com',
          pushNotifications: true,
          webhookUrl: '',
          webhookSecret: ''
        },
        blockchain: {
          network: 'testnet',
          nodeUrl: 'https://api.testnet.hiro.so',
          confirmationBlocks: 6,
          maxFeeRate: 1000,
          defaultFeeRate: 500,
          multisigThreshold: 3,
          multisigTimelock: 86400
        },
        features: {
          chatEnabled: true,
          xIntegrationEnabled: true,
          nftAchievementsEnabled: true,
          leaderboardEnabled: true,
          socialSharingEnabled: true,
          autoNftMinting: false,
          publicProfiles: true
        }
      });
      
      setHasChanges(false);
      
      toast({
        title: "Settings Reset",
        description: "System settings have been reset to defaults",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset system settings",
        variant: "destructive",
      });
    }
  };

  const handleExportSettings = async () => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'system-settings.json';
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Settings Exported",
        description: "System settings have been exported",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export system settings",
        variant: "destructive",
      });
    }
  };

  const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const importedSettings = JSON.parse(text);
      
      setSettings(importedSettings);
      setHasChanges(true);
      
      toast({
        title: "Settings Imported",
        description: "System settings have been imported",
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import system settings",
        variant: "destructive",
      });
    }
  };

  const handleAddIpWhitelist = () => {
    const newIp = prompt('Enter IP address to whitelist:');
    if (newIp) {
      handleSettingChange('security', 'ipWhitelist', [...settings.security.ipWhitelist, newIp]);
    }
  };

  const handleRemoveIpWhitelist = (ip: string) => {
    handleSettingChange('security', 'ipWhitelist', settings.security.ipWhitelist.filter(i => i !== ip));
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-600" />
                System Settings
              </CardTitle>
              <CardDescription>
                Configure platform-wide system settings and preferences
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExportSettings}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetSettings}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={!hasChanges || isLoading}
                size="sm"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {hasChanges && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You have unsaved changes. Click "Save" to apply your settings.
                </AlertDescription>
              </Alert>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="database">Database</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="platformName">Platform Name</Label>
                      <Input
                        id="platformName"
                        value={settings.general.platformName}
                        onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="platformVersion">Platform Version</Label>
                      <Input
                        id="platformVersion"
                        value={settings.general.platformVersion}
                        onChange={(e) => handleSettingChange('general', 'platformVersion', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={settings.general.supportEmail}
                        onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select 
                        value={settings.general.timezone} 
                        onValueChange={(value) => handleSettingChange('general', 'timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="EST">EST</SelectItem>
                          <SelectItem value="PST">PST</SelectItem>
                          <SelectItem value="CET">CET</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select 
                        value={settings.general.dateFormat} 
                        onValueChange={(value) => handleSettingChange('general', 'dateFormat', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                        <p className="text-sm text-gray-500">
                          Enable to temporarily disable platform access
                        </p>
                      </div>
                      <Switch
                        id="maintenanceMode"
                        checked={settings.general.maintenanceMode}
                        onCheckedChange={(checked) => handleSettingChange('general', 'maintenanceMode', checked)}
                      />
                    </div>
                    
                    {settings.general.maintenanceMode && (
                      <div>
                        <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                        <Textarea
                          id="maintenanceMessage"
                          value={settings.general.maintenanceMessage}
                          onChange={(e) => handleSettingChange('general', 'maintenanceMessage', e.target.value)}
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="passwordMinLength">Password Min Length</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="mfaTimeout">MFA Timeout (seconds)</Label>
                      <Input
                        id="mfaTimeout"
                        type="number"
                        value={settings.security.mfaTimeout}
                        onChange={(e) => handleSettingChange('security', 'mfaTimeout', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="requireMFA">Require MFA</Label>
                        <p className="text-sm text-gray-500">
                          Force multi-factor authentication for all users
                        </p>
                      </div>
                      <Switch
                        id="requireMFA"
                        checked={settings.security.requireMFA}
                        onCheckedChange={(checked) => handleSettingChange('security', 'requireMFA', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="rateLimitEnabled">Rate Limiting</Label>
                        <p className="text-sm text-gray-500">
                          Enable API rate limiting
                        </p>
                      </div>
                      <Switch
                        id="rateLimitEnabled"
                        checked={settings.security.rateLimitEnabled}
                        onCheckedChange={(checked) => handleSettingChange('security', 'rateLimitEnabled', checked)}
                      />
                    </div>
                    
                    {settings.security.rateLimitEnabled && (
                      <>
                        <div>
                          <Label htmlFor="rateLimitWindow">Rate Limit Window (ms)</Label>
                          <Input
                            id="rateLimitWindow"
                            type="number"
                            value={settings.security.rateLimitWindow}
                            onChange={(e) => handleSettingChange('security', 'rateLimitWindow', parseInt(e.target.value))}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="rateLimitMaxRequests">Max Requests</Label>
                          <Input
                            id="rateLimitMaxRequests"
                            type="number"
                            value={settings.security.rateLimitMaxRequests}
                            onChange={(e) => handleSettingChange('security', 'rateLimitMaxRequests', parseInt(e.target.value))}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>IP Whitelist</Label>
                    <p className="text-sm text-gray-500">
                      Restrict admin access to specific IP addresses
                    </p>
                    <div className="space-y-2">
                      {settings.security.ipWhitelist.map((ip, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-mono text-sm">{ip}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveIpWhitelist(ip)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddIpWhitelist}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add IP
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="database" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="maxConnections">Max Connections</Label>
                      <Input
                        id="maxConnections"
                        type="number"
                        value={settings.database.maxConnections}
                        onChange={(e) => handleSettingChange('database', 'maxConnections', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="connectionTimeout">Connection Timeout (seconds)</Label>
                      <Input
                        id="connectionTimeout"
                        type="number"
                        value={settings.database.connectionTimeout}
                        onChange={(e) => handleSettingChange('database', 'connectionTimeout', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="queryTimeout">Query Timeout (seconds)</Label>
                      <Input
                        id="queryTimeout"
                        type="number"
                        value={settings.database.queryTimeout}
                        onChange={(e) => handleSettingChange('database', 'queryTimeout', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="backupEnabled">Automatic Backups</Label>
                        <p className="text-sm text-gray-500">
                          Enable automatic database backups
                        </p>
                      </div>
                      <Switch
                        id="backupEnabled"
                        checked={settings.database.backupEnabled}
                        onCheckedChange={(checked) => handleSettingChange('database', 'backupEnabled', checked)}
                      />
                    </div>
                    
                    {settings.database.backupEnabled && (
                      <>
                        <div>
                          <Label htmlFor="backupFrequency">Backup Frequency</Label>
                          <Select 
                            value={settings.database.backupFrequency} 
                            onValueChange={(value) => handleSettingChange('database', 'backupFrequency', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="backupRetention">Backup Retention (days)</Label>
                          <Input
                            id="backupRetention"
                            type="number"
                            value={settings.database.backupRetention}
                            onChange={(e) => handleSettingChange('database', 'backupRetention', parseInt(e.target.value))}
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoVacuum">Auto Vacuum</Label>
                        <p className="text-sm text-gray-500">
                          Enable automatic database vacuuming
                        </p>
                      </div>
                      <Switch
                        id="autoVacuum"
                        checked={settings.database.autoVacuum}
                        onCheckedChange={(checked) => handleSettingChange('database', 'autoVacuum', checked)}
                      />
                    </div>
                    
                    {settings.database.autoVacuum && (
                      <div>
                        <Label htmlFor="vacuumFrequency">Vacuum Frequency</Label>
                        <Select 
                          value={settings.database.vacuumFrequency} 
                          onValueChange={(value) => handleSettingChange('database', 'vacuumFrequency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="notifications" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailEnabled">Email Notifications</Label>
                        <p className="text-sm text-gray-500">
                          Enable email notifications
                        </p>
                      </div>
                      <Switch
                        id="emailEnabled"
                        checked={settings.notifications.emailEnabled}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'emailEnabled', checked)}
                      />
                    </div>
                    
                    {settings.notifications.emailEnabled && (
                      <>
                        <div>
                          <Label htmlFor="smtpHost">SMTP Host</Label>
                          <Input
                            id="smtpHost"
                            value={settings.notifications.smtpHost}
                            onChange={(e) => handleSettingChange('notifications', 'smtpHost', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="smtpPort">SMTP Port</Label>
                          <Input
                            id="smtpPort"
                            type="number"
                            value={settings.notifications.smtpPort}
                            onChange={(e) => handleSettingChange('notifications', 'smtpPort', parseInt(e.target.value))}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="smtpUser">SMTP User</Label>
                          <Input
                            id="smtpUser"
                            value={settings.notifications.smtpUser}
                            onChange={(e) => handleSettingChange('notifications', 'smtpUser', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="smtpPassword">SMTP Password</Label>
                          <div className="relative">
                            <Input
                              id="smtpPassword"
                              type={showSmtpPassword ? 'text' : 'password'}
                              value={settings.notifications.smtpPassword}
                              onChange={(e) => handleSettingChange('notifications', 'smtpPassword', e.target.value)}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-100"
                              onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                            >
                              {showSmtpPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="smtpFrom">From Email</Label>
                          <Input
                            id="smtpFrom"
                            type="email"
                            value={settings.notifications.smtpFrom}
                            onChange={(e) => handleSettingChange('notifications', 'smtpFrom', e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pushNotifications">Push Notifications</Label>
                        <p className="text-sm text-gray-500">
                          Enable push notifications
                        </p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={settings.notifications.pushNotifications}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'pushNotifications', checked)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="webhookUrl">Webhook URL</Label>
                      <Input
                        id="webhookUrl"
                        value={settings.notifications.webhookUrl}
                        onChange={(e) => handleSettingChange('notifications', 'webhookUrl', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="webhookSecret">Webhook Secret</Label>
                      <div className="relative">
                        <Input
                          id="webhookSecret"
                          type={showWebhookSecret ? 'text' : 'password'}
                          value={settings.notifications.webhookSecret}
                          onChange={(e) => handleSettingChange('notifications', 'webhookSecret', e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-100"
                          onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                        >
                          {showWebhookSecret ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="blockchain" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="network">Network</Label>
                      <Select 
                        value={settings.blockchain.network} 
                        onValueChange={(value: 'mainnet' | 'testnet') => handleSettingChange('blockchain', 'network', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="testnet">Testnet</SelectItem>
                          <SelectItem value="mainnet">Mainnet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="nodeUrl">Node URL</Label>
                      <Input
                        id="nodeUrl"
                        value={settings.blockchain.nodeUrl}
                        onChange={(e) => handleSettingChange('blockchain', 'nodeUrl', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmationBlocks">Confirmation Blocks</Label>
                      <Input
                        id="confirmationBlocks"
                        type="number"
                        value={settings.blockchain.confirmationBlocks}
                        onChange={(e) => handleSettingChange('blockchain', 'confirmationBlocks', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="maxFeeRate">Max Fee Rate</Label>
                      <Input
                        id="maxFeeRate"
                        type="number"
                        value={settings.blockchain.maxFeeRate}
                        onChange={(e) => handleSettingChange('blockchain', 'maxFeeRate', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="defaultFeeRate">Default Fee Rate</Label>
                      <Input
                        id="defaultFeeRate"
                        type="number"
                        value={settings.blockchain.defaultFeeRate}
                        onChange={(e) => handleSettingChange('blockchain', 'defaultFeeRate', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="multisigThreshold">Multi-sig Threshold</Label>
                      <Input
                        id="multisigThreshold"
                        type="number"
                        value={settings.blockchain.multisigThreshold}
                        onChange={(e) => handleSettingChange('blockchain', 'multisigThreshold', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="multisigTimelock">Multi-sig Timelock (seconds)</Label>
                      <Input
                        id="multisigTimelock"
                        type="number"
                        value={settings.blockchain.multisigTimelock}
                        onChange={(e) => handleSettingChange('blockchain', 'multisigTimelock', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="features" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="chatEnabled">Chat System</Label>
                        <p className="text-sm text-gray-500">
                          Enable real-time chat functionality
                        </p>
                      </div>
                      <Switch
                        id="chatEnabled"
                        checked={settings.features.chatEnabled}
                        onCheckedChange={(checked) => handleSettingChange('features', 'chatEnabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="xIntegrationEnabled">X Integration</Label>
                        <p className="text-sm text-gray-500">
                          Enable X (Twitter) integration
                        </p>
                      </div>
                      <Switch
                        id="xIntegrationEnabled"
                        checked={settings.features.xIntegrationEnabled}
                        onCheckedChange={(checked) => handleSettingChange('features', 'xIntegrationEnabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="nftAchievementsEnabled">NFT Achievements</Label>
                        <p className="text-sm text-gray-500">
                          Enable NFT achievement system
                        </p>
                      </div>
                      <Switch
                        id="nftAchievementsEnabled"
                        checked={settings.features.nftAchievementsEnabled}
                        onCheckedChange={(checked) => handleSettingChange('features', 'nftAchievementsEnabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="leaderboardEnabled">Leaderboard</Label>
                        <p className="text-sm text-gray-500">
                          Enable performance leaderboard
                        </p>
                      </div>
                      <Switch
                        id="leaderboardEnabled"
                        checked={settings.features.leaderboardEnabled}
                        onCheckedChange={(checked) => handleSettingChange('features', 'leaderboardEnabled', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="socialSharingEnabled">Social Sharing</Label>
                        <p className="text-sm text-gray-500">
                          Enable social media sharing
                        </p>
                      </div>
                      <Switch
                        id="socialSharingEnabled"
                        checked={settings.features.socialSharingEnabled}
                        onCheckedChange={(checked) => handleSettingChange('features', 'socialSharingEnabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoNftMinting">Auto NFT Minting</Label>
                        <p className="text-sm text-gray-500">
                          Automatically mint NFT achievements
                        </p>
                      </div>
                      <Switch
                        id="autoNftMinting"
                        checked={settings.features.autoNftMinting}
                        onCheckedChange={(checked) => handleSettingChange('features', 'autoNftMinting', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="publicProfiles">Public Profiles</Label>
                        <p className="text-sm text-gray-500">
                          Make user profiles publicly visible
                        </p>
                      </div>
                      <Switch
                        id="publicProfiles"
                        checked={settings.features.publicProfiles}
                        onCheckedChange={(checked) => handleSettingChange('features', 'publicProfiles', checked)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SystemSettings;
