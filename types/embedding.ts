// Enhanced embedding data interface
export interface EmbeddingPoint {
  id: string
  text: string
  x: number
  y: number
  category: string
  source: string
  confidence: number
  wordCount: number
  sentiment: number
  timestamp: string
  readability: number
}

// Color coding options interface
export interface ColorOption {
  value: string
  label: string
  type: "categorical" | "numerical"
}

// Search condition interface for boolean queries
export interface SearchCondition {
  field: string
  operator: string
  value: string | number
}

// Parsed search query interface
export interface ParsedQuery {
  conditions: SearchCondition[]
  operator: "AND" | "OR"
  isValid: boolean
  error?: string
}

// Legend item interface
export interface LegendItem {
  label: string
  color: string
}

// Tooltip position interface
export interface TooltipPosition {
  x: number
  y: number
}

// Dataset statistics interface
export interface DatasetStats {
  totalPoints: number
  filteredPoints: number
  categories: number
  sources: number
  selectedPoints: number
}

// Component props interfaces
export interface VisualizationProps {
  data: EmbeddingPoint[]
  selectedPoints: EmbeddingPoint[]
  hoveredPoint: EmbeddingPoint | null
  colorBy: string
  onPointClick: (point: EmbeddingPoint) => void
  onPointHover: (point: EmbeddingPoint | null, position?: TooltipPosition) => void
  getPointColor: (point: EmbeddingPoint) => string
}

export interface SidebarProps {
  width: number
  onResize: (width: number) => void
  children: React.ReactNode
}

// Settings interfaces
export interface LLMSettings {
  apiKey: string
  model: string
  endpoint: string
  maxTokens: number
}

export interface ColorGradientSettings {
  reversed: boolean
  startColor: string
  endColor: string
  preset: 'default' | 'viridis' | 'plasma' | 'cool' | 'warm' | 'custom'
}

export interface AppSettings {
  llm: LLMSettings
  displayFields: string[]
  apiFields: string[]
  colorGradient: ColorGradientSettings
  performance: {
    useCanvasRenderer: boolean
    pointThreshold: number
    enableViewportCulling: boolean
  }
}

// CSV Import interfaces
export interface CSVData {
  headers: string[]
  rows: string[][]
}

export interface ImportedDataPoint {
  id: string
  text: string
  x: number
  y: number
  [key: string]: any
}