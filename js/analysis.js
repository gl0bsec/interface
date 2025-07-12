// Analysis management module
export class AnalysisManager {
    constructor(dataManager, settingsManager) {
        this.dataManager = dataManager;
        this.settingsManager = settingsManager;
        this.uiManager = null; // Will be set later to avoid circular dependency
    }
    
    setUIManager(uiManager) {
        this.uiManager = uiManager;
    }
    
    async analyzeSelection(selectedIndices) {
        const settings = this.settingsManager.getSettings();
        
        // Validate prerequisites
        if (!settings.apiKey) {
            this.uiManager.showError('API key is required. Please configure it in settings.');
            return;
        }
        
        if (selectedIndices.size === 0) {
            this.uiManager.showError('No items selected. Please select some points on the scatter plot.');
            return;
        }
        
        const promptInput = document.getElementById('promptInput');
        const prompt = promptInput?.value.trim();
        if (!prompt) {
            this.uiManager.showError('Please enter an analysis prompt.');
            return;
        }
        
        this.uiManager.setAnalyzeButtonLoading(true);
        
        try {
            // Gather selected items with specified fields
            const selectedItems = this.dataManager.getSelectedItems(selectedIndices, settings.apiFields);
            
            if (selectedItems.length === 0) {
                throw new Error('No valid items found in selection.');
            }
            
            // Format items for API
            const itemsText = this.formatItemsForAPI(selectedItems);
            const fullPrompt = `${prompt}\n\nData to analyze:\n${itemsText}`;
            
            // Make API request
            const results = await this.makeAPIRequest(fullPrompt, settings);
            
            this.uiManager.showResults(results);
            
        } catch (error) {
            console.error('Analysis error:', error);
            this.handleAnalysisError(error);
        } finally {
            this.uiManager.setAnalyzeButtonLoading(false);
        }
    }
    
    formatItemsForAPI(selectedItems) {
        return selectedItems.map((item, idx) => {
            let itemStr = `Item ${idx + 1}:\n`;
            Object.entries(item).forEach(([key, value]) => {
                itemStr += `  ${key}: ${value}\n`;
            });
            return itemStr;
        }).join('\n');
    }
    
    async makeAPIRequest(fullPrompt, settings) {
        // Make API request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        try {
            const response = await fetch(settings.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.apiKey}`
                },
                body: JSON.stringify({
                    model: settings.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful data analyst specializing in text analysis and pattern recognition.'
                        },
                        {
                            role: 'user',
                            content: fullPrompt
                        }
                    ],
                    max_tokens: settings.maxTokens,
                    temperature: 0.7
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `API Error: ${response.status} ${response.statusText}`;
                
                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.error && errorData.error.message) {
                        errorMessage += ` - ${errorData.error.message}`;
                    }
                } catch {
                    // Ignore JSON parsing errors
                }
                
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            
            // Validate response structure
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response structure from API');
            }
            
            const results = data.choices[0].message.content;
            
            if (!results || results.trim() === '') {
                throw new Error('Empty response from API');
            }
            
            return results;
            
        } finally {
            clearTimeout(timeoutId);
        }
    }
    
    handleAnalysisError(error) {
        let errorMessage = 'An error occurred during analysis.';
        
        if (error.name === 'AbortError') {
            errorMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('API Error: 401')) {
            errorMessage = 'Invalid API key. Please check your settings.';
        } else if (error.message.includes('API Error: 429')) {
            errorMessage = 'Rate limit exceeded. Please wait and try again.';
        } else if (error.message.includes('API Error: 500')) {
            errorMessage = 'Server error. Please try again later.';
        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            errorMessage = 'Network error. Please check your internet connection.';
        } else {
            errorMessage = error.message;
        }
        
        this.uiManager.showError(errorMessage);
    }
}