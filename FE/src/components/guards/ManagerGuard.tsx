import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'

interface ManagerGuardProps {
  children: ReactNode
}

export function ManagerGuard({ children }: ManagerGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f]">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="#a08c6a" strokeWidth="3" />
            <path className="opacity-80" fill="#a08c6a" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-white/40" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
            Verifying access...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />
  }

  if (user.role !== 'manager') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
