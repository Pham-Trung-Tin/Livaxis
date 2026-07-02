import { Request, Response } from 'express'
import Feedback from '../models/feedback.model'

export const createFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, service, content } = req.body

    if (!email) {
      res.status(400).json({ error: { message: 'Vui lòng cung cấp địa chỉ email' } })
      return
    }

    const feedback = new Feedback({
      name,
      phone,
      email,
      service,
      content
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

    // Get random feedbacks
    const feedbacks = await Feedback.aggregate([
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
