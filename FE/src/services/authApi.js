const API_BASE = '/api/auth'

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
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

export const signIn = (payload) => {
  return request('/signin', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const signUp = (payload) => {
  return request('/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const getMe = () => {
  return request('/me')
}

export const signOut = () => {
  return request('/signout', { method: 'POST' })
}

export const forgotPassword = (payload) => {
  return request('/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const resetPassword = (payload) => {
  return request('/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}