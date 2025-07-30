import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  X, 
  Tag, 
  Brain, 
  Star,
  StarFilled,
  Folder
} from '@phosphor-icons/react';
import { useNotes } from '@/hooks/use-notes';
import { analyzeNoteContent, getMoodColor, getMoodIcon } from '@/lib/ai';
import { cn } from '@/lib/utils';
import type { Note, AIAnalysis } from '@/lib/types';

interface NoteEditorProps {
  note?: Note;
  onClose: () => void;
  onSave: (note: Note) => void;
  className?: string;
}

export function NoteEditor({ note, onClose, onSave, className }: NoteEditorProps) {
  const { folders } = useNotes();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [folderId, setFolderId] = useState(note?.folderId);
  const [isFavorite, setIsFavorite] = useState(note?.isFavorite || false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const analyzeContent = useCallback(async () => {
    if (!content.trim() || content.length < 10) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      const result = await analyzeNoteContent(content);
      setAnalysis(result);
      setAnalysisProgress(100);
      
      // Auto-apply high-confidence suggestions
      if (result.confidence > 0.7) {
        const newTags = result.suggestedTags.filter(tag => !tags.includes(tag));
        if (newTags.length > 0) {
          setTags(prev => [...prev, ...newTags.slice(0, 3)]);
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress(0);
      }, 500);
    }
  }, [content, tags]);

  // Debounced analysis trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      analyzeContent();
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, analyzeContent]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    const noteData: Note = {
      id: note?.id || crypto.randomUUID(),
      title: title.trim() || 'Untitled',
      content,
      markdown: content, // In a full implementation, this would be converted markdown
      tags,
      folderId,
      isFavorite,
      createdAt: note?.createdAt || new Date(),
      updatedAt: new Date(),
      category: analysis?.suggestedCategory,
      mood: analysis?.mood,
      summary: analysis?.summary
    };

    onSave(noteData);
  };

  const applySuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  return (
    <div className={cn("h-full flex flex-col bg-card", className)}>
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className={cn(
                "transition-colors",
                isFavorite && "text-yellow-600 hover:text-yellow-700"
              )}
            >
              {isFavorite ? <StarFilled size={20} /> : <Star size={20} />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* AI Analysis Status */}
        {isAnalyzing && (
          <div className="mb-4 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={16} className="text-primary animate-pulse" />
              <span className="text-sm font-medium">AI Analysis in progress...</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !isAnalyzing && (
          <div className="mb-4 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={16} className="text-primary" />
              <span className="text-sm font-medium">AI Insights</span>
              {analysis.mood && (
                <Badge variant="outline" className={getMoodColor(analysis.mood)}>
                  {getMoodIcon(analysis.mood)} {analysis.mood}
                </Badge>
              )}
            </div>
            
            {analysis.suggestedTags.length > 0 && (
              <div className="mb-2">
                <span className="text-xs text-muted-foreground mb-1 block">
                  Suggested tags:
                </span>
                <div className="flex flex-wrap gap-1">
                  {analysis.suggestedTags.map((tag) => (
                    <Button
                      key={tag}
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => applySuggestedTag(tag)}
                      disabled={tags.includes(tag)}
                    >
                      <Tag size={12} className="mr-1" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {analysis.summary && (
              <div>
                <span className="text-xs text-muted-foreground mb-1 block">
                  Summary:
                </span>
                <p className="text-sm text-muted-foreground">{analysis.summary}</p>
              </div>
            )}
          </div>
        )}

        {/* Title Input */}
        <Input
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold border-none bg-transparent p-0 focus-visible:ring-0"
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <Textarea
          placeholder="Start writing your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[400px] border-none bg-transparent resize-none focus-visible:ring-0 text-base leading-relaxed"
        />
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border/50 space-y-4">
        {/* Tags */}
        <div>
          <label className="text-sm font-medium mb-2 block">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleRemoveTag(tag)}
              >
                {tag} <X size={12} className="ml-1" />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              className="flex-1"
            />
            <Button variant="outline" onClick={handleAddTag} disabled={!newTag.trim()}>
              <Tag size={16} />
            </Button>
          </div>
        </div>

        {/* Folder Selection */}
        {folders.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Folder</label>
            <select
              value={folderId || ''}
              onChange={(e) => setFolderId(e.target.value || undefined)}
              className="w-full p-2 rounded-md border border-input bg-background"
            >
              <option value="">No folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  <Folder size={16} className="inline mr-2" />
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {content.split(/\s+/).filter(word => word.length > 0).length} words
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
              <Save size={16} className="mr-2" />
              Save Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}