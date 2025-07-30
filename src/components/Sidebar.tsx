import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  X
} from '@phosphor-icons/react';
import { useAppState } from '@/hooks/use-notes';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { currentView, setCurrentView, sidebarCollapsed, setSidebarCollapsed } = useAppState();
  const isMobile = useIsMobile();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'templates', label: 'Templates', icon: Template },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ai-assistant', label: 'AI Assistant', icon: MessageCircle },
  ];

  if (isMobile) {
    return null; // Mobile uses different navigation
  }

  return (
    <motion.aside
      className={cn(
        'h-full bg-card border-r transition-all duration-300 flex flex-col',
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
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
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