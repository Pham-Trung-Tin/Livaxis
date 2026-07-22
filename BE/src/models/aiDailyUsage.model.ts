import mongoose, { Schema, Document } from 'mongoose';

export interface IAiDailyUsage extends Document {
  date: string; // YYYY-MM-DD
  roomTryOn: number;
  roomPlanner: number;
  createdAt: Date;
  updatedAt: Date;
}

const aiDailyUsageSchema = new Schema<IAiDailyUsage>(
  {
    date: { type: String, required: true, unique: true },
    roomTryOn: { type: Number, default: 0 },
    roomPlanner: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const AiDailyUsage = mongoose.model<IAiDailyUsage>('AiDailyUsage', aiDailyUsageSchema);
export default AiDailyUsage;
