import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Template as TemplateIcon, 
  Plus, 
  Users, 
  Briefcase, 
  Book, 
  Lightbulb 
} from '@phosphor-icons/react';
import { defaultTemplates } from '@/lib/templates';
import { useNotes, useAppState } from '@/hooks/use-notes';
import { NoteEditor } from './NoteEditor';
import type { Template, Note } from '@/lib/types';

export function TemplatesView() {
  const { addNote } = useNotes();
  const { isCreatingNote, setIsCreatingNote, selectedNoteId, setSelectedNoteId } = useAppState();

  const getCategoryIcon = (category: Template['category']) => {
    switch (category) {
      case 'meeting':
        return Users;
      case 'project':
        return Briefcase;
      case 'journal':
        return Book;
      case 'custom':
        return Lightbulb;
      default:
        return TemplateIcon;
    }
  };

  const getCategoryColor = (category: Template['category']) => {
    switch (category) {
      case 'meeting':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'project':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'journal':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'custom':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleUseTemplate = (template: Template) => {
    const newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
      title: template.name,
      content: template.content,
      markdown: template.content,
      tags: [...template.tags],
      isFavorite: false,
      templateId: template.id
    };

    const savedNote = addNote(newNote);
    setSelectedNoteId(savedNote.id);
  };

  const handleSaveNote = (note: Note) => {
    // Note is already saved via addNote, just close editor
    setSelectedNoteId(undefined);
    setIsCreatingNote(false);
  };

  const handleCloseEditor = () => {
    setSelectedNoteId(undefined);
    setIsCreatingNote(false);
  };

  const selectedNote = selectedNoteId ? undefined : undefined; // We handle this in addNote

  if (selectedNoteId) {
    return (
      <NoteEditor
        note={selectedNote}
        onSave={handleSaveNote}
        onClose={handleCloseEditor}
        className="h-full"
      />
    );
  }

  const categorizedTemplates = defaultTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<Template['category'], Template[]>);

  return (
    <div className="h-full overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <TemplateIcon size={32} className="text-primary" />
                Templates
              </h1>
              <p className="text-muted-foreground mt-1">
                Get started quickly with pre-built note structures
              </p>
            </div>
          </div>

          {/* Template Categories */}
          {Object.entries(categorizedTemplates).map(([category, templates]) => {
            const IconComponent = getCategoryIcon(category as Template['category']);
            
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <IconComponent size={24} className="text-muted-foreground" />
                  <h2 className="text-xl font-semibold capitalize">{category}</h2>
                  <Badge variant="outline" className="ml-2">
                    {templates.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => {
                    const IconComponent = getCategoryIcon(template.category);
                    
                    return (
                      <Card 
                        key={template.id} 
                        className="group hover:shadow-lg transition-all duration-200 glass-card cursor-pointer"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                                <IconComponent size={20} />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                <Badge 
                                  variant="outline" 
                                  className={`mt-1 text-xs ${getCategoryColor(template.category)}`}
                                >
                                  {template.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                            {template.description}
                          </p>

                          {/* Preview of content structure */}
                          <div className="mb-4 p-3 bg-muted/30 rounded-md text-xs font-mono">
                            <div className="text-muted-foreground mb-1">Preview:</div>
                            <div className="space-y-1">
                              {template.content.split('\n').slice(0, 4).map((line, index) => (
                                <div key={index} className="truncate">
                                  {line.trim() || '\u00A0'}
                                </div>
                              ))}
                              <div className="text-muted-foreground">...</div>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {template.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <Button 
                            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            variant="outline"
                          >
                            <Plus size={16} className="mr-2" />
                            Use Template
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Custom Templates Placeholder */}
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={24} className="text-muted-foreground" />
              <h2 className="text-xl font-semibold">Custom Templates</h2>
              <Badge variant="outline">Coming Soon</Badge>
            </div>

            <Card className="glass-card border-dashed">
              <CardContent className="py-12 text-center">
                <TemplateIcon size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Create Custom Templates</h3>
                <p className="text-muted-foreground mb-4">
                  Save your frequently used note structures as reusable templates
                </p>
                <Button variant="outline" disabled>
                  <Plus size={16} className="mr-2" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}