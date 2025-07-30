import { useCallback, useRef } from 'react';
import { Variants } from 'framer-motion';

// Spring physics presets
export const springPresets = {
  gentle: { type: "spring", stiffness: 120, damping: 14 },
  bouncy: { type: "spring", stiffness: 400, damping: 17 },
  wobbly: { type: "spring", stiffness: 180, damping: 12 },
  stiff: { type: "spring", stiffness: 400, damping: 40 },
  slow: { type: "spring", stiffness: 60, damping: 14 },
} as const;

// Common animation variants
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: springPresets.gentle },
  exit: { opacity: 0, y: -20, transition: springPresets.gentle }
};

export const fadeInScale: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: springPresets.bouncy },
  exit: { opacity: 0, scale: 0.8, transition: springPresets.gentle }
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0, transition: springPresets.gentle },
  exit: { opacity: 0, x: 40, transition: springPresets.gentle }
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: springPresets.gentle },
  exit: { opacity: 0, x: -40, transition: springPresets.gentle }
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: springPresets.gentle },
  exit: { opacity: 0, y: -20, transition: springPresets.gentle }
};

export const hoverScale = {
  whileHover: { scale: 1.02, transition: springPresets.gentle },
  whileTap: { scale: 0.98, transition: springPresets.stiff }
};

export const hoverLift = {
  whileHover: { 
    y: -2, 
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
    transition: springPresets.gentle 
  },
  whileTap: { 
    y: 0, 
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    transition: springPresets.stiff 
  }
};

// Hook for particle effects
export const useParticles = () => {
  const particlesRef = useRef<HTMLDivElement>(null);

  const createParticle = useCallback((x: number, y: number, color?: string) => {
    if (!particlesRef.current) return;

    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.background = color || 'var(--accent)';
    
    particlesRef.current.appendChild(particle);
    
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 2000);
  }, []);

  const celebrate = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create multiple particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 30 + Math.random() * 20;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      setTimeout(() => {
        createParticle(x, y);
      }, i * 50);
    }
  }, [createParticle]);

  return { particlesRef, createParticle, celebrate };
};

// Custom easing curves
export const easings = {
  easeOutCubic: [0.215, 0.61, 0.355, 1],
  easeInOutCubic: [0.645, 0.045, 0.355, 1],
  easeOutQuart: [0.25, 1, 0.5, 1],
  easeInOutQuart: [0.76, 0, 0.24, 1],
  easeOutBack: [0.175, 0.885, 0.32, 1.275],
  easeInOutBack: [0.68, -0.6, 0.32, 1.6]
} as const;

// Page transition variants
export const pageTransitions: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: easings.easeOutCubic
    }
  },
  exit: { 
    opacity: 0, 
    scale: 1.04,
    transition: { 
      duration: 0.3,
      ease: easings.easeInOutCubic
    }
  }
};

// Modal/Dialog transitions
export const modalTransitions: Variants = {
  initial: { opacity: 0, scale: 0.8, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: springPresets.bouncy
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: 20,
    transition: springPresets.gentle
  }
};

// Notification transitions
export const notificationTransitions: Variants = {
  initial: { opacity: 0, x: 300, scale: 0.8 },
  animate: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: springPresets.bouncy
  },
  exit: { 
    opacity: 0, 
    x: 300, 
    scale: 0.8,
    transition: springPresets.gentle
  }
};