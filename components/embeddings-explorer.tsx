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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
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
  BarChart3,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
} from "lucide-react"

import type { 
  EmbeddingPoint, 
  ColorOption, 
  SearchCondition, 
  ParsedQuery,
  LegendItem,
  TooltipPosition,
  AppSettings,
  CSVData
} from "@/types/embedding"
import { loadSettings, saveSettings, estimateTokens, estimateCost } from "@/lib/settings"
import { parseCSV, convertCSVToEmbeddings, detectNumericColumns, downloadCSV } from "@/lib/csv-parser"
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
  } catch (error) {
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
  
  // Data state
  const [currentData, setCurrentData] = useState<EmbeddingPoint[]>(sampleData)
  const [isDataImported, setIsDataImported] = useState(false)
  
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

  const leftResizeRef = useRef<HTMLDivElement>(null)
  const rightResizeRef = useRef<HTMLDivElement>(null)

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
      const values = currentData.slice(0, 50).map(point => (point as any)[key]).filter(v => v !== undefined && v !== null && v !== '')
      
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

  // Scale coordinates to fit the viewport (500x500)
  const scaledData = useMemo(() => {
    if (currentData.length === 0) return []
    
    // Find data bounds
    const xValues = currentData.map(p => p.x)
    const yValues = currentData.map(p => p.y)
    const minX = Math.min(...xValues)
    const maxX = Math.max(...xValues)
    const minY = Math.min(...yValues)
    const maxY = Math.max(...yValues)
    
    // Add padding (10% on each side)
    const padding = 50 // 10% of 500
    const viewportWidth = 500 - (padding * 2)
    const viewportHeight = 500 - (padding * 2)
    
    // Calculate scale factors
    const xRange = maxX - minX
    const yRange = maxY - minY
    const xScale = xRange > 0 ? viewportWidth / xRange : 1
    const yScale = yRange > 0 ? viewportHeight / yRange : 1
    
    return currentData.map(point => ({
      ...point,
      x: padding + ((point.x - minX) * xScale),
      y: padding + ((point.y - minY) * yScale)
    }))
  }, [currentData])

  const filteredData = useMemo(() => {
    return scaledData.filter((point) => {
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
  }, [searchQuery, selectedCategory, parsedQuery, scaledData])

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

  // Add event listeners for resize
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // Color coding logic
  const getPointColor = useCallback((point: EmbeddingPoint) => {
    const colorOption = colorOptions.find((opt) => opt.value === colorBy)

    if (colorOption?.type === "categorical") {
      const categoryColors: Record<string, string> = {
        "AI/ML": "#3b82f6",
        Cooking: "#f59e0b",
        Environment: "#10b981",
        Technology: "#8b5cf6",
        Health: "#ef4444",
        research_paper: "#dc2626",
        textbook: "#ea580c",
        recipe_book: "#ca8a04",
        blog_post: "#65a30d",
        magazine: "#059669",
        news_article: "#0891b2",
        report: "#0284c7",
        scientific_journal: "#7c3aed",
        tutorial: "#c026d3",
        documentation: "#db2777",
        medical_journal: "#be185d",
        nutrition_guide: "#9f1239",
        research_study: "#881337",
      }
      return categoryColors[point[colorBy as keyof EmbeddingPoint] as string] || "#6b7280"
    } else {
      const value = point[colorBy as keyof EmbeddingPoint] as number
      const allValues = currentData.map((p) => p[colorBy as keyof EmbeddingPoint] as number)
      const min = Math.min(...allValues)
      const max = Math.max(...allValues)
      const normalized = (value - min) / (max - min)

      if (colorBy === "sentiment") {
        if (value < 0) {
          const intensity = Math.abs(value)
          return `rgb(${Math.round(220 * intensity + 100)}, ${Math.round(100 * (1 - intensity))}, ${Math.round(100 * (1 - intensity))})`
        } else {
          return `rgb(${Math.round(100 * (1 - value))}, ${Math.round(180 * value + 100)}, ${Math.round(100 * (1 - value))})`
        }
      } else {
        const red = Math.round(255 * normalized)
        const blue = Math.round(255 * (1 - normalized))
        return `rgb(${red}, 100, ${blue})`
      }
    }
  }, [colorBy, currentData])

  // Generate legend items
  const legendItems = useMemo(() => {
    const colorOption = colorOptions.find((opt) => opt.value === colorBy)

    if (colorOption?.type === "categorical") {
      const uniqueValues = Array.from(
        new Set(currentData.map((point) => point[colorBy as keyof EmbeddingPoint] as string)),
      )
      return uniqueValues.map((value) => ({
        label: value,
        color: getPointColor({ [colorBy]: value } as any),
      }))
    } else {
      const allValues = currentData.map((p) => p[colorBy as keyof EmbeddingPoint] as number)
      const min = Math.min(...allValues)
      const max = Math.max(...allValues)
      return [
        { label: `Min: ${min.toFixed(2)}`, color: getPointColor({ [colorBy]: min } as any) },
        { label: `Max: ${max.toFixed(2)}`, color: getPointColor({ [colorBy]: max } as any) },
      ]
    }
  }, [colorBy, currentData])

  const handlePointClick = (point: EmbeddingPoint) => {
    const isSelected = selectedPoints.some((p) => p.id === point.id)
    if (isSelected) {
      setSelectedPoints(selectedPoints.filter((p) => p.id !== point.id))
    } else {
      setSelectedPoints([...selectedPoints, point])
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

    try {
      console.log('Reading file...')
      const text = await file.text()
      console.log('File content length:', text.length)
      console.log('First 200 characters:', text.substring(0, 200))
      
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
        h.toLowerCase().includes('description')
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
    }
    
    // Reset file input
    event.target.value = ''
  }

  const handleImportData = () => {
    if (!csvData || !selectedXColumn || !selectedYColumn) {
      setImportError('Please select X and Y columns')
      return
    }

    try {
      const newData = convertCSVToEmbeddings(csvData, selectedXColumn, selectedYColumn, selectedTextColumn)
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
      const errorMessage = error instanceof Error ? error.message : 'Import failed'
      setImportError(errorMessage)
      toast({
        title: "Import failed",
        description: errorMessage,
        variant: "destructive"
      })
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
    if (!prompt.trim() || selectedPoints.length === 0) return
    if (!settings.llm.apiKey) {
      alert('Please configure your API key in settings first.')
      setShowSettings(true)
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await sendToLLM(prompt, selectedPoints, settings.llm, settings.apiFields)
      setAnalysisResult(result)
      setShowAnalysisResult(true)
    } catch (error) {
      setAnalysisResult({
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      })
      setShowAnalysisResult(true)
    }
    setIsAnalyzing(false)
  }

  const estimatedTokens = useMemo(() => {
    if (!prompt || selectedPoints.length === 0) return 0
    const dataText = JSON.stringify(selectedPoints.map(p => {
      const filtered: any = {}
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
    <div className="h-screen bg-background flex flex-col">
      {/* Enhanced Top Navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="flex h-16 items-center px-6 gap-6">
          {/* Logo/Title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Embeddings Explorer
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search embeddings or use boolean queries (e.g., category:AI/ML AND confidence:>0.9)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 pr-10 ${!parsedQuery.isValid ? "border-red-500" : ""}`}
            />
            <Collapsible open={showSearchHelp} onOpenChange={setShowSearchHelp}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2">
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="absolute top-full left-0 right-0 mt-2 z-50">
                <Card className="shadow-lg">
                  <CardContent className="p-4">
                    <div className="text-sm space-y-2">
                      <p className="font-medium">Boolean Search Examples:</p>
                      {exampleQueries.map((query, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchQuery(query)}
                          className="block w-full text-left p-2 hover:bg-muted rounded text-xs font-mono bg-muted/50"
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
              <p className="absolute top-full left-0 text-xs text-red-500 mt-1">{parsedQuery.error}</p>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
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
              <SelectTrigger className="w-40">
                <Palette className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Color by..." />
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
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{filteredData.length}</span> points •{" "}
              <span className="font-medium">{selectedPoints.length}</span> selected
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
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
                  className="relative"
                  onClick={triggerFileInput}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
              </div>
              {isDataImported && (
                <Button variant="outline" size="sm" onClick={resetToSampleData}>
                  <FileText className="w-4 h-4 mr-2" />
                  Sample Data
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportAll}>
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data ({currentData.length} points)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportFiltered}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Filtered ({filteredData.length} points)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleExportSelected}
                    disabled={selectedPoints.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Selected ({selectedPoints.length} points)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Resizable Sidebars */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Legend & Analytics */}
        <div className="border-r bg-muted/20 flex flex-col relative" style={{ width: leftSidebarWidth }}>
          <div className="p-4 border-b">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visualization Legend
            </h3>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{colorOptions.find((opt) => opt.value === colorBy)?.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {legendItems.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm truncate">{item.label}</span>
                  </div>
                ))}
                {legendItems.length > 8 && (
                  <p className="text-xs text-muted-foreground">+{legendItems.length - 8} more</p>
                )}
                {colorOptions.find((opt) => opt.value === colorBy)?.type === "numerical" && (
                  <div className="mt-4">
                    <div className="text-xs text-muted-foreground mb-2">Scale:</div>
                    <div
                      className="h-3 rounded-full border"
                      style={{
                        background:
                          colorBy === "sentiment"
                            ? "linear-gradient(to right, #dc2626, #ffffff, #16a34a)"
                            : "linear-gradient(to right, #3b82f6, #ef4444)",
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Dataset Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Total Points</div>
                    <div className="font-semibold">{currentData.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Filtered</div>
                    <div className="font-semibold">{filteredData.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Categories</div>
                    <div className="font-semibold">{categories.length - 1}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Sources</div>
                    <div className="font-semibold">{Array.from(new Set(currentData.map((p) => p.source))).length}</div>
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
              <GripVertical className="w-4 h-4 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Center - Visualization */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-6">
            <Card className="h-full shadow-sm">
              <CardContent className="h-full p-0">
                <div className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-white">
                  <svg width="100%" height="100%" viewBox="0 0 500 500" className="w-full h-full">
                    {/* Enhanced Grid */}
                    <defs>
                      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                      </pattern>
                      <pattern id="gridMinor" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f8fafc" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#gridMinor)" />
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Data points */}
                    {filteredData.map((point) => {
                      const isSelected = selectedPoints.some((p) => p.id === point.id)
                      const color = getPointColor(point)

                      return (
                        <g key={point.id}>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r={isSelected ? 9 : 7}
                            fill={color}
                            stroke={isSelected ? "#1f2937" : "rgba(255,255,255,0.9)"}
                            strokeWidth={isSelected ? 3 : 2}
                            className="cursor-pointer hover:opacity-90 transition-all duration-200 drop-shadow-md"
                            onClick={() => handlePointClick(point)}
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
                          {isSelected && (
                            <text
                              x={point.x}
                              y={point.y - 18}
                              textAnchor="middle"
                              className="text-xs fill-current pointer-events-none font-bold"
                              fontSize="12"
                              fill="#1f2937"
                            >
                              ✓
                            </text>
                          )}
                        </g>
                      )
                    })}
                  </svg>

                  {/* Enhanced Tooltip */}
                  {hoveredPoint && (
                    <div
                      className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm pointer-events-none"
                      style={{
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                        transform: "translate(-50%, -100%)",
                      }}
                    >
                      <div className="space-y-3">
                        <p className="text-sm font-medium leading-relaxed text-gray-900">{hoveredPoint.text}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {hoveredPoint.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {hoveredPoint.source}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>
                            Confidence: <span className="font-medium">{hoveredPoint.confidence.toFixed(2)}</span>
                          </div>
                          <div>
                            Sentiment: <span className="font-medium">{hoveredPoint.sentiment.toFixed(2)}</span>
                          </div>
                          <div>
                            Words: <span className="font-medium">{hoveredPoint.wordCount}</span>
                          </div>
                          <div>
                            Readability: <span className="font-medium">{hoveredPoint.readability.toFixed(1)}</span>
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

        {/* Right Sidebar - Selection & Manual Prompt */}
        <div className="border-l bg-muted/20 flex flex-col relative" style={{ width: rightSidebarWidth }}>
          {/* Right Resize Handle */}
          <div
            ref={rightResizeRef}
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors group"
            onMouseDown={() => handleMouseDown("right")}
          >
            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-blue-500" />
            </div>
          </div>

          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Selected Points ({selectedPoints.length})</h3>
              {selectedPoints.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Selected Points */}
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {selectedPoints.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Eye className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm font-medium">No points selected</p>
                <p className="text-xs mt-1">Click on data points in the visualization to select them</p>
              </div>
            ) : (
              selectedPoints.map((point, index) => (
                <Card key={point.id} className="relative hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                          <div
                            className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: getPointColor(point) }}
                          />
                        </div>
                        <p className="text-sm leading-relaxed text-gray-900 mb-3">{point.text}</p>
                        <div className="flex gap-2 flex-wrap mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {point.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {point.source}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Confidence: {point.confidence.toFixed(2)} • Sentiment: {point.sentiment.toFixed(2)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSelectedPoint(point.id)}
                        className="shrink-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Manual Prompt Input */}
          <div className="border-t bg-background p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Manual Prompt Input</h3>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Save
              </Button>
            </div>

            <div className="space-y-3">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here. You can reference the selected data points or write any custom prompt..."
                className="min-h-[120px] text-sm resize-none"
              />

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  disabled={!prompt.trim() || selectedPoints.length === 0 || isAnalyzing}
                  onClick={handleAnalyze}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send to LLM
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <div>Characters: {prompt.length}</div>
                <div>Selected points: {selectedPoints.length}</div>
                {selectedPoints.length > 0 && prompt && (
                  <>
                    <div>Est. tokens: {estimatedTokens}</div>
                    <div>Est. cost: ${estimatedCost.toFixed(4)}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Configure your LLM API settings and display preferences.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* LLM Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">LLM Configuration</h3>
              
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
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
                  onValueChange={(value) => setSettings(prev => ({
                    ...prev,
                    llm: { ...prev.llm, model: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo ($0.002/1K tokens)</SelectItem>
                    <SelectItem value="gpt-4">GPT-4 ($0.03/1K tokens)</SelectItem>
                    <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo ($0.01/1K tokens)</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o ($0.005/1K tokens)</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet ($0.003/1K tokens)</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus ($0.015/1K tokens)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endpoint">API Endpoint</Label>
                <Input
                  id="endpoint"
                  value={settings.llm.endpoint}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    llm: { ...prev.llm, endpoint: e.target.value }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-tokens">Max Tokens</Label>
                <Input
                  id="max-tokens"
                  type="number"
                  min="100"
                  max="4000"
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
              <h3 className="text-lg font-semibold">Data Fields to Send to API</h3>
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
                    <Label htmlFor={field} className="capitalize">{field}</Label>
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
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import CSV Data</DialogTitle>
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
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImportData}
              disabled={!selectedXColumn || !selectedYColumn}
            >
              Import Data
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
              <div className="prose prose-sm max-w-none">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{analysisResult.content}</pre>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{analysisResult?.error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowAnalysisResult(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </div>
  )
}