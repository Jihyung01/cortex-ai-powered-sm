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
  const [notes, setNotes] = useKV('cortex-notes', []);
  const [tasks, setTasks] = useKV('cortex-tasks', []);
  const [templates, setTemplates] = useKV('cortex-templates', []);

  const isDemoMode = user?.id === 'demo-user';

  useEffect(() => {
    if (isDemoMode && !demoDataInitialized) {
      console.log('Demo mode detected, initializing demo data...');
      // Add a small delay to ensure auth state is stable
      const timer = setTimeout(() => {
        populateDemoData();
      }, 100);
      return () => clearTimeout(timer);
    } else if (isDemoMode && demoDataInitialized) {
      console.log('Demo data already initialized');
    }
  }, [isDemoMode, demoDataInitialized]);

  const populateDemoData = async () => {
    console.log('Starting demo data population...');
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
        markdown: `# Welcome to Cortex - Your AI-Powered Productivity Hub

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
        category: 'personal',
        mood: 'positive' as const,
        ownerId: 'demo-user',
        collaborators: [],
        viewers: [],
        isFavorite: true,
        isTemplate: false,
        shareSettings: {
          isPublic: false,
          allowComments: false
        },
        version: 1,
        versionHistory: [],
        comments: [],
        lastEditedBy: 'demo-user',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
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
        markdown: `# Product Strategy Meeting - Q1 2024

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
        category: 'work',
        mood: 'neutral' as const,
        ownerId: 'demo-user',
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
        lastEditedBy: 'demo-user',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
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
        markdown: `# Creative Project Ideas 💡

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
        category: 'personal',
        mood: 'positive' as const,
        ownerId: 'demo-user',
        collaborators: [],
        viewers: [],
        isFavorite: true,
        isTemplate: false,
        shareSettings: {
          isPublic: false,
          allowComments: false
        },
        version: 1,
        versionHistory: [],
        comments: [],
        lastEditedBy: 'demo-user',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    // Sample tasks
    const sampleTasks = [
      {
        id: 'demo-task-1',
        title: 'Review quarterly performance metrics',
        description: 'Analyze Q4 data and prepare summary for leadership team',
        status: 'in-progress' as const,
        priority: 'high' as const,
        estimatedTime: 120,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        tags: ['analytics', 'reporting'],
        ownerId: 'demo-user',
        assigneeIds: ['demo-user'],
        collaborators: [],
        watchers: [],
        subtasks: [],
        linkedNoteIds: [],
        linkedTaskIds: [],
        dependencies: [],
        pomodoroSessions: 2,
        timeTracking: [],
        comments: [],
        attachments: [],
        customFields: {},
        shareSettings: {
          isPublic: false,
          allowComments: false
        },
        lastEditedBy: 'demo-user',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: 'demo-task-2',
        title: 'Update team documentation',
        description: 'Refresh onboarding materials and process guides',
        status: 'todo' as const,
        priority: 'medium' as const,
        estimatedTime: 180,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        tags: ['documentation', 'team'],
        ownerId: 'demo-user',
        assigneeIds: ['demo-user'],
        collaborators: [],
        watchers: [],
        subtasks: [],
        linkedNoteIds: [],
        linkedTaskIds: [],
        dependencies: [],
        pomodoroSessions: 0,
        timeTracking: [],
        comments: [],
        attachments: [],
        customFields: {},
        shareSettings: {
          isPublic: false,
          allowComments: false
        },
        lastEditedBy: 'demo-user',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'demo-task-3',
        title: 'Plan team building activity',
        description: 'Organize virtual team building session for remote team members',
        status: 'done' as const,
        priority: 'low' as const,
        estimatedTime: 60,
        completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        tags: ['team-building', 'remote-work'],
        ownerId: 'demo-user',
        assigneeIds: ['demo-user'],
        collaborators: [],
        watchers: [],
        subtasks: [],
        linkedNoteIds: [],
        linkedTaskIds: [],
        dependencies: [],
        pomodoroSessions: 1,
        timeTracking: [],
        comments: [],
        attachments: [],
        customFields: {},
        shareSettings: {
          isPublic: false,
          allowComments: false
        },
        lastEditedBy: 'demo-user',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      },
      {
        id: 'demo-task-4',
        title: 'Explore Cortex advanced features',
        description: 'Dive deep into AI assistant capabilities and automation workflows',
        status: 'todo' as const,
        priority: 'medium' as const,
        estimatedTime: 90,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        tags: ['demo', 'learning', 'productivity'],
        ownerId: 'demo-user',
        assigneeIds: ['demo-user'],
        collaborators: [],
        watchers: [],
        subtasks: [],
        linkedNoteIds: ['demo-note-1'],
        linkedTaskIds: [],
        dependencies: [],
        pomodoroSessions: 0,
        timeTracking: [],
        comments: [],
        attachments: [],
        customFields: {},
        shareSettings: {
          isPublic: false,
          allowComments: false
        },
        lastEditedBy: 'demo-user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Sample templates
    const sampleTemplates = [
      {
        id: 'demo-template-1',
        name: 'Weekly Review',
        description: 'Structured template for weekly productivity reviews',
        category: 'productivity' as const,
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
        tags: ['review', 'productivity', 'weekly']
      },
      {
        id: 'demo-template-2',
        name: 'Project Kickoff',
        description: 'Comprehensive template for starting new projects',
        category: 'project' as const,
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
        tags: ['project', 'kickoff', 'planning']
      },
      {
        id: 'demo-template-3',
        name: 'Meeting Notes',
        description: 'Standard template for meeting documentation',
        category: 'meeting' as const,
        content: `# Meeting Notes - [MEETING TITLE]

**Date**: [DATE]
**Time**: [TIME]
**Attendees**: [LIST]
**Meeting Type**: [STANDUP/PLANNING/REVIEW/OTHER]

## Agenda
1. 
2. 
3. 

## Discussion Points
### Topic 1
- 
- 

### Topic 2
- 
- 

## Decisions Made
- 
- 

## Action Items
| Task | Owner | Due Date | Status |
|------|-------|----------|--------|
|      |       |          |        |

## Next Meeting
**Date**: [DATE]
**Agenda**: 
- 
- 

## Notes
- 
- `,
        tags: ['meeting', 'notes', 'action-items']
      }
    ];

    // Populate the data
    console.log('Populating notes...');
    await setNotes((currentNotes) => {
      const existingIds = currentNotes.map(note => note.id);
      const newNotes = sampleNotes.filter(note => !existingIds.includes(note.id));
      console.log(`Adding ${newNotes.length} new notes`);
      return [...currentNotes, ...newNotes];
    });

    console.log('Populating tasks...');
    await setTasks((currentTasks) => {
      const existingIds = currentTasks.map(task => task.id);
      const newTasks = sampleTasks.filter(task => !existingIds.includes(task.id));
      console.log(`Adding ${newTasks.length} new tasks`);
      return [...currentTasks, ...newTasks];
    });

    console.log('Populating templates...');
    await setTemplates((currentTemplates) => {
      const existingIds = currentTemplates.map(template => template.id);
      const newTemplates = sampleTemplates.filter(template => !existingIds.includes(template.id));
      console.log(`Adding ${newTemplates.length} new templates`);
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