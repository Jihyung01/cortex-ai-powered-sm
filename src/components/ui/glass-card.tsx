import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { springPresets, hoverLift } from '@/hooks/use-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'elevated' | 'panel' | 'sidebar';
  interactive?: boolean;
  children: React.ReactNode;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = 'default', interactive = false, className, children, ...props }, ref) => {
    const variants = {
      default: 'glass-card',
      elevated: 'glass-elevated',
      panel: 'glass-panel',
      sidebar: 'glass-sidebar'
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          variants[variant],
          'rounded-xl relative overflow-hidden',
          interactive && 'cursor-pointer',
          className
        )}
        {...(interactive && hoverLift)}
        transition={springPresets.gentle}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';