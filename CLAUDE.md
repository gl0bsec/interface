# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the repository.

## Overview

The project is a **Next.js React application** implementing the **Text Embedding Explorer**. It provides an interactive web interface for visualizing and analyzing text embeddings with automatic CSV data loading.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server at http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint checks
```

## Architecture

### Core Technologies
- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build System**: Next.js built-in bundler
- **State Management**: React hooks and context
- **UI Library**: Radix UI primitives via shadcn/ui

### Component Structure
- **Main App**: `app/page.tsx` - Application entry point
- **Core Component**: `components/embeddings-explorer.tsx` - Main visualization interface (2500+ lines)
- **Virtualized List**: `components/virtualized-selected-points.tsx` - Performance-optimized point rendering
- **Utilities**: `lib/` directory containing:
  - `csv-parser.ts` - CSV parsing and data conversion
  - `llm-api.ts` - LLM integration for analysis
  - `settings.ts` - Configuration management
  - `point-clustering.ts` - Data clustering algorithms
- **UI Components**: `components/ui/` - Reusable shadcn/ui components
- **Types**: `types/embedding.ts` - TypeScript interfaces and types

### File Organization
```
interface/
├── app/
│   ├── globals.css          # Global styles and Tailwind imports
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main application entry
├── components/
│   ├── ui/                  # shadcn/ui components (tabs, buttons, etc.)
│   ├── embeddings-explorer.tsx  # Main component (LARGE FILE)
│   └── virtualized-selected-points.tsx
├── lib/
│   ├── csv-parser.ts        # Data processing utilities
│   ├── llm-api.ts          # AI/LLM integration
│   ├── point-clustering.ts  # Clustering algorithms
│   ├── settings.ts         # Settings management
│   └── utils.ts            # General utilities
├── types/
│   └── embedding.ts        # TypeScript definitions
├── hooks/
│   └── use-toast.ts        # Toast notification hook
└── test-data.csv           # Sample dataset
```

## UI Architecture & Layout

### Main Layout Structure
The application uses a **three-panel layout**:

1. **Top Toolbar**: Controls, settings, import/export
2. **Main Content Area** (resizable sidebars):
   - **Left Sidebar**: Visualization controls and legend
   - **Center Panel**: D3.js scatter plot visualization  
   - **Right Sidebar**: Tabbed interface (Data + LLM Analysis)

### Right Sidebar - Tabbed Interface
**CRITICAL**: Uses Radix UI Tabs component with specific CSS requirements:

```tsx
// CORRECT TabsContent usage:
<TabsContent 
  value="tab-name" 
  className="h-full flex-col m-0 data-[state=active]:flex data-[state=inactive]:hidden"
>
  {/* Tab content */}
</TabsContent>
```

**Common Issues to Avoid**:
- ❌ `className="h-full flex flex-col data-[state=active]:flex"` (conflicting flex declarations)
- ❌ Missing `data-[state=inactive]:hidden` (tabs won't switch properly)
- ❌ Using `display: none` manually (conflicts with Radix behavior)

### Tab Structure
1. **Data Tab**: Shows selected points with virtualized scrolling
2. **LLM Tab**: AI analysis interface with prompt input and results

## Development Guidelines

### Code Style
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS utility classes
- **Components**: Functional components with hooks
- **Build Process**: Next.js handles bundling and optimization

### Critical CSS Patterns

#### Radix UI Components
When working with shadcn/ui components that use Radix UI:
- **Always check default behavior** - many components have built-in state management
- **Use data attributes properly** - `data-[state=active]`, `data-[state=inactive]`, etc.
- **Don't conflict with internal styles** - avoid overriding core display properties

#### Layout Classes
- **Sidebar layouts**: Use `flex flex-col` for vertical stacking
- **Resizable containers**: Use `style={{ width: dynamicWidth }}` for runtime sizing
- **Scroll containers**: Always include `overflow-hidden` on parent, `overflow-auto` on scrollable child

### Component Size Management
The main `embeddings-explorer.tsx` file is **2500+ lines**. When making changes:
- **Read specific sections** using line offsets rather than the entire file
- **Use Grep tool** to find specific functionality
- **Test changes carefully** - the file has complex state interactions

### State Management Patterns
- **Settings**: Persisted to localStorage via `lib/settings.ts`
- **Selected Points**: Array state with virtualized rendering
- **Tabs**: Controlled by `rightSidebarTab` state
- **Dialogs**: Boolean state for each modal (settings, import, analysis results)

### LLM Integration
- **API Support**: OpenAI and Anthropic (Claude) APIs
- **Security**: API keys stored in localStorage only
- **Data Filtering**: Configurable fields sent to LLM via `settings.apiFields`
- **Cost Estimation**: Real-time token and cost calculation

### Key Features
- **Auto Data Loading**: Automatically loads `test-data.csv` on startup
- **Interactive Visualization**: D3.js-powered scatter plot with zoom/pan
- **Smart CSV Parsing**: Auto-detects x, y, and text columns
- **LLM Integration**: Supports multiple AI providers for analysis
- **Export Functionality**: Download filtered or selected data
- **Responsive Design**: Works on desktop and mobile devices
- **Performance**: Virtualized rendering for large datasets

## Testing Guidelines

### Before Making UI Changes
1. **Start dev server**: `npm run dev`
2. **Test all tabs**: Ensure both Data and LLM tabs show content
3. **Check responsive behavior**: Test sidebar resizing
4. **Verify state persistence**: Settings should save/load correctly

### Common Issues to Test For
- **Tab content visibility**: Switch between Data/LLM tabs
- **Virtualized scrolling**: Select many points and scroll the list  
- **LLM functionality**: Test with/without API key configured
- **Data import**: Test CSV file import and column mapping
- **Settings dialog**: Verify all form controls work

### Build Verification
Always run before committing:
```bash
npm run build  # Must pass TypeScript compilation
npm run lint   # Check for code quality issues
```

**Note**: Some lint warnings in `csv-parser.ts` are acceptable (unused variables, any types) as long as TypeScript compilation succeeds.

