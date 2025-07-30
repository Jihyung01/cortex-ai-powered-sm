import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { springPresets, fadeInScale } from '@/hooks/use-motion';
import { Info, AlertCircle, CheckCircle, XCircle } from '@phosphor-icons/react';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'default' | 'info' | 'warning' | 'success' | 'error';
  delay?: number;
  disabled?: boolean;
}

export const InteractiveTooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  variant = 'default',
  delay = 500,
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (disabled) return;
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const variants = {
    default: 'bg-popover text-popover-foreground border-border',
    info: 'bg-blue-50 text-blue-900 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    success: 'bg-green-50 text-green-900 border-green-200',
    error: 'bg-red-50 text-red-900 border-red-200'
  };

  const icons = {
    default: null,
    info: <Info size={14} />,
    warning: <AlertCircle size={14} />,
    success: <CheckCircle size={14} />,
    error: <XCircle size={14} />
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent'
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            {...fadeInScale}
            transition={springPresets.gentle}
            className={cn(
              'absolute z-50 px-3 py-2 text-sm rounded-lg border shadow-lg',
              'backdrop-blur-sm max-w-xs whitespace-normal',
              positions[side],
              variants[variant]
            )}
          >
            <div className="flex items-center gap-2">
              {icons[variant]}
              {typeof content === 'string' ? (
                <span>{content}</span>
              ) : (
                content
              )}
            </div>
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-0 h-0 border-4',
                arrows[side],
                variant === 'default' && 'border-popover',
                variant === 'info' && 'border-blue-50',
                variant === 'warning' && 'border-yellow-50',
                variant === 'success' && 'border-green-50',
                variant === 'error' && 'border-red-50'
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};