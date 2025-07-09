@echo off
REM Text Embedding Explorer - Quick Start Script for Windows
REM This script provides multiple ways to run the demo locally

echo 🚀 Starting Text Embedding Explorer...
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js found
    
    REM Check if npm is available
    where npm >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ npm found
        echo.
        echo Installing dependencies...
        call npm install
        echo.
        echo Starting server with npm...
        call npm start
    ) else (
        echo ⚠️  npm not found, using Node.js server directly
        echo.
        echo Starting server with Node.js...
        node server.js
    )
) else (
    REM Check if Python is available
    where python >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Python found
        echo ⚠️  Node.js not found, using Python server
        echo.
        echo Starting server with Python...
        echo 📖 Open your browser and go to: http://localhost:3000
        echo.
        python -m http.server 3000
    ) else (
        echo ❌ Neither Node.js nor Python found!
        echo.
        echo Please install one of the following:
        echo    • Node.js (recommended): https://nodejs.org/
        echo    • Python 3: https://python.org/
        echo.
        echo Or use a browser extension like 'Live Server' in VS Code
        echo.
        pause
        exit /b 1
    )
)

pause