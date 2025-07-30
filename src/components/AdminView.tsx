import { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkspace } from '@/hooks/use-workspace';
import { springPresets } from '@/hooks/use-motion';
import { 
  Shield, 
  Users, 
  Activity, 
  Database,
  Lock,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle
} from '@phosphor-icons/react';

export const AdminView = memo(() => {
  const { currentWorkspace, auditLogs, hasPermission } = useWorkspace();

  if (!hasPermission('settings', 'update')) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="text-center p-8">
          <CardHeader>
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              You don't have administrative permissions.
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
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          System administration and security monitoring
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <p className="text-2xl font-bold">42</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Active Sessions</span>
            </div>
            <p className="text-2xl font-bold">18</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Storage Used</span>
            </div>
            <p className="text-2xl font-bold">2.4 GB</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Security Score</span>
            </div>
            <p className="text-2xl font-bold">98%</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest system events and user actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditLogs.slice(0, 10).map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {log.severity === 'critical' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {log.severity === 'high' && <Shield className="w-4 h-4 text-orange-500" />}
                    {log.severity === 'medium' && <Settings className="w-4 h-4 text-yellow-500" />}
                    {log.severity === 'low' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                  <div>
                    <p className="font-medium">{log.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {log.action} {log.resource}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge variant={
                    log.severity === 'critical' ? 'destructive' :
                    log.severity === 'high' ? 'secondary' :
                    'outline'
                  }>
                    {log.severity}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

AdminView.displayName = 'AdminView';