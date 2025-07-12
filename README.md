# Text Embedding Explorer

An interactive web application for visualizing and analyzing text embeddings with AI-powered insights. Available in both modern React and vanilla JavaScript implementations.

## Project Overview

Text Embedding Explorer transforms text data into visual insights by plotting high-dimensional embeddings in an interactive 2D space. Each point represents a piece of text, positioned based on semantic similarity. Users can select clusters of related content and leverage AI analysis to discover patterns, themes, and insights within their data.

## Architecture Versions

This repository contains two implementations:

### 🎯 **Modern React Application** (Recommended)
- **Location**: `my-app/` directory
- **Stack**: React 19 + TypeScript + Vite + Tailwind CSS
- **Features**: Modern component architecture, type safety, hot module replacement

### 📚 **Legacy Vanilla JS Application**
- **Location**: Root directory
- **Stack**: Vanilla JavaScript + ES6 modules + D3.js
- **Features**: No build process, direct browser execution

## Quick Start

### React Application (Recommended)

```bash
cd my-app
npm install
npm run dev
```

The application will start at `http://localhost:5173` with hot reloading.

### Legacy Application

```bash
npm install
npm start
```

The application will open at `http://localhost:3000`.

## Key Features

- **Interactive D3.js Visualization**: Scatter plot with smooth zoom, pan, and selection
- **Modern UI**: Clean Tailwind CSS interface with responsive design
- **Selection Tools**: Point selection with real-time preview
- **Settings Management**: Configurable API settings with local storage
- **TypeScript Support**: Full type safety in React version
- **Modular Architecture**: Reusable components and managers

## Development Workflow

### React Version Commands
```bash
cd my-app
npm run dev          # Development server with HMR
npm run build        # Production build
npm run lint         # ESLint checking
npm run preview      # Preview production build
```

### Legacy Version Commands
```bash
npm start            # Start development server
npm run serve-node   # Alternative Node.js server
npm run serve-python # Python HTTP server
```

## Technical Stack

### React Application
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS 4.x
- **Visualization**: D3.js 7.x
- **Linting**: ESLint with TypeScript rules

### Legacy Application  
- **Runtime**: Vanilla JavaScript (ES6+)
- **Modules**: ES6 module system
- **Visualization**: D3.js 7.x
- **Styling**: Custom CSS
- **Server**: http-server for development

## Usage Instructions

### Basic Workflow

1. **Choose Your Version**: Start either the React app (`cd my-app && npm run dev`) or legacy app (`npm start`)
2. **Explore Sample Data**: The application loads with sample text embeddings ready for visualization
3. **Select Points**: Click and drag to select points on the scatter plot
4. **Configure Settings**: Click the Settings button to add API keys and configure analysis options
5. **View Selection**: Selected points appear in the sidebar with content preview

### Data Format

Applications work with embedded text data in this structure:

```typescript
interface TextData {
  content: string;
  category: string;
  date: string;
  author: string;
  sentiment: string;
  embedding: number[]; // 2D coordinates for visualization
}
```

## Technical Requirements

- **Node.js**: 14.0.0+ (for development)
- **Browser**: Modern browser with ES6+ support
- **Internet**: Required for AI analysis features (optional)

## Project Structure

```
interface/
├── my-app/                 # React + TypeScript application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── DataManager.ts  # Data handling logic
│   │   ├── SettingsManager.ts # Settings management
│   │   └── App.tsx         # Main application
│   ├── package.json
│   └── vite.config.ts
├── js/                     # Legacy vanilla JS modules
├── index.html              # Legacy application entry
├── styles.css              # Legacy application styles
└── package.json            # Root package configuration
```

## Privacy & Security

- API keys stored locally in browser localStorage
- No data sent to external servers except OpenAI (when using analysis)
- HTTPS enforced for external API communications
- TypeScript provides additional type safety in React version

## Contributing

1. **React Development**: Work in `my-app/` directory with TypeScript
2. **Legacy Maintenance**: Original JS files for backward compatibility
3. **Testing**: Manual testing via browser (no automated test framework)
4. **Linting**: ESLint configured for React version (`npm run lint`)

## License

MIT License - Feel free to use, modify, and distribute.