import type { AppSettings } from "@/types/embedding"

const DEFAULT_SETTINGS: AppSettings = {
  llm: {
    apiKey: '',
    model: 'gpt-3.5-turbo',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    maxTokens: 1000
  },
  displayFields: ['text', 'category', 'source', 'confidence', 'sentiment'],
  apiFields: ['text', 'category', 'source'],
  colorGradient: {
    reversed: false,
    startColor: '#2DD4BF',
    endColor: '#EF4444',
    preset: 'default'
  },
  performance: {
    useCanvasRenderer: true,
    pointThreshold: 200,
    enableViewportCulling: true
  }
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

export function getGradientColors(preset: string): { startColor: string; endColor: string } {
  const gradients = {
    default: { startColor: '#2DD4BF', endColor: '#EF4444' },
    viridis: { startColor: '#440154', endColor: '#FDE725' },
    plasma: { startColor: '#0D0887', endColor: '#F0F921' },
    cool: { startColor: '#00FFFF', endColor: '#0000FF' },
    warm: { startColor: '#FFFF00', endColor: '#FF0000' },
    custom: { startColor: '#2DD4BF', endColor: '#EF4444' }
  }
  return gradients[preset as keyof typeof gradients] || gradients.default
}

export function interpolateColor(startColor: string, endColor: string, factor: number): string {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  const start = hexToRgb(startColor)
  const end = hexToRgb(endColor)
  
  const r = Math.round(start.r + (end.r - start.r) * factor)
  const g = Math.round(start.g + (end.g - start.g) * factor)
  const b = Math.round(start.b + (end.b - start.b) * factor)
  
  return `rgb(${r}, ${g}, ${b})`
}