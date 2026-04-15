import { Types } from 'mongoose';
import Product, { type IProduct } from '../models/product.model';
import { AppError } from '../utils/appError';

type CreateProductInput = {
  name: string;
  category: 'Lounge Chair' | 'Seating' | 'Dining' | 'Lighting' | 'Accent' | 'Storage';
  price: number;
  imageUrl: string;
  description?: string;
  style?: 'Minimalist' | 'Modern Luxury' | 'Industrial';
  dimensions?: string;
  material?: string;
  stock?: number;
};

type UpdateProductInput = Partial<CreateProductInput>;

export type ProductPublic = {
  id: string;
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
};

export type ProductListQuery = {
  page: number;
  limit: number;
  search?: string;
  category?: ProductPublic['category'];
  style?: ProductPublic['style'];
  sortBy?: 'newest' | 'oldest' | 'priceAsc' | 'priceDesc' | 'nameAsc' | 'nameDesc';
};

const toPublicProduct = (product: IProduct): ProductPublic => ({
  id: product._id.toString(),
  name: product.name,
  category: product.category,
  price: product.price,
  imageUrl: product.imageUrl,
  description: product.description,
  style: product.style,
  dimensions: product.dimensions,
  material: product.material,
  stock: product.stock,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

const ensureValidProductId = (id: string): void => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'INVALID_PRODUCT_ID', 'Product id is invalid');
  }
};

export const createProduct = async (input: CreateProductInput): Promise<ProductPublic> => {
  const product = await Product.create(input);
  return toPublicProduct(product);
};

export const updateProductById = async (id: string, input: UpdateProductInput): Promise<ProductPublic> => {
  ensureValidProductId(id);

  const existing = await Product.findById(id);
  if (!existing) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
  }

  Object.assign(existing, input);
  await existing.save();

  return toPublicProduct(existing);
};

export const deleteProductById = async (id: string): Promise<void> => {
  ensureValidProductId(id);

  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
  }
};

export const getProductById = async (id: string): Promise<ProductPublic> => {
  ensureValidProductId(id);

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
  }

  return toPublicProduct(product);
};

const getSort = (sortBy: ProductListQuery['sortBy']): Record<string, 1 | -1> => {
  switch (sortBy) {
    case 'oldest':
      return { createdAt: 1 };
    case 'priceAsc':
      return { price: 1 };
    case 'priceDesc':
      return { price: -1 };
    case 'nameAsc':
      return { name: 1 };
    case 'nameDesc':
      return { name: -1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
};

export const listProducts = async (
  query: ProductListQuery,
): Promise<{
  items: ProductPublic[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}> => {
  const filters: Record<string, unknown> = {};

  if (query.search) {
    const keyword = query.search.trim();
    filters.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { material: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (query.category) {
    filters.category = query.category;
  }

  if (query.style) {
    filters.style = query.style;
  }

  const page = Math.max(1, query.page);
  const limit = Math.min(100, Math.max(1, query.limit));
  const skip = (page - 1) * limit;

  const [items, totalItems] = await Promise.all([
    Product.find(filters).sort(getSort(query.sortBy)).skip(skip).limit(limit),
    Product.countDocuments(filters),
  ]);

  return {
    items: items.map(toPublicProduct),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / limit),
    },
  };
};
