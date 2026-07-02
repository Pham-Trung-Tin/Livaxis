export interface FeedbackData {
  name: string
  phone?: string
  email?: string
  service: string
  content: string
  language?: string
}

export interface FeedbackResponse {
  _id: string
  name: string
  phone?: string
  email?: string
  service: string
  content: string
  status: string
  createdAt: string
  updatedAt: string
}

const API_BASE = '/api/feedbacks'

export const submitFeedback = async (data: FeedbackData): Promise<FeedbackResponse> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'omit', // or 'include' if auth is needed
  })

  const responseData = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMessage = responseData?.error?.message || 'Failed to submit feedback'
    throw new Error(errorMessage)
  }

  return responseData?.data ?? null
}

export const getRandomFeedbacks = async (limit: number = 5): Promise<FeedbackResponse[]> => {
  const response = await fetch(`${API_BASE}/random?limit=${limit}`, {
    credentials: 'omit',
  })

  const responseData = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMessage = responseData?.error?.message || 'Failed to fetch random feedbacks'
    throw new Error(errorMessage)
  }

  return responseData?.data ?? []
}
