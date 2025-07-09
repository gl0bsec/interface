// UI management module
export class UIManager {
    constructor(dataManager, settingsManager, analysisManager = null) {
        this.dataManager = dataManager;
        this.settingsManager = settingsManager;
        this.analysisManager = analysisManager;
        this.selectedIndices = new Set();
        
        this.setupEventListeners();
        this.setupTabNavigation();
    }
    
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideConfirmation();
                this.hideSettings();
                this.hideResults();
            }
        });
    }
    
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
    }
    
    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}Tab`);
        
        if (activeButton) activeButton.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
    }
    
    sanitizeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    
    updateSelectedIndices(selectedIndices) {
        this.selectedIndices = selectedIndices;
        this.updateSelectionInfo();
        this.updateAnalyzeButton();
    }
    
    updateSelectionInfo() {
        const preview = document.getElementById('selectionPreview');
        if (!preview) return;
        
        if (this.selectedIndices.size === 0) {
            preview.innerHTML = '<p class="empty-state">Select points to view details</p>';
            return;
        }
        
        try {
            const settings = this.settingsManager.getSettings();
            const selectedItems = this.dataManager.getSelectedItems(this.selectedIndices);
            
            if (!selectedItems || selectedItems.length === 0) {
                preview.innerHTML = '<p class="empty-state">No data found for selected points</p>';
                return;
            }
            
            const itemsToShow = selectedItems.slice(0, 10);
            const displayFields = settings.displayFields || ['content', 'category', 'date'];
            
            let itemsHtml = itemsToShow.map(item => {
                let fieldHtml = displayFields.map(field => {
                    if (item && item[field] !== undefined) {
                        const sanitizedField = this.sanitizeHtml(field);
                        const sanitizedValue = this.sanitizeHtml(String(item[field]));
                        return `<div class="field-row">
                            <span class="field-label">${sanitizedField}:</span> 
                            <span class="field-value">${sanitizedValue}</span>
                        </div>`;
                    }
                    return '';
                }).filter(Boolean).join('');
                
                return fieldHtml ? `<div class="text-item">${fieldHtml}</div>` : '';
            }).filter(Boolean).join('');
            
            if (!itemsHtml) {
                preview.innerHTML = '<p class="empty-state">No displayable data for selected points</p>';
                return;
            }
            
            preview.innerHTML = `
                <div class="selection-preview">
                    <h4 style="margin-bottom: 12px; color: #e0e0e0;">Selected Items (${this.selectedIndices.size} total)</h4>
                    ${itemsHtml}
                    ${this.selectedIndices.size > 10 ? 
                        `<p style="color: #888; text-align: center; margin-top: 12px; font-size: 14px;">... and ${this.selectedIndices.size - 10} more</p>` : 
                        ''}
                </div>
            `;
        } catch (error) {
            console.error('Error updating selection info:', error);
            preview.innerHTML = `<p style="color: #ff6b6b; text-align: center; padding: 20px;">Error: ${error.message}</p>`;
        }
    }
    
    updateAnalyzeButton() {
        const btn = document.getElementById('analyzeBtn');
        if (!btn) return;
        
        const settings = this.settingsManager.getSettings();
        
        if (!settings.apiKey) {
            btn.textContent = 'Configure API Key First';
            btn.disabled = true;
            btn.style.background = '#444';
            btn.style.borderColor = '#555';
        } else if (this.selectedIndices.size === 0) {
            btn.textContent = 'Analyze Selection';
            btn.disabled = true;
            btn.style.background = '';
            btn.style.borderColor = '';
        } else {
            btn.textContent = 'Analyze Selection';
            btn.disabled = false;
            btn.style.background = '';
            btn.style.borderColor = '';
        }
    }
    
    // Settings modal methods
    showSettings() {
        const settings = this.settingsManager.getSettings();
        
        const apiKeyInput = document.getElementById('apiKeyInput');
        const modelSelect = document.getElementById('modelSelect');
        const endpointInput = document.getElementById('endpointInput');
        const maxTokensInput = document.getElementById('maxTokensInput');
        
        if (apiKeyInput) apiKeyInput.value = settings.apiKey;
        if (modelSelect) modelSelect.value = settings.model;
        if (endpointInput) endpointInput.value = settings.endpoint;
        if (maxTokensInput) maxTokensInput.value = settings.maxTokens;
        
        this.populateFieldCheckboxes();
        
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.style.display = 'block';
        }
    }
    
    hideSettings() {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.style.display = 'none';
        }
    }
    
    saveSettings() {
        try {
            const apiKey = document.getElementById('apiKeyInput')?.value.trim() || '';
            const model = document.getElementById('modelSelect')?.value || 'gpt-3.5-turbo';
            const endpoint = document.getElementById('endpointInput')?.value.trim() || '';
            const maxTokens = parseInt(document.getElementById('maxTokensInput')?.value) || 1000;
            
            // Get selected display fields
            const displayFields = [];
            document.querySelectorAll('#displayFieldsGroup input[type="checkbox"]:checked').forEach(checkbox => {
                displayFields.push(checkbox.value);
            });
            
            // Get selected API fields
            const apiFields = [];
            document.querySelectorAll('#apiFieldsGroup input[type="checkbox"]:checked').forEach(checkbox => {
                apiFields.push(checkbox.value);
            });
            
            this.settingsManager.updateSettings({
                apiKey,
                model,
                endpoint,
                maxTokens,
                displayFields,
                apiFields
            });
            
            this.hideSettings();
            this.updateSelectionInfo();
            this.updateAnalyzeButton();
            
            // Show success feedback
            this.showSettingsSaved();
            
        } catch (error) {
            alert(error.message);
        }
    }
    
    showSettingsSaved() {
        const btn = document.getElementById('analyzeBtn');
        if (!btn) return;
        
        const originalText = btn.textContent;
        const settings = this.settingsManager.getSettings();
        
        if (settings.apiKey) {
            btn.textContent = 'Settings Saved!';
            btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            setTimeout(() => {
                btn.textContent = this.selectedIndices.size > 0 ? 'Analyze Selection' : originalText;
                btn.style.background = '';
            }, 2000);
        }
    }
    
    populateFieldCheckboxes() {
        const displayGroup = document.getElementById('displayFieldsGroup');
        const apiGroup = document.getElementById('apiFieldsGroup');
        
        if (!displayGroup || !apiGroup) return;
        
        const availableFields = this.dataManager.getAvailableFields();
        const settings = this.settingsManager.getSettings();
        
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
    
    toggleApiKeyVisibility() {
        const input = document.getElementById('apiKeyInput');
        const icon = document.getElementById('visibilityIcon');
        
        if (!input || !icon) return;
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = '🙈';
        } else {
            input.type = 'password';
            icon.textContent = '👁';
        }
    }
    
    // Confirmation modal methods
    showConfirmation() {
        const settings = this.settingsManager.getSettings();
        
        if (!settings.apiKey) {
            alert('Please configure your API key in the settings first.');
            this.showSettings();
            return;
        }
        
        const modal = document.getElementById('confirmModal');
        if (!modal) return;
        
        modal.style.display = 'block';
        
        const count = this.selectedIndices.size;
        const estimatedCost = this.settingsManager.estimateCost(count);
        const avgTokensPerText = 50;
        const promptTokens = 100;
        const totalTokens = (count * avgTokensPerText) + promptTokens;
        
        const confirmCount = document.getElementById('confirmCount');
        const costTexts = document.getElementById('costTexts');
        const costTokens = document.getElementById('costTokens');
        const costModel = document.getElementById('costModel');
        const costEstimate = document.getElementById('costEstimate');
        
        if (confirmCount) confirmCount.textContent = count;
        if (costTexts) costTexts.textContent = count;
        if (costTokens) costTokens.textContent = `~${totalTokens}`;
        if (costModel) costModel.textContent = settings.model.toUpperCase().replace('-', ' ');
        if (costEstimate) costEstimate.textContent = `$${estimatedCost.toFixed(4)}`;
    }
    
    hideConfirmation() {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // Results panel methods
    showResults(content) {
        const resultsContent = document.getElementById('resultsContent');
        const resultsPanel = document.getElementById('resultsPanel');
        
        if (!resultsContent || !resultsPanel) {
            console.error('Results panel elements not found');
            return;
        }
        
        resultsContent.textContent = content;
        resultsPanel.style.display = 'block';
    }
    
    hideResults() {
        const resultsPanel = document.getElementById('resultsPanel');
        if (resultsPanel) {
            resultsPanel.style.display = 'none';
        }
    }
    
    showError(message) {
        const errorMessage = `## Error\n\n${message}\n\nPlease check your configuration and try again.`;
        this.showResults(errorMessage);
    }
    
    // Analysis button state management
    setAnalyzeButtonLoading(loading = true) {
        const btn = document.getElementById('analyzeBtn');
        if (!btn) return;
        
        if (loading) {
            btn.disabled = true;
            btn.textContent = 'Analyzing...';
        } else {
            btn.disabled = this.selectedIndices.size === 0 || !this.settingsManager.getSetting('apiKey');
            btn.textContent = 'Analyze Selection';
        }
    }
}