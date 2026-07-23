import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSearchDrug = vi.fn()
const mockGenerateCompletion = vi.fn()

vi.mock('../services/openfda.js', () => ({
  searchDrug: mockSearchDrug,
  OpenFDAError: class extends Error {
    constructor(message, status) {
      super(message)
      this.status = status
    }
  },
}))

vi.mock('../services/openai.js', () => ({
  generateCompletion: mockGenerateCompletion,
  OpenAIError: class extends Error {
    constructor(message, status) {
      super(message)
      this.status = status
    }
  },
}))

const { checkInteractions } = await vi.importActual(
  '../controllers/interactionController.js',
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

function mockDrugResult(brandName, genericName, overrides = {}) {
  return {
    results: [
      {
        brandName,
        genericName,
        activeIngredient: `${brandName} 100mg`,
        purpose: 'Pain reliever',
        dosage: 'Take as directed',
        warnings: ['Warning 1', 'Warning 2'],
        sideEffects: ['Nausea', 'Headache'],
        ...overrides,
      },
    ],
    notFound: false,
  }
}

const mockAiResponse = `Safety Summary
Based on available medicine information, both medicines are NSAIDs.

Potential Concerns
Taking them together may increase the risk of stomach bleeding.

Professional Advice
Consult your doctor before combining these medicines.

This information is for educational purposes only. It does not constitute medical advice. Always consult your doctor or pharmacist before combining any medicines.`

describe('interactionController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/medicine/interactions', () => {
    it('returns interaction result for two valid medicines', async () => {
      mockSearchDrug
        .mockResolvedValueOnce(mockDrugResult('Aspirin', 'ASA'))
        .mockResolvedValueOnce(mockDrugResult('Ibuprofen', 'Ibuprofen'))
      mockGenerateCompletion.mockResolvedValueOnce(mockAiResponse)

      const req = mockReq({ body: { drugA: 'Aspirin', drugB: 'Ibuprofen' } })
      const res = mockRes()

      await checkInteractions(req, res, vi.fn())

      const call = res.json.mock.calls[0][0]

      expect(call.drugA.brandName).toBe('Aspirin')
      expect(call.drugB.brandName).toBe('Ibuprofen')
      expect(call.found).toBe(true)
      expect(call.result).toHaveProperty('safetySummary')
      expect(call.result).toHaveProperty('potentialConcerns')
      expect(call.result).toHaveProperty('professionalAdvice')
      expect(call.disclaimer).toContain('educational purposes')
      expect(call.raw).toBe(mockAiResponse)
    })

    it('searches both drugs in parallel', async () => {
      mockSearchDrug
        .mockResolvedValueOnce(mockDrugResult('Aspirin', 'ASA'))
        .mockResolvedValueOnce(mockDrugResult('Ibuprofen', 'Ibuprofen'))
      mockGenerateCompletion.mockResolvedValueOnce(mockAiResponse)

      const req = mockReq({ body: { drugA: 'Aspirin', drugB: 'Ibuprofen' } })
      const res = mockRes()

      await checkInteractions(req, res, vi.fn())

      expect(mockSearchDrug).toHaveBeenCalledTimes(2)
      expect(mockSearchDrug).toHaveBeenCalledWith('Aspirin')
      expect(mockSearchDrug).toHaveBeenCalledWith('Ibuprofen')
    })

    it('trims whitespace from drug names', async () => {
      mockSearchDrug
        .mockResolvedValueOnce(mockDrugResult('Aspirin', 'ASA'))
        .mockResolvedValueOnce(mockDrugResult('Ibuprofen', 'Ibuprofen'))
      mockGenerateCompletion.mockResolvedValueOnce(mockAiResponse)

      const req = mockReq({ body: { drugA: '  Aspirin  ', drugB: '  Ibuprofen  ' } })
      const res = mockRes()

      await checkInteractions(req, res, vi.fn())

      expect(mockSearchDrug).toHaveBeenCalledWith('Aspirin')
      expect(mockSearchDrug).toHaveBeenCalledWith('Ibuprofen')
    })

    it('passes the interaction system prompt to OpenAI', async () => {
      mockSearchDrug
        .mockResolvedValueOnce(mockDrugResult('Aspirin', 'ASA'))
        .mockResolvedValueOnce(mockDrugResult('Ibuprofen', 'Ibuprofen'))
      mockGenerateCompletion.mockResolvedValueOnce(mockAiResponse)

      const req = mockReq({ body: { drugA: 'Aspirin', drugB: 'Ibuprofen' } })
      const res = mockRes()

      await checkInteractions(req, res, vi.fn())

      const [systemPrompt, userPrompt] = mockGenerateCompletion.mock.calls[0]
      expect(systemPrompt).toContain('medicine safety information assistant')
      expect(systemPrompt).toContain('FORBIDDEN')
      expect(userPrompt).toContain('MEDICINE A')
      expect(userPrompt).toContain('MEDICINE B')
    })

    it('returns 400 if drugA is missing', async () => {
      const req = mockReq({ body: { drugB: 'Aspirin' } })
      const res = mockRes()

      await checkInteractions(req, res, vi.fn())

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('drugA'),
          result: null,
        }),
      )
    })

    it('returns 400 if drugB is missing', async () => {
      const req = mockReq({ body: { drugA: 'Aspirin' } })
      const res = mockRes()

      await checkInteractions(req, res, vi.fn())

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 400 if drug names are empty after trimming', async () => {
      const req = mockReq({ body: { drugA: '   ', drugB: 'Ibuprofen' } })
      const res = mockRes()

      await checkInteractions(req, res, vi.fn())

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 400 if drugA is not a string', async () => {
      const req = mockReq({ body: { drugA: 123, drugB: 'Ibuprofen' } })
      const res = mockRes()

      await checkInteractions(req, res, vi.fn())

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns 400 for same drug entered twice', async () => {
      const req = mockReq({ body: { drugA: 'Aspirin', drugB: 'aspirin' } })
      const res = mockRes()

      await checkInteractions(req, res, vi.fn())

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('different'),
        }),
      )
    })

    it('returns 400 for drug names exceeding 200 characters', async () => {
      const long = 'a'.repeat(201)
      const req = mockReq({ body: { drugA: 'Aspirin', drugB: long } })
      const res = mockRes()

      await checkInteractions(req, res, vi.fn())

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('returns found:false when one drug is not found', async () => {
      mockSearchDrug
        .mockResolvedValueOnce(mockDrugResult('Aspirin', 'ASA'))
        .mockResolvedValueOnce({ results: [], notFound: true })

      const req = mockReq({ body: { drugA: 'Aspirin', drugB: 'UnknownDrug' } })
      const res = mockRes()

      await checkInteractions(req, res, vi.fn())

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          found: false,
          missing: ['UnknownDrug'],
          result: null,
        }),
      )
    })

    it('returns found:false with both drugs in missing array', async () => {
      mockSearchDrug
        .mockResolvedValueOnce({ results: [], notFound: true })
        .mockResolvedValueOnce({ results: [], notFound: true })

      const req = mockReq({ body: { drugA: 'FakeA', drugB: 'FakeB' } })
      const res = mockRes()

      await checkInteractions(req, res, vi.fn())

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          found: false,
          missing: ['FakeA', 'FakeB'],
          result: null,
        }),
      )
    })

    it('handles OpenAIError', async () => {
      mockSearchDrug
        .mockResolvedValueOnce(mockDrugResult('A', 'a'))
        .mockResolvedValueOnce(mockDrugResult('B', 'b'))
      const { OpenAIError } = await import('../services/openai.js')
      mockGenerateCompletion.mockRejectedValueOnce(
        new OpenAIError('AI busy', 503),
      )

      const req = mockReq({ body: { drugA: 'A', drugB: 'B' } })
      const res = mockRes()

      await checkInteractions(req, res, vi.fn())

      expect(res.status).toHaveBeenCalledWith(503)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'AI busy',
          result: null,
        }),
      )
    })

    it('handles OpenFDAError', async () => {
      const { OpenFDAError } = await import('../services/openfda.js')
      mockSearchDrug.mockRejectedValueOnce(new OpenFDAError('API down', 502))

      const req = mockReq({ body: { drugA: 'A', drugB: 'B' } })
      const res = mockRes()

      await checkInteractions(req, res, vi.fn())

      expect(res.status).toHaveBeenCalledWith(502)
    })

    it('passes unexpected errors to next()', async () => {
      mockSearchDrug.mockRejectedValueOnce(new Error('Crash'))

      const req = mockReq({ body: { drugA: 'A', drugB: 'B' } })
      const res = mockRes()
      const next = vi.fn()

      await checkInteractions(req, res, next)

      expect(next).toHaveBeenCalled()
    })
  })
})
