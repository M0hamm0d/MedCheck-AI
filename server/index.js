import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { port, clientOrigin } from './src/config/index.js'
import { validateEnv } from './src/config/validateEnv.js'
import { sanitizationMiddleware, validateContentType } from './src/middleware/sanitize.js'
import { globalLimiter } from './src/middleware/rateLimiter.js'
import healthRouter from './src/routes/health.js'
import medicineRouter from './src/routes/medicine.js'
import interactionsRouter from './src/routes/interactions.js'
import prescriptionRouter from './src/routes/prescription.js'
import { errorHandler } from './src/middleware/errorHandler.js'

const envStatus = validateEnv()
if (envStatus.warnings.length > 0) {
  console.warn('Environment warnings:')
  envStatus.warnings.forEach((w) => console.warn(`  - ${w}`))
}
if (!envStatus.valid && !envStatus.demoMode) {
  console.warn('Some features may not work correctly without the required API keys.')
}

const app = express()

app.use(helmet())

app.use(cors({ origin: clientOrigin, methods: ['GET', 'POST'], maxAge: 600 }))

app.use(globalLimiter)

app.use(express.json({ limit: '100kb' }))

app.use(validateContentType)

app.use(sanitizationMiddleware)

app.use(healthRouter)
app.use(medicineRouter)
app.use(interactionsRouter)
app.use(prescriptionRouter)

app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
  if (envStatus.demoMode) {
    console.log('  Demo mode is ON — using mock data instead of external APIs')
  }
})
