import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Settings,
  Clock,
  Calendar,
  Tag,
  User,
  CheckSquare,
  Circle,
  Timer,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  GripVertical
} from '@phosphor-icons/react';
import { useTasks } from '@/hooks/use-tasks';
import { useAppState } from '@/hooks/use-notes';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Task } from '@/lib/types';

// Drag and drop types
interface DragItem {
  id: string;
  type: 'task';
  task: Task;
}

export function KanbanView() {
  const { 
    tasks, 
    updateTask, 
    addTask, 
    getSubtasks,
    startPomodoroSession 
  } = useTasks();
  
  const { setIsCreatingTask } = useAppState();
  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'project'>('status');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Filter tasks based on search
  const filteredTasks = tasks.filter(task => 
    !task.parentId && // Only show top-level tasks
    (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Group tasks by the selected criterion
  const groupedTasks = () => {
    const groups: Record<string, Task[]> = {};
    
    switch (groupBy) {
      case 'status':
        groups['To Do'] = filteredTasks.filter(task => task.status === 'todo');
        groups['In Progress'] = filteredTasks.filter(task => task.status === 'in-progress');
        groups['Review'] = filteredTasks.filter(task => task.status === 'done');
        groups['Cancelled'] = filteredTasks.filter(task => task.status === 'cancelled');
        break;
      
      case 'priority':
        groups['High Priority'] = filteredTasks.filter(task => task.priority === 'high');
        groups['Medium Priority'] = filteredTasks.filter(task => task.priority === 'medium');
        groups['Low Priority'] = filteredTasks.filter(task => task.priority === 'low');
        break;
      
      case 'project':
        // Group by project - for now, group by tags
        const projectTags = new Set(filteredTasks.flatMap(task => task.tags));
        projectTags.forEach(tag => {
          groups[tag] = filteredTasks.filter(task => task.tags.includes(tag));
        });
        groups['No Project'] = filteredTasks.filter(task => task.tags.length === 0);
        break;
    }
    
    return groups;
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedTask) return;
    
    // Update task based on the column it was dropped into
    let updates: Partial<Task> = {};
    
    switch (groupBy) {
      case 'status':
        switch (columnId) {
          case 'To Do':
            updates.status = 'todo';
            break;
          case 'In Progress':
            updates.status = 'in-progress';
            break;
          case 'Review':
            updates.status = 'done';
            break;
          case 'Cancelled':
            updates.status = 'cancelled';
            break;
        }
        break;
      
      case 'priority':
        switch (columnId) {
          case 'High Priority':
            updates.priority = 'high';
            break;
          case 'Medium Priority':
            updates.priority = 'medium';
            break;
          case 'Low Priority':
            updates.priority = 'low';
            break;
        }
        break;
    }
    
    if (Object.keys(updates).length > 0) {
      updateTask(draggedTask.id, updates);
      toast.success('Task updated');
    }
    
    setDraggedTask(null);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 border-gray-300';
      case 'in-progress':
        return 'bg-blue-100 border-blue-300';
      case 'done':
        return 'bg-green-100 border-green-300';
      case 'cancelled':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getColumnColor = (columnId: string) => {
    switch (columnId) {
      case 'To Do':
        return 'bg-gray-50 border-gray-200';
      case 'In Progress':
        return 'bg-blue-50 border-blue-200';
      case 'Review':
        return 'bg-green-50 border-green-200';
      case 'Cancelled':
        return 'bg-red-50 border-red-200';
      case 'High Priority':
        return 'bg-red-50 border-red-200';
      case 'Medium Priority':
        return 'bg-yellow-50 border-yellow-200';
      case 'Low Priority':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Kanban Board</h1>
            <p className="text-muted-foreground">
              Drag and drop tasks to update their status
            </p>
          </div>
          <Button onClick={() => setIsCreatingTask(true)}>
            <Plus size={20} />
            <span className="ml-2">New Task</span>
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Group by:</span>
            <Select value={groupBy} onValueChange={(value) => setGroupBy(value as any)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="project">Project</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 p-6">
        <div className="h-full flex gap-6 overflow-x-auto">
          {Object.entries(groupedTasks()).map(([columnId, columnTasks]) => (
            <div
              key={columnId}
              className={cn(
                "flex-shrink-0 w-80 h-full flex flex-col rounded-lg border-2 transition-colors",
                getColumnColor(columnId),
                dragOverColumn === columnId && "border-primary bg-primary/5"
              )}
              onDragOver={(e) => handleDragOver(e, columnId)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, columnId)}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{columnId}</h3>
                  <Badge variant="secondary">{columnTasks.length}</Badge>
                </div>
              </div>

              {/* Column Content */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {columnTasks.map((task) => {
                    const subtasks = getSubtasks(task.id);
                    const completedSubtasks = subtasks.filter(st => st.status === 'done').length;
                    
                    return (
                      <Card
                        key={task.id}
                        className={cn(
                          "cursor-move transition-all duration-200 hover:shadow-md border",
                          getStatusColor(task.status),
                          draggedTask?.id === task.id && "opacity-50 rotate-3 scale-105"
                        )}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onClick={() => setSelectedTask(task)}
                      >
                        <CardContent className="p-4">
                          {/* Task Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 flex-1">
                              <GripVertical size={16} className="text-muted-foreground flex-shrink-0" />
                              <h4 className="font-semibold text-sm line-clamp-2">
                                {task.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {getPriorityIcon(task.priority)}
                              {task.aiPriority && (
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(task.aiPriority)}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Task Description */}
                          {task.description && (
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-3">
                              {task.description}
                            </p>
                          )}

                          {/* Subtasks Progress */}
                          {subtasks.length > 0 && (
                            <div className="mb-3">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CheckSquare size={12} />
                                <span>{completedSubtasks}/{subtasks.length} subtasks</span>
                              </div>
                            </div>
                          )}

                          {/* Task Metadata */}
                          <div className="space-y-2">
                            {/* Tags */}
                            {task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {task.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {task.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{task.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Due Date and Time */}
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                {task.dueDate && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Calendar size={12} />
                                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {task.estimatedTime && (
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock size={12} />
                                    <span>{Math.round(task.estimatedTime / 60)}h</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Quick Actions */}
                              <div className="flex items-center gap-1">
                                {task.pomodoroSessions > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    🍅 {task.pomodoroSessions}
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startPomodoroSession(task.id);
                                    toast.success('Pomodoro started! 🍅');
                                  }}
                                >
                                  <Timer size={12} />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Overdue Warning */}
                          {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done' && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                              <AlertTriangle size={12} />
                              <span>Overdue</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {/* Add Task to Column Button */}
                  <Button
                    variant="ghost"
                    className="w-full h-20 border-2 border-dashed border-muted-foreground/20 hover:border-primary/50"
                    onClick={() => setIsCreatingTask(true)}
                  >
                    <Plus size={20} className="text-muted-foreground" />
                  </Button>
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getPriorityIcon(selectedTask.priority)}
                {selectedTask.title}
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
                  <Badge className={getStatusColor(selectedTask.status)}>
                    {selectedTask.status}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Priority</h4>
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(selectedTask.priority)}
                    <span className="capitalize">{selectedTask.priority}</span>
                  </div>
                </div>
                
                {selectedTask.dueDate && (
                  <div>
                    <h4 className="font-semibold mb-2">Due Date</h4>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                
                {selectedTask.estimatedTime && (
                  <div>
                    <h4 className="font-semibold mb-2">Estimated Time</h4>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{Math.round(selectedTask.estimatedTime / 60)} hours</span>
                    </div>
                  </div>
                )}
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
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}