import mongoose, { Schema, type Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  subtitle?: string;
  category:
    | 'Lounge Chair'
    | 'Seating'
    | 'Dining'
    | 'Lighting'
    | 'Accent'
    | 'Storage'
    | 'Sofas'
    | 'Tables'
    | 'Chairs';
  price: number;
  imageUrl: string;
  description?: string;
  style: 'Minimalist' | 'Modern Luxury' | 'Industrial';
  dimensions?: string;
  material?: string;
  color?: string;
  colorHex?: string;
  isNew: boolean;
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
    subtitle: {
      type: String,
      trim: true,
      maxlength: 180,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Lounge Chair', 'Seating', 'Dining', 'Lighting', 'Accent', 'Storage', 'Sofas', 'Tables', 'Chairs'],
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
    color: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    colorHex: {
      type: String,
      trim: true,
      match: [/^#([0-9a-fA-F]{6})$/, 'Invalid hex color'],
    },
    isNew: {
      type: Boolean,
      default: false,
      index: true,
    },
    stock: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  },
);

const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
