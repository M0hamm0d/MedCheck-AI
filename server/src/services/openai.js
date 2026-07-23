import OpenAI from 'openai'
import { openaiKey, demoMode } from '../config/index.js'
import { getMockExplanation, getMockInteraction, getMockPrescription } from './demoData.js'

const MODEL = 'gpt-4o-mini'
const MAX_TOKENS = 800
const TEMPERATURE = 0.2
const REQUEST_TIMEOUT = 25000

export class OpenAIError extends Error {
  constructor(message, status = 502) {
    super(message)
    this.name = 'OpenAIError'
    this.status = status
  }
}

function getClient() {
  if (!openaiKey) {
    throw new OpenAIError('OpenAI API key is not configured', 500)
  }
  return new OpenAI({ apiKey: openaiKey, timeout: REQUEST_TIMEOUT })
}

function parseExplainFields(userPrompt) {
  const drug = {}
  const patterns = {
    brandName: /Medicine name:\s*(.+)/,
    genericName: /Generic name:\s*(.+)/,
    activeIngredient: /Active ingredient:\s*(.+)/,
    purpose: /Purpose\/uses:\s*(.+)/,
    dosage: /Dosage instructions:\s*(.+)/,
    storage: /Storage:\s*(.+)/,
  }

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = userPrompt.match(pattern)
    if (match) drug[key] = match[1].trim()
  }

  const warningsMatch = userPrompt.match(/Warnings:\s*(.+)/)
  if (warningsMatch) {
    drug.warnings = warningsMatch[1].split('|').map((s) => s.trim()).filter(Boolean)
  }

  const sideEffectsMatch = userPrompt.match(/Side effects:\s*(.+)/)
  if (sideEffectsMatch) {
    drug.sideEffects = sideEffectsMatch[1].split('|').map((s) => s.trim()).filter(Boolean)
  }

  return drug
}

function getDemoResponse(userPrompt) {
  if (userPrompt.includes('MEDICINE A') && userPrompt.includes('MEDICINE B')) {
    const matchA = userPrompt.match(/MEDICINE A:\s*(.+)/)
    const matchB = userPrompt.match(/MEDICINE B:\s*(.+)/)
    return getMockInteraction(
      { brandName: matchA?.[1]?.trim() || 'Medicine A' },
      { brandName: matchB?.[1]?.trim() || 'Medicine B' },
    )
  }

  if (userPrompt.includes('PRESCRIPTION TEXT:')) {
    const match = userPrompt.match(/PRESCRIPTION TEXT:\s*\n?([\s\S]*)/)
    return getMockPrescription(match?.[1]?.trim() || '')
  }

  if (userPrompt.includes('Medicine name:') || userPrompt.includes('DRUG DATA')) {
    const drug = parseExplainFields(userPrompt)
    return getMockExplanation(drug)
  }

  return 'Demo mode is active. This is a placeholder response.'
}

export async function generateCompletion(systemPrompt, userPrompt) {
  if (!systemPrompt || typeof systemPrompt !== 'string') {
    throw new OpenAIError('System prompt is required', 500)
  }

  if (!userPrompt || typeof userPrompt !== 'string') {
    throw new OpenAIError('Content to explain is required', 400)
  }

  if (demoMode) {
    return getDemoResponse(userPrompt)
  }

  const openai = getClient()

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
    })

    const content = completion.choices?.[0]?.message?.content

    if (!content || !content.trim()) {
      throw new OpenAIError('Received an empty response from the AI service', 502)
    }

    return content.trim()
  } catch (error) {
    if (error instanceof OpenAIError) {
      throw error
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED' || error.type === 'request_timeout') {
      throw new OpenAIError('The AI service took too long to respond. Please try again.', 504)
    }

    if (error.status === 401) {
      throw new OpenAIError('AI service authentication failed. Please check the API key.', 500)
    }

    if (error.status === 429) {
      throw new OpenAIError(
        'AI service is busy. Please wait a moment and try again.',
        503,
      )
    }

    if (error.status >= 500) {
      throw new OpenAIError('The AI service is experiencing issues. Please try again later.', 502)
    }

    if (error.status === 400 && error.message?.includes('content_filter')) {
      throw new OpenAIError(
        'The request was blocked by safety filters. Please try different wording.',
        400,
      )
    }

    throw new OpenAIError(
      `AI service error: ${error.message || 'Unknown error'}`,
      502,
    )
  }
}
