import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Star, 
  Tag as TagIcon, 
  Calendar, 
  Edit2, 
  Trash2, 
  Heart,
  Eye
} from '@phosphor-icons/react';
import { getMoodColor, getMoodIcon } from '@/lib/ai';
import { cn } from '@/lib/utils';
import type { Note } from '@/lib/types';

interface NoteCardProps {
  note: Note;
  viewMode?: 'grid' | 'list' | 'compact';
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  onTagClick?: (tag: string) => void;
}

export function NoteCard({ 
  note, 
  viewMode = 'grid',
  onEdit, 
  onDelete, 
  onToggleFavorite,
  onTagClick 
}: NoteCardProps) {
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const getPreview = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength).trim() + '...';
  };

  if (viewMode === 'list') {
    return (
      <Card className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="font-semibold truncate flex-1">{note.title}</h3>
                {note.isFavorite && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
                {note.mood && (
                  <span className="text-sm">{getMoodIcon(note.mood)}</span>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {getPreview(note.content, 200)}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(note.updatedAt)}
                  </span>
                  
                  {note.tags.length > 0 && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex gap-1">
                        {note.tags.slice(0, 3).map(tag => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="text-xs cursor-pointer hover:bg-primary/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTagClick?.(tag);
                            }}
                          >
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{note.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.();
                  }}>
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.();
                  }}>
                    <Star className={cn(
                      "w-3 h-3",
                      note.isFavorite ? "text-yellow-500 fill-current" : "text-muted-foreground"
                    )} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                  }}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'compact') {
    return (
      <Card className="glass-card hover:shadow-md transition-all duration-200 cursor-pointer group">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-3 h-3 text-primary flex-shrink-0" />
            <h4 className="font-medium text-sm truncate flex-1">{note.title}</h4>
            {note.isFavorite && (
              <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {getPreview(note.content, 80)}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatDate(note.updatedAt)}
            </span>
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}>
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.();
              }}>
                <Star className={cn(
                  "w-3 h-3",
                  note.isFavorite ? "text-yellow-500 fill-current" : "text-muted-foreground"
                )} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className="glass-card hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
            <CardTitle className="text-base font-semibold line-clamp-2 flex-1">
              {note.title}
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {note.isFavorite && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
            {note.mood && (
              <span className={cn("text-xs px-2 py-1 rounded-full", getMoodColor(note.mood))}>
                {getMoodIcon(note.mood)}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex flex-col h-full">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
          {getPreview(note.content)}
        </p>
        
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {note.tags.slice(0, 3).map(tag => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs cursor-pointer hover:bg-primary/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
              >
                <TagIcon className="w-2 h-2 mr-1" />
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formatDate(note.updatedAt)}
            </span>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}>
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.();
            }}>
              <Star className={cn(
                "w-3 h-3",
                note.isFavorite ? "text-yellow-500 fill-current" : "text-muted-foreground"
              )} />
            </Button>
            <Button size="sm" variant="ghost" onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}