# CLAUDE.md

This file provides guidance when working with the code in this repository.

## Overview

The project is a vanilla JavaScript **Text Embedding Explorer** located entirely in the repository root. It visualizes high‑dimensional text embeddings using D3.js and allows optional analysis via the OpenAI API. There is no build step.

## Development Commands

```bash
npm install
npm start            # http://localhost:3000 using http-server
npm run serve-node   # Node.js server
npm run serve-python # Python HTTP server
```

## Architecture

- `index.html` – application entry point
- `styles.css` – global styles and CSS variables
- `js/` – ES6 modules:
  - `data.js` – sample data management
  - `settings.js` – settings persistence
  - `d3-visualization.js` – scatter plot logic
  - `ui.js` – UI components and dialogs
  - `analysis.js` – OpenAI API integration
  - `app.js` – application controller
- `server.js` – simple Node.js CORS server for development

## Guidelines

- Keep code modular and use ES6 `import`/`export`
- Store user settings in `localStorage`
- Ensure accessibility (ARIA labels, keyboard shortcuts)
- Run in modern browsers without any build tools
