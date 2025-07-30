import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Columns, 
  CaretLeft, 
  CaretRight, 
  CalendarBlank,
  Clock,
  CheckSquare,
  Plus,
  Filter,
  Target,
  Timer,
  Flag
} from '@phosphor-icons/react';
import { useTasks } from '@/hooks/use-tasks';
import { useAppState } from '@/hooks/use-notes';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Task } from '@/lib/types';

export function TimelineView() {
  const { tasks, projects, getSubtasks, updateTask } = useTasks();
  const { setIsCreatingTask } = useAppState();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [currentPeriod, setCurrentPeriod] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [showMilestones, setShowMilestones] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Calculate time range
  const { startDate, endDate, periodTitle } = useMemo(() => {
    const now = new Date(currentPeriod);
    let start: Date;
    let end: Date;
    let title: string;

    switch (timeRange) {
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        end = new Date(start);
        end.setDate(start.getDate() + 6); // End of week (Saturday)
        title = `Week of ${start.toLocaleDateString()}`;
        break;
      
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        title = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        break;
      
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        title = `Q${quarter + 1} ${now.getFullYear()}`;
        break;
      
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        title = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    return { startDate: start, endDate: end, periodTitle: title };
  }, [currentPeriod, timeRange]);

  // Filter and organize tasks
  const timelineTasks = useMemo(() => {
    let filteredTasks = tasks.filter(task => 
      !task.parentId && // Only show top-level tasks
      (task.dueDate || task.startDate) // Must have some date
    );

    // Filter by project if selected
    if (selectedProject !== 'all') {
      const project = projects.find(p => p.id === selectedProject);
      if (project) {
        filteredTasks = filteredTasks.filter(task => 
          project.taskIds.includes(task.id)
        );
      }
    }

    // Sort by start date, then due date
    return filteredTasks.sort((a, b) => {
      const aStart = a.startDate || a.createdAt;
      const bStart = b.startDate || b.createdAt;
      return new Date(aStart).getTime() - new Date(bStart).getTime();
    });
  }, [tasks, projects, selectedProject]);

  // Generate time grid
  const timeGrid = useMemo(() => {
    const grid = [];
    const current = new Date(startDate);
    const increment = timeRange === 'week' ? 1 : timeRange === 'month' ? 1 : 7; // days
    const unit = timeRange === 'quarter' ? 'week' : 'day';

    while (current <= endDate) {
      grid.push({
        date: new Date(current),
        label: unit === 'week' 
          ? `Week ${Math.ceil((current.getDate()) / 7)}`
          : current.getDate().toString()
      });
      
      if (unit === 'week') {
        current.setDate(current.getDate() + 7);
      } else {
        current.setDate(current.getDate() + increment);
      }
    }

    return grid;
  }, [startDate, endDate, timeRange]);

  // Calculate task bar positions and widths
  const getTaskBarStyle = (task: Task) => {
    const taskStart = task.startDate ? new Date(task.startDate) : new Date(task.createdAt);
    const taskEnd = task.dueDate ? new Date(task.dueDate) : new Date(taskStart.getTime() + 7 * 24 * 60 * 60 * 1000); // Default 7 days if no due date

    const totalDuration = endDate.getTime() - startDate.getTime();
    const taskStartOffset = Math.max(0, taskStart.getTime() - startDate.getTime());
    const taskDuration = Math.min(taskEnd.getTime(), endDate.getTime()) - Math.max(taskStart.getTime(), startDate.getTime());

    const leftPercent = (taskStartOffset / totalDuration) * 100;
    const widthPercent = Math.max(2, (taskDuration / totalDuration) * 100); // Minimum 2% width

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      opacity: task.status === 'done' ? 0.7 : 1
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-400';
      case 'in-progress':
        return 'bg-blue-500';
      case 'done':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

  const handlePreviousPeriod = () => {
    const newDate = new Date(currentPeriod);
    switch (timeRange) {
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() - 3);
        break;
    }
    setCurrentPeriod(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(currentPeriod);
    switch (timeRange) {
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + 3);
        break;
    }
    setCurrentPeriod(newDate);
  };

  const handleToday = () => {
    setCurrentPeriod(new Date());
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'done';
  };

  const getTaskProgress = (task: Task) => {
    const subtasks = getSubtasks(task.id);
    if (subtasks.length === 0) {
      return task.status === 'done' ? 100 : task.status === 'in-progress' ? 50 : 0;
    }
    
    const completed = subtasks.filter(st => st.status === 'done').length;
    return (completed / subtasks.length) * 100;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Timeline</h1>
            <p className="text-muted-foreground">
              Gantt-style view of your tasks and projects
            </p>
          </div>
          <Button onClick={() => setIsCreatingTask(true)}>
            <Plus size={20} />
            <span className="ml-2">New Task</span>
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Time Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousPeriod}>
                <CaretLeft size={20} />
              </Button>
              <h2 className="text-lg font-semibold min-w-[200px] text-center">
                {periodTitle}
              </h2>
              <Button variant="outline" size="icon" onClick={handleNextPeriod}>
                <CaretRight size={20} />
              </Button>
            </div>
            <Button variant="outline" onClick={handleToday}>
              Today
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
              </SelectContent>
            </Select>

            {/* Project Filter */}
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Options */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMilestones(!showMilestones)}
              className={cn(showMilestones && "bg-secondary")}
            >
              <Flag size={16} />
              <span className="ml-2">Milestones</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 flex flex-col">
        {/* Time Grid Header */}
        <div className="flex border-b border-border/50 bg-muted/30">
          <div className="w-80 p-4 border-r border-border/50">
            <h3 className="font-semibold text-foreground">Tasks</h3>
          </div>
          <div className="flex-1 flex">
            {timeGrid.map((timePoint, index) => (
              <div
                key={index}
                className="flex-1 p-4 border-r border-border/20 text-center"
              >
                <div className="text-sm font-medium text-foreground">
                  {timePoint.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {timeRange !== 'quarter' && timePoint.date.toLocaleDateString('en-US', { 
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Body */}
        <ScrollArea className="flex-1">
          <div className="relative">
            {/* Today Line */}
            {(() => {
              const today = new Date();
              if (today >= startDate && today <= endDate) {
                const totalDuration = endDate.getTime() - startDate.getTime();
                const todayOffset = (today.getTime() - startDate.getTime()) / totalDuration * 100;
                return (
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ left: `calc(320px + ${todayOffset}%)` }}
                    title="Today"
                  />
                );
              }
              return null;
            })()}

            {/* Task Rows */}
            {timelineTasks.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Columns size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No tasks in timeline</h3>
                  <p className="text-muted-foreground mb-4">
                    Add tasks with due dates to see them in the timeline
                  </p>
                  <Button onClick={() => setIsCreatingTask(true)}>
                    <Plus size={20} />
                    <span className="ml-2">Create Task</span>
                  </Button>
                </div>
              </div>
            ) : (
              timelineTasks.map((task) => {
                const subtasks = getSubtasks(task.id);
                const progress = getTaskProgress(task);
                
                return (
                  <div key={task.id} className="flex border-b border-border/20 hover:bg-muted/20">
                    {/* Task Info */}
                    <div className="w-80 p-4 border-r border-border/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className={cn(
                            "font-semibold text-sm mb-1",
                            task.status === 'done' && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getStatusColor(task.status))}
                            >
                              {task.status}
                            </Badge>
                            <div className={cn("w-2 h-2 rounded-full", getPriorityColor(task.priority))} />
                            {isOverdue(task) && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                          </div>
                          
                          {/* Task Metadata */}
                          <div className="space-y-1 text-xs text-muted-foreground">
                            {task.estimatedTime && (
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{Math.round(task.estimatedTime / 60)}h estimated</span>
                              </div>
                            )}
                            {subtasks.length > 0 && (
                              <div className="flex items-center gap-1">
                                <CheckSquare size={12} />
                                <span>{subtasks.filter(st => st.status === 'done').length}/{subtasks.length} subtasks</span>
                              </div>
                            )}
                            {task.dueDate && (
                              <div className="flex items-center gap-1">
                                <CalendarBlank size={12} />
                                <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      {progress > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-1" />
                        </div>
                      )}
                    </div>

                    {/* Timeline Bar */}
                    <div className="flex-1 relative p-4">
                      <div className="relative h-8">
                        {/* Task Bar */}
                        <div
                          className={cn(
                            "absolute top-1 h-6 rounded-md cursor-pointer transition-all",
                            getStatusColor(task.status),
                            "hover:shadow-md"
                          )}
                          style={getTaskBarStyle(task)}
                          onClick={() => setSelectedTask(task)}
                          title={`${task.title} (${task.status})`}
                        >
                          <div className="px-2 py-1 h-full flex items-center">
                            <span className="text-white text-xs font-medium truncate">
                              {task.title}
                            </span>
                          </div>
                          
                          {/* Progress overlay */}
                          {progress > 0 && progress < 100 && (
                            <div 
                              className="absolute top-0 left-0 h-full bg-white/30 rounded-md"
                              style={{ width: `${progress}%` }}
                            />
                          )}
                        </div>

                        {/* Milestone markers */}
                        {showMilestones && task.dueDate && (
                          <div
                            className="absolute top-0 w-0.5 h-8 bg-orange-500"
                            style={{
                              left: `${((new Date(task.dueDate).getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100}%`
                            }}
                            title={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                          >
                            <div className="absolute -top-1 -left-1 w-3 h-3 bg-orange-500 transform rotate-45" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Status</h4>
                  <Badge className={getStatusColor(selectedTask.status)}>
                    {selectedTask.status}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Priority</h4>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", getPriorityColor(selectedTask.priority))} />
                    <span className="capitalize">{selectedTask.priority}</span>
                  </div>
                </div>
              </div>

              {selectedTask.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedTask.description}</p>
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
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}