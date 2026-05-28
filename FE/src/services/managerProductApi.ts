const API_BASE = '/api/products'

export type ManagerProduct = {
  id: string
  name: string
  subtitle?: string
  category:
    | 'Lounge Chair'
    | 'Seating'
    | 'Dining'
    | 'Lighting'
    | 'Accent'
    | 'Storage'
    | 'Sofas'
    | 'Tables'
    | 'Chairs'
  style: 'Minimalist' | 'Modern Luxury' | 'Industrial'
  price: number
  imageUrl: string
  images: string[]
  description?: string
  material?: string
  color?: string
  colorHex?: string
  dimensions?: string
  affiliateUrl: string
  createdAt: string
  updatedAt: string
}

export type ManagerProductListResponse = {
  items: ManagerProduct[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export type CreateProductPayload = Omit<ManagerProduct, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateProductPayload = Partial<CreateProductPayload>

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) ?? {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const validationMessage = Array.isArray(data?.error?.details)
      ? data.error.details?.[0]?.message
      : undefined
    const errorMessage = validationMessage || data?.error?.message || 'Request failed'
    throw new Error(errorMessage)
  }

  return data
}

export const listManagerProducts = async (params: {
  page?: number
  limit?: number
  search?: string
  category?: string
  style?: string
}): Promise<ManagerProductListResponse> => {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)
  if (params.category) query.set('category', params.category)
  if (params.style) query.set('style', params.style)

  const qs = query.toString() ? `?${query.toString()}` : ''
  const data = await request<{ data: { items: ManagerProduct[]; pagination: ManagerProductListResponse['pagination'] } }>(qs)
  return {
    items: data.data.items ?? [],
    pagination: data.data.pagination ?? { page: 1, limit: 12, totalItems: 0, totalPages: 0 },
  }
}

export const getManagerProductById = async (id: string): Promise<ManagerProduct> => {
  const data = await request<{ data: { product: ManagerProduct } }>(`/${id}`)
  return data.data.product
}

export const createManagerProduct = async (payload: CreateProductPayload): Promise<ManagerProduct> => {
  const data = await request<{ data: { product: ManagerProduct } }>('', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.data.product
}

export const updateManagerProduct = async (id: string, payload: UpdateProductPayload): Promise<ManagerProduct> => {
  const data = await request<{ data: { product: ManagerProduct } }>(`/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return data.data.product
}

export const deleteManagerProduct = async (id: string): Promise<void> => {
  await request(`/${id}`, { method: 'DELETE' })
}
