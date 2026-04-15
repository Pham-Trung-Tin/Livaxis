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
]);

const styleSchema = z.enum(['Minimalist', 'Modern Luxury', 'Industrial']);

const baseProductBodySchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(120),
  category: categorySchema,
  price: z.number().min(0, 'Price cannot be negative'),
  imageUrl: z.string().trim().url('Image URL is invalid'),
  description: z.string().trim().max(5000).optional(),
  style: styleSchema.optional(),
  dimensions: z.string().trim().max(120).optional(),
  material: z.string().trim().max(120).optional(),
  stock: z.number().int('Stock must be an integer').min(0, 'Stock cannot be negative').optional(),
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
