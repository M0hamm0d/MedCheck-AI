import { demoMode } from './index.js'

const requiredWhenNotDemo = ['OPENAI_API_KEY']

export function validateEnv() {
  const warnings = []

  if (demoMode) {
    return { valid: true, warnings: ['Running in DEMO mode — external APIs are mocked.'], demoMode: true }
  }

  for (const key of requiredWhenNotDemo) {
    if (!process.env[key]) {
      warnings.push(`Missing ${key} environment variable. The AI explanation features will not work.`)
    }
  }

  if (!process.env.OPENFDA_API_KEY) {
    warnings.push('Missing OPENFDA_API_KEY. Rate limits are stricter without an API key (1,000 req/day).')
  }

  return {
    valid: warnings.length === 0 || warnings.every((w) => w.includes('Rate limits')),
    warnings,
    demoMode: false,
  }
}
