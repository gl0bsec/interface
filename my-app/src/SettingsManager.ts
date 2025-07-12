export interface Settings {
  apiKey: string;
  model: string;
  endpoint: string;
  maxTokens: number;
}

const STORAGE_KEY = 'embeddingSettings';

export class SettingsManager {
  private defaultSettings: Settings = {
    apiKey: '',
    model: 'gpt-3.5-turbo',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    maxTokens: 1000
  };

  private settings: Settings = { ...this.defaultSettings };

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const loaded = JSON.parse(raw);
        this.settings = { ...this.defaultSettings, ...loaded };
      }
    } catch (e) {
      console.warn('Settings load failed, using defaults', e);
      this.settings = { ...this.defaultSettings };
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Settings save failed', e);
    }
  }

  update(newSettings: Partial<Settings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.save();
  }

  get(): Settings { return { ...this.settings }; }
}

