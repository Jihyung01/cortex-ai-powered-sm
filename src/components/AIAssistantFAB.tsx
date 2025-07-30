import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Robot, 
  MessageCircle, 
  X,
  Lightbulb
} from '@phosphor-icons/react';
import { useAIAssistant } from '@/hooks/use-ai-assistant';
import { useAppState } from '@/hooks/use-notes';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function AIAssistantFAB() {
  const [isHovered, setIsHovered] = useState(false);
  const { currentView, setCurrentView } = useAppState();
  const { unreadInsights } = useAIAssistant();

  // Don't show on AI assistant view
  if (currentView === 'ai-assistant') {
    return null;
  }

  const handleClick = () => {
    setCurrentView('ai-assistant');
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={handleClick}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "group relative overflow-hidden"
        )}
        size="lg"
      >
        <div className="relative z-10 flex items-center justify-center">
          <Robot className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
        </div>
        
        {/* Notification badge */}
        <AnimatePresence>
          {unreadInsights.length > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1"
            >
              <Badge 
                variant="destructive" 
                className="h-6 w-6 p-0 flex items-center justify-center text-xs font-bold rounded-full"
              >
                {unreadInsights.length > 9 ? '9+' : unreadInsights.length}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-card border rounded-lg shadow-lg whitespace-nowrap"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">AI Assistant</span>
                {unreadInsights.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Lightbulb className="h-3 w-3 text-accent" />
                    <span className="text-xs text-muted-foreground">
                      {unreadInsights.length} insight{unreadInsights.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Arrow pointer */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-border" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full opacity-20">
          <div className="absolute inset-0 bg-white rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        </div>
      </Button>
    </motion.div>
  );
}