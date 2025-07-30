export interface Note {
  id: string;
  title: string;
  content: string;
  markdown: string;
  tags: string[];
  category?: string;
  mood?: 'positive' | 'neutral' | 'negative';
  folderId?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  summary?: string;
  templateId?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  createdAt: Date;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  category: 'meeting' | 'project' | 'journal' | 'custom';
  tags: string[];
}

export interface SearchFilters {
  query: string;
  tags: string[];
  mood?: 'positive' | 'neutral' | 'negative';
  folderId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  onlyFavorites?: boolean;
}

export interface AIAnalysis {
  suggestedTags: string[];
  suggestedCategory: string;
  mood: 'positive' | 'neutral' | 'negative';
  summary?: string;
  confidence: number;
}

// Task Management Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  complexity?: 'simple' | 'moderate' | 'complex';
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  dueDate?: Date;
  startDate?: Date;
  completedAt?: Date;
  tags: string[];
  folderId?: string;
  parentId?: string; // for subtasks
  subtasks: string[]; // array of subtask IDs
  linkedNoteIds: string[]; // notes linked to this task
  pomodoroSessions: number;
  createdAt: Date;
  updatedAt: Date;
  aiPriority?: number; // 0-100 AI-calculated priority score
  isRecurring?: boolean;
  recurringPattern?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  color: string;
  startDate: Date;
  endDate?: Date;
  taskIds: string[];
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  productivityScore: number;
  weeklyProgress: {
    week: string;
    completed: number;
    created: number;
  }[];
  timeSpentByCategory: {
    category: string;
    minutes: number;
  }[];
  complexityDistribution: {
    simple: number;
    moderate: number;
    complex: number;
  };
}

export interface PomodoroSession {
  id: string;
  taskId: string;
  duration: number; // in minutes
  completedAt: Date;
  type: 'work' | 'short-break' | 'long-break';
}

export interface TimeBlock {
  id: string;
  title: string;
  taskId?: string;
  startTime: Date;
  endTime: Date;
  type: 'task' | 'meeting' | 'break' | 'personal';
  color?: string;
}

export type ViewMode = 'dashboard' | 'notes' | 'folders' | 'search' | 'templates' | 'tasks' | 'kanban' | 'timeline' | 'calendar' | 'analytics';

export interface TaskFilters {
  query: string;
  status: string[];
  priority: string[];
  tags: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  showCompleted: boolean;
  showSubtasks: boolean;
  projectId?: string;
}

export interface AppState {
  currentView: ViewMode;
  selectedNoteId?: string;
  selectedTaskId?: string;
  isCreatingNote: boolean;
  isCreatingTask: boolean;
  searchFilters: SearchFilters;
  taskFilters: TaskFilters;
  sidebarCollapsed: boolean;
  kanbanView: {
    groupBy: 'status' | 'priority' | 'project';
  };
  timelineView: {
    period: 'week' | 'month' | 'quarter';
    showMilestones: boolean;
  };
  focusMode: boolean;
  activePomodoroSession?: string;
}