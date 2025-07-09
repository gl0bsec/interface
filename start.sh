#!/bin/bash

# Text Embedding Explorer - Quick Start Script
# This script provides multiple ways to run the demo locally

echo "🚀 Starting Text Embedding Explorer..."
echo ""

# Check if Node.js is available
if command -v node &> /dev/null; then
    echo "✅ Node.js found"
    
    # Check if npm is available
    if command -v npm &> /dev/null; then
        echo "✅ npm found"
        echo ""
        echo "Installing dependencies..."
        npm install
        echo ""
        echo "Starting server with npm..."
        npm start
    else
        echo "⚠️  npm not found, using Node.js server directly"
        echo ""
        echo "Starting server with Node.js..."
        node server.js
    fi

# Check if Python 3 is available
elif command -v python3 &> /dev/null; then
    echo "✅ Python 3 found"
    echo "⚠️  Node.js not found, using Python server"
    echo ""
    echo "Starting server with Python..."
    echo "📖 Open your browser and go to: http://localhost:3000"
    echo ""
    python3 -m http.server 3000

# Check if Python is available (might be Python 2 or 3)
elif command -v python &> /dev/null; then
    echo "✅ Python found"
    echo "⚠️  Node.js not found, using Python server"
    echo ""
    echo "Starting server with Python..."
    echo "📖 Open your browser and go to: http://localhost:3000"
    echo ""
    python -m http.server 3000

else
    echo "❌ Neither Node.js nor Python found!"
    echo ""
    echo "Please install one of the following:"
    echo "   • Node.js (recommended): https://nodejs.org/"
    echo "   • Python 3: https://python.org/"
    echo ""
    echo "Or use a browser extension like 'Live Server' in VS Code"
    echo ""
    exit 1
fi