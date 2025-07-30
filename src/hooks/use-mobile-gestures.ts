import { useEffect, useRef, useState } from 'react';
import { useGestureSupport } from './use-accessibility';

export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  element: HTMLElement;
}

export interface GestureOptions {
  threshold?: number;
  velocityThreshold?: number;
  preventScroll?: boolean;
  onSwipe?: (gesture: SwipeGesture) => void;
  onPullToRefresh?: () => void;
  onLongPress?: (event: TouchEvent) => void;
}

export function useMobileGestures(options: GestureOptions = {}) {
  const {
    threshold = 50,
    velocityThreshold = 0.3,
    preventScroll = false,
    onSwipe,
    onPullToRefresh,
    onLongPress
  } = options;

  const { prefersReducedMotion } = useGestureSupport();
  const elementRef = useRef<HTMLElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pullThreshold = 80;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let startY = 0;
    let currentY = 0;
    let isScrolling = false;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startY = touch.clientY;
      currentY = touch.clientY;
      isScrolling = false;
      setIsPressed(true);

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };

      // Setup long press detection
      if (onLongPress && !prefersReducedMotion) {
        longPressTimeoutRef.current = setTimeout(() => {
          onLongPress(e);
          navigator.vibrate?.(50); // Haptic feedback
        }, 500);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      const deltaY = touch.clientY - startY;
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      
      currentY = touch.clientY;

      // Determine if we're scrolling
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
        isScrolling = true;
      }

      // Clear long press if moved
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }

      // Pull to refresh logic
      if (deltaY > 0 && element.scrollTop === 0 && onPullToRefresh && !prefersReducedMotion) {
        e.preventDefault();
        setIsPulling(true);
        setPullDistance(Math.min(deltaY, pullThreshold * 1.5));
      }

      if (preventScroll && isScrolling) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const time = Date.now() - touchStartRef.current.time;
      const velocity = distance / time;

      setIsPressed(false);

      // Clear long press timeout
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }

      // Handle pull to refresh
      if (isPulling) {
        if (pullDistance >= pullThreshold && onPullToRefresh) {
          onPullToRefresh();
          navigator.vibrate?.(100); // Success haptic
        }
        setIsPulling(false);
        setPullDistance(0);
      }

      // Handle swipe gestures
      if (distance >= threshold && velocity >= velocityThreshold && onSwipe && !prefersReducedMotion) {
        let direction: SwipeGesture['direction'];
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        onSwipe({
          direction,
          distance,
          velocity,
          element
        });

        // Haptic feedback for swipe
        navigator.vibrate?.(30);
      }

      touchStartRef.current = null;
    };

    const handleTouchCancel = () => {
      setIsPressed(false);
      setIsPulling(false);
      setPullDistance(0);
      touchStartRef.current = null;

      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
      
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, [threshold, velocityThreshold, preventScroll, onSwipe, onPullToRefresh, onLongPress, prefersReducedMotion, isPulling, pullDistance]);

  return {
    elementRef,
    isPressed,
    isPulling,
    pullDistance,
    pullThreshold
  };
}

export function useInfiniteScroll<T>(
  items: T[],
  loadMore: () => Promise<void>,
  hasMore: boolean = true,
  threshold: number = 200
) {
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadingElement = loadingRef.current;
    if (!loadingElement || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      async (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoading && hasMore) {
          setIsLoading(true);
          try {
            await loadMore();
          } finally {
            setIsLoading(false);
          }
        }
      },
      { 
        threshold: 0.1,
        rootMargin: `${threshold}px`
      }
    );

    observerRef.current.observe(loadingElement);

    return () => {
      if (observerRef.current && loadingElement) {
        observerRef.current.unobserve(loadingElement);
      }
    };
  }, [loadMore, hasMore, isLoading, threshold]);

  return {
    loadingRef,
    isLoading
  };
}