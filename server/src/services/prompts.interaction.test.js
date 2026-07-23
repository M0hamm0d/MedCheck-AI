import { describe, it, expect } from 'vitest'
import {
  INTERACTION_SYSTEM_PROMPT,
  buildInteractionPrompt,
  parseInteractionResponse,
} from '../services/prompts.js'

describe('interaction prompts', () => {
  describe('INTERACTION_SYSTEM_PROMPT', () => {
    it('states the assistant identity', () => {
      expect(INTERACTION_SYSTEM_PROMPT).toContain('medicine safety information assistant')
    })

    it('forbids inventing or guessing', () => {
      expect(INTERACTION_SYSTEM_PROMPT).toContain('NEVER invent')
      expect(INTERACTION_SYSTEM_PROMPT).toContain('Do NOT make up content')
    })

    it('forbids the words safe, unsafe, approved, prescribed', () => {
      const lowered = INTERACTION_SYSTEM_PROMPT.toLowerCase()
      expect(lowered).toContain('forbidden')
      expect(lowered).toContain('never use the words')
      expect(lowered).toContain('safe')
      expect(lowered).toContain('unsafe')
      expect(lowered).toContain('approved')
      expect(lowered).toContain('prescribed')
    })

    it('requires the phrase Based on available medicine information', () => {
      expect(INTERACTION_SYSTEM_PROMPT).toContain(
        'Based on available medicine information',
      )
    })

    it('requires the 3 output sections in order', () => {
      const summaryIdx = INTERACTION_SYSTEM_PROMPT.indexOf('Safety Summary')
      const concernsIdx = INTERACTION_SYSTEM_PROMPT.indexOf('Potential Concerns')
      const adviceIdx = INTERACTION_SYSTEM_PROMPT.indexOf('Professional Advice')

      expect(summaryIdx).toBeGreaterThan(-1)
      expect(concernsIdx).toBeGreaterThan(summaryIdx)
      expect(adviceIdx).toBeGreaterThan(concernsIdx)
    })

    it('includes the mandatory interaction disclaimer', () => {
      expect(INTERACTION_SYSTEM_PROMPT).toContain(
        'This information is for educational purposes only',
      )
      expect(INTERACTION_SYSTEM_PROMPT).toContain(
        'before combining any medicines',
      )
    })

    it('forbids diagnosing and recommending', () => {
      expect(INTERACTION_SYSTEM_PROMPT).toContain('NEVER diagnose')
      expect(INTERACTION_SYSTEM_PROMPT).toContain('NEVER recommend')
    })

    it('instructs plain language', () => {
      expect(INTERACTION_SYSTEM_PROMPT).toContain('8th-grade reading level')
      expect(INTERACTION_SYSTEM_PROMPT).toContain('Avoid medical jargon')
    })

    it('handles insufficient data instruction', () => {
      expect(INTERACTION_SYSTEM_PROMPT).toContain('insufficient data')
      expect(INTERACTION_SYSTEM_PROMPT).toContain('Do NOT make up content')
    })
  })

  describe('buildInteractionPrompt', () => {
    const drugA = {
      brandName: 'Aspirin',
      genericName: 'Acetylsalicylic Acid',
      activeIngredient: 'Aspirin 325mg',
      purpose: 'Pain reliever and fever reducer',
      dosage: 'Take with water',
      warnings: ['Stomach bleeding risk', 'Reye syndrome'],
      sideEffects: ['Nausea', 'Heartburn'],
    }

    const drugB = {
      brandName: 'Ibuprofen',
      genericName: 'Ibuprofen',
      activeIngredient: 'Ibuprofen 200mg',
      purpose: 'NSAID pain reliever',
      dosage: 'Take with food',
      warnings: ['Stomach bleeding risk', 'Heart attack risk'],
      sideEffects: ['Stomach pain', 'Dizziness'],
    }

    it('includes both drugs with structured labels', () => {
      const prompt = buildInteractionPrompt(drugA, drugB)

      expect(prompt).toContain('MEDICINE A: Aspirin')
      expect(prompt).toContain('MEDICINE B: Ibuprofen')
    })

    it('includes detailed fields for each drug', () => {
      const prompt = buildInteractionPrompt(drugA, drugB)

      expect(prompt).toContain('Generic name: Acetylsalicylic Acid')
      expect(prompt).toContain('Generic name: Ibuprofen')
      expect(prompt).toContain('Active ingredient: Aspirin 325mg')
      expect(prompt).toContain('Active ingredient: Ibuprofen 200mg')
      expect(prompt).toContain('Purpose/uses: Pain reliever')
      expect(prompt).toContain('Dosage: Take with water')
      expect(prompt).toContain('Dosage: Take with food')
    })

    it('includes warnings for both drugs', () => {
      const prompt = buildInteractionPrompt(drugA, drugB)

      expect(prompt).toContain('Warnings: Stomach bleeding risk | Reye syndrome')
      expect(prompt).toContain(
        'Warnings: Stomach bleeding risk | Heart attack risk',
      )
    })

    it('includes side effects for both drugs', () => {
      const prompt = buildInteractionPrompt(drugA, drugB)

      expect(prompt).toContain('Side effects: Nausea | Heartburn')
      expect(prompt).toContain('Side effects: Stomach pain | Dizziness')
    })

    it('includes the forbidden words instruction in the user prompt', () => {
      const prompt = buildInteractionPrompt(drugA, drugB)

      expect(prompt).toContain('Do NOT use')
      expect(prompt).toContain('safe')
      expect(prompt).toContain('unsafe')
      expect(prompt).toContain('approved')
      expect(prompt).toContain('prescribed')
    })

    it('includes the data source attribution', () => {
      const prompt = buildInteractionPrompt(drugA, drugB)

      expect(prompt).toContain('FDA via OpenFDA')
    })

    it('includes insufficient data instruction', () => {
      const prompt = buildInteractionPrompt(drugA, drugB)

      expect(prompt).toContain('insufficient')
    })
  })

  describe('parseInteractionResponse', () => {
    function mockResponse(customSections = {}) {
      const defaults = {
        safetySummary:
          'Based on available medicine information, both Aspirin and Ibuprofen are NSAIDs that can increase the risk of stomach bleeding.',
        potentialConcerns:
          'Taking these medicines together may increase the risk of stomach ulcers and gastrointestinal bleeding.',
        professionalAdvice:
          'Consult your doctor before taking these medicines together. Your doctor may recommend spacing the doses or using an alternative.',
      }

      const sections = { ...defaults, ...customSections }
      const disclaimer =
        'This information is for educational purposes only. It does not constitute medical advice. Always consult your doctor or pharmacist before combining any medicines.'

      return `Safety Summary
${sections.safetySummary}

Potential Concerns
${sections.potentialConcerns}

Professional Advice
${sections.professionalAdvice}

${disclaimer}`
    }

    it('parses all 3 sections', () => {
      const parsed = parseInteractionResponse(mockResponse())

      expect(parsed.sections.safetySummary).toContain(
        'Based on available medicine information',
      )
      expect(parsed.sections.potentialConcerns).toContain('stomach ulcers')
      expect(parsed.sections.professionalAdvice).toContain('Consult your doctor')
    })

    it('extracts the disclaimer', () => {
      const parsed = parseInteractionResponse(mockResponse())

      expect(parsed.disclaimer).toContain('educational purposes only')
      expect(parsed.disclaimer).toContain('before combining any medicines')
    })

    it('returns raw text', () => {
      const response = mockResponse()
      const parsed = parseInteractionResponse(response)

      expect(parsed.raw).toBe(response)
    })

    it('handles completely missing headings', () => {
      const parsed = parseInteractionResponse('No sections at all.')

      expect(parsed.sections.safetySummary).toBe('Information unavailable')
      expect(parsed.sections.potentialConcerns).toBe('Information unavailable')
      expect(parsed.sections.professionalAdvice).toBe('Information unavailable')
    })

    it('returns Information unavailable for empty section contents', () => {
      const response = `Safety Summary

Potential Concerns

Professional Advice
See a doctor.`

      const parsed = parseInteractionResponse(response)

      expect(parsed.sections.safetySummary).toBe('Information unavailable')
      expect(parsed.sections.potentialConcerns).toBe('Information unavailable')
      expect(parsed.sections.professionalAdvice).toBe('See a doctor.')
    })
  })
})
