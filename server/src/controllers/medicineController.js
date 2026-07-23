import { searchDrug, OpenFDAError } from '../services/openfda.js'
import { generateCompletion, OpenAIError } from '../services/openai.js'
import {
  SYSTEM_PROMPT,
  buildExplainPrompt,
  parseExplanation,
} from '../services/prompts.js'
import { sanitizeObject } from '../middleware/sanitize.js'

const EXPLAIN_ALLOWED_KEYS = [
  'brandName',
  'genericName',
  'activeIngredient',
  'purpose',
  'dosage',
  'warnings',
  'sideEffects',
  'storage',
]

export async function searchMedicine(req, res, next) {
  try {
    const { q } = req.query

    if (!q || !q.trim()) {
      return res.status(400).json({
        error: 'A search query is required. Use ?q= to search for a medicine.',
        results: [],
        notFound: true,
      })
    }

    if (q.length > 200) {
      return res.status(400).json({
        error: 'Search query is too long. Please limit to 200 characters.',
        results: [],
        notFound: true,
      })
    }

    const query = q.trim()
    const data = await searchDrug(query)

    res.json({
      query,
      results: data.results,
      count: data.results.length,
      notFound: data.notFound,
    })
  } catch (err) {
    if (err instanceof OpenFDAError) {
      return res.status(err.status).json({
        error: err.message,
        results: [],
        notFound: true,
      })
    }
    next(err)
  }
}

export async function explainMedicine(req, res, next) {
  try {
    const { drug } = req.body

    if (!drug || typeof drug !== 'object') {
      return res.status(400).json({
        error: 'Drug data is required in the request body.',
        explanation: null,
      })
    }

    if (!drug.brandName) {
      return res.status(400).json({
        error: 'Drug data must include at least a brandName field.',
        explanation: null,
      })
    }

    const cleanDrug = sanitizeObject(drug, EXPLAIN_ALLOWED_KEYS)

    if (!cleanDrug.brandName) {
      return res.status(400).json({
        error: 'Drug data must include at least a brandName field.',
        explanation: null,
      })
    }

    const userPrompt = buildExplainPrompt(cleanDrug)
    const aiResponse = await generateCompletion(SYSTEM_PROMPT, userPrompt)
    const parsed = parseExplanation(aiResponse)

    res.json({
      brandName: cleanDrug.brandName,
      genericName: cleanDrug.genericName || '',
      explanation: parsed.sections,
      disclaimer: parsed.disclaimer,
      raw: parsed.raw,
    })
  } catch (err) {
    if (err instanceof OpenAIError) {
      return res.status(err.status).json({
        error: err.message,
        explanation: null,
      })
    }
    next(err)
  }
}
