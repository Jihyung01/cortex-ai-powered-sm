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
import { AIAssistantView } from '@/components/AIAssistantView';
import { FocusMode } from '@/components/FocusMode';
import { SmartNotifications } from '@/components/SmartNotifications';
import { AIAssistantFAB } from '@/components/AIAssistantFAB';
import { useAppState } from '@/hooks/use-notes';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGestureSupport, useKeyboardNavigation } from '@/hooks/use-accessibility';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransitions, springPresets } from '@/hooks/use-motion';
import { cn } from '@/lib/utils';

function App() {
  const { currentView, sidebarCollapsed, focusMode } = useAppState();
  const isMobile = useIsMobile();
  const { prefersReducedMotion, getAnimationProps } = useGestureSupport();
  const { isKeyboardUser } = useKeyboardNavigation();

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
      case 'ai-assistant':
        return <AIAssistantView />;
      case 'notes':
      case 'folders':
      default:
        return <Dashboard />; // For now, all views show dashboard
    }
  };

  if (focusMode) {
    return (
      <motion.div
        {...getAnimationProps(pageTransitions)}
        className="h-screen"
      >
        <FocusMode />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={cn(
        "h-screen flex bg-background text-foreground overflow-hidden",
        isKeyboardUser && "keyboard-user" // Add class for keyboard users
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={springPresets.gentle}
    >
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-hidden transition-all duration-500 ease-out",
        !isMobile && !sidebarCollapsed && "ml-0",
        !isMobile && sidebarCollapsed && "ml-0"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            {...getAnimationProps(pageTransitions)}
            className="h-full"
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        richColors
        closeButton
        className="glassmorphism-toaster"
      />

      {/* Smart AI Notifications */}
      <SmartNotifications />

      {/* AI Assistant FAB */}
      <AIAssistantFAB />
      
      {/* Accessibility: Skip to main content */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>
    </motion.div>
  );
}

export default App;