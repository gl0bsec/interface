export interface DataItem {
  x: number;
  y: number;
  [key: string]: any;
}

export class DataManager {
  private sampleTexts = [
    { content: 'Climate change impacts on coastal regions', category: 'Environment', date: '2025-01-15', author: 'Smith J.', sentiment: 'Negative' },
    { content: 'New AI breakthrough in language processing', category: 'Technology', date: '2025-01-14', author: 'Chen L.', sentiment: 'Positive' },
    { content: 'Global economic uncertainty amid inflation', category: 'Economy', date: '2025-01-13', author: 'Johnson M.', sentiment: 'Negative' },
    { content: 'Renewable energy adoption accelerates', category: 'Environment', date: '2025-01-12', author: 'Williams A.', sentiment: 'Positive' },
    { content: 'Tech giants face regulatory scrutiny', category: 'Technology', date: '2025-01-11', author: 'Davis R.', sentiment: 'Neutral' },
    { content: 'Healthcare innovation in remote medicine', category: 'Healthcare', date: '2025-01-10', author: 'Brown K.', sentiment: 'Positive' },
    { content: 'Urban planning for sustainable cities', category: 'Environment', date: '2025-01-09', author: 'Garcia M.', sentiment: 'Positive' },
    { content: 'Cryptocurrency market volatility continues', category: 'Finance', date: '2025-01-08', author: 'Miller T.', sentiment: 'Negative' },
    { content: 'Education technology transforms learning', category: 'Education', date: '2025-01-07', author: 'Wilson E.', sentiment: 'Positive' },
    { content: 'Space exploration reaches new milestone', category: 'Science', date: '2025-01-06', author: 'Anderson P.', sentiment: 'Positive' },
    { content: 'Biodiversity conservation efforts expand', category: 'Environment', date: '2025-01-05', author: 'Taylor S.', sentiment: 'Neutral' },
    { content: 'Quantum computing advances rapidly', category: 'Technology', date: '2025-01-04', author: 'Lee H.', sentiment: 'Positive' },
    { content: 'Social media influence on democracy', category: 'Politics', date: '2025-01-03', author: 'Martin D.', sentiment: 'Negative' },
    { content: 'Food security challenges worldwide', category: 'Agriculture', date: '2025-01-02', author: 'White L.', sentiment: 'Negative' },
    { content: 'Artificial intelligence ethics debate', category: 'Technology', date: '2025-01-01', author: 'Harris J.', sentiment: 'Neutral' },
    { content: 'Ocean pollution threatens marine life', category: 'Environment', date: '2024-12-31', author: 'Clark B.', sentiment: 'Negative' },
    { content: 'Remote work reshapes office culture', category: 'Business', date: '2024-12-30', author: 'Lewis R.', sentiment: 'Neutral' },
    { content: 'Electric vehicle market growth', category: 'Technology', date: '2024-12-29', author: 'Walker M.', sentiment: 'Positive' },
    { content: 'Cybersecurity threats evolve', category: 'Technology', date: '2024-12-28', author: 'Hall K.', sentiment: 'Negative' },
    { content: 'Mental health awareness increases', category: 'Healthcare', date: '2024-12-27', author: 'Young A.', sentiment: 'Positive' }
  ];

  private embeddings: DataItem[] = [];
  private availableFields: string[] = [];
  private categories: string[] = [];

  constructor() {
    this.embeddings = this.generateEmbeddings();
    this.availableFields = this.extractAvailableFields();
    this.categories = this.getUniqueCategories();
  }

  async loadCSVFile(file: File) {
    const text = await file.text();
    const rows = text.split(/\r?\n/).filter(Boolean).map(r => r.split(','));
    const header = rows.shift();
    if (!header) throw new Error('Empty CSV');
    const xIdx = header.indexOf('x');
    const yIdx = header.indexOf('y');
    if (xIdx === -1 || yIdx === -1) {
      throw new Error('CSV must contain x and y columns');
    }
    const categoryIdx = header.indexOf('category');
    this.embeddings = rows.map((cols, i) => {
      const x = parseFloat(cols[xIdx]);
      const y = parseFloat(cols[yIdx]);
      if (Number.isNaN(x) || Number.isNaN(y)) {
        throw new Error(`Invalid numeric value on row ${i + 2}`);
      }
      const item: DataItem = { x, y, index: i } as DataItem;
      header.forEach((key, j) => {
        if (j !== xIdx && j !== yIdx) {
          (item as any)[key] = cols[j];
        }
      });
      if (categoryIdx === -1) item.category = 'Default';
      return item;
    });
    this.availableFields = this.extractAvailableFields();
    this.categories = this.getUniqueCategories();
  }

  resetToSampleData() {
    this.embeddings = this.generateEmbeddings();
    this.availableFields = this.extractAvailableFields();
    this.categories = this.getUniqueCategories();
  }

  private generateEmbeddings(): DataItem[] {
    return this.sampleTexts.map((data, i) => ({
      x: Math.random() * 10 - 5 + (i % 4) * 2,
      y: Math.random() * 10 - 5 + Math.floor(i / 4) * 1.5,
      ...data,
      index: i
    }));
  }

  private extractAvailableFields() {
    if (!this.embeddings.length) return [] as string[];
    return Object.keys(this.embeddings[0]).filter(k => !['x', 'y', 'index'].includes(k));
  }

  private getUniqueCategories() {
    if (!this.embeddings.length) return [] as string[];
    return Array.from(new Set(this.embeddings.map(e => e.category || 'Default')));
  }

  getEmbeddings() { return this.embeddings; }
  getCategories() { return this.categories; }
  getAvailableFields() { return this.availableFields; }
}

