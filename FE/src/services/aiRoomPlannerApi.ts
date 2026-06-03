const API_BASE = '/api/ai-room-planner'

export type AiProduct = {
  id: string
  name: string
  category: string
  placement?: {
    flipped?: boolean
    rotation?: number
  }
}

export type GeneratePayload = {
  roomImage: string
  maskImage?: string | null
  products: AiProduct[]
  prompt?: string
  style?: string
  pipelineMode?: 'composite' | 'generative'
}

export type GenerateResult = {
  mode: string
  provider: string
  providerLabel: string
  realAiEnabled: boolean
  imageDataUrl: string | null
  prompt: string
  message: string
  notes: string[]
}

export type AiStatus = {
  ok: boolean
  provider: string
  label: string
  realAiEnabled: boolean
}

export type TurnsInfo = {
  unlimited: boolean
  subscriptionPlan: string | null
  turnsUsed: number | null
  turnsRemaining: number | null
  dailyLimit: number | null
}

export const getAiTurns = async (): Promise<TurnsInfo> => {
  const response = await fetch(`${API_BASE}/turns`, { credentials: 'include' })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Failed to get AI turns info')
  }

  return data?.data
}

export type RemoveBackgroundPayload = {
  imageUrl?: string
  imageDataUrl?: string
}

export type RemoveBackgroundResult = {
  provider: string
  providerLabel: string
  realAiEnabled: boolean
  imageDataUrl: string
  message: string
}

export const getAiStatus = async (): Promise<AiStatus> => {
  const response = await fetch(`${API_BASE}/status`, { credentials: 'include' })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Failed to get AI status')
  }

  return data?.data
}

export const generateRoom = async (payload: GeneratePayload): Promise<GenerateResult> => {
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Generation failed')
  }

  return data?.data
}

export const removeProductBackground = async (
  payload: RemoveBackgroundPayload,
): Promise<RemoveBackgroundResult> => {
  const response = await fetch(`${API_BASE}/remove-background`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Background removal failed')
  }

  return data?.data
}
