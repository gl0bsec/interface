// Settings management module
export class SettingsManager {
    constructor() {
        this.defaultSettings = {
            apiKey: '',
            model: 'gpt-3.5-turbo',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            maxTokens: 1000,
            displayFields: ['content', 'category', 'date'],
            apiFields: ['content', 'category']
        };
        
        this.settings = { ...this.defaultSettings };
        this.modelPricing = {
            'gpt-3.5-turbo': 0.002,
            'gpt-4': 0.03,
            'gpt-4-turbo-preview': 0.01
        };
        
        this.loadSettings();
    }
    
    validateApiKey(apiKey) {
        return apiKey && apiKey.length > 0 && apiKey.startsWith('sk-');
    }
    
    validateEndpoint(endpoint) {
        try {
            const url = new URL(endpoint);
            return url.protocol === 'https:' || url.protocol === 'http:';
        } catch {
            return false;
        }
    }
    
    validateMaxTokens(maxTokens) {
        return Number.isInteger(maxTokens) && maxTokens >= 1 && maxTokens <= 8000;
    }
    
    loadSettings() {
        const savedSettings = localStorage.getItem('embeddingAnalyzerSettings');
        if (savedSettings) {
            try {
                const loaded = JSON.parse(savedSettings);
                
                // Validate loaded settings before applying
                if (loaded.apiKey && !this.validateApiKey(loaded.apiKey)) {
                    console.warn('Invalid API key in saved settings, clearing it.');
                    delete loaded.apiKey;
                }
                
                if (loaded.endpoint && !this.validateEndpoint(loaded.endpoint)) {
                    console.warn('Invalid endpoint in saved settings, using default.');
                    loaded.endpoint = this.defaultSettings.endpoint;
                }
                
                if (loaded.maxTokens && !this.validateMaxTokens(loaded.maxTokens)) {
                    console.warn('Invalid max tokens in saved settings, using default.');
                    loaded.maxTokens = this.defaultSettings.maxTokens;
                }
                
                this.settings = { ...this.defaultSettings, ...loaded };
                
                // Ensure arrays exist for field selections
                if (!Array.isArray(this.settings.displayFields)) {
                    this.settings.displayFields = this.defaultSettings.displayFields;
                }
                if (!Array.isArray(this.settings.apiFields)) {
                    this.settings.apiFields = this.defaultSettings.apiFields;
                }
            } catch (e) {
                console.error('Failed to load settings:', e);
                this.settings = { ...this.defaultSettings };
            }
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('embeddingAnalyzerSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }
    
    updateSettings(newSettings) {
        // Validate inputs
        if (newSettings.apiKey && !this.validateApiKey(newSettings.apiKey)) {
            throw new Error('Invalid API key format. API key should start with "sk-".');
        }
        
        if (newSettings.endpoint && !this.validateEndpoint(newSettings.endpoint)) {
            throw new Error('Invalid endpoint URL. Please enter a valid HTTP or HTTPS URL.');
        }
        
        if (newSettings.maxTokens && !this.validateMaxTokens(newSettings.maxTokens)) {
            throw new Error('Invalid max tokens value. Please enter a number between 1 and 8000.');
        }
        
        // Ensure at least content field is selected
        if (newSettings.displayFields && !newSettings.displayFields.includes('content')) {
            newSettings.displayFields.unshift('content');
        }
        if (newSettings.apiFields && !newSettings.apiFields.includes('content')) {
            newSettings.apiFields.unshift('content');
        }
        
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }
    
    getSettings() {
        return { ...this.settings };
    }
    
    getSetting(key) {
        return this.settings[key];
    }
    
    getModelPricing() {
        return this.modelPricing;
    }
    
    estimateCost(itemCount, model = null) {
        const selectedModel = model || this.settings.model;
        const avgTokensPerText = 50;
        const promptTokens = 100;
        const totalTokens = (itemCount * avgTokensPerText) + promptTokens;
        const costPer1kTokens = this.modelPricing[selectedModel] || 0.002;
        return (totalTokens / 1000) * costPer1kTokens;
    }
}