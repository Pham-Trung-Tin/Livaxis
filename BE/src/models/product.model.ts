import mongoose, { Schema, type Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: 'Lounge Chair' | 'Seating' | 'Dining' | 'Lighting' | 'Accent' | 'Storage';
  price: number;
  imageUrl: string;
  description?: string;
  style: 'Minimalist' | 'Modern Luxury' | 'Industrial';
  dimensions?: string;
  material?: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Lounge Chair', 'Seating', 'Dining', 'Lighting', 'Accent', 'Storage'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Product image is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    style: {
      type: String,
      enum: ['Minimalist', 'Modern Luxury', 'Industrial'],
      default: 'Modern Luxury',
    },
    dimensions: {
      type: String,
    },
    material: {
      type: String,
    },
    stock: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
