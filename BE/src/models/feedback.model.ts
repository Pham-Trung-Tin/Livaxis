import mongoose, { Document, Schema } from 'mongoose'

export interface IFeedback extends Document {
  name: string
  phone?: string
  email?: string
  service: string
  content: string
  role: string
  rating: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    service: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: 'Khách hàng',
      trim: true,
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // Default to approved so users can see it immediately on demo/landing
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema)
