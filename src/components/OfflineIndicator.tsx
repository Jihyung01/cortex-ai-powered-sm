import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useOffline } from '@/hooks/use-offline';
import { useNativeFeatures } from '@/hooks/use-native-features';
import { usePerformanceMonitor } from '@/hooks/use-performance';
import { springPresets } from '@/hooks/use-motion';
import { cn } from '@/lib/utils';
import { 
  Wifi, 
  WifiOff, 
  CloudCheck, 
  CloudX, 
  Zap,
  Battery,
  Signal,
  Download,
  Upload,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  RefreshCw
} from '@phosphor-icons/react';

interface OfflineIndicatorProps {
  className?: string;
}

export const OfflineIndicator = memo<OfflineIndicatorProps>(({ className }) => {
  const { 
    isOnline, 
    isPending, 
    pendingActions, 
    lastSync, 
    syncPendingActions,
    retryActions 
  } = useOffline();
  const { installApp, isInstallable, requestNotificationPermission } = useNativeFeatures();
  const { metrics } = usePerformanceMonitor();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Auto-collapse after a delay
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => setIsExpanded(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const getConnectionStatus = () => {
    if (isOnline) {
      return pendingActions.length > 0 ? 'syncing' : 'online';
    }
    return 'offline';
  };

  const getStatusIcon = () => {
    const status = getConnectionStatus();
    switch (status) {
      case 'online':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'syncing':
        return <CloudCheck className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-orange-500" />;
      default:
        return <CloudX className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    const status = getConnectionStatus();
    switch (status) {
      case 'online':
        return 'Online';
      case 'syncing':
        return `Syncing ${pendingActions.length} items`;
      case 'offline':
        return 'Offline Mode';
      default:
        return 'Connection Error';
    }
  };

  const getStatusColor = () => {
    const status = getConnectionStatus();
    switch (status) {
      case 'online':
        return 'border-green-500/30 bg-green-500/10';
      case 'syncing':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'offline':
        return 'border-orange-500/30 bg-orange-500/10';
      default:
        return 'border-red-500/30 bg-red-500/10';
    }
  };

  return (
    <motion.div
      className={cn(
        "fixed top-4 left-4 z-40 select-none",
        className
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
    >
      <Card 
        className={cn(
          "glass border-2 transition-all duration-300 cursor-pointer",
          getStatusColor(),
          isExpanded && "glass-elevated"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-3">
          {/* Compact Status */}
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">
              {getStatusText()}
            </span>
            
            {/* Performance indicator */}
            {metrics.fps < 50 && (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            )}
            
            {/* PWA install indicator */}
            {isInstallable && (
              <Download className="w-4 h-4 text-blue-500" />
            )}
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={springPresets.gentle}
                className="mt-3 space-y-3 overflow-hidden"
              >
                {/* Connection Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Status</span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon()}
                      <span>{getStatusText()}</span>
                    </div>
                  </div>
                  
                  {lastSync && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span>{new Date(lastSync).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>

                {/* Pending Actions */}
                {pendingActions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Pending Actions</span>
                      <Badge variant="secondary" className="text-xs">
                        {pendingActions.length}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      {pendingActions.slice(0, 3).map((action) => (
                        <div key={action.id} className="flex items-center gap-2 text-xs">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          <span className="flex-1 truncate">
                            {action.type.replace('-', ' ')}
                          </span>
                          <span className="text-muted-foreground">
                            {action.retryCount > 0 && `(${action.retryCount} retries)`}
                          </span>
                        </div>
                      ))}
                      
                      {pendingActions.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{pendingActions.length - 3} more
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          retryActions();
                        }}
                        className="flex-1 h-8 text-xs"
                        disabled={!isOnline || isPending}
                      >
                        {isPending ? (
                          <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          <Upload className="w-3 h-3 mr-1" />
                        )}
                        Sync Now
                      </Button>
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Performance</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDetails(!showDetails);
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      {showDetails ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <Zap className={cn(
                      "w-3 h-3",
                      metrics.fps >= 50 ? "text-green-500" : "text-yellow-500"
                    )} />
                    <span>{metrics.fps} FPS</span>
                    
                    {metrics.memoryUsage > 0 && (
                      <>
                        <Battery className="w-3 h-3 text-blue-500" />
                        <span>{metrics.memoryUsage}MB</span>
                      </>
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1 text-xs overflow-hidden"
                      >
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Load Time</span>
                          <span>{metrics.loadTime}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Render Time</span>
                          <span>{metrics.renderTime}ms</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* PWA Features */}
                {isInstallable && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">App Features</div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          installApp();
                        }}
                        className="flex-1 h-8 text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Install App
                      </Button>
                      
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          requestNotificationPermission();
                        }}
                        className="flex-1 h-8 text-xs"
                      >
                        <Signal className="w-3 h-3 mr-1" />
                        Notifications
                      </Button>
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <div className="flex justify-center pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
});

OfflineIndicator.displayName = 'OfflineIndicator';