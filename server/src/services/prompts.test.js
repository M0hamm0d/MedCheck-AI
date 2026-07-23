import { describe, it, expect } from 'vitest'
import {
  SYSTEM_PROMPT,
  buildExplainPrompt,
  parseExplanation,
} from '../services/prompts.js'

describe('prompts service', () => {
  describe('SYSTEM_PROMPT', () => {
    it('contains the identity statement', () => {
      expect(SYSTEM_PROMPT).toContain('medicine information assistant')
    })

    it('includes the 8 critical rules', () => {
      expect(SYSTEM_PROMPT).toContain('NEVER invent')
      expect(SYSTEM_PROMPT).toContain('ONLY use the information')
      expect(SYSTEM_PROMPT).toContain('Information unavailable')
      expect(SYSTEM_PROMPT).toContain('NEVER diagnose')
      expect(SYSTEM_PROMPT).toContain('NEVER recommend')
      expect(SYSTEM_PROMPT).toContain('NEVER compare')
      expect(SYSTEM_PROMPT).toContain('NEVER provide dosage instructions beyond')
      expect(SYSTEM_PROMPT).toContain('plain, clear language')
    })

    it('requires the 5 output sections in order', () => {
      const usesIdx = SYSTEM_PROMPT.indexOf('Uses')
      const warningsIdx = SYSTEM_PROMPT.indexOf('Warnings')
      const sideEffectsIdx = SYSTEM_PROMPT.indexOf('Side Effects')
      const storageIdx = SYSTEM_PROMPT.indexOf('Storage')
      const contactIdx = SYSTEM_PROMPT.indexOf('When to Contact a Healthcare Professional')

      expect(usesIdx).toBeGreaterThan(-1)
      expect(warningsIdx).toBeGreaterThan(usesIdx)
      expect(sideEffectsIdx).toBeGreaterThan(warningsIdx)
      expect(storageIdx).toBeGreaterThan(sideEffectsIdx)
      expect(contactIdx).toBeGreaterThan(storageIdx)
    })

    it('includes the mandatory disclaimer text', () => {
      expect(SYSTEM_PROMPT).toContain('This information is for educational purposes only')
      expect(SYSTEM_PROMPT).toContain('Always consult your doctor or pharmacist')
      expect(SYSTEM_PROMPT).toContain('Read the full patient information leaflet')
    })

    it('forbids diagnosis, prescribing, and recommending', () => {
      expect(SYSTEM_PROMPT).toContain('NEVER diagnose')
      expect(SYSTEM_PROMPT).toContain('NEVER recommend')
      expect(SYSTEM_PROMPT).toContain('NEVER compare')
      expect(SYSTEM_PROMPT).toContain('prescribe')
    })

    it('instructs to use plain language', () => {
      expect(SYSTEM_PROMPT).toContain('8th-grade reading level')
      expect(SYSTEM_PROMPT).toContain('Avoid medical jargon')
    })
  })

  describe('buildExplainPrompt', () => {
    it('builds a prompt containing all available drug fields', () => {
      const drug = {
        brandName: 'Aspirin',
        genericName: 'Acetylsalicylic Acid',
        activeIngredient: 'Aspirin 325mg',
        purpose: 'Pain reliever and fever reducer',
        dosage: 'Take with a full glass of water',
        warnings: ['Stomach bleeding risk', 'Reye syndrome warning'],
        sideEffects: ['Nausea', 'Heartburn'],
        storage: 'Store at room temperature',
      }

      const prompt = buildExplainPrompt(drug)

      expect(prompt).toContain('Medicine name: Aspirin')
      expect(prompt).toContain('Generic name: Acetylsalicylic Acid')
      expect(prompt).toContain('Active ingredient: Aspirin 325mg')
      expect(prompt).toContain('Purpose/uses: Pain reliever and fever reducer')
      expect(prompt).toContain('Dosage instructions: Take with a full glass of water')
      expect(prompt).toContain('Warnings: Stomach bleeding risk | Reye syndrome warning')
      expect(prompt).toContain('Side effects: Nausea | Heartburn')
      expect(prompt).toContain('Storage: Store at room temperature')
    })

    it('omits optional fields that are missing', () => {
      const drug = {
        brandName: 'SomeDrug',
        genericName: '',
        purpose: 'For pain',
      }

      const prompt = buildExplainPrompt(drug)

      expect(prompt).toContain('Medicine name: SomeDrug')
      expect(prompt).not.toContain('Generic name:')
      expect(prompt).not.toContain('Storage:')
      expect(prompt).not.toContain('Warnings:')
      expect(prompt).not.toContain('Side effects:')
    })

    it('includes the instruction to not guess when data is missing', () => {
      const drug = { brandName: 'Test' }
      const prompt = buildExplainPrompt(drug)

      expect(prompt).toContain('ONLY the information provided below')
      expect(prompt).toContain('Information unavailable')
      expect(prompt).toContain('do not guess')
    })

    it('joins multiple warnings and side effects with pipe separator', () => {
      const drug = {
        brandName: 'Test',
        warnings: ['Warning A', 'Warning B', 'Warning C'],
        sideEffects: ['Effect 1', 'Effect 2'],
      }

      const prompt = buildExplainPrompt(drug)

      expect(prompt).toContain('Warnings: Warning A | Warning B | Warning C')
      expect(prompt).toContain('Side effects: Effect 1 | Effect 2')
    })
  })

  describe('parseExplanation', () => {
    function mockResponse(customSections = {}) {
      const defaults = {
        uses: 'Aspirin is used for pain relief and reducing fever.',
        warnings: 'Do not take if you have stomach ulcers.',
        sideEffects: 'Common side effects include nausea and heartburn.',
        storage: 'Store at room temperature away from moisture.',
        contactHcp: 'Contact your doctor if you experience severe stomach pain.',
      }

      const sections = { ...defaults, ...customSections }
      const disclaimer =
        'This information is for educational purposes only. It does not constitute medical advice. Always consult your doctor or pharmacist before taking any medicine. Read the full patient information leaflet provided with your medicine.'

      return `Uses
${sections.uses}

Warnings
${sections.warnings}

Side Effects
${sections.sideEffects}

Storage
${sections.storage}

When to Contact a Healthcare Professional
${sections.contactHcp}

${disclaimer}`
    }

    it('parses all 5 sections from a well-formed response', () => {
      const parsed = parseExplanation(mockResponse())

      expect(parsed.sections.uses).toBe('Aspirin is used for pain relief and reducing fever.')
      expect(parsed.sections.warnings).toBe('Do not take if you have stomach ulcers.')
      expect(parsed.sections.sideEffects).toBe('Common side effects include nausea and heartburn.')
      expect(parsed.sections.storage).toBe('Store at room temperature away from moisture.')
      expect(parsed.sections.contactHcp).toBe(
        'Contact your doctor if you experience severe stomach pain.',
      )
    })

    it('extracts the educational disclaimer', () => {
      const parsed = parseExplanation(mockResponse())

      expect(parsed.disclaimer).toContain('This information is for educational purposes only')
      expect(parsed.disclaimer).toContain('Always consult your doctor')
    })

    it('returns raw text', () => {
      const response = mockResponse()
      const parsed = parseExplanation(response)

      expect(parsed.raw).toBe(response)
    })

    it('handles missing sections gracefully', () => {
      const response = `Uses
For pain relief.

Warnings
Information unavailable

Side Effects
Information unavailable

Storage
Information unavailable

When to Contact a Healthcare Professional
Contact a doctor if pain persists.

This information is for educational purposes only.`

      const parsed = parseExplanation(response)

      expect(parsed.sections.uses).toBe('For pain relief.')
      expect(parsed.sections.warnings).toBe('Information unavailable')
      expect(parsed.sections.sideEffects).toBe('Information unavailable')
      expect(parsed.sections.storage).toBe('Information unavailable')
      expect(parsed.sections.contactHcp).toBe('Contact a doctor if pain persists.')
    })

    it('handles malformed responses with missing headings', () => {
      const response = 'Just some random text without headings.'
      const parsed = parseExplanation(response)

      expect(parsed.sections.uses).toBe('Information unavailable')
      expect(parsed.sections.warnings).toBe('Information unavailable')
      expect(parsed.sections.sideEffects).toBe('Information unavailable')
      expect(parsed.sections.storage).toBe('Information unavailable')
      expect(parsed.sections.contactHcp).toBe('Information unavailable')
    })

    it('handles empty response', () => {
      const parsed = parseExplanation('')

      expect(parsed.sections.uses).toBe('Information unavailable')
      expect(parsed.sections.warnings).toBe('Information unavailable')
      expect(parsed.sections.sideEffects).toBe('Information unavailable')
      expect(parsed.sections.storage).toBe('Information unavailable')
      expect(parsed.sections.contactHcp).toBe('Information unavailable')
      expect(parsed.disclaimer).toBe('')
    })

    it('strips leading colons, dashes, and whitespace from section content', () => {
      const response = `Uses
: For pain relief.

Warnings
- Do not take with alcohol.

Side Effects
=== Nausea and dizziness.

Storage
   Store at room temperature.   

When to Contact a Healthcare Professional
Contact doctor if severe.

This information is for educational purposes only.`

      const parsed = parseExplanation(response)

      expect(parsed.sections.uses).toBe('For pain relief.')
      expect(parsed.sections.warnings).toBe('Do not take with alcohol.')
      expect(parsed.sections.sideEffects).toBe('Nausea and dizziness.')
      expect(parsed.sections.storage).toBe('Store at room temperature.')
    })
  })
})
