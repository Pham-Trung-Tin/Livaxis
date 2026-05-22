type NewArrivalsSort = 'featured' | 'priceAsc' | 'priceDesc' | 'newestFirst'

type NewArrivalsPriceRange = 'under_1500' | '1500_3000' | '3000_5000' | '5000_plus'

export type NewArrivalProduct = {
  id: string
  name: string
  subtitle?: string
  category: string
  price: number
  imageUrl: string
  material?: string
  color?: string
  colorHex?: string
  isNew: boolean
  affiliateUrl?: string
}

export type NewArrivalsResponse = {
  items: NewArrivalProduct[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
  availableFilters: {
    materials: string[]
    colors: Array<{ name: string; hex: string }>
  }
}

export type GetNewArrivalsParams = {
  page?: number
  limit?: number
  materials?: string[]
  colors?: string[]
  priceRanges?: NewArrivalsPriceRange[]
  sortBy?: NewArrivalsSort
}

const API_BASE = '/api/products'

const toQueryString = (params: GetNewArrivalsParams): string => {
  const query = new URLSearchParams()

  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.sortBy) query.set('sortBy', params.sortBy)

  if (params.materials && params.materials.length > 0) {
    query.set('materials', params.materials.join(','))
  }

  if (params.colors && params.colors.length > 0) {
    query.set('colors', params.colors.join(','))
  }

  if (params.priceRanges && params.priceRanges.length > 0) {
    query.set('priceRanges', params.priceRanges.join(','))
  }

  const output = query.toString()
  return output ? `?${output}` : ''
}

export const getNewArrivals = async (
  params: GetNewArrivalsParams = {},
): Promise<NewArrivalsResponse> => {
  const queryString = toQueryString(params)
  const response = await fetch(`${API_BASE}${queryString}`, {
    credentials: 'include',
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMessage = data?.error?.message || 'Failed to load new arrivals'
    throw new Error(errorMessage)
  }

  return {
    items: data?.data?.items ?? [],
    pagination: data?.data?.pagination ?? {
      page: 1,
      limit: 9,
      totalItems: 0,
      totalPages: 0,
    },
    availableFilters: data?.data?.availableFilters ?? {
      materials: [],
      colors: [],
    },
  }
}

export const getFeaturedProducts = async (limit: number = 6): Promise<NewArrivalProduct[]> => {
  const response = await fetch(`${API_BASE}?limit=${limit}&isNewOnly=true&sortBy=featured`, {
    credentials: 'include',
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMessage = data?.error?.message || 'Failed to load featured products'
    throw new Error(errorMessage)
  }

  return data?.data?.items ?? []
}

export type ProductDetail = {
  id: string
  name: string
  subtitle?: string
  category: string
  price: number
  imageUrl: string
  images?: string[]       // Mảng ảnh thumbnail từ Cloudinary
  description?: string
  style?: string
  dimensions?: string
  material?: string
  color?: string
  colorHex?: string
  isNew?: boolean
  stock?: number
  affiliateUrl?: string
}

export type ProductsByIdsResponse = {
  items: ProductDetail[]
  missingIds: string[]
}

export const getProductById = async (id: string): Promise<ProductDetail> => {
  const response = await fetch(`${API_BASE}/${id}`, { credentials: 'include' })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMessage = data?.error?.message || 'Failed to load product'
    throw new Error(errorMessage)
  }

  return data?.data?.product ?? null
}

export const getProductsByIds = async (ids: string[]): Promise<ProductsByIdsResponse> => {
  if (ids.length === 0) {
    return {
      items: [],
      missingIds: [],
    }
  }

  const query = new URLSearchParams()
  query.set('ids', ids.join(','))

  const response = await fetch(`${API_BASE}/batch?${query.toString()}`, {
    credentials: 'include',
  })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMessage = data?.error?.message || 'Failed to load cart items'
    throw new Error(errorMessage)
  }

  return {
    items: data?.data?.items ?? [],
    missingIds: data?.data?.missingIds ?? [],
  }
}
