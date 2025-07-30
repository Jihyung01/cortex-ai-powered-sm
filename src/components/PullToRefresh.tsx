import { memo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMobileGestures } from '@/hooks/use-mobile-gestures';
import { useIsMobile } from '@/hooks/use-mobile';
import { springPresets } from '@/hooks/use-motion';
import { cn } from '@/lib/utils';
import { 
  RefreshCw, 
  Check, 
  X,
  Loader2,
  Download
} from '@phosphor-icons/react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
  threshold?: number;
}

export const PullToRefresh = memo<PullToRefreshProps>(({ 
  onRefresh,
  children,
  disabled = false,
  threshold = 80
}) => {
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshState, setRefreshState] = useState<'idle' | 'pulling' | 'triggered' | 'refreshing'>('idle');
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);

  const handleRefresh = useCallback(async () => {
    if (disabled || isRefreshing) return;
    
    setIsRefreshing(true);
    setRefreshState('refreshing');
    
    try {
      await onRefresh();
      setRefreshState('idle');
      setLastRefresh(Date.now());
      navigator.vibrate?.(100); // Success vibration
    } catch (error) {
      console.error('Refresh failed:', error);
      navigator.vibrate?.(200); // Error vibration
    } finally {
      setIsRefreshing(false);
      
      // Small delay to show completion state
      setTimeout(() => {
        setRefreshState('idle');
      }, 1000);
    }
  }, [disabled, isRefreshing, onRefresh]);

  const { elementRef, isPulling, pullDistance } = useMobileGestures({
    onPullToRefresh: handleRefresh,
    threshold
  });

  // Update refresh state based on pull distance
  useEffect(() => {
    if (!isPulling) {
      setRefreshState('idle');
      return;
    }

    if (pullDistance >= threshold) {
      setRefreshState('triggered');
    } else {
      setRefreshState('pulling');
    }
  }, [isPulling, pullDistance, threshold]);

  const getRefreshIcon = () => {
    switch (refreshState) {
      case 'pulling':
        return <Download className="w-5 h-5" />;
      case 'triggered':
        return <RefreshCw className="w-5 h-5" />;
      case 'refreshing':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      default:
        return <Check className="w-5 h-5" />;
    }
  };

  const getRefreshText = () => {
    switch (refreshState) {
      case 'pulling':
        return 'Pull down to refresh';
      case 'triggered':
        return 'Release to refresh';
      case 'refreshing':
        return 'Refreshing...';
      default:
        return lastRefresh ? `Last updated ${new Date(lastRefresh).toLocaleTimeString()}` : 'Pull to refresh';
    }
  };

  const progressPercentage = Math.min((pullDistance / threshold) * 100, 100);

  if (!isMobile) {
    return (
      <div className="relative">
        {/* Desktop refresh button */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={handleRefresh}
            disabled={disabled || isRefreshing}
            variant="outline"
            size="sm"
            className="glass"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" ref={elementRef}>
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ 
              opacity: 1, 
              y: isPulling ? Math.min(pullDistance - threshold, 0) : -20
            }}
            exit={{ opacity: 0, y: -60 }}
            transition={springPresets.gentle}
            className="absolute top-0 left-0 right-0 z-50"
          >
            <Card className="mx-4 mt-4 p-4 glass-elevated">
              <div className="flex items-center justify-center gap-3">
                <motion.div
                  animate={{ 
                    rotate: refreshState === 'triggered' ? 180 : 0,
                    scale: refreshState === 'refreshing' ? 1.1 : 1
                  }}
                  transition={springPresets.gentle}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    refreshState === 'triggered' ? 'bg-primary text-primary-foreground' : 'bg-muted',
                    refreshState === 'refreshing' && 'bg-primary text-primary-foreground'
                  )}
                >
                  {getRefreshIcon()}
                </motion.div>
                
                <div className="flex-1">
                  <motion.p 
                    className="text-sm font-medium"
                    animate={{ 
                      color: refreshState === 'triggered' ? 'var(--primary)' : 'var(--foreground)'
                    }}
                  >
                    {getRefreshText()}
                  </motion.p>
                  
                  {isPulling && (
                    <Progress 
                      value={progressPercentage} 
                      className="h-2 mt-2"
                    />
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        animate={{
          transform: isPulling ? `translateY(${Math.min(pullDistance, threshold * 1.5)}px)` : 'translateY(0px)'
        }}
        transition={springPresets.gentle}
        className="relative"
      >
        {children}
      </motion.div>

      {/* Refresh indicator overlay */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center z-40"
          >
            <Card className="p-6 glass-elevated">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <div>
                  <p className="font-medium">Refreshing content...</p>
                  <p className="text-sm text-muted-foreground">This won't take long</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

PullToRefresh.displayName = 'PullToRefresh';