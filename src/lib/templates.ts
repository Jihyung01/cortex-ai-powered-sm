import type { Template } from './types';

export const defaultTemplates: Template[] = [
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Structure for meeting notes with attendees, agenda, and action items',
    category: 'meeting',
    tags: ['meeting', 'work', 'notes'],
    content: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Time:** 
**Location/Platform:** 
**Attendees:** 
- 
- 

## Agenda
1. 
2. 
3. 

## Discussion Points

### Topic 1


### Topic 2


## Action Items
- [ ] 
- [ ] 
- [ ] 

## Next Steps


## Notes

`
  },
  {
    id: 'project-planning',
    name: 'Project Planning',
    description: 'Comprehensive project planning template with goals, timeline, and resources',
    category: 'project',
    tags: ['project', 'planning', 'work'],
    content: `# Project Planning: [Project Name]

## Overview
**Project Goal:** 
**Timeline:** 
**Budget:** 
**Team Members:** 

## Objectives
1. 
2. 
3. 

## Scope
### In Scope
- 
- 

### Out of Scope
- 
- 

## Milestones
- [ ] **Week 1:** 
- [ ] **Week 2:** 
- [ ] **Week 3:** 
- [ ] **Week 4:** 

## Resources Needed
- 
- 
- 

## Risks & Mitigation
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
|      |        |             |            |

## Success Criteria
- 
- 
- 

## Notes

`
  },
  {
    id: 'daily-journal',
    name: 'Daily Journal',
    description: 'Daily reflection template for personal growth and productivity',
    category: 'journal',
    tags: ['journal', 'personal', 'reflection'],
    content: `# Daily Journal - ${new Date().toLocaleDateString()}

## Morning Intentions
**Today's Focus:** 
**Mood:** 
**Energy Level:** 

### Three Priorities
1. 
2. 
3. 

## Daily Reflection

### What Went Well
- 
- 

### Challenges Faced
- 
- 

### Lessons Learned
- 
- 

## Gratitude
**Three things I'm grateful for:**
1. 
2. 
3. 

## Tomorrow's Preparation
**Top priority for tomorrow:** 

## Random Thoughts

`
  },
  {
    id: 'research-notes',
    name: 'Research Notes',
    description: 'Structured template for research and reference collection',
    category: 'custom',
    tags: ['research', 'study', 'reference'],
    content: `# Research Notes: [Topic]

**Date:** ${new Date().toLocaleDateString()}
**Source:** 
**Type:** Article/Book/Video/Other
**Author:** 
**URL/Reference:** 

## Key Points
1. 
2. 
3. 

## Quotes & Citations
> 

> 

## My Thoughts & Analysis


## Related Topics
- 
- 
- 

## Follow-up Questions
- 
- 

## Action Items
- [ ] 
- [ ] 

## Tags
#research #

`
  },
  {
    id: 'idea-capture',
    name: 'Idea Capture',
    description: 'Quick template for capturing and developing ideas',
    category: 'custom',
    tags: ['ideas', 'brainstorm', 'creativity'],
    content: `# Idea: [Title]

**Captured:** ${new Date().toLocaleString()}
**Category:** 

## The Idea
<!-- Describe your idea in detail -->


## Why This Matters
<!-- What problem does this solve or what opportunity does it create? -->


## Potential Applications
- 
- 
- 

## Resources Needed
- 
- 

## Next Steps
- [ ] 
- [ ] 
- [ ] 

## Related Ideas
- 
- 

## Inspiration Source
<!-- What sparked this idea? -->


## Mood Board / Sketches
<!-- Add images, links, or visual inspiration -->

`
  }
];

export function getTemplateById(id: string): Template | undefined {
  return defaultTemplates.find(template => template.id === id);
}

export function getTemplatesByCategory(category: Template['category']): Template[] {
  return defaultTemplates.filter(template => template.category === category);
}