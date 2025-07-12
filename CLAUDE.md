# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the repository.

## Overview

The project contains a single vanilla JavaScript implementation of the **Text Embedding Explorer**. All source files live in the repository root.

## Development Commands

```bash
npm install
npm start            # Start at http://localhost:3000
npm run serve-node   # Alternative Node.js server
npm run serve-python # Python HTTP server

# Platform-specific scripts
./start.sh           # macOS/Linux
start.bat            # Windows
```

## Architecture

### Core Pattern
- **ES6 Module System**: Separate class per file
- **Dependency Injection**: Constructor parameters
- **Event-Driven Communication**: Callbacks and global functions

### Module Structure (`js/` directory)
1. **DataManager** (`js/data.js`) - Sample data management
2. **SettingsManager** (`js/settings.js`) - Configuration persistence
3. **VisualizationManager** (`js/d3-visualization.js`) - D3.js scatter plot
4. **UIManager** (`js/ui.js`) - UI components and dialogs
5. **AnalysisManager** (`js/analysis.js`) - OpenAI API integration
6. **App Controller** (`js/app.js`) - Application coordinator

### File Organization
- `index.html` - Application entry point
- `styles.css` - Custom CSS styles
- `js/` - Modular JavaScript components
- `server.js` - Development server with CORS

## Development Guidelines
- **Language**: Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS in `styles.css`
- **Module System**: ES6 imports/exports
- **No build process**: Direct browser execution

### Common Patterns
- **Data Structure**: Text embeddings with metadata
- **D3.js Integration**: Interactive scatter plot
- **Settings Persistence**: localStorage for API keys
- **Error Handling**: Comprehensive user feedback
- **Keyboard Shortcuts**: Shift+L/B/C for selection modes

