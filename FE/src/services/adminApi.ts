const API_BASE = '/api/admin'

export type AdminUser = {
  id: string
  name: string
  email: string
  avatarUrl?: string
  subscriptionPlan: 'starter' | 'standard' | 'premium' | null
  aiTurns: number
  aiTurnsUsed: number
  isActive: boolean
  createdAt: string
}

export type AdminUserListResponse = {
  items: AdminUser[]
  total: number
  newThisMonth: number
}

export type AdminDashboardStats = {
  totalActiveUsers: number
  aiTurnsConsumed: number
  newUsersThisWeek: number
}

export type AdminProduct = {
  id: string
  sku?: string
  name: string
  category: string
  stock: number
  price: number
  createdAt: string
}

export type AdminProductListResponse = {
  items: AdminProduct[]
  alertCount: number
}

export type SubscriptionPlanStat = {
  plan: 'starter' | 'standard' | 'premium'
  price: number
  userCount: number
  revenue: number
}

export type SubscriptionStatsResponse = {
  plans: SubscriptionPlanStat[]
  totalUsers: number
  mrr: number
  arpu: number
}

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
    const errorMessage = data?.error?.message || 'Request failed'
    throw new Error(errorMessage)
  }

  return data
}

export const getAdminUsers = async (params: {
  page?: number
  limit?: number
  search?: string
} = {}): Promise<AdminUserListResponse> => {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)
  const qs = query.toString() ? `?${query.toString()}` : ''
  const data = await request<{ data: AdminUserListResponse }>(`/users${qs}`)
  return data.data
}

export const updateUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
  await request(`/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  })
}

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  const data = await request<{ data: AdminDashboardStats }>('/dashboard')
  return data.data
}

export const getAdminProducts = async (): Promise<AdminProductListResponse> => {
  const data = await request<{ data: AdminProductListResponse }>('/products')
  return data.data
}

export const getSubscriptionStats = async (): Promise<SubscriptionStatsResponse> => {
  const data = await request<{ data: SubscriptionStatsResponse }>('/subscriptions')
  return data.data
}
