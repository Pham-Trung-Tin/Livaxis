import { Types } from 'mongoose';
import Product, { type IProduct } from '../models/product.model';
import { AppError } from '../utils/appError';

type ProductImageInput = {
  url: string;
  publicId?: string;
  alt?: string;
};

type CreateProductInput = {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  stock: number;
  category: string;
  tags?: string[];
  images?: ProductImageInput[];
  isFeatured?: boolean;
  isPublished?: boolean;
};

type UpdateProductInput = Partial<CreateProductInput>;

export type ProductPublic = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  stock: number;
  category: string;
  tags: string[];
  images: ProductImageInput[];
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductListQuery = {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  tag?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  sortBy?: 'newest' | 'oldest' | 'priceAsc' | 'priceDesc' | 'nameAsc' | 'nameDesc';
};

const toPublicProduct = (product: IProduct): ProductPublic => ({
  id: product._id.toString(),
  name: product.name,
  slug: product.slug,
  description: product.description,
  shortDescription: product.shortDescription,
  sku: product.sku,
  price: product.price,
  compareAtPrice: product.compareAtPrice,
  currency: product.currency,
  stock: product.stock,
  category: product.category,
  tags: product.tags,
  images: product.images,
  isFeatured: product.isFeatured,
  isPublished: product.isPublished,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

const ensureValidProductId = (id: string): void => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'INVALID_PRODUCT_ID', 'Product id is invalid');
  }
};

const ensureComparablePrice = (price: number | undefined, compareAtPrice: number | undefined): void => {
  if (price === undefined || compareAtPrice === undefined) {
    return;
  }

  if (compareAtPrice < price) {
    throw new AppError(
      400,
      'INVALID_COMPARE_PRICE',
      'Compare at price must be greater than or equal to price',
    );
  }
};

export const createProduct = async (input: CreateProductInput): Promise<ProductPublic> => {
  ensureComparablePrice(input.price, input.compareAtPrice);

  const product = await Product.create(input);
  return toPublicProduct(product);
};

export const updateProductById = async (id: string, input: UpdateProductInput): Promise<ProductPublic> => {
  ensureValidProductId(id);

  const existing = await Product.findById(id);
  if (!existing) {
    throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
  }

  const nextPrice = input.price ?? existing.price;
  const nextCompareAtPrice =
    input.compareAtPrice !== undefined ? input.compareAtPrice : existing.compareAtPrice;

  ensureComparablePrice(nextPrice, nextCompareAtPrice);

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
      { shortDescription: { $regex: keyword, $options: 'i' } },
      { sku: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (query.category) {
    filters.category = query.category.trim().toLowerCase();
  }

  if (query.tag) {
    filters.tags = query.tag.trim().toLowerCase();
  }

  if (query.isFeatured !== undefined) {
    filters.isFeatured = query.isFeatured;
  }

  if (query.isPublished !== undefined) {
    filters.isPublished = query.isPublished;
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
