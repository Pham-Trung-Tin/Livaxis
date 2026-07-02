import { Request, Response } from 'express'
import Feedback from '../models/feedback.model'

export const createFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, service, content, language } = req.body

    const role = language === 'en' ? 'Customer' : 'Khách hàng'

    const feedback = new Feedback({
      name,
      phone,
      email,
      service,
      content,
      role,
    })

    await feedback.save()

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    })
  } catch (error: any) {
    console.error('Error creating feedback:', error)
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Internal server error' }
    })
  }
}

export const getRandomFeedbacks = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5

    // Get random approved feedbacks
    const feedbacks = await Feedback.aggregate([
      { $match: { status: 'approved' } },
      { $sample: { size: limit } }
    ])

    res.status(200).json({
      success: true,
      message: 'Random feedbacks fetched successfully',
      data: feedbacks
    })
  } catch (error: any) {
    console.error('Error fetching random feedbacks:', error)
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Internal server error' }
    })
  }
}
