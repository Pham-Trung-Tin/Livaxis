import mongoose, { Schema, type Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  subtitle?: string;
  sku?: string;
  stock: number;
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
  imageUrl: string;       // Ảnh chính (hiển thị ở trang Discovery)
  images: string[];        // Mảng ảnh con (thumbnail gallery từ Cloudinary)
  description?: string;
  style: 'Minimalist' | 'Modern Luxury' | 'Industrial';
  dimensions?: string;
  material?: string;
  color?: string;
  colorHex?: string;
  affiliateUrl: string;
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
    sku: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
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
    images: {
      type: [String],
      default: [],
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
    affiliateUrl: {
      type: String,
      required: [true, 'Affiliate URL is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  },
);

const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
