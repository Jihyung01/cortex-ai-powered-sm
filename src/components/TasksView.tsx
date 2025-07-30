import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { MultiSelect } from '@/components/ui/multi-select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckSquare, 
  Circle, 
  Clock, 
  AlertTriangle,
  Brain,
  Timer,
  Target,
  Lightbulb,
  X,
  Calendar,
  Tag,
  ArrowDown,
  ArrowUp,
  Minus,
  Play,
  Pause,
  Check,
  Trash,
  Link,
  Sparkle
} from '@phosphor-icons/react';
import { useTasks, useTaskFilters } from '@/hooks/use-tasks';
import { useAppState } from '@/hooks/use-notes';
import { useNotes } from '@/hooks/use-notes';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Task } from '@/lib/types';

export function TasksView() {
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    completeTask,
    addSubtask,
    estimateTaskTime,
    calculateAIPriority,
    breakdownLargeTask,
    parseNaturalLanguageTask,
    getSubtasks,
    linkTaskToNote,
    startPomodoroSession
  } = useTasks();
  
  const { filteredTasks, filters, updateFilters, clearFilters, allTaskTags } = useTaskFilters();
  const { isCreatingTask, setIsCreatingTask, selectedTaskId, setSelectedTaskId } = useAppState();
  const { notes } = useNotes();
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    complexity: 'moderate' as const,
    dueDate: undefined as Date | undefined,
    tags: [] as string[],
    naturalLanguage: false
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Auto-save draft task
  useEffect(() => {
    if (newTask.title) {
      // Save draft to localStorage
      localStorage.setItem('cortex-draft-task', JSON.stringify(newTask));
    }
  }, [newTask]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('cortex-draft-task');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setNewTask(parsed);
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, []);

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      let taskData;
      
      if (newTask.naturalLanguage) {
        // Parse natural language input
        taskData = await parseNaturalLanguageTask(newTask.title);
        taskData.description = newTask.description || taskData.description;
      } else {
        taskData = {
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          dueDate: newTask.dueDate,
          tags: newTask.tags
        };
      }

      // Estimate time if not provided
      const estimatedTime = await estimateTaskTime({
        title: taskData.title,
        description: taskData.description,
        complexity: newTask.complexity
      });

      // Calculate AI priority
      const aiPriority = await calculateAIPriority({
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        complexity: newTask.complexity
      });

      const task = addTask({
        ...taskData,
        status: 'todo',
        complexity: newTask.complexity,
        estimatedTime,
        aiPriority,
        tags: taskData.tags || []
      });

      // If task seems complex, offer to break it down
      if (newTask.complexity === 'complex' || (taskData.description && taskData.description.length > 100)) {
        const shouldBreakdown = confirm('This seems like a complex task. Would you like me to break it down into smaller subtasks?');
        if (shouldBreakdown) {
          const subtasks = await breakdownLargeTask({
            title: taskData.title,
            description: taskData.description
          });
          
          for (const subtask of subtasks) {
            addSubtask(task.id, {
              title: subtask.title,
              description: subtask.description,
              status: 'todo',
              priority: 'medium',
              tags: [],
              pomodoroSessions: 0,
              subtasks: [],
              linkedNoteIds: []
            });
          }
          
          toast.success(`Created task with ${subtasks.length} subtasks`);
        }
      }

      // Clear form and close dialog
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        complexity: 'moderate',
        dueDate: undefined,
        tags: [],
        naturalLanguage: false
      });
      setIsCreatingTask(false);
      localStorage.removeItem('cortex-draft-task');
      
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleTaskStatusChange = (taskId: string, status: Task['status']) => {
    updateTask(taskId, { status });
    
    if (status === 'done') {
      toast.success('Task completed! 🎉');
    }
  };

  const handleStartPomodoro = (taskId: string) => {
    const session = startPomodoroSession(taskId);
    toast.success('Pomodoro session started! 🍅');
    // In a real app, you'd start a timer here
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <ArrowUp className="text-red-500" size={16} />;
      case 'medium':
        return <Minus className="text-yellow-500" size={16} />;
      case 'low':
        return <ArrowDown className="text-green-500" size={16} />;
      default:
        return <Circle size={16} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return <Circle className="text-muted-foreground" size={16} />;
      case 'in-progress':
        return <Clock className="text-blue-500" size={16} />;
      case 'done':
        return <CheckSquare className="text-green-500" size={16} />;
      case 'cancelled':
        return <X className="text-red-500" size={16} />;
      default:
        return <Circle size={16} />;
    }
  };

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'complex':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground">
              Manage and track your tasks with AI-powered insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && "bg-secondary")}
            >
              <Filter size={20} />
            </Button>
            <Button onClick={() => setIsCreatingTask(true)}>
              <Plus size={20} />
              <span className="ml-2">New Task</span>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search tasks..."
              value={filters.query}
              onChange={(e) => updateFilters({ query: e.target.value })}
              className="pl-10"
            />
          </div>
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'grid')}>
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="grid">Grid</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                value={filters.status.length === 1 ? filters.status[0] : ''}
                onValueChange={(value) => updateFilters({ status: value ? [value] : [] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.priority.length === 1 ? filters.priority[0] : ''}
                onValueChange={(value) => updateFilters({ priority: value ? [value] : [] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={filters.showCompleted}
                  onCheckedChange={(checked) => updateFilters({ showCompleted: checked })}
                />
                <Label>Show completed</Label>
              </div>

              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Task List */}
        <div className={cn(
          "flex-1 p-6",
          selectedTask && "lg:w-2/3"
        )}>
          <ScrollArea className="h-full">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No tasks found</h3>
                <p className="text-muted-foreground mb-4">
                  {tasks.length === 0 
                    ? "Create your first task to get started" 
                    : "Try adjusting your filters or search terms"
                  }
                </p>
                <Button onClick={() => setIsCreatingTask(true)}>
                  <Plus size={20} />
                  <span className="ml-2">Create Task</span>
                </Button>
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                  : "space-y-3"
              )}>
                {filteredTasks.map((task) => {
                  const subtasks = getSubtasks(task.id);
                  const completedSubtasks = subtasks.filter(st => st.status === 'done').length;
                  const progress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

                  return (
                    <Card 
                      key={task.id} 
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md",
                        selectedTaskId === task.id && "ring-2 ring-primary",
                        task.status === 'done' && "opacity-75"
                      )}
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskStatusChange(
                                  task.id, 
                                  task.status === 'done' ? 'todo' : 'done'
                                );
                              }}
                            >
                              {getStatusIcon(task.status)}
                            </Button>
                            <h3 className={cn(
                              "font-semibold text-sm",
                              task.status === 'done' && "line-through text-muted-foreground"
                            )}>
                              {task.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1">
                            {getPriorityIcon(task.priority)}
                            {task.aiPriority && (
                              <Badge variant="outline" className="text-xs">
                                AI: {Math.round(task.aiPriority)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {subtasks.length > 0 && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>{completedSubtasks}/{subtasks.length} subtasks</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-1" />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {task.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {task.complexity && (
                              <Badge className={cn("text-xs", getComplexityColor(task.complexity))}>
                                {task.complexity}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {task.dueDate && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar size={12} className="mr-1" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </Badge>
                            )}
                            {task.estimatedTime && (
                              <Badge variant="outline" className="text-xs">
                                <Clock size={12} className="mr-1" />
                                {Math.round(task.estimatedTime / 60)}h
                              </Badge>
                            )}
                            {task.pomodoroSessions > 0 && (
                              <Badge variant="outline" className="text-xs">
                                🍅 {task.pomodoroSessions}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartPomodoro(task.id);
                            }}
                          >
                            <Timer size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Link to note functionality
                            }}
                          >
                            <Link size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this task?')) {
                                deleteTask(task.id);
                                toast.success('Task deleted');
                              }
                            }}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Task Detail Panel - would be implemented separately */}
        {selectedTask && (
          <div className="hidden lg:block w-1/3 border-l border-border/50 bg-card/50">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Task Details</h2>
              {/* Task detail content would go here */}
            </div>
          </div>
        )}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isCreatingTask} onOpenChange={setIsCreatingTask}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkle size={20} />
              Create New Task
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Natural Language Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                checked={newTask.naturalLanguage}
                onCheckedChange={(checked) => setNewTask(prev => ({ ...prev, naturalLanguage: checked }))}
              />
              <Label>Natural language input</Label>
              <Badge variant="secondary">AI Powered</Badge>
            </div>

            {/* Task Title */}
            <div>
              <Label htmlFor="task-title">
                {newTask.naturalLanguage ? 'Describe your task naturally' : 'Task Title'}
              </Label>
              <Input
                id="task-title"
                placeholder={
                  newTask.naturalLanguage 
                    ? "e.g., Call John tomorrow at 2pm about the project"
                    : "What needs to be done?"
                }
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {!newTask.naturalLanguage && (
              <>
                {/* Description */}
                <div>
                  <Label htmlFor="task-description">Description (optional)</Label>
                  <Textarea
                    id="task-description"
                    placeholder="Add more details about this task..."
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                {/* Priority and Complexity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Complexity</Label>
                    <Select
                      value={newTask.complexity}
                      onValueChange={(value) => setNewTask(prev => ({ ...prev, complexity: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="complex">Complex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Due Date and Tags */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Due Date (optional)</Label>
                    <DatePicker
                      date={newTask.dueDate}
                      onDateChange={(date) => setNewTask(prev => ({ ...prev, dueDate: date }))}
                    />
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <Input
                      placeholder="Enter tags separated by commas"
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                        setNewTask(prev => ({ ...prev, tags }));
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreatingTask(false);
                  setNewTask({
                    title: '',
                    description: '',
                    priority: 'medium',
                    complexity: 'moderate',
                    dueDate: undefined,
                    tags: [],
                    naturalLanguage: false
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>
                <Brain size={20} />
                <span className="ml-2">Create Task</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}