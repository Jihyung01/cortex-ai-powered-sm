import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { InteractiveTooltip } from '@/components/ui/interactive-tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, springPresets, hoverLift } from '@/hooks/use-motion';
import { useParticles } from '@/hooks/use-motion';
import { 
  Star, 
  StarFilled, 
  Trash, 
  Edit,
  Calendar,
  Tag as TagIcon
} from '@phosphor-icons/react';
import { getMoodColor, getMoodIcon } from '@/lib/ai';
import { cn } from '@/lib/utils';
import type { Note } from '@/lib/types';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  className?: string;
}

export function NoteCard({ 
  note, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  className 
}: NoteCardProps) {
  const { celebrate } = useParticles();

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const getPreviewText = (content: string, maxLength = 120) => {
    const text = content.replace(/[#*`]/g, '').trim();
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(note.id);
    // Add celebration effect when favoriting
    if (!note.isFavorite) {
      celebrate(e.currentTarget as HTMLElement);
    }
  };

  return (
    <motion.div
      {...fadeInUp}
      whileHover="hover"
      className={className}
    >
      <GlassCard 
        variant="elevated" 
        interactive
        className="group cursor-pointer card-3d overflow-hidden"
        onClick={() => onEdit(note)}
        {...hoverLift}
      >
        <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <motion.h3 
              className="font-semibold text-base leading-tight truncate mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={springPresets.gentle}
            >
              {note.title || 'Untitled'}
            </motion.h3>
            <motion.div 
              className="flex items-center gap-2 text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, ...springPresets.gentle }}
            >
              <Calendar size={14} />
              <span>{formatDate(note.updatedAt)}</span>
              <AnimatePresence>
                {note.mood && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={springPresets.bouncy}
                  >
                    <Badge variant="outline" className={cn("text-xs", getMoodColor(note.mood))}>
                      {getMoodIcon(note.mood)}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
          
          <motion.div 
            className="flex items-center gap-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 0, x: 0 }}
            whileHover={{ opacity: 1 }}
            transition={springPresets.gentle}
          >
            <InteractiveTooltip content={note.isFavorite ? "Remove from favorites" : "Add to favorites"}>
              <AnimatedButton
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/20"
                onClick={handleFavoriteClick}
              >
                <AnimatePresence mode="wait">
                  {note.isFavorite ? (
                    <motion.div
                      key="filled"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={springPresets.bouncy}
                    >
                      <StarFilled size={16} className="text-yellow-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="outline"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={springPresets.gentle}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Star size={16} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </AnimatedButton>
            </InteractiveTooltip>
            
            <InteractiveTooltip content="Edit note">
              <AnimatedButton
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(note);
                }}
              >
                <Edit size={16} />
              </AnimatedButton>
            </InteractiveTooltip>
            
            <InteractiveTooltip content="Delete note" variant="error">
              <AnimatedButton
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
              >
                <Trash size={16} />
              </AnimatedButton>
            </InteractiveTooltip>
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Content Preview */}
        <AnimatePresence>
          {note.content && (
            <motion.p 
              className="text-sm text-muted-foreground leading-relaxed mb-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={springPresets.gentle}
            >
              {getPreviewText(note.content)}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Summary */}
        <AnimatePresence>
          {note.summary && (
            <motion.div 
              className="mb-3 p-2 rounded-md glass-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={springPresets.bouncy}
            >
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Brain size={12} />
                </motion.div>
                AI Summary
              </div>
              <p className="text-sm">{note.summary}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tags */}
        <AnimatePresence>
          {note.tags.length > 0 && (
            <motion.div 
              className="flex items-center gap-2 flex-wrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.2, ...springPresets.gentle }}
            >
              <TagIcon size={14} className="text-muted-foreground" />
              {note.tags.slice(0, 3).map((tag, index) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, ...springPresets.bouncy }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge variant="outline" className="text-xs spring-scale">
                    {tag}
                  </Badge>
                </motion.div>
              ))}
              {note.tags.length > 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, ...springPresets.bouncy }}
                >
                  <Badge variant="outline" className="text-xs">
                    +{note.tags.length - 3} more
                  </Badge>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category */}
        <AnimatePresence>
          {note.category && (
            <motion.div 
              className="mt-2 flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.3, ...springPresets.gentle }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={springPresets.gentle}
              >
                <Badge variant="secondary" className="text-xs spring-scale">
                  {note.category}
                </Badge>
              </motion.div>
              <div className="text-xs text-muted-foreground">
                {note.content.split(/\s+/).filter(word => word.length > 0).length} words
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </GlassCard>
  </motion.div>
  );
}