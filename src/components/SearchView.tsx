import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MagnifyingGlass, 
  Funnel, 
  X, 
  Calendar,
  Tag as TagIcon,
  Star,
  SmileyBlank,
  Smiley,
  FrownyFace
} from '@phosphor-icons/react';
import { useSearch, useNotes } from '@/hooks/use-notes';
import { NoteCard } from './NoteCard';
import { cn } from '@/lib/utils';

export function SearchView() {
  const { 
    filters, 
    searchResults, 
    updateFilters, 
    clearFilters, 
    allTags 
  } = useSearch();
  const { deleteNote, toggleFavorite, updateNote } = useNotes();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags);

  const handleSearch = (query: string) => {
    updateFilters({ query });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    updateFilters({ tags: newTags });
  };

  const handleMoodFilter = (mood: 'positive' | 'neutral' | 'negative' | undefined) => {
    updateFilters({ mood });
  };

  const handleFavoritesFilter = () => {
    updateFilters({ onlyFavorites: !filters.onlyFavorites });
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    clearFilters();
  };

  const activeFilterCount = 
    (filters.query ? 1 : 0) +
    filters.tags.length +
    (filters.mood ? 1 : 0) +
    (filters.onlyFavorites ? 1 : 0);

  return (
    <div className="h-full flex flex-col">
      {/* Search Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <MagnifyingGlass size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={filters.query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 text-base"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "transition-colors",
              showFilters && "bg-muted"
            )}
          >
            <Funnel size={16} className="mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.query && (
              <Badge variant="outline">
                Search: "{filters.query}"
                <X 
                  size={12} 
                  className="ml-1 cursor-pointer" 
                  onClick={() => handleSearch('')}
                />
              </Badge>
            )}
            {filters.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                <TagIcon size={12} className="mr-1" />
                {tag}
                <X 
                  size={12} 
                  className="ml-1 cursor-pointer" 
                  onClick={() => handleTagToggle(tag)}
                />
              </Badge>
            ))}
            {filters.mood && (
              <Badge variant="outline">
                Mood: {filters.mood}
                <X 
                  size={12} 
                  className="ml-1 cursor-pointer" 
                  onClick={() => handleMoodFilter(undefined)}
                />
              </Badge>
            )}
            {filters.onlyFavorites && (
              <Badge variant="outline">
                <Star size={12} className="mr-1" />
                Favorites only
                <X 
                  size={12} 
                  className="ml-1 cursor-pointer" 
                  onClick={handleFavoritesFilter}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs h-6"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Filters Panel */}
        {showFilters && (
          <Card className="w-80 m-6 mr-0 glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ScrollArea className="h-[calc(100vh-200px)]">
                {/* Mood Filter */}
                <div className="space-y-3">
                  <h3 className="font-medium">Mood</h3>
                  <div className="space-y-2">
                    {[
                      { value: undefined, label: 'All moods', icon: null },
                      { value: 'positive' as const, label: 'Positive', icon: Smiley },
                      { value: 'neutral' as const, label: 'Neutral', icon: SmileyBlank },
                      { value: 'negative' as const, label: 'Negative', icon: FrownyFace }
                    ].map((mood) => (
                      <Button
                        key={mood.label}
                        variant={filters.mood === mood.value ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleMoodFilter(mood.value)}
                      >
                        {mood.icon && <mood.icon size={16} className="mr-2" />}
                        {mood.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Favorites Filter */}
                <div className="space-y-3">
                  <h3 className="font-medium">Special</h3>
                  <Button
                    variant={filters.onlyFavorites ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={handleFavoritesFilter}
                  >
                    <Star size={16} className="mr-2" />
                    Favorites only
                  </Button>
                </div>

                <Separator className="my-6" />

                {/* Tags Filter */}
                {allTags.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Tags</h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {allTags.map((tag) => (
                        <Button
                          key={tag}
                          variant={selectedTags.includes(tag) ? "secondary" : "ghost"}
                          className="w-full justify-start text-sm"
                          onClick={() => handleTagToggle(tag)}
                        >
                          <TagIcon size={14} className="mr-2" />
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Search Results
              <span className="ml-2 text-base text-muted-foreground font-normal">
                ({searchResults.length} {searchResults.length === 1 ? 'note' : 'notes'})
              </span>
            </h2>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {searchResults.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={(note) => updateNote(note.id, note)}
                    onDelete={deleteNote}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <MagnifyingGlass size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notes found</h3>
                  <p className="text-muted-foreground">
                    {filters.query || activeFilterCount > 0
                      ? "Try adjusting your search criteria or filters"
                      : "Start typing to search through your notes"
                    }
                  </p>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="mt-4"
                    >
                      Clear filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}