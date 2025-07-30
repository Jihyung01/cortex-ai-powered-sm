import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageCircle } from '@phosphor-icons/react';

export function AIAssistantFAB() {
  return (
    <motion.div
      className="fixed bottom-24 right-6 z-40"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1 }}
    >
      <Button
        size="icon"
        className="w-12 h-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
      >
        <MessageCircle size={20} />
      </Button>
    </motion.div>
  );
}