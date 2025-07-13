import type { CSVData, ImportedDataPoint, EmbeddingPoint } from "@/types/embedding"

export function parseCSV(csvText: string): CSVData {
  const lines = csvText.trim().split('\n')
  
  // Parse headers
  const headers = parseCSVLine(lines[0])
  
  // Parse data rows
  const rows = lines.slice(1).map(line => parseCSVLine(line))
  
  return { headers, rows }
}

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  // Add the last field
  values.push(current.trim())
  
  return values
}

export function convertCSVToEmbeddings(csvData: CSVData, xColumn: string, yColumn: string, textColumn?: string): EmbeddingPoint[] {
  const xIndex = csvData.headers.indexOf(xColumn)
  const yIndex = csvData.headers.indexOf(yColumn)
  const textIndex = textColumn ? csvData.headers.indexOf(textColumn) : -1
  
  if (xIndex === -1 || yIndex === -1) {
    throw new Error(`Required columns not found. X: ${xColumn}, Y: ${yColumn}`)
  }
  
  // Helper function to safely get column value
  const getColumnValue = (row: string[], columnName: string, defaultValue: any = null) => {
    const index = csvData.headers.indexOf(columnName)
    return index >= 0 ? row[index] : defaultValue
  }
  
  // Helper function to safely parse numeric values
  const safeParseFloat = (value: string | null, defaultValue: number = 0) => {
    if (value === null || value === undefined || value === '') return defaultValue
    const parsed = parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  }
  
  const safeParseInt = (value: string | null, defaultValue: number = 0) => {
    if (value === null || value === undefined || value === '') return defaultValue
    const parsed = parseInt(value)
    return isNaN(parsed) ? defaultValue : parsed
  }
  
  return csvData.rows.map((row, index) => {
    const x = safeParseFloat(row[xIndex])
    const y = safeParseFloat(row[yIndex])
    
    if (isNaN(x) || isNaN(y)) {
      throw new Error(`Invalid numeric values in row ${index + 2}: X="${row[xIndex]}", Y="${row[yIndex]}"`)
    }
    
    // Create embedding point with available data
    const point: EmbeddingPoint = {
      id: `imported_${index}`,
      text: textIndex >= 0 && row[textIndex] ? row[textIndex] : `Point ${index + 1}`,
      x,
      y,
      category: getColumnValue(row, 'category', 'Imported') || 'Imported',
      source: getColumnValue(row, 'source', 'csv_import') || 'csv_import',
      confidence: safeParseFloat(getColumnValue(row, 'confidence'), 0.5),
      wordCount: safeParseInt(getColumnValue(row, 'wordCount'), row[textIndex]?.split(' ').length || 0),
      sentiment: safeParseFloat(getColumnValue(row, 'sentiment'), 0),
      timestamp: getColumnValue(row, 'timestamp') || new Date().toISOString().split('T')[0],
      readability: safeParseFloat(getColumnValue(row, 'readability'), 5.0),
    }
    
    // Add any additional fields from CSV
    csvData.headers.forEach((header, idx) => {
      if (!['id', 'text', 'x', 'y', 'category', 'source', 'confidence', 'wordCount', 'sentiment', 'timestamp', 'readability'].includes(header)) {
        (point as any)[header] = row[idx] || ''
      }
    })
    
    return point
  })
}

export function detectNumericColumns(csvData: CSVData): string[] {
  const numericColumns: string[] = []
  
  csvData.headers.forEach((header, index) => {
    const values = csvData.rows.slice(0, 10).map(row => row[index]) // Check first 10 rows
    const numericValues = values.filter(value => !isNaN(parseFloat(value)) && isFinite(parseFloat(value)))
    
    if (numericValues.length >= values.length * 0.8) { // 80% of values are numeric
      numericColumns.push(header)
    }
  })
  
  return numericColumns
}

// Export functionality
export function convertEmbeddingsToCSV(data: EmbeddingPoint[]): string {
  if (data.length === 0) return ''
  
  // Get all unique keys from all data points
  const allKeys = new Set<string>()
  data.forEach(point => {
    Object.keys(point).forEach(key => allKeys.add(key))
  })
  
  const headers = Array.from(allKeys)
  const csvLines: string[] = []
  
  // Add header row
  csvLines.push(headers.map(header => escapeCSVValue(header)).join(','))
  
  // Add data rows
  data.forEach(point => {
    const row = headers.map(header => {
      const value = point[header as keyof EmbeddingPoint]
      return escapeCSVValue(String(value ?? ''))
    })
    csvLines.push(row.join(','))
  })
  
  return csvLines.join('\n')
}

function escapeCSVValue(value: string): string {
  // If the value contains comma, newline, or quotes, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function downloadCSV(data: EmbeddingPoint[], filename: string = 'embeddings-data.csv') {
  const csvContent = convertEmbeddingsToCSV(data)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}