import mongoose, { Document, Schema } from 'mongoose'

export interface IFeedback extends Document {
  name: string
  phone?: string
  email?: string
  service: string
  content: string
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
      required: true,
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
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema)
