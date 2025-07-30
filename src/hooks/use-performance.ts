import { useState, useEffect, useCallback, useMemo } from 'react';

export interface VirtualListItem {
  id: string;
  height: number;
  data: any;
}

export interface VirtualListOptions {
  itemHeight: number;
  overscan?: number;
  buffer?: number;
}

export function useVirtualList<T extends VirtualListItem>(
  items: T[],
  containerHeight: number,
  options: VirtualListOptions
) {
  const { itemHeight, overscan = 3, buffer = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + Math.ceil(containerHeight / itemHeight), items.length);
    
    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length, end + overscan)
    };
  }, [scrollTop, containerHeight, itemHeight, overscan, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      ...item,
      index: visibleRange.start + index,
      top: (visibleRange.start + index) * itemHeight
    }));
  }, [items, visibleRange, itemHeight]);

  // Total height for scrollbar
  const totalHeight = items.length * itemHeight;

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    visibleRange,
    handleScroll
  };
}

export function useLazyLoading() {
  const [loadedImages, setLoadedImages] = useState(new Set<string>());
  const observerRef = useState(() => 
    new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src && !loadedImages.has(src)) {
              img.src = src;
              img.onload = () => {
                setLoadedImages(prev => new Set(prev).add(src));
                observerRef[0].unobserve(img);
              };
            }
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    )
  )[0];

  const observeImage = useCallback((img: HTMLImageElement | null) => {
    if (img) {
      observerRef.observe(img);
    }
  }, [observerRef]);

  useEffect(() => {
    return () => observerRef.disconnect();
  }, [observerRef]);

  return { observeImage, loadedImages };
}

// Performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    loadTime: 0,
    renderTime: 0
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrame: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (currentTime - lastTime))
        }));
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationFrame = requestAnimationFrame(measureFPS);
    };

    animationFrame = requestAnimationFrame(measureFPS);

    // Memory usage (if available)
    if ('memory' in performance) {
      const updateMemory = () => {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1048576) // MB
        }));
      };

      const memoryInterval = setInterval(updateMemory, 5000);
      
      return () => {
        cancelAnimationFrame(animationFrame);
        clearInterval(memoryInterval);
      };
    }

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Measure component render time
  const measureRender = useCallback((componentName: string) => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const renderTime = end - start;
      
      setMetrics(prev => ({
        ...prev,
        renderTime: Math.round(renderTime * 100) / 100
      }));
      
      if (renderTime > 16) { // Longer than 60fps frame
        console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`);
      }
    };
  }, []);

  return { metrics, measureRender };
}

// Bundle splitting and code loading
export function useCodeSplitting() {
  const [loadedChunks, setLoadedChunks] = useState(new Set<string>());
  const [isLoading, setIsLoading] = useState(false);

  const loadChunk = useCallback(async (chunkName: string, loader: () => Promise<any>) => {
    if (loadedChunks.has(chunkName)) {
      return;
    }

    setIsLoading(true);
    
    try {
      await loader();
      setLoadedChunks(prev => new Set(prev).add(chunkName));
    } catch (error) {
      console.error(`Failed to load chunk ${chunkName}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [loadedChunks]);

  const preloadChunk = useCallback((chunkName: string, loader: () => Promise<any>) => {
    // Use requestIdleCallback if available
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        loadChunk(chunkName, loader);
      });
    } else {
      // Fallback to setTimeout
      setTimeout(() => {
        loadChunk(chunkName, loader);
      }, 100);
    }
  }, [loadChunk]);

  return {
    loadChunk,
    preloadChunk,
    isLoading,
    loadedChunks
  };
}

// Smooth scrolling optimization
export function useSmoothScroll() {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useState<NodeJS.Timeout | null>(null)[0];

  const smoothScrollTo = useCallback((element: HTMLElement, top: number, duration: number = 300) => {
    const start = element.scrollTop;
    const distance = top - start;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      element.scrollTop = start + distance * eased;
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        setIsScrolling(false);
      }
    };

    setIsScrolling(true);
    requestAnimationFrame(animateScroll);
  }, []);

  const handleScrollStart = useCallback(() => {
    setIsScrolling(true);
    
    if (scrollTimeoutRef) {
      clearTimeout(scrollTimeoutRef);
    }
    
    // @ts-ignore
    scrollTimeoutRef = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [scrollTimeoutRef]);

  return {
    smoothScrollTo,
    handleScrollStart,
    isScrolling
  };
}