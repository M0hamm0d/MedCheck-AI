import { Router } from 'express'
import { demoMode } from '../config/index.js'

const router = Router()

router.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', demoMode })
})

export default router
