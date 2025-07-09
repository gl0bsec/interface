// Main application module
import { DataManager } from './data.js';
import { SettingsManager } from './settings.js';
import { D3VisualizationManager as VisualizationManager } from './d3-visualization.js';
import { UIManager } from './ui.js';
import { AnalysisManager } from './analysis.js';

class EmbeddingExplorerApp {
    constructor() {
        this.initializeModules();
        this.setupGlobalEventHandlers();
        this.initialize();
    }
    
    initializeModules() {
        // Initialize modules in dependency order
        this.dataManager = new DataManager();
        this.settingsManager = new SettingsManager();
        this.uiManager = new UIManager(this.dataManager, this.settingsManager);
        this.analysisManager = new AnalysisManager(this.dataManager, this.settingsManager, this.uiManager);
        this.visualizationManager = new VisualizationManager(this.dataManager);
        
        // Setup inter-module communication
        this.visualizationManager.onSelectionChange = (selectedIndices) => {
            this.uiManager.updateSelectedIndices(selectedIndices);
        };
    }
    
    setupGlobalEventHandlers() {
        // Make functions available globally for onclick handlers
        window.showSettings = () => this.uiManager.showSettings();
        window.hideSettings = () => this.uiManager.hideSettings();
        window.saveSettings = () => this.uiManager.saveSettings();
        window.toggleApiKeyVisibility = () => this.uiManager.toggleApiKeyVisibility();
        
        window.showConfirmation = () => this.uiManager.showConfirmation();
        window.hideConfirmation = () => this.uiManager.hideConfirmation();
        window.proceedWithAnalysis = () => {
            const selectedIndices = this.visualizationManager.getSelectedIndices();
            this.analysisManager.analyzeSelection(selectedIndices);
        };
        
        window.hideResults = () => this.uiManager.hideResults();
        
        window.setSelectionMode = (mode) => this.visualizationManager.setSelectionMode(mode);
        window.clearSelection = () => this.visualizationManager.clearSelection();
        window.zoomIn = () => this.visualizationManager.zoomIn();
        window.zoomOut = () => this.visualizationManager.zoomOut();
        window.resetZoom = () => this.visualizationManager.resetZoom();
        
    }
    
    initialize() {
        // Initialize UI components
        this.visualizationManager.populateLegend();
        this.visualizationManager.updateVisualization();
        this.uiManager.updateAnalyzeButton();
        
        // Handle window resize for visualization
        window.addEventListener('resize', () => {
            if (this.visualizationManager && this.visualizationManager.handleResize) {
                this.visualizationManager.handleResize();
            }
        });
        
        // Setup keyboard shortcuts for selection modes
        this.setupKeyboardShortcuts();
        
        
        console.log('Embedding Explorer App initialized successfully');
    }
    
    setupKeyboardShortcuts() {
        // Setup keyboard shortcuts for selection modes and app functions
        document.addEventListener('keydown', (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }
            
            if (event.key === 'Escape') {
                this.uiManager.hideConfirmation();
                this.uiManager.hideSettings();
                this.uiManager.hideResults();
            }
            
            // Keyboard shortcuts for selection modes (Shift+L/B/C)
            if (event.shiftKey) {
                switch(event.key.toLowerCase()) {
                    case 'l':
                        event.preventDefault();
                        this.visualizationManager.setSelectionMode('lasso');
                        break;
                    case 'b':
                        event.preventDefault();
                        this.visualizationManager.setSelectionMode('box');
                        break;
                    case 'c':
                        event.preventDefault();
                        this.visualizationManager.clearSelection();
                        break;
                }
            }

            switch(event.key) {
                case '+':
                case '=':
                    event.preventDefault();
                    this.visualizationManager.zoomIn();
                    break;
                case '-':
                    event.preventDefault();
                    this.visualizationManager.zoomOut();
                    break;
                case 'Home':
                    event.preventDefault();
                    this.visualizationManager.resetZoom();
                    break;
            }
        });
    }
    
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmbeddingExplorerApp();});