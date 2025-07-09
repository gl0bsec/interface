// Sample data - replace with your actual embeddings
// Your data should have x, y coordinates and any additional fields you want to display/analyze
const sampleTexts = [
    { content: "Climate change impacts on coastal regions", category: "Environment", date: "2025-01-15", author: "Smith J.", sentiment: "Negative" },
    { content: "New AI breakthrough in language processing", category: "Technology", date: "2025-01-14", author: "Chen L.", sentiment: "Positive" },
    { content: "Global economic uncertainty amid inflation", category: "Economy", date: "2025-01-13", author: "Johnson M.", sentiment: "Negative" },
    { content: "Renewable energy adoption accelerates", category: "Environment", date: "2025-01-12", author: "Williams A.", sentiment: "Positive" },
    { content: "Tech giants face regulatory scrutiny", category: "Technology", date: "2025-01-11", author: "Davis R.", sentiment: "Neutral" },
    { content: "Healthcare innovation in remote medicine", category: "Healthcare", date: "2025-01-10", author: "Brown K.", sentiment: "Positive" },
    { content: "Urban planning for sustainable cities", category: "Environment", date: "2025-01-09", author: "Garcia M.", sentiment: "Positive" },
    { content: "Cryptocurrency market volatility continues", category: "Finance", date: "2025-01-08", author: "Miller T.", sentiment: "Negative" },
    { content: "Education technology transforms learning", category: "Education", date: "2025-01-07", author: "Wilson E.", sentiment: "Positive" },
    { content: "Space exploration reaches new milestone", category: "Science", date: "2025-01-06", author: "Anderson P.", sentiment: "Positive" },
    { content: "Biodiversity conservation efforts expand", category: "Environment", date: "2025-01-05", author: "Taylor S.", sentiment: "Neutral" },
    { content: "Quantum computing advances rapidly", category: "Technology", date: "2025-01-04", author: "Lee H.", sentiment: "Positive" },
    { content: "Social media influence on democracy", category: "Politics", date: "2025-01-03", author: "Martin D.", sentiment: "Negative" },
    { content: "Food security challenges worldwide", category: "Agriculture", date: "2025-01-02", author: "White L.", sentiment: "Negative" },
    { content: "Artificial intelligence ethics debate", category: "Technology", date: "2025-01-01", author: "Harris J.", sentiment: "Neutral" },
    { content: "Ocean pollution threatens marine life", category: "Environment", date: "2024-12-31", author: "Clark B.", sentiment: "Negative" },
    { content: "Remote work reshapes office culture", category: "Business", date: "2024-12-30", author: "Lewis R.", sentiment: "Neutral" },
    { content: "Electric vehicle market growth", category: "Technology", date: "2024-12-29", author: "Walker M.", sentiment: "Positive" },
    { content: "Cybersecurity threats evolve", category: "Technology", date: "2024-12-28", author: "Hall K.", sentiment: "Negative" },
    { content: "Mental health awareness increases", category: "Healthcare", date: "2024-12-27", author: "Young A.", sentiment: "Positive" }
];

// Generate random 2D embeddings for demo
const embeddings = sampleTexts.map((data, i) => ({
    x: Math.random() * 10 - 5 + (i % 4) * 2,
    y: Math.random() * 10 - 5 + Math.floor(i / 4) * 1.5,
    ...data,
    index: i
}));

// Extract available fields from data
const availableFields = Object.keys(embeddings[0]).filter(key => 
    !['x', 'y', 'index'].includes(key)
);

let selectedIndices = new Set();
let selectionMode = 'lasso';

// Settings configuration
let settings = {
    apiKey: '',
    model: 'gpt-3.5-turbo',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    maxTokens: 1000,
    displayFields: ['content', 'category', 'date'], // Fields to show in selection
    apiFields: ['content', 'category'] // Fields to include in API call
};

// Model pricing (per 1K tokens)
const modelPricing = {
    'gpt-3.5-turbo': 0.002,
    'gpt-4': 0.03,
    'gpt-4-turbo-preview': 0.01
};

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('embeddingAnalyzerSettings');
    if (savedSettings) {
        try {
            const loaded = JSON.parse(savedSettings);
            
            // Validate loaded settings before applying
            if (loaded.apiKey && !validateApiKey(loaded.apiKey)) {
                console.warn('Invalid API key in saved settings, clearing it.');
                delete loaded.apiKey;
            }
            
            if (loaded.endpoint && !validateEndpoint(loaded.endpoint)) {
                console.warn('Invalid endpoint in saved settings, using default.');
                loaded.endpoint = settings.endpoint;
            }
            
            if (loaded.maxTokens && !validateMaxTokens(loaded.maxTokens)) {
                console.warn('Invalid max tokens in saved settings, using default.');
                loaded.maxTokens = settings.maxTokens;
            }
            
            settings = { ...settings, ...loaded };
            
            // Ensure arrays exist for field selections
            if (!Array.isArray(settings.displayFields)) {
                settings.displayFields = ['content', 'category', 'date'];
            }
            if (!Array.isArray(settings.apiFields)) {
                settings.apiFields = ['content', 'category'];
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
            // Reset to defaults if corrupted
            settings = {
                apiKey: '',
                model: 'gpt-3.5-turbo',
                endpoint: 'https://api.openai.com/v1/chat/completions',
                maxTokens: 1000,
                displayFields: ['content', 'category', 'date'],
                apiFields: ['content', 'category']
            };
        }
    }
}

// Save settings to localStorage
function saveSettingsToStorage() {
    try {
        localStorage.setItem('embeddingAnalyzerSettings', JSON.stringify(settings));
    } catch (e) {
        console.error('Failed to save settings:', e);
    }
}

// Show settings modal
function showSettings() {
    document.getElementById('apiKeyInput').value = settings.apiKey;
    document.getElementById('modelSelect').value = settings.model;
    document.getElementById('endpointInput').value = settings.endpoint;
    document.getElementById('maxTokensInput').value = settings.maxTokens;
    
    // Populate field checkboxes
    populateFieldCheckboxes();
    
    document.getElementById('settingsModal').style.display = 'block';
}

// Populate field checkboxes
function populateFieldCheckboxes() {
    const displayGroup = document.getElementById('displayFieldsGroup');
    const apiGroup = document.getElementById('apiFieldsGroup');
    
    displayGroup.innerHTML = '';
    apiGroup.innerHTML = '';
    
    availableFields.forEach(field => {
        // Display fields checkbox
        const displayItem = document.createElement('div');
        displayItem.className = 'checkbox-item';
        displayItem.innerHTML = `
            <input type="checkbox" id="display_${field}" value="${field}" 
                   ${settings.displayFields.includes(field) ? 'checked' : ''}>
            <label for="display_${field}">${field.charAt(0).toUpperCase() + field.slice(1)}</label>
        `;
        displayGroup.appendChild(displayItem);
        
        // API fields checkbox
        const apiItem = document.createElement('div');
        apiItem.className = 'checkbox-item';
        apiItem.innerHTML = `
            <input type="checkbox" id="api_${field}" value="${field}" 
                   ${settings.apiFields.includes(field) ? 'checked' : ''}>
            <label for="api_${field}">${field.charAt(0).toUpperCase() + field.slice(1)}</label>
        `;
        apiGroup.appendChild(apiItem);
    });
}

// Hide settings modal
function hideSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

// Validation functions
function validateApiKey(apiKey) {
    return apiKey && apiKey.length > 0 && apiKey.startsWith('sk-');
}

function validateEndpoint(endpoint) {
    try {
        const url = new URL(endpoint);
        return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
        return false;
    }
}

function validateMaxTokens(maxTokens) {
    return Number.isInteger(maxTokens) && maxTokens >= 1 && maxTokens <= 8000;
}

function sanitizeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Save settings
function saveSettings() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    const endpoint = document.getElementById('endpointInput').value.trim();
    const maxTokens = parseInt(document.getElementById('maxTokensInput').value);
    
    // Validate inputs
    if (apiKey && !validateApiKey(apiKey)) {
        alert('Invalid API key format. API key should start with "sk-".');
        return;
    }
    
    if (!validateEndpoint(endpoint)) {
        alert('Invalid endpoint URL. Please enter a valid HTTP or HTTPS URL.');
        return;
    }
    
    if (!validateMaxTokens(maxTokens)) {
        alert('Invalid max tokens value. Please enter a number between 1 and 8000.');
        return;
    }
    
    settings.apiKey = apiKey;
    settings.model = document.getElementById('modelSelect').value;
    settings.endpoint = endpoint;
    settings.maxTokens = maxTokens;
    
    // Get selected display fields
    settings.displayFields = [];
    document.querySelectorAll('#displayFieldsGroup input[type="checkbox"]:checked').forEach(checkbox => {
        settings.displayFields.push(checkbox.value);
    });
    
    // Get selected API fields
    settings.apiFields = [];
    document.querySelectorAll('#apiFieldsGroup input[type="checkbox"]:checked').forEach(checkbox => {
        settings.apiFields.push(checkbox.value);
    });
    
    // Ensure at least content field is selected
    if (!settings.displayFields.includes('content')) {
        settings.displayFields.unshift('content');
    }
    if (!settings.apiFields.includes('content')) {
        settings.apiFields.unshift('content');
    }
    
    saveSettingsToStorage();
    hideSettings();
    
    // Update UI based on new settings
    updateSelectionInfo();
    
    // Show success feedback
    const btn = document.getElementById('analyzeBtn');
    const originalText = btn.textContent;
    if (settings.apiKey) {
        btn.textContent = 'Settings Saved!';
        btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        setTimeout(() => {
            btn.textContent = selectedIndices.size > 0 ? 'Analyze Selection' : originalText;
            btn.style.background = '';
        }, 2000);
    }
}

// Toggle API key visibility
function toggleApiKeyVisibility() {
    const input = document.getElementById('apiKeyInput');
    const icon = document.getElementById('visibilityIcon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = '🙈';
    } else {
        input.type = 'password';
        icon.textContent = '👁';
    }
}

// Get unique categories for color mapping
const categories = [...new Set(embeddings.map(e => e.category))];
const categoryColors = [
    '#4a9eff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731',
    '#5f27cd', '#00d2d3', '#ff9ff3', '#54a0ff', '#48dbfb'
];

// Initialize plot
const trace = {
    x: embeddings.map(e => e.x),
    y: embeddings.map(e => e.y),
    text: embeddings.map(e => e.content),
    customdata: embeddings.map(e => ({
        category: e.category || 'N/A',
        date: e.date || 'N/A',
        author: e.author || 'N/A',
        sentiment: e.sentiment || 'N/A'
    })),
    mode: 'markers',
    type: 'scatter',
    marker: {
        size: 10,
        color: embeddings.map(e => {
            const catIndex = categories.indexOf(e.category);
            return categoryColors[catIndex % categoryColors.length];
        }),
        line: {
            color: 'rgba(0, 0, 0, 0.3)',
            width: 1
        }
    },
    hovertemplate: '<b>%{text}</b><br>' +
                  'Category: %{customdata.category}<br>' +
                  'Date: %{customdata.date}<br>' +
                  'Author: %{customdata.author}<br>' +
                  'Sentiment: %{customdata.sentiment}' +
                  '<extra></extra>'
};

const layout = {
    title: '',
    xaxis: { 
        title: '', 
        showgrid: true,
        gridcolor: '#2a2a2a',
        zerolinecolor: '#3a3a3a',
        tickfont: { color: '#aaa' }
    },
    yaxis: { 
        title: '', 
        showgrid: true,
        gridcolor: '#2a2a2a',
        zerolinecolor: '#3a3a3a',
        tickfont: { color: '#aaa' }
    },
    paper_bgcolor: '#0a0a0a',
    plot_bgcolor: '#0a0a0a',
    font: { color: '#e0e0e0' },
    showlegend: false,
    hovermode: 'closest',
    dragmode: 'lasso'
};

const config = {
    responsive: true,
    displayModeBar: false
};

Plotly.newPlot('plot', [trace], layout, config);

// Handle selection
document.getElementById('plot').on('plotly_selected', function(eventData) {
    if (!eventData || !eventData.points) return;
    
    selectedIndices.clear();
    eventData.points.forEach(point => {
        selectedIndices.add(point.pointIndex);
    });
    
    updateVisualization();
    updateSelectionInfo();
});

function setSelectionMode(mode) {
    selectionMode = mode;
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    Plotly.relayout('plot', {
        dragmode: mode === 'lasso' ? 'lasso' : 'select'
    });
}

function clearSelection() {
    selectedIndices.clear();
    updateVisualization();
    updateSelectionInfo();
}

function updateVisualization() {
    const colors = embeddings.map((e, i) => {
        if (selectedIndices.has(i)) {
            return '#ff6b6b'; // Red for selected
        } else {
            const catIndex = categories.indexOf(e.category);
            return categoryColors[catIndex % categoryColors.length];
        }
    });
    
    const sizes = embeddings.map((_, i) => 
        selectedIndices.has(i) ? 14 : 10
    );
    
    Plotly.restyle('plot', {
        'marker.color': [colors],
        'marker.size': [sizes]
    });
    
    document.getElementById('totalPoints').textContent = embeddings.length;
    document.getElementById('selectedPoints').textContent = selectedIndices.size;
    
    // Update button state
    const btn = document.getElementById('analyzeBtn');
    if (!settings.apiKey) {
        btn.textContent = 'Configure API Key First';
        btn.disabled = true;
    } else if (selectedIndices.size === 0) {
        btn.textContent = 'Analyze Selection';
        btn.disabled = true;
    } else {
        btn.textContent = 'Analyze Selection';
        btn.disabled = false;
    }
}

function updateSelectionInfo() {
    const preview = document.getElementById('selectionPreview');
    const btn = document.getElementById('analyzeBtn');
    
    if (selectedIndices.size === 0) {
        preview.innerHTML = '<p style="color: #888; text-align: center; padding: 40px; font-size: 15px;">Select points on the scatter plot to analyze them</p>';
        btn.disabled = true;
        return;
    }
    
    try {
        const selectedItems = Array.from(selectedIndices)
            .map(i => {
                if (i < 0 || i >= embeddings.length) {
                    console.warn(`Invalid index ${i} in selection`);
                    return null;
                }
                return embeddings[i];
            })
            .filter(item => item !== null)
            .slice(0, 10);
        
        let itemsHtml = selectedItems.map(item => {
            let fieldHtml = settings.displayFields.map(field => {
                if (item[field] !== undefined) {
                    const sanitizedField = sanitizeHtml(field);
                    const sanitizedValue = sanitizeHtml(String(item[field]));
                    return `<div class="field-row">
                        <span class="field-label">${sanitizedField}:</span> 
                        <span class="field-value">${sanitizedValue}</span>
                    </div>`;
                }
                return '';
            }).join('');
            
            return `<div class="text-item">${fieldHtml}</div>`;
        }).join('');
    
    preview.innerHTML = `
        <div class="selection-preview">
            <h4 style="margin-bottom: 12px; color: #e0e0e0;">Selected Items (${selectedIndices.size} total)</h4>
            ${itemsHtml}
            ${selectedIndices.size > 10 ? 
                `<p style="color: #888; text-align: center; margin-top: 12px; font-size: 14px;">... and ${selectedIndices.size - 10} more</p>` : 
                ''}
        </div>
    `;
    
    // Update button state
    if (!settings.apiKey) {
        btn.textContent = 'Configure API Key First';
        btn.disabled = true;
        btn.style.background = '#444';
        btn.style.borderColor = '#555';
    } else {
        btn.textContent = 'Analyze Selection';
        btn.disabled = false;
        btn.style.background = '';
        btn.style.borderColor = '';
    }
}

function showConfirmation() {
    // Check if API key is set
    if (!settings.apiKey) {
        alert('Please configure your API key in the settings first.');
        showSettings();
        return;
    }
    
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'block';
    
    const count = selectedIndices.size;
    const avgTokensPerText = 50;
    const promptTokens = 100;
    const totalTokens = (count * avgTokensPerText) + promptTokens;
    const costPer1kTokens = modelPricing[settings.model] || 0.002;
    const estimatedCost = (totalTokens / 1000) * costPer1kTokens;
    
    document.getElementById('confirmCount').textContent = count;
    document.getElementById('costTexts').textContent = count;
    document.getElementById('costTokens').textContent = `~${totalTokens}`;
    document.getElementById('costModel').textContent = settings.model.toUpperCase().replace('-', ' ');
    document.getElementById('costEstimate').textContent = `${estimatedCost.toFixed(4)}`;
}

function hideConfirmation() {
    document.getElementById('confirmModal').style.display = 'none';
}

async function proceedWithAnalysis() {
    hideConfirmation();
    
    // Validate prerequisites
    if (!settings.apiKey) {
        showError('API key is required. Please configure it in settings.');
        return;
    }
    
    if (selectedIndices.size === 0) {
        showError('No items selected. Please select some points on the scatter plot.');
        return;
    }
    
    const prompt = document.getElementById('promptInput').value.trim();
    if (!prompt) {
        showError('Please enter an analysis prompt.');
        return;
    }
    
    // Show loading state
    const btn = document.getElementById('analyzeBtn');
    btn.disabled = true;
    btn.textContent = 'Analyzing...';
    
    try {
        // Gather selected items with specified fields
        const selectedItems = Array.from(selectedIndices)
            .map(i => {
                if (i < 0 || i >= embeddings.length) {
                    console.warn(`Invalid index ${i} in selection`);
                    return null;
                }
                return embeddings[i];
            })
            .filter(item => item !== null)
            .map(item => {
                const filteredItem = {};
                settings.apiFields.forEach(field => {
                    if (item[field] !== undefined) {
                        filteredItem[field] = item[field];
                    }
                });
                return filteredItem;
            });
        
        if (selectedItems.length === 0) {
            throw new Error('No valid items found in selection.');
        }
        
        // Format items for API
        let itemsText = selectedItems.map((item, idx) => {
            let itemStr = `Item ${idx + 1}:\n`;
            Object.entries(item).forEach(([key, value]) => {
                itemStr += `  ${key}: ${value}\n`;
            });
            return itemStr;
        }).join('\n');
        
        const fullPrompt = `${prompt}\n\nData to analyze:\n${itemsText}`;
    
    try {
        // Make API request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
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
        
        showResults(results);
        btn.disabled = false;
        btn.textContent = 'Analyze Selection';
        
    } catch (error) {
        console.error('Analysis error:', error);
        
        let errorMessage = 'An error occurred during analysis.';
        
        if (error.name === 'AbortError') {
            errorMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('API Error: 401')) {
            errorMessage = 'Invalid API key. Please check your settings.';
        } else if (error.message.includes('API Error: 429')) {
            errorMessage = 'Rate limit exceeded. Please wait and try again.';
        } else if (error.message.includes('API Error: 500')) {
            errorMessage = 'Server error. Please try again later.';
        } else {
            errorMessage = error.message;
        }
        
        showError(errorMessage);
        
        btn.disabled = false;
        btn.textContent = 'Analyze Selection';
    }
}
}

function showResults(content) {
    const resultsContent = document.getElementById('resultsContent');
    const resultsPanel = document.getElementById('resultsPanel');
    
    if (!resultsContent || !resultsPanel) {
        console.error('Results panel elements not found');
        return;
    }
    
    resultsContent.textContent = content;
    resultsPanel.style.display = 'block';
}

function showError(message) {
    const errorMessage = `## Error\n\n${message}\n\nPlease check your configuration and try again.`;
    showResults(errorMessage);
}

function hideResults() {
    document.getElementById('resultsPanel').style.display = 'none';
}

// Initialize
loadSettings();
populateLegend();
updateVisualization();

// Populate legend
function populateLegend() {
    const legendPanel = document.getElementById('legendPanel');
    const legendHtml = categories.slice(0, 10).map((cat, idx) => `
        <div class="legend-item">
            <div class="legend-color" style="background-color: ${categoryColors[idx % categoryColors.length]}"></div>
            <span>${cat}</span>
        </div>
    `).join('');
    
    legendPanel.innerHTML = `
        <div class="legend-title">Categories</div>
        ${legendHtml}
        ${categories.length > 10 ? '<div class="legend-item" style="color: #666;">... and more</div>' : ''}
        <div class="legend-item" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #3a3a3a;">
            <div class="legend-color" style="background-color: #ff6b6b"></div>
            <span>Selected</span>
        </div>
    `;
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hideConfirmation();
        hideSettings();
        hideResults();
    }
});