import { type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import { useLanguage } from '../../contexts/LanguageContext'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f0eb',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <svg
            style={{ animation: 'auth-spin 0.9s linear infinite' }}
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle opacity={0.2} cx="12" cy="12" r="10" stroke="#1a1a1a" strokeWidth="3" />
            <path opacity={0.8} fill="#1a1a1a" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, fontSize: 13, color: 'rgba(26,26,26,0.5)', margin: 0 }}>
            {t('common.loading')}
          </p>
        </div>
        <style>{`@keyframes auth-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) {
    const handleSignIn = () => {
      navigate('/sign-in', { state: { from: location } })
    }

    const handleSignUp = () => {
      navigate('/sign-up')
    }

    return (
      <>
        {/* Page content blurred in background */}
        <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none' }}>
          {children}
        </div>

        {/* Overlay */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(245, 240, 235, 0.55)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        >
          {/* Modal card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 2,
              padding: '52px 48px 48px',
              maxWidth: 420,
              width: 'calc(100% - 40px)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
              animation: 'auth-modal-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            {/* Decorative line top */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 40,
                height: 2,
                background: '#1a1a1a',
                borderRadius: 1,
              }}
            />

            {/* Icon */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#f5f0eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            {/* Eyebrow */}
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(26,26,26,0.4)',
                margin: '0 0 12px',
              }}
            >
              AI Room Planner
            </p>

            {/* Heading */}
            <h2
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 28,
                fontWeight: 400,
                color: '#1a1a1a',
                margin: '0 0 14px',
                lineHeight: 1.2,
              }}
            >
              {t('guards.signInToContinue')}
            </h2>

            {/* Body */}
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                fontWeight: 300,
                color: 'rgba(26,26,26,0.55)',
                margin: '0 0 36px',
                lineHeight: 1.6,
              }}
            >
              {t('guards.authGuardDesc')}
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={handleSignIn}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  background: '#1a1a1a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 2,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => ((e.target as HTMLButtonElement).style.background = '#333')}
                onMouseLeave={e => ((e.target as HTMLButtonElement).style.background = '#1a1a1a')}
              >
                {t('guards.signIn')}
              </button>

              <button
                onClick={handleSignUp}
                style={{
                  width: '100%',
                  padding: '13px 24px',
                  background: 'transparent',
                  color: '#1a1a1a',
                  border: '1px solid #e5e5e5',
                  borderRadius: 2,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => {
                  const btn = e.target as HTMLButtonElement
                  btn.style.borderColor = '#1a1a1a'
                  btn.style.background = '#f9f9f9'
                }}
                onMouseLeave={e => {
                  const btn = e.target as HTMLButtonElement
                  btn.style.borderColor = '#e5e5e5'
                  btn.style.background = 'transparent'
                }}
              >
                {t('guards.createAccount')}
              </button>
            </div>

            {/* Footer note */}
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fontWeight: 300,
                color: 'rgba(26,26,26,0.35)',
                margin: '24px 0 0',
              }}
            >
              {t('guards.freeToJoin')}
            </p>
          </div>
        </div>

        <style>{`
          @keyframes auth-spin {
            to { transform: rotate(360deg); }
          }
          @keyframes auth-modal-in {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.97);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
      </>
    )
  }

  return <>{children}</>
}
