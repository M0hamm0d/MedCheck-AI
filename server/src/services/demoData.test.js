import { describe, it, expect } from 'vitest'
import {
  searchMockMedicines,
  getMockExplanation,
  getMockInteraction,
  getMockPrescription,
} from './demoData.js'

describe('demoData', () => {
  describe('searchMockMedicines', () => {
    it('finds Paracetamol by exact name', () => {
      const results = searchMockMedicines('Paracetamol')
      expect(results).toHaveLength(1)
      expect(results[0].brandName).toBe('Paracetamol')
    })

    it('finds by generic name', () => {
      const results = searchMockMedicines('Acetaminophen')
      expect(results).toHaveLength(1)
      expect(results[0].brandName).toBe('Paracetamol')
    })

    it('finds by partial match', () => {
      const results = searchMockMedicines('para')
      expect(results).toHaveLength(1)
      expect(results[0].brandName).toBe('Paracetamol')
    })

    it('is case-insensitive', () => {
      const results = searchMockMedicines('IBUPROFEN')
      expect(results).toHaveLength(1)
      expect(results[0].brandName).toBe('Ibuprofen')
    })

    it('returns empty for non-matching query', () => {
      const results = searchMockMedicines('nonexistent')
      expect(results).toEqual([])
    })

    it('returns empty for empty query', () => {
      expect(searchMockMedicines('')).toEqual([])
    })

    it('has the same shape as normalized OpenFDA data', () => {
      const results = searchMockMedicines('Amoxicillin')
      const drug = results[0]

      expect(drug).toHaveProperty('id')
      expect(drug).toHaveProperty('brandName')
      expect(drug).toHaveProperty('genericName')
      expect(drug).toHaveProperty('manufacturer')
      expect(drug).toHaveProperty('purpose')
      expect(drug).toHaveProperty('dosage')
      expect(drug).toHaveProperty('sideEffects')
      expect(drug).toHaveProperty('warnings')
      expect(drug).toHaveProperty('activeIngredient')
      expect(drug).toHaveProperty('storage')
      expect(drug).toHaveProperty('source')
      expect(Array.isArray(drug.sideEffects)).toBe(true)
      expect(Array.isArray(drug.warnings)).toBe(true)
    })

    it('marks mock data source clearly', () => {
      const results = searchMockMedicines('Ibuprofen')
      expect(results[0].source).toBe('Demo Mode (Mock Data)')
    })
  })

  describe('getMockExplanation', () => {
    it('creates a structured explanation with all sections', () => {
      const explanation = getMockExplanation({ brandName: 'Paracetamol' })

      expect(explanation).toContain('Uses')
      expect(explanation).toContain('Warnings')
      expect(explanation).toContain('Side Effects')
      expect(explanation).toContain('Storage')
      expect(explanation).toContain('When to Contact a Healthcare Professional')
      expect(explanation).toContain('This information is for educational purposes only')
    })

    it('includes the drug name in the explanation', () => {
      const explanation = getMockExplanation({ brandName: 'Ibuprofen' })

      expect(explanation).toContain('Ibuprofen')
    })

    it('handles missing brandName with fallback', () => {
      const explanation = getMockExplanation({})

      expect(explanation).toContain('this medicine')
    })
  })

  describe('getMockInteraction', () => {
    it('creates a structured interaction analysis', () => {
      const result = getMockInteraction(
        { brandName: 'Aspirin' },
        { brandName: 'Ibuprofen' },
      )

      expect(result).toContain('Safety Summary')
      expect(result).toContain('Potential Concerns')
      expect(result).toContain('Professional Advice')
      expect(result).toContain('This information is for educational purposes only')
    })

    it('includes both drug names', () => {
      const result = getMockInteraction(
        { brandName: 'DrugA' },
        { brandName: 'DrugB' },
      )

      expect(result).toContain('DrugA')
      expect(result).toContain('DrugB')
    })
  })

  describe('getMockPrescription', () => {
    it('returns canned response for exact match', () => {
      const result = getMockPrescription(
        'Amoxicillin 500mg, 1 tablet, Three times daily, 7 days',
      )

      expect(result).toContain('How Often (Frequency)')
      expect(result).toContain('How Long (Duration)')
      expect(result).toContain('Amoxicillin')
    })

    it('returns canned response for shorthand match', () => {
      const result = getMockPrescription('1 tab BID PC x 7d')

      expect(result).toContain('twice daily')
      expect(result).toContain('7 days')
    })

    it('returns uninterpretable for gibberish', () => {
      const result = getMockPrescription('xyz')

      expect(result).toContain('Unable to interpret the prescription')
    })

    it('returns uninterpretable for unknown but valid-looking text', () => {
      const result = getMockPrescription('Take 1 tablet daily')

      expect(result).toContain('Unable to interpret')
    })
  })
})
