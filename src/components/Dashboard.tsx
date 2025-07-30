import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  FileText, 
  Star, 
  Clock, 
  TrendUp,
  Calendar,
  Tag as TagIcon,
  Plus
} from '@phosphor-icons/react';
import { useNotes, useAppState } from '@/hooks/use-notes';
import { NoteCard } from './NoteCard';
import { NoteEditor } from './NoteEditor';
import { getMoodColor, getMoodIcon } from '@/lib/ai';
import type { Note } from '@/lib/types';

export function Dashboard() {
  const { 
    notes, 
    addNote, 
    updateNote, 
    deleteNote, 
    toggleFavorite,
    getFavoriteNotes, 
    getRecentNotes 
  } = useNotes();
  const { isCreatingNote, setIsCreatingNote, selectedNoteId, setSelectedNoteId } = useAppState();

  const recentNotes = getRecentNotes(6);
  const favoriteNotes = getFavoriteNotes();
  const totalNotes = notes.length;

  // Analytics
  const moodDistribution = notes.reduce((acc, note) => {
    if (note.mood) {
      acc[note.mood] = (acc[note.mood] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const allTags = notes.reduce((acc, note) => {
    note.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(allTags)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);

  const thisWeekNotes = notes.filter(note => {
    const noteDate = new Date(note.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return noteDate >= weekAgo;
  });

  const handleEditNote = (note: Note) => {
    setSelectedNoteId(note.id);
  };

  const handleSaveNote = (note: Note) => {
    if (selectedNoteId) {
      updateNote(note.id, note);
    } else {
      addNote(note);
    }
    setSelectedNoteId(undefined);
    setIsCreatingNote(false);
  };

  const handleCloseEditor = () => {
    setSelectedNoteId(undefined);
    setIsCreatingNote(false);
  };

  const selectedNote = selectedNoteId ? notes.find(n => n.id === selectedNoteId) : undefined;

  if (isCreatingNote || selectedNoteId) {
    return (
      <NoteEditor
        note={selectedNote}
        onSave={handleSaveNote}
        onClose={handleCloseEditor}
        className="h-full"
      />
    );
  }

  return (
    <div className="h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Brain size={32} className="text-primary" />
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Your intelligent note-taking overview
              </p>
            </div>
            <Button 
              onClick={() => setIsCreatingNote(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus size={16} className="mr-2" />
              New Note
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Notes
                  </CardTitle>
                  <FileText size={16} className="text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalNotes}</div>
                <div className="text-xs text-muted-foreground">
                  {thisWeekNotes.length} this week
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Favorites
                  </CardTitle>
                  <Star size={16} className="text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{favoriteNotes.length}</div>
                <div className="text-xs text-muted-foreground">
                  {((favoriteNotes.length / Math.max(totalNotes, 1)) * 100).toFixed(0)}% of total
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    This Week
                  </CardTitle>
                  <TrendUp size={16} className="text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{thisWeekNotes.length}</div>
                <div className="text-xs text-muted-foreground">
                  Notes created
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Tags
                  </CardTitle>
                  <TagIcon size={16} className="text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{topTags.length}</div>
                <div className="text-xs text-muted-foreground">
                  Unique tags
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Notes */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={20} className="text-muted-foreground" />
              <h2 className="text-xl font-semibold">Recent Notes</h2>
            </div>
            {recentNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {recentNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={deleteNote}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <Card className="glass-card">
                <CardContent className="py-8 text-center">
                  <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your knowledge journey by creating your first note
                  </p>
                  <Button onClick={() => setIsCreatingNote(true)}>
                    <Plus size={16} className="mr-2" />
                    Create First Note
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mood Distribution */}
            {Object.keys(moodDistribution).length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain size={20} />
                    Mood Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(moodDistribution).map(([mood, count]) => {
                      const percentage = (count / totalNotes) * 100;
                      return (
                        <div key={mood} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getMoodColor(mood as any)}>
                              {getMoodIcon(mood as any)} {mood}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-primary" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-8">
                              {count}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Tags */}
            {topTags.length > 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TagIcon size={20} />
                    Popular Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {topTags.map(([tag, count]) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        {tag} <span className="ml-1 text-xs">({count})</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Favorites Section */}
          {favoriteNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star size={20} className="text-yellow-600" />
                <h2 className="text-xl font-semibold">Favorite Notes</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {favoriteNotes.slice(0, 6).map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={deleteNote}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}