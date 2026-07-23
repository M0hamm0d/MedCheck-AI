import axios from 'axios'
import { openfdaKey, demoMode } from '../config/index.js'
import { searchMockMedicines } from './demoData.js'

const OPENFDA_BASE = 'https://api.fda.gov/drug/label.json'
const REQUEST_TIMEOUT = 10000

export class OpenFDAError extends Error {
  constructor(message, status = 502) {
    super(message)
    this.name = 'OpenFDAError'
    this.status = status
  }
}

function escapeSearchTerm(term) {
  return term.replace(/["\\+\-&|!(){}[\]^~*?:/]/g, '\\$&')
}

function stripHtml(text) {
  if (typeof text !== 'string') return ''
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#?\w+;/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getFirst(field) {
  return Array.isArray(field) && field.length > 0 ? field[0] : ''
}

function getList(field) {
  if (!Array.isArray(field)) return []
  return field
    .map((item) => stripHtml(item))
    .filter(Boolean)
}

function normalizeDrugData(raw) {
  const openfda = raw.openfda || {}

  const brandName = getFirst(openfda.brand_name)
  const genericName = getFirst(openfda.generic_name)
  const purpose = stripHtml(getFirst(raw.purpose) || getFirst(raw.indications_and_usage))
  const dosage = stripHtml(getFirst(raw.dosage_and_administration))

  return {
    id: raw.id || getFirst(openfda.spl_id) || '',
    brandName: brandName || genericName || 'Unknown',
    genericName: genericName || '',
    manufacturer: getFirst(openfda.manufacturer_name),
    purpose: purpose || '',
    dosage: dosage || '',
    sideEffects: getList(raw.adverse_reactions),
    warnings: getList(raw.warnings),
    activeIngredient: stripHtml(getFirst(raw.active_ingredient) || ''),
    storage: stripHtml(getFirst(raw.storage_and_handling) || getFirst(raw.how_supplied) || ''),
    source: 'FDA (OpenFDA)',
  }
}

export async function searchDrug(query) {
  const term = query?.trim()

  if (!term) {
    throw new OpenFDAError('Search query is required', 400)
  }

  if (demoMode) {
    const results = searchMockMedicines(term)
    return { results, notFound: results.length === 0 }
  }

  const escapedTerm = escapeSearchTerm(term)
  const searchParam = `(openfda.brand_name:"${escapedTerm}"+openfda.generic_name:"${escapedTerm}")`

  const params = {
    search: searchParam,
    limit: 3,
  }

  if (openfdaKey) {
    params.api_key = openfdaKey
  }

  try {
    const response = await axios.get(OPENFDA_BASE, {
      params,
      timeout: REQUEST_TIMEOUT,
    })

    if (
      !response.data ||
      !response.data.results ||
      response.data.results.length === 0
    ) {
      return { results: [], notFound: true }
    }

    const results = response.data.results.map(normalizeDrugData)

    return { results, notFound: false }
  } catch (error) {
    if (error instanceof OpenFDAError) {
      throw error
    }

    if (axios.isCancel(error) || error.code === 'ECONNABORTED') {
      throw new OpenFDAError('Request to drug database timed out. Please try again.', 504)
    }

    if (error.response) {
      const { status } = error.response

      if (status === 404) {
        return { results: [], notFound: true }
      }

      if (status === 429) {
        throw new OpenFDAError(
          'Too many requests to the drug database. Please wait and try again.',
          503,
        )
      }

      throw new OpenFDAError(
        `Drug database is temporarily unavailable (${status}). Please try again later.`,
        502,
      )
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new OpenFDAError(
        'Unable to connect to the drug database. Please check your connection.',
        502,
      )
    }

    throw new OpenFDAError(
      'An unexpected error occurred while searching. Please try again.',
      502,
    )
  }
}
