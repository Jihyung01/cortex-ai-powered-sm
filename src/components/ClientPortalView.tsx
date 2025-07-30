import { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWorkspace } from '@/hooks/use-workspace';
import { springPresets } from '@/hooks/use-motion';
import { 
  Globe, 
  Eye, 
  MessageCircle,
  Calendar,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  ExternalLink
} from '@phosphor-icons/react';

export const ClientPortalView = memo(() => {
  const { projects, clients, hasPermission } = useWorkspace();

  if (!hasPermission('projects', 'read')) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="text-center p-8">
          <CardHeader>
            <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              You don't have permission to view the client portal.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Mock data for demonstration
  const activeProjects = projects.filter(p => p.status === 'active');
  const recentUpdates = [
    {
      id: '1',
      title: 'Project milestone completed',
      description: 'Website design phase has been completed successfully',
      date: new Date(),
      type: 'milestone'
    },
    {
      id: '2',
      title: 'New deliverable ready',
      description: 'Mobile app wireframes are ready for review',
      date: new Date(Date.now() - 86400000),
      type: 'deliverable'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
      className="flex flex-col h-full p-4 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Client Portal</h1>
          <p className="text-muted-foreground">
            External client access and project visibility
          </p>
        </div>
        
        <Button className="gap-2">
          <ExternalLink className="w-4 h-4" />
          Open Portal
        </Button>
      </div>

      {/* Portal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Active Portals</span>
            </div>
            <p className="text-2xl font-bold">{clients.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Monthly Views</span>
            </div>
            <p className="text-2xl font-bold">1,234</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Client Messages</span>
            </div>
            <p className="text-2xl font-bold">18</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Client Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Client Projects</CardTitle>
          <CardDescription>
            Projects visible to external clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeProjects.slice(0, 3).map(project => (
              <div key={project.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.description}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {project.status}
                        </Badge>
                        <Badge variant="secondary">
                          {project.priority}
                        </Badge>
                      </div>
                      
                      {project.budget && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <DollarSign className="w-3 h-3" />
                          ${project.budget.spent}/${project.budget.allocated}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    View Portal
                  </Button>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Client Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Client Activity</CardTitle>
          <CardDescription>
            Latest updates and interactions from clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUpdates.map(update => (
              <div key={update.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="mt-1">
                  {update.type === 'milestone' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {update.type === 'deliverable' && <FileText className="w-4 h-4 text-blue-500" />}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium">{update.title}</h4>
                  <p className="text-sm text-muted-foreground">{update.description}</p>
                  
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {update.date.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client List */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Clients</CardTitle>
          <CardDescription>
            External clients with portal access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clients.map(client => (
              <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">{client.name[0]}</span>
                  </div>
                  
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.company}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={client.lastLogin ? 'default' : 'secondary'}>
                    {client.lastLogin ? 'Active' : 'Inactive'}
                  </Badge>
                  
                  <div className="text-xs text-muted-foreground">
                    {client.projectIds.length} project{client.projectIds.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
            
            {clients.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No clients registered yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ClientPortalView.displayName = 'ClientPortalView';