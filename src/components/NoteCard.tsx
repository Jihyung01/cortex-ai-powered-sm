import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  StarFilled, 
  Trash, 
  Edit,
  Calendar,
  Tag as TagIcon
} from '@phosphor-icons/react';
import { getMoodColor, getMoodIcon } from '@/lib/ai';
import { cn } from '@/lib/utils';
import type { Note } from '@/lib/types';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  className?: string;
}

export function NoteCard({ 
  note, 
  onEdit, 
  onDelete, 
  onToggleFavorite, 
  className 
}: NoteCardProps) {
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const getPreviewText = (content: string, maxLength = 120) => {
    const text = content.replace(/[#*`]/g, '').trim();
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <Card className={cn(
      "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] glass-card",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-base leading-tight truncate mb-1"
              onClick={() => onEdit(note)}
            >
              {note.title || 'Untitled'}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={14} />
              <span>{formatDate(note.updatedAt)}</span>
              {note.mood && (
                <Badge variant="outline" className={cn("text-xs", getMoodColor(note.mood))}>
                  {getMoodIcon(note.mood)}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(note.id);
              }}
            >
              {note.isFavorite ? (
                <StarFilled size={16} className="text-yellow-600" />
              ) : (
                <Star size={16} />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
            >
              <Trash size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0" onClick={() => onEdit(note)}>
        {/* Content Preview */}
        {note.content && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {getPreviewText(note.content)}
          </p>
        )}

        {/* Summary */}
        {note.summary && (
          <div className="mb-3 p-2 rounded-md bg-muted/50">
            <div className="text-xs text-muted-foreground mb-1">AI Summary</div>
            <p className="text-sm">{note.summary}</p>
          </div>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <TagIcon size={14} className="text-muted-foreground" />
            {note.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{note.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Category */}
        {note.category && (
          <div className="mt-2 flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {note.category}
            </Badge>
            <div className="text-xs text-muted-foreground">
              {note.content.split(/\s+/).filter(word => word.length > 0).length} words
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}