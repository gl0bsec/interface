import type { LLMSettings, EmbeddingPoint } from "@/types/embedding"

export interface LLMResponse {
  success: boolean
  content?: string
  error?: string
  tokensUsed?: number
  cost?: number
}

export async function sendToLLM(
  prompt: string,
  selectedPoints: EmbeddingPoint[],
  settings: LLMSettings,
  apiFields: string[]
): Promise<LLMResponse> {
  try {
    // Validate inputs
    if (!prompt.trim()) {
      throw new Error('Prompt cannot be empty')
    }
    
    if (selectedPoints.length === 0) {
      throw new Error('No data points selected')
    }
    
    if (!settings.apiKey) {
      throw new Error('API key is required')
    }
    
    if (!settings.endpoint) {
      throw new Error('API endpoint is required')
    }
    
    // Validate endpoint format
    try {
      new URL(settings.endpoint)
    } catch {
      throw new Error('Invalid API endpoint URL format')
    }

    // Format the data for the LLM
    const dataToSend = selectedPoints.map((point, index) => {
      const filteredPoint: Record<string, unknown> = { index: index + 1 }
      apiFields.forEach(field => {
        if (field in point) {
          filteredPoint[field] = point[field as keyof EmbeddingPoint]
        }
      })
      return filteredPoint
    })

    const systemMessage = `You are an expert data analyst specializing in text embeddings and natural language processing. Analyze the provided embedding data points and respond to the user's prompt with clear, actionable insights. The data contains text embeddings with associated metadata including categories, sources, confidence scores, and sentiment analysis.`
    
    const userMessage = `${prompt}

Data to analyze (${selectedPoints.length} points):
${JSON.stringify(dataToSend, null, 2)}`

    // Detect if this is a Claude API vs OpenAI API
    const isClaudeAPI = settings.endpoint.includes('anthropic') || 
                       settings.endpoint.includes('claude') ||
                       settings.model.includes('claude')
    
    const requestBody = isClaudeAPI ? {
      model: settings.model,
      max_tokens: settings.maxTokens,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7
    } : {
      model: settings.model,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      max_tokens: settings.maxTokens,
      temperature: 0.7
    }

    // Set up headers based on API provider
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (isClaudeAPI) {
      headers['x-api-key'] = settings.apiKey
      headers['anthropic-version'] = '2023-06-01'
    } else {
      headers['Authorization'] = `Bearer ${settings.apiKey}`
    }

    const response = await fetch(settings.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || 
                          errorData.detail || 
                          errorData.message ||
                          `HTTP ${response.status}: ${response.statusText}`
      throw new Error(errorMessage)
    }

    const data = await response.json()
    
    // Handle different API response formats
    let content: string
    let tokensUsed: number
    
    if (isClaudeAPI) {
      // Claude API format
      if (!data.content || !data.content[0]) {
        throw new Error('Invalid response format from Claude API')
      }
      content = data.content[0].text
      tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens || 0
    } else {
      // OpenAI API format
      if (!data.choices || !data.choices[0]) {
        throw new Error('Invalid response format from OpenAI API')
      }
      content = data.choices[0].message?.content || data.choices[0].text
      tokensUsed = data.usage?.total_tokens || 0
    }

    return {
      success: true,
      content,
      tokensUsed,
      cost: calculateCost(tokensUsed, settings.model)
    }
  } catch (error) {
    console.error('LLM API Error:', error)
    
    let errorMessage = 'Unknown error occurred'
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Provide more user-friendly error messages
      if (errorMessage.includes('401')) {
        errorMessage = 'Invalid API key. Please check your credentials in settings.'
      } else if (errorMessage.includes('403')) {
        errorMessage = 'Access forbidden. Please check your API key permissions.'
      } else if (errorMessage.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please try again later.'
      } else if (errorMessage.includes('500')) {
        errorMessage = 'Server error. Please try again later.'
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.'
      }
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

function calculateCost(tokens: number, model: string): number {
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
  
  const pricePerK = prices[model] || 0.002
  return (tokens / 1000) * pricePerK
}