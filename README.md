# Text Embedding Explorer

An interactive web application for visualizing and analyzing text embeddings with AI-powered insights. This repository contains a single vanilla JavaScript implementation that runs directly in the browser.

## Quick Start

```bash
npm install
npm start
```

The application will open at `http://localhost:3000`.

## Key Features

- **Interactive D3.js Visualization**: Zoom, pan and select points in a scatter plot
- **Selection Tools**: Lasso and box selection with real-time preview
- **Settings Management**: Configure API settings and persist them locally
- **Responsive Design**: Works on desktop and mobile screens

## Development Commands

```bash
npm start            # Start development server
npm run serve-node   # Alternative Node.js server
npm run serve-python # Python HTTP server
```

## Project Structure

```text
interface/
├── js/            # Application modules
├── index.html     # Entry point
├── styles.css     # Application styles
└── package.json   # Package configuration
```

## Privacy & Security

- API keys are stored in your browser's `localStorage`
- No data is sent externally except when using the OpenAI API

## License

MIT License - Feel free to use, modify and distribute.
