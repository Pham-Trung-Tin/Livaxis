const API_BASE = '/api/designs'

export type DesignProduct = {
  productId: string
  x: number
  y: number
  scale: number
  rotation: number
  rotationY?: number
  flipped?: boolean
}

export type DesignPayload = {
  name: string
  beforeImageUrl: string
  afterImageUrl: string
  products: DesignProduct[]
  prompt?: string
  stylePreset?: string
}

export type UserDesign = {
  _id: string
  userId: string
  name: string
  beforeImageUrl: string
  afterImageUrl: string
  products: DesignProduct[]
  prompt: string
  stylePreset: string
  createdAt: string
  updatedAt: string
}

export const saveDesign = async (payload: DesignPayload): Promise<UserDesign> => {
  const response = await fetch(`${API_BASE}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Failed to save design')
  }

  return data?.data
}

export const getUserDesigns = async (): Promise<UserDesign[]> => {
  const response = await fetch(`${API_BASE}`, { credentials: 'include' })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Failed to get user designs')
  }

  return data?.data
}

export const deleteDesign = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Failed to delete design')
  }

  return data
}
