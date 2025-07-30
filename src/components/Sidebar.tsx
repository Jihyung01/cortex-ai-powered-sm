import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  FolderOpen, 
  Search, 
  Star, 
  Clock, 
  Plus, 
  FileText,
  Template,
  Menu,
  X
} from '@phosphor-icons/react';
import { useNotes, useAppState } from '@/hooks/use-notes';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { 
    currentView, 
    setCurrentView, 
    sidebarCollapsed, 
    setSidebarCollapsed,
    setIsCreatingNote 
  } = useAppState();
  const { notes, folders, getFavoriteNotes, getRecentNotes } = useNotes();
  const isMobile = useIsMobile();

  const favoriteNotes = getFavoriteNotes();
  const recentNotes = getRecentNotes(5);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Brain,
      view: 'dashboard' as const,
      count: notes.length
    },
    {
      id: 'notes',
      label: 'All Notes',
      icon: FileText,
      view: 'notes' as const,
      count: notes.length
    },
    {
      id: 'folders',
      label: 'Folders',
      icon: FolderOpen,
      view: 'folders' as const,
      count: folders.length
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      view: 'search' as const
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: Template,
      view: 'templates' as const
    }
  ];

  const handleNewNote = () => {
    setIsCreatingNote(true);
    setCurrentView('notes');
  };

  if (isMobile && sidebarCollapsed) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 glass-card"
        onClick={() => setSidebarCollapsed(false)}
      >
        <Menu size={20} />
      </Button>
    );
  }

  return (
    <>
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      <div className={cn(
        "h-full bg-card/80 backdrop-blur-xl border-r border-border/50 flex flex-col",
        isMobile && !sidebarCollapsed && "fixed left-0 top-0 z-50 w-80",
        isMobile && sidebarCollapsed && "hidden",
        !isMobile && sidebarCollapsed && "w-16",
        !isMobile && !sidebarCollapsed && "w-80",
        "transition-all duration-300 ease-in-out",
        className
      )}>
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Brain size={20} className="text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Cortex</h1>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-muted-foreground hover:text-foreground"
            >
              {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
            </Button>
          </div>
        </div>

        {/* New Note Button */}
        <div className="p-4">
          <Button
            onClick={handleNewNote}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size={sidebarCollapsed ? "icon" : "default"}
          >
            <Plus size={20} />
            {!sidebarCollapsed && <span className="ml-2">New Note</span>}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.view ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-left",
                  sidebarCollapsed && "justify-center"
                )}
                onClick={() => setCurrentView(item.view)}
              >
                <item.icon size={20} />
                {!sidebarCollapsed && (
                  <>
                    <span className="ml-3">{item.label}</span>
                    {item.count !== undefined && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.count}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            ))}
          </div>

          {!sidebarCollapsed && (
            <>
              <Separator className="my-6" />
              
              {/* Quick Access */}
              <div className="space-y-4">
                {favoriteNotes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <Star size={16} className="text-yellow-600" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Favorites
                      </span>
                    </div>
                    <div className="space-y-1">
                      {favoriteNotes.slice(0, 3).map((note) => (
                        <Button
                          key={note.id}
                          variant="ghost"
                          className="w-full justify-start text-left h-auto py-2 px-2"
                          onClick={() => {
                            setCurrentView('notes');
                            // setSelectedNoteId(note.id);
                          }}
                        >
                          <div className="truncate">
                            <div className="text-sm font-medium truncate">
                              {note.title || 'Untitled'}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {note.content.slice(0, 50)}...
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {recentNotes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2 px-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Recent
                      </span>
                    </div>
                    <div className="space-y-1">
                      {recentNotes.slice(0, 3).map((note) => (
                        <Button
                          key={note.id}
                          variant="ghost"
                          className="w-full justify-start text-left h-auto py-2 px-2"
                          onClick={() => {
                            setCurrentView('notes');
                            // setSelectedNoteId(note.id);
                          }}
                        >
                          <div className="truncate">
                            <div className="text-sm font-medium truncate">
                              {note.title || 'Untitled'}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {new Date(note.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </ScrollArea>
      </div>
    </>
  );
}