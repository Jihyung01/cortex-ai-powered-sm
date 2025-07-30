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

export type ViewMode = 'dashboard' | 'notes' | 'folders' | 'search' | 'templates';

export interface AppState {
  currentView: ViewMode;
  selectedNoteId?: string;
  isCreatingNote: boolean;
  searchFilters: SearchFilters;
  sidebarCollapsed: boolean;
}