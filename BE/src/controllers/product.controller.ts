import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createProduct,
  deleteProductById,
  getNewArrivalsFacets,
  getProductById,
  getProductsByIds,
  listProducts,
  type NewArrivalsPriceRange,
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
    'featured',
    'newestFirst',
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
    'Sofas',
    'Tables',
    'Chairs',
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

const parseStringArrayQuery = (value: unknown): string[] | undefined => {
  if (typeof value === 'string') {
    const items = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    return items.length > 0 ? items : undefined;
  }

  if (Array.isArray(value)) {
    const items = value
      .flatMap((item) => (typeof item === 'string' ? item.split(',') : []))
      .map((item) => item.trim())
      .filter(Boolean);

    return items.length > 0 ? items : undefined;
  }

  return undefined;
};

const parseRequiredStringArrayQuery = (value: unknown): string[] => {
  return parseStringArrayQuery(value) ?? [];
};

const parseBooleanQuery = (value: unknown, fallback = false): boolean => {
  const raw = getQueryString(value);

  if (!raw) {
    return fallback;
  }

  const normalized = raw.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') {
    return true;
  }

  if (normalized === 'false' || normalized === '0') {
    return false;
  }

  return fallback;
};

const parsePriceRangesQuery = (value: unknown): NewArrivalsPriceRange[] | undefined => {
  const rawItems = parseStringArrayQuery(value);
  if (!rawItems) {
    return undefined;
  }

  const allowed = new Set<NewArrivalsPriceRange>(['under_1500', '1500_3000', '3000_5000', '5000_plus']);
  const valid = rawItems.filter((item): item is NewArrivalsPriceRange =>
    allowed.has(item as NewArrivalsPriceRange),
  );

  return valid.length > 0 ? valid : undefined;
};

const parseProductListQuery = (req: Request): ProductListQuery => ({
  page: parseNumberQuery(req.query.page, 1),
  limit: parseNumberQuery(req.query.limit, 12),
  search: getQueryString(req.query.search),
  category: parseCategoryQuery(req.query.category),
  style: parseStyleQuery(req.query.style),
  materials: parseStringArrayQuery(req.query.materials),
  colors: parseStringArrayQuery(req.query.colors),
  priceRanges: parsePriceRangesQuery(req.query.priceRanges),
  isNewOnly: parseBooleanQuery(req.query.isNewOnly, false),
  sortBy: parseSortByQuery(req.query.sortBy),
});

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

export const getProductsByIdsController = asyncHandler(async (req: Request, res: Response) => {
  const ids = parseRequiredStringArrayQuery(req.query.ids);
  const result = await getProductsByIds(ids);

  res.status(200).json({
    success: true,
    data: {
      items: result.items,
      missingIds: result.missingIds,
    },
  });
});

export const listProductsController = asyncHandler(async (req: Request, res: Response) => {
  const query = parseProductListQuery(req);

  const result = await listProducts(query);

  res.status(200).json({
    success: true,
    data: {
      items: result.items,
      pagination: result.pagination,
    },
  });
});

export const listDiscoveryController = asyncHandler(async (req: Request, res: Response) => {
  const query = parseProductListQuery(req);

  const [result, availableFilters] = await Promise.all([
    listProducts({
      ...query,
      isNewOnly: true,
      sortBy: query.sortBy ?? 'featured',
    }),
    getNewArrivalsFacets(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      items: result.items,
      pagination: result.pagination,
      filters: {
        materials: query.materials ?? [],
        colors: query.colors ?? [],
        priceRanges: query.priceRanges ?? [],
        sortBy: query.sortBy ?? 'featured',
      },
      availableFilters,
    },
  });
});
