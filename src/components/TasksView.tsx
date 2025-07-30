import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Clock,
  User,
  Tag as TagIcon,
  Target,
  TrendUp,
  BarChart3,
  Timer,
  Play,
  Pause,
  Square,
  CheckCircle2,
  Circle,
  AlertCircle,
  Users,
  Brain
} from '@phosphor-icons/react';
import { useTasks } from '@/hooks/use-tasks';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';

type ViewMode = 'list' | 'board' | 'calendar';
type FilterMode = 'all' | 'todo' | 'in-progress' | 'done' | 'high-priority';
type SortMode = 'updated' | 'created' | 'due-date' | 'priority' | 'title';

export default function TasksView() {
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    completeTask,
    getTasksByStatus,
    getOverdueTasks,
    getTasksCompletionRate
  } = useTasks();
  
  const isMobile = useIsMobile();
  
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortMode, setSortMode] = useState<SortMode>('updated');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  // Task analytics
  const taskStats = useMemo(() => {
    const total = tasks.length;
    const todoCount = tasks.filter(t => t.status === 'todo').length;
    const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;
    const overdue = getOverdueTasks().length;
    const highPriority = tasks.filter(t => t.priority === 'high').length;
    
    return {
      total,
      todoCount,
      inProgressCount,
      doneCount,
      overdue,
      highPriority,
      completionRate: total > 0 ? Math.round((doneCount / total) * 100) : 0
    };
  }, [tasks, getOverdueTasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(task => task.status === selectedStatus);
    }

    // Apply priority filter
    if (selectedPriority) {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    // Apply mode filter
    switch (filterMode) {
      case 'todo':
        filtered = filtered.filter(task => task.status === 'todo');
        break;
      case 'in-progress':
        filtered = filtered.filter(task => task.status === 'in-progress');
        break;
      case 'done':
        filtered = filtered.filter(task => task.status === 'done');
        break;
      case 'high-priority':
        filtered = filtered.filter(task => task.priority === 'high');
        break;
    }

    // Apply sorting
    switch (sortMode) {
      case 'updated':
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'created':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'due-date':
        filtered.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [tasks, searchQuery, selectedStatus, selectedPriority, filterMode, sortMode]);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    try {
      const newTask = {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        status: 'todo' as const,
        priority: 'medium' as const,
        tags: [],
        ownerId: 'current-user',
        assigneeIds: ['current-user'],
        collaborators: [],
        watchers: [],
        subtasks: [],
        linkedNoteIds: [],
        linkedTaskIds: [],
        dependencies: [],
        pomodoroSessions: 0,
        timeTracking: [],
        comments: [],
        attachments: [],
        customFields: {},
        shareSettings: {
          isPublic: false,
          allowComments: false
        },
        lastEditedBy: 'current-user'
      };
      
      addTask(newTask);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsCreatingTask(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleToggleTask = (task: Task) => {
    if (task.status === 'done') {
      updateTask(task.id, { status: 'todo', completedAt: undefined });
    } else {
      completeTask(task.id);
    }
  };

  const handleUpdateTaskStatus = (taskId: string, status: Task['status']) => {
    updateTask(taskId, { 
      status,
      completedAt: status === 'done' ? new Date() : undefined
    });
  };

  const handleUpdateTaskPriority = (taskId: string, priority: Task['priority']) => {
    updateTask(taskId, { priority });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'todo': return <Circle className="w-4 h-4" />;
      case 'in-progress': return <Timer className="w-4 h-4 text-blue-500" />;
      case 'done': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <Square className="w-4 h-4 text-gray-500" />;
    }
  };

  const isOverdue = (task: Task) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-primary" />
                Tasks
              </h1>
              <p className="text-muted-foreground">
                {filteredTasks.length} of {tasks.length} tasks
              </p>
            </div>
            
            <Button onClick={() => setIsCreatingTask(true)} size={isMobile ? 'sm' : 'default'}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-semibold">{taskStats.total}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-muted-foreground">To Do</p>
                  <p className="font-semibold">{taskStats.todoCount}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                  <p className="font-semibold">{taskStats.inProgressCount}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Done</p>
                  <p className="font-semibold">{taskStats.doneCount}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                  <p className="font-semibold">{taskStats.overdue}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <TrendUp className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Completion</p>
                  <p className="font-semibold">{taskStats.completionRate}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterMode} onValueChange={(value: FilterMode) => setFilterMode(value)}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Completed</SelectItem>
                  <SelectItem value="high-priority">High Priority</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortMode} onValueChange={(value: SortMode) => setSortMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Last Updated</SelectItem>
                  <SelectItem value="created">Date Created</SelectItem>
                  <SelectItem value="due-date">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Task Creation */}
      {isCreatingTask && (
        <div className="border-b bg-muted/20 p-4">
          <div className="space-y-3">
            <Input
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateTask();
                }
                if (e.key === 'Escape') {
                  setIsCreatingTask(false);
                  setNewTaskTitle('');
                  setNewTaskDescription('');
                }
              }}
              autoFocus
            />
            <Input
              placeholder="Description (optional)..."
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateTask();
                }
              }}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateTask} disabled={!newTaskTitle.trim()}>
                Create Task
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreatingTask(false);
                  setNewTaskTitle('');
                  setNewTaskDescription('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-6">
                {tasks.length === 0 
                  ? "Start by creating your first task"
                  : "Try adjusting your search criteria"
                }
              </p>
              <Button onClick={() => setIsCreatingTask(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className={cn(
                      "glass-card hover:shadow-lg transition-all duration-200 cursor-pointer group",
                      task.status === 'done' && "opacity-60",
                      isOverdue(task) && "border-red-200 bg-red-50/50"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center pt-1">
                            <Checkbox
                              checked={task.status === 'done'}
                              onCheckedChange={() => handleToggleTask(task)}
                              className="rounded-full"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className={cn(
                                "font-semibold truncate flex-1",
                                task.status === 'done' && "line-through text-muted-foreground"
                              )}>
                                {task.title}
                              </h4>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {isOverdue(task) && (
                                  <Badge variant="destructive" className="text-xs">
                                    Overdue
                                  </Badge>
                                )}
                                
                                <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                                  {task.priority}
                                </Badge>
                                
                                <Select 
                                  value={task.status} 
                                  onValueChange={(status) => handleUpdateTaskStatus(task.id, status as Task['status'])}
                                >
                                  <SelectTrigger className="w-24 h-6 text-xs">
                                    <div className="flex items-center gap-1">
                                      {getStatusIcon(task.status)}
                                      <span className="sr-only">{task.status}</span>
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="todo">To Do</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="done">Done</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            {task.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {task.dueDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span className={isOverdue(task) ? "text-red-600" : ""}>
                                      {formatDate(task.dueDate)}
                                    </span>
                                  </div>
                                )}
                                
                                {task.estimatedTime && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{task.estimatedTime}m</span>
                                  </div>
                                )}
                                
                                {task.tags.length > 0 && (
                                  <div className="flex gap-1">
                                    {task.tags.slice(0, 2).map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {task.tags.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{task.tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Add edit functionality
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Are you sure you want to delete this task?')) {
                                      deleteTask(task.id);
                                    }
                                  }}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}