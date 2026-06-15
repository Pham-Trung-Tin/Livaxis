import { Schema, model, type Document, Types } from 'mongoose';

export interface IDesignProduct {
  productId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  rotationY?: number;
  flipped?: boolean;
}

export interface IDesign extends Document {
  userId: Types.ObjectId;
  name: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  products: IDesignProduct[];
  prompt?: string;
  stylePreset?: string;
  createdAt: Date;
  updatedAt: Date;
}

const designSchema = new Schema<IDesign>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Tên thiết kế là bắt buộc'],
      trim: true,
      maxlength: [100, 'Tên thiết kế không được vượt quá 100 ký tự'],
    },
    beforeImageUrl: {
      type: String,
      required: [true, 'Ảnh trước thiết kế là bắt buộc'],
    },
    afterImageUrl: {
      type: String,
      required: [true, 'Ảnh sau thiết kế là bắt buộc'],
    },
    products: [
      {
        productId: { type: String, required: true },
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        scale: { type: Number, required: true },
        rotation: { type: Number, required: true },
        rotationY: { type: Number, default: 0 },
        flipped: { type: Boolean, default: false },
      },
    ],
    prompt: {
      type: String,
      trim: true,
    },
    stylePreset: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'designs',
  }
);

const Design = model<IDesign>('Design', designSchema);

export default Design;
