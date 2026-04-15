import { z } from 'zod';

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid product id');

const baseProductBodySchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters').max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase and hyphenated'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000),
  shortDescription: z.string().trim().max(220).optional(),
  sku: z.string().trim().toUpperCase().min(1, 'SKU is required').max(60),
  price: z.number().min(0, 'Price cannot be negative'),
  compareAtPrice: z.number().min(0, 'Compare at price cannot be negative').optional(),
  currency: z.string().trim().toUpperCase().length(3, 'Currency must be 3 characters').optional(),
  stock: z.number().int('Stock must be an integer').min(0, 'Stock cannot be negative'),
  category: z.string().trim().toLowerCase().min(1, 'Category is required').max(80),
  tags: z.array(z.string().trim().min(1).max(50)).optional(),
  images: z
    .array(
      z.object({
        url: z.string().trim().url('Image URL is invalid'),
        publicId: z.string().trim().optional(),
        alt: z.string().trim().max(120).optional(),
      }),
    )
    .optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export const createProductSchema = z.object({
  body: baseProductBodySchema.superRefine((value, ctx) => {
    if (value.compareAtPrice !== undefined && value.compareAtPrice < value.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['compareAtPrice'],
        message: 'Compare at price must be greater than or equal to price',
      });
    }
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: baseProductBodySchema
    .partial()
    .refine((value) => Object.keys(value).length > 0, 'At least one field is required to update')
    .superRefine((value, ctx) => {
      if (
        value.compareAtPrice !== undefined &&
        value.price !== undefined &&
        value.compareAtPrice < value.price
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['compareAtPrice'],
          message: 'Compare at price must be greater than or equal to price',
        });
      }
    }),
});

export const productIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
