import { useState, useEffect, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';

export interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface OfflineState {
  isOnline: boolean;
  isPending: boolean;
  pendingActions: OfflineAction[];
  lastSync: number | null;
}

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPending, setIsPending] = useState(false);
  const [pendingActions, setPendingActions] = useKV<OfflineAction[]>('offline-actions', []);
  const [lastSync, setLastSync] = useKV<number | null>('last-sync', null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add action to pending queue
  const queueAction = useCallback((type: string, data: any) => {
    const action: OfflineAction = {
      id: crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    setPendingActions(current => [...current, action]);

    // If online, try to sync immediately
    if (isOnline) {
      syncPendingActions();
    }

    return action.id;
  }, [isOnline]);

  // Execute pending actions when online
  const syncPendingActions = useCallback(async () => {
    if (!isOnline || isPending) return;

    setPendingActions(current => {
      if (current.length === 0) return current;
      
      setIsPending(true);
      
      // Process actions in background
      processActions(current).finally(() => {
        setIsPending(false);
        setLastSync(() => Date.now());
      });
      
      return current;
    });
  }, [isOnline, isPending]);

  // Process actions with retry logic
  const processActions = async (actions: OfflineAction[]) => {
    const maxRetries = 3;
    const successfulIds: string[] = [];
    const failedActions: OfflineAction[] = [];

    for (const action of actions) {
      try {
        await executeAction(action);
        successfulIds.push(action.id);
      } catch (error) {
        console.warn('Failed to execute offline action:', error);
        
        if (action.retryCount < maxRetries) {
          failedActions.push({
            ...action,
            retryCount: action.retryCount + 1
          });
        }
      }
    }

    // Update pending actions - remove successful, keep failed for retry
    setPendingActions(current => [
      ...current.filter(action => !successfulIds.includes(action.id)),
      ...failedActions
    ]);
  };

  // Execute individual action based on type
  const executeAction = async (action: OfflineAction): Promise<void> => {
    // Simulate API calls based on action type
    switch (action.type) {
      case 'create-note':
        // Would normally make API call to create note
        await simulateAPICall('POST', '/api/notes', action.data);
        break;
      case 'update-note':
        await simulateAPICall('PUT', `/api/notes/${action.data.id}`, action.data);
        break;
      case 'delete-note':
        await simulateAPICall('DELETE', `/api/notes/${action.data.id}`);
        break;
      case 'create-task':
        await simulateAPICall('POST', '/api/tasks', action.data);
        break;
      case 'update-task':
        await simulateAPICall('PUT', `/api/tasks/${action.data.id}`, action.data);
        break;
      case 'delete-task':
        await simulateAPICall('DELETE', `/api/tasks/${action.data.id}`);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  };

  // Simulate API call with exponential backoff
  const simulateAPICall = async (method: string, url: string, data?: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      const delay = Math.random() * 1000 + 500;
      
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Network error'));
        }
      }, delay);
    });
  };

  // Clear specific action
  const removeAction = useCallback((actionId: string) => {
    setPendingActions(current => current.filter(action => action.id !== actionId));
  }, []);

  // Clear all pending actions
  const clearPendingActions = useCallback(() => {
    setPendingActions([]);
  }, []);

  // Retry failed actions
  const retryActions = useCallback(() => {
    if (isOnline) {
      syncPendingActions();
    }
  }, [isOnline, syncPendingActions]);

  return {
    isOnline,
    isPending,
    pendingActions,
    lastSync,
    queueAction,
    syncPendingActions,
    removeAction,
    clearPendingActions,
    retryActions
  };
}

// Hook for caching data
export function useOfflineCache<T>(key: string, fetchData: () => Promise<T>, ttl: number = 5 * 60 * 1000) {
  const [data, setData] = useKV<T | null>(`cache-${key}`, null);
  const [timestamp, setTimestamp] = useKV<number>(`cache-${key}-ts`, 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useOffline();

  const isStale = Date.now() - timestamp > ttl;
  const shouldFetch = isOnline && (!data || isStale);

  const fetchAndCache = useCallback(async (force = false) => {
    if (!isOnline && !force) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const newData = await fetchData();
      setData(newData);
      setTimestamp(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, isOnline, setData, setTimestamp]);

  // Auto-fetch if needed
  useEffect(() => {
    if (shouldFetch && !isLoading) {
      fetchAndCache();
    }
  }, [shouldFetch, isLoading, fetchAndCache]);

  return {
    data,
    isLoading,
    error,
    isStale,
    refresh: () => fetchAndCache(true),
    clearCache: () => {
      setData(null);
      setTimestamp(0);
    }
  };
}