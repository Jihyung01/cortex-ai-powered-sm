import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface InteractiveTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function InteractiveTooltip({ 
  content, 
  children, 
  side = 'top',
  delay = 200
}: InteractiveTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TooltipProvider delayDuration={delay}>
      <Tooltip open={isVisible} onOpenChange={setIsVisible}>
        <TooltipTrigger asChild>
          <motion.div
            onHoverStart={() => setIsVisible(true)}
            onHoverEnd={() => setIsVisible(false)}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {children}
          </motion.div>
        </TooltipTrigger>
        <AnimatePresence>
          {isVisible && (
            <TooltipContent 
              side={side}
              asChild
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                {content}
              </motion.div>
            </TooltipContent>
          )}
        </AnimatePresence>
      </Tooltip>
    </TooltipProvider>
  );
}