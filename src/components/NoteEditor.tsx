import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  X, 
  Save, 
  Tag as TagIcon, 
  Brain, 
  Sparkle,
  FileText
} from '@phosphor-icons/react';
import type { Note } from '@/lib/types';
import { analyzeNoteContent } from '@/lib/ai';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  note?: Note | null;
  onSave: (noteData: Partial<Note>) => void;
  onClose: () => void;
  className?: string;
}

export function NoteEditor({ note, onSave, onClose, className }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [category, setCategory] = useState(note?.category || '');
  const [mood, setMood] = useState<'positive' | 'neutral' | 'negative' | undefined>(note?.mood);
  const [newTag, setNewTag] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSave = () => {
    const noteData: Partial<Note> = {
      title: title.trim() || 'Untitled',
      content: content.trim(),
      markdown: content.trim(), // For now, same as content
      tags,
      category: category || undefined,
      mood: mood || undefined
    };
    
    onSave(noteData);
  };

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAnalyzeContent = async () => {
    if (!content.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeNoteContent(content);
      
      // Suggest tags (add to existing ones)
      const newSuggestedTags = analysis.suggestedTags.filter(tag => !tags.includes(tag));
      if (newSuggestedTags.length > 0) {
        setTags([...tags, ...newSuggestedTags]);
      }
      
      // Suggest category if not set
      if (!category && analysis.suggestedCategory) {
        setCategory(analysis.suggestedCategory);
      }
      
      // Suggest mood if not set
      if (!mood && analysis.mood) {
        setMood(analysis.mood);
      }
    } catch (error) {
      console.error('Failed to analyze content:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className={cn('h-full flex flex-col', className)}>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle>{note ? 'Edit Note' : 'New Note'}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleAnalyzeContent} 
                size="sm" 
                variant="outline"
                disabled={isAnalyzing || !content.trim()}
              >
                {isAnalyzing ? (
                  <Sparkle className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'AI Analyze'}
              </Button>
              <Button onClick={handleSave} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0" onKeyDown={handleKeyDown}>
          {/* Title Input */}
          <div className="p-4 border-b">
            <Input
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium border-none px-0 focus-visible:ring-0"
            />
          </div>

          {/* Metadata */}
          <div className="p-4 border-b bg-muted/20">
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Category:</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="idea">Idea</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="journal">Journal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Mood:</label>
                <Select value={mood || ''} onValueChange={(value) => setMood(value as any || undefined)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">😊 Positive</SelectItem>
                    <SelectItem value="neutral">😐 Neutral</SelectItem>
                    <SelectItem value="negative">😔 Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <TagIcon className="w-4 h-4" />
                <label className="text-sm font-medium">Tags:</label>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="w-32"
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="flex-1 p-4">
            <Textarea
              placeholder="Start writing your note..."
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