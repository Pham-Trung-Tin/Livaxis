import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getMe, signOut } from '../services/authApi'

export type AuthUser = {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: 'user' | 'manager'
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  setUser: (user: AuthUser | null) => void
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const response = await getMe()
      setUser(response?.data?.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut()
    } finally {
      setUser(null)
    }
  }

  useEffect(() => {
    void refreshUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}