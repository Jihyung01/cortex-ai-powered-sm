import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { AnimatedProgress, CircularProgress } from '@/components/ui/animated-progress';
import { InteractiveTooltip } from '@/components/ui/interactive-tooltip';
import { MobileOptimizedList } from '@/components/MobileOptimizedList';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  pageTransitions, 
  staggerContainer, 
  staggerItem, 
  fadeInUp, 
  springPresets 
} from '@/hooks/use-motion';
import { useParticles } from '@/hooks/use-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Brain, 
  FileText, 
  Star, 
  Clock, 
  TrendUp,
  Calendar,
  Tag as TagIcon,
  Plus
} from '@phosphor-icons/react';
import { useNotes, useAppState } from '@/hooks/use-notes';
import { NoteCard } from './NoteCard';
import { NoteEditor } from './NoteEditor';
import { getMoodColor, getMoodIcon } from '@/lib/ai';
import type { Note } from '@/lib/types';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const { 
    notes, 
    addNote, 
    updateNote, 
    deleteNote, 
    toggleFavorite,
    getFavoriteNotes, 
    getRecentNotes 
  } = useNotes();
  const { isCreatingNote, setIsCreatingNote, selectedNoteId, setSelectedNoteId } = useAppState();
  const { particlesRef, celebrate } = useParticles();
  const isMobile = useIsMobile();

  const recentNotes = getRecentNotes(6);
  const favoriteNotes = getFavoriteNotes();
  const totalNotes = notes.length;

  // Analytics
  const moodDistribution = notes.reduce((acc, note) => {
    if (note.mood) {
      acc[note.mood] = (acc[note.mood] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const allTags = notes.reduce((acc, note) => {
    note.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(allTags)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  const thisWeekNotes = notes.filter(note => {
    const noteDate = new Date(note.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return noteDate >= weekAgo;
  });

  const handleEditNote = (note: Note) => {
    setSelectedNoteId(note.id);
  };

  const handleSaveNote = (note: Note) => {
    if (selectedNoteId) {
      updateNote(note.id, note);
    } else {
      addNote(note);
    }
    setSelectedNoteId(undefined);
    setIsCreatingNote(false);
  };

  const handleCloseEditor = () => {
    setSelectedNoteId(undefined);
    setIsCreatingNote(false);
  };

  // Convert notes to mobile list format
  const mobileListItems = notes.map(note => ({
    id: note.id,
    title: note.title,
    content: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
    type: 'note' as const,
    status: 'active' as const,
    tags: note.tags,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    isStarred: note.isFavorite
  }));

  const handleItemSelect = (item: any) => {
    const note = notes.find(n => n.id === item.id);
    if (note) {
      handleEditNote(note);
    }
  };

  const handleItemUpdate = (id: string, updates: any) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      if (updates.isStarred !== undefined) {
        toggleFavorite(id);
      }
    }
  };

  const handleItemDelete = (id: string) => {
    deleteNote(id);
  };

  const selectedNote = selectedNoteId ? notes.find(n => n.id === selectedNoteId) : undefined;

  if (isCreatingNote || selectedNoteId) {
    return (
      <motion.div {...pageTransitions} className="h-full">
        <NoteEditor
          note={selectedNote}
          onSave={handleSaveNote}
          onClose={handleCloseEditor}
          className="h-full"
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      {...pageTransitions} 
      className="h-full overflow-hidden particle-container"
      ref={particlesRef}
    >
      <ScrollArea className="h-full scrollbar-thin">
        <div className={cn(
          "space-y-6",
          isMobile ? "p-4" : "p-6"
        )}>
          {/* Header */}
          <motion.div 
            className={cn(
              "flex items-center justify-between",
              isMobile && "flex-col gap-4"
            )}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPresets.gentle}
          >
            <div className={cn(isMobile && "text-center")}>
              <motion.h1 
                className={cn(
                  "font-bold flex items-center gap-3",
                  isMobile ? "text-2xl justify-center" : "text-3xl"
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, ...springPresets.bouncy }}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={springPresets.bouncy}
                >
                  <Brain size={isMobile ? 28 : 32} className="text-primary" />
                </motion.div>
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Dashboard
                </span>
              </motion.h1>
              <motion.p 
                className="text-muted-foreground mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, ...springPresets.gentle }}
              >
                Your intelligent note-taking overview
              </motion.p>
            </div>
            {!isMobile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, ...springPresets.bouncy }}
              >
                <AnimatedButton 
                  onClick={() => {
                    setIsCreatingNote(true);
                    // Add celebration effect when creating new note
                    const button = document.querySelector('[data-button="new-note"]') as HTMLElement;
                    if (button) celebrate(button);
                  }}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
                  data-button="new-note"
                >
                  <Plus size={16} className="mr-2" />
                  New Note
                </AnimatedButton>
              </motion.div>
            )}
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className={cn(
              "grid gap-4",
              isMobile ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            )}
            {...staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={staggerItem}>
              <GlassCard variant="elevated" interactive className="card-3d">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className={cn(
                      "font-medium text-muted-foreground",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      Total Notes
                    </CardTitle>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={springPresets.bouncy}
                    >
                      <FileText size={isMobile ? 14 : 16} className="text-muted-foreground" />
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    className={cn(
                      "font-bold",
                      isMobile ? "text-xl" : "text-2xl"
                    )}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, ...springPresets.bouncy }}
                  >
                    {totalNotes}
                  </motion.div>
                  <div className="text-xs text-muted-foreground">
                    {thisWeekNotes.length} this week
                  </div>
                  {!isMobile && (
                    <div className="mt-2">
                      <AnimatedProgress 
                        value={thisWeekNotes.length} 
                        max={Math.max(totalNotes, 1)} 
                        size="sm" 
                        variant="success"
                      />
                    </div>
                  )}
                </CardContent>
              </GlassCard>
            </motion.div>

            <motion.div variants={staggerItem}>
              <GlassCard variant="elevated" interactive className="card-3d">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className={cn(
                      "font-medium text-muted-foreground",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      Favorites
                    </CardTitle>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={springPresets.bouncy}
                    >
                      <Star size={isMobile ? 14 : 16} className="text-yellow-500" />
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div 
                    className={cn(
                      "font-bold",
                      isMobile ? "text-xl" : "text-2xl"
                    )}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, ...springPresets.bouncy }}
                  >
                    {favoriteNotes.length}
                  </motion.div>
                  <div className="text-xs text-muted-foreground">
                    {((favoriteNotes.length / Math.max(totalNotes, 1)) * 100).toFixed(0)}% of total
                  </div>
                  {!isMobile && (
                    <div className="mt-2">
                      <AnimatedProgress 
                        value={favoriteNotes.length} 
                        max={Math.max(totalNotes, 1)} 
                        size="sm" 
                        variant="warning"
                      />
                    </div>
                  )}
                </CardContent>
              </GlassCard>
            </motion.div>

            {!isMobile && (
              <>
                <motion.div variants={staggerItem}>
                  <GlassCard variant="elevated" interactive className="card-3d">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          This Week
                        </CardTitle>
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={springPresets.bouncy}
                        >
                          <TrendUp size={16} className="text-green-500" />
                        </motion.div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <motion.div 
                        className="text-2xl font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, ...springPresets.bouncy }}
                      >
                        {thisWeekNotes.length}
                      </motion.div>
                      <div className="text-xs text-muted-foreground">
                        Notes created
                      </div>
                      <div className="mt-2">
                        <CircularProgress 
                          value={thisWeekNotes.length} 
                          max={7} 
                          size={60}
                          strokeWidth={4}
                          variant="success"
                        />
                      </div>
                    </CardContent>
                  </GlassCard>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <GlassCard variant="elevated" interactive className="card-3d">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Active Tags
                        </CardTitle>
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={springPresets.bouncy}
                        >
                          <TagIcon size={16} className="text-muted-foreground" />
                        </motion.div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <motion.div 
                        className="text-2xl font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, ...springPresets.bouncy }}
                      >
                        {topTags.length}
                      </motion.div>
                      <div className="text-xs text-muted-foreground">
                        Unique tags
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {topTags.slice(0, 3).map(([tag], index) => (
                          <motion.div
                            key={tag}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + index * 0.1, ...springPresets.bouncy }}
                          >
                            <Badge variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </GlassCard>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Recent Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, ...springPresets.gentle }}
          >
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Clock size={20} className="text-muted-foreground" />
              </motion.div>
              <h2 className={cn(
                "font-semibold",
                isMobile ? "text-lg" : "text-xl"
              )}>
                {isMobile ? "Notes" : "Recent Notes"}
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {notes.length > 0 ? (
                isMobile ? (
                  <MobileOptimizedList
                    items={mobileListItems}
                    onItemSelect={handleItemSelect}
                    onItemUpdate={handleItemUpdate}
                    onItemDelete={handleItemDelete}
                    hasMore={false}
                    isLoading={false}
                  />
                ) : (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                    {...staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {recentNotes.map((note, index) => (
                      <motion.div key={note.id} variants={staggerItem} custom={index}>
                        <NoteCard
                          note={note}
                          onEdit={handleEditNote}
                          onDelete={deleteNote}
                          onToggleFavorite={toggleFavorite}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={springPresets.bouncy}
                >
                  <GlassCard variant="elevated" className="card-3d">
                    <CardContent className="py-8 text-center">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, ...springPresets.bouncy }}
                      >
                        <FileText size={isMobile ? 40 : 48} className="mx-auto text-muted-foreground mb-4" />
                      </motion.div>
                      <motion.h3 
                        className={cn(
                          "font-medium mb-2",
                          isMobile ? "text-base" : "text-lg"
                        )}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, ...springPresets.gentle }}
                      >
                        No notes yet
                      </motion.h3>
                      <motion.p 
                        className="text-muted-foreground mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, ...springPresets.gentle }}
                      >
                        Start your knowledge journey by creating your first note
                      </motion.p>
                      {!isMobile && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5, ...springPresets.bouncy }}
                        >
                          <AnimatedButton onClick={() => setIsCreatingNote(true)}>
                            <Plus size={16} className="mr-2" />
                            Create First Note
                          </AnimatedButton>
                        </motion.div>
                      )}
                    </CardContent>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Analytics Row - Desktop Only */}
          {!isMobile && notes.length > 0 && (
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, ...springPresets.gentle }}
            >
              <>
                {/* Mood Distribution */}
                <AnimatePresence>
                {Object.keys(moodDistribution).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={springPresets.gentle}
                  >
                    <GlassCard variant="elevated" className="card-3d">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            transition={springPresets.bouncy}
                          >
                            <Brain size={20} />
                          </motion.div>
                          Mood Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <motion.div 
                          className="space-y-3"
                          {...staggerContainer}
                          initial="initial"
                          animate="animate"
                        >
                          {Object.entries(moodDistribution).map(([mood, count], index) => {
                            const percentage = (count / totalNotes) * 100;
                            return (
                              <motion.div 
                                key={mood} 
                                className="flex items-center justify-between"
                                variants={staggerItem}
                                custom={index}
                              >
                                <div className="flex items-center gap-2">
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    transition={springPresets.gentle}
                                  >
                                    <Badge variant="outline" className={getMoodColor(mood as any)}>
                                      {getMoodIcon(mood as any)} {mood}
                                    </Badge>
                                  </motion.div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-secondary/20 rounded-full h-2 overflow-hidden">
                                    <motion.div 
                                      className="h-2 rounded-full bg-gradient-to-r from-primary to-accent" 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percentage}%` }}
                                      transition={{ delay: 0.5 + index * 0.1, ...springPresets.gentle }}
                                    />
                                  </div>
                                  <motion.span 
                                    className="text-sm text-muted-foreground w-8"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                  >
                                    {count}
                                  </motion.span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      </CardContent>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Top Tags */}
              <AnimatePresence>
                {topTags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={springPresets.gentle}
                  >
                    <GlassCard variant="elevated" className="card-3d">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            transition={springPresets.bouncy}
                          >
                            <TagIcon size={20} />
                          </motion.div>
                          Popular Tags
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <motion.div 
                          className="flex flex-wrap gap-2"
                          {...staggerContainer}
                          initial="initial"
                          animate="animate"
                        >
                          {topTags.map(([tag, count], index) => (
                            <motion.div
                              key={tag}
                              variants={staggerItem}
                              custom={index}
                              whileHover={{ scale: 1.05 }}
                              transition={springPresets.gentle}
                            >
                              <Badge variant="secondary" className="text-sm spring-scale">
                                {tag} <span className="ml-1 text-xs opacity-70">({count})</span>
                              </Badge>
                            </motion.div>
                          ))}
                        </motion.div>
                      </CardContent>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
              </>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
