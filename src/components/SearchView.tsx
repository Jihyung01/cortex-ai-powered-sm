import React, { useState, useMemo, useEffect } from 'react';
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
  FileText, 
  CheckSquare, 
  Template, 
  Filter,
  Calendar,
  Tag as TagIcon,
  Star,
  Clock,
  Sparkle,
  TrendUp,
  Eye,
  Brain
} from '@phosphor-icons/react';
import { useNotes } from '@/hooks/use-notes';
import { useTasks } from '@/hooks/use-tasks';
import { useIsMobile } from '@/hooks/use-mobile';
import { NoteCard } from './NoteCard';
import { cn } from '@/lib/utils';
import type { Note, Task } from '@/lib/types';

type SearchScope = 'all' | 'notes' | 'tasks' | 'templates';
type SortMode = 'relevance' | 'date' | 'title' | 'type';

interface SearchResult {
  type: 'note' | 'task' | 'template';
  id: string;
  title: string;
  content: string;
  relevanceScore: number;
  tags: string[];
  updatedAt: Date;
  data: Note | Task | any;
}

export default function SearchView() {
  const { notes, folders } = useNotes();
  const { tasks } = useTasks();
  const isMobile = useIsMobile();
  
  // Search state
  const [query, setQuery] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('all');
  const [sortMode, setSortMode] = useState<SortMode>('relevance');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Get templates (you would implement this from a templates hook)
  const templates = []; // Placeholder - you would get this from a useTemplates hook

  // Calculate search results
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search function that calculates relevance score
    const calculateRelevance = (title: string, content: string, tags: string[]): number => {
      let score = 0;
      
      // Title matches get highest score
      if (title.toLowerCase().includes(searchTerm)) {
        score += 10;
        if (title.toLowerCase() === searchTerm) score += 20;
        if (title.toLowerCase().startsWith(searchTerm)) score += 10;
      }
      
      // Content matches
      const contentLower = content.toLowerCase();
      const matches = (contentLower.match(new RegExp(searchTerm, 'g')) || []).length;
      score += matches * 2;
      
      // Tag matches
      tags.forEach(tag => {
        if (tag.toLowerCase().includes(searchTerm)) {
          score += 5;
          if (tag.toLowerCase() === searchTerm) score += 10;
        }
      });
      
      return score;
    };

    // Search notes
    if (searchScope === 'all' || searchScope === 'notes') {
      notes.forEach(note => {
        const relevance = calculateRelevance(note.title, note.content, note.tags);
        if (relevance > 0) {
          results.push({
            type: 'note',
            id: note.id,
            title: note.title,
            content: note.content,
            relevanceScore: relevance,
            tags: note.tags,
            updatedAt: new Date(note.updatedAt),
            data: note
          });
        }
      });
    }

    // Search tasks
    if (searchScope === 'all' || searchScope === 'tasks') {
      tasks.forEach(task => {
        const content = task.description || '';
        const relevance = calculateRelevance(task.title, content, task.tags);
        if (relevance > 0) {
          results.push({
            type: 'task',
            id: task.id,
            title: task.title,
            content: content,
            relevanceScore: relevance,
            tags: task.tags,
            updatedAt: new Date(task.updatedAt),
            data: task
          });
        }
      });
    }

    // Search templates
    if (searchScope === 'all' || searchScope === 'templates') {
      templates.forEach((template: any) => {
        const relevance = calculateRelevance(template.name, template.content, template.tags);
        if (relevance > 0) {
          results.push({
            type: 'template',
            id: template.id,
            title: template.name,
            content: template.content,
            relevanceScore: relevance,
            tags: template.tags,
            updatedAt: new Date(), // Templates might not have update dates
            data: template
          });
        }
      });
    }

    // Apply tag filters
    const tagFiltered = selectedTags.length > 0 
      ? results.filter(result => 
          selectedTags.every(tag => result.tags.includes(tag))
        )
      : results;

    // Apply date filter
    const dateFiltered = dateFilter
      ? tagFiltered.filter(result => {
          const resultDate = result.updatedAt;
          const now = new Date();
          
          switch (dateFilter) {
            case 'today':
              return resultDate.toDateString() === now.toDateString();
            case 'week':
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return resultDate >= weekAgo;
            case 'month':
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return resultDate >= monthAgo;
            default:
              return true;
          }
        })
      : tagFiltered;

    // Sort results
    switch (sortMode) {
      case 'relevance':
        dateFiltered.sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
      case 'date':
        dateFiltered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        break;
      case 'title':
        dateFiltered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'type':
        dateFiltered.sort((a, b) => {
          if (a.type !== b.type) return a.type.localeCompare(b.type);
          return b.relevanceScore - a.relevanceScore;
        });
        break;
    }

    return dateFiltered;
  }, [query, searchScope, sortMode, selectedTags, dateFilter, notes, tasks, templates]);

  // Get all available tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)));
    tasks.forEach(task => task.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [notes, tasks]);

  // Search stats
  const searchStats = useMemo(() => {
    const stats = {
      total: searchResults.length,
      notes: searchResults.filter(r => r.type === 'note').length,
      tasks: searchResults.filter(r => r.type === 'task').length,
      templates: searchResults.filter(r => r.type === 'template').length
    };
    return stats;
  }, [searchResults]);

  // Handle search
  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    
    if (newQuery.trim() && !recentSearches.includes(newQuery.trim())) {
      const updated = [newQuery.trim(), ...recentSearches.slice(0, 9)];
      setRecentSearches(updated);
      // You might want to persist this to localStorage
    }
  };

  const highlightSearchTerm = (text: string, maxLength: number = 150) => {
    if (!query.trim()) return text.slice(0, maxLength);
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const highlighted = text.replace(regex, '<mark>$1</mark>');
    
    return highlighted.length > maxLength 
      ? highlighted.slice(0, maxLength) + '...'
      : highlighted;
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'note': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'task': return <CheckSquare className="w-4 h-4 text-green-500" />;
      case 'template': return <Template className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Search</h1>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search notes, tasks, and templates..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 text-base"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setQuery('')}
              >
                ×
              </Button>
            )}
          </div>

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Recent Searches</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.slice(0, 5).map((search, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => setQuery(search)}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          {query && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={searchScope} onValueChange={(value: SearchScope) => setSearchScope(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="notes">Notes Only</SelectItem>
                  <SelectItem value="tasks">Tasks Only</SelectItem>
                  <SelectItem value="templates">Templates Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortMode} onValueChange={(value: SortMode) => setSortMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date Modified</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Any date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any date</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Search Stats */}
          {query && (
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span>
                {searchStats.total} result{searchStats.total !== 1 ? 's' : ''} for "{query}"
              </span>
              {searchStats.notes > 0 && <span>{searchStats.notes} notes</span>}
              {searchStats.tasks > 0 && <span>{searchStats.tasks} tasks</span>}
              {searchStats.templates > 0 && <span>{searchStats.templates} templates</span>}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {!query ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Search your content</h3>
              <p className="text-muted-foreground mb-6">
                Find notes, tasks, and templates quickly and easily
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <Card className="p-4 text-center">
                  <FileText className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <h4 className="font-medium">Notes</h4>
                  <p className="text-sm text-muted-foreground">{notes.length} notes</p>
                </Card>
                <Card className="p-4 text-center">
                  <CheckSquare className="w-8 h-8 mx-auto text-green-500 mb-2" />
                  <h4 className="font-medium">Tasks</h4>
                  <p className="text-sm text-muted-foreground">{tasks.length} tasks</p>
                </Card>
                <Card className="p-4 text-center">
                  <Template className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                  <h4 className="font-medium">Templates</h4>
                  <p className="text-sm text-muted-foreground">{templates.length} templates</p>
                </Card>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or filters
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Check for typos in your search</p>
                <p>• Try different keywords</p>
                <p>• Remove filters to broaden your search</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {searchResults.map((result, index) => (
                  <motion.div
                    key={`${result.type}-${result.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {getResultIcon(result.type)}
                            <Badge variant="outline" className="text-xs capitalize">
                              {result.type}
                            </Badge>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold mb-1 truncate">
                              <span 
                                dangerouslySetInnerHTML={{ 
                                  __html: highlightSearchTerm(result.title, 100) 
                                }} 
                              />
                            </h3>
                            
                            {result.content && (
                              <p 
                                className="text-sm text-muted-foreground mb-2 line-clamp-2"
                                dangerouslySetInnerHTML={{ 
                                  __html: highlightSearchTerm(result.content, 150) 
                                }}
                              />
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(result.updatedAt)}</span>
                                </div>
                                
                                {result.tags.length > 0 && (
                                  <div className="flex gap-1">
                                    {result.tags.slice(0, 3).map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {result.tags.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{result.tags.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Badge variant="secondary" className="text-xs">
                                  <Sparkle className="w-3 h-3 mr-1" />
                                  {result.relevanceScore}
                                </Badge>
                                <Button size="sm" variant="ghost">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Open
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