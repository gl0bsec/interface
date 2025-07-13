import type { EmbeddingPoint } from "@/types/embedding"

export interface ClusterPoint {
  id: string
  x: number
  y: number
  count: number
  points: EmbeddingPoint[]
  category: string
  avgConfidence: number
  avgSentiment: number
}

/**
 * Simple grid-based clustering for performance
 * Groups points into grid cells to reduce rendering load at low zoom levels
 */
export function clusterPoints(
  points: EmbeddingPoint[],
  zoomLevel: number,
  gridSize: number = 50
): ClusterPoint[] {
  // Only cluster when zoomed out significantly
  if (zoomLevel > 0.5 || points.length < 100) {
    return points.map(point => ({
      id: point.id,
      x: point.x,
      y: point.y,
      count: 1,
      points: [point],
      category: point.category,
      avgConfidence: point.confidence,
      avgSentiment: point.sentiment
    }))
  }

  const clusters = new Map<string, ClusterPoint>()
  
  points.forEach(point => {
    // Calculate grid cell
    const cellX = Math.floor(point.x / gridSize)
    const cellY = Math.floor(point.y / gridSize)
    const cellKey = `${cellX}_${cellY}`
    
    if (clusters.has(cellKey)) {
      const cluster = clusters.get(cellKey)!
      cluster.count++
      cluster.points.push(point)
      
      // Update averages
      const totalConf = cluster.avgConfidence * (cluster.count - 1) + point.confidence
      const totalSent = cluster.avgSentiment * (cluster.count - 1) + point.sentiment
      cluster.avgConfidence = totalConf / cluster.count
      cluster.avgSentiment = totalSent / cluster.count
      
      // Update position to centroid
      cluster.x = (cluster.x * (cluster.count - 1) + point.x) / cluster.count
      cluster.y = (cluster.y * (cluster.count - 1) + point.y) / cluster.count
    } else {
      clusters.set(cellKey, {
        id: `cluster_${cellKey}`,
        x: point.x,
        y: point.y,
        count: 1,
        points: [point],
        category: point.category,
        avgConfidence: point.confidence,
        avgSentiment: point.sentiment
      })
    }
  })
  
  return Array.from(clusters.values())
}

/**
 * Get the size of a cluster point for rendering
 */
export function getClusterSize(cluster: ClusterPoint, baseSize: number): number {
  if (cluster.count === 1) return baseSize
  
  // Scale size based on number of points, with a reasonable max
  const scaleFactor = Math.log(cluster.count) + 1
  return Math.min(baseSize * scaleFactor, baseSize * 3)
}

/**
 * Get cluster color based on the most common category
 */
export function getClusterColor(cluster: ClusterPoint, getPointColor: (point: EmbeddingPoint) => string): string {
  if (cluster.count === 1) {
    return getPointColor(cluster.points[0])
  }
  
  // Find most common category
  const categoryCounts = new Map<string, number>()
  cluster.points.forEach(point => {
    const count = categoryCounts.get(point.category) || 0
    categoryCounts.set(point.category, count + 1)
  })
  
  let mostCommonCategory = cluster.points[0].category
  let maxCount = 0
  categoryCounts.forEach((count, category) => {
    if (count > maxCount) {
      maxCount = count
      mostCommonCategory = category
    }
  })
  
  // Return color for most common category
  const samplePoint = cluster.points.find(p => p.category === mostCommonCategory) || cluster.points[0]
  return getPointColor(samplePoint)
}