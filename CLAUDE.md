# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Server Management
```bash
# Start the development server (auto-opens browser)
npm start
# or
npm run serve

# Alternative server options
node server.js                  # Node.js server with auto-open
npm run serve-node             # Same as above
npm run serve-python           # Python HTTP server
python3 -m http.server 3000    # Direct Python server

# Platform-specific auto-start scripts
./start.sh                     # macOS/Linux
start.bat                      # Windows
```

### Development Workflow
- **Main entry point**: `index.html` - served at http://localhost:3000
- **No build step required** - static files served directly
- **No test framework** - manual testing via browser
- **No linting configured** - follow existing code style

## Architecture Overview

This is a **Text Embedding Explorer** - a modular web application for visualizing and analyzing text embeddings with AI-powered analysis capabilities.

### Core Architecture Pattern
- **ES6 Module System**: Each component is a separate ES6 class in its own file
- **Dependency Injection**: Modules receive dependencies through constructor parameters
- **Single Responsibility**: Each module handles one aspect of the application
- **Event-Driven Communication**: Modules communicate through callbacks and global functions

### Module Structure (js/ directory)

1. **DataManager** (`js/data.js`)
   - Manages sample text data with embeddings
   - Provides data access methods (`getEmbeddings()`, `getSelectedItems()`)
   - Handles data validation and filtering by fields

2. **SettingsManager** (`js/settings.js`)
   - Manages application configuration (API keys, endpoints, models)
   - Handles localStorage persistence
   - Provides input validation for API settings

3. **VisualizationManager** (`js/visualization.js`)
   - Controls Plotly.js scatter plot visualization
   - Manages selection interactions (lasso/box selection)
   - Handles visual updates and category-based color coding

4. **UIManager** (`js/ui.js`)
   - Controls all UI components and modal dialogs
   - Manages form interactions and validation
   - Provides user feedback and error handling

5. **AnalysisManager** (`js/analysis.js`)
   - Handles OpenAI API communication for text analysis
   - Manages analysis requests and responses
   - Provides comprehensive error handling and cost estimation

6. **App Controller** (`js/app.js`)
   - Main application coordinator
   - Initializes modules in dependency order
   - Sets up global event handlers for HTML onclick attributes

### Key Dependencies
- **Plotly.js**: Visualization library (loaded via CDN)
- **OpenAI API**: External API for text analysis (requires user API key)
- **http-server**: Dev dependency for static file serving

### Inter-Module Communication
- **Visualization → UI**: Selection changes trigger UI updates
- **UI → Analysis**: User actions trigger analysis requests
- **Settings → All**: Configuration changes propagate to dependent modules
- **Global Functions**: UI event handlers exposed on window object

### Data Flow
1. User interacts with Plotly visualization (selection)
2. VisualizationManager captures selection events
3. UIManager updates analysis controls
4. User configures analysis prompt and settings
5. AnalysisManager processes selection with OpenAI API
6. Results displayed through UIManager

### Important Implementation Notes
- **No build process** - all code runs directly in browser
- **localStorage** used for settings persistence
- **CORS enabled** on development server for API requests
- **Accessibility features** implemented with ARIA labels and keyboard navigation
- **Error handling** comprehensive across all API interactions
- **Security considerations** include input sanitization and HTTPS enforcement
- **Keyboard shortcuts** implemented for selection modes (Shift+L/B/C for lasso/box/clear)
- **UI Layout**: Settings icon moved to sidebar top-right, expanded selection preview area

### File Organization
- `index.html` - Main application entry point
- `styles.css` - All application styles
- `js/` - Modular JavaScript components
- `prototype.html` & `script.js` - Legacy monolithic version (reference only)
- `server.js` - Development server with CORS support