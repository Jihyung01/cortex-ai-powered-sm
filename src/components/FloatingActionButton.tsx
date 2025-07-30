import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMobileGestures } from '@/hooks/use-mobile-gestures';
import { useIsMobile } from '@/hooks/use-mobile';
import { springPresets } from '@/hooks/use-motion';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  X,
  Microphone,
  Camera,
  FileText,
  Calendar,
  CheckSquare,
  Share,
  Settings
} from '@phosphor-icons/react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

interface FloatingActionButtonProps {
  onCreateNote: () => void;
  onCreateTask: () => void;
  onVoiceNote: () => void;
  onCameraNote: () => void;
  onQuickShare: () => void;
  onSettings: () => void;
}

export const FloatingActionButton = memo<FloatingActionButtonProps>(({ 
  onCreateNote,
  onCreateTask,
  onVoiceNote,
  onCameraNote,
  onQuickShare,
  onSettings
}) => {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const fabRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  // Initialize position on mobile
  useEffect(() => {
    if (isMobile) {
      setPosition({ 
        x: window.innerWidth - 80, 
        y: window.innerHeight - 200 
      });
    }
  }, [isMobile]);

  const quickActions: QuickAction[] = [
    {
      id: 'note',
      label: 'New Note',
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: onCreateNote
    },
    {
      id: 'task',
      label: 'New Task',
      icon: <CheckSquare className="w-5 h-5" />,
      color: 'bg-green-500 hover:bg-green-600',
      action: onCreateTask
    },
    {
      id: 'voice',
      label: 'Voice Note',
      icon: <Microphone className="w-5 h-5" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: onVoiceNote
    },
    {
      id: 'camera',
      label: 'Camera Note',
      icon: <Camera className="w-5 h-5" />,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: onCameraNote
    },
    {
      id: 'share',
      label: 'Quick Share',
      icon: <Share className="w-5 h-5" />,
      color: 'bg-pink-500 hover:bg-pink-600',
      action: onQuickShare
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      color: 'bg-gray-500 hover:bg-gray-600',
      action: onSettings
    }
  ];

  const { elementRef } = useMobileGestures({
    onLongPress: () => {
      if (isMobile) {
        setIsDragging(true);
        navigator.vibrate?.(50);
      }
    }
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !isDragging) return;
    
    const touch = e.touches[0];
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: position.x,
      initialY: position.y
    };
  }, [isMobile, isDragging, position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !isDragging) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragRef.current.startX;
    const deltaY = touch.clientY - dragRef.current.startY;
    
    const newX = Math.max(20, Math.min(window.innerWidth - 80, dragRef.current.initialX + deltaX));
    const newY = Math.max(80, Math.min(window.innerHeight - 80, dragRef.current.initialY + deltaY));
    
    setPosition({ x: newX, y: newY });
  }, [isMobile, isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      
      // Snap to edges on mobile
      if (isMobile) {
        const centerX = window.innerWidth / 2;
        const snapX = position.x < centerX ? 20 : window.innerWidth - 80;
        setPosition(prev => ({ ...prev, x: snapX }));
      }
    }
  }, [isDragging, isMobile, position.x]);

  const handleActionClick = useCallback((action: QuickAction) => {
    action.action();
    setIsExpanded(false);
    navigator.vibrate?.(30);
  }, []);

  const toggleExpanded = useCallback(() => {
    if (!isDragging) {
      setIsExpanded(!isExpanded);
      navigator.vibrate?.(isExpanded ? 30 : 50);
    }
  }, [isExpanded, isDragging]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isExpanded]);

  const fabStyle = isMobile ? {
    position: 'fixed' as const,
    left: position.x,
    top: position.y,
    zIndex: 50
  } : {
    position: 'fixed' as const,
    bottom: 24,
    right: 24,
    zIndex: 50
  };

  return (
    <div ref={fabRef} style={fabStyle} className="select-none">
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            style={{ zIndex: -1 }}
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className={cn(
              "absolute flex gap-3",
              isMobile ? "flex-col-reverse bottom-16 right-0" : "flex-col-reverse bottom-16 right-0"
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={springPresets.bouncy}
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { 
                    delay: index * 0.05,
                    ...springPresets.gentle
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  y: 20, 
                  scale: 0.8,
                  transition: { 
                    delay: (quickActions.length - index) * 0.03
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="p-0 overflow-hidden glass-elevated">
                  <Button
                    onClick={() => handleActionClick(action)}
                    className={cn(
                      "h-12 px-4 rounded-lg text-white border-0 transition-all duration-200",
                      action.color,
                      "shadow-lg hover:shadow-xl"
                    )}
                    size="sm"
                  >
                    <div className="flex items-center gap-2">
                      {action.icon}
                      <span className="text-sm font-medium">{action.label}</span>
                    </div>
                  </Button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div
        ref={elementRef}
        className={cn(
          "relative",
          isDragging && "cursor-grabbing"
        )}
        animate={{
          scale: isDragging ? 1.1 : 1,
          rotate: isExpanded ? 45 : 0
        }}
        transition={springPresets.gentle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Card className="p-0 overflow-hidden glass-elevated shadow-2xl">
          <Button
            onClick={toggleExpanded}
            className={cn(
              "w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground",
              "border-0 shadow-lg hover:shadow-xl transition-all duration-200",
              "active:scale-95"
            )}
            size="sm"
          >
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={springPresets.quick}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="plus"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={springPresets.quick}
                >
                  <Plus className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </Card>

        {/* Drag hint */}
        {isMobile && isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
          >
            Drag to reposition
          </motion.div>
        )}
      </motion.div>
    </div>
  );
});

FloatingActionButton.displayName = 'FloatingActionButton';