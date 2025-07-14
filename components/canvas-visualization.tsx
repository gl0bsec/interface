import React, { useRef, useEffect, useCallback, useMemo } from 'react'
import type { EmbeddingPoint, TooltipPosition } from '@/types/embedding'
// import type { ClusterPoint } from '@/lib/point-clustering' // For future clustering support

interface CanvasVisualizationProps {
  data: EmbeddingPoint[]
  selectedPoints: EmbeddingPoint[]
  hoveredPoint: EmbeddingPoint | null
  colorBy: string
  pointSize: number
  zoomLevel: number
  panOffset: { x: number; y: number }
  onPointClick: (point: EmbeddingPoint) => void
  onPointHover: (point: EmbeddingPoint | null, position?: TooltipPosition) => void
  getPointColor: (point: EmbeddingPoint) => string
  interactionMode: 'select' | 'pan' | 'polygon'
  polygonPoints: Array<{ x: number; y: number }>
  isDrawingPolygon: boolean
  onPolygonClick: (e: React.MouseEvent) => void
  onPanStart: (e: React.MouseEvent) => void
  onPanMove: (e: React.MouseEvent) => void
  onPanEnd: (e: React.MouseEvent) => void
}

// Removed unused PointQuadTree interface - keeping for future optimization

export function CanvasVisualization({
  data,
  selectedPoints,
  hoveredPoint,
  pointSize,
  zoomLevel,
  panOffset,
  onPointClick,
  onPointHover,
  getPointColor,
  interactionMode,
  polygonPoints,
  isDrawingPolygon,
  onPolygonClick,
  onPanStart,
  onPanMove,
  onPanEnd
}: CanvasVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const pixelRatio = useRef(window.devicePixelRatio || 1)

  // Memoize visible points based on viewport - using SVG coordinate system
  const visiblePoints = useMemo(() => {
    const canvas = canvasRef.current
    if (!canvas) return data

    const margin = pointSize * 2 // Add margin for points partially visible
    
    return data.filter(point => {
      // Points are in SVG coordinate system (0-500), so check against that
      return point.x >= -margin &&
             point.x <= 500 + margin &&
             point.y >= -margin &&
             point.y <= 500 + margin
    })
  }, [data, pointSize])

  // Point lookup optimization removed for simplicity - can be added back if needed

  // Find point at mouse position - convert to SVG coordinate system
  const getPointAtPosition = useCallback((x: number, y: number): EmbeddingPoint | null => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    
    // Convert mouse coordinates to SVG coordinate system (0-500) with zoom and pan
    const canvasX = ((x - rect.left) / rect.width) * 500
    const canvasY = ((y - rect.top) / rect.height) * 500
    const svgX = (canvasX - panOffset.x) / zoomLevel
    const svgY = (canvasY - panOffset.y) / zoomLevel
    
    // Find closest point within click radius
    const clickRadius = pointSize + 5
    let closestPoint: EmbeddingPoint | null = null
    let closestDistance = Infinity
    
    for (const point of visiblePoints) {
      const dx = point.x - svgX
      const dy = point.y - svgY
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance <= clickRadius && distance < closestDistance) {
        closestDistance = distance
        closestPoint = point
      }
    }
    
    return closestPoint
  }, [visiblePoints, pointSize, zoomLevel, panOffset])

  // Canvas rendering function - using SVG coordinate system
  const render = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Set up high-DPI rendering
    const rect = canvas.getBoundingClientRect()
    const ratio = pixelRatio.current
    canvas.width = rect.width * ratio
    canvas.height = rect.height * ratio
    ctx.scale(ratio, ratio)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // === STATIC ELEMENTS (NOT AFFECTED BY ZOOM/PAN) ===
    // Draw static grid (every 50 units in screen space)
    ctx.save()
    const baseScaleX = rect.width / 500
    const baseScaleY = rect.height / 500
    ctx.scale(baseScaleX, baseScaleY)
    
    ctx.strokeStyle = 'hsl(215 25% 25%)'
    ctx.lineWidth = 0.5
    ctx.globalAlpha = 0.3
    ctx.beginPath()
    for (let x = 0; x <= 500; x += 50) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 500)
    }
    for (let y = 0; y <= 500; y += 50) {
      ctx.moveTo(0, y)
      ctx.lineTo(500, y)
    }
    ctx.stroke()
    ctx.globalAlpha = 1

    // Draw static axis labels
    ctx.fillStyle = 'hsl(215 25% 40%)'
    ctx.font = '8px monospace'
    ctx.textAlign = 'center'
    
    // X-axis label
    ctx.save()
    ctx.fillStyle = 'hsl(215 25% 95%)'
    ctx.globalAlpha = 0.9
    ctx.fillRect(225, 472, 50, 12)
    ctx.globalAlpha = 1
    ctx.fillStyle = 'hsl(215 25% 40%)'
    ctx.fillText('X-AXIS', 250, 480)
    ctx.restore()
    
    // Y-axis label
    ctx.save()
    ctx.translate(25, 250)
    ctx.rotate(-Math.PI / 2)
    ctx.globalAlpha = 0.9
    ctx.fillStyle = 'hsl(215 25% 95%)'
    ctx.fillRect(-8, -6, 16, 12)
    ctx.globalAlpha = 1
    ctx.fillStyle = 'hsl(215 25% 40%)'
    ctx.fillText('Y-AXIS', 0, 0)
    ctx.restore()
    
    // Point count
    if (data.length > 0) {
      ctx.save()
      ctx.textAlign = 'left'
      ctx.font = '9px monospace'
      ctx.globalAlpha = 0.9
      ctx.fillStyle = 'hsl(215 25% 95%)'
      ctx.fillRect(10, 10, 80, 14)
      ctx.globalAlpha = 1
      ctx.fillStyle = 'hsl(215 25% 40%)'
      ctx.fillText(`[${data.length}] POINTS`, 15, 20)
      ctx.restore()
    }
    
    ctx.restore()

    // === DYNAMIC ELEMENTS (AFFECTED BY ZOOM/PAN) ===
    // Set up coordinate system for zoom/pan transformations
    const scaleX = (rect.width / 500) * zoomLevel
    const scaleY = (rect.height / 500) * zoomLevel
    ctx.save()
    ctx.scale(scaleX, scaleY)
    ctx.translate(panOffset.x / zoomLevel, panOffset.y / zoomLevel)

    // Batch rendering for performance
    const selectedPointIds = new Set(selectedPoints.map(p => p.id))
    
    // Draw regular points first
    visiblePoints.forEach(point => {
      if (selectedPointIds.has(point.id) || point.id === hoveredPoint?.id) return
      
      ctx.beginPath()
      ctx.arc(point.x, point.y, pointSize / scaleX, 0, 2 * Math.PI)
      ctx.fillStyle = getPointColor(point)
      ctx.fill()
    })
    
    // Draw selected points with larger size and border
    selectedPoints.forEach(point => {
      if (!visiblePoints.includes(point)) return
      
      ctx.beginPath()
      ctx.arc(point.x, point.y, (pointSize + 2) / scaleX, 0, 2 * Math.PI)
      ctx.fillStyle = getPointColor(point)
      ctx.fill()
      ctx.strokeStyle = 'hsl(var(--primary))'
      ctx.lineWidth = 2 / scaleX
      ctx.stroke()
      
      // Draw selection indicator text
      ctx.save()
      ctx.fillStyle = 'white'
      ctx.font = `${7 / scaleX}px monospace`
      ctx.textAlign = 'center'
      ctx.fillText('✓', point.x, point.y - (pointSize + 6) / scaleX)
      ctx.restore()
    })
    
    // Draw hovered point
    if (hoveredPoint && visiblePoints.includes(hoveredPoint)) {
      ctx.beginPath()
      ctx.arc(hoveredPoint.x, hoveredPoint.y, (pointSize + 1) / scaleX, 0, 2 * Math.PI)
      ctx.fillStyle = getPointColor(hoveredPoint)
      ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'
      ctx.lineWidth = 1 / scaleX
      ctx.stroke()
    }

    // Draw polygon if in progress
    if (isDrawingPolygon && polygonPoints.length > 0) {
      ctx.strokeStyle = 'hsl(var(--primary))'
      ctx.lineWidth = 2 / scaleX
      ctx.globalAlpha = 0.8
      
      ctx.beginPath()
      polygonPoints.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      if (polygonPoints.length >= 3) {
        ctx.closePath()
        ctx.fillStyle = 'hsla(var(--primary), 0.1)'
        ctx.fill()
      }
      ctx.stroke()
      
      // Draw polygon points
      polygonPoints.forEach(point => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 4 / scaleX, 0, 2 * Math.PI)
        ctx.fillStyle = 'hsl(var(--primary))'
        ctx.fill()
      })
      
      ctx.globalAlpha = 1
    }

    ctx.restore()
  }, [visiblePoints, selectedPoints, hoveredPoint, pointSize, getPointColor, isDrawingPolygon, polygonPoints, zoomLevel, panOffset, data])

  // Handle canvas interactions
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (interactionMode === 'pan') {
      onPanMove(e)
      return
    }

    const point = getPointAtPosition(e.clientX, e.clientY)
    if (point !== hoveredPoint) {
      if (point) {
        const canvas = canvasRef.current
        if (canvas) {
          const rect = canvas.getBoundingClientRect()
          onPointHover(point, {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top - 10
          })
        }
      } else {
        onPointHover(null)
      }
    }
  }, [interactionMode, getPointAtPosition, hoveredPoint, onPanMove, onPointHover])

  const handleMouseClick = useCallback((e: React.MouseEvent) => {
    if (interactionMode === 'polygon') {
      // Convert mouse coordinates to SVG coordinates for polygon
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        const canvasX = ((e.clientX - rect.left) / rect.width) * 500
        const canvasY = ((e.clientY - rect.top) / rect.height) * 500
        const svgX = (canvasX - panOffset.x) / zoomLevel
        const svgY = (canvasY - panOffset.y) / zoomLevel
        
        // Create a synthetic event with SVG coordinates
        const syntheticEvent = {
          ...e,
          currentTarget: {
            getBoundingClientRect: () => ({
              left: 0,
              top: 0,
              width: 500,
              height: 500
            })
          },
          clientX: svgX,
          clientY: svgY
        } as React.MouseEvent
        
        onPolygonClick(syntheticEvent)
      }
      return
    }

    const point = getPointAtPosition(e.clientX, e.clientY)
    if (point && interactionMode === 'select') {
      onPointClick(point)
    }
  }, [interactionMode, getPointAtPosition, onPointClick, onPolygonClick, panOffset.x, panOffset.y, zoomLevel])

  // Animation loop for smooth rendering
  useEffect(() => {
    const animate = () => {
      render()
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animate()
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [render])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        render()
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [render])

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{ cursor: interactionMode === 'pan' ? 'move' : interactionMode === 'polygon' ? 'crosshair' : 'default' }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={onPanStart}
        onMouseMove={handleMouseMove}
        onMouseUp={onPanEnd}
        onClick={handleMouseClick}
        onMouseLeave={() => onPointHover(null)}
      />
    </div>
  )
}