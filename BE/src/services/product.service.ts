import { Types } from 'mongoose';
import Product, { type IProduct } from '../models/product.model';
import { AppError } from '../utils/appError';

type CreateProductInput = {
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
  style?: 'Minimalist' | 'Modern Luxury' | 'Industrial';
  dimensions?: string;
  material?: string;
  color?: string;
  colorHex?: string;
  isNew?: boolean;
  stock?: number;
};

type UpdateProductInput = Partial<CreateProductInput>;

export type ProductPublic = {
  id: string;
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
};

export type NewArrivalsPriceRange =
  | 'under_1500'
  | '1500_3000'
  | '3000_5000'
  | '5000_plus';

export type ProductListQuery = {
  page: number;
  limit: number;
  search?: string;
  category?: ProductPublic['category'];
  style?: ProductPublic['style'];
  materials?: string[];
  colors?: string[];
  priceRanges?: NewArrivalsPriceRange[];
  isNewOnly?: boolean;
  sortBy?:
    | 'newest'
    | 'oldest'
    | 'priceAsc'
    | 'priceDesc'
    | 'nameAsc'
    | 'nameDesc'
    | 'featured'
    | 'newestFirst';
};

const toPublicProduct = (product: IProduct): ProductPublic => ({
  id: product._id.toString(),
  name: product.name,
  subtitle: product.subtitle,
  category: product.category,
  price: product.price,
  imageUrl: product.imageUrl,
  description: product.description,
  style: product.style,
  dimensions: product.dimensions,
  material: product.material,
  color: product.color,
  colorHex: product.colorHex,
  isNew: product.isNew,
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
    case 'featured':
    case 'newestFirst':
      return { isNew: -1, createdAt: -1 };
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

const getPriceRangesFilter = (ranges: NewArrivalsPriceRange[]): Record<string, unknown>[] => {
  return ranges.map((range) => {
    switch (range) {
      case 'under_1500':
        return { price: { $lt: 1500 } };
      case '1500_3000':
        return { price: { $gte: 1500, $lt: 3000 } };
      case '3000_5000':
        return { price: { $gte: 3000, $lt: 5000 } };
      case '5000_plus':
      default:
        return { price: { $gte: 5000 } };
    }
  });
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
  const filters: Record<string, unknown>[] = [];

  if (query.search) {
    const keyword = query.search.trim();
    filters.push({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { subtitle: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { material: { $regex: keyword, $options: 'i' } },
      ],
    });
  }

  if (query.category) {
    filters.push({ category: query.category });
  }

  if (query.style) {
    filters.push({ style: query.style });
  }

  if (query.isNewOnly) {
    filters.push({ isNew: true });
  }

  if (query.materials && query.materials.length > 0) {
    filters.push({ material: { $in: query.materials } });
  }

  if (query.colors && query.colors.length > 0) {
    filters.push({ color: { $in: query.colors } });
  }

  if (query.priceRanges && query.priceRanges.length > 0) {
    filters.push({ $or: getPriceRangesFilter(query.priceRanges) });
  }

  const queryFilters = filters.length === 0 ? {} : { $and: filters };

  const page = Math.max(1, query.page);
  const limit = Math.min(100, Math.max(1, query.limit));
  const skip = (page - 1) * limit;

  const [items, totalItems] = await Promise.all([
    Product.find(queryFilters).sort(getSort(query.sortBy)).skip(skip).limit(limit),
    Product.countDocuments(queryFilters),
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

export const getNewArrivalsFacets = async (): Promise<{
  materials: string[];
  colors: Array<{ name: string; hex: string }>;
}> => {
  const [materials, colorRows] = await Promise.all([
    Product.distinct('material', { isNew: true, material: { $exists: true, $ne: '' } }),
    Product.aggregate<{ name: string; hex: string }>([
      { $match: { isNew: true, color: { $exists: true, $ne: '' }, colorHex: { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$color',
          name: { $first: '$color' },
          hex: { $first: '$colorHex' },
        },
      },
      { $project: { _id: 0, name: 1, hex: 1 } },
      { $sort: { name: 1 } },
    ]),
  ]);

  return {
    materials: materials.filter((value): value is string => typeof value === 'string').sort((a, b) => a.localeCompare(b)),
    colors: colorRows,
  };
};
