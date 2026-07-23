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

const { explainMedicine } = await vi.importActual('../controllers/medicineController.js')

function mockReq({ body = {} } = {}) {
  return { body }
}

function mockRes() {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('explainMedicine controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockDrug = {
    brandName: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    activeIngredient: 'Aspirin 325mg',
    purpose: 'Pain reliever and fever reducer',
    dosage: 'Take with a full glass of water',
    warnings: ['Stomach bleeding risk', 'Reye syndrome'],
    sideEffects: ['Nausea', 'Heartburn'],
    storage: 'Store at room temperature',
  }

  const mockAiResponse = `Uses
Aspirin is used to relieve pain and reduce fever.

Warnings
Do not take aspirin if you have a history of stomach ulcers or bleeding problems.

Side Effects
Common side effects include nausea, heartburn, and stomach upset.

Storage
Store at room temperature away from moisture and heat.

When to Contact a Healthcare Professional
Contact your doctor immediately if you experience severe stomach pain, vomiting blood, or black stools.

This information is for educational purposes only. It does not constitute medical advice. Always consult your doctor or pharmacist before taking any medicine. Read the full patient information leaflet provided with your medicine.`

  it('returns a structured explanation with all sections', async () => {
    mockGenerateCompletion.mockResolvedValueOnce(mockAiResponse)

    const req = mockReq({ body: { drug: mockDrug } })
    const res = mockRes()

    await explainMedicine(req, res, vi.fn())

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        brandName: 'Aspirin',
        genericName: 'Acetylsalicylic Acid',
        explanation: expect.objectContaining({
          uses: expect.any(String),
          warnings: expect.any(String),
          sideEffects: expect.any(String),
          storage: expect.any(String),
          contactHcp: expect.any(String),
        }),
        disclaimer: expect.stringContaining('educational purposes'),
        raw: mockAiResponse,
      }),
    )
  })

  it('passes drug data to buildExplainPrompt via generateCompletion', async () => {
    mockGenerateCompletion.mockResolvedValueOnce(mockAiResponse)

    const req = mockReq({ body: { drug: mockDrug } })
    const res = mockRes()

    await explainMedicine(req, res, vi.fn())

    const [systemPrompt, userPrompt] = mockGenerateCompletion.mock.calls[0]
    expect(systemPrompt).toContain('medicine information assistant')
    expect(userPrompt).toContain('Medicine name: Aspirin')
    expect(userPrompt).toContain('Purpose/uses: Pain reliever')
  })

  it('returns 400 if drug data is missing', async () => {
    const req = mockReq({ body: {} })
    const res = mockRes()

    await explainMedicine(req, res, vi.fn())

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('Drug data is required'),
        explanation: null,
      }),
    )
  })

  it('returns 400 if drug is not an object', async () => {
    const req = mockReq({ body: { drug: 'not-an-object' } })
    const res = mockRes()

    await explainMedicine(req, res, vi.fn())

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 400 if brandName is missing', async () => {
    const req = mockReq({ body: { drug: { genericName: 'Something' } } })
    const res = mockRes()

    await explainMedicine(req, res, vi.fn())

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('brandName'),
        explanation: null,
      }),
    )
  })

  it('returns 400 if drug is null', async () => {
    const req = mockReq({ body: { drug: null } })
    const res = mockRes()

    await explainMedicine(req, res, vi.fn())

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('handles OpenAIError from the AI service', async () => {
    const { OpenAIError } = await import('../services/openai.js')
    mockGenerateCompletion.mockRejectedValueOnce(
      new OpenAIError('AI service busy', 503),
    )

    const req = mockReq({ body: { drug: mockDrug } })
    const res = mockRes()

    await explainMedicine(req, res, vi.fn())

    expect(res.status).toHaveBeenCalledWith(503)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'AI service busy',
        explanation: null,
      }),
    )
  })

  it('passes unexpected errors to next()', async () => {
    const unexpected = new Error('Crash')
    mockGenerateCompletion.mockRejectedValueOnce(unexpected)

    const req = mockReq({ body: { drug: mockDrug } })
    const res = mockRes()
    const next = vi.fn()

    await explainMedicine(req, res, next)

    expect(next).toHaveBeenCalledWith(unexpected)
  })
})
