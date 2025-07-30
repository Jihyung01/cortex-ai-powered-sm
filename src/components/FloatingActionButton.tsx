import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  FileText, 
  CheckSquare, 
  Microphone, 
  Camera, 
  Share, 
  Settings 
} from '@phosphor-icons/react';

interface FloatingActionButtonProps {
  onCreateNote: () => void;
  onCreateTask: () => void;
  onVoiceNote: () => void;
  onCameraNote: () => void;
  onQuickShare: () => void;
  onSettings: () => void;
}

export function FloatingActionButton({
  onCreateNote,
  onCreateTask,
  onVoiceNote,
  onCameraNote,
  onQuickShare,
  onSettings
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    { icon: FileText, label: 'Note', action: onCreateNote },
    { icon: CheckSquare, label: 'Task', action: onCreateTask },
    { icon: Microphone, label: 'Voice', action: onVoiceNote },
    { icon: Camera, label: 'Camera', action: onCameraNote },
    { icon: Share, label: 'Share', action: onQuickShare },
    { icon: Settings, label: 'Settings', action: onSettings },
  ];

  return (
    <motion.div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="flex flex-col-reverse gap-3 mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="text-sm font-medium bg-card px-2 py-1 rounded shadow-lg">
                  {action.label}
                </span>
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-10 h-10 rounded-full shadow-lg"
                  onClick={() => {
                    action.action();
                    setIsExpanded(false);
                  }}
                >
                  <action.icon size={16} />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus size={24} />
        </motion.div>
      </Button>
    </motion.div>
  );
}