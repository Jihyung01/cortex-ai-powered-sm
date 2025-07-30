import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save } from '@phosphor-icons/react';
import type { Note } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  note?: Note;
  onSave: (note: Note) => void;
  onClose: () => void;
  className?: string;
}

export function NoteEditor({ note, onSave, onClose, className }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);

  const handleSave = () => {
    const noteData: Note = {
      id: note?.id || crypto.randomUUID(),
      title: title.trim() || 'Untitled',
      content: content.trim(),
      markdown: content.trim(), // For now, same as content
      tags,
      isFavorite: note?.isFavorite || false,
      createdAt: note?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    onSave(noteData);
  };

  return (
    <div className={cn('h-full flex flex-col', className)}>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>{note ? 'Edit Note' : 'New Note'}</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save size={16} className="mr-2" />
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="p-4 border-b">
            <Input
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium border-none px-0 focus-visible:ring-0"
            />
          </div>
          <div className="flex-1 p-4">
            <Textarea
              placeholder="Start writing..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[400px] border-none px-0 focus-visible:ring-0 resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}