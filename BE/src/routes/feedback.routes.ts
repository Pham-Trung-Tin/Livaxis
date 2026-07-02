import { Router } from 'express'
import { createFeedback, getRandomFeedbacks } from '../controllers/feedback.controller'

const router = Router()

// GET /api/feedbacks/random
router.get('/random', getRandomFeedbacks)

// POST /api/feedbacks
router.post('/', createFeedback)

export default router
