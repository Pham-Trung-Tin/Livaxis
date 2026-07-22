import { Schema, model, type Document } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  userId: Schema.Types.ObjectId;
  planId?: string;
  turnsToAdd?: number;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  sePayId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planId: {
      type: String,
    },
    turnsToAdd: {
      type: Number,
    },
    amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    sePayId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'orders',
  }
);

const Order = model<IOrder>('Order', orderSchema);

export default Order;
