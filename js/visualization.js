// Visualization management module
export class VisualizationManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.selectedIndices = new Set();
        this.selectionMode = 'lasso';
        this.defaultXRange = null;
        this.defaultYRange = null;
        this.categoryColors = [
            '#4a9eff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731',
            '#5f27cd', '#00d2d3', '#ff9ff3', '#54a0ff', '#48dbfb'
        ];
        
        this.initializePlot();
        this.setupEventHandlers();
    }
    
    initializePlot() {
        const embeddings = this.dataManager.getEmbeddings();
        const categories = this.dataManager.getCategories();

        const xValues = embeddings.map(e => e.x);
        const yValues = embeddings.map(e => e.y);
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);
        this.defaultXRange = [xMin, xMax];
        this.defaultYRange = [yMin, yMax];
        
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
                    return this.categoryColors[catIndex % this.categoryColors.length];
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
                tickfont: { color: '#aaa' },
                range: this.defaultXRange
            },
            yaxis: {
                title: '',
                showgrid: true,
                gridcolor: '#2a2a2a',
                zerolinecolor: '#3a3a3a',
                tickfont: { color: '#aaa' },
                range: this.defaultYRange
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
            displayModeBar: false,
            staticPlot: false,
            scrollZoom: true
        };
        
        Plotly.newPlot('plot', [trace], layout, config).then(() => {
            // Ensure plot resizes correctly with the new layout
            setTimeout(() => {
                Plotly.Plots.resize('plot');
            }, 100);
        });
    }
    
    setupEventHandlers() {
        // Handle selection
        document.getElementById('plot').on('plotly_selected', (eventData) => {
            if (!eventData || !eventData.points) return;
            
            this.selectedIndices.clear();
            eventData.points.forEach(point => {
                this.selectedIndices.add(point.pointIndex);
            });
            
            this.updateVisualization();
            this.onSelectionChange?.(this.selectedIndices);
        });

        document.getElementById('plot').on('plotly_deselect', () => {
            this.clearSelection();
        });
    }
    
    setSelectionMode(mode) {
        this.selectionMode = mode;
        
        Plotly.relayout('plot', {
            dragmode: mode === 'lasso' ? 'lasso' : 'select'
        });
    }
    
    clearSelection() {
        this.selectedIndices.clear();
        this.updateVisualization();
        this.onSelectionChange?.(this.selectedIndices);
    }
    
    updateVisualization() {
        const embeddings = this.dataManager.getEmbeddings();
        const categories = this.dataManager.getCategories();
        
        const colors = embeddings.map((e, i) => {
            if (this.selectedIndices.has(i)) {
                return '#ff6b6b'; // Red for selected
            } else {
                const catIndex = categories.indexOf(e.category);
                return this.categoryColors[catIndex % this.categoryColors.length];
            }
        });
        
        const sizes = embeddings.map((_, i) => 
            this.selectedIndices.has(i) ? 14 : 10
        );
        
        Plotly.restyle('plot', {
            'marker.color': [colors],
            'marker.size': [sizes]
        });
        
        this.updateStats();
    }
    
    updateStats() {
        const totalElement = document.getElementById('totalPoints');
        const selectedElement = document.getElementById('selectedPoints');
        
        if (totalElement) {
            totalElement.textContent = this.dataManager.getEmbeddings().length;
        }
        if (selectedElement) {
            selectedElement.textContent = this.selectedIndices.size;
        }
    }
    
    populateLegend() {
        const legendPanel = document.getElementById('legendPanel');
        if (!legendPanel) return;
        
        const categories = this.dataManager.getCategories();
        const legendHtml = categories.slice(0, 10).map((cat, idx) => `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${this.categoryColors[idx % this.categoryColors.length]}"></div>
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
    
    getSelectedIndices() {
        return new Set(this.selectedIndices);
    }

    zoom(factor) {
        const plot = document.getElementById('plot');
        const xaxis = plot.layout.xaxis;
        const yaxis = plot.layout.yaxis;
        const xCenter = (xaxis.range[0] + xaxis.range[1]) / 2;
        const yCenter = (yaxis.range[0] + yaxis.range[1]) / 2;
        const xHalf = (xaxis.range[1] - xaxis.range[0]) * factor / 2;
        const yHalf = (yaxis.range[1] - yaxis.range[0]) * factor / 2;
        Plotly.relayout('plot', {
            'xaxis.range': [xCenter - xHalf, xCenter + xHalf],
            'yaxis.range': [yCenter - yHalf, yCenter + yHalf]
        });
    }

    zoomIn() {
        this.zoom(0.8);
    }

    zoomOut() {
        this.zoom(1.25);
    }

    resetZoom() {
        Plotly.relayout('plot', {
            'xaxis.range': this.defaultXRange,
            'yaxis.range': this.defaultYRange
        });
    }

    handleResize() {
        Plotly.Plots.resize('plot');
    }

    // Callback for when selection changes
    onSelectionChange = null;}