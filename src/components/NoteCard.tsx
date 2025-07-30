import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from '@phosphor-icons/react';
import type { Note } from '@/lib/types';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete, onToggleFavorite }: NoteCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText size={16} />
          {note.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {note.content}
        </p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            {note.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs bg-muted px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => onEdit(note)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onToggleFavorite(note.id)}>
              {note.isFavorite ? '★' : '☆'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}