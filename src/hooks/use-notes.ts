import { useKV } from '@github/spark/hooks';
import { useState, useCallback, useMemo } from 'react';
import type { Note, Folder, SearchFilters, ViewMode } from '../lib/types';

export function useNotes() {
  const [notes, setNotes] = useKV<Note[]>('cortex-notes', []);
  const [folders, setFolders] = useKV<Folder[]>('cortex-folders', []);

  const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setNotes(current => [...current, newNote]);
    return newNote;
  }, [setNotes]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(current => 
      current.map(note => 
        note.id === id 
          ? { ...note, ...updates, updatedAt: new Date() }
          : note
      )
    );
  }, [setNotes]);

  const deleteNote = useCallback((id: string) => {
    setNotes(current => current.filter(note => note.id !== id));
  }, [setNotes]);

  const toggleFavorite = useCallback((id: string) => {
    setNotes(current =>
      current.map(note =>
        note.id === id
          ? { ...note, isFavorite: !note.isFavorite, updatedAt: new Date() }
          : note
      )
    );
  }, [setNotes]);

  const addFolder = useCallback((folder: Omit<Folder, 'id' | 'createdAt'>) => {
    const newFolder: Folder = {
      ...folder,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    setFolders(current => [...current, newFolder]);
    return newFolder;
  }, [setFolders]);

  const deleteFolder = useCallback((id: string) => {
    // Move notes from deleted folder to root
    setNotes(current =>
      current.map(note =>
        note.folderId === id
          ? { ...note, folderId: undefined, updatedAt: new Date() }
          : note
      )
    );
    setFolders(current => current.filter(folder => folder.id !== id));
  }, [setNotes, setFolders]);

  const getNote = useCallback((id: string) => {
    return notes.find(note => note.id === id);
  }, [notes]);

  const getNotesByFolder = useCallback((folderId?: string) => {
    return notes.filter(note => note.folderId === folderId);
  }, [notes]);

  const getFavoriteNotes = useCallback(() => {
    return notes.filter(note => note.isFavorite);
  }, [notes]);

  const getRecentNotes = useCallback((limit = 10) => {
    return [...notes]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }, [notes]);

  return {
    notes,
    folders,
    addNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    addFolder,
    deleteFolder,
    getNote,
    getNotesByFolder,
    getFavoriteNotes,
    getRecentNotes
  };
}

export function useSearch() {
  const { notes } = useNotes();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    tags: [],
    onlyFavorites: false
  });

  const searchResults = useMemo(() => {
    let filtered = notes;

    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(note =>
        filters.tags.every(tag => note.tags.includes(tag))
      );
    }

    // Mood filter
    if (filters.mood) {
      filtered = filtered.filter(note => note.mood === filters.mood);
    }

    // Folder filter
    if (filters.folderId) {
      filtered = filtered.filter(note => note.folderId === filters.folderId);
    }

    // Favorites filter
    if (filters.onlyFavorites) {
      filtered = filtered.filter(note => note.isFavorite);
    }

    // Date range filter
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter(note => {
        const noteDate = new Date(note.createdAt);
        return noteDate >= start && noteDate <= end;
      });
    }

    return filtered.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [notes, filters]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(current => ({ ...current, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      query: '',
      tags: [],
      onlyFavorites: false
    });
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  return {
    filters,
    searchResults,
    updateFilters,
    clearFilters,
    allTags
  };
}

export function useAppState() {
  const [currentView, setCurrentView] = useKV<ViewMode>('cortex-current-view', 'dashboard');
  const [currentWorkspaceId, setCurrentWorkspaceId] = useKV<string | undefined>('cortex-current-workspace', undefined);
  const [currentProjectId, setCurrentProjectId] = useKV<string | undefined>('cortex-current-project', undefined);
  const [selectedNoteId, setSelectedNoteId] = useKV<string | undefined>('cortex-selected-note', undefined);
  const [selectedTaskId, setSelectedTaskId] = useKV<string | undefined>('cortex-selected-task', undefined);
  const [sidebarCollapsed, setSidebarCollapsed] = useKV<boolean>('cortex-sidebar-collapsed', false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [focusMode, setFocusMode] = useKV<boolean>('cortex-focus-mode', false);
  const [activePomodoroSession, setActivePomodoroSession] = useKV<string | undefined>('cortex-active-pomodoro', undefined);
  const [activeCollaborationSession, setActiveCollaborationSession] = useKV<string | undefined>('cortex-active-collaboration', undefined);

  return {
    currentView,
    setCurrentView,
    currentWorkspaceId,
    setCurrentWorkspaceId,
    currentProjectId,
    setCurrentProjectId,
    selectedNoteId,
    setSelectedNoteId,
    selectedTaskId,
    setSelectedTaskId,
    sidebarCollapsed,
    setSidebarCollapsed,
    isCreatingNote,
    setIsCreatingNote,
    isCreatingTask,
    setIsCreatingTask,
    focusMode,
    setFocusMode,
    activePomodoroSession,
    setActivePomodoroSession,
    activeCollaborationSession,
    setActiveCollaborationSession
  };
}