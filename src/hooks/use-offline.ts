import { useState, useCallback } from 'react';

export function useOffline() {
  const [pendingActions, setPendingActions] = useState<any[]>([]);

  const queueAction = useCallback((type: string, data: any) => {
    setPendingActions(prev => [...prev, { type, data, timestamp: Date.now() }]);
  }, []);

  const syncPendingActions = useCallback(async () => {
    // Sync logic would go here
    setPendingActions([]);
  }, []);

  const isOnline = navigator.onLine;

  return {
    queueAction,
    syncPendingActions,
    isOnline,
    pendingActions
  };
}