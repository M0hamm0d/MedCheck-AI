import dotenv from 'dotenv'

dotenv.config()

export const port = process.env.PORT || 3001
export const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
export const openaiKey = process.env.OPENAI_API_KEY || ''
export const openfdaKey = process.env.OPENFDA_API_KEY || ''
export const demoMode = process.env.DEMO_MODE === 'true'
