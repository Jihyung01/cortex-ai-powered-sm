import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { InteractiveTooltip } from '@/components/ui/interactive-tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { slideInLeft, staggerContainer, staggerItem, springPresets } from '@/hooks/use-motion';
import { 
  Brain, 
  FolderOpen, 
  Search, 
  Star, 
  Clock, 
  Plus, 
  FileText,
  Template,
  Menu,
  X,
  CheckSquare,
  Kanban,
  CalendarBlank,
  ChartLine,
  Timer,
  Columns,
  Robot
} from '@phosphor-icons/react';
import { useNotes, useAppState } from '@/hooks/use-notes';
import { useTasks } from '@/hooks/use-tasks';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { 
    currentView, 
    setCurrentView, 
    sidebarCollapsed, 
    setSidebarCollapsed,
    setIsCreatingNote,
    setIsCreatingTask,
    focusMode
  } = useAppState();
  const { notes, folders, getFavoriteNotes, getRecentNotes } = useNotes();
  const { tasks, getOverdueTasks, getUpcomingTasks } = useTasks();
  const isMobile = useIsMobile();

  const favoriteNotes = getFavoriteNotes();
  const recentNotes = getRecentNotes(5);
  const overdueTasks = getOverdueTasks();
  const upcomingTasks = getUpcomingTasks();
  const activeTasks = tasks.filter(task => task.status === 'in-progress');

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Brain,
      view: 'dashboard' as const,
      count: notes.length + tasks.length
    },
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      icon: Robot,
      view: 'ai-assistant' as const
    },
    {
      id: 'notes',
      label: 'All Notes',
      icon: FileText,
      view: 'notes' as const,
      count: notes.length
    },
    {
      id: 'folders',
      label: 'Folders',
      icon: FolderOpen,
      view: 'folders' as const,
      count: folders.length
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      view: 'search' as const
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: Template,
      view: 'templates' as const
    }
  ];

  const taskNavigationItems = [
    {
      id: 'tasks',
      label: 'All Tasks',
      icon: CheckSquare,
      view: 'tasks' as const,
      count: tasks.filter(task => task.status !== 'done').length,
      urgent: overdueTasks.length
    },
    {
      id: 'kanban',
      label: 'Kanban Board',
      icon: Kanban,
      view: 'kanban' as const,
      count: activeTasks.length
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: Columns,
      view: 'timeline' as const
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: CalendarBlank,
      view: 'calendar' as const,
      count: upcomingTasks.length
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: ChartLine,
      view: 'analytics' as const
    }
  ];

  const handleNewNote = () => {
    setIsCreatingNote(true);
    setCurrentView('notes');
  };

  const handleNewTask = () => {
    setIsCreatingTask(true);
    setCurrentView('tasks');
  };

  if (isMobile && sidebarCollapsed) {
    return (
      <InteractiveTooltip content="Open Menu" side="right">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springPresets.bouncy}
          className="fixed top-4 left-4 z-50"
        >
          <GlassCard variant="elevated" interactive>
            <Button
              variant="outline"
              size="icon"
              className="border-0 bg-transparent hover:bg-white/10"
              onClick={() => setSidebarCollapsed(false)}
            >
              <Menu size={20} />
            </Button>
          </GlassCard>
        </motion.div>
      </InteractiveTooltip>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isMobile && !sidebarCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springPresets.gentle}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
      </AnimatePresence>
      
      <motion.div 
        {...slideInLeft}
        className={cn(
          "h-full glass-sidebar flex flex-col",
          isMobile && !sidebarCollapsed && "fixed left-0 top-0 z-50 w-80",
          isMobile && sidebarCollapsed && "hidden",
          !isMobile && sidebarCollapsed && "w-16",
          !isMobile && !sidebarCollapsed && "w-80",
          "transition-all duration-500 ease-out",
          className
        )}
      >
        {/* Header */}
        <motion.div 
          className="p-6 border-b border-border/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...springPresets.gentle }}
        >
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={springPresets.gentle}
                  className="flex items-center gap-2"
                >
                  <motion.div 
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={springPresets.bouncy}
                  >
                    <Brain size={20} className="text-primary-foreground" />
                  </motion.div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Cortex
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
            <InteractiveTooltip 
              content={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              side="right"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-muted-foreground hover:text-foreground spring-scale"
              >
                {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
              </Button>
            </InteractiveTooltip>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="p-4 space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...springPresets.gentle }}
        >
          <InteractiveTooltip content="Create a new note" disabled={!sidebarCollapsed}>
            <AnimatedButton
              onClick={handleNewNote}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg"
              size={sidebarCollapsed ? "icon" : "default"}
            >
              <Plus size={20} />
              {!sidebarCollapsed && <span className="ml-2">New Note</span>}
            </AnimatedButton>
          </InteractiveTooltip>
          
          <InteractiveTooltip content="Create a new task" disabled={!sidebarCollapsed}>
            <AnimatedButton
              onClick={handleNewTask}
              variant="secondary"
              className={cn(
                "w-full glass-panel border-0 hover:bg-white/20",
                sidebarCollapsed ? "px-0" : ""
              )}
              size={sidebarCollapsed ? "icon" : "default"}
            >
              <CheckSquare size={20} />
              {!sidebarCollapsed && <span className="ml-2">New Task</span>}
            </AnimatedButton>
          </InteractiveTooltip>
        </motion.div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-4 scrollbar-thin">
          <motion.div 
            className="space-y-6"
            {...staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Notes Section */}
            <motion.div className="space-y-2" variants={staggerItem}>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.h3 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={springPresets.gentle}
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2"
                  >
                    Notes
                  </motion.h3>
                )}
              </AnimatePresence>
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={staggerItem}
                  custom={index}
                >
                  <InteractiveTooltip 
                    content={`${item.label}${item.count !== undefined ? ` (${item.count})` : ''}`}
                    disabled={!sidebarCollapsed}
                    side="right"
                  >
                    <Button
                      variant={currentView === item.view ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start text-left spring-scale",
                        sidebarCollapsed && "justify-center",
                        currentView === item.view && "glass-panel border-0 bg-primary/10 text-primary"
                      )}
                      onClick={() => setCurrentView(item.view)}
                    >
                      <item.icon size={20} />
                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={springPresets.gentle}
                            className="flex items-center justify-between flex-1 ml-3"
                          >
                            <span>{item.label}</span>
                            {item.count !== undefined && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, ...springPresets.bouncy }}
                              >
                                <Badge variant="secondary" className="ml-auto">
                                  {item.count}
                                </Badge>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </InteractiveTooltip>
                </motion.div>
              ))}
            </motion.div>

            {/* Tasks Section */}
            <motion.div className="space-y-2" variants={staggerItem}>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.h3 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={springPresets.gentle}
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2"
                  >
                    Tasks
                  </motion.h3>
                )}
              </AnimatePresence>
              {taskNavigationItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={staggerItem}
                  custom={index}
                >
                  <InteractiveTooltip 
                    content={`${item.label}${item.count !== undefined ? ` (${item.count})` : ''}${item.urgent ? ` - ${item.urgent} overdue` : ''}`}
                    disabled={!sidebarCollapsed}
                    side="right"
                    variant={item.urgent && item.urgent > 0 ? "warning" : "default"}
                  >
                    <Button
                      variant={currentView === item.view ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start text-left spring-scale",
                        sidebarCollapsed && "justify-center",
                        currentView === item.view && "glass-panel border-0 bg-primary/10 text-primary"
                      )}
                      onClick={() => setCurrentView(item.view)}
                    >
                      <item.icon size={20} />
                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={springPresets.gentle}
                            className="flex items-center justify-between flex-1 ml-3"
                          >
                            <span>{item.label}</span>
                            <div className="flex items-center gap-1">
                              {item.urgent && item.urgent > 0 && (
                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={springPresets.bouncy}
                                  whileHover={{ scale: 1.1 }}
                                >
                                  <Badge variant="destructive" className="text-xs">
                                    {item.urgent}
                                  </Badge>
                                </motion.div>
                              )}
                              {item.count !== undefined && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.1, ...springPresets.bouncy }}
                                >
                                  <Badge variant="secondary">
                                    {item.count}
                                  </Badge>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </InteractiveTooltip>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={springPresets.gentle}
              >
                <Separator className="my-6 bg-border/30" />
                
                {/* Quick Access */}
                <motion.div 
                  className="space-y-4"
                  {...staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {favoriteNotes.length > 0 && (
                    <motion.div variants={staggerItem}>
                      <div className="flex items-center gap-2 mb-2 px-2">
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          transition={springPresets.bouncy}
                        >
                          <Star size={16} className="text-yellow-500" />
                        </motion.div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Favorites
                        </span>
                      </div>
                      <div className="space-y-1">
                        {favoriteNotes.slice(0, 3).map((note, index) => (
                          <motion.div
                            key={note.id}
                            variants={staggerItem}
                            custom={index}
                          >
                            <GlassCard variant="panel" interactive className="p-0">
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-left h-auto py-2 px-2 border-0 bg-transparent hover:bg-white/10 spring-scale"
                                onClick={() => {
                                  setCurrentView('notes');
                                  // setSelectedNoteId(note.id);
                                }}
                              >
                                <div className="truncate">
                                  <div className="text-sm font-medium truncate">
                                    {note.title || 'Untitled'}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {note.content.slice(0, 50)}...
                                  </div>
                                </div>
                              </Button>
                            </GlassCard>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {recentNotes.length > 0 && (
                    <motion.div variants={staggerItem}>
                      <div className="flex items-center gap-2 mb-2 px-2">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          <Clock size={16} className="text-muted-foreground" />
                        </motion.div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Recent
                        </span>
                      </div>
                      <div className="space-y-1">
                        {recentNotes.slice(0, 3).map((note, index) => (
                          <motion.div
                            key={note.id}
                            variants={staggerItem}
                            custom={index}
                          >
                            <GlassCard variant="panel" interactive className="p-0">
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-left h-auto py-2 px-2 border-0 bg-transparent hover:bg-white/10 spring-scale"
                                onClick={() => {
                                  setCurrentView('notes');
                                  // setSelectedNoteId(note.id);
                                }}
                              >
                                <div className="truncate">
                                  <div className="text-sm font-medium truncate">
                                    {note.title || 'Untitled'}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {new Date(note.updatedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </Button>
                            </GlassCard>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </motion.div>
    </>
  );
}