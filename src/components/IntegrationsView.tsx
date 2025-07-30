import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useIntegrations } from '@/hooks/use-integrations';
import { useWorkspace } from '@/hooks/use-workspace';
import { useIsMobile } from '@/hooks/use-mobile';
import { springPresets } from '@/hooks/use-motion';
import { cn } from '@/lib/utils';
import { 
  Plug, 
  Check, 
  X, 
  Settings, 
  ExternalLink,
  Download,
  Upload,
  Zap,
  Github,
  MessageSquare,
  Video,
  Calendar,
  FileText,
  Database,
  Shield,
  Key,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Building,
  Globe,
  Lock
} from '@phosphor-icons/react';

export const IntegrationsView = memo(() => {
  const isMobile = useIsMobile();
  const {
    slackIntegration,
    teamsIntegration,
    discordIntegration,
    githubIntegration,
    zapierIntegration,
    isConnecting,
    connectSlack,
    disconnectSlack,
    connectTeams,
    disconnectTeams,
    connectDiscord,
    disconnectDiscord,
    connectGithub,
    disconnectGithub,
    connectZapier,
    disconnectZapier,
    importFromJira,
    importFromTrello,
    importFromAsana,
    exportToCSV,
    exportToJSON,
    configureSSOProvider
  } = useIntegrations();

  const { currentWorkspace, hasPermission } = useWorkspace();

  const [activeTab, setActiveTab] = useState('connected');
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedImportType, setSelectedImportType] = useState<'jira' | 'trello' | 'asana' | null>(null);

  const [connectionForms, setConnectionForms] = useState({
    slack: { workspaceUrl: '', botToken: '' },
    teams: { tenantId: '', applicationId: '' },
    discord: { serverId: '', botToken: '' },
    github: { accessToken: '', repositories: [] as string[] },
    zapier: { webhookUrl: '' }
  });

  const integrations = [
    {
      id: 'slack',
      name: 'Slack',
      description: 'Connect your Slack workspace for seamless team communication',
      icon: MessageSquare,
      color: 'bg-purple-500',
      connected: slackIntegration?.enabled || false,
      integration: slackIntegration,
      category: 'communication'
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Sync with Teams for meetings and file collaboration',
      icon: Video,
      color: 'bg-blue-500',
      connected: teamsIntegration?.enabled || false,
      integration: teamsIntegration,
      category: 'communication'
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Connect Discord for community and project discussions',
      icon: MessageSquare,
      color: 'bg-indigo-500',
      connected: discordIntegration?.enabled || false,
      integration: discordIntegration,
      category: 'communication'
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Link repositories and sync issues with tasks',
      icon: Github,
      color: 'bg-gray-800',
      connected: githubIntegration?.enabled || false,
      integration: githubIntegration,
      category: 'development'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Automate workflows with 3,000+ app integrations',
      icon: Zap,
      color: 'bg-orange-500',
      connected: zapierIntegration?.enabled || false,
      integration: zapierIntegration,
      category: 'automation'
    }
  ];

  const connectedIntegrations = integrations.filter(i => i.connected);
  const availableIntegrations = integrations.filter(i => !i.connected);

  const handleConnect = useCallback(async (integrationId: string) => {
    const form = connectionForms[integrationId as keyof typeof connectionForms];
    
    switch (integrationId) {
      case 'slack':
        await connectSlack(form as any);
        break;
      case 'teams':
        await connectTeams(form as any);
        break;
      case 'discord':
        await connectDiscord(form as any);
        break;
      case 'github':
        await connectGithub(form as any);
        break;
      case 'zapier':
        await connectZapier(form as any);
        break;
    }
  }, [connectionForms, connectSlack, connectTeams, connectDiscord, connectGithub, connectZapier]);

  const handleDisconnect = useCallback(async (integrationId: string) => {
    switch (integrationId) {
      case 'slack':
        await disconnectSlack();
        break;
      case 'teams':
        await disconnectTeams();
        break;
      case 'discord':
        await disconnectDiscord();
        break;
      case 'github':
        await disconnectGithub();
        break;
      case 'zapier':
        await disconnectZapier();
        break;
    }
  }, [disconnectSlack, disconnectTeams, disconnectDiscord, disconnectGithub, disconnectZapier]);

  const handleImport = useCallback(async (type: 'jira' | 'trello' | 'asana', config: any) => {
    setIsImporting(true);
    setImportProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      let result;
      switch (type) {
        case 'jira':
          result = await importFromJira(config);
          break;
        case 'trello':
          result = await importFromTrello(config);
          break;
        case 'asana':
          result = await importFromAsana(config);
          break;
      }

      clearInterval(progressInterval);
      setImportProgress(100);
      
      console.log('Import result:', result);
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportProgress(0), 2000);
    }
  }, [importFromJira, importFromTrello, importFromAsana]);

  const handleExport = useCallback(async (format: 'csv' | 'json') => {
    // Mock data for export
    const data = [
      { id: 1, title: 'Sample Task', status: 'completed', assignee: 'John Doe' },
      { id: 2, title: 'Another Task', status: 'in-progress', assignee: 'Jane Smith' }
    ];

    if (format === 'csv') {
      await exportToCSV(data, 'cortex-export');
    } else {
      await exportToJSON(data, 'cortex-export');
    }
  }, [exportToCSV, exportToJSON]);

  const getIntegrationIcon = (integration: typeof integrations[0]) => {
    const IconComponent = integration.icon;
    return (
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", integration.color)}>
        <IconComponent className="w-6 h-6" />
      </div>
    );
  };

  if (!hasPermission('integrations', 'read')) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="text-center p-8">
          <CardHeader>
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              You don't have permission to view integrations.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
      className="flex flex-col h-full p-4 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your favorite tools and automate workflows
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            {connectedIntegrations.length} Connected
          </Badge>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connected">Connected ({connectedIntegrations.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availableIntegrations.length})</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="connected" className="space-y-4">
          {connectedIntegrations.length === 0 ? (
            <Card className="text-center p-8">
              <CardHeader>
                <Plug className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <CardTitle>No Integrations Connected</CardTitle>
                <CardDescription>
                  Connect your favorite tools to streamline your workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setActiveTab('available')}>
                  Browse Available Integrations
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {connectedIntegrations.map((integration, index) => (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springPresets.gentle, delay: index * 0.1 }}
                >
                  <Card className="glass-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {getIntegrationIcon(integration)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{integration.name}</h3>
                              <Badge variant="default" className="gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Connected
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {integration.description}
                            </p>
                            
                            {/* Integration-specific status */}
                            {integration.id === 'slack' && slackIntegration && (
                              <div className="mt-3 space-y-2">
                                <p className="text-xs text-muted-foreground">
                                  Workspace: {slackIntegration.workspaceUrl}
                                </p>
                                <div className="flex items-center gap-4 text-xs">
                                  <span className={cn(
                                    "flex items-center gap-1",
                                    slackIntegration.notificationSettings.newTasks ? "text-green-600" : "text-muted-foreground"
                                  )}>
                                    {slackIntegration.notificationSettings.newTasks ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                    Task Notifications
                                  </span>
                                  <span className="text-muted-foreground">
                                    {slackIntegration.channelMappings.length} channels mapped
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {integration.id === 'github' && githubIntegration && (
                              <div className="mt-3">
                                <p className="text-xs text-muted-foreground">
                                  {githubIntegration.repositories.length} repositories connected
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                          
                          {hasPermission('integrations', 'delete') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDisconnect(integration.id)}
                            >
                              Disconnect
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4">
            {availableIntegrations.map((integration, index) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springPresets.gentle, delay: index * 0.1 }}
              >
                <Card className="glass-card hover:glass-elevated transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {getIntegrationIcon(integration)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{integration.name}</h3>
                            <Badge variant="secondary">{integration.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {integration.description}
                          </p>
                        </div>
                      </div>
                      
                      {hasPermission('integrations', 'create') && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="gap-2">
                              <Plug className="w-4 h-4" />
                              Connect
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Connect {integration.name}</DialogTitle>
                              <DialogDescription>
                                Configure your {integration.name} integration
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              {/* Integration-specific forms */}
                              {integration.id === 'slack' && (
                                <>
                                  <div>
                                    <Label htmlFor="slack-workspace">Workspace URL</Label>
                                    <Input
                                      id="slack-workspace"
                                      placeholder="https://yourteam.slack.com"
                                      value={connectionForms.slack.workspaceUrl}
                                      onChange={(e) => setConnectionForms(prev => ({
                                        ...prev,
                                        slack: { ...prev.slack, workspaceUrl: e.target.value }
                                      }))}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="slack-token">Bot Token</Label>
                                    <Input
                                      id="slack-token"
                                      type="password"
                                      placeholder="xoxb-your-bot-token"
                                      value={connectionForms.slack.botToken}
                                      onChange={(e) => setConnectionForms(prev => ({
                                        ...prev,
                                        slack: { ...prev.slack, botToken: e.target.value }
                                      }))}
                                    />
                                  </div>
                                </>
                              )}
                              
                              {integration.id === 'github' && (
                                <div>
                                  <Label htmlFor="github-token">Personal Access Token</Label>
                                  <Input
                                    id="github-token"
                                    type="password"
                                    placeholder="ghp_xxxxxxxxxxxx"
                                    value={connectionForms.github.accessToken}
                                    onChange={(e) => setConnectionForms(prev => ({
                                      ...prev,
                                      github: { ...prev.github, accessToken: e.target.value }
                                    }))}
                                  />
                                </div>
                              )}
                              
                              <Button
                                onClick={() => handleConnect(integration.id)}
                                disabled={isConnecting === integration.id}
                                className="w-full"
                              >
                                {isConnecting === integration.id ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Connecting...
                                  </>
                                ) : (
                                  `Connect ${integration.name}`
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="import-export" className="space-y-6">
          {/* Import Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Import Data
              </CardTitle>
              <CardDescription>
                Import projects and tasks from other platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isImporting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Importing from {selectedImportType}...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="h-2" />
                </div>
              )}
              
              <div className="grid gap-4 sm:grid-cols-3">
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => handleImport('jira', { serverUrl: 'https://example.atlassian.net', apiToken: 'token', projectKey: 'PROJ' })}
                  disabled={isImporting}
                >
                  <Database className="w-6 h-6" />
                  <span>Import from Jira</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => handleImport('trello', { apiKey: 'key', token: 'token', boardId: 'board123' })}
                  disabled={isImporting}
                >
                  <FileText className="w-6 h-6" />
                  <span>Import from Trello</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => handleImport('asana', { accessToken: 'token', projectId: 'project123' })}
                  disabled={isImporting}
                >
                  <CheckCircle className="w-6 h-6" />
                  <span>Import from Asana</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Export Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Export Data
              </CardTitle>
              <CardDescription>
                Export your data for backup or migration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => handleExport('csv')}
                >
                  <FileText className="w-6 h-6" />
                  <span>Export as CSV</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => handleExport('json')}
                >
                  <Database className="w-6 h-6" />
                  <span>Export as JSON</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* SSO Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Single Sign-On (SSO)
              </CardTitle>
              <CardDescription>
                Configure enterprise authentication providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-8 h-8 text-blue-500" />
                      <div>
                        <h4 className="font-medium">Google SSO</h4>
                        <p className="text-sm text-muted-foreground">Google Workspace</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building className="w-8 h-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Microsoft SSO</h4>
                        <p className="text-sm text-muted-foreground">Azure AD</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-8 h-8 text-yellow-500" />
                      <div>
                        <h4 className="font-medium">Okta</h4>
                        <p className="text-sm text-muted-foreground">Enterprise Identity</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Key className="w-8 h-8 text-gray-500" />
                      <div>
                        <h4 className="font-medium">SAML 2.0</h4>
                        <p className="text-sm text-muted-foreground">Custom SAML</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage API access for external integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Production API Key</h4>
                    <p className="text-sm text-muted-foreground">ck_•••••••••••••••••••••••••••••••••8f2a</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Webhook Secret</h4>
                    <p className="text-sm text-muted-foreground">wh_•••••••••••••••••••••••••••••••••9e7b</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
});

IntegrationsView.displayName = 'IntegrationsView';