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

### Component Structure
- **Main App**: `app/page.tsx` - Application entry point
- **Core Component**: `components/embeddings-explorer.tsx` - Main visualization interface
- **Utilities**: `lib/` directory containing:
  - `csv-parser.ts` - CSV parsing and data conversion
  - `llm-api.ts` - LLM integration for analysis
  - `settings.ts` - Configuration management
- **UI Components**: `components/ui/` - Reusable shadcn/ui components

### File Organization
- `app/` - Next.js app router structure
- `components/` - React components
- `lib/` - Utility functions and configurations
- `types/` - TypeScript type definitions
- `test-data.csv` - Automatically loaded dataset

## Development Guidelines
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS utility classes
- **Components**: Functional components with hooks
- **Build Process**: Next.js handles bundling and optimization

### Key Features
- **Auto Data Loading**: Automatically loads `test-data.csv` on startup
- **Interactive Visualization**: D3.js-powered scatter plot
- **Smart CSV Parsing**: Auto-detects x, y, and text columns
- **LLM Integration**: Supports multiple AI providers for analysis
- **Export Functionality**: Download filtered or selected data
- **Responsive Design**: Works on desktop and mobile devices

