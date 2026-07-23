import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../config/index.js', () => ({
  openaiKey: 'test-key',
  demoMode: false,
}))

vi.mock('./demoData.js', () => ({
  getMockExplanation: vi.fn(),
  getMockInteraction: vi.fn(),
  getMockPrescription: vi.fn(),
}))

const mockCreate = vi.fn()

vi.mock('openai', () => ({
  default: class {
    constructor() {
      this.chat = { completions: { create: mockCreate } }
    }
  },
}))

const { generateCompletion, OpenAIError } = await vi.importActual('../services/openai.js')

describe('openai service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateCompletion', () => {
    it('returns trimmed content on success', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: '  Explained text.  ' } }],
      })

      const result = await generateCompletion('System prompt', 'User prompt')

      expect(result).toBe('Explained text.')
    })

    it('passes the correct parameters to OpenAI', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'OK' } }],
      })

      await generateCompletion('System', 'User')

      const callArgs = mockCreate.mock.calls[0][0]
      expect(callArgs.model).toBe('gpt-4o-mini')
      expect(callArgs.messages).toHaveLength(2)
      expect(callArgs.messages[0]).toEqual({ role: 'system', content: 'System' })
      expect(callArgs.messages[1]).toEqual({ role: 'user', content: 'User' })
      expect(callArgs.temperature).toBe(0.2)
      expect(callArgs.max_tokens).toBe(800)
    })

    it('throws if system prompt is missing', async () => {
      await expect(generateCompletion('', 'User')).rejects.toThrow(OpenAIError)
      await expect(generateCompletion(null, 'User')).rejects.toThrow(OpenAIError)
    })

    it('throws if user prompt is missing', async () => {
      await expect(generateCompletion('System', '')).rejects.toThrow(OpenAIError)
      await expect(generateCompletion('System', null)).rejects.toThrow(OpenAIError)
    })

    it('throws if response content is empty', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: '' } }],
      })

      await expect(generateCompletion('System', 'User')).rejects.toMatchObject({
        message: expect.stringContaining('empty response'),
      })
    })

    it('throws if no choices returned', async () => {
      mockCreate.mockResolvedValueOnce({ choices: [] })

      await expect(generateCompletion('System', 'User')).rejects.toMatchObject({
        message: expect.stringContaining('empty response'),
      })
    })

    it('throws for 401 authentication errors', async () => {
      const error = new Error('Unauthorized')
      error.status = 401
      mockCreate.mockRejectedValueOnce(error)

      await expect(generateCompletion('S', 'U')).rejects.toMatchObject({
        status: 500,
        message: expect.stringContaining('authentication failed'),
      })
    })

    it('throws for 429 rate limit errors', async () => {
      const error = new Error('Rate limited')
      error.status = 429
      mockCreate.mockRejectedValueOnce(error)

      await expect(generateCompletion('S', 'U')).rejects.toMatchObject({
        status: 503,
        message: expect.stringContaining('busy'),
      })
    })

    it('throws for 5xx server errors', async () => {
      const error = new Error('Server error')
      error.status = 500
      mockCreate.mockRejectedValueOnce(error)

      await expect(generateCompletion('S', 'U')).rejects.toMatchObject({
        status: 502,
      })
    })

    it('throws for content filter blocks', async () => {
      const error = new Error('content_filter')
      error.status = 400
      mockCreate.mockRejectedValueOnce(error)

      await expect(generateCompletion('S', 'U')).rejects.toMatchObject({
        status: 400,
        message: expect.stringContaining('safety filters'),
      })
    })

    it('throws generic error for unknown failures', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Boom'))

      await expect(generateCompletion('S', 'U')).rejects.toMatchObject({
        status: 502,
      })
    })
  })
})
