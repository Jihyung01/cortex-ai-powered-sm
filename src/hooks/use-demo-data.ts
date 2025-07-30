import { useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/components/enterprise';

/**
 * Demo data population hook
 * Automatically populates the app with sample data when in demo mode
 */
export function useDemoData() {
  const { user } = useAuth();
  const [demoDataInitialized, setDemoDataInitialized] = useKV('demo-data-initialized', false);
  const [notes, setNotes] = useKV('notes', []);
  const [tasks, setTasks] = useKV('tasks', []);
  const [templates, setTemplates] = useKV('templates', []);

  const isDemoMode = user?.id === 'demo-user';

  useEffect(() => {
    if (isDemoMode && !demoDataInitialized) {
      populateDemoData();
    }
  }, [isDemoMode, demoDataInitialized]);

  const populateDemoData = async () => {
    // Sample notes
    const sampleNotes = [
      {
        id: 'demo-note-1',
        title: 'Welcome to Cortex! 🚀',
        content: `# Welcome to Cortex - Your AI-Powered Productivity Hub

This is a demo showcasing all the amazing features of Cortex:

## ✨ Key Features:
- **Smart Notes**: Rich text editing with AI assistance
- **Task Management**: Intelligent task tracking and automation
- **AI Assistant**: Your personal productivity coach
- **Analytics**: Deep insights into your work patterns
- **Templates**: Pre-built structures for common workflows

## 🎯 Try These Features:
1. Create a new note with the floating action button
2. Explore the AI Assistant for productivity tips
3. Check out the Analytics dashboard for insights
4. Browse Templates for quick starts

*This demo includes full functionality - everything works exactly as it would in the real app!*`,
        tags: ['welcome', 'demo', 'getting-started'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        mood: 'excited',
        category: 'personal'
      },
      {
        id: 'demo-note-2',
        title: 'Meeting Notes: Product Strategy Q1 2024',
        content: `# Product Strategy Meeting - Q1 2024

**Date**: ${new Date().toLocaleDateString()}
**Attendees**: Sarah Chen, Mike Rodriguez, Alex Kim

## Key Decisions:
- [ ] Launch mobile app beta by March 15th
- [x] Integrate AI-powered analytics
- [ ] Expand team collaboration features

## Action Items:
1. **Sarah**: Research mobile development frameworks
2. **Mike**: Design user onboarding flow
3. **Alex**: Prototype AI recommendations engine

## Next Steps:
Follow up meeting scheduled for next Friday to review progress.

*Note: This is sample content generated for demo purposes*`,
        tags: ['meeting', 'strategy', 'q1-2024'],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        mood: 'focused',
        category: 'work'
      },
      {
        id: 'demo-note-3',
        title: 'Project Ideas & Brainstorming',
        content: `# Creative Project Ideas 💡

## App Development Ideas:
- **Mood-based Music Recommendations**: AI that suggests music based on your current emotional state
- **Local Community Helper**: Platform connecting neighbors for mutual assistance
- **Sustainable Living Tracker**: Gamified approach to reducing environmental impact

## Learning Goals:
- Master TypeScript advanced patterns
- Learn about machine learning fundamentals
- Explore blockchain applications beyond crypto

## Personal Projects:
- Build a smart home automation system
- Create a digital garden for knowledge management
- Develop a meditation app with biometric feedback

*Creativity flows best when we document our ideas immediately!*`,
        tags: ['brainstorming', 'ideas', 'personal-development'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        mood: 'creative',
        category: 'personal'
      }
    ];

    // Sample tasks
    const sampleTasks = [
      {
        id: 'demo-task-1',
        title: 'Review quarterly performance metrics',
        description: 'Analyze Q4 data and prepare summary for leadership team',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedTime: 120,
        tags: ['analytics', 'reporting'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        aiSuggestions: ['Break into smaller analysis chunks', 'Schedule focused work blocks']
      },
      {
        id: 'demo-task-2',
        title: 'Update team documentation',
        description: 'Refresh onboarding materials and process guides',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedTime: 180,
        tags: ['documentation', 'team'],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        aiSuggestions: ['Start with most outdated sections', 'Involve team members for accuracy']
      },
      {
        id: 'demo-task-3',
        title: 'Plan team building activity',
        description: 'Organize virtual team building session for remote team members',
        status: 'completed',
        priority: 'low',
        completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        estimatedTime: 60,
        tags: ['team-building', 'remote-work'],
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'demo-task-4',
        title: 'Explore Cortex advanced features',
        description: 'Dive deep into AI assistant capabilities and automation workflows',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedTime: 90,
        tags: ['demo', 'learning', 'productivity'],
        createdAt: new Date().toISOString(),
        aiSuggestions: ['Start with AI assistant chat', 'Try voice commands', 'Set up automation rules']
      }
    ];

    // Sample templates
    const sampleTemplates = [
      {
        id: 'demo-template-1',
        name: 'Weekly Review',
        description: 'Structured template for weekly productivity reviews',
        category: 'productivity',
        content: `# Weekly Review - Week of [DATE]

## Accomplishments This Week
- 
- 
- 

## Challenges Faced
- 
- 

## Key Learnings
- 
- 

## Goals for Next Week
1. 
2. 
3. 

## Areas for Improvement
- 
- 

## Gratitude & Wins
- 
- `,
        tags: ['review', 'productivity', 'weekly'],
        usageCount: 12
      },
      {
        id: 'demo-template-2',
        name: 'Project Kickoff',
        description: 'Comprehensive template for starting new projects',
        category: 'project-management',
        content: `# Project Kickoff: [PROJECT NAME]

## Project Overview
**Start Date**: [DATE]
**Expected Completion**: [DATE]
**Project Owner**: [NAME]
**Team Members**: [LIST]

## Objectives
### Primary Goals
- 
- 

### Success Metrics
- 
- 

## Scope & Requirements
### In Scope
- 
- 

### Out of Scope
- 
- 

## Timeline & Milestones
- **Week 1**: 
- **Week 2**: 
- **Week 3**: 

## Resources & Budget
- **Team Members**: 
- **Budget**: 
- **Tools Required**: 

## Risk Assessment
| Risk | Impact | Mitigation |
|------|---------|------------|
|      |         |            |

## Next Steps
1. 
2. 
3. `,
        tags: ['project', 'kickoff', 'planning'],
        usageCount: 8
      }
    ];

    // Populate the data
    await setNotes((currentNotes) => {
      const existingIds = currentNotes.map(note => note.id);
      const newNotes = sampleNotes.filter(note => !existingIds.includes(note.id));
      return [...currentNotes, ...newNotes];
    });

    await setTasks((currentTasks) => {
      const existingIds = currentTasks.map(task => task.id);
      const newTasks = sampleTasks.filter(task => !existingIds.includes(task.id));
      return [...currentTasks, ...newTasks];
    });

    await setTemplates((currentTemplates) => {
      const existingIds = currentTemplates.map(template => template.id);
      const newTemplates = sampleTemplates.filter(template => !existingIds.includes(template.id));
      return [...currentTemplates, ...newTemplates];
    });

    // Mark demo data as initialized
    await setDemoDataInitialized(true);

    console.log('Demo data populated successfully!');
  };

  const clearDemoData = async () => {
    if (isDemoMode) {
      // Clear demo-specific data
      const demoNotes = notes.filter(note => note.id.startsWith('demo-'));
      const demoTasks = tasks.filter(task => task.id.startsWith('demo-'));
      const demoTemplates = templates.filter(template => template.id.startsWith('demo-'));

      await setNotes(notes.filter(note => !note.id.startsWith('demo-')));
      await setTasks(tasks.filter(task => !task.id.startsWith('demo-')));
      await setTemplates(templates.filter(template => !template.id.startsWith('demo-')));
      
      await setDemoDataInitialized(false);
      
      console.log('Demo data cleared!');
    }
  };

  return {
    isDemoMode,
    demoDataInitialized,
    populateDemoData,
    clearDemoData
  };
}