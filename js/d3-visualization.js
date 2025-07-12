export class D3VisualizationManager {
    constructor(dataManager) {
        console.log('D3VisualizationManager initialized with axis masks - v2.1');
        this.dataManager = dataManager;
        this.selectedIndices = new Set();
        // default to lasso selection to match UI
        this.selectionMode = 'lasso';
        this.zoom = d3.zoom();
        this.brush = null;
        this.polygonPoints = [];
        this.isPolygonSelecting = false;
        this.currentTransform = d3.zoomIdentity;
        
        this.categoryColors = [
            '#4a9eff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731',
            '#5f27cd', '#00d2d3', '#ff9ff3', '#54a0ff', '#48dbfb'
        ];

        this.categoryFilters = {};

        const fields = this.dataManager.getAvailableFields();
        this.colorField = fields.includes('category') ? 'category' : fields[0];
        this.colorFieldType = this.dataManager.getFieldType(this.colorField);
        
        this.margins = { top: 40, right: 40, bottom: 60, left: 60 };

        this.initializeVisualization();
        this.setupEventHandlers();
    }
    
    initializeVisualization() {
        const container = d3.select('#visualization');
        const containerNode = container.node();
        const rect = containerNode.getBoundingClientRect();
        
        this.width = rect.width;
        this.height = rect.height;
        
        container
            .attr('width', this.width)
            .attr('height', this.height);
            
        this.svg = container;
        
        const embeddings = this.dataManager.getEmbeddings();
        
        this.xScale = d3.scaleLinear()
            .domain(d3.extent(embeddings, d => d.x))
            .range([60, this.width - 40]);
            
        this.yScale = d3.scaleLinear()
            .domain(d3.extent(embeddings, d => d.y))
            .range([this.height - 60, 40]);
        
        this.updateColorScale();
        
        this.createBackground();
        this.createPoints();
        this.createAxisMasks();
        this.createAxes();
        this.setupZoom();
        this.createTooltip();
        
        this.updateStats();
    }
    
    createBackground() {
        this.svg.append('rect')
            .attr('class', 'plot-background')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('fill', '#0a0a0a');
    }
    
    createAxes() {
        console.log('Creating axes with numbered ticks');
        // Create axes with proper tick formatting and grid lines
        this.xAxis = d3.axisBottom(this.xScale)
            .ticks(8)
            .tickSize(-this.height + 100)
            .tickFormat(d3.format('.1f'));
            
        this.yAxis = d3.axisLeft(this.yScale)
            .ticks(6)
            .tickSize(-this.width + 100)
            .tickFormat(d3.format('.1f'));
        
        // X-axis
        this.xAxisGroup = this.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${this.height - 60})`)
            .call(this.xAxis);
            
        // Y-axis
        this.yAxisGroup = this.svg.append('g')
            .attr('class', 'y-axis')
            .attr('transform', 'translate(60,0)')
            .call(this.yAxis);
            
        // Style the axes for better visibility
        this.xAxisGroup.selectAll('.tick line')
            .style('stroke', '#2a2a2a')
            .style('stroke-width', 1);
            
        this.yAxisGroup.selectAll('.tick line')
            .style('stroke', '#2a2a2a')
            .style('stroke-width', 1);
            
        this.xAxisGroup.selectAll('.tick text')
            .style('fill', '#aaa')
            .style('font-size', '12px');
            
        this.yAxisGroup.selectAll('.tick text')
            .style('fill', '#aaa')
            .style('font-size', '12px');
            
        // Style domain lines
        this.xAxisGroup.select('.domain')
            .style('stroke', '#4a4a4a')
            .style('stroke-width', 2);
            
        this.yAxisGroup.select('.domain')
            .style('stroke', '#4a4a4a')
            .style('stroke-width', 2);
    }
    
    createPoints() {
        const embeddings = this.dataManager.getEmbeddings();
        console.log('Creating points without clipping');

        this.pointsGroup = this.svg.append('g')
            .attr('class', 'points-group');
            
        this.points = this.pointsGroup.selectAll('.point')
            .data(embeddings)
            .enter()
            .append('circle')
            .attr('class', 'point')
            .attr('cx', d => this.xScale(d.x))
            .attr('cy', d => this.yScale(d.y))
            .attr('r', 6)
            .attr('fill', d => this.colorScale(d[this.colorField]))
            .attr('stroke', '#000')
            .attr('stroke-width', 1)
            .attr('opacity', 0.8)
            .style('cursor', 'pointer')
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mouseout', () => this.hideTooltip())
            .on('click', (event, d) => this.togglePoint(d.index, event));
    }

    createAxisMasks() {
        this.axisMaskGroup = this.svg.append('g')
            .attr('class', 'axis-masks');

        const m = this.margins;

        // Left mask
        this.axisMaskGroup.append('rect')
            .attr('class', 'mask-left')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', m.left)
            .attr('height', this.height)
            .attr('fill', '#0a0a0a');

        // Right mask
        this.axisMaskGroup.append('rect')
            .attr('class', 'mask-right')
            .attr('x', this.width - m.right)
            .attr('y', 0)
            .attr('width', m.right)
            .attr('height', this.height)
            .attr('fill', '#0a0a0a');

        // Top mask
        this.axisMaskGroup.append('rect')
            .attr('class', 'mask-top')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.width)
            .attr('height', m.top)
            .attr('fill', '#0a0a0a');

        // Bottom mask
        this.axisMaskGroup.append('rect')
            .attr('class', 'mask-bottom')
            .attr('x', 0)
            .attr('y', this.height - m.bottom)
            .attr('width', this.width)
            .attr('height', m.bottom)
            .attr('fill', '#0a0a0a');
    }
    
    createTooltip() {
        this.tooltip = d3.select('#tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('pointer-events', 'none');
    }
    
    setupZoom() {
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 10])
            .on('zoom', (event) => {
                this.currentTransform = event.transform;
                
                this.pointsGroup.attr('transform', this.currentTransform);
                
                this.xAxisGroup.call(this.xAxis.scale(this.currentTransform.rescaleX(this.xScale)));
                this.yAxisGroup.call(this.yAxis.scale(this.currentTransform.rescaleY(this.yScale)));
            });
            
        this.svg.call(this.zoom);
    }
    
    setupEventHandlers() {
        // These elements existed in the early prototype. Guard against null to
        // avoid errors if the IDs are missing in the current UI.
        const selectBtn = document.getElementById('selectBtn');
        const polygonBtn = document.getElementById('polygonBtn');
        const clearBtn = document.getElementById('clearBtn');
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const resetBtn = document.getElementById('resetBtn');

        selectBtn?.addEventListener('click', () => this.setSelectionMode('box'));
        polygonBtn?.addEventListener('click', () => this.setSelectionMode('lasso'));
        clearBtn?.addEventListener('click', () => this.clearSelection());
        zoomInBtn?.addEventListener('click', () => this.zoomIn());
        zoomOutBtn?.addEventListener('click', () => this.zoomOut());
        resetBtn?.addEventListener('click', () => this.resetZoom());

        window.addEventListener('resize', () => this.handleResize());
    }
    
    // Keyboard shortcuts are handled by App.js to avoid conflicts
    
    setSelectionMode(mode) {
        // Allow legacy values from the prototype
        if (mode === 'polygon') mode = 'lasso';
        if (mode === 'select') mode = 'box';

        this.selectionMode = mode;

        // Update active state of toolbar buttons using data-mode attributes
        document.querySelectorAll('.control-group .tool-btn').forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        this.clearSelectionTools();
        this.setupSelectionTool();
    }
    
    setupSelectionTool() {
        if (this.selectionMode === 'box') {
            this.setupBrushSelection();
        } else if (this.selectionMode === 'lasso') {
            this.setupPolygonSelection();
        }
    }
    
    setupBrushSelection() {
        const brushGroup = this.svg.append('g')
            .attr('class', 'brush');
            
        this.brush = d3.brush()
            .extent([[60, 40], [this.width - 40, this.height - 60]])
            .on('start', () => {
                // Prevent zoom events during brushing
                this.disableZoom();
            })
            .on('brush', (event) => {
                // Prevent any movement during brushing
                event.sourceEvent?.stopPropagation();
            })
            .on('end', (event) => {
                if (!event.selection) {
                    // Re-enable zoom when brush is cleared
                    this.enableZoom();
                    this.resetCursor();
                    return;
                }
                
                const [[x0, y0], [x1, y1]] = event.selection;
                const selected = [];
                
                // Get current transform to account for zoom/pan state
                const transform = this.currentTransform;
                
                this.points.each((d, i) => {
                    // Get the transformed position of each point
                    const transformedX = transform.applyX(this.xScale(d.x));
                    const transformedY = transform.applyY(this.yScale(d.y));
                    
                    // Check if point is within brush selection
                    if (transformedX >= x0 && transformedX <= x1 && 
                        transformedY >= y0 && transformedY <= y1) {
                        selected.push(i);
                    }
                });
                
                this.updateSelection(selected);
                
                // Clear the brush and properly restore zoom/cursor
                brushGroup.call(this.brush.move, null);
                this.enableZoom();
                this.resetCursor();
            });
            
        brushGroup.call(this.brush);
    }
    
    setupPolygonSelection() {
        // Disable zoom during polygon selection
        this.disableZoom();
        
        // Show instruction overlay
        this.showPolygonInstructions();
        
        // Create polygon visualization elements
        const polygonGroup = this.svg.append('g').attr('class', 'polygon-selection');
        const polygonPath = polygonGroup.append('path')
            .attr('class', 'polygon-path')
            .style('fill', 'rgba(74, 158, 255, 0.1)')
            .style('stroke', '#4a9eff')
            .style('stroke-width', 2)
            .style('stroke-dasharray', '5,5');
            
        const vertexGroup = polygonGroup.append('g').attr('class', 'polygon-vertices');
        
        // Handle clicks to add polygon vertices
        this.svg.on('click', (event) => {
            // Prevent event bubbling
            event.stopPropagation();
            
            // Skip if clicking on a point or existing vertex
            if (event.target.classList.contains('point') || 
                event.target.classList.contains('polygon-vertex')) {
                return;
            }
            
            const [x, y] = d3.pointer(event, this.svg.node());
            
            // Check if clicking close to first vertex to complete polygon
            if (this.polygonPoints.length >= 3) {
                const [firstX, firstY] = this.polygonPoints[0];
                const distance = Math.sqrt((x - firstX) ** 2 + (y - firstY) ** 2);
                if (distance < 15) {
                    this.completePolygonSelection();
                    return;
                }
            }
            
            this.polygonPoints.push([x, y]);
            this.isPolygonSelecting = true;
            
            // Add vertex marker
            const vertex = vertexGroup.append('circle')
                .attr('class', 'polygon-vertex')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 4)
                .style('fill', '#4a9eff')
                .style('stroke', '#fff')
                .style('stroke-width', 2)
                .style('cursor', 'pointer');
            
            // Special styling for first vertex
            if (this.polygonPoints.length === 1) {
                vertex.style('fill', '#ff6b6b')
                      .attr('r', 5);
            }
            
            // Update polygon path
            if (this.polygonPoints.length > 1) {
                const pathData = d3.line()(this.polygonPoints);
                polygonPath.attr('d', pathData);
            }
            
            // Complete on first vertex click if we have enough points
            if (this.polygonPoints.length >= 3) {
                vertex.on('click', (e) => {
                    e.stopPropagation();
                    this.completePolygonSelection();
                });
            }
        });
        
        // Handle double-click to complete polygon
        this.svg.on('dblclick', (event) => {
            event.preventDefault();
            if (this.polygonPoints.length >= 3) {
                this.completePolygonSelection();
            }
        });
    }
    
    showPolygonInstructions() {
        // Remove any existing instructions
        d3.select('.polygon-instructions').remove();
        
        const container = d3.select('.plot-container');
        const instructions = container.append('div')
            .attr('class', 'polygon-instructions')
            .attr('role', 'status')
            .attr('aria-live', 'polite')
            .attr('tabindex', '-1')
            .html(`
                <div><strong>Lasso Selection Mode</strong></div>
                <div>Click to add vertices • Click first vertex or double-click to complete</div>
            `);

        instructions.node().focus();
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            instructions.remove();
        }, 4000);
    }
    
    completePolygonSelection() {
        if (this.polygonPoints.length < 3) return;
        
        const selected = [];
        const transform = this.currentTransform;
        
        this.points.each((d, i) => {
            // Get the transformed position of each point
            const transformedX = transform.applyX(this.xScale(d.x));
            const transformedY = transform.applyY(this.yScale(d.y));
            
            if (this.pointInPolygon([transformedX, transformedY], this.polygonPoints)) {
                selected.push(i);
            }
        });
        
        this.updateSelection(selected);
        
        // Clear polygon selection and reset
        this.polygonPoints = [];
        this.isPolygonSelecting = false;
        this.svg.selectAll('.polygon-selection').remove();
        d3.select('.polygon-instructions').remove();
        
        // Re-enable zoom and reset cursor
        this.enableZoom();
        this.resetCursor();
    }
    
    pointInPolygon(point, polygon) {
        const [x, y] = point;
        let inside = false;
        
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const [xi, yi] = polygon[i];
            const [xj, yj] = polygon[j];
            
            if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }
        
        return inside;
    }
    
    clearSelectionTools() {
        this.svg.selectAll('.brush').remove();
        this.svg.selectAll('.polygon-selection').remove();
        this.svg.on('mousedown', null);
        this.svg.on('mousemove', null);
        this.svg.on('mouseup', null);
        this.svg.on('click', null);
        this.svg.on('dblclick', null);
        this.svg.on('.zoom', null); // Clear any existing zoom handlers
        
        // Reset polygon state
        this.polygonPoints = [];
        this.isPolygonSelecting = false;
        
        // Re-enable zoom properly
        this.enableZoom();
        
        // Reset cursor state
        this.resetCursor();
    }
    
    togglePoint(index, event) {
        event.stopPropagation();
        
        if (this.selectedIndices.has(index)) {
            this.selectedIndices.delete(index);
        } else {
            this.selectedIndices.add(index);
        }
        
        this.updateVisualization();
        this.onSelectionChange?.(this.selectedIndices);
    }
    
    updateSelection(indices) {
        this.selectedIndices = new Set(indices);
        this.updateVisualization();
        this.onSelectionChange?.(this.selectedIndices);
    }
    
    clearSelection() {
        this.selectedIndices.clear();
        this.updateVisualization();
        this.onSelectionChange?.(this.selectedIndices);
    }
    
    updateVisualization() {
        this.points
            .attr('r', (_, i) => this.selectedIndices.has(i) ? 8 : 6)
            .attr('stroke-width', (_, i) => this.selectedIndices.has(i) ? 3 : 1)
            .attr('stroke', (_, i) => this.selectedIndices.has(i) ? '#ff6b6b' : '#000')
            .attr('opacity', (_, i) => this.selectedIndices.has(i) ? 1 : 0.7);
        this.updatePointColors();
        
        this.updateStats();
    }
    
    // Helper methods for zoom and cursor management
    enableZoom() {
        this.svg.call(this.zoom);
    }
    
    disableZoom() {
        this.svg.on('.zoom', null);
    }
    
    resetCursor() {
        // Reset cursor on the main plot area
        this.svg.select('.plot-background').style('cursor', 'default');
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
    
    showTooltip(event, d) {
        const tooltip = this.tooltip;
        
        tooltip.transition()
            .duration(200)
            .style('opacity', 1);
            
        tooltip.html(`
            <div class="tooltip-content">
                <strong>${d.content}</strong>
                <div class="tooltip-meta">
                    <span>Category: ${d.category}</span>
                    <span>Date: ${d.date}</span>
                    <span>Author: ${d.author}</span>
                    <span>Sentiment: ${d.sentiment}</span>
                </div>
            </div>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    }
    
    hideTooltip() {
        this.tooltip.transition()
            .duration(200)
            .style('opacity', 0);
    }
    
    zoomIn() {
        this.svg.transition().call(this.zoom.scaleBy, 1.5);
    }
    
    zoomOut() {
        this.svg.transition().call(this.zoom.scaleBy, 1 / 1.5);
    }
    
    resetZoom() {
        this.svg.transition().call(this.zoom.transform, d3.zoomIdentity);
    }
    
    handleResize() {
        const container = d3.select('#visualization');
        const containerNode = container.node();
        const rect = containerNode.getBoundingClientRect();
        
        this.width = rect.width;
        this.height = rect.height;
        
        container
            .attr('width', this.width)
            .attr('height', this.height);
            
        // Update scales
        this.xScale.range([60, this.width - 40]);
        this.yScale.range([this.height - 60, 40]);
        
        // Update axes
        this.xAxis.tickSize(-this.height + 100);
        this.yAxis.tickSize(-this.width + 100);
        
        this.xAxisGroup
            .attr('transform', `translate(0,${this.height - 60})`)
            .call(this.xAxis);
            
        this.yAxisGroup.call(this.yAxis);
        
        // Update points
        this.points
            .attr('cx', d => this.xScale(d.x))
            .attr('cy', d => this.yScale(d.y));
            
        // Update background
        this.svg.select('.plot-background')
            .attr('width', this.width)
            .attr('height', this.height);

        this.updateAxisMasks();
    }

    updateAxisMasks() {
        if (!this.axisMaskGroup) return;

        const m = this.margins;

        this.axisMaskGroup.select('.mask-left')
            .attr('width', m.left)
            .attr('height', this.height);

        this.axisMaskGroup.select('.mask-right')
            .attr('x', this.width - m.right)
            .attr('width', m.right)
            .attr('height', this.height);

        this.axisMaskGroup.select('.mask-top')
            .attr('width', this.width)
            .attr('height', m.top);

        this.axisMaskGroup.select('.mask-bottom')
            .attr('y', this.height - m.bottom)
            .attr('width', this.width)
            .attr('height', m.bottom);
    }

    updateColorScale() {
        this.colorFieldType = this.dataManager.getFieldType(this.colorField);
        if (this.colorFieldType === 'numeric') {
            const range = this.dataManager.getNumericRange(this.colorField);
            this.colorScale = d3.scaleSequential(d3.interpolateViridis)
                .domain([range.min, range.max]);
        } else {
            const categories = this.dataManager.getUniqueValues(this.colorField);
            this.colorScale = d3.scaleOrdinal()
                .domain(categories)
                .range(this.categoryColors);
        }
    }

    updatePointColors() {
        if (!this.points) return;
        this.points.attr('fill', d => this.colorScale(d[this.colorField]));
    }

    updateColorField(field) {
        this.colorField = field;
        this.updateColorScale();
        this.updatePointColors();
        this.populateLegend();
    }

    getColorField() {
        return this.colorField;
    }
    
    populateLegend() {
        const legendPanel = document.getElementById('legendPanel');
        if (!legendPanel) return;

        legendPanel.innerHTML = '';

        if (this.colorFieldType === 'numeric') {
            const range = this.dataManager.getNumericRange(this.colorField);
            const startColor = this.colorScale(range.min);
            const endColor = this.colorScale(range.max);
            legendPanel.innerHTML = `
                <div class="legend-gradient">
                    <div class="gradient-bar" style="background: linear-gradient(to right, ${startColor}, ${endColor});"></div>
                    <div class="gradient-labels"><span>${range.min.toFixed(2)}</span><span>${range.max.toFixed(2)}</span></div>
                </div>`;
        } else {
            const categories = this.dataManager.getUniqueValues(this.colorField);
            this.categoryFilters = {};
            const legendHtml = categories.map((cat, idx) => {
                this.categoryFilters[cat] = true;
                return `
                    <label class="legend-item">
                        <input type="checkbox" class="category-filter" data-category="${cat}" checked>
                        <span class="legend-color" style="background-color: ${this.categoryColors[idx % this.categoryColors.length]}"></span>
                        <span>${cat}</span>
                    </label>`;
            }).join('');
            legendPanel.innerHTML = legendHtml;

            legendPanel.querySelectorAll('.category-filter').forEach(cb => {
                cb.addEventListener('change', () => {
                    const cat = cb.dataset.category;
                    this.categoryFilters[cat] = cb.checked;
                    this.updateCategoryVisibility();
                });
            });

            this.updateCategoryVisibility();
        }
    }

    updateCategoryVisibility() {
        if (!this.points || this.colorFieldType !== 'categorical') return;
        this.points.style('display', d => this.categoryFilters[d[this.colorField]] ? null : 'none');

        const toRemove = [];
        this.selectedIndices.forEach(idx => {
            const item = this.dataManager.getEmbeddingByIndex(idx);
            if (item && !this.categoryFilters[item[this.colorField]]) {
                toRemove.push(idx);
            }
        });
        toRemove.forEach(i => this.selectedIndices.delete(i));
        this.updateVisualization();
        this.onSelectionChange?.(this.selectedIndices);
    }
    
    getSelectedIndices() {
        return new Set(this.selectedIndices);
    }

    reloadData() {
        this.svg.selectAll('*').remove();
        this.selectedIndices.clear();
        this.currentTransform = d3.zoomIdentity;
        const fields = this.dataManager.getAvailableFields();
        this.colorField = fields.includes('category') ? 'category' : fields[0];
        this.initializeVisualization();
        this.populateLegend();
        this.clearSelectionTools();
        this.setupSelectionTool();
    }

    onSelectionChange = null;
}
