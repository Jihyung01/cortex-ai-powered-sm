import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Star, 
  Tag as TagIcon, 
  Folder,
  Filter,
  SortAsc,
  Grid3x3,
  List,
  Calendar,
  Clock,
  Eye,
  Edit2,
  Trash2,
  Heart,
  Brain
} from '@phosphor-icons/react';
import { useNotes, useAppState } from '@/hooks/use-notes';
import { useIsMobile } from '@/hooks/use-mobile';
import { NoteCard } from './NoteCard';
import { NoteEditor } from './NoteEditor';
import { cn } from '@/lib/utils';
import { getMoodColor, getMoodIcon } from '@/lib/ai';
import type { Note } from '@/lib/types';

type ViewMode = 'grid' | 'list' | 'compact';
type SortMode = 'updated' | 'created' | 'title' | 'mood';
type FilterMode = 'all' | 'favorites' | 'recent' | 'archived';

export default function NotesView() {
  const { 
    notes, 
    folders,
    addNote, 
    updateNote, 
    deleteNote, 
    toggleFavorite,
    getFavoriteNotes,
    getRecentNotes,
    getNotesByFolder
  } = useNotes();
  
  const { 
    isCreatingNote, 
    setIsCreatingNote, 
    selectedNoteId, 
    setSelectedNoteId 
  } = useAppState();
  
  const isMobile = useIsMobile();
  
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('updated');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let filtered = [...notes];

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply folder filter
    if (selectedFolder) {
      filtered = filtered.filter(note => note.folderId === selectedFolder);
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(note =>
        selectedTags.every(tag => note.tags.includes(tag))
      );
    }

    // Apply mode filter
    switch (filterMode) {
      case 'favorites':
        filtered = filtered.filter(note => note.isFavorite);
        break;
      case 'recent':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(note => new Date(note.updatedAt) >= weekAgo);
        break;
      case 'archived':
        // Add archived filter if you have archived notes
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
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'mood':
        const moodOrder = { positive: 3, neutral: 2, negative: 1 };
        filtered.sort((a, b) => {
          const aMood = a.mood ? moodOrder[a.mood] : 0;
          const bMood = b.mood ? moodOrder[b.mood] : 0;
          return bMood - aMood;
        });
        break;
    }

    return filtered;
  }, [notes, searchQuery, selectedFolder, selectedTags, filterMode, sortMode]);

  // Get all tags for filter
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  const handleCreateNote = () => {
    setIsCreatingNote(true);
    setSelectedNoteId(undefined);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNoteId(note.id);
    setIsCreatingNote(false);
  };

  const handleSaveNote = async (noteData: Partial<Note>) => {
    try {
      if (selectedNoteId) {
        updateNote(selectedNoteId, noteData);
      } else {
        const newNote = {
          title: noteData.title || 'Untitled Note',
          content: noteData.content || '',
          markdown: noteData.markdown || noteData.content || '',
          tags: noteData.tags || [],
          category: noteData.category,
          mood: noteData.mood,
          folderId: selectedFolder || undefined,
          ownerId: 'current-user', // In real app, get from auth
          collaborators: [],
          viewers: [],
          isFavorite: false,
          isTemplate: false,
          shareSettings: {
            isPublic: false,
            allowComments: false
          },
          version: 1,
          versionHistory: [],
          comments: [],
          lastEditedBy: 'current-user'
        };
        addNote(newNote);
      }
      
      setSelectedNoteId(undefined);
      setIsCreatingNote(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleCloseEditor = () => {
    setSelectedNoteId(undefined);
    setIsCreatingNote(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
      if (selectedNoteId === noteId) {
        setSelectedNoteId(undefined);
      }
    }
  };

  const selectedNote = selectedNoteId ? notes.find(n => n.id === selectedNoteId) : null;

  if (isCreatingNote || selectedNote) {
    return (
      <div className="h-full flex flex-col">
        <NoteEditor
          note={selectedNote}
          onSave={handleSaveNote}
          onClose={handleCloseEditor}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                Notes
              </h1>
              <p className="text-muted-foreground">
                {filteredNotes.length} of {notes.length} notes
              </p>
            </div>
            
            <Button onClick={handleCreateNote} size={isMobile ? 'sm' : 'default'}>
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search notes..."
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
                  <SelectItem value="all">All Notes</SelectItem>
                  <SelectItem value="favorites">Favorites</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortMode} onValueChange={(value: SortMode) => setSortMode(value)}>
                <SelectTrigger className="w-32">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Last Updated</SelectItem>
                  <SelectItem value="created">Date Created</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="mood">Mood</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none border-x"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'compact' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('compact')}
                  className="rounded-l-none"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedFolder || selectedTags.length > 0 || filterMode !== 'all' || searchQuery) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedFolder && (
                <Badge variant="secondary" className="gap-1">
                  <Folder className="w-3 h-3" />
                  {folders.find(f => f.id === selectedFolder)?.name || 'Unknown Folder'}
                  <button
                    onClick={() => setSelectedFolder(null)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  <TagIcon className="w-3 h-3" />
                  {tag}
                  <button
                    onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              
              {filterMode !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  <Filter className="w-3 h-3" />
                  {filterMode}
                  <button
                    onClick={() => setFilterMode('all')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  <Search className="w-3 h-3" />
                  "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFolder(null);
                  setSelectedTags([]);
                  setFilterMode('all');
                  setSearchQuery('');
                }}
                className="h-6 px-2 text-xs"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notes found</h3>
              <p className="text-muted-foreground mb-6">
                {notes.length === 0 
                  ? "Start by creating your first note"
                  : "Try adjusting your search criteria"
                }
              </p>
              <Button onClick={handleCreateNote}>
                <Plus className="w-4 h-4 mr-2" />
                Create Note
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                "gap-4",
                viewMode === 'grid' && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                viewMode === 'list' && "flex flex-col",
                viewMode === 'compact' && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
              )}
            >
              <AnimatePresence>
                {filteredNotes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NoteCard
                      note={note}
                      viewMode={viewMode}
                      onEdit={() => handleEditNote(note)}
                      onDelete={() => handleDeleteNote(note.id)}
                      onToggleFavorite={() => toggleFavorite(note.id)}
                      onTagClick={(tag) => {
                        if (!selectedTags.includes(tag)) {
                          setSelectedTags(prev => [...prev, tag]);
                        }
                      }}
                    />
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