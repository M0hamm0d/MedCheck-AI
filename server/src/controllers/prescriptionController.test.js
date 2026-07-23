import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGenerateCompletion = vi.fn()

vi.mock('../services/openai.js', () => ({
  generateCompletion: mockGenerateCompletion,
  OpenAIError: class extends Error {
    constructor(message, status) {
      super(message)
      this.status = status
    }
  },
}))

const { explainPrescription } = await vi.importActual(
  '../controllers/prescriptionController.js',
)

function mockReq({ body = {} } = {}) {
  return { body }
}

function mockRes() {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

const mockAiResponse = `How Often (Frequency)
Take one tablet three times a day — morning, afternoon, and evening.

How Long (Duration)
Take for 7 days.

How to Store
Information not provided in the prescription.

Warnings
Information not provided in the prescription.

Always follow your doctor's or pharmacist's exact instructions. This explanation is for educational purposes only and does not replace professional medical guidance.`

describe('prescriptionController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/medicine/prescription', () => {
    it('returns structured explanation for valid prescription text', async () => {
      mockGenerateCompletion.mockResolvedValueOnce(mockAiResponse)

      const req = mockReq({ body: { text: 'Amoxicillin 500mg, 1 tablet, Three times daily, 7 days' } })
      const res = mockRes()

      await explainPrescription(req, res, vi.fn())

      const call = res.json.mock.calls[0][0]

      expect(call.original).toContain('Amoxicillin')
      expect(call.sections).toHaveProperty('frequency')
      expect(call.sections).toHaveProperty('duration')
      expect(call.disclaimer).toContain('Always follow your doctor')
      expect(call.uninterpretable).toBe(false)
      expect(call.raw).toBe(mockAiResponse)
    })

    it('trims whitespace from input', async () => {
      mockGenerateCompletion.mockResolvedValueOnce(mockAiResponse)

      const req = mockReq({ body: { text: '  1 tablet daily  ' } })
      const res = mockRes()

      await explainPrescription(req, res, vi.fn())

      expect(mockGenerateCompletion).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('1 tablet daily'),
      )
    })

    it('uses the prescription system prompt', async () => {
      mockGenerateCompletion.mockResolvedValueOnce(mockAiResponse)

      const req = mockReq({ body: { text: '1 tablet daily' } })
      const res = mockRes()

      await explainPrescription(req, res, vi.fn())

      const [systemPrompt] = mockGenerateCompletion.mock.calls[0]
      expect(systemPrompt).toContain('prescription instruction explainer')
      expect(systemPrompt).toContain('Unable to interpret')
    })

    it('returns 400 for missing text', async () => {
      const req = mockReq({ body: {} })
      const res = mockRes()

      await explainPrescription(req, res, vi.fn())

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 400 for empty text', async () => {
      const req = mockReq({ body: { text: '' } })
      const res = mockRes()

      await explainPrescription(req, res, vi.fn())

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 400 for whitespace-only text', async () => {
      const req = mockReq({ body: { text: '   ' } })
      const res = mockRes()

      await explainPrescription(req, res, vi.fn())

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 400 for text that is not a string', async () => {
      const req = mockReq({ body: { text: 12345 } })
      const res = mockRes()

      await explainPrescription(req, res, vi.fn())

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 400 for text too short (< 3 chars)', async () => {
      const req = mockReq({ body: { text: 'ab' } })
      const res = mockRes()

      await explainPrescription(req, res, vi.fn())

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('too short'),
        }),
      )
    })

    it('returns 400 for text exceeding 1000 characters', async () => {
      const req = mockReq({ body: { text: 'a'.repeat(1001) } })
      const res = mockRes()

      await explainPrescription(req, res, vi.fn())

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('handles OpenAIError', async () => {
      const { OpenAIError } = await import('../services/openai.js')
      mockGenerateCompletion.mockRejectedValueOnce(
        new OpenAIError('AI busy', 503),
      )

      const req = mockReq({ body: { text: '1 tablet' } })
      const res = mockRes()

      await explainPrescription(req, res, vi.fn())

      expect(res.status).toHaveBeenCalledWith(503)
    })

    it('passes unexpected errors to next()', async () => {
      mockGenerateCompletion.mockRejectedValueOnce(new Error('Crash'))

      const req = mockReq({ body: { text: '1 tablet' } })
      const res = mockRes()
      const next = vi.fn()

      await explainPrescription(req, res, next)

      expect(next).toHaveBeenCalled()
    })
  })
})
