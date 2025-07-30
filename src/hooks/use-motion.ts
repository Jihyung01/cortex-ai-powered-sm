import { useRef, useCallback } from 'react';

export const springPresets = {
  gentle: { type: 'spring', stiffness: 100, damping: 20 },
  bouncy: { type: 'spring', stiffness: 400, damping: 25 },
  snappy: { type: 'spring', stiffness: 500, damping: 30 }
};

export const pageTransitions = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: springPresets.gentle
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: springPresets.gentle
};

export function useParticles() {
  const particlesRef = useRef<HTMLDivElement>(null);

  const celebrate = useCallback((element: HTMLElement) => {
    // Particle effect logic would go here
    console.log('Celebrating!', element);
  }, []);

  return { particlesRef, celebrate };
}