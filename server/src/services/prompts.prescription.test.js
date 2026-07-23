import { describe, it, expect } from 'vitest'
import {
  PRESCRIPTION_SYSTEM_PROMPT,
  buildPrescriptionPrompt,
  parsePrescriptionResponse,
} from '../services/prompts.js'

describe('prescription prompts', () => {
  describe('PRESCRIPTION_SYSTEM_PROMPT', () => {
    it('states the assistant identity', () => {
      expect(PRESCRIPTION_SYSTEM_PROMPT).toContain('prescription instruction explainer')
    })

    it('forbids recommending, prescribing, or suggesting', () => {
      expect(PRESCRIPTION_SYSTEM_PROMPT).toContain('NEVER recommend')
      expect(PRESCRIPTION_SYSTEM_PROMPT).toContain('NEVER diagnose')
    })

    it('requires clarifying when text is unclear', () => {
      expect(PRESCRIPTION_SYSTEM_PROMPT).toContain('Unable to interpret')
      expect(PRESCRIPTION_SYSTEM_PROMPT).toContain('Please provide clearer instructions')
    })

    it('requires the 4 output sections', () => {
      expect(PRESCRIPTION_SYSTEM_PROMPT).toContain('How Often (Frequency)')
      expect(PRESCRIPTION_SYSTEM_PROMPT).toContain('How Long (Duration)')
      expect(PRESCRIPTION_SYSTEM_PROMPT).toContain('How to Store')
      expect(PRESCRIPTION_SYSTEM_PROMPT).toContain('Warnings')
    })

    it('includes the mandatory follow-doctor disclaimer', () => {
      expect(PRESCRIPTION_SYSTEM_PROMPT).toContain('Always follow your doctor')
      expect(PRESCRIPTION_SYSTEM_PROMPT).toContain('educational purposes only')
    })

    it('forbids saying correct or incorrect', () => {
      expect(PRESCRIPTION_SYSTEM_PROMPT).toContain('NEVER say a prescription is')
    })

    it('instructs to only explain what is written', () => {
      expect(PRESCRIPTION_SYSTEM_PROMPT).toContain('ONLY explain')
      expect(PRESCRIPTION_SYSTEM_PROMPT).toContain('NEVER invent')
    })
  })

  describe('buildPrescriptionPrompt', () => {
    it('wraps the prescription text', () => {
      const prompt = buildPrescriptionPrompt('Take 1 tablet daily')

      expect(prompt).toContain('Take 1 tablet daily')
      expect(prompt).toContain('PRESCRIPTION TEXT:')
    })

    it('trims whitespace from input', () => {
      const prompt = buildPrescriptionPrompt('  Take 1 tablet   ')

      expect(prompt).toContain('Take 1 tablet')
      expect(prompt).not.toContain('  Take')
    })

    it('includes the uninterpretable instruction', () => {
      const prompt = buildPrescriptionPrompt('anything')

      expect(prompt).toContain('Unable to interpret')
      expect(prompt).toContain('Please provide clearer instructions')
    })
  })

  describe('parsePrescriptionResponse', () => {
    function mockResponse(customSections = {}) {
      const defaults = {
        frequency: 'Take this medicine three times a day (morning, afternoon, and evening).',
        duration: 'Take for 7 days. Complete the full course even if you feel better.',
        storage: 'Store at room temperature away from moisture.',
        warnings: 'Take with food to reduce stomach upset. Do not skip doses.',
      }
      const s = { ...defaults, ...customSections }
      const disclaimer =
        'Always follow your doctor\'s or pharmacist\'s exact instructions. This explanation is for educational purposes only and does not replace professional medical guidance.'

      return `How Often (Frequency)
${s.frequency}

How Long (Duration)
${s.duration}

How to Store
${s.storage}

Warnings
${s.warnings}

${disclaimer}`
    }

    it('parses all 4 sections', () => {
      const parsed = parsePrescriptionResponse(mockResponse())

      expect(parsed.sections.frequency).toContain('three times a day')
      expect(parsed.sections.duration).toContain('7 days')
      expect(parsed.sections.storage).toContain('room temperature')
      expect(parsed.sections.warnings).toContain('Take with food')
    })

    it('extracts the disclaimer', () => {
      const parsed = parsePrescriptionResponse(mockResponse())

      expect(parsed.disclaimer).toContain('Always follow your doctor')
      expect(parsed.disclaimer).toContain('educational purposes only')
    })

    it('detects uninterpretable responses', () => {
      const parsed = parsePrescriptionResponse(
        'Unable to interpret the prescription. Please provide clearer instructions.',
      )

      expect(parsed.uninterpretable).toBe(true)
      expect(parsed.sections).toBeNull()
    })

    it('returns only sections with content', () => {
      const response = `How Often (Frequency)
Take once daily.

How Long (Duration)
Take for 7 days.

Always follow your doctor's or pharmacist's exact instructions.`

      const parsed = parsePrescriptionResponse(response)

      expect(parsed.sections.frequency).toBe('Take once daily.')
      expect(parsed.sections.duration).toBe('Take for 7 days.')
      expect(parsed.sections.storage).toBeUndefined()
      expect(parsed.sections.warnings).toBeUndefined()
    })
  })
})
