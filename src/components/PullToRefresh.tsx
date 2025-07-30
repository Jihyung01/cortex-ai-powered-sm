import { ReactNode, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  disabled?: boolean;
  threshold?: number;
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  disabled = false, 
  threshold = 80 
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    startY.current = e.touches[0].clientY;
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || !containerRef.current) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    // Only trigger pull-to-refresh when at top of scroll
    if (containerRef.current.scrollTop === 0 && diff > 0) {
      e.preventDefault();
      const distance = Math.min(diff, threshold * 1.5);
      setPullDistance(distance);
      setIsPulling(distance > threshold);
    }
  }, [disabled, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled) return;
    
    if (isPulling && pullDistance > threshold) {
      await onRefresh();
    }
    
    setIsPulling(false);
    setPullDistance(0);
  }, [disabled, isPulling, pullDistance, threshold, onRefresh]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="flex items-center justify-center py-4"
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: pullDistance > 0 ? '60px' : '0px',
          opacity: pullDistance > 0 ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          animate={{ rotate: isPulling ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-muted-foreground"
        >
          {isPulling ? '↑' : '↓'}
        </motion.div>
        <span className="ml-2 text-sm text-muted-foreground">
          {isPulling ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </motion.div>
      
      {children}
    </div>
  );
}