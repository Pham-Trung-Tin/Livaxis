import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createProduct,
  deleteProductById,
  getProductById,
  listProducts,
  type ProductListQuery,
  updateProductById,
} from '../services/product.service';

const getQueryString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0];
  }

  return undefined;
};

const parseNumberQuery = (value: unknown, fallback: number): number => {
  const raw = getQueryString(value);
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseSortByQuery = (value: unknown): ProductListQuery['sortBy'] => {
  const raw = getQueryString(value);
  const allowed: ProductListQuery['sortBy'][] = [
    'newest',
    'oldest',
    'priceAsc',
    'priceDesc',
    'nameAsc',
    'nameDesc',
  ];

  if (raw && allowed.includes(raw as ProductListQuery['sortBy'])) {
    return raw as ProductListQuery['sortBy'];
  }

  return 'newest';
};

const parseCategoryQuery = (value: unknown): ProductListQuery['category'] | undefined => {
  const raw = getQueryString(value);
  const allowed: NonNullable<ProductListQuery['category']>[] = [
    'Lounge Chair',
    'Seating',
    'Dining',
    'Lighting',
    'Accent',
    'Storage',
  ];

  if (raw && allowed.includes(raw as NonNullable<ProductListQuery['category']>)) {
    return raw as NonNullable<ProductListQuery['category']>;
  }

  return undefined;
};

const parseStyleQuery = (value: unknown): ProductListQuery['style'] | undefined => {
  const raw = getQueryString(value);
  const allowed: NonNullable<ProductListQuery['style']>[] = [
    'Minimalist',
    'Modern Luxury',
    'Industrial',
  ];

  if (raw && allowed.includes(raw as NonNullable<ProductListQuery['style']>)) {
    return raw as NonNullable<ProductListQuery['style']>;
  }

  return undefined;
};

const getPathParam = (value: string | string[] | undefined): string => {
  if (typeof value === 'string') {
    return value;
  }

  return '';
};

export const createProductController = asyncHandler(async (req: Request, res: Response) => {
  const product = await createProduct(req.body);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: {
      product,
    },
  });
});

export const updateProductController = asyncHandler(async (req: Request, res: Response) => {
  const product = await updateProductById(getPathParam(req.params.id), req.body);

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: {
      product,
    },
  });
});

export const deleteProductController = asyncHandler(async (req: Request, res: Response) => {
  await deleteProductById(getPathParam(req.params.id));

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

export const getProductByIdController = asyncHandler(async (req: Request, res: Response) => {
  const product = await getProductById(getPathParam(req.params.id));

  res.status(200).json({
    success: true,
    data: {
      product,
    },
  });
});

export const listProductsController = asyncHandler(async (req: Request, res: Response) => {
  const query: ProductListQuery = {
    page: parseNumberQuery(req.query.page, 1),
    limit: parseNumberQuery(req.query.limit, 12),
    search: getQueryString(req.query.search),
    category: parseCategoryQuery(req.query.category),
    style: parseStyleQuery(req.query.style),
    sortBy: parseSortByQuery(req.query.sortBy),
  };

  const result = await listProducts(query);

  res.status(200).json({
    success: true,
    data: {
      items: result.items,
      pagination: result.pagination,
    },
  });
});
