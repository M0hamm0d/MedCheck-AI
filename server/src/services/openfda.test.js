import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

vi.mock('../config/index.js', () => ({
  openfdaKey: '',
  demoMode: false,
}))

vi.mock('./demoData.js', () => ({
  searchMockMedicines: vi.fn(() => []),
}))

vi.mock('axios')

const mockAxios = axios

const { searchDrug, OpenFDAError } = await vi.importActual('../services/openfda.js')

function mockOpenFDAResponse(overrides = {}) {
  return {
    data: {
      meta: {
        disclaimer: 'Do not rely on openFDA...',
        results: { total: 2, skip: 0, limit: 3 },
      },
      results: [
        {
          id: 'abc-123',
          openfda: {
            brand_name: ['Aspirin'],
            generic_name: ['Acetylsalicylic Acid'],
            manufacturer_name: ['Bayer HealthCare'],
            spl_id: ['spl-001'],
          },
          purpose: ['Pain reliever and fever reducer'],
          indications_and_usage: [
            'For the temporary relief of minor aches and pains including headache, muscle pain, and toothache.',
          ],
          warnings: [
            'Reye syndrome: Children and teenagers should not use this medicine for chicken pox or flu symptoms.',
            'Stomach bleeding warning: This product contains an NSAID.',
          ],
          adverse_reactions: ['Nausea', 'Heartburn', 'Upset stomach'],
          dosage_and_administration: [
            'Take with a full glass of water. Adults: 1 to 2 tablets every 4 hours.',
          ],
          active_ingredient: ['Aspirin 325 mg'],
          ...overrides,
        },
      ],
    },
  }
}

function mockEmptyResponse() {
  return {
    data: {
      meta: { results: { total: 0, skip: 0, limit: 3 } },
      results: [],
    },
  }
}

describe('openfda service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchDrug', () => {
    it('returns normalized results for a valid query', async () => {
      mockAxios.get.mockResolvedValueOnce(mockOpenFDAResponse())

      const result = await searchDrug('aspirin')

      expect(result.notFound).toBe(false)
      expect(result.results).toHaveLength(1)

      const drug = result.results[0]
      expect(drug.brandName).toBe('Aspirin')
      expect(drug.genericName).toBe('Acetylsalicylic Acid')
      expect(drug.manufacturer).toBe('Bayer HealthCare')
      expect(drug.purpose).toBe('Pain reliever and fever reducer')
      expect(drug.sideEffects).toEqual(['Nausea', 'Heartburn', 'Upset stomach'])
      expect(drug.warnings).toHaveLength(2)
      expect(drug.activeIngredient).toBe('Aspirin 325 mg')
      expect(drug.source).toBe('FDA (OpenFDA)')
    })

    it('strips HTML from text fields', async () => {
      mockAxios.get.mockResolvedValueOnce(
        mockOpenFDAResponse({
          purpose: ['<p>Pain <b>reliever</b> and fever reducer</p>'],
          warnings: ['<b>Warning:</b> Do not take with alcohol.'],
        }),
      )

      const result = await searchDrug('aspirin')
      const drug = result.results[0]

      expect(drug.purpose).toBe('Pain reliever and fever reducer')
      expect(drug.warnings[0]).toBe('Warning: Do not take with alcohol.')
    })

    it('handles missing fields gracefully by returning empty values', async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: {
          meta: { results: { total: 1, skip: 0, limit: 3 } },
          results: [
            {
              id: 'xyz-789',
              openfda: {
                brand_name: ['SomeDrug'],
              },
            },
          ],
        },
      })

      const result = await searchDrug('somedrug')
      const drug = result.results[0]

      expect(drug.brandName).toBe('SomeDrug')
      expect(drug.genericName).toBe('')
      expect(drug.manufacturer).toBe('')
      expect(drug.purpose).toBe('')
      expect(drug.dosage).toBe('')
      expect(drug.sideEffects).toEqual([])
      expect(drug.warnings).toEqual([])
      expect(drug.activeIngredient).toBe('')
    })

    it('handles missing openfda object gracefully', async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: {
          meta: { results: { total: 1, skip: 0, limit: 3 } },
          results: [
            {
              id: 'no-openfda',
            },
          ],
        },
      })

      const result = await searchDrug('anything')
      const drug = result.results[0]

      expect(drug.brandName).toBe('Unknown')
      expect(drug.source).toBe('FDA (OpenFDA)')
    })

    it('returns notFound=true for empty results', async () => {
      mockAxios.get.mockResolvedValueOnce(mockEmptyResponse())

      const result = await searchDrug('nonexistent')

      expect(result.notFound).toBe(true)
      expect(result.results).toEqual([])
    })

    it('uses brand_name as fallback for genericName', async () => {
      mockAxios.get.mockResolvedValueOnce(
        mockOpenFDAResponse({
          openfda: {
            brand_name: ['TestDrug'],
            generic_name: [],
          },
        }),
      )

      const result = await searchDrug('testdrug')
      const drug = result.results[0]

      expect(drug.brandName).toBe('TestDrug')
      expect(drug.genericName).toBe('')
    })

    it('throws for empty query', async () => {
      await expect(searchDrug('')).rejects.toThrow(OpenFDAError)
      await expect(searchDrug('')).rejects.toMatchObject({
        status: 400,
        message: 'Search query is required',
      })
    })

    it('throws for whitespace-only query', async () => {
      await expect(searchDrug('   ')).rejects.toThrow(OpenFDAError)
    })

    it('throws for null/undefined query', async () => {
      await expect(searchDrug(null)).rejects.toThrow(OpenFDAError)
      await expect(searchDrug(undefined)).rejects.toThrow(OpenFDAError)
    })

    it('handles timeout errors', async () => {
      const timeoutError = new Error('timeout of 10000ms exceeded')
      timeoutError.code = 'ECONNABORTED'
      mockAxios.get.mockRejectedValueOnce(timeoutError)

      await expect(searchDrug('aspirin')).rejects.toMatchObject({
        status: 504,
        message: expect.stringContaining('timed out'),
      })
    })

    it('handles OpenFDA 404 status (empty search)', async () => {
      const error = new Error('Not found')
      error.response = { status: 404 }
      mockAxios.get.mockRejectedValueOnce(error)

      const result = await searchDrug('nothing')
      expect(result.notFound).toBe(true)
      expect(result.results).toEqual([])
    })

    it('handles OpenFDA 429 rate limit', async () => {
      const error = new Error('Too many requests')
      error.response = { status: 429 }
      mockAxios.get.mockRejectedValueOnce(error)

      await expect(searchDrug('aspirin')).rejects.toMatchObject({
        status: 503,
        message: expect.stringContaining('Too many requests'),
      })
    })

    it('handles general API errors', async () => {
      const error = new Error('Server error')
      error.response = { status: 500, data: { error: { message: 'Internal' } } }
      mockAxios.get.mockRejectedValueOnce(error)

      await expect(searchDrug('aspirin')).rejects.toMatchObject({
        status: 502,
        message: expect.stringContaining('temporarily unavailable'),
      })
    })

    it('handles network connection errors', async () => {
      const error = new Error('Network error')
      error.code = 'ENOTFOUND'
      mockAxios.get.mockRejectedValueOnce(error)

      await expect(searchDrug('aspirin')).rejects.toMatchObject({
        status: 502,
        message: expect.stringContaining('Unable to connect'),
      })
    })

    it('handles unexpected errors generically', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Something weird happened'))

      await expect(searchDrug('aspirin')).rejects.toMatchObject({
        status: 502,
        message: expect.stringContaining('unexpected error'),
      })
    })

    it('normalizes HTML entities in text fields', async () => {
      mockAxios.get.mockResolvedValueOnce(
        mockOpenFDAResponse({
          purpose: ['Pain &amp; fever relief &lt;strong&gt;medication&lt;/strong&gt;'],
        }),
      )

      const result = await searchDrug('aspirin')
      const drug = result.results[0]

      expect(drug.purpose).toBe('Pain & fever relief medication')
    })

    it('filters out empty strings from sideEffects and warnings', async () => {
      mockAxios.get.mockResolvedValueOnce(
        mockOpenFDAResponse({
          adverse_reactions: ['Nausea', '', '<p></p>', '  ', 'Headache'],
          warnings: ['Warning 1', '', '  '],
        }),
      )

      const result = await searchDrug('aspirin')
      const drug = result.results[0]

      expect(drug.sideEffects).toEqual(['Nausea', 'Headache'])
      expect(drug.warnings).toEqual(['Warning 1'])
    })

    it('escapes special characters in search query', async () => {
      mockAxios.get.mockResolvedValueOnce(mockOpenFDAResponse())

      await searchDrug('aspirin (325mg)')

      const callArgs = mockAxios.get.mock.calls[0]
      expect(callArgs[1].params.search).toContain('aspirin \\(325mg\\)')
    })
  })
})
