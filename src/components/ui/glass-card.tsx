import { motion } from 'framer-motion';
import { Card, CardProps } from './card';
import { cn } from '@/lib/utils';

interface GlassCardProps extends CardProps {
  variant?: 'default' | 'elevated' | 'panel' | 'sidebar';
  interactive?: boolean;
}

const variants = {
  default: 'glass',
  elevated: 'glass-elevated',
  panel: 'glass-panel',
  sidebar: 'glass-sidebar'
};

export function GlassCard({ 
  className, 
  variant = 'default', 
  interactive = false,
  children,
  ...props 
}: GlassCardProps) {
  const Component = interactive ? motion.div : 'div';
  
  const motionProps = interactive ? {
    whileHover: { scale: 1.02, y: -2 },
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  } : {};

  return (
    <Component {...motionProps}>
      <Card 
        className={cn(variants[variant], className)} 
        {...props}
      >
        {children}
      </Card>
    </Component>
  );
}