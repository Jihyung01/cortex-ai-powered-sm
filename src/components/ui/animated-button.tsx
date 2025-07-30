import { motion } from 'framer-motion';
import { Button, ButtonProps } from './button';
import { springPresets } from '@/hooks/use-motion';

interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export function AnimatedButton({ children, className, ...props }: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={springPresets.bouncy}
    >
      <Button className={className} {...props}>
        {children}
      </Button>
    </motion.div>
  );
}