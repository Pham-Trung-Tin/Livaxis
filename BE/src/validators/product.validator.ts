import { z } from 'zod';

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid product id');

const categorySchema = z.enum([
  'Lounge Chair',
  'Seating',
  'Dining',
  'Lighting',
  'Accent',
  'Storage',
  'Sofas',
  'Tables',
  'Chairs',
]);

const styleSchema = z.enum(['Minimalist', 'Modern Luxury', 'Industrial']);

const baseProductBodySchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(120),
  subtitle: z.string().trim().max(180).optional(),
  sku: z.string().trim().max(50).optional(),
  stock: z.number().int().min(0).optional(),
  category: categorySchema,
  price: z.number().min(0, 'Price cannot be negative'),
  imageUrl: z.string().trim().url('Image URL is invalid'),
  description: z.string().trim().max(5000).optional(),
  style: styleSchema.optional(),
  dimensions: z.string().trim().max(120).optional(),
  material: z.string().trim().max(120).optional(),
  color: z.string().trim().max(50).optional(),
  colorHex: z.string().trim().regex(/^#([0-9a-fA-F]{6})$/, 'Invalid hex color').optional(),
  isNew: z.boolean().optional(),
  affiliateUrl: z.string().trim().url('Affiliate URL is invalid'),
});

export const createProductSchema = z.object({
  body: baseProductBodySchema,
});

export const updateProductSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: baseProductBodySchema
    .partial()
    .refine((value) => Object.keys(value).length > 0, 'At least one field is required to update'),
});

export const productIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
