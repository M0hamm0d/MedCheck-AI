import { generateCompletion, OpenAIError } from '../services/openai.js'
import {
  PRESCRIPTION_SYSTEM_PROMPT,
  buildPrescriptionPrompt,
  parsePrescriptionResponse,
} from '../services/prompts.js'

export async function explainPrescription(req, res, next) {
  try {
    const { text } = req.body

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        error: 'Prescription text is required.',
        result: null,
      })
    }

    const trimmed = text.trim()

    if (trimmed.length < 3) {
      return res.status(400).json({
        error: 'Prescription text is too short. Please provide more details.',
        result: null,
      })
    }

    if (trimmed.length > 1000) {
      return res.status(400).json({
        error: 'Prescription text is too long. Please limit to 1000 characters.',
        result: null,
      })
    }

    const userPrompt = buildPrescriptionPrompt(trimmed)
    const aiResponse = await generateCompletion(PRESCRIPTION_SYSTEM_PROMPT, userPrompt)
    const parsed = parsePrescriptionResponse(aiResponse)

    res.json({
      original: trimmed,
      ...parsed,
    })
  } catch (err) {
    if (err instanceof OpenAIError) {
      return res.status(err.status).json({
        error: err.message,
        result: null,
      })
    }
    next(err)
  }
}
