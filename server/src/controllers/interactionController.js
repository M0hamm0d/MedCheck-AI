import { searchDrug, OpenFDAError } from '../services/openfda.js'
import { generateCompletion, OpenAIError } from '../services/openai.js'
import {
  INTERACTION_SYSTEM_PROMPT,
  buildInteractionPrompt,
  parseInteractionResponse,
} from '../services/prompts.js'

export async function checkInteractions(req, res, next) {
  try {
    const { drugA, drugB } = req.body

    if (!drugA || !drugB || typeof drugA !== 'string' || typeof drugB !== 'string') {
      return res.status(400).json({
        error: 'Both drugA and drugB are required as medicine names.',
        result: null,
      })
    }

    const trimmedA = drugA.trim()
    const trimmedB = drugB.trim()

    if (!trimmedA || !trimmedB) {
      return res.status(400).json({
        error: 'Medicine names cannot be empty.',
        result: null,
      })
    }

    if (trimmedA.length > 200 || trimmedB.length > 200) {
      return res.status(400).json({
        error: 'Medicine names must be under 200 characters each.',
        result: null,
      })
    }

    if (trimmedA.toLowerCase() === trimmedB.toLowerCase()) {
      return res.status(400).json({
        error: 'Please provide two different medicines to check for interactions.',
        result: null,
      })
    }

    const [resultA, resultB] = await Promise.all([
      searchDrug(trimmedA),
      searchDrug(trimmedB),
    ])

    if (resultA.notFound || resultB.notFound) {
      const missing = []
      if (resultA.notFound) missing.push(trimmedA)
      if (resultB.notFound) missing.push(trimmedB)
      return res.status(200).json({
        drugA: trimmedA,
        drugB: trimmedB,
        found: false,
        missing,
        result: null,
      })
    }

    const drugAData = resultA.results[0]
    const drugBData = resultB.results[0]

    const userPrompt = buildInteractionPrompt(drugAData, drugBData)
    const aiResponse = await generateCompletion(INTERACTION_SYSTEM_PROMPT, userPrompt)
    const parsed = parseInteractionResponse(aiResponse)

    res.json({
      drugA: {
        brandName: drugAData.brandName,
        genericName: drugAData.genericName,
      },
      drugB: {
        brandName: drugBData.brandName,
        genericName: drugBData.genericName,
      },
      found: true,
      result: parsed.sections,
      disclaimer: parsed.disclaimer,
      raw: parsed.raw,
    })
  } catch (err) {
    if (err instanceof OpenAIError) {
      return res.status(err.status).json({
        error: err.message,
        result: null,
      })
    }
    if (err instanceof OpenFDAError) {
      return res.status(err.status).json({
        error: err.message,
        result: null,
      })
    }
    next(err)
  }
}
