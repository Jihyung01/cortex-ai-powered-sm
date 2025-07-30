import { useKV } from '@github/spark/hooks';
import { useState, useCallback, useMemo } from 'react';
import type { Task, Project, TaskFilters, TaskAnalytics, PomodoroSession, TimeBlock } from '../lib/types';

export function useTasks() {
  const [tasks, setTasks] = useKV<Task[]>('cortex-tasks', []);
  const [projects, setProjects] = useKV<Project[]>('cortex-projects', []);
  const [pomodoroSessions, setPomodoroSessions] = useKV<PomodoroSession[]>('cortex-pomodoro-sessions', []);

  // Task CRUD operations
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      pomodoroSessions: 0,
      subtasks: [],
      linkedNoteIds: [],
      tags: task.tags || []
    };
    setTasks(current => [...current, newTask]);
    return newTask;
  }, [setTasks]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(current => 
      current.map(task => 
        task.id === id 
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    );
  }, [setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(current => {
      // Remove from parent's subtasks if it's a subtask
      const task = current.find(t => t.id === id);
      if (task?.parentId) {
        const parentTask = current.find(t => t.id === task.parentId);
        if (parentTask) {
          const updatedParent = {
            ...parentTask,
            subtasks: parentTask.subtasks.filter(subId => subId !== id),
            updatedAt: new Date()
          };
          return current
            .filter(t => t.id !== id && !task.subtasks.includes(t.id))
            .map(t => t.id === parentTask.id ? updatedParent : t);
        }
      }
      // Delete task and all its subtasks
      return current.filter(t => t.id !== id && !task?.subtasks.includes(t.id));
    });
  }, [setTasks]);

  const completeTask = useCallback((id: string) => {
    updateTask(id, { 
      status: 'done', 
      completedAt: new Date() 
    });
  }, [updateTask]);

  const addSubtask = useCallback((parentId: string, subtask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'parentId'>) => {
    const newSubtask = addTask({ ...subtask, parentId });
    setTasks(current =>
      current.map(task =>
        task.id === parentId
          ? { ...task, subtasks: [...task.subtasks, newSubtask.id], updatedAt: new Date() }
          : task
      )
    );
    return newSubtask;
  }, [addTask, setTasks]);

  const linkTaskToNote = useCallback((taskId: string, noteId: string) => {
    setTasks(current =>
      current.map(task =>
        task.id === taskId
          ? { 
              ...task, 
              linkedNoteIds: task.linkedNoteIds.includes(noteId) 
                ? task.linkedNoteIds 
                : [...task.linkedNoteIds, noteId],
              updatedAt: new Date()
            }
          : task
      )
    );
  }, [setTasks]);

  const unlinkTaskFromNote = useCallback((taskId: string, noteId: string) => {
    setTasks(current =>
      current.map(task =>
        task.id === taskId
          ? { 
              ...task, 
              linkedNoteIds: task.linkedNoteIds.filter(id => id !== noteId),
              updatedAt: new Date()
            }
          : task
      )
    );
  }, [setTasks]);

  // Project operations
  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      taskIds: []
    };
    setProjects(current => [...current, newProject]);
    return newProject;
  }, [setProjects]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(current =>
      current.map(project =>
        project.id === id
          ? { ...project, ...updates, updatedAt: new Date() }
          : project
      )
    );
  }, [setProjects]);

  const deleteProject = useCallback((id: string) => {
    // Remove project reference from tasks
    setTasks(current =>
      current.map(task =>
        projects.find(p => p.id === id)?.taskIds.includes(task.id)
          ? { ...task, updatedAt: new Date() }
          : task
      )
    );
    setProjects(current => current.filter(project => project.id !== id));
  }, [setProjects, setTasks, projects]);

  const addTaskToProject = useCallback((projectId: string, taskId: string) => {
    setProjects(current =>
      current.map(project =>
        project.id === projectId
          ? { 
              ...project, 
              taskIds: project.taskIds.includes(taskId) 
                ? project.taskIds 
                : [...project.taskIds, taskId],
              updatedAt: new Date()
            }
          : project
      )
    );
  }, [setProjects]);

  // Pomodoro operations
  const startPomodoroSession = useCallback((taskId: string, duration: number = 25) => {
    const session: PomodoroSession = {
      id: crypto.randomUUID(),
      taskId,
      duration,
      completedAt: new Date(),
      type: 'work'
    };
    setPomodoroSessions(current => [...current, session]);
    
    // Increment task pomodoro count
    setTasks(current =>
      current.map(task =>
        task.id === taskId
          ? { ...task, pomodoroSessions: task.pomodoroSessions + 1, updatedAt: new Date() }
          : task
      )
    );
    
    return session;
  }, [setPomodoroSessions, setTasks]);

  // AI-powered features
  const estimateTaskTime = useCallback(async (task: Pick<Task, 'title' | 'description' | 'complexity'>) => {
    try {
      const prompt = spark.llmPrompt`Estimate time needed for this task in minutes. Consider complexity: ${task.complexity || 'moderate'}.
      
Task: ${task.title}
Description: ${task.description || 'No description'}

Respond with only a number (minutes).`;
      
      const response = await spark.llm(prompt, 'gpt-4o-mini');
      const estimatedMinutes = parseInt(response.trim());
      return isNaN(estimatedMinutes) ? 30 : Math.max(5, Math.min(480, estimatedMinutes)); // 5 min to 8 hours
    } catch (error) {
      console.error('Failed to estimate task time:', error);
      return 30; // Default 30 minutes
    }
  }, []);

  const calculateAIPriority = useCallback(async (task: Pick<Task, 'title' | 'description' | 'dueDate' | 'complexity'>) => {
    try {
      const now = new Date();
      const daysUntilDue = task.dueDate ? Math.ceil((task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
      
      const prompt = spark.llmPrompt`Calculate priority score (0-100) for this task:

Task: ${task.title}
Description: ${task.description || 'No description'}
Complexity: ${task.complexity || 'moderate'}
Days until due: ${daysUntilDue || 'No deadline'}

Consider urgency, complexity, and importance. Respond with only a number 0-100.`;
      
      const response = await spark.llm(prompt, 'gpt-4o-mini');
      const priority = parseInt(response.trim());
      return isNaN(priority) ? 50 : Math.max(0, Math.min(100, priority));
    } catch (error) {
      console.error('Failed to calculate AI priority:', error);
      return 50; // Default medium priority
    }
  }, []);

  const breakdownLargeTask = useCallback(async (task: Pick<Task, 'title' | 'description'>) => {
    try {
      const prompt = spark.llmPrompt`Break down this large task into 3-5 smaller, actionable subtasks:

Task: ${task.title}
Description: ${task.description || 'No description'}

Return a JSON array of objects with 'title' and 'description' fields.`;
      
      const response = await spark.llm(prompt, 'gpt-4o-mini', true);
      const subtasks = JSON.parse(response);
      
      if (Array.isArray(subtasks)) {
        return subtasks.filter(st => st.title && typeof st.title === 'string');
      }
      return [];
    } catch (error) {
      console.error('Failed to breakdown task:', error);
      return [];
    }
  }, []);

  const parseNaturalLanguageTask = useCallback(async (input: string) => {
    try {
      const prompt = spark.llmPrompt`Parse this natural language task into structured data:

Input: "${input}"

Extract and return JSON with these fields (use null if not found):
{
  "title": "main task title",
  "description": "additional details",
  "dueDate": "ISO date string if mentioned",
  "priority": "high|medium|low",
  "tags": ["array", "of", "relevant", "tags"]
}`;
      
      const response = await spark.llm(prompt, 'gpt-4o-mini', true);
      const parsed = JSON.parse(response);
      
      return {
        title: parsed.title || input,
        description: parsed.description || undefined,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : undefined,
        priority: ['high', 'medium', 'low'].includes(parsed.priority) ? parsed.priority : 'medium',
        tags: Array.isArray(parsed.tags) ? parsed.tags : []
      };
    } catch (error) {
      console.error('Failed to parse natural language task:', error);
      return {
        title: input,
        priority: 'medium' as const,
        tags: []
      };
    }
  }, []);

  // Analytics and insights
  const getTaskAnalytics = useCallback((): TaskAnalytics => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentTasks = tasks.filter(task => 
      new Date(task.createdAt) >= thirtyDaysAgo
    );
    
    const completedTasks = recentTasks.filter(task => task.status === 'done');
    
    const completionRate = recentTasks.length > 0 
      ? (completedTasks.length / recentTasks.length) * 100 
      : 0;
    
    const averageCompletionTime = completedTasks.reduce((sum, task) => {
      if (task.completedAt && task.actualTime) {
        return sum + task.actualTime;
      }
      return sum;
    }, 0) / Math.max(completedTasks.length, 1);
    
    const productivityScore = Math.min(100, 
      (completionRate * 0.6) + 
      (Math.min(averageCompletionTime / 60, 8) / 8 * 40) // 8 hours max per task
    );
    
    // Weekly progress
    const weeklyProgress = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weekTasks = tasks.filter(task => {
        const created = new Date(task.createdAt);
        return created >= weekStart && created < weekEnd;
      });
      
      const weekCompleted = weekTasks.filter(task => 
        task.status === 'done' && 
        task.completedAt && 
        new Date(task.completedAt) >= weekStart && 
        new Date(task.completedAt) < weekEnd
      );
      
      weeklyProgress.push({
        week: weekStart.toISOString().split('T')[0],
        completed: weekCompleted.length,
        created: weekTasks.length
      });
    }
    
    return {
      totalTasks: recentTasks.length,
      completedTasks: completedTasks.length,
      completionRate,
      averageCompletionTime,
      productivityScore,
      weeklyProgress,
      timeSpentByCategory: [],
      complexityDistribution: {
        simple: tasks.filter(t => t.complexity === 'simple').length,
        moderate: tasks.filter(t => t.complexity === 'moderate').length,
        complex: tasks.filter(t => t.complexity === 'complex').length
      }
    };
  }, [tasks]);

  // Utility functions
  const getTask = useCallback((id: string) => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  const getTasksByProject = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? tasks.filter(task => project.taskIds.includes(task.id)) : [];
  }, [tasks, projects]);

  const getSubtasks = useCallback((parentId: string) => {
    const parentTask = tasks.find(task => task.id === parentId);
    return parentTask ? tasks.filter(task => parentTask.subtasks.includes(task.id)) : [];
  }, [tasks]);

  const getTasksByStatus = useCallback((status: Task['status']) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  const getOverdueTasks = useCallback(() => {
    const now = new Date();
    return tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < now && 
      task.status !== 'done' && 
      task.status !== 'cancelled'
    );
  }, [tasks]);

  const getUpcomingTasks = useCallback((days = 7) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return tasks.filter(task =>
      task.dueDate &&
      new Date(task.dueDate) >= now &&
      new Date(task.dueDate) <= futureDate &&
      task.status !== 'done' &&
      task.status !== 'cancelled'
    ).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [tasks]);

  return {
    tasks,
    projects,
    pomodoroSessions,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    addSubtask,
    linkTaskToNote,
    unlinkTaskFromNote,
    addProject,
    updateProject,
    deleteProject,
    addTaskToProject,
    startPomodoroSession,
    estimateTaskTime,
    calculateAIPriority,
    breakdownLargeTask,
    parseNaturalLanguageTask,
    getTaskAnalytics,
    getTask,
    getTasksByProject,
    getSubtasks,
    getTasksByStatus,
    getOverdueTasks,
    getUpcomingTasks
  };
}

export function useTaskFilters() {
  const { tasks } = useTasks();
  const [filters, setFilters] = useState<TaskFilters>({
    query: '',
    status: [],
    priority: [],
    tags: [],
    showCompleted: false,
    showSubtasks: true
  });

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Hide subtasks if requested
    if (!filters.showSubtasks) {
      filtered = filtered.filter(task => !task.parentId);
    }

    // Hide completed tasks if requested
    if (!filters.showCompleted) {
      filtered = filtered.filter(task => task.status !== 'done');
    }

    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status));
    }

    // Priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority));
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(task =>
        filters.tags.every(tag => task.tags.includes(tag))
      );
    }

    // Date range filter
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= start && taskDate <= end;
      });
    }

    // Project filter
    if (filters.projectId) {
      filtered = filtered.filter(task => {
        // This would need project data to work properly
        return true; // Placeholder
      });
    }

    return filtered.sort((a, b) => {
      // Sort by AI priority if available, then by due date, then by created date
      if (a.aiPriority !== undefined && b.aiPriority !== undefined) {
        return b.aiPriority - a.aiPriority;
      }
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, filters]);

  const updateFilters = useCallback((newFilters: Partial<TaskFilters>) => {
    setFilters(current => ({ ...current, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      query: '',
      status: [],
      priority: [],
      tags: [],
      showCompleted: false,
      showSubtasks: true
    });
  }, []);

  const allTaskTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach(task => {
      task.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [tasks]);

  return {
    filters,
    filteredTasks,
    updateFilters,
    clearFilters,
    allTaskTags
  };
}