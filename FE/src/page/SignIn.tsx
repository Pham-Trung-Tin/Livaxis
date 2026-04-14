import { Eye, EyeOff } from 'lucide-react'
import { motion } from 'motion/react'
import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth-context'
import { signIn } from '../services/authApi'

function SignIn() {
  const navigate = useNavigate()
  const { setUser, refreshUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await signIn({ email, password })
      setUser(response?.data?.user ?? null)
      setSuccessMessage('Sign in successful. Redirecting...')
      window.setTimeout(() => {
        navigate('/')
      }, 600)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed'
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const social = params.get('social')
    const status = params.get('status')

    if (social !== 'google') {
      return
    }

    if (status === 'success') {
      setErrorMessage('')
      setSuccessMessage('Google sign in successful. Redirecting...')
      void refreshUser().then(() => {
        window.setTimeout(() => {
          navigate('/')
        }, 500)
      })
      return
    }

    if (status === 'failed') {
      setSuccessMessage('')
      setErrorMessage('Google sign in failed. Please try again.')
    }
  }, [navigate, refreshUser])

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden overflow-hidden lg:block lg:w-[45%] xl:w-1/2">
        <img
          src="https://images.unsplash.com/photo-1771888703723-01d85da1dae1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
          alt="Minimalist living room with neutral tones"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/15 via-transparent to-black/35" />

        <div className="absolute bottom-12 left-10 right-10 xl:left-14 xl:right-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2
              className="mb-3 text-[34px] tracking-tight text-white"
              style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}
            >
              Livaxis
            </h2>
            <p className="max-w-md text-[14px] leading-relaxed text-white/90" style={{ fontWeight: 300 }}>
              Curated luxury furniture for timeless living spaces
            </p>
          </motion.div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 sm:px-12 lg:w-[55%] lg:px-16 xl:w-1/2 xl:px-24">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1
              className="mb-3 text-[36px] tracking-tight text-black"
              style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}
            >
              Welcome Back
            </h1>
            <p className="text-[14px] text-neutral-500" style={{ fontWeight: 300 }}>
              Sign in to continue to your account
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <form onSubmit={handleSubmit} className="mb-8 space-y-6">
              <div className="relative">
                <label
                  htmlFor="email"
                  className={`pointer-events-none absolute left-0 transition-all duration-200 ${
                    emailFocused || email
                      ? 'top-0 text-[10px] uppercase tracking-[0.08em] text-neutral-500'
                      : 'top-4 text-[14px] text-neutral-400'
                  }`}
                  style={{ fontWeight: emailFocused || email ? 500 : 300 }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  className="w-full bg-transparent pb-3 pt-8 text-[15px] text-black outline-none transition-all duration-200"
                  style={{
                    borderBottom: `1px solid ${emailFocused ? '#1a1a1a' : '#e5e5e5'}`,
                    fontWeight: 300,
                  }}
                  autoComplete="email"
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="password"
                  className={`pointer-events-none absolute left-0 transition-all duration-200 ${
                    passwordFocused || password
                      ? 'top-0 text-[10px] uppercase tracking-[0.08em] text-neutral-500'
                      : 'top-4 text-[14px] text-neutral-400'
                  }`}
                  style={{ fontWeight: passwordFocused || password ? 500 : 300 }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  className="w-full bg-transparent pb-3 pt-8 pr-10 text-[15px] text-black outline-none transition-all duration-200"
                  style={{
                    borderBottom: `1px solid ${passwordFocused ? '#1a1a1a' : '#e5e5e5'}`,
                    fontWeight: 300,
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute bottom-3 right-0 text-neutral-400 transition-colors duration-200 hover:text-neutral-700"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[12px] text-neutral-500 transition-colors duration-200 hover:text-black"
                  style={{ fontWeight: 400 }}
                >
                  Forgot Password?
                </button>
              </div>

              <div className="pt-2">
                {errorMessage ? (
                  <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-600">{errorMessage}</p>
                ) : null}
                {successMessage ? (
                  <p className="mb-3 rounded-md bg-green-50 px-3 py-2 text-[12px] text-green-700">{successMessage}</p>
                ) : null}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-[#1a1a1a] py-4 text-white transition-all duration-300 hover:bg-black disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2.5">
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-[12px] uppercase tracking-[0.15em]" style={{ fontWeight: 500 }}>
                        Signing In
                      </span>
                    </span>
                  ) : (
                    <span className="text-[12px] uppercase tracking-[0.15em]" style={{ fontWeight: 500 }}>
                      Sign In
                    </span>
                  )}
                </button>
              </div>
            </form>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-white px-4 text-neutral-400" style={{ fontWeight: 400 }}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mb-10 space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-300 py-3.5 transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-[13px] text-neutral-700" style={{ fontWeight: 400 }}>
                  Continue with Google
                </span>
              </button>

              <button
                type="button"
                onClick={() => setErrorMessage('Apple login is not implemented yet.')}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-300 py-3.5 transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                  <path d="M14.945 9.652c-.027-2.88 2.35-4.267 2.457-4.337-1.338-1.955-3.421-2.224-4.162-2.253-1.773-.18-3.458 1.043-4.357 1.043-.898 0-2.288-1.017-3.763-.99-1.937.028-3.722 1.127-4.719 2.863-2.01 3.492-.514 8.663 1.445 11.494.958 1.386 2.1 2.943 3.601 2.889 1.448-.057 1.994-.937 3.742-.937 1.748 0 2.239.937 3.763.908 1.552-.027 2.563-1.406 3.52-2.793 1.108-1.604 1.565-3.157 1.591-3.238-.035-.015-3.05-1.17-3.077-4.643l-.041-.006z" />
                  <path d="M12.19 2.325C12.96 1.396 13.48.103 13.325.001c-1.145.047-2.532.762-3.353 1.72-.736.852-1.38 2.212-1.208 3.517 1.278.099 2.582-.649 3.426-1.913z" />
                </svg>
                <span className="text-[13px] text-neutral-700" style={{ fontWeight: 400 }}>
                  Continue with Apple
                </span>
              </button>
            </div>

            <div className="text-center">
              <p className="text-[13px] text-neutral-500" style={{ fontWeight: 300 }}>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => navigate('/sign-up')}
                  className="text-black underline underline-offset-2 transition-colors duration-200 hover:text-neutral-600"
                  style={{ fontWeight: 400 }}
                >
                  Create one
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default SignIn
