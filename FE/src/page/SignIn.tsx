import { Eye, EyeOff, Check, User, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth-context'
import { signIn } from '../services/authApi'

function SignIn() {
  const navigate = useNavigate()
  const { setUser, refreshUser } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [usernameFocused, setUsernameFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [step, setStep] = useState<'form' | 'success'>('form')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await signIn({ username, password })
      const userData = response?.data?.user ?? null
      setUser(userData)
      setSuccessMessage('Sign in successful. Redirecting...')
      setStep('success')
      const destination = userData?.role === 'admin' ? '/admin' : '/'
      window.setTimeout(() => {
        navigate(destination)
      }, 2000)
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
      setStep('success')
      void refreshUser().then((freshUser) => {
        // refreshUser updates context; read from context via the auth hook after refresh
        window.setTimeout(() => {
          navigate('/')
        }, 2000)
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
          <AnimatePresence mode="wait">
            {step === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center py-16 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0ece4]"
                >
                  <Check size={28} className="text-[#a08c6a]" strokeWidth={1.5} />
                </motion.div>
                <h2
                  className="mb-3 text-[32px] text-black"
                  style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
                >
                  Welcome to Livaxis
                </h2>
                <p className="text-[13px] text-neutral-400" style={{ fontWeight: 300 }}>
                  Signed in successfully. Redirecting you home...
                </p>
                <motion.div
                  className="mt-8 h-px bg-[#c8b898]"
                  initial={{ width: 0 }}
                  animate={{ width: '80px' }}
                  transition={{ duration: 1.8, ease: 'easeOut' }}
                />
              </motion.div>
            ) : (
              <div key="form">
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
                    <div
                      className="relative flex items-center gap-3 pb-2 pt-6 transition-all duration-200"
                      style={{
                        borderBottom: `1px solid ${usernameFocused ? '#1a1a1a' : '#e5e5e5'}`,
                      }}
                    >
                      <User
                        size={18}
                        className={`transition-colors duration-200 ${
                          usernameFocused ? 'text-black' : 'text-neutral-400'
                        }`}
                        strokeWidth={1.5}
                      />
                      <div className="relative flex-1">
                        <label
                          htmlFor="username"
                          className={`pointer-events-none absolute left-0 transition-all duration-200 ${
                            usernameFocused || username
                              ? '-top-4 text-[10px] uppercase tracking-[0.08em] text-neutral-500'
                              : 'top-0 text-[14px] text-neutral-400'
                          }`}
                          style={{ fontWeight: usernameFocused || username ? 500 : 300 }}
                        >
                          Username or Email
                        </label>
                        <input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          onFocus={() => setUsernameFocused(true)}
                          onBlur={() => setUsernameFocused(false)}
                          required
                          className="w-full bg-transparent text-[15px] text-black outline-none"
                          style={{
                            fontWeight: 300,
                          }}
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    <div
                      className="relative flex items-center gap-3 pb-2 pt-6 transition-all duration-200"
                      style={{
                        borderBottom: `1px solid ${passwordFocused ? '#1a1a1a' : '#e5e5e5'}`,
                      }}
                    >
                      <Lock
                        size={18}
                        className={`transition-colors duration-200 ${
                          passwordFocused ? 'text-black' : 'text-neutral-400'
                        }`}
                        strokeWidth={1.5}
                      />
                      <div className="relative flex-1">
                        <label
                          htmlFor="password"
                          className={`pointer-events-none absolute left-0 transition-all duration-200 ${
                            passwordFocused || password
                              ? '-top-4 text-[10px] uppercase tracking-[0.08em] text-neutral-500'
                              : 'top-0 text-[14px] text-neutral-400'
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
                          className="w-full bg-transparent pr-8 text-[15px] text-black outline-none"
                          style={{
                            fontWeight: 300,
                          }}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors duration-200 hover:text-neutral-700"
                          tabIndex={-1}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                        </button>
                      </div>
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
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default SignIn
