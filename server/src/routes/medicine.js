import { Router } from 'express'
import { searchLimiter, aiLimiter } from '../middleware/rateLimiter.js'
import { searchMedicine, explainMedicine } from '../controllers/medicineController.js'

const router = Router()

router.get('/api/medicine/search', searchLimiter, searchMedicine)
router.post('/api/medicine/explain', aiLimiter, explainMedicine)

export default router
