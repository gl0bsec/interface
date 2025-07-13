import type { AppSettings } from "@/types/embedding"

const DEFAULT_SETTINGS: AppSettings = {
  llm: {
    apiKey: '',
    model: 'gpt-3.5-turbo',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    maxTokens: 1000
  },
  displayFields: ['text', 'category', 'source', 'confidence', 'sentiment'],
  apiFields: ['text', 'category', 'source']
}

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  
  try {
    const stored = localStorage.getItem('embeddings-explorer-settings')
    if (!stored) return DEFAULT_SETTINGS
    
    const parsed = JSON.parse(stored)
    return { ...DEFAULT_SETTINGS, ...parsed }
  } catch (error) {
    console.error('Failed to load settings:', error)
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('embeddings-explorer-settings', JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

export function getModelPrice(model: string): number {
  const prices: Record<string, number> = {
    'gpt-3.5-turbo': 0.002,
    'gpt-4': 0.03,
    'gpt-4-turbo-preview': 0.01,
    'gpt-4-turbo': 0.01,
    'gpt-4o': 0.005,
    'gpt-4o-mini': 0.0015,
    'claude-3-haiku': 0.00025,
    'claude-3-sonnet': 0.003,
    'claude-3-5-sonnet': 0.003,
    'claude-3-opus': 0.015
  }
  
  return prices[model] || 0.002
}

export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4)
}

export function estimateCost(totalTokens: number, model: string): number {
  const pricePerToken = getModelPrice(model) / 1000
  return totalTokens * pricePerToken
}