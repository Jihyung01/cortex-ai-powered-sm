import { Toaster } from '@/components/ui/sonner';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { SearchView } from '@/components/SearchView';
import { TemplatesView } from '@/components/TemplatesView';
import { TasksView } from '@/components/TasksView';
import { KanbanView } from '@/components/KanbanView';
import { TimelineView } from '@/components/TimelineView';
import { CalendarView } from '@/components/CalendarView';
import { AnalyticsView } from '@/components/AnalyticsView';
import { FocusMode } from '@/components/FocusMode';
import { useAppState } from '@/hooks/use-notes';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

function App() {
  const { currentView, sidebarCollapsed, focusMode } = useAppState();
  const isMobile = useIsMobile();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'search':
        return <SearchView />;
      case 'templates':
        return <TemplatesView />;
      case 'tasks':
        return <TasksView />;
      case 'kanban':
        return <KanbanView />;
      case 'timeline':
        return <TimelineView />;
      case 'calendar':
        return <CalendarView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'notes':
      case 'folders':
      default:
        return <Dashboard />; // For now, all views show dashboard
    }
  };

  if (focusMode) {
    return <FocusMode />;
  }

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-hidden transition-all duration-300 ease-in-out",
        !isMobile && !sidebarCollapsed && "ml-0",
        !isMobile && sidebarCollapsed && "ml-0"
      )}>
        {renderCurrentView()}
      </main>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        richColors
        closeButton
      />
    </div>
  );
}

export default App;