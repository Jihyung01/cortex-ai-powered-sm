import React, { Suspense, lazy, ComponentType } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from '@phosphor-icons/react';

// Lazy load components for optimal bundle splitting
const Dashboard = lazy(() => import('@/components/Dashboard'));
const SearchView = lazy(() => import('@/components/SearchView'));
const TemplatesView = lazy(() => import('@/components/TemplatesView'));
const TasksView = lazy(() => import('@/components/TasksView'));
const KanbanView = lazy(() => import('@/components/KanbanView'));
const TimelineView = lazy(() => import('@/components/TimelineView'));
const CalendarView = lazy(() => import('@/components/CalendarView'));
const AnalyticsView = lazy(() => import('@/components/AnalyticsView'));
const AIAssistantView = lazy(() => import('@/components/AIAssistantView'));

// Enterprise components with enhanced lazy loading
const TeamView = lazy(() => import('@/components/TeamView').then(module => ({ default: module.TeamView })));
const ProjectsView = lazy(() => import('@/components/ProjectsView').then(module => ({ default: module.ProjectsView })));
const CollaborationView = lazy(() => import('@/components/CollaborationView').then(module => ({ default: module.CollaborationView })));
const IntegrationsView = lazy(() => import('@/components/IntegrationsView').then(module => ({ default: module.IntegrationsView })));
const AdminView = lazy(() => import('@/components/AdminView').then(module => ({ default: module.AdminView })));

// Advanced feature components
const FocusAssistantView = lazy(() => import('@/components/FocusAssistantView').then(module => ({ default: module.FocusAssistantView })));
const IntelligentTimeView = lazy(() => import('@/components/IntelligentTimeView').then(module => ({ default: module.IntelligentTimeView })));
const WellnessView = lazy(() => import('@/components/WellnessView').then(module => ({ default: module.WellnessView })));
const FutureTechView = lazy(() => import('@/components/FutureTechView').then(module => ({ default: module.FutureTechView })));

// Enterprise-specific views
const SubscriptionManagement = lazy(() => import('@/components/enterprise').then(module => ({ default: module.SubscriptionManagement })));
const MarketingGrowthDashboard = lazy(() => import('@/components/enterprise').then(module => ({ default: module.MarketingGrowthDashboard })));
const ComprehensiveHelpCenter = lazy(() => import('@/components/enterprise').then(module => ({ default: module.ComprehensiveHelpCenter })));

/**
 * Enhanced loading skeleton with glassmorphism design
 */
const LoadingSkeleton = ({ variant = 'default' }: { variant?: 'default' | 'dashboard' | 'grid' | 'list' }) => {
  const skeletonVariants = {
    default: (
      <div className="space-y-4 p-6">
        <div className="h-8 bg-muted/50 rounded-lg animate-pulse" />
        <div className="h-4 bg-muted/30 rounded animate-pulse w-2/3" />
        <div className="space-y-2">
          <div className="h-4 bg-muted/30 rounded animate-pulse" />
          <div className="h-4 bg-muted/30 rounded animate-pulse w-5/6" />
        </div>
      </div>
    ),
    dashboard: (
      <div className="p-6 space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-10 bg-muted/50 rounded-lg animate-pulse w-1/3" />
          <div className="h-4 bg-muted/30 rounded animate-pulse w-1/2" />
        </div>
        
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted/50 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-muted/30 rounded animate-pulse" />
                  <div className="h-4 bg-muted/30 rounded animate-pulse w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    ),
    grid: (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-muted/30 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    ),
    list: (
      <div className="p-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-muted/50 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted/50 rounded animate-pulse w-1/2" />
              <div className="h-3 bg-muted/30 rounded animate-pulse w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-96 flex items-center justify-center"
    >
      <div className="w-full max-w-4xl">
        {skeletonVariants[variant]}
      </div>
    </motion.div>
  );
};

/**
 * Enhanced error boundary component for graceful error handling
 */
const ErrorFallback = ({ 
  error, 
  resetError, 
  componentName 
}: { 
  error: Error; 
  resetError: () => void; 
  componentName?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="min-h-96 flex items-center justify-center p-6"
  >
    <Card className="glass-card max-w-md">
      <CardContent className="p-6 text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-destructive" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {componentName ? `${componentName} Loading Error` : 'Something went wrong'}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            We're having trouble loading this component. This might be a temporary issue.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left text-xs text-muted-foreground bg-muted/50 p-3 rounded">
              <summary className="cursor-pointer">Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
            </details>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={resetError}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/**
 * Higher-order component for enhanced lazy loading with error boundaries
 */
const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  loadingVariant: 'default' | 'dashboard' | 'grid' | 'list' = 'default',
  componentName?: string
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <Suspense fallback={<LoadingSkeleton variant={loadingVariant} />}>
      <ErrorBoundary
        fallback={(error, resetError) => (
          <ErrorFallback 
            error={error} 
            resetError={resetError} 
            componentName={componentName}
          />
        )}
      >
        <Component {...props} ref={ref} />
      </ErrorBoundary>
    </Suspense>
  ));
};

/**
 * Simple error boundary implementation
 */
class ErrorBoundary extends React.Component<
  { 
    children: React.ReactNode; 
    fallback: (error: Error, resetError: () => void) => React.ReactNode;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component Error:', error, errorInfo);
    
    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error, this.resetError);
    }

    return this.props.children;
  }
}

// Enhanced lazy-loaded components with appropriate loading states
export const LazyDashboard = withLazyLoading(Dashboard, 'dashboard', 'Dashboard');
export const LazySearchView = withLazyLoading(SearchView, 'list', 'Search');
export const LazyTemplatesView = withLazyLoading(TemplatesView, 'grid', 'Templates');
export const LazyTasksView = withLazyLoading(TasksView, 'list', 'Tasks');
export const LazyKanbanView = withLazyLoading(KanbanView, 'grid', 'Kanban Board');
export const LazyTimelineView = withLazyLoading(TimelineView, 'default', 'Timeline');
export const LazyCalendarView = withLazyLoading(CalendarView, 'default', 'Calendar');
export const LazyAnalyticsView = withLazyLoading(AnalyticsView, 'dashboard', 'Analytics');
export const LazyAIAssistantView = withLazyLoading(AIAssistantView, 'default', 'AI Assistant');

// Enterprise components
export const LazyTeamView = withLazyLoading(TeamView, 'list', 'Team Management');
export const LazyProjectsView = withLazyLoading(ProjectsView, 'grid', 'Projects');
export const LazyCollaborationView = withLazyLoading(CollaborationView, 'default', 'Collaboration');
export const LazyIntegrationsView = withLazyLoading(IntegrationsView, 'grid', 'Integrations');
export const LazyAdminView = withLazyLoading(AdminView, 'dashboard', 'Admin Panel');

// Advanced features
export const LazyFocusAssistantView = withLazyLoading(FocusAssistantView, 'default', 'Focus Assistant');
export const LazyIntelligentTimeView = withLazyLoading(IntelligentTimeView, 'dashboard', 'Time Management');
export const LazyWellnessView = withLazyLoading(WellnessView, 'default', 'Wellness');
export const LazyFutureTechView = withLazyLoading(FutureTechView, 'default', 'Future Tech');

// Enterprise-specific views
export const LazySubscriptionManagement = withLazyLoading(SubscriptionManagement, 'dashboard', 'Subscription Management');
export const LazyMarketingGrowthDashboard = withLazyLoading(MarketingGrowthDashboard, 'dashboard', 'Marketing Dashboard');
export const LazyComprehensiveHelpCenter = withLazyLoading(ComprehensiveHelpCenter, 'default', 'Help Center');

/**
 * Route-based component resolver with lazy loading
 */
export const getViewComponent = (viewName: string) => {
  const componentMap: Record<string, ComponentType<any>> = {
    dashboard: LazyDashboard,
    search: LazySearchView,
    templates: LazyTemplatesView,
    tasks: LazyTasksView,
    kanban: LazyKanbanView,
    timeline: LazyTimelineView,
    calendar: LazyCalendarView,
    analytics: LazyAnalyticsView,
    'ai-assistant': LazyAIAssistantView,
    team: LazyTeamView,
    projects: LazyProjectsView,
    collaboration: LazyCollaborationView,
    integrations: LazyIntegrationsView,
    admin: LazyAdminView,
    'focus-assistant': LazyFocusAssistantView,
    'intelligent-time': LazyIntelligentTimeView,
    wellness: LazyWellnessView,
    'future-tech': LazyFutureTechView,
    'subscription-management': LazySubscriptionManagement,
    'marketing-dashboard': LazyMarketingGrowthDashboard,
    'help-center': LazyComprehensiveHelpCenter
  };

  return componentMap[viewName] || LazyDashboard;
};

/**
 * Preload critical components for better performance
 */
export const preloadCriticalComponents = () => {
  // Preload the most commonly accessed components
  const criticalComponents = [
    () => import('@/components/Dashboard'),
    () => import('@/components/TasksView'),
    () => import('@/components/SearchView')
  ];

  criticalComponents.forEach(componentLoader => {
    componentLoader().catch(err => {
      console.warn('Failed to preload component:', err);
    });
  });
};

/**
 * Performance monitoring utilities
 */
export const trackComponentLoad = (componentName: string, loadTime: number) => {
  // In production, send to analytics
  if (process.env.NODE_ENV === 'production') {
    console.log(`Component ${componentName} loaded in ${loadTime}ms`);
    // Example: analytics.track('component_loaded', { componentName, loadTime });
  }
};

/**
 * Resource hints for improved loading performance
 */
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;

  // Preload critical fonts
  const fontPreload = document.createElement('link');
  fontPreload.rel = 'preload';
  fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  fontPreload.as = 'style';
  document.head.appendChild(fontPreload);

  // DNS prefetch for external services
  const dnsPrefetch = document.createElement('link');
  dnsPrefetch.rel = 'dns-prefetch';
  dnsPrefetch.href = 'https://api.cortex.app';
  document.head.appendChild(dnsPrefetch);
};