import { z } from 'zod';

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Mã sản phẩm không hợp lệ');

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
  name: z.string().trim().min(1, 'Tên sản phẩm là bắt buộc').max(120),
  subtitle: z.string().trim().max(180).optional(),
  sku: z.string().trim().max(50).optional(),
  stock: z.number().int().min(0).optional(),
  category: categorySchema,
  price: z.number().min(0, 'Giá sản phẩm không thể âm'),
  imageUrl: z.string().trim().url('Đường dẫn hình ảnh không hợp lệ'),
  description: z.string().trim().max(5000).optional(),
  style: styleSchema.optional(),
  dimensions: z.string().trim().max(120).optional(),
  material: z.string().trim().max(120).optional(),
  color: z.string().trim().max(50).optional(),
  colorHex: z.string().trim().regex(/^#([0-9a-fA-F]{6})$/, 'Mã màu hex không hợp lệ').optional(),
  isNew: z.boolean().optional(),
  affiliateUrl: z.string().trim().url('Đường dẫn liên kết tiếp thị không hợp lệ'),
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
    .refine((value) => Object.keys(value).length > 0, 'Ít nhất một trường dữ liệu là bắt buộc để cập nhật'),
});

export const productIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
