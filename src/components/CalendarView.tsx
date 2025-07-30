import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { 
  CalendarBlank, 
  CaretLeft, 
  CaretRight, 
  Clock, 
  Target,
  CheckSquare,
  Plus,
  Timer,
  AlertTriangle
} from '@phosphor-icons/react';
import { useTasks } from '@/hooks/use-tasks';
import { useAppState } from '@/hooks/use-notes';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';

export function CalendarView() {
  const { tasks, updateTask, startPomodoroSession } = useTasks();
  const { setIsCreatingTask } = useAppState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Get tasks for the selected date
  const tasksForDate = useMemo(() => {
    const dateStr = selectedDate.toDateString();
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate).toDateString() === dateStr;
    }).sort((a, b) => {
      // Sort by time if available, then by priority
      const aTime = new Date(a.dueDate!).getTime();
      const bTime = new Date(b.dueDate!).getTime();
      if (aTime !== bTime) return aTime - bTime;
      
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [tasks, selectedDate]);

  // Get tasks for the current month to show on calendar
  const monthTasks = useMemo(() => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= startOfMonth && taskDate <= endOfMonth;
    });
  }, [tasks, currentMonth]);

  // Group tasks by date for calendar display
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    monthTasks.forEach(task => {
      const dateStr = new Date(task.dueDate!).toDateString();
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(task);
    });
    return grouped;
  }, [monthTasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'border-l-gray-400';
      case 'in-progress':
        return 'border-l-blue-500';
      case 'done':
        return 'border-l-green-500';
      case 'cancelled':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-400';
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'done';
  };

  // Custom day renderer for calendar
  const dayRenderer = (date: Date) => {
    const dateStr = date.toDateString();
    const dayTasks = tasksByDate[dateStr] || [];
    const isSelected = date.toDateString() === selectedDate.toDateString();
    
    return (
      <div
        className={cn(
          "relative p-2 h-24 border border-border/20 cursor-pointer transition-colors",
          isSelected && "bg-primary/10 border-primary",
          isToday(date) && "bg-accent/20 border-accent",
          "hover:bg-muted/50"
        )}
        onClick={() => setSelectedDate(date)}
      >
        <div className="text-sm font-medium text-foreground mb-1">
          {date.getDate()}
        </div>
        
        {/* Task indicators */}
        <div className="space-y-1">
          {dayTasks.slice(0, 3).map((task, index) => (
            <div
              key={task.id}
              className={cn(
                "text-xs truncate px-1 py-0.5 rounded border-l-2",
                getStatusColor(task.status),
                task.status === 'done' && "opacity-60 line-through",
                isOverdue(task) && "bg-red-50 text-red-700"
              )}
              title={task.title}
            >
              <div className="flex items-center gap-1">
                <div className={cn("w-1.5 h-1.5 rounded-full", getPriorityColor(task.priority))} />
                <span className="truncate">{task.title}</span>
              </div>
            </div>
          ))}
          
          {dayTasks.length > 3 && (
            <div className="text-xs text-muted-foreground px-1">
              +{dayTasks.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
            <p className="text-muted-foreground">
              View and manage your tasks by date
            </p>
          </div>
          <Button onClick={() => setIsCreatingTask(true)}>
            <Plus size={20} />
            <span className="ml-2">New Task</span>
          </Button>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <CaretLeft size={20} />
              </Button>
              <h2 className="text-lg font-semibold min-w-[200px] text-center">
                {currentMonth.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <CaretRight size={20} />
              </Button>
            </div>
            <Button variant="outline" onClick={handleToday}>
              Today
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode buttons */}
            <div className="flex rounded-lg border border-border">
              {['month', 'week', 'day'].map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  className="rounded-none first:rounded-l-lg last:rounded-r-lg"
                  onClick={() => setViewMode(mode as any)}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Calendar Grid */}
        <div className="flex-1 p-6">
          <div className="h-full flex flex-col">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-0 border border-border rounded-lg overflow-hidden">
              {(() => {
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth();
                const firstDay = new Date(year, month, 1);
                const lastDay = new Date(year, month + 1, 0);
                const startDate = new Date(firstDay);
                startDate.setDate(startDate.getDate() - firstDay.getDay());
                
                const days = [];
                const currentDate = new Date(startDate);
                
                for (let i = 0; i < 42; i++) {
                  days.push(new Date(currentDate));
                  currentDate.setDate(currentDate.getDate() + 1);
                }
                
                return days.map((date, index) => (
                  <div
                    key={index}
                    className={cn(
                      date.getMonth() !== month && "opacity-30"
                    )}
                  >
                    {dayRenderer(date)}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Task Panel */}
        <div className="w-80 border-l border-border/50 bg-card/30">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold text-foreground">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            <p className="text-sm text-muted-foreground">
              {tasksForDate.length} task{tasksForDate.length !== 1 ? 's' : ''}
            </p>
          </div>

          <ScrollArea className="h-[calc(100%-80px)]">
            <div className="p-4 space-y-3">
              {tasksForDate.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarBlank size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No tasks for this date</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsCreatingTask(true)}
                  >
                    <Plus size={16} />
                    <span className="ml-2">Add Task</span>
                  </Button>
                </div>
              ) : (
                tasksForDate.map((task) => (
                  <Card 
                    key={task.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md border-l-4",
                      getStatusColor(task.status),
                      task.status === 'done' && "opacity-75",
                      isOverdue(task) && "bg-red-50 border-red-200"
                    )}
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={cn(
                          "font-semibold text-sm",
                          task.status === 'done' && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          <div className={cn("w-2 h-2 rounded-full", getPriorityColor(task.priority))} />
                          {isOverdue(task) && (
                            <AlertTriangle size={16} className="text-red-500" />
                          )}
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {task.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {task.tags.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{task.tags.length - 2}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {task.estimatedTime && (
                            <Badge variant="outline" className="text-xs">
                              <Clock size={10} className="mr-1" />
                              {Math.round(task.estimatedTime / 60)}h
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              startPomodoroSession(task.id);
                            }}
                          >
                            <Timer size={12} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", getPriorityColor(selectedTask.priority))} />
                {selectedTask.title}
                {isOverdue(selectedTask) && (
                  <Badge variant="destructive">Overdue</Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedTask.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedTask.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Status</h4>
                  <Badge variant="outline">{selectedTask.status}</Badge>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Priority</h4>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", getPriorityColor(selectedTask.priority))} />
                    <span className="capitalize">{selectedTask.priority}</span>
                  </div>
                </div>
              </div>
              
              {selectedTask.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    updateTask(selectedTask.id, { 
                      status: selectedTask.status === 'done' ? 'todo' : 'done' 
                    });
                    setSelectedTask(null);
                  }}
                >
                  {selectedTask.status === 'done' ? 'Mark Incomplete' : 'Mark Complete'}
                </Button>
                <Button
                  onClick={() => {
                    startPomodoroSession(selectedTask.id);
                    setSelectedTask(null);
                  }}
                >
                  <Timer size={16} />
                  <span className="ml-2">Start Pomodoro</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}