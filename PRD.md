# Cortex - AI-Powered Note-Taking App

An intelligent note-taking application that leverages AI to help users organize, search, and enhance their notes with smart categorization, mood analysis, and content insights.

**Experience Qualities**:
1. **Intelligent** - AI seamlessly assists with organization and content enhancement without being intrusive
2. **Fluid** - Smooth interactions and transitions create an effortless writing experience
3. **Sophisticated** - Professional-grade features with an elegant, modern interface

**Complexity Level**: Complex Application (advanced functionality, accounts)
- Multiple interconnected features requiring sophisticated state management, AI integration, and persistent data structures across various content types and organizational systems.

## Essential Features

### Smart Editor
- **Functionality**: Rich text editor supporting markdown syntax, drag-and-drop image uploads, real-time formatting
- **Purpose**: Provides familiar writing experience with enhanced capabilities for power users
- **Trigger**: User clicks "New Note" or opens existing note
- **Progression**: Click new note → editor opens with AI suggestions → write content → auto-save → AI analysis runs → tags/categories suggested
- **Success criteria**: Users can write, format, and enhance notes without workflow interruption

### AI-Powered Content Analysis
- **Functionality**: Automatic categorization, smart tag suggestions, content summarization, sentiment analysis with mood indicators
- **Purpose**: Reduces manual organization overhead and provides content insights
- **Trigger**: Content analysis runs after user pauses typing (debounced) or saves note
- **Progression**: User writes → AI analyzes content → suggests categories/tags → displays mood indicator → offers summary for long content
- **Success criteria**: AI suggestions are accurate and helpful, mood indicators reflect content tone

### Advanced Search & Filtering
- **Functionality**: Full-text search with filters by date range, tags, mood, content type, and folder location
- **Purpose**: Enables quick retrieval of information across large note collections
- **Trigger**: User types in search bar or applies filters
- **Progression**: Enter search query → apply filters → view results → click to open note → return to search results
- **Success criteria**: Users can locate specific notes within seconds regardless of collection size

### Template System
- **Functionality**: Pre-built templates for meeting notes, project planning, daily journals, and custom templates
- **Purpose**: Accelerates note creation with structured formats for common use cases
- **Trigger**: User selects "New Note from Template" or chooses template in note creation
- **Progression**: Click template → preview template → customize if needed → create note → fill in template sections
- **Success criteria**: Templates save time and provide consistent structure for recurring note types

### Hierarchical Organization
- **Functionality**: Folder structure, favorites system, recent notes dashboard, and smart collections
- **Purpose**: Provides multiple organizational paradigms to suit different user preferences
- **Trigger**: User creates folders, marks favorites, or accesses dashboard
- **Progression**: Create folder → drag notes to organize → mark important notes as favorites → access via dashboard
- **Success criteria**: Users can organize notes in intuitive ways and quickly access important content

## Edge Case Handling

- **Network Connectivity**: Offline editing with sync when connection restored
- **Large Files**: Image compression and lazy loading for performance
- **Empty States**: Helpful onboarding and guidance when no notes exist
- **Search No Results**: Suggest alternative search terms or content creation
- **AI Service Errors**: Graceful fallback with manual categorization options
- **Mobile Gestures**: Touch-friendly interactions with swipe actions

## Design Direction

The design should evoke a sense of sophisticated intelligence and creative productivity - feeling like a premium tool that enhances thinking rather than just storing text. Modern glassmorphism aesthetic with subtle depth, clean typography, and purposeful animations that guide attention and provide feedback.

## Color Selection

Triadic (three equally spaced colors) - Using a sophisticated palette that balances warmth and coolness to create a professional yet approachable feel.

- **Primary Color**: Deep indigo `oklch(0.45 0.15 270)` - Communicates intelligence, focus, and premium quality
- **Secondary Colors**: 
  - Warm amber `oklch(0.7 0.12 65)` - For accents and positive actions
  - Cool teal `oklch(0.6 0.1 180)` - For secondary actions and highlights
- **Accent Color**: Vibrant coral `oklch(0.65 0.18 25)` - Attention-grabbing highlight for CTAs and important elements
- **Foreground/Background Pairings**:
  - Background (Light Gray `oklch(0.98 0.005 240)`): Dark text `oklch(0.2 0.02 270)` - Ratio 12.1:1 ✓
  - Card (Pure White `oklch(1 0 0)`): Dark text `oklch(0.2 0.02 270)` - Ratio 14.2:1 ✓
  - Primary (Deep Indigo `oklch(0.45 0.15 270)`): White text `oklch(1 0 0)` - Ratio 7.8:1 ✓
  - Secondary (Warm Amber `oklch(0.7 0.12 65)`): Dark text `oklch(0.2 0.02 270)` - Ratio 4.9:1 ✓
  - Accent (Vibrant Coral `oklch(0.65 0.18 25)`): White text `oklch(1 0 0)` - Ratio 5.2:1 ✓
  - Muted (Cool Gray `oklch(0.95 0.01 240)`): Medium text `oklch(0.45 0.02 270)` - Ratio 4.7:1 ✓

## Font Selection

Typography should convey clarity, intelligence, and modern sophistication while maintaining excellent readability for extended writing sessions.

- **Typographic Hierarchy**:
  - App Title: Inter Bold/32px/tight letter spacing
  - Note Titles: Inter SemiBold/24px/normal spacing
  - Section Headers: Inter Medium/18px/normal spacing
  - Body Text: Inter Regular/16px/relaxed line height (1.6)
  - Meta Text: Inter Regular/14px/normal spacing
  - Code/Monospace: JetBrains Mono/14px/normal spacing

## Animations

Animations should feel intelligent and purposeful, enhancing the sense that the app is actively helping users think and organize - subtle enough for productivity focus but delightful enough to create emotional connection.

- **Purposeful Meaning**: Motion communicates AI thinking (pulse effects during analysis), content relationships (smooth transitions between related notes), and system responsiveness (immediate feedback for all interactions)
- **Hierarchy of Movement**: 
  - Primary: Note creation/editing transitions, AI analysis indicators
  - Secondary: Navigation between views, search result updates
  - Tertiary: Hover states, micro-interactions on buttons and cards

## Component Selection

- **Components**: 
  - Dialog for note editor overlay and settings
  - Command for search and quick actions
  - Card for note previews and dashboard sections
  - Tabs for organization views (folders, tags, recent)
  - Badge for tags and categories
  - Progress for AI analysis status
  - Tooltip for feature explanations
  - Separator for content organization
  - Scroll Area for long note lists
  - Sheet for mobile navigation and note editor

- **Customizations**: 
  - Rich text editor component with markdown toolbar
  - AI analysis status indicator with animated progress
  - Mood indicator component with color-coded emotions
  - Template preview component with interactive sections
  - Folder tree component with drag-and-drop support

- **States**: 
  - Buttons: Subtle glassmorphic hover with backdrop blur increase
  - Inputs: Focused state with primary color border and subtle glow
  - Cards: Hover lift effect with enhanced shadow and slight scale
  - Tags: Interactive hover with background color shift

- **Icon Selection**: 
  - Phosphor icons for their clean, modern aesthetic
  - Brain/Lightbulb for AI features
  - Folder/FolderOpen for organization
  - MagnifyingGlass for search
  - Heart for favorites
  - Calendar for date-based views
  - Tag for categorization

- **Spacing**: 
  - Container padding: p-6 (24px)
  - Card spacing: gap-4 (16px)
  - Button padding: px-4 py-2 (16px/8px)
  - Section margins: mb-6 (24px)
  - Grid gaps: gap-6 (24px)

- **Mobile**: 
  - Mobile-first design with progressive enhancement
  - Sheet component for full-screen note editing on small screens
  - Collapsible sidebar that transforms to bottom navigation
  - Touch-friendly tap targets (min 44px)
  - Swipe gestures for note actions (archive, favorite, delete)
  - Responsive grid that adapts from 1 column (mobile) to 3 columns (desktop)