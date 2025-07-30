import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Template, 
  Plus, 
  Search, 
  Star,
  Calendar,
  Tag as TagIcon,
  Copy,
  Eye,
  FileText,
  Briefcase,
  Users,
  PresentationChart,
  BookOpen,
  Heart,
  Sparkle,
  TrendUp
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { useNotes } from '@/hooks/use-notes';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'meeting' | 'project' | 'journal' | 'custom' | 'productivity';
  content: string;
  tags: string[];
  usageCount?: number;
  isFavorite?: boolean;
  createdAt?: Date;
}

type FilterMode = 'all' | 'meeting' | 'project' | 'journal' | 'productivity' | 'favorites';
type SortMode = 'popular' | 'recent' | 'name' | 'category';

export default function TemplatesView() {
  const [templates, setTemplates] = useKV<Template[]>('cortex-templates', []);
  const { addNote } = useNotes();
  const isMobile = useIsMobile();
  
  // View state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortMode, setSortMode] = useState<SortMode>('popular');
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Initialize with demo templates if empty
  React.useEffect(() => {
    if (templates.length === 0) {
      const demoTemplates: Template[] = [
        {
          id: 'template-1',
          name: 'Weekly Review',
          description: 'Structured template for weekly productivity reviews and planning',
          category: 'productivity',
          content: `# Weekly Review - Week of [DATE]

## 🎯 Accomplishments This Week
- 
- 
- 

## 🚧 Challenges Faced
- 
- 

## 📚 Key Learnings
- 
- 

## 🎯 Goals for Next Week
1. 
2. 
3. 

## 🔄 Areas for Improvement
- 
- 

## 🙏 Gratitude & Wins
- 
- 

## 📊 Weekly Metrics
- **Productivity Score**: /10
- **Energy Level**: /10
- **Work-Life Balance**: /10

## 📝 Notes & Reflections
`,
          tags: ['review', 'productivity', 'weekly', 'planning'],
          usageCount: 45,
          isFavorite: true,
          createdAt: new Date()
        },
        {
          id: 'template-2',
          name: 'Meeting Notes',
          description: 'Professional template for meeting documentation and action items',
          category: 'meeting',
          content: `# Meeting Notes - [MEETING TITLE]

**📅 Date**: [DATE]  
**⏰ Time**: [TIME]  
**👥 Attendees**: [LIST ATTENDEES]  
**🎯 Meeting Type**: [STANDUP/PLANNING/REVIEW/OTHER]

## 📋 Agenda
1. 
2. 
3. 

## 💬 Discussion Points

### Topic 1: [TOPIC NAME]
- 
- 

### Topic 2: [TOPIC NAME]
- 
- 

## ✅ Decisions Made
- 
- 

## 📝 Action Items
| Task | Owner | Due Date | Status |
|------|-------|----------|--------|
|      |       |          |        |
|      |       |          |        |

## 🔄 Next Steps
- 
- 

## 📅 Next Meeting
**Date**: [DATE]  
**Agenda Items**: 
- 
- 

## 📌 Additional Notes
`,
          tags: ['meeting', 'notes', 'action-items', 'business'],
          usageCount: 32,
          isFavorite: false,
          createdAt: new Date()
        },
        {
          id: 'template-3',
          name: 'Project Kickoff',
          description: 'Comprehensive template for starting new projects with clear objectives',
          category: 'project',
          content: `# Project Kickoff: [PROJECT NAME]

## 📋 Project Overview
**🚀 Start Date**: [DATE]  
**🏁 Expected Completion**: [DATE]  
**👑 Project Owner**: [NAME]  
**👥 Team Members**: [LIST]  
**💰 Budget**: [AMOUNT]

## 🎯 Objectives

### Primary Goals
- 
- 

### Success Metrics (KPIs)
- 
- 

### Definition of Done
- 
- 

## 🔍 Scope & Requirements

### ✅ In Scope
- 
- 

### ❌ Out of Scope
- 
- 

### 📋 Requirements
- **Functional**: 
- **Non-functional**: 
- **Business**: 

## 📅 Timeline & Milestones
- **Week 1**: 
- **Week 2**: 
- **Week 3**: 
- **Week 4**: 

## 🛠️ Resources & Budget
- **Team Members**: 
- **Budget Allocation**: 
- **Tools Required**: 
- **External Dependencies**: 

## ⚠️ Risk Assessment
| Risk | Impact (1-5) | Probability (1-5) | Mitigation Strategy |
|------|-------------|-------------------|---------------------|
|      |             |                   |                     |

## 🚀 Next Steps
1. 
2. 
3. 

## 📞 Communication Plan
- **Status Updates**: 
- **Stakeholder Meetings**: 
- **Reporting**: 
`,
          tags: ['project', 'kickoff', 'planning', 'management'],
          usageCount: 28,
          isFavorite: false,
          createdAt: new Date()
        },
        {
          id: 'template-4',
          name: 'Daily Journal',
          description: 'Personal reflection template for daily journaling and mindfulness',
          category: 'journal',
          content: `# Daily Journal - [DATE]

## 🌅 Morning Reflection
**☀️ How am I feeling today?**
- 

**🎯 What are my priorities for today?**
1. 
2. 
3. 

**💭 What am I grateful for?**
- 
- 

## 📊 Daily Tracking
**⚡ Energy Level**: /10  
**😊 Mood**: /10  
**💪 Motivation**: /10  
**🏃 Physical Activity**: [DESCRIPTION]  
**💧 Water Intake**: [GLASSES/LITERS]  
**😴 Sleep Quality**: /10  

## 📝 Events & Experiences
**🌟 Highlights of the day:**
- 
- 

**📚 What did I learn today?**
- 
- 

**🤔 Challenges I faced:**
- 
- 

## 🌙 Evening Reflection
**✅ What did I accomplish today?**
- 
- 

**💭 What could I have done better?**
- 
- 

**🔄 What will I do differently tomorrow?**
- 
- 

## 🎯 Tomorrow's Intentions
- 
- 
- 

## 📱 Digital Wellness
**📱 Screen Time**: [HOURS]  
**📵 Phone-free time**: [DURATION]  
**🧘 Mindfulness/Meditation**: [MINUTES]

## 💭 Free Thoughts
[Space for any additional thoughts, ideas, or reflections]
`,
          tags: ['journal', 'reflection', 'mindfulness', 'daily'],
          usageCount: 67,
          isFavorite: true,
          createdAt: new Date()
        }
      ];
      
      setTemplates(demoTemplates);
    }
  }, [templates, setTemplates]);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = [...templates];

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    switch (filterMode) {
      case 'favorites':
        filtered = filtered.filter(template => template.isFavorite);
        break;
      case 'meeting':
      case 'project':
      case 'journal':
      case 'productivity':
        filtered = filtered.filter(template => template.category === filterMode);
        break;
    }

    // Apply sorting
    switch (sortMode) {
      case 'popular':
        filtered.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
        break;
      case 'recent':
        filtered.sort((a, b) => {
          const aDate = a.createdAt || new Date(0);
          const bDate = b.createdAt || new Date(0);
          return bDate.getTime() - aDate.getTime();
        });
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'category':
        filtered.sort((a, b) => {
          if (a.category !== b.category) return a.category.localeCompare(b.category);
          return (b.usageCount || 0) - (a.usageCount || 0);
        });
        break;
    }

    return filtered;
  }, [templates, searchQuery, filterMode, sortMode]);

  const handleUseTemplate = async (template: Template) => {
    try {
      // Create a new note from the template
      const newNote = {
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        content: template.content,
        markdown: template.content,
        tags: [...template.tags, 'from-template'],
        category: template.category === 'custom' ? undefined : template.category,
        templateId: template.id,
        ownerId: 'current-user',
        collaborators: [],
        viewers: [],
        isFavorite: false,
        isTemplate: false,
        shareSettings: {
          isPublic: false,
          allowComments: false
        },
        version: 1,
        versionHistory: [],
        comments: [],
        lastEditedBy: 'current-user'
      };
      
      addNote(newNote);
      
      // Increment usage count
      setTemplates(current => 
        current.map(t => 
          t.id === template.id 
            ? { ...t, usageCount: (t.usageCount || 0) + 1 }
            : t
        )
      );
      
      // You might want to navigate to the note editor here
      console.log('Created note from template:', newNote);
    } catch (error) {
      console.error('Error creating note from template:', error);
    }
  };

  const handleToggleFavorite = (templateId: string) => {
    setTemplates(current =>
      current.map(template =>
        template.id === templateId
          ? { ...template, isFavorite: !template.isFavorite }
          : template
      )
    );
  };

  const getCategoryIcon = (category: Template['category']) => {
    switch (category) {
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'project': return <Briefcase className="w-4 h-4" />;
      case 'journal': return <BookOpen className="w-4 h-4" />;
      case 'productivity': return <TrendUp className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: Template['category']) => {
    switch (category) {
      case 'meeting': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'project': return 'text-green-600 bg-green-50 border-green-200';
      case 'journal': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'productivity': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Template className="w-6 h-6 text-primary" />
                Templates
              </h1>
              <p className="text-muted-foreground">
                {filteredTemplates.length} of {templates.length} templates
              </p>
            </div>
            
            <Button onClick={() => setIsCreatingTemplate(true)} size={isMobile ? 'sm' : 'default'}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterMode} onValueChange={(value: FilterMode) => setFilterMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  <SelectItem value="favorites">Favorites</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="journal">Journal</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortMode} onValueChange={(value: SortMode) => setSortMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Template className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-6">
                {templates.length === 0 
                  ? "Start by creating your first template"
                  : "Try adjusting your search criteria"
                }
              </p>
              <Button onClick={() => setIsCreatingTemplate(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass-card hover:shadow-lg transition-all duration-200 group h-full flex flex-col">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            {getCategoryIcon(template.category)}
                            <CardTitle className="text-base font-semibold line-clamp-2 flex-1">
                              {template.name}
                            </CardTitle>
                          </div>
                          
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {template.isFavorite && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(template.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Star className={cn(
                                "w-3 h-3",
                                template.isFavorite ? "text-yellow-500 fill-current" : "text-muted-foreground"
                              )} />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 flex flex-col h-full">
                        <p className="text-sm text-muted-foreground mb-4 flex-1">
                          {template.description}
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge className={cn("text-xs", getCategoryColor(template.category))}>
                              {template.category}
                            </Badge>
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <TrendUp className="w-3 h-3" />
                              <span>{template.usageCount || 0} uses</span>
                            </div>
                          </div>
                          
                          {template.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {template.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {template.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{template.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <div className="flex gap-2 pt-2">
                            <Button 
                              onClick={() => handleUseTemplate(template)}
                              size="sm" 
                              className="flex-1"
                            >
                              <Copy className="w-3 h-3 mr-2" />
                              Use Template
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedTemplate(template)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}