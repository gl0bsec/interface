# Text Embedding Explorer

An interactive web application for visualizing and analyzing text embeddings with AI-powered insights. The project now uses a single vanilla JavaScript implementation for maximum compatibility and zero build steps.

## Project Overview

Text Embedding Explorer transforms text data into visual insights by plotting high-dimensional embeddings in an interactive 2D space. Each point represents a piece of text, positioned based on semantic similarity. Users can select clusters of related content and leverage AI analysis to discover patterns, themes, and insights within their data.

## Quick Start

```bash
npm install
npm start
```

The application will open at `http://localhost:3000`.

## Key Features

- **Interactive D3.js Visualization**: Scatter plot with smooth zoom, pan, and selection
- **Modern UI**: Responsive interface with accessible controls
- **Selection Tools**: Lasso and box selection with real-time preview
- **Settings Management**: Configurable API settings stored in local storage
- **Modular Architecture**: Reusable ES6 modules

## Development Workflow

```bash
npm start            # Start development server
npm run serve-node   # Alternative Node.js server
npm run serve-python # Python HTTP server
```

## Technical Stack

- **Runtime**: Vanilla JavaScript (ES6+)
- **Modules**: ES6 module system
- **Visualization**: D3.js 7.x
- **Styling**: Custom CSS
- **Server**: http-server for development

## Usage Instructions

1. **Explore Sample Data**: The application loads with sample text embeddings ready for visualization
2. **Select Points**: Click and drag to select points on the scatter plot
3. **Configure Settings**: Click the Settings button to add API keys and configure analysis options
4. **View Selection**: Selected points appear in the sidebar with content preview

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
├── js/            # JavaScript modules
├── index.html     # Application entry
├── styles.css     # Application styles
└── package.json   # Package configuration
```

## Privacy & Security

- API keys stored locally in browser localStorage
- No data sent to external servers except OpenAI (when using analysis)
- HTTPS enforced for external API communications

## Contributing

1. **Development**: Work in the root directory files
2. **Testing**: Manual testing via browser (no automated test framework)

## License

MIT License - Feel free to use, modify, and distribute.
