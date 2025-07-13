"use client"

import { useState, useMemo, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  X,
  Send,
  Download,
  Upload,
  Palette,
  HelpCircle,
  Filter,
  Settings,
  GripVertical,
  Eye,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  MousePointer,
  Pentagon,
  MessageSquare,
  Database,
} from "lucide-react"

import type { 
  EmbeddingPoint, 
  ColorOption, 
  SearchCondition, 
  ParsedQuery,
  TooltipPosition,
  AppSettings,
  CSVData
} from "@/types/embedding"
import { loadSettings, saveSettings, estimateTokens, estimateCost } from "@/lib/settings"
import { parseCSV, convertCSVToEmbeddingsOptimized, parseCSVStreaming, detectNumericColumns, downloadCSV } from "@/lib/csv-parser"
import { clusterPoints, getClusterSize, getClusterColor } from "@/lib/point-clustering"
import { VirtualizedSelectedPoints } from "@/components/virtualized-selected-points"
import { sendToLLM, type LLMResponse } from "@/lib/llm-api"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Enhanced embedding data
const sampleData: EmbeddingPoint[] = [
  {
    id: "1",
    text: "Machine learning algorithms can identify patterns in large datasets",
    x: 120,
    y: 180,
    category: "AI/ML",
    source: "research_paper",
    confidence: 0.92,
    wordCount: 10,
    sentiment: 0.1,
    timestamp: "2024-01-15",
    readability: 7.2,
  },
  {
    id: "2",
    text: "Deep neural networks require significant computational resources",
    x: 140,
    y: 160,
    category: "AI/ML",
    source: "research_paper",
    confidence: 0.88,
    wordCount: 8,
    sentiment: -0.2,
    timestamp: "2024-01-14",
    readability: 8.1,
  },
  {
    id: "3",
    text: "Natural language processing enables computers to understand human language",
    x: 110,
    y: 200,
    category: "AI/ML",
    source: "textbook",
    confidence: 0.95,
    wordCount: 10,
    sentiment: 0.3,
    timestamp: "2024-01-16",
    readability: 6.8,
  },
  {
    id: "4",
    text: "The recipe calls for two cups of flour and one egg",
    x: 300,
    y: 120,
    category: "Cooking",
    source: "recipe_book",
    confidence: 0.78,
    wordCount: 10,
    sentiment: 0.0,
    timestamp: "2024-01-12",
    readability: 4.2,
  },
  {
    id: "5",
    text: "Baking bread requires patience and proper temperature control",
    x: 320,
    y: 140,
    category: "Cooking",
    source: "blog_post",
    confidence: 0.85,
    wordCount: 9,
    sentiment: 0.1,
    timestamp: "2024-01-13",
    readability: 5.5,
  },
  {
    id: "6",
    text: "Fresh herbs enhance the flavor of any dish",
    x: 280,
    y: 100,
    category: "Cooking",
    source: "magazine",
    confidence: 0.72,
    wordCount: 8,
    sentiment: 0.6,
    timestamp: "2024-01-11",
    readability: 3.8,
  },
  {
    id: "7",
    text: "Climate change affects global weather patterns significantly",
    x: 200,
    y: 300,
    category: "Environment",
    source: "news_article",
    confidence: 0.91,
    wordCount: 8,
    sentiment: -0.4,
    timestamp: "2024-01-17",
    readability: 6.9,
  },
  {
    id: "8",
    text: "Renewable energy sources reduce carbon emissions",
    x: 180,
    y: 320,
    category: "Environment",
    source: "report",
    confidence: 0.89,
    wordCount: 7,
    sentiment: 0.4,
    timestamp: "2024-01-18",
    readability: 7.5,
  },
  {
    id: "9",
    text: "Deforestation contributes to biodiversity loss",
    x: 220,
    y: 280,
    category: "Environment",
    source: "scientific_journal",
    confidence: 0.94,
    wordCount: 6,
    sentiment: -0.6,
    timestamp: "2024-01-19",
    readability: 8.3,
  },
  {
    id: "10",
    text: "JavaScript frameworks simplify web development",
    x: 400,
    y: 200,
    category: "Technology",
    source: "tutorial",
    confidence: 0.83,
    wordCount: 6,
    sentiment: 0.5,
    timestamp: "2024-01-10",
    readability: 5.1,
  },
  {
    id: "11",
    text: "React components promote code reusability",
    x: 420,
    y: 180,
    category: "Technology",
    source: "documentation",
    confidence: 0.87,
    wordCount: 6,
    sentiment: 0.3,
    timestamp: "2024-01-09",
    readability: 6.2,
  },
  {
    id: "12",
    text: "Database optimization improves application performance",
    x: 380,
    y: 220,
    category: "Technology",
    source: "blog_post",
    confidence: 0.81,
    wordCount: 6,
    sentiment: 0.2,
    timestamp: "2024-01-08",
    readability: 7.0,
  },
  {
    id: "13",
    text: "Exercise improves cardiovascular health and mental wellbeing",
    x: 100,
    y: 400,
    category: "Health",
    source: "medical_journal",
    confidence: 0.96,
    wordCount: 8,
    sentiment: 0.8,
    timestamp: "2024-01-20",
    readability: 6.5,
  },
  {
    id: "14",
    text: "A balanced diet includes fruits, vegetables, and whole grains",
    x: 120,
    y: 380,
    category: "Health",
    source: "nutrition_guide",
    confidence: 0.9,
    wordCount: 10,
    sentiment: 0.4,
    timestamp: "2024-01-21",
    readability: 4.8,
  },
  {
    id: "15",
    text: "Regular sleep patterns are essential for cognitive function",
    x: 80,
    y: 420,
    category: "Health",
    source: "research_study",
    confidence: 0.93,
    wordCount: 9,
    sentiment: 0.2,
    timestamp: "2024-01-22",
    readability: 7.8,
  },
]

// Base color coding options
const baseColorOptions: ColorOption[] = [
  { value: "category", label: "Category", type: "categorical" },
  { value: "source", label: "Source", type: "categorical" },
  { value: "confidence", label: "Confidence", type: "numerical" },
  { value: "wordCount", label: "Word Count", type: "numerical" },
  { value: "sentiment", label: "Sentiment", type: "numerical" },
  { value: "readability", label: "Readability", type: "numerical" },
]

// Boolean search parser
const parseSearchQuery = (query: string): ParsedQuery => {
  if (!query.trim()) {
    return { conditions: [], operator: "AND", isValid: true }
  }

  // Simple text search fallback
  if (!query.includes(":")) {
    return {
      conditions: [{ field: "text", operator: "contains", value: query.toLowerCase() }],
      operator: "AND",
      isValid: true,
    }
  }

  try {
    const parts = query.split(/\s+(AND|OR)\s+/i)
    const operator = query.toUpperCase().includes(" OR ") ? "OR" : "AND"
    const conditions: SearchCondition[] = []

    for (const part of parts) {
      if (part.toUpperCase() === "AND" || part.toUpperCase() === "OR") continue

      const match = part.match(/(\w+):(>=|<=|!=|>|<|=|contains|startswith|endswith)(.+)/)
      if (!match) {
        const simpleMatch = part.match(/(\w+):(.+)/)
        if (simpleMatch) {
          conditions.push({
            field: simpleMatch[1],
            operator: "=",
            value: simpleMatch[2].replace(/['"]/g, ""),
          })
        }
        continue
      }

      const [, field, op, valueStr] = match
      let value: string | number = valueStr.replace(/['"]/g, "")

      if (!isNaN(Number(value)) && !["contains", "startswith", "endswith"].includes(op)) {
        value = Number(value)
      }

      conditions.push({ field, operator: op, value })
    }

    return { conditions, operator, isValid: true }
  } catch {
    return { conditions: [], operator: "AND", isValid: false, error: "Invalid search syntax" }
  }
}

const evaluateCondition = (point: EmbeddingPoint, condition: SearchCondition): boolean => {
  const fieldValue = point[condition.field as keyof EmbeddingPoint]

  switch (condition.operator) {
    case "=":
      return String(fieldValue).toLowerCase() === String(condition.value).toLowerCase()
    case "!=":
      return String(fieldValue).toLowerCase() !== String(condition.value).toLowerCase()
    case ">":
      return Number(fieldValue) > Number(condition.value)
    case "<":
      return Number(fieldValue) < Number(condition.value)
    case ">=":
      return Number(fieldValue) >= Number(condition.value)
    case "<=":
      return Number(fieldValue) <= Number(condition.value)
    case "contains":
      return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase())
    case "startswith":
      return String(fieldValue).toLowerCase().startsWith(String(condition.value).toLowerCase())
    case "endswith":
      return String(fieldValue).toLowerCase().endsWith(String(condition.value).toLowerCase())
    default:
      return false
  }
}

export default function EmbeddingsExplorer() {
  const { toast } = useToast()
  
  // Core state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPoints, setSelectedPoints] = useState<EmbeddingPoint[]>([])
  const [prompt, setPrompt] = useState("")
  const [hoveredPoint, setHoveredPoint] = useState<EmbeddingPoint | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 })
  const [colorBy, setColorBy] = useState("category")
  const [showSearchHelp, setShowSearchHelp] = useState(false)
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(320)
  const [rightSidebarWidth, setRightSidebarWidth] = useState(380)
  const [isResizing, setIsResizing] = useState<"left" | "right" | null>(null)
  
  // Zoom and point size state
  const [zoomLevel, setZoomLevel] = useState(1)
  const [pointSize, setPointSize] = useState([7])
  
  // Interaction mode and pan state
  const [interactionMode, setInteractionMode] = useState<'select' | 'pan' | 'polygon'>('select')
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  
  // Polygon selection state
  const [polygonPoints, setPolygonPoints] = useState<Array<{ x: number, y: number }>>([])
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false)
  
  // Data state
  const [currentData, setCurrentData] = useState<EmbeddingPoint[]>([])
  const [isDataImported, setIsDataImported] = useState(false)
  const [isLoadingTestData, setIsLoadingTestData] = useState(true)
  const [importProgress, setImportProgress] = useState(0)
  const [isProcessingLargeFile, setIsProcessingLargeFile] = useState(false)
  
  // Settings and modals
  const [settings, setSettings] = useState<AppSettings>(loadSettings())
  const [showSettings, setShowSettings] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  
  // Import state
  const [csvData, setCsvData] = useState<CSVData | null>(null)
  const [selectedXColumn, setSelectedXColumn] = useState<string>('')
  const [selectedYColumn, setSelectedYColumn] = useState<string>('')
  const [selectedTextColumn, setSelectedTextColumn] = useState<string>('')
  const [importError, setImportError] = useState<string>('')
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<LLMResponse | null>(null)
  const [showAnalysisResult, setShowAnalysisResult] = useState(false)
  
  // Tab state for right sidebar
  const [rightSidebarTab, setRightSidebarTab] = useState("data")

  const leftResizeRef = useRef<HTMLDivElement>(null)
  const rightResizeRef = useRef<HTMLDivElement>(null)
  const dataTabRef = useRef<HTMLDivElement>(null)
  const [dataTabHeight, setDataTabHeight] = useState(500)

  const categories = useMemo(() => {
    const cats = Array.from(new Set(currentData.map((point) => point.category)))
    return ["all", ...cats]
  }, [currentData])

  // Generate dynamic color options based on current data
  const colorOptions = useMemo(() => {
    if (currentData.length === 0) return baseColorOptions

    // Get all unique keys from the data
    const allKeys = new Set<string>()
    currentData.forEach(point => {
      Object.keys(point).forEach(key => allKeys.add(key))
    })

    const dynamicOptions: ColorOption[] = []
    
    allKeys.forEach(key => {
      // Skip these keys as they're not suitable for coloring
      if (['id', 'text', 'x', 'y', 'timestamp'].includes(key)) return

      // Check if this field is mostly numerical or categorical
      const values = currentData.slice(0, 50).map(point => (point as Record<string, unknown>)[key]).filter(v => v !== undefined && v !== null && v !== '')
      
      if (values.length === 0) return

      const numericValues = values.filter(v => !isNaN(parseFloat(String(v))) && isFinite(parseFloat(String(v))))
      const isNumerical = numericValues.length >= values.length * 0.7

      // Create readable label
      const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()

      dynamicOptions.push({
        value: key,
        label,
        type: isNumerical ? "numerical" : "categorical"
      })
    })

    // Sort options: base options first, then custom ones alphabetically
    const baseKeys = baseColorOptions.map(opt => opt.value)
    const baseOptions = dynamicOptions.filter(opt => baseKeys.includes(opt.value))
    const customOptions = dynamicOptions.filter(opt => !baseKeys.includes(opt.value)).sort((a, b) => a.label.localeCompare(b.label))

    return [...baseOptions, ...customOptions]
  }, [currentData])

  const parsedQuery = useMemo(() => parseSearchQuery(searchQuery), [searchQuery])

  // Optimized scaling with better memoization and bounds caching
  const dataBounds = useMemo(() => {
    if (currentData.length === 0) return null
    
    const xValues = []
    const yValues = []
    
    for (let i = 0; i < currentData.length; i++) {
      const point = currentData[i]
      if (typeof point.x === 'number' && !isNaN(point.x)) xValues.push(point.x)
      if (typeof point.y === 'number' && !isNaN(point.y)) yValues.push(point.y)
    }
    
    if (xValues.length === 0 || yValues.length === 0) return null
    
    return {
      minX: Math.min(...xValues),
      maxX: Math.max(...xValues),
      minY: Math.min(...yValues),
      maxY: Math.max(...yValues)
    }
  }, [currentData])
  
  const scaledData = useMemo(() => {
    if (!dataBounds || currentData.length === 0) return []
    
    const { minX, maxX, minY, maxY } = dataBounds
    const padding = 50
    const viewportWidth = 400 // 500 - 2*padding
    const viewportHeight = 400
    
    const xRange = maxX - minX
    const yRange = maxY - minY
    const baseXScale = xRange > 0 ? viewportWidth / xRange : 1
    const baseYScale = yRange > 0 ? viewportHeight / yRange : 1
    
    const centerX = 250
    const centerY = 250
    
    // Pre-allocate result array for better performance
    const scaled = new Array(currentData.length)
    
    for (let i = 0; i < currentData.length; i++) {
      const point = currentData[i]
      const baseScaledX = padding + ((point.x - minX) * baseXScale)
      const baseScaledY = 500 - padding - ((point.y - minY) * baseYScale)
      
      const scaledX = centerX + (baseScaledX - centerX) * zoomLevel + panOffset.x
      const scaledY = centerY + (baseScaledY - centerY) * zoomLevel + panOffset.y
      
      scaled[i] = {
        ...point,
        x: scaledX,
        y: scaledY
      }
    }
    
    return scaled
  }, [currentData, dataBounds, zoomLevel, panOffset])
  
  // Apply clustering for performance at low zoom levels
  const clusteredData = useMemo(() => {
    return clusterPoints(scaledData, zoomLevel)
  }, [scaledData, zoomLevel])

  const filteredData = useMemo(() => {
    // Use clustered data for better performance
    const dataToFilter = clusteredData.map(cluster => {
      // For clusters, use the first point for filtering logic
      const point = cluster.count === 1 ? cluster.points[0] : {
        ...cluster.points[0], // Use first point as representative
        x: cluster.x,
        y: cluster.y,
        id: cluster.id
      }
      return point
    })
    
    return dataToFilter.filter((point) => {
      const matchesCategory = selectedCategory === "all" || point.category === selectedCategory

      if (!parsedQuery.isValid || parsedQuery.conditions.length === 0) {
        return matchesCategory
      }

      const conditionResults = parsedQuery.conditions.map((condition) => evaluateCondition(point, condition))
      const searchMatches =
        parsedQuery.operator === "AND"
          ? conditionResults.every((result) => result)
          : conditionResults.some((result) => result)

      return matchesCategory && searchMatches
    })
  }, [searchQuery, selectedCategory, parsedQuery, clusteredData])

  // Resize handlers
  const handleMouseDown = useCallback((side: "left" | "right") => {
    setIsResizing(side)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return

      if (isResizing === "left") {
        const newWidth = Math.max(250, Math.min(500, e.clientX))
        setLeftSidebarWidth(newWidth)
      } else if (isResizing === "right") {
        const newWidth = Math.max(300, Math.min(600, window.innerWidth - e.clientX))
        setRightSidebarWidth(newWidth)
      }
    },
    [isResizing],
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(null)
  }, [])

  // Zoom control functions
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev * 1.2, 5))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.2))
  }, [])

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }, [])

  // Interaction mode handlers
  const setSelectMode = useCallback(() => {
    setInteractionMode('select')
    setPolygonPoints([])
    setIsDrawingPolygon(false)
  }, [])

  const setPanMode = useCallback(() => {
    setInteractionMode('pan')
    setPolygonPoints([])
    setIsDrawingPolygon(false)
  }, [])

  const setPolygonMode = useCallback(() => {
    setInteractionMode('polygon')
    setPolygonPoints([])
    setIsDrawingPolygon(true)
  }, [])

  // Pan handlers
  const handlePanStart = useCallback((e: React.MouseEvent) => {
    if (interactionMode === 'pan') {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }, [interactionMode])

  const handlePanMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && interactionMode === 'pan') {
      const deltaX = e.clientX - panStart.x
      const deltaY = e.clientY - panStart.y
      setPanOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }, [isPanning, interactionMode, panStart])

  const handlePanEnd = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Point-in-polygon detection using ray casting algorithm
  const isPointInPolygon = useCallback((point: { x: number, y: number }, polygon: Array<{ x: number, y: number }>) => {
    if (polygon.length < 3) return false
    
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
          (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
        inside = !inside
      }
    }
    return inside
  }, [])

  // Polygon selection handlers
  const handlePolygonClick = useCallback((e: React.MouseEvent) => {
    if (interactionMode === 'polygon' && isDrawingPolygon) {
      const svg = e.currentTarget.closest('svg')
      if (!svg) return
      
      const rect = svg.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Convert to SVG coordinates (scale to 500x500 viewBox)
      const svgX = (x / rect.width) * 500
      const svgY = (y / rect.height) * 500
      
      setPolygonPoints(prev => [...prev, { x: svgX, y: svgY }])
    }
  }, [interactionMode, isDrawingPolygon])

  const finishPolygonSelection = useCallback(() => {
    if (polygonPoints.length >= 3) {
      // Select all points inside the polygon
      const pointsInPolygon = filteredData.filter(point => 
        isPointInPolygon({ x: point.x, y: point.y }, polygonPoints)
      )
      setSelectedPoints(pointsInPolygon)
    }
    setPolygonPoints([])
    setIsDrawingPolygon(false)
    setInteractionMode('select')
  }, [polygonPoints, filteredData, isPointInPolygon])

  const cancelPolygonSelection = useCallback(() => {
    setPolygonPoints([])
    setIsDrawingPolygon(false)
    setInteractionMode('select')
  }, [])

  // Add event listeners for resize
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // Calculate available height for data tab
  useEffect(() => {
    const updateHeight = () => {
      if (dataTabRef.current) {
        const rect = dataTabRef.current.getBoundingClientRect()
        const availableHeight = window.innerHeight - rect.top - 100 // Leave some margin
        setDataTabHeight(Math.max(300, availableHeight))
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [rightSidebarTab])

  // Enhanced color coding with Design Are.na gradient system
  const getPointColor = useCallback((point: EmbeddingPoint) => {
    const colorOption = colorOptions.find((opt) => opt.value === colorBy)

    if (colorOption?.type === "categorical") {
      // Enhanced categorical colors using the gradient system
      const categoryColors: Record<string, string> = {
        "AI/ML": "hsl(var(--vis-teal))",
        Cooking: "hsl(var(--vis-yellow))",
        Environment: "hsl(var(--vis-teal))",
        Technology: "hsl(var(--vis-orange))",
        Health: "hsl(var(--vis-red))",
        research_paper: "hsl(var(--vis-teal))",
        textbook: "hsl(178 64% 57%)",
        recipe_book: "hsl(var(--vis-yellow))",
        blog_post: "hsl(45 93% 68%)",
        magazine: "hsl(var(--vis-orange))",
        news_article: "hsl(178 54% 37%)",
        report: "hsl(178 74% 57%)",
        scientific_journal: "hsl(var(--vis-purple))",
        tutorial: "hsl(25 85% 43%)",
        documentation: "hsl(280 75% 62%)",
        medical_journal: "hsl(var(--vis-red))",
        nutrition_guide: "hsl(0 74% 50%)",
        research_study: "hsl(280 55% 42%)",
      }
      return categoryColors[point[colorBy as keyof EmbeddingPoint] as string] || "hsl(215 16% 46.9%)"
    } else {
      const value = point[colorBy as keyof EmbeddingPoint] as number
      const allValues = currentData.map((p) => p[colorBy as keyof EmbeddingPoint] as number)
      const min = Math.min(...allValues)
      const max = Math.max(...allValues)
      const normalized = (value - min) / (max - min)

      if (colorBy === "sentiment") {
        // Enhanced sentiment mapping with gradient colors
        if (value < 0) {
          const intensity = Math.abs(normalized)
          return `hsl(0 84% ${60 + intensity * 20}%)`
        } else {
          return `hsl(178 ${64 - normalized * 20}% ${47 + normalized * 20}%)`
        }
      } else {
        // Design Are.na inspired gradient mapping
        if (normalized < 0.33) {
          // Teal to Yellow
          const t = normalized / 0.33
          return `hsl(${178 - t * 133} ${64 + t * 29}% ${47 + t * 11}%)`
        } else if (normalized < 0.66) {
          // Yellow to Orange
          const t = (normalized - 0.33) / 0.33
          return `hsl(${45 - t * 20} ${93 + t * 2}% ${58 - t * 5}%)`
        } else {
          // Orange to Red
          const t = (normalized - 0.66) / 0.34
          return `hsl(${25 - t * 25} ${95 - t * 11}% ${53 + t * 7}%)`
        }
      }
    }
  }, [colorBy, currentData, colorOptions])

  // Generate legend items
  const legendItems = useMemo(() => {
    const colorOption = colorOptions.find((opt) => opt.value === colorBy)

    if (colorOption?.type === "categorical") {
      const uniqueValues = Array.from(
        new Set(currentData.map((point) => point[colorBy as keyof EmbeddingPoint] as string)),
      )
      return uniqueValues.map((value) => ({
        label: value,
        color: getPointColor({ [colorBy]: value } as EmbeddingPoint),
      }))
    } else {
      const allValues = currentData.map((p) => p[colorBy as keyof EmbeddingPoint] as number)
      const min = Math.min(...allValues)
      const max = Math.max(...allValues)
      return [
        { label: `Min: ${min.toFixed(2)}`, color: getPointColor({ [colorBy]: min } as EmbeddingPoint) },
        { label: `Max: ${max.toFixed(2)}`, color: getPointColor({ [colorBy]: max } as EmbeddingPoint) },
      ]
    }
  }, [colorBy, currentData, getPointColor, colorOptions])

  const handlePointClick = (point: EmbeddingPoint, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation() // Prevent triggering polygon click
    }
    
    if (interactionMode === 'select') {
      const isSelected = selectedPoints.some((p) => p.id === point.id)
      if (isSelected) {
        setSelectedPoints(selectedPoints.filter((p) => p.id !== point.id))
      } else {
        setSelectedPoints([...selectedPoints, point])
      }
    }
  }

  const removeSelectedPoint = (pointId: string) => {
    setSelectedPoints(selectedPoints.filter((p) => p.id !== pointId))
  }

  const clearSelection = () => {
    setSelectedPoints([])
  }

  const exampleQueries = [
    "category:AI/ML AND confidence:>0.9",
    "sentiment:<0 OR readability:>7",
    "source:research_paper AND wordCount:>=8",
    "text:contains('machine learning')",
    "confidence:>=0.8 AND sentiment:>0",
  ]

  // Settings functions
  const handleSaveSettings = () => {
    saveSettings(settings)
    setShowSettings(false)
  }

  // Alternative file input trigger
  const triggerFileInput = () => {
    const fileInput = document.getElementById('csv-file-input') as HTMLInputElement
    if (fileInput) {
      console.log('Triggering file input click')
      fileInput.click()
    } else {
      console.error('File input element not found')
    }
  }

  // Import functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File upload triggered')
    const file = event.target.files?.[0]
    if (!file) {
      console.log('No file selected')
      return
    }

    console.log('Selected file:', file.name, file.type, file.size)

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv') && !file.type.includes('csv') && !file.type.includes('text')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file (.csv)",
        variant: "destructive"
      })
      return
    }

    // Check if file is large (> 5MB) and use streaming
    const isLargeFile = file.size > 5 * 1024 * 1024
    
    try {
      console.log('Reading file...')
      
      if (isLargeFile) {
        setIsProcessingLargeFile(true)
        setImportProgress(0)
        
        toast({
          title: "Processing large file",
          description: "This may take a moment...",
        })
      }
      
      const text = await file.text()
      console.log('File content length:', text.length)
      
      const parsedCSV = parseCSV(text)
      console.log('Parsed CSV:', parsedCSV.headers, 'Rows:', parsedCSV.rows.length)
      
      setCsvData(parsedCSV)
      setImportError('')
      
      // Auto-detect numeric columns for X/Y
      const numericCols = detectNumericColumns(parsedCSV)
      console.log('Detected numeric columns:', numericCols)
      
      if (numericCols.length >= 2) {
        setSelectedXColumn(numericCols[0])
        setSelectedYColumn(numericCols[1])
      } else {
        // Fallback: try to find x, y columns by name
        const xCol = parsedCSV.headers.find(h => h.toLowerCase().includes('x'))
        const yCol = parsedCSV.headers.find(h => h.toLowerCase().includes('y'))
        if (xCol) setSelectedXColumn(xCol)
        if (yCol) setSelectedYColumn(yCol)
      }
      
      // Auto-detect text column
      const textCols = parsedCSV.headers.filter(h => 
        h.toLowerCase().includes('text') || 
        h.toLowerCase().includes('content') || 
        h.toLowerCase().includes('description') ||
        h.toLowerCase().includes('original_text')
      )
      if (textCols.length > 0) {
        setSelectedTextColumn(textCols[0])
      }
      
      console.log('Opening import dialog')
      setShowImportDialog(true)
      
      toast({
        title: "File loaded successfully",
        description: `Found ${parsedCSV.rows.length} rows with ${parsedCSV.headers.length} columns`,
      })
    } catch (error) {
      console.error('File parsing error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setImportError(`Failed to parse CSV file: ${errorMessage}`)
      toast({
        title: "Import failed",
        description: `Failed to parse CSV file: ${errorMessage}`,
        variant: "destructive"
      })
    } finally {
      setIsProcessingLargeFile(false)
      setImportProgress(0)
    }
    
    // Reset file input
    event.target.value = ''
  }

  const handleImportData = async () => {
    if (!csvData || !selectedXColumn || !selectedYColumn) {
      setImportError('Please select X and Y columns')
      return
    }

    const isLargeDataset = csvData.rows.length > 10000

    try {
      setIsProcessingLargeFile(isLargeDataset)
      setImportProgress(0)

      let newData: EmbeddingPoint[]

      if (isLargeDataset) {
        // Use streaming for large datasets
        const csvText = [csvData.headers.join(','), ...csvData.rows.map(row => row.join(','))].join('\n')
        
        newData = await parseCSVStreaming(csvText, selectedXColumn, selectedYColumn, selectedTextColumn, {
          chunkSize: 1000,
          onProgress: (processed, total) => {
            setImportProgress(Math.round((processed / total) * 100))
          }
        })
      } else {
        // Use optimized conversion for smaller datasets
        newData = convertCSVToEmbeddingsOptimized(csvData, selectedXColumn, selectedYColumn, selectedTextColumn)
      }

      setCurrentData(newData)
      setIsDataImported(true)
      setShowImportDialog(false)
      setSelectedPoints([]) // Clear selection
      setCsvData(null)
      setImportError('')
      
      toast({
        title: "Import successful!",
        description: `Imported ${newData.length} data points. You can now visualize and analyze your data.`,
      })
    } catch (error) {
      let errorMessage = 'Import failed'
      if (error instanceof Error) {
        errorMessage = error.message
        // Provide more helpful error messages
        if (errorMessage.includes('Required columns not found')) {
          errorMessage = `Could not find required x and y columns. Available columns: ${csvData?.headers.join(', ') || 'none'}`
        }
      }
      console.error('CSV import error:', error)
      setImportError(errorMessage)
      toast({
        title: "Import failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsProcessingLargeFile(false)
      setImportProgress(0)
    }
  }

  const resetToSampleData = () => {
    setCurrentData(sampleData)
    setIsDataImported(false)
    setSelectedPoints([])
    
    toast({
      title: "Sample data loaded",
      description: "Switched back to the sample embedding dataset.",
    })
  }

  // Analysis functions
  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt for analysis.",
        variant: "destructive"
      })
      return
    }
    
    if (selectedPoints.length === 0) {
      toast({
        title: "No data selected",
        description: "Please select some data points to analyze.",
        variant: "destructive"
      })
      return
    }
    
    if (!settings.llm.apiKey) {
      toast({
        title: "API key required",
        description: "Please configure your API key in settings first.",
        variant: "destructive"
      })
      setShowSettings(true)
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await sendToLLM(prompt, selectedPoints, settings.llm, settings.apiFields)
      setAnalysisResult(result)
      setShowAnalysisResult(true)
      
      if (result.success) {
        toast({
          title: "Analysis completed",
          description: `Used ${result.tokensUsed || 0} tokens • Cost: $${result.cost?.toFixed(4) || '0.0000'}`,
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
      setAnalysisResult({
        success: false,
        error: errorMessage
      })
      setShowAnalysisResult(true)
      
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const estimatedTokens = useMemo(() => {
    if (!prompt || selectedPoints.length === 0) return 0
    const dataText = JSON.stringify(selectedPoints.map(p => {
      const filtered: Record<string, unknown> = {}
      settings.apiFields.forEach(field => {
        if (field in p) filtered[field] = p[field as keyof EmbeddingPoint]
      })
      return filtered
    }))
    return estimateTokens(prompt + dataText)
  }, [prompt, selectedPoints, settings.apiFields])

  const estimatedCost = useMemo(() => {
    return estimateCost(estimatedTokens, settings.llm.model)
  }, [estimatedTokens, settings.llm.model])

  // Auto-load test data on component mount
  useEffect(() => {
    const loadTestData = async () => {
      try {
        setIsLoadingTestData(true)
        console.log('Attempting to load test-data.csv...')
        
        const response = await fetch('/test-data.csv')
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const csvText = await response.text()
        console.log('CSV loaded, size:', csvText.length, 'characters')
        
        const parsedCSV = parseCSV(csvText)
        console.log('CSV parsed:', parsedCSV.headers.length, 'columns,', parsedCSV.rows.length, 'rows')
        
        // Auto-detect x, y, and text columns
        const numericCols = detectNumericColumns(parsedCSV)
        const xCol = numericCols.find(col => col.toLowerCase().includes('x')) || numericCols[0] || 'x'
        const yCol = numericCols.find(col => col.toLowerCase().includes('y')) || numericCols[1] || 'y'
        const textCol = parsedCSV.headers.find(h => 
          h.toLowerCase().includes('text') || 
          h.toLowerCase().includes('content') || 
          h.toLowerCase().includes('original_text')
        ) || parsedCSV.headers[0]
        
        console.log('Auto-detected columns - X:', xCol, 'Y:', yCol, 'Text:', textCol)
        
        const convertedData = convertCSVToEmbeddingsOptimized(parsedCSV, xCol, yCol, textCol)
        console.log('Converted to embeddings:', convertedData.length, 'points')
        
        setCurrentData(convertedData)
        setIsDataImported(true)
        
        toast({
          title: "Test data loaded",
          description: `Loaded ${convertedData.length} data points from test-data.csv`,
        })
        
      } catch (error) {
        console.warn('Could not load test-data.csv, falling back to sample data:', error)
        setCurrentData(sampleData)
        setIsDataImported(false)
        
        toast({
          title: "Using sample data",
          description: "test-data.csv not found, loaded sample dataset instead",
        })
      } finally {
        setIsLoadingTestData(false)
      }
    }

    loadTestData()
  }, [])

  // Export functions
  const handleExportAll = () => {
    downloadCSV(currentData, `embeddings-export-${new Date().toISOString().split('T')[0]}.csv`)
    toast({
      title: "Export completed",
      description: `Exported ${currentData.length} data points to CSV file.`,
    })
  }

  const handleExportFiltered = () => {
    downloadCSV(filteredData, `embeddings-filtered-${new Date().toISOString().split('T')[0]}.csv`)
    toast({
      title: "Export completed",
      description: `Exported ${filteredData.length} filtered data points to CSV file.`,
    })
  }

  const handleExportSelected = () => {
    if (selectedPoints.length === 0) {
      toast({
        title: "No points selected",
        description: "Please select some data points before exporting.",
        variant: "destructive"
      })
      return
    }
    downloadCSV(selectedPoints, `embeddings-selected-${new Date().toISOString().split('T')[0]}.csv`)
    toast({
      title: "Export completed",
      description: `Exported ${selectedPoints.length} selected data points to CSV file.`,
    })
  }

  return (
    <div className="h-screen paper-texture flex flex-col">
      {/* Enhanced Top Navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="flex h-12 items-center px-4 gap-4">

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3" />
            <Input
              placeholder="Search embeddings or use boolean queries (e.g., category:AI/ML AND confidence:>0.9)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-8 pr-8 h-8 text-xs technical-hover transition-all duration-200 ${!parsedQuery.isValid ? "border-red-500" : ""}`}
            />
            <Collapsible open={showSearchHelp} onOpenChange={setShowSearchHelp}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0">
                  <HelpCircle className="w-3 h-3" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="absolute top-full left-0 right-0 mt-2 z-50">
                <Card className="shadow-lg">
                  <CardContent className="p-3">
                    <div className="text-xs space-y-1">
                      <p className="font-medium">Boolean Search Examples:</p>
                      {exampleQueries.map((query, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(query)}
                          className="block w-full text-left p-1.5 hover:bg-muted rounded text-xs font-mono-technical bg-muted/50 technical-hover transition-all duration-150"
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
            {!parsedQuery.isValid && (
              <p className="absolute top-full left-0 text-xs text-red-500 mt-0.5">{parsedQuery.error}</p>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32 h-8 text-xs technical-hover">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue placeholder="Category" className="font-mono-technical" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={colorBy} onValueChange={setColorBy}>
              <SelectTrigger className="w-32 h-8 text-xs technical-hover">
                <Palette className="w-3 h-3 mr-1" />
                <SelectValue placeholder="Color by..." className="font-mono-technical" />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats & Actions */}
          <div className="flex items-center gap-3">
            <div className="text-technical bg-coordinates rounded px-2 py-1 text-xs">
              <span className="font-medium">{filteredData.length}</span> points •{" "}
              <span className="font-medium">{selectedPoints.length}</span> selected
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleFileUpload}
                  title="Upload CSV file"
                  id="csv-file-input"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="relative technical-hover h-7 px-2 text-xs"
                  onClick={triggerFileInput}
                >
                  <Upload className="w-3 h-3 mr-1" />
                  <span className="font-mono-technical">IMPORT</span>
                </Button>
              </div>
              {isDataImported && (
                <Button variant="outline" size="sm" onClick={resetToSampleData} className="technical-hover h-7 px-2 text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  <span className="font-mono-technical">SAMPLE</span>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="technical-hover h-7 px-2 text-xs">
                    <Download className="w-3 h-3 mr-1" />
                    <span className="font-mono-technical">EXPORT</span>
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportAll} className="font-mono-technical text-xs">
                    <Download className="w-3 h-3 mr-1" />
                    ALL_DATA [{currentData.length}]
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportFiltered} className="font-mono-technical text-xs">
                    <Download className="w-3 h-3 mr-1" />
                    FILTERED [{filteredData.length}]
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleExportSelected}
                    disabled={selectedPoints.length === 0}
                    className="font-mono-technical text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    SELECTED [{selectedPoints.length}]
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} className="technical-hover h-7 px-2 text-xs">
                <Settings className="w-3 h-3 mr-1" />
                <span className="font-mono-technical">SETTINGS</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Resizable Sidebars */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Legend & Analytics */}
        <div className="border-r bg-sidebar-background flex flex-col relative" style={{ width: leftSidebarWidth }}>
          <div className="p-3 border-b border-sidebar-border">
            <h3 className="font-mono-technical text-xs font-medium tracking-wide flex items-center gap-1">
              <Eye className="w-3 h-3" />
              VISUALIZATION_LEGEND
            </h3>
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-3">
            <Card className="academic-card technical-hover">
              <CardHeader className="pb-2">
                <CardTitle className="font-mono-technical text-xs tracking-wide">{colorOptions.find((opt) => opt.value === colorBy)?.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 p-3">
                {legendItems.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs truncate">{item.label}</span>
                  </div>
                ))}
                {legendItems.length > 8 && (
                  <p className="text-xs text-muted-foreground opacity-70">+{legendItems.length - 8} more</p>
                )}
                {colorOptions.find((opt) => opt.value === colorBy)?.type === "numerical" && (
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground mb-1">Scale:</div>
                    <div
                      className="h-2 rounded-full border"
                      style={{
                        background:
                          colorBy === "sentiment"
                            ? "linear-gradient(to right, hsl(var(--vis-red)), hsl(210 25% 95%), hsl(var(--vis-teal)))"
                            : "linear-gradient(to right, hsl(var(--vis-teal)), hsl(var(--vis-yellow)), hsl(var(--vis-orange)), hsl(var(--vis-red)))",
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="academic-card technical-hover">
              <CardHeader className="pb-2">
                <CardTitle className="font-mono-technical text-xs tracking-wide">DATASET_STATISTICS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3">
                {(isLoadingTestData || isProcessingLargeFile) && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span className="font-mono-technical">
                      {isLoadingTestData ? 'LOADING_DATA...' : `PROCESSING... ${importProgress}%`}
                    </span>
                  </div>
                )}
                {isProcessingLargeFile && importProgress > 0 && (
                  <div className="w-full bg-muted rounded-full h-1.5 mb-2">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground text-xs uppercase tracking-wider">Total Points</div>
                    <div className="text-technical text-sm">{currentData.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs uppercase tracking-wider">Filtered</div>
                    <div className="text-technical text-sm">{filteredData.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs uppercase tracking-wider">Categories</div>
                    <div className="text-technical text-sm">{categories.length - 1}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs uppercase tracking-wider">Sources</div>
                    <div className="text-technical text-sm">{Array.from(new Set(currentData.map((p) => p.source))).length}</div>
                  </div>
                </div>
                <div className="pt-1.5 border-t">
                  <div className="text-xs text-muted-foreground">
                    SOURCE: <span className="text-technical">
                      {isDataImported ? "test-data.csv" : "sample.dataset"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="academic-card technical-hover">
              <CardHeader className="pb-2">
                <CardTitle className="font-mono-technical text-xs tracking-wide">POINT_SIZE</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Size</span>
                  <span className="text-technical text-xs">{pointSize[0]}px</span>
                </div>
                <div className="px-1">
                  <Slider
                    value={pointSize}
                    onValueChange={setPointSize}
                    max={15}
                    min={2}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                    <span>2px</span>
                    <span>15px</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Left Resize Handle */}
          <div
            ref={leftResizeRef}
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors group"
            onMouseDown={() => handleMouseDown("left")}
          >
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-3 h-3 text-primary" />
            </div>
          </div>
        </div>

        {/* Center - Visualization */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-4">
            <Card className="h-full shadow-sm academic-card">
              <CardContent className="h-full p-0">
                <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden viz-grid">
                  {/* Interaction Controls */}
                  <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
                    {/* Interaction Mode Toggle */}
                    <div className="flex flex-col gap-0.5 bg-card/90 backdrop-blur rounded p-0.5 border">
                      <Button
                        variant={interactionMode === 'select' ? 'default' : 'outline'}
                        size="sm"
                        onClick={setSelectMode}
                        className="w-6 h-6 p-0 technical-hover"
                        title="Select Mode"
                      >
                        <MousePointer className="w-3 h-3" />
                      </Button>
                      <Button
                        variant={interactionMode === 'pan' ? 'default' : 'outline'}
                        size="sm"
                        onClick={setPanMode}
                        className="w-6 h-6 p-0 technical-hover"
                        title="Pan Mode"
                      >
                        <Move className="w-3 h-3" />
                      </Button>
                      <Button
                        variant={interactionMode === 'polygon' ? 'default' : 'outline'}
                        size="sm"
                        onClick={setPolygonMode}
                        className="w-6 h-6 p-0 technical-hover"
                        title="Polygon Select"
                      >
                        <Pentagon className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {/* Zoom Controls */}
                    <div className="flex flex-col gap-0.5 bg-card/90 backdrop-blur rounded p-0.5 border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleZoomIn}
                        className="w-6 h-6 p-0 technical-hover"
                        disabled={zoomLevel >= 5}
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleZoomOut}
                        className="w-6 h-6 p-0 technical-hover"
                        disabled={zoomLevel <= 0.2}
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleZoomReset}
                        className="w-6 h-6 p-0 technical-hover"
                        title="Reset View"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <div className="text-xs text-technical text-center bg-card/90 backdrop-blur rounded px-1 py-0.5">
                      {Math.round(zoomLevel * 100)}%
                    </div>
                    
                    {isDrawingPolygon && (
                      <div className="bg-card/90 backdrop-blur rounded p-1.5 border">
                        <div className="text-xs text-technical mb-1">
                          Polygon: {polygonPoints.length} points
                        </div>
                        <div className="flex gap-0.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={finishPolygonSelection}
                            className="text-xs px-1.5 h-5 technical-hover"
                            disabled={polygonPoints.length < 3}
                          >
                            Done
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelPolygonSelection}
                            className="text-xs px-1.5 h-5 technical-hover"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <svg 
                    width="100%" 
                    height="100%" 
                    viewBox="0 0 500 500" 
                    className={`w-full h-full ${interactionMode === 'pan' ? 'cursor-move' : interactionMode === 'polygon' ? 'cursor-crosshair' : 'cursor-default'}`}
                    onMouseDown={handlePanStart}
                    onMouseMove={handlePanMove}
                    onMouseUp={handlePanEnd}
                    onClick={handlePolygonClick}
                  >
                    {/* Simplified Grid */}
                    <defs>
                      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(var(--viz-grid))" strokeWidth="0.5" opacity="0.3" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Simple coordinate system border */}
                    <rect x="50" y="50" width="400" height="400" fill="none" stroke="hsl(215 25% 25%)" strokeWidth="1.5" opacity="0.8" strokeDasharray="2,2" />
                    
                    {/* Data points layer - positioned below text */}
                    <g className="points-layer">
                    {filteredData.map((point) => {
                      // Find the corresponding cluster to get proper sizing
                      const cluster = clusteredData.find(c => 
                        c.id === point.id || (c.count === 1 && c.points[0].id === point.id)
                      )
                      
                      if (!cluster) return null
                      
                      const isSelected = selectedPoints.some((p) => p.id === point.id)
                      const color = cluster.count === 1 ? getPointColor(point) : getClusterColor(cluster, getPointColor)
                      const size = cluster.count === 1 ? 
                        (isSelected ? pointSize[0] + 2 : pointSize[0]) :
                        getClusterSize(cluster, pointSize[0])

                      return (
                        <g key={point.id}>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r={size}
                            fill={color}
                            stroke={isSelected ? "hsl(var(--primary))" : cluster.count > 1 ? "rgba(0,0,0,0.2)" : "none"}
                            strokeWidth={isSelected ? 2 : cluster.count > 1 ? 1 : 0}
                            className="cursor-pointer hover:opacity-90 transition-all duration-200 drop-shadow-md technical-hover"
                            onClick={(e) => handlePointClick(point, e)}
                            onMouseEnter={(e) => {
                              setHoveredPoint(point)
                              const rect = e.currentTarget.getBoundingClientRect()
                              const svgRect = e.currentTarget.closest("svg")?.getBoundingClientRect()
                              if (svgRect) {
                                setTooltipPosition({
                                  x: rect.left - svgRect.left + rect.width / 2,
                                  y: rect.top - svgRect.top - 10,
                                })
                              }
                            }}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                          {/* Show cluster count for multi-point clusters */}
                          {cluster.count > 1 && (
                            <text
                              x={point.x}
                              y={point.y + 1.5}
                              textAnchor="middle"
                              className="font-mono-technical pointer-events-none"
                              fontSize="7"
                              fill="white"
                              fontWeight="bold"
                            >
                              {cluster.count}
                            </text>
                          )}
                          {isSelected && (
                            <text
                              x={point.x}
                              y={point.y - size - 6}
                              textAnchor="middle"
                              className="font-mono-technical pointer-events-none"
                              fontSize="8"
                              fill="hsl(var(--primary))"
                              fontWeight="bold"
                            >
                              ✓
                            </text>
                          )}
                        </g>
                      )
                    })}
                    </g>
                    
                    {/* Polygon visualization - above points but below text */}
                    {polygonPoints.length > 0 && (
                      <g className="polygon-layer">
                        {/* Polygon outline */}
                        {polygonPoints.length >= 2 && (
                          <polygon
                            points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                            fill="hsl(var(--primary))"
                            fillOpacity="0.1"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            strokeDasharray="4,4"
                          />
                        )}
                        
                        {/* Polygon corner points */}
                        {polygonPoints.map((point, index) => (
                          <circle
                            key={index}
                            cx={point.x}
                            cy={point.y}
                            r="3"
                            fill="hsl(var(--primary))"
                            stroke="white"
                            strokeWidth="1.5"
                            className="pointer-events-none"
                          />
                        ))}
                        
                        {/* Lines connecting points */}
                        {polygonPoints.map((point, index) => {
                          const nextPoint = polygonPoints[index + 1]
                          if (!nextPoint) return null
                          return (
                            <line
                              key={`line-${index}`}
                              x1={point.x}
                              y1={point.y}
                              x2={nextPoint.x}
                              y2={nextPoint.y}
                              stroke="hsl(var(--primary))"
                              strokeWidth="1.5"
                              strokeDasharray="3,3"
                              className="pointer-events-none"
                            />
                          )
                        })}
                      </g>
                    )}
                    
                    {/* Text layer - positioned above everything to prevent clipping */}
                    <g className="text-layer">
                      {/* Axis labels with background */}
                      <rect x="225" y="472" width="50" height="12" fill="hsl(var(--viz-background))" opacity="0.9" rx="2" />
                      <text x="250" y="480" textAnchor="middle" className="font-mono-technical" fontSize="8" fill="hsl(var(--technical-text))">
                        X-AXIS
                      </text>
                      
                      <rect x="17" y="244" width="16" height="12" fill="hsl(var(--viz-background))" opacity="0.9" rx="2" transform="rotate(-90, 25, 250)" />
                      <text x="25" y="250" textAnchor="middle" className="font-mono-technical" fontSize="8" fill="hsl(var(--technical-text))" transform="rotate(-90, 25, 250)">
                        Y-AXIS
                      </text>

                      {/* Technical data count with background */}
                      {filteredData.length > 0 && (
                        <>
                          <rect x="10" y="10" width="80" height="14" fill="hsl(var(--viz-background))" opacity="0.9" rx="2" />
                          <text x="15" y="20" fill="hsl(var(--technical-text))" fontSize="9" className="font-mono-technical">
                            [{filteredData.length}] POINTS
                          </text>
                        </>
                      )}
                    </g>
                  </svg>

                  {/* Enhanced Technical Tooltip */}
                  {hoveredPoint && (
                    <div
                      className="absolute z-10 academic-card rounded-lg shadow-xl p-3 max-w-xs pointer-events-none border-2"
                      style={{
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                        transform: "translate(-50%, -100%)",
                        borderColor: "hsl(var(--ring))"
                      }}
                    >
                      <div className="space-y-2">
                        <p className="text-xs font-medium leading-relaxed text-gray-900">{hoveredPoint.text}</p>
                        <div className="flex gap-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            {hoveredPoint.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                            {hoveredPoint.source}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          <div className="text-muted-foreground">
                            CONF: <span className="text-technical">{hoveredPoint.confidence.toFixed(2)}</span>
                          </div>
                          <div className="text-muted-foreground">
                            SENT: <span className="text-technical">{hoveredPoint.sentiment.toFixed(2)}</span>
                          </div>
                          <div className="text-muted-foreground">
                            WORDS: <span className="text-technical">{hoveredPoint.wordCount}</span>
                          </div>
                          <div className="text-muted-foreground">
                            READ: <span className="text-technical">{hoveredPoint.readability.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Tabbed Interface */}
        <div className="border-l bg-sidebar-background flex flex-col relative" style={{ width: rightSidebarWidth }}>
          {/* Right Resize Handle */}
          <div
            ref={rightResizeRef}
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary transition-colors group"
            onMouseDown={() => handleMouseDown("right")}
          >
            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-3 h-3 text-primary" />
            </div>
          </div>

          <Tabs value={rightSidebarTab} onValueChange={setRightSidebarTab} className="flex flex-col h-full">
            {/* Tab Navigation */}
            <div className="p-3 border-b border-sidebar-border">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="data" className="flex items-center gap-1 font-mono-technical">
                  <Database className="w-3 h-3" />
                  DATA [{selectedPoints.length}]
                </TabsTrigger>
                <TabsTrigger value="prompt" className="flex items-center gap-1 font-mono-technical">
                  <MessageSquare className="w-3 h-3" />
                  LLM
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="flex-1" style={{ minHeight: '500px' }}>
              <TabsContent value="data" className="h-full flex flex-col p-0 mt-0">
                {/* Data Tab Header */}
                <div className="p-3 border-b border-sidebar-border flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono-technical text-xs font-medium tracking-wide">SELECTED_POINTS [{selectedPoints.length}]</h3>
                    {selectedPoints.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearSelection} className="technical-hover h-6 px-2 text-xs">
                        <X className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Selected Points - Virtualized for performance */}
                <div ref={dataTabRef} className="flex-1 overflow-hidden">
                  <VirtualizedSelectedPoints
                    selectedPoints={selectedPoints}
                    getPointColor={getPointColor}
                    removeSelectedPoint={removeSelectedPoint}
                    containerHeight={dataTabHeight}
                  />
                </div>
              </TabsContent>

              <TabsContent value="prompt" className="h-full flex flex-col p-0 mt-0">
                {/* Prompt Tab Header */}
                <div className="p-3 border-b border-sidebar-border flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono-technical text-xs font-medium tracking-wide">PROMPT_INPUT</h3>
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="technical-hover h-6 px-2 text-xs"
                        onClick={() => setPrompt('')}
                        disabled={!prompt.trim()}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="technical-hover h-6 px-2 text-xs"
                        disabled={!prompt.trim()}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Manual Prompt Input - Force explicit height */}
                <div className="p-3 flex flex-col space-y-3" style={{ height: 'calc(100vh - 300px)', minHeight: '400px' }}>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your prompt here. Examples:&#10;• Analyze the sentiment patterns in these texts&#10;• Summarize the main themes across these data points&#10;• Find common categories and explain the relationships&#10;• Identify any outliers or anomalies in this data"
                    className="w-full h-48 text-xs resize-none overflow-y-auto border border-input rounded-md p-2"
                    style={{ minHeight: '192px' }}
                  />

                  <div className="flex gap-2">
                    <Button 
                      className="w-full technical-hover transition-all duration-200 h-10 text-xs" 
                      disabled={!prompt.trim() || selectedPoints.length === 0 || isAnalyzing}
                      onClick={handleAnalyze}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          <span className="font-mono-technical">ANALYZING...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          <span className="font-mono-technical">SEND_TO_LLM</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-2 mt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>CHARS: <span className="text-technical">{prompt.length}</span></div>
                      <div>POINTS: <span className="text-technical">{selectedPoints.length}</span></div>
                      {selectedPoints.length > 0 && prompt.trim() && (
                        <>
                          <div>TOKENS: <span className="text-technical">{estimatedTokens}</span></div>
                          <div>COST: <span className="text-technical">${estimatedCost.toFixed(4)}</span></div>
                        </>
                      )}
                    </div>
                    {selectedPoints.length === 0 && (
                      <div className="text-xs text-orange-600 mt-2 p-2 bg-orange-50 rounded">
                        ⚠️ No data points selected for analysis
                      </div>
                    )}
                    {!settings.llm.apiKey && (
                      <div className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded">
                        ⚠️ API key not configured
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono-technical tracking-wide">SYSTEM_SETTINGS</DialogTitle>
            <DialogDescription>
              Configure your LLM API settings and display preferences.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* LLM Settings */}
            <div className="space-y-4">
              <h3 className="font-mono-technical text-lg font-medium tracking-wide">LLM_CONFIGURATION</h3>
              
              <div className="space-y-2">
                <Label htmlFor="api-key" className="font-mono-technical text-xs tracking-wider">API_KEY</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  className="technical-input"
                  value={settings.llm.apiKey}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    llm: { ...prev.llm, apiKey: e.target.value }
                  }))}
                />
                <p className="text-xs text-muted-foreground">
                  Your API key is stored locally in your browser.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select
                  value={settings.llm.model}
                  onValueChange={(value) => {
                    setSettings(prev => ({
                      ...prev,
                      llm: { 
                        ...prev.llm, 
                        model: value,
                        endpoint: value.includes('claude') 
                          ? 'https://api.anthropic.com/v1/messages'
                          : 'https://api.openai.com/v1/chat/completions'
                      }
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini ($0.0015/1K tokens)</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o ($0.005/1K tokens)</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo ($0.01/1K tokens)</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo ($0.002/1K tokens)</SelectItem>
                    <SelectItem value="claude-3-haiku">Claude 3 Haiku ($0.00025/1K tokens)</SelectItem>
                    <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet ($0.003/1K tokens)</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet ($0.003/1K tokens)</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus ($0.015/1K tokens)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endpoint" className="font-mono-technical text-xs tracking-wider">API_ENDPOINT</Label>
                <Input
                  id="endpoint"
                  className="technical-input"
                  value={settings.llm.endpoint}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    llm: { ...prev.llm, endpoint: e.target.value }
                  }))}
                />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>OpenAI:</strong> https://api.openai.com/v1/chat/completions</p>
                  <p><strong>Anthropic:</strong> https://api.anthropic.com/v1/messages</p>
                  <p><strong>Custom:</strong> Your API-compatible endpoint</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-tokens" className="font-mono-technical text-xs tracking-wider">MAX_TOKENS</Label>
                <Input
                  id="max-tokens"
                  type="number"
                  min="100"
                  max="4000"
                  className="technical-input"
                  value={settings.llm.maxTokens}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    llm: { ...prev.llm, maxTokens: parseInt(e.target.value) || 1000 }
                  }))}
                />
              </div>
            </div>

            {/* API Fields */}
            <div className="space-y-4">
              <h3 className="font-mono-technical text-lg font-medium tracking-wide">API_DATA_FIELDS</h3>
              <div className="grid grid-cols-2 gap-4">
                {['text', 'category', 'source', 'confidence', 'sentiment', 'wordCount', 'readability', 'timestamp'].map((field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Switch
                      id={field}
                      checked={settings.apiFields.includes(field)}
                      onCheckedChange={(checked) => {
                        setSettings(prev => ({
                          ...prev,
                          apiFields: checked
                            ? [...prev.apiFields, field]
                            : prev.apiFields.filter(f => f !== field)
                        }))
                      }}
                    />
                    <Label htmlFor={field} className="font-mono-technical text-xs tracking-wider uppercase">{field}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-800">Security Notice</p>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Your API key is stored locally in your browser. Never share your API key or use it on untrusted websites.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)} className="technical-hover">
              <span className="font-mono-technical">CANCEL</span>
            </Button>
            <Button onClick={handleSaveSettings} className="technical-hover">
              <span className="font-mono-technical">SAVE_SETTINGS</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono-technical tracking-wide">IMPORT_CSV_DATA</DialogTitle>
            <DialogDescription>
              Select the columns for X and Y coordinates, and optionally a text column.
            </DialogDescription>
          </DialogHeader>
          
          {csvData && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>X Column (required)</Label>
                <Select value={selectedXColumn} onValueChange={setSelectedXColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select X column..." />
                  </SelectTrigger>
                  <SelectContent>
                    {csvData.headers.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Y Column (required)</Label>
                <Select value={selectedYColumn} onValueChange={setSelectedYColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Y column..." />
                  </SelectTrigger>
                  <SelectContent>
                    {csvData.headers.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Text Column (optional)</Label>
                <Select value={selectedTextColumn || "none"} onValueChange={(value) => setSelectedTextColumn(value === "none" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select text column..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {csvData.headers.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-700">{importError}</p>
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>Found {csvData.rows.length} rows with {csvData.headers.length} columns.</p>
                <p>All other columns will be imported as metadata.</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)} className="technical-hover">
              <span className="font-mono-technical">CANCEL</span>
            </Button>
            <Button 
              onClick={handleImportData}
              disabled={!selectedXColumn || !selectedYColumn || isProcessingLargeFile}
              className="technical-hover"
            >
              {isProcessingLargeFile ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="font-mono-technical">PROCESSING... {importProgress}%</span>
                </>
              ) : (
                <span className="font-mono-technical">IMPORT_DATA</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analysis Result Dialog */}
      <Dialog open={showAnalysisResult} onOpenChange={setShowAnalysisResult}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {analysisResult?.success ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Analysis Results
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Analysis Failed
                </>
              )}
            </DialogTitle>
            {analysisResult?.success && analysisResult.tokensUsed && (
              <DialogDescription>
                Used {analysisResult.tokensUsed} tokens • Cost: ${analysisResult.cost?.toFixed(4) || '0.0000'}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <div className="space-y-4">
            {analysisResult?.success ? (
              <div className="space-y-3">
                <div className="bg-slate-50 border rounded-lg p-4">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{analysisResult.content}</div>
                  </div>
                </div>
                {analysisResult.tokensUsed && (
                  <div className="flex justify-between text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    <span>Model: {settings.llm.model}</span>
                    <span>Tokens: {analysisResult.tokensUsed}</span>
                    <span>Cost: ${analysisResult.cost?.toFixed(4) || '0.0000'}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 mb-1">Analysis Failed</p>
                      <p className="text-xs text-red-700">{analysisResult?.error}</p>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Try:</p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>Checking your API key in settings</li>
                    <li>Ensuring you have sufficient API credits</li>
                    <li>Reducing the prompt length or number of data points</li>
                    <li>Checking your internet connection</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            {analysisResult?.success && (
              <Button 
                variant="outline" 
                onClick={() => {
                  navigator.clipboard.writeText(analysisResult.content || '')
                  toast({ title: "Copied to clipboard", description: "Analysis result copied successfully." })
                }} 
                className="technical-hover"
              >
                <span className="font-mono-technical">COPY</span>
              </Button>
            )}
            <Button onClick={() => setShowAnalysisResult(false)} className="technical-hover ml-auto">
              <span className="font-mono-technical">CLOSE</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </div>
  )
}