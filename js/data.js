// Data management module
export class DataManager {
    constructor() {
        this.demoMode = true;
        this.sampleTexts = [
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
        
        this.embeddings = this.generateEmbeddings();
        this.availableFields = this.extractAvailableFields();
        this.categories = this.getUniqueCategories();
    }

    async loadCSVFile(file) {
        const text = await file.text();
        const rows = d3.csvParse(text.trim());

        if (!rows.columns.includes('x') || !rows.columns.includes('y')) {
            throw new Error('CSV must contain x and y columns');
        }

        const hasCategory = rows.columns.includes('category');
        this.embeddings = rows.map((row, i) => {
            const x = parseFloat(row.x);
            const y = parseFloat(row.y);
            if (isNaN(x) || isNaN(y)) {
                throw new Error(`Invalid numeric values in row ${i + 2}: x="${row.x}", y="${row.y}"`);
            }
            return {
                ...row,
                x,
                y,
                category: hasCategory ? row.category : 'Default',
                index: i
            };
        });

        this.availableFields = this.extractAvailableFields();
        this.categories = this.getUniqueCategories();
        this.demoMode = false;
    }

    resetToSampleData() {
        this.embeddings = this.generateEmbeddings();
        this.availableFields = this.extractAvailableFields();
        this.categories = this.getUniqueCategories();
        this.demoMode = true;
    }
    
    generateEmbeddings() {
        return this.sampleTexts.map((data, i) => ({
            x: Math.random() * 10 - 5 + (i % 4) * 2,
            y: Math.random() * 10 - 5 + Math.floor(i / 4) * 1.5,
            ...data,
            index: i
        }));
    }
    
    extractAvailableFields() {
        if (!this.embeddings || this.embeddings.length === 0) return [];
        return Object.keys(this.embeddings[0]).filter(key =>
            !['x', 'y', 'index'].includes(key)
        );
    }
    
    getUniqueCategories() {
        if (!this.embeddings || this.embeddings.length === 0) return [];
        return [...new Set(this.embeddings.map(e => e.category || 'Default'))];
    }
    
    getEmbeddings() {
        return this.embeddings;
    }
    
    getAvailableFields() {
        return this.availableFields;
    }
    
    getCategories() {
        return this.categories;
    }
    
    getEmbeddingByIndex(index) {
        if (index < 0 || index >= this.embeddings.length) {
            console.warn(`Invalid index ${index}`);
            return null;
        }
        return this.embeddings[index];
    }
    
    getSelectedItems(selectedIndices, fields = null) {
        return Array.from(selectedIndices)
            .map(i => this.getEmbeddingByIndex(i))
            .filter(item => item !== null)
            .map(item => {
                if (!fields) return item;
                
                const filteredItem = {};
                fields.forEach(field => {
                    if (item[field] !== undefined) {
                        filteredItem[field] = item[field];
                    }
                });
                return filteredItem;
            });
    }

    getFieldType(field) {
        const values = this.embeddings.map(e => e[field]).filter(v => v !== undefined);
        const numeric = values.every(v => !isNaN(parseFloat(v)) && v !== '');
        return numeric ? 'numeric' : 'categorical';
    }

    getUniqueValues(field) {
        return [...new Set(this.embeddings.map(e => e[field]))];
    }

    getNumericRange(field) {
        const nums = this.embeddings
            .map(e => parseFloat(e[field]))
            .filter(v => !isNaN(v));
        return { min: Math.min(...nums), max: Math.max(...nums) };
    }
}
