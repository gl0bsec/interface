import type { CSVData, ImportedDataPoint, EmbeddingPoint } from "@/types/embedding"

interface StreamingCSVOptions {
  chunkSize?: number
  onProgress?: (processed: number, total: number) => void
  onChunk?: (chunk: EmbeddingPoint[]) => void
}

export function parseCSV(csvText: string): CSVData {
  // Normalize line endings
  const normalizedText = csvText.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  
  // Parse CSV properly handling multi-line quoted fields
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false
  let i = 0
  
  while (i < normalizedText.length) {
    const char = normalizedText[i]
    
    if (char === '"') {
      if (inQuotes && normalizedText[i + 1] === '"') {
        // Escaped quote
        currentField += '"'
        i += 2
        continue
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
        i++
        continue
      }
    }
    
    if (!inQuotes && char === ',') {
      // End of field
      currentRow.push(currentField.trim())
      currentField = ''
      i++
      continue
    }
    
    if (!inQuotes && char === '\n') {
      // End of row
      currentRow.push(currentField.trim())
      if (currentRow.some(field => field.length > 0)) {
        rows.push(currentRow)
      }
      currentRow = []
      currentField = ''
      i++
      continue
    }
    
    // Add character to current field
    currentField += char
    i++
  }
  
  // Add final field and row if exists
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    if (currentRow.some(field => field.length > 0)) {
      rows.push(currentRow)
    }
  }
  
  if (rows.length === 0) {
    throw new Error('No valid CSV data found')
  }
  
  const headers = rows[0].map(h => h.trim())
  const dataRows = rows.slice(1)
  
  return { headers, rows: dataRows }
}

function parseCSVLine(line: string): string[] {
  // Remove any trailing carriage return characters
  line = line.replace(/\r$/, '')
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
  console.log('Converting CSV to embeddings...')
  console.log('CSV headers:', csvData.headers)
  console.log('Total rows:', csvData.rows.length)
  console.log('X column:', xColumn, 'Y column:', yColumn, 'Text column:', textColumn)
  
  const xIndex = csvData.headers.indexOf(xColumn)
  const yIndex = csvData.headers.indexOf(yColumn)
  const textIndex = textColumn ? csvData.headers.indexOf(textColumn) : -1
  
  console.log('Column indices - X:', xIndex, 'Y:', yIndex, 'Text:', textIndex)
  
  if (xIndex === -1 || yIndex === -1) {
    throw new Error(`Required columns not found. Available headers: ${csvData.headers.join(', ')}. Looking for X: ${xColumn}, Y: ${yColumn}`)
  }
  
  // Helper function to safely get column value
  const getColumnValue = (row: string[], columnName: string, defaultValue: any = null) => {
    const index = csvData.headers.indexOf(columnName)
    return index >= 0 && index < row.length ? row[index] : defaultValue
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
  
  const validRows = csvData.rows.filter(row => row.length >= Math.max(xIndex + 1, yIndex + 1))
  console.log('Valid rows after filtering:', validRows.length)
  
  const embeddings = validRows.map((row, index) => {
    // Ensure row has enough columns
    if (row.length <= Math.max(xIndex, yIndex)) {
      console.warn(`Row ${index + 2} has insufficient columns:`, row.length, 'vs required:', Math.max(xIndex + 1, yIndex + 1))
      return null
    }
    
    const xValue = row[xIndex]
    const yValue = row[yIndex]
    const x = safeParseFloat(xValue)
    const y = safeParseFloat(yValue)
    
    if (isNaN(x) || isNaN(y)) {
      console.warn(`Row ${index + 2} has invalid coordinates: X="${xValue}" -> ${x}, Y="${yValue}" -> ${y}`)
      return null
    }
    
    // Get text content
    let textContent = `Point ${index + 1}`
    if (textIndex >= 0 && textIndex < row.length && row[textIndex]) {
      textContent = row[textIndex]
    }
    
    // Create embedding point with available data
    const point: EmbeddingPoint = {
      id: getColumnValue(row, 'id') || `imported_${index}`,
      text: textContent,
      x,
      y,
      category: getColumnValue(row, 'category') || 'Imported',
      source: getColumnValue(row, 'source') || 'csv_import',
      confidence: safeParseFloat(getColumnValue(row, 'confidence'), 0.5),
      wordCount: safeParseInt(getColumnValue(row, 'wordCount'), textContent.split(' ').length),
      sentiment: safeParseFloat(getColumnValue(row, 'sentiment'), 0),
      timestamp: getColumnValue(row, 'timestamp') || getColumnValue(row, 'first_event_date') || new Date().toISOString().split('T')[0],
      readability: safeParseFloat(getColumnValue(row, 'readability'), 5.0),
    }
    
    // Add any additional fields from CSV
    csvData.headers.forEach((header, idx) => {
      if (idx < row.length && !['id', 'text', 'x', 'y', 'category', 'source', 'confidence', 'wordCount', 'sentiment', 'timestamp', 'readability'].includes(header)) {
        (point as any)[header] = row[idx] || ''
      }
    })
    
    return point
  }).filter(point => point !== null) as EmbeddingPoint[]
  
  console.log('Successfully converted embeddings:', embeddings.length)
  if (embeddings.length > 0) {
    console.log('Sample point:', embeddings[0])
  }
  
  return embeddings
}

export function detectNumericColumns(csvData: CSVData): string[] {
  const numericColumns: string[] = []
  
  csvData.headers.forEach((header, index) => {
    // Check more rows but handle variable row lengths
    const sampleSize = Math.min(50, csvData.rows.length)
    const values = csvData.rows.slice(0, sampleSize)
      .filter(row => row.length > index)
      .map(row => row[index])
      .filter(value => value && value.trim().length > 0)
    
    if (values.length === 0) return
    
    const numericValues = values.filter(value => {
      const trimmed = value.trim()
      return !isNaN(parseFloat(trimmed)) && isFinite(parseFloat(trimmed))
    })
    
    // More strict threshold and ensure we have enough samples
    if (values.length >= 5 && numericValues.length >= values.length * 0.9) {
      numericColumns.push(header)
    }
  })
  
  console.log('Detected numeric columns:', numericColumns)
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

/**
 * Stream processing for large CSV files to prevent memory issues
 */
export async function parseCSVStreaming(
  csvText: string,
  xColumn: string,
  yColumn: string,
  textColumn?: string,
  options: StreamingCSVOptions = {}
): Promise<EmbeddingPoint[]> {
  const { chunkSize = 1000, onProgress, onChunk } = options
  
  // Parse headers first
  const csvData = parseCSV(csvText)
  const totalRows = csvData.rows.length
  
  const xIndex = csvData.headers.indexOf(xColumn)
  const yIndex = csvData.headers.indexOf(yColumn)
  const textIndex = textColumn ? csvData.headers.indexOf(textColumn) : -1
  
  if (xIndex === -1 || yIndex === -1) {
    throw new Error(`Required columns not found. Available headers: ${csvData.headers.join(', ')}`)
  }
  
  const allResults: EmbeddingPoint[] = []
  
  // Process in chunks
  for (let i = 0; i < totalRows; i += chunkSize) {
    const chunkEnd = Math.min(i + chunkSize, totalRows)
    const chunkRows = csvData.rows.slice(i, chunkEnd)
    
    const chunkData: CSVData = {
      headers: csvData.headers,
      rows: chunkRows
    }
    
    try {
      const chunkResults = convertCSVToEmbeddings(chunkData, xColumn, yColumn, textColumn)
      allResults.push(...chunkResults)
      
      if (onChunk) {
        onChunk(chunkResults)
      }
      
      if (onProgress) {
        onProgress(chunkEnd, totalRows)
      }
      
      // Allow UI to update between chunks
      await new Promise(resolve => setTimeout(resolve, 0))
    } catch (error) {
      console.warn(`Error processing chunk ${i}-${chunkEnd}:`, error)
      continue
    }
  }
  
  return allResults
}

/**
 * Optimized conversion with better memory management
 */
export function convertCSVToEmbeddingsOptimized(
  csvData: CSVData,
  xColumn: string,
  yColumn: string,
  textColumn?: string
): EmbeddingPoint[] {
  console.log('Converting CSV to embeddings (optimized)...')
  
  const xIndex = csvData.headers.indexOf(xColumn)
  const yIndex = csvData.headers.indexOf(yColumn)
  const textIndex = textColumn ? csvData.headers.indexOf(textColumn) : -1
  
  if (xIndex === -1 || yIndex === -1) {
    throw new Error(`Required columns not found. Available headers: ${csvData.headers.join(', ')}`)
  }
  
  // Pre-allocate array for better performance
  const embeddings: EmbeddingPoint[] = new Array(csvData.rows.length)
  let validCount = 0
  
  for (let i = 0; i < csvData.rows.length; i++) {
    const row = csvData.rows[i]
    
    if (row.length <= Math.max(xIndex, yIndex)) {
      continue
    }
    
    const xValue = row[xIndex]
    const yValue = row[yIndex]
    const x = parseFloat(xValue)
    const y = parseFloat(yValue)
    
    if (isNaN(x) || isNaN(y)) {
      continue
    }
    
    // Get text content
    let textContent = `Point ${validCount + 1}`
    if (textIndex >= 0 && textIndex < row.length && row[textIndex]) {
      textContent = row[textIndex]
    }
    
    // Create embedding point efficiently
    embeddings[validCount] = {
      id: row[csvData.headers.indexOf('id')] || `imported_${validCount}`,
      text: textContent,
      x,
      y,
      category: row[csvData.headers.indexOf('category')] || 'Imported',
      source: row[csvData.headers.indexOf('source')] || 'csv_import',
      confidence: parseFloat(row[csvData.headers.indexOf('confidence')]) || 0.5,
      wordCount: parseInt(row[csvData.headers.indexOf('wordCount')]) || textContent.split(' ').length,
      sentiment: parseFloat(row[csvData.headers.indexOf('sentiment')]) || 0,
      timestamp: row[csvData.headers.indexOf('timestamp')] || row[csvData.headers.indexOf('first_event_date')] || new Date().toISOString().split('T')[0],
      readability: parseFloat(row[csvData.headers.indexOf('readability')]) || 5.0,
    }
    
    // Add additional fields efficiently
    for (let j = 0; j < csvData.headers.length && j < row.length; j++) {
      const header = csvData.headers[j]
      if (!['id', 'text', 'x', 'y', 'category', 'source', 'confidence', 'wordCount', 'sentiment', 'timestamp', 'readability'].includes(header)) {
        (embeddings[validCount] as any)[header] = row[j] || ''
      }
    }
    
    validCount++
  }
  
  // Trim array to actual size
  embeddings.length = validCount
  
  console.log('Successfully converted embeddings (optimized):', validCount)
  return embeddings
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