"use client"

import { useState, useMemo, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
} from "lucide-react"

// Enhanced embedding data
interface EmbeddingPoint {
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

// Color coding options
const colorOptions = [
  { value: "category", label: "Category", type: "categorical" },
  { value: "source", label: "Source", type: "categorical" },
  { value: "confidence", label: "Confidence", type: "numerical" },
  { value: "wordCount", label: "Word Count", type: "numerical" },
  { value: "sentiment", label: "Sentiment", type: "numerical" },
  { value: "readability", label: "Readability", type: "numerical" },
]

// Boolean search parser
interface SearchCondition {
  field: string
  operator: string
  value: string | number
}

interface ParsedQuery {
  conditions: SearchCondition[]
  operator: "AND" | "OR"
  isValid: boolean
  error?: string
}

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

export default function Component() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPoints, setSelectedPoints] = useState<EmbeddingPoint[]>([])
  const [prompt, setPrompt] = useState("")
  const [hoveredPoint, setHoveredPoint] = useState<EmbeddingPoint | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [colorBy, setColorBy] = useState("category")
  const [showSearchHelp, setShowSearchHelp] = useState(false)
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(320)
  const [rightSidebarWidth, setRightSidebarWidth] = useState(380)
  const [isResizing, setIsResizing] = useState<"left" | "right" | null>(null)

  const leftResizeRef = useRef<HTMLDivElement>(null)
  const rightResizeRef = useRef<HTMLDivElement>(null)

  const categories = useMemo(() => {
    const cats = Array.from(new Set(sampleData.map((point) => point.category)))
    return ["all", ...cats]
  }, [])

  const parsedQuery = useMemo(() => parseSearchQuery(searchQuery), [searchQuery])

  const filteredData = useMemo(() => {
    return sampleData.filter((point) => {
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
  }, [searchQuery, selectedCategory, parsedQuery])

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
  useState(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  })

  // Color coding logic
  const getPointColor = (point: EmbeddingPoint) => {
    const colorOption = colorOptions.find((opt) => opt.value === colorBy)

    if (colorOption?.type === "categorical") {
      const categoryColors = {
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
      const allValues = sampleData.map((p) => p[colorBy as keyof EmbeddingPoint] as number)
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
  }

  // Generate legend items
  const legendItems = useMemo(() => {
    const colorOption = colorOptions.find((opt) => opt.value === colorBy)

    if (colorOption?.type === "categorical") {
      const uniqueValues = Array.from(
        new Set(sampleData.map((point) => point[colorBy as keyof EmbeddingPoint] as string)),
      )
      return uniqueValues.map((value) => ({
        label: value,
        color: getPointColor({ [colorBy]: value } as any),
      }))
    } else {
      const allValues = sampleData.map((p) => p[colorBy as keyof EmbeddingPoint] as number)
      const min = Math.min(...allValues)
      const max = Math.max(...allValues)
      return [
        { label: `Min: ${min.toFixed(2)}`, color: getPointColor({ [colorBy]: min } as any) },
        { label: `Max: ${max.toFixed(2)}`, color: getPointColor({ [colorBy]: max } as any) },
      ]
    }
  }, [colorBy])

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
                  accept=".csv"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  disabled
                  onChange={(e) => {
                    // Import functionality will be implemented later
                    console.log("CSV file selected:", e.target.files?.[0])
                  }}
                />
                <Button variant="outline" size="sm" disabled className="relative bg-transparent">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
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
                    <div className="font-semibold">{sampleData.length}</div>
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
                    <div className="font-semibold">{Array.from(new Set(sampleData.map((p) => p.source))).length}</div>
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
                <Button className="flex-1" disabled={!prompt.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Send to LLM
                </Button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <div>Characters: {prompt.length}</div>
                <div>Selected points: {selectedPoints.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
