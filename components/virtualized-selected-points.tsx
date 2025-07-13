"use client"

import { memo, useMemo } from "react"
import { FixedSizeList as List } from "react-window"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Eye } from "lucide-react"
import type { EmbeddingPoint } from "@/types/embedding"

interface VirtualizedSelectedPointsProps {
  selectedPoints: EmbeddingPoint[]
  getPointColor: (point: EmbeddingPoint) => string
  removeSelectedPoint: (pointId: string) => void
  containerHeight: number
}

interface PointItemProps {
  index: number
  style: React.CSSProperties
  data: {
    points: EmbeddingPoint[]
    getPointColor: (point: EmbeddingPoint) => string
    removeSelectedPoint: (pointId: string) => void
  }
}

const PointItem = memo(({ index, style, data }: PointItemProps) => {
  const { points, getPointColor, removeSelectedPoint } = data
  const point = points[index]
  
  if (!point) return null

  return (
    <div style={style} className="px-3 py-1.5">
      <Card className="relative academic-card technical-hover">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-technical bg-coordinates px-1.5 py-0.5 rounded text-xs">
                  #{String(index + 1).padStart(2, '0')}
                </span>
                <div
                  className="w-2.5 h-2.5 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: getPointColor(point) }}
                />
              </div>
              <p className="text-xs leading-relaxed text-gray-900 mb-2 line-clamp-3">{point.text}</p>
              <div className="flex gap-1 flex-wrap mb-1.5">
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  {point.category}
                </Badge>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  {point.source}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                CONF: <span className="text-technical">{point.confidence.toFixed(2)}</span> • 
                SENT: <span className="text-technical">{point.sentiment.toFixed(2)}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeSelectedPoint(point.id)}
              className="shrink-0 hover:bg-red-50 hover:text-red-600 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

PointItem.displayName = "PointItem"

export const VirtualizedSelectedPoints = memo(({
  selectedPoints,
  getPointColor,
  removeSelectedPoint,
  containerHeight
}: VirtualizedSelectedPointsProps) => {
  const itemData = useMemo(() => ({
    points: selectedPoints,
    getPointColor,
    removeSelectedPoint
  }), [selectedPoints, getPointColor, removeSelectedPoint])

  if (selectedPoints.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <div className="w-12 h-12 mx-auto mb-3 bg-technical rounded-full flex items-center justify-center technical-hover">
          <Eye className="w-6 h-6 opacity-50" />
        </div>
        <p className="font-mono-technical text-xs font-medium tracking-wide">NO_POINTS_SELECTED</p>
        <p className="text-xs mt-1 opacity-75">Click on data points in the visualization to select them</p>
      </div>
    )
  }

  return (
    <List
      height={containerHeight}
      width="100%"
      itemCount={selectedPoints.length}
      itemSize={160} // Reduced height for more compact cards
      itemData={itemData}
      overscanCount={5} // Render 5 extra items for smooth scrolling
    >
      {PointItem}
    </List>
  )
})

VirtualizedSelectedPoints.displayName = "VirtualizedSelectedPoints"