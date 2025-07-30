export interface Note {
  id: string;
  title: string;
  content: string;
  markdown: string;
  tags: string[];
  category?: string;
  mood?: 'positive' | 'neutral' | 'negative';
  folderId?: string;
  workspaceId?: string;
  projectId?: string;
  ownerId: string;
  collaborators: string[]; // user IDs who can edit
  viewers: string[]; // user IDs who can view
  isFavorite: boolean;
  isTemplate: boolean;
  shareSettings: {
    isPublic: boolean;
    allowComments: boolean;
    expiresAt?: Date;
    password?: string;
  };
  version: number;
  versionHistory: NoteVersion[];
  lockInfo?: {
    lockedBy: string;
    lockedAt: Date;
    expiresAt: Date;
  };
  comments: NoteComment[];
  lastEditedBy: string;
  createdAt: Date;
  updatedAt: Date;
  summary?: string;
  templateId?: string;
}

export interface NoteVersion {
  version: number;
  content: string;
  editedBy: string;
  editedAt: Date;
  changeDescription?: string;
}

export interface NoteComment {
  id: string;
  noteId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  position?: number; // character position in note
  isResolved: boolean;
  parentCommentId?: string;
  reactions: MessageReaction[];
  createdAt: Date;
  updatedAt: Date;
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
  workspaceId?: string;
  projectId?: string;
  milestoneId?: string;
  ownerId: string;
  assigneeIds: string[];
  collaborators: string[];
  watchers: string[];
  parentId?: string; // for subtasks
  subtasks: string[]; // array of subtask IDs
  linkedNoteIds: string[]; // notes linked to this task
  linkedTaskIds: string[]; // related tasks
  dependencies: TaskDependency[];
  pomodoroSessions: number;
  timeTracking: TimeEntry[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  customFields: Record<string, any>;
  shareSettings: {
    isPublic: boolean;
    allowComments: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  aiPriority?: number; // 0-100 AI-calculated priority score
  isRecurring?: boolean;
  recurringPattern?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
  lastEditedBy: string;
}

export interface TaskDependency {
  taskId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lag: number; // days
}

export interface TimeEntry {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  description?: string;
  billable: boolean;
  approved: boolean;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  isInternal: boolean;
  parentCommentId?: string;
  reactions: MessageReaction[];
  attachments: MessageAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAttachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
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

export type ViewMode = 'dashboard' | 'notes' | 'folders' | 'search' | 'templates' | 'tasks' | 'kanban' | 'timeline' | 'calendar' | 'analytics' | 'ai-assistant' | 'team' | 'projects' | 'collaboration' | 'integrations' | 'admin' | 'client-portal';

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
  currentWorkspaceId?: string;
  currentProjectId?: string;
  selectedNoteId?: string;
  selectedTaskId?: string;
  isCreatingNote: boolean;
  isCreatingTask: boolean;
  searchFilters: SearchFilters;
  taskFilters: TaskFilters;
  sidebarCollapsed: boolean;
  kanbanView: {
    groupBy: 'status' | 'priority' | 'project' | 'assignee';
  };
  timelineView: {
    period: 'week' | 'month' | 'quarter';
    showMilestones: boolean;
  };
  collaborationView: {
    showPresence: boolean;
    showComments: boolean;
    activeSessionId?: string;
  };
  teamView: {
    selectedDepartment?: string;
    viewMode: 'grid' | 'list' | 'org-chart';
  };
  focusMode: boolean;
  activePomodoroSession?: string;
  activeCollaborationSession?: string;
}

// AI Assistant Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'task_suggestion' | 'productivity_insight' | 'goal_update';
  metadata?: {
    relatedTaskIds?: string[];
    relatedNoteIds?: string[];
    suggestedActions?: string[];
    confidence?: number;
  };
}

export interface ProductivityGoal {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string; // e.g., 'tasks', 'hours', 'notes'
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductivityInsight {
  id: string;
  type: 'pattern' | 'recommendation' | 'achievement' | 'warning';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  actionItems: string[];
  confidence: number;
  createdAt: Date;
  isRead: boolean;
  relatedData?: {
    taskIds?: string[];
    noteIds?: string[];
    timeRange?: { start: Date; end: Date };
  };
}

export interface AIAssistantState {
  isEnabled: boolean;
  voiceInputEnabled: boolean;
  autoSuggestions: boolean;
  dailyReportsEnabled: boolean;
  weeklyReportsEnabled: boolean;
  focusTimeOptimization: boolean;
  smartScheduling: boolean;
  intelligentReminders: boolean;
  lastInteraction?: Date;
  preferredCommunicationStyle: 'casual' | 'professional' | 'encouraging';
  personalityTone: 'neutral' | 'enthusiastic' | 'analytical';
}

// Enterprise Collaboration Types
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  settings: WorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSettings {
  isPublic: boolean;
  allowInvites: boolean;
  defaultMemberRole: TeamRole;
  retentionPolicy: number; // days
  encryptionEnabled: boolean;
  auditLogsEnabled: boolean;
  integrations: {
    slack?: SlackIntegration;
    teams?: TeamsIntegration;
    discord?: DiscordIntegration;
    github?: GitHubIntegration;
    zapier?: ZapierIntegration;
  };
}

export interface TeamMember {
  id: string;
  userId: string;
  workspaceId: string;
  email: string;
  name: string;
  avatar?: string;
  role: TeamRole;
  department?: string;
  title?: string;
  status: 'invited' | 'active' | 'inactive' | 'suspended';
  lastSeen?: Date;
  joinedAt: Date;
  permissions: Permission[];
}

export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'guest';

export interface Permission {
  resource: 'notes' | 'tasks' | 'projects' | 'analytics' | 'settings' | 'integrations';
  actions: ('create' | 'read' | 'update' | 'delete' | 'share' | 'export')[];
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  parentId?: string;
  leaderId?: string;
  memberIds: string[];
  color: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  color: string;
  workspaceId: string;
  ownerId: string;
  memberIds: string[];
  departmentId?: string;
  clientId?: string;
  startDate: Date;
  endDate?: Date;
  budget?: {
    allocated: number;
    spent: number;
    currency: string;
  };
  taskIds: string[];
  milestoneIds: string[];
  riskAssessments: RiskAssessment[];
  tags: string[];
  template?: ProjectTemplate;
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dependencies: string[]; // other milestone IDs
  taskIds: string[];
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RiskAssessment {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  category: 'technical' | 'resource' | 'timeline' | 'budget' | 'external';
  status: 'identified' | 'mitigating' | 'resolved' | 'accepted';
  mitigationPlan?: string;
  assigneeId?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'software' | 'marketing' | 'research' | 'operations' | 'custom';
  defaultTasks: Partial<Task>[];
  defaultMilestones: Partial<Milestone>[];
  estimatedDuration: number; // days
  requiredRoles: TeamRole[];
}

// Real-time Collaboration Types
export interface CollaborationSession {
  id: string;
  documentId: string;
  documentType: 'note' | 'task' | 'project';
  participants: SessionParticipant[];
  startedAt: Date;
  endedAt?: Date;
  operations: CollaborationOperation[];
}

export interface SessionParticipant {
  userId: string;
  name: string;
  avatar?: string;
  cursor?: {
    position: number;
    selection?: { start: number; end: number };
  };
  isActive: boolean;
  joinedAt: Date;
  lastActivity: Date;
}

export interface CollaborationOperation {
  id: string;
  type: 'insert' | 'delete' | 'format' | 'move';
  userId: string;
  position: number;
  content?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  vector?: number[]; // for operational transformation
}

export interface TeamMessage {
  id: string;
  workspaceId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  channelId?: string;
  threadId?: string;
  content: string;
  messageType: 'text' | 'file' | 'link' | 'mention' | 'system';
  attachments: MessageAttachment[];
  reactions: MessageReaction[];
  mentionedUserIds: string[];
  linkedDocuments: {
    type: 'note' | 'task' | 'project';
    id: string;
    title: string;
  }[];
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
  count: number;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  type: 'public' | 'private' | 'dm' | 'announcement';
  memberIds: string[];
  createdBy: string;
  createdAt: Date;
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date;
  };
  settings: {
    allowFiles: boolean;
    allowMentions: boolean;
    isArchived: boolean;
  };
}

// Integration Types
export interface SlackIntegration {
  enabled: boolean;
  workspaceUrl: string;
  botToken: string;
  channelMappings: { channelId: string; slackChannelId: string }[];
  notificationSettings: {
    newTasks: boolean;
    taskUpdates: boolean;
    projectMilestones: boolean;
  };
}

export interface TeamsIntegration {
  enabled: boolean;
  tenantId: string;
  applicationId: string;
  teamMappings: { teamId: string; msTeamId: string }[];
  syncSettings: {
    calendar: boolean;
    files: boolean;
    meetings: boolean;
  };
}

export interface DiscordIntegration {
  enabled: boolean;
  serverId: string;
  botToken: string;
  channelMappings: { channelId: string; discordChannelId: string }[];
  roleSync: boolean;
}

export interface GitHubIntegration {
  enabled: boolean;
  repositories: {
    owner: string;
    repo: string;
    linkedProjects: string[];
  }[];
  webhookEvents: ('push' | 'pull_request' | 'issues' | 'releases')[];
  syncSettings: {
    issues: boolean;
    pullRequests: boolean;
    commits: boolean;
  };
}

export interface ZapierIntegration {
  enabled: boolean;
  webhookUrl: string;
  triggers: {
    event: string;
    zapId: string;
    isActive: boolean;
  }[];
}

// Analytics and Reporting Types
export interface TeamAnalytics {
  workspaceId: string;
  period: { start: Date; end: Date };
  metrics: {
    totalMembers: number;
    activeMembers: number;
    totalProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    collaborationSessions: number;
    messagesExchanged: number;
  };
  productivity: {
    tasksPerMember: number;
    averageTaskCompletionTime: number;
    projectVelocity: number;
    collaborationIndex: number;
  };
  engagement: {
    dailyActiveUsers: { date: Date; count: number }[];
    topContributors: { userId: string; contributions: number }[];
    departmentActivity: { departmentId: string; activity: number }[];
  };
  trends: {
    taskCreationTrend: { date: Date; count: number }[];
    taskCompletionTrend: { date: Date; count: number }[];
    collaborationTrend: { date: Date; sessions: number }[];
  };
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Client Portal Types
export interface Client {
  id: string;
  name: string;
  contactEmail: string;
  contactPhone?: string;
  company: string;
  avatar?: string;
  workspaceId: string;
  accessLevel: 'view' | 'comment' | 'limited_edit';
  projectIds: string[];
  portalSettings: {
    allowComments: boolean;
    allowFileDownload: boolean;
    showTimeline: boolean;
    showBudget: boolean;
  };
  lastLogin?: Date;
  createdAt: Date;
}

export interface ClientPortalSession {
  clientId: string;
  projectId: string;
  accessToken: string;
  expiresAt: Date;
  permissions: string[];
}