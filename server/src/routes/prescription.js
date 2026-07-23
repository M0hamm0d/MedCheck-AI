import { Router } from 'express'
import { aiLimiter } from '../middleware/rateLimiter.js'
import { explainPrescription } from '../controllers/prescriptionController.js'

const router = Router()

router.post('/api/medicine/prescription', aiLimiter, explainPrescription)

export default router
