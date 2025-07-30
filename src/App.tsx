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
import { TeamView } from '@/components/TeamView';
import { ProjectsView } from '@/components/ProjectsView';
import { CollaborationView } from '@/components/CollaborationView';
import { IntegrationsView } from '@/components/IntegrationsView';
import { AdminView } from '@/components/AdminView';
import { ClientPortalView } from '@/components/ClientPortalView';
import { FocusAssistantView } from '@/components/FocusAssistantView';
import { IntelligentTimeView } from '@/components/IntelligentTimeView';
import { WellnessView } from '@/components/WellnessView';
import { FutureTechView } from '@/components/FutureTechView';
import { FocusMode } from '@/components/FocusMode';
import { SmartNotifications } from '@/components/SmartNotifications';
import { AIAssistantFAB } from '@/components/AIAssistantFAB';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { PullToRefresh } from '@/components/PullToRefresh';
import { BottomSheet, QuickNoteCreator } from '@/components/BottomSheet';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { EnterpriseErrorBoundary } from '@/components/EnterpriseErrorBoundary';
import { useAppState } from '@/hooks/use-notes';
import { useIsMobile, usePWA } from '@/hooks/use-mobile';
import { useGestureSupport, useKeyboardNavigation } from '@/hooks/use-accessibility';
import { useNativeFeatures } from '@/hooks/use-native-features';
import { useOffline } from '@/hooks/use-offline';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransitions, springPresets } from '@/hooks/use-motion';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';

function App() {
  const { currentView, sidebarCollapsed, focusMode } = useAppState();
  const isMobile = useIsMobile();
  const { prefersReducedMotion, getAnimationProps } = useGestureSupport();
  const { isKeyboardUser } = useKeyboardNavigation();
  const { setupInstallPrompt } = useNativeFeatures();
  const { syncPendingActions } = useOffline();
  const { isServiceWorkerReady } = usePWA();
  
  // Mobile-specific state
  const [isQuickNoteOpen, setIsQuickNoteOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize workspace context
  useEffect(() => {
    const initializeApp = async () => {
      // In a real app, this would check for existing workspaces
      // and create a default personal workspace if none exist
      console.log('Initializing Cortex app...');
    };
    
    initializeApp();
  }, []);

  // Setup PWA features
  useEffect(() => {
    const cleanup = setupInstallPrompt();
    return cleanup;
  }, [setupInstallPrompt]);

  // Handle URL parameters for PWA shortcuts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'new-note') {
      setIsQuickNoteOpen(true);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await syncPendingActions();
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  }, [syncPendingActions]);

  const handleCreateNote = useCallback(() => {
    setIsQuickNoteOpen(true);
  }, []);

  const handleCreateTask = useCallback(() => {
    // Open task creation (implement similar to note creation)
    console.log('Create task');
  }, []);

  const handleVoiceNote = useCallback(() => {
    // Open voice note recording
    console.log('Voice note');
  }, []);

  const handleCameraNote = useCallback(() => {
    // Open camera for note
    console.log('Camera note');
  }, []);

  const handleQuickShare = useCallback(() => {
    // Open quick share
    console.log('Quick share');
  }, []);

  const handleSettings = useCallback(() => {
    // Open settings
    console.log('Settings');
  }, []);

  const handleSaveNote = useCallback(async (noteData: any) => {
    // Save note logic
    console.log('Saving note:', noteData);
  }, []);

  const renderCurrentView = () => {
    const enterpriseViews = ['team', 'projects', 'collaboration', 'integrations', 'admin', 'client-portal'];
    const advancedViews = ['focus-assistant', 'intelligent-time', 'wellness', 'future-tech'];
    const isEnterpriseView = enterpriseViews.includes(currentView);
    const isAdvancedView = advancedViews.includes(currentView);
    
    const ViewComponent = () => {
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
        case 'team':
          return <TeamView />;
        case 'projects':
          return <ProjectsView />;
        case 'collaboration':
          return <CollaborationView />;
        case 'integrations':
          return <IntegrationsView />;
        case 'admin':
          return <AdminView />;
        case 'client-portal':
          return <ClientPortalView />;
        case 'focus-assistant':
          return <FocusAssistantView />;
        case 'intelligent-time':
          return <IntelligentTimeView />;
        case 'wellness':
          return <WellnessView />;
        case 'future-tech':
          return <FutureTechView />;
        case 'notes':
        case 'folders':
        default:
          return <Dashboard />;
      }
    };

    // Wrap enterprise views with error boundary
    if (isEnterpriseView) {
      return (
        <EnterpriseErrorBoundary>
          <ViewComponent />
        </EnterpriseErrorBoundary>
      );
    }

    return <ViewComponent />;
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

  const mainContent = (
    <main 
      id="main-content"
      className={cn(
        "flex-1 overflow-hidden transition-all duration-500 ease-out",
        !isMobile && !sidebarCollapsed && "ml-0",
        !isMobile && sidebarCollapsed && "ml-0"
      )}
    >
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
  );

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
      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* Sidebar */}
      {!isMobile && <Sidebar />}
      
      {/* Main Content with Pull-to-Refresh */}
      {isMobile ? (
        <PullToRefresh onRefresh={handleRefresh} disabled={refreshing}>
          {mainContent}
        </PullToRefresh>
      ) : (
        mainContent
      )}

      {/* Mobile Navigation (if needed) */}
      {isMobile && (
        // Mobile bottom navigation could go here if needed
        null
      )}

      {/* Floating Action Button */}
      <FloatingActionButton
        onCreateNote={handleCreateNote}
        onCreateTask={handleCreateTask}
        onVoiceNote={handleVoiceNote}
        onCameraNote={handleCameraNote}
        onQuickShare={handleQuickShare}
        onSettings={handleSettings}
      />

      {/* Quick Note Creator */}
      <QuickNoteCreator
        isOpen={isQuickNoteOpen}
        onClose={() => setIsQuickNoteOpen(false)}
        onSave={handleSaveNote}
      />

      {/* Toast Notifications */}
      <Toaster 
        position={isMobile ? "top-center" : "top-right"}
        richColors
        closeButton
        className="glassmorphism-toaster"
      />

      {/* Smart AI Notifications */}
      <SmartNotifications />

      {/* AI Assistant FAB (desktop only, replaced by main FAB on mobile) */}
      {!isMobile && <AIAssistantFAB />}
      
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