import { Toaster } from '@/components/ui/sonner';
import { Sidebar } from '@/components/Sidebar';
import { FocusMode } from '@/components/FocusMode';
import { SmartNotifications } from '@/components/SmartNotifications';
import { AIAssistantFAB } from '@/components/AIAssistantFAB';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { PullToRefresh } from '@/components/PullToRefresh';
import { BottomSheet, QuickNoteCreator } from '@/components/BottomSheet';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { EnterpriseErrorBoundary } from '@/components/EnterpriseErrorBoundary';
import { 
  AuthenticationProvider, 
  MonetizationProvider,
  EnterpriseLoginForm,
  InteractiveOnboarding,
  useAuth,
  useMonetization
} from '@/components/enterprise';
import { 
  getViewComponent, 
  preloadCriticalComponents,
  addResourceHints
} from '@/components/ProductionOptimizations';
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

  // Initialize production optimizations
  useEffect(() => {
    const initializeApp = async () => {
      // Add resource hints for performance
      addResourceHints();
      
      // Preload critical components
      preloadCriticalComponents();
      
      console.log('Cortex production app initialized');
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
    const ViewComponent = getViewComponent(currentView);
    
    const enterpriseViews = ['team', 'projects', 'collaboration', 'integrations', 'admin', 'client-portal'];
    const isEnterpriseView = enterpriseViews.includes(currentView);
    
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

  // Initialize production optimizations
  useEffect(() => {
    const initializeApp = async () => {
      // Add resource hints for performance
      addResourceHints();
      
      // Preload critical components
      preloadCriticalComponents();
      
      console.log('Cortex production app initialized');
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
    const ViewComponent = getViewComponent(currentView);
    
    const enterpriseViews = ['team', 'projects', 'collaboration', 'integrations', 'admin', 'client-portal'];
    const isEnterpriseView = enterpriseViews.includes(currentView);
    
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

// Enhanced App component with enterprise providers
function EnhancedApp() {
  return (
    <AuthenticationProvider>
      <MonetizationProvider>
        <AppWithAuth />
      </MonetizationProvider>
    </AuthenticationProvider>
  );
}

// App component that handles authentication state
function AppWithAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user needs onboarding
    const hasCompletedOnboarding = localStorage.getItem('cortex-onboarding-completed');
    if (isAuthenticated && !hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('cortex-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <EnterpriseLoginForm onSuccess={() => window.location.reload()} />;
  }

  if (showOnboarding) {
    return <InteractiveOnboarding onComplete={handleOnboardingComplete} />;
  }

  return <App />;
}

export default EnhancedApp;