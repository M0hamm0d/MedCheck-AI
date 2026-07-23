import { Router } from 'express'
import { aiLimiter } from '../middleware/rateLimiter.js'
import { checkInteractions } from '../controllers/interactionController.js'

const router = Router()

router.post('/api/medicine/interactions', aiLimiter, checkInteractions)

export default router
