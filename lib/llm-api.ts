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
    // Format the data for the LLM
    const dataToSend = selectedPoints.map(point => {
      const filteredPoint: any = {}
      apiFields.forEach(field => {
        if (field in point) {
          filteredPoint[field] = point[field as keyof EmbeddingPoint]
        }
      })
      return filteredPoint
    })

    const systemMessage = `You are an expert data analyst. Analyze the provided embedding data points and respond to the user's prompt. The data contains text embeddings with associated metadata.`
    
    const userMessage = `${prompt}

Data to analyze:
${JSON.stringify(dataToSend, null, 2)}`

    const requestBody = {
      model: settings.model,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      max_tokens: settings.maxTokens,
      temperature: 0.7
    }

    const response = await fetch(settings.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response format from LLM API')
    }

    const content = data.choices[0].message?.content || data.choices[0].text
    const tokensUsed = data.usage?.total_tokens || 0

    return {
      success: true,
      content,
      tokensUsed,
      cost: calculateCost(tokensUsed, settings.model)
    }
  } catch (error) {
    console.error('LLM API Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

function calculateCost(tokens: number, model: string): number {
  const prices: Record<string, number> = {
    'gpt-3.5-turbo': 0.002,
    'gpt-4': 0.03,
    'gpt-4-turbo-preview': 0.01,
    'gpt-4o': 0.005,
    'claude-3-sonnet': 0.003,
    'claude-3-opus': 0.015
  }
  
  const pricePerK = prices[model] || 0.002
  return (tokens / 1000) * pricePerK
}