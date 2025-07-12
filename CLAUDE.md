# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This repository contains **two implementations** of a Text Embedding Explorer:

1. **🎯 Modern React Application** (Recommended) - Located in `my-app/`
2. **📚 Legacy Vanilla JS Application** - Located in root directory

## Development Commands

### React Application (Primary Development)
```bash
cd my-app
npm install
npm run dev          # Start Vite dev server at http://localhost:5173
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Legacy Application (Maintenance Only)
```bash
# Root directory commands
npm install
npm start            # Start at http://localhost:3000
npm run serve-node   # Alternative Node.js server
npm run serve-python # Python HTTP server

# Platform-specific scripts
./start.sh           # macOS/Linux
start.bat           # Windows
```

## React Application Architecture (my-app/)

### Technology Stack
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7.x with HMR
- **Styling**: Tailwind CSS 4.x
- **Visualization**: D3.js 7.x
- **Linting**: ESLint with TypeScript rules

### Component Structure

1. **App.tsx** - Main application component
   - Manages global state (selected points, settings modal)
   - Coordinates between ScatterPlot and sidebar
   - Header with title and settings button

2. **ScatterPlot.tsx** (`src/components/`)
   - D3.js integration with React
   - Handles data visualization and point selection
   - Props: `data`, `width`, `height`, `onSelect`

3. **SettingsModal.tsx** (`src/components/`)
   - Modal dialog for API configuration
   - Form handling with controlled inputs
   - Integration with SettingsManager

4. **DataManager.ts** (`src/`)
   - TypeScript class for data management
   - Methods: `getEmbeddings()`, data validation
   - Sample data with embeddings and metadata

5. **SettingsManager.ts** (`src/`)
   - Settings persistence with localStorage
   - API configuration management
   - Input validation and error handling

### Development Workflow
- **Hot Module Replacement**: Instant updates during development
- **TypeScript**: Full type safety and intellisense
- **ESLint**: Code quality and consistency
- **Tailwind CSS**: Utility-first styling approach

### File Organization
```
my-app/
├── src/
│   ├── components/
│   │   ├── ScatterPlot.tsx
│   │   └── SettingsModal.tsx
│   ├── DataManager.ts
│   ├── SettingsManager.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tailwind.config.cjs
└── tsconfig.json
```

## Legacy Application Architecture (Root Directory)

### Core Pattern
- **ES6 Module System**: Separate class per file
- **Dependency Injection**: Constructor parameters
- **Event-Driven Communication**: Callbacks and global functions

### Module Structure (js/ directory)
1. **DataManager** (`js/data.js`) - Sample data management
2. **SettingsManager** (`js/settings.js`) - Configuration persistence  
3. **VisualizationManager** (`js/d3-visualization.js`) - D3.js scatter plot
4. **UIManager** (`js/ui.js`) - UI components and dialogs
5. **AnalysisManager** (`js/analysis.js`) - OpenAI API integration
6. **App Controller** (`js/app.js`) - Application coordinator

### Legacy File Organization
- `index.html` - Application entry point
- `styles.css` - Custom CSS styles
- `js/` - Modular JavaScript components
- `server.js` - Development server with CORS

## Development Guidelines

### Primary Development (React App)
- **Work in**: `my-app/` directory
- **Language**: TypeScript with strict typing
- **Styling**: Tailwind CSS classes
- **State Management**: React hooks (useState)
- **Linting**: Run `npm run lint` before commits

### Legacy Maintenance
- **Work in**: Root directory files
- **Language**: Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS in `styles.css`
- **Module System**: ES6 imports/exports
- **No build process**: Direct browser execution

### Common Patterns
- **Data Structure**: Consistent across both versions
- **D3.js Integration**: Visualization library usage
- **Settings Persistence**: localStorage for API keys
- **Error Handling**: Comprehensive user feedback

## Important Implementation Notes

### React Version
- **Vite HMR**: Fast development iteration
- **TypeScript**: Compile-time error checking
- **Component Architecture**: Reusable, testable components
- **Modern React**: Hooks-based state management
- **Tailwind**: Utility-first responsive design

### Legacy Version  
- **No build step**: Direct browser execution
- **ES6 modules**: Modern JavaScript without transpilation
- **Global functions**: HTML onclick event handlers
- **CORS server**: Development server supports API requests
- **Keyboard shortcuts**: Shift+L/B/C for selection modes

### Shared Features
- **Sample data**: Text embeddings with metadata
- **D3.js visualization**: Interactive scatter plot
- **Settings management**: API key storage
- **Point selection**: Click and drag interaction
- **Responsive design**: Desktop and mobile support