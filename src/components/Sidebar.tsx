import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  FileText, 
  Search,
  Template,
  CheckSquare,
  BarChart3,
  MessageCircle,
  Home,
  Menu,
  X,
  Users,
  FolderOpen,
  UsersThree,
  Plug,
  Shield,
  Globe,
  Building,
  Target,
  Clock,
  Heart,
  Rocket,
  Play
} from '@phosphor-icons/react';
import { useAppState } from '@/hooks/use-notes';
import { useWorkspace } from '@/hooks/use-workspace';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/components/enterprise';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { currentView, setCurrentView, sidebarCollapsed, setSidebarCollapsed } = useAppState();
  const { currentWorkspace, hasPermission } = useWorkspace();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const isDemoMode = user?.id === 'demo-user';

  const personalItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'templates', label: 'Templates', icon: Template },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-assistant', label: 'AI Assistant', icon: MessageCircle },
  ];

  const innovativeItems = [
    { id: 'focus-assistant', label: 'Focus Assistant', icon: Target, badge: 'AI' },
    { id: 'intelligent-time', label: 'Smart Time', icon: Clock, badge: 'AI' },
    { id: 'wellness', label: 'Wellness', icon: Heart, badge: 'Beta' },
    { id: 'future-tech', label: 'Future Tech', icon: Rocket, badge: 'New' }
  ];

  const enterpriseItems = [
    { 
      id: 'team', 
      label: 'Team', 
      icon: Users,
      requiresPermission: ['settings', 'read'] as const
    },
    { 
      id: 'projects', 
      label: 'Projects', 
      icon: FolderOpen,
      requiresPermission: ['projects', 'read'] as const
    },
    { 
      id: 'collaboration', 
      label: 'Collaboration', 
      icon: UsersThree 
    },
    { 
      id: 'integrations', 
      label: 'Integrations', 
      icon: Plug,
      requiresPermission: ['integrations', 'read'] as const
    },
    { 
      id: 'admin', 
      label: 'Admin', 
      icon: Shield,
      requiresPermission: ['settings', 'update'] as const
    },
    { 
      id: 'client-portal', 
      label: 'Client Portal', 
      icon: Globe,
      requiresPermission: ['projects', 'read'] as const
    }
  ];

  const filteredEnterpriseItems = enterpriseItems.filter(item => {
    if (!item.requiresPermission) return true;
    const [resource, action] = item.requiresPermission;
    return hasPermission(resource, action);
  });

  if (isMobile) {
    return null; // Mobile uses different navigation
  }

  return (
    <motion.aside
      className={cn(
        'h-full bg-card border-r transition-all duration-300 flex flex-col glass-sidebar',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
      initial={{ x: -100 }}
      animate={{ x: 0 }}
    >
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Brain size={24} className="text-primary" />
              <span className="font-bold text-lg">Cortex</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <Menu size={16} /> : <X size={16} />}
          </Button>
        </div>
        
        {/* Workspace Indicator */}
        {!sidebarCollapsed && currentWorkspace && (
          <div className="mt-3 p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Building size={14} className="text-muted-foreground" />
              <span className="text-sm font-medium truncate">{currentWorkspace.name}</span>
            </div>
          </div>
        )}

        {/* Demo Mode Indicator */}
        {!sidebarCollapsed && isDemoMode && (
          <motion.div 
            className="mt-3 p-2 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg border border-accent/30"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <Play size={14} className="text-accent" />
              <span className="text-sm font-medium text-accent">Demo Mode</span>
              <Badge variant="outline" className="text-xs bg-accent/10 border-accent/30 text-accent">
                All Features
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Exploring Cortex without authentication
            </p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-auto">
        {/* Personal Section */}
        {!sidebarCollapsed && (
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
            PERSONAL
          </div>
        )}
        <div className="space-y-1">
          {personalItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  sidebarCollapsed && 'px-2'
                )}
                onClick={() => setCurrentView(item.id as any)}
              >
                <Icon size={16} className={sidebarCollapsed ? '' : 'mr-2'} />
                {!sidebarCollapsed && item.label}
              </Button>
            );
          })}
        </div>

        {/* Innovative Features Section */}
        <>
          {!sidebarCollapsed && (
            <>
              <Separator className="my-4" />
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                INNOVATIVE FEATURES
              </div>
            </>
          )}
          <div className="space-y-1">
            {innovativeItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    sidebarCollapsed && 'px-2'
                  )}
                  onClick={() => setCurrentView(item.id as any)}
                >
                  <Icon size={16} className={sidebarCollapsed ? '' : 'mr-2'} />
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs ml-2",
                            item.badge === 'AI' && "bg-purple-100 text-purple-700",
                            item.badge === 'Beta' && "bg-blue-100 text-blue-700",
                            item.badge === 'New' && "bg-green-100 text-green-700"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </>

        {/* Enterprise Section */}
        {currentWorkspace && filteredEnterpriseItems.length > 0 && (
          <>
            {!sidebarCollapsed && (
              <>
                <Separator className="my-4" />
                <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                  ENTERPRISE
                </div>
              </>
            )}
            <div className="space-y-1">
              {filteredEnterpriseItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      sidebarCollapsed && 'px-2'
                    )}
                    onClick={() => setCurrentView(item.id as any)}
                  >
                    <Icon size={16} className={sidebarCollapsed ? '' : 'mr-2'} />
                    {!sidebarCollapsed && item.label}
                  </Button>
                );
              })}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="p-4 border-t">
          <Card className="p-3">
            <div className="text-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">All synced</span>
              </div>
              <div className="flex gap-1">
                <Badge variant="outline" className="text-xs">Beta</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}
    </motion.aside>
  );
}