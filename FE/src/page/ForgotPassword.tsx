import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { forgotPassword } from '../services/authApi'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [emailFocused, setEmailFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [devToken, setDevToken] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setDevToken('')

    try {
      const response = await forgotPassword({ email })
      if (response?.data?.resetToken) {
        setDevToken(response.data.resetToken)
      }
      setSuccess(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Cannot process request')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await forgotPassword({ email })
      if (response?.data?.resetToken) {
        setDevToken(response.data.resetToken)
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Cannot process request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:block lg:w-[45%] xl:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1771888703723-01d85da1dae1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
          alt="Minimalist living room with neutral tones"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />

        <div className="absolute bottom-12 left-12 right-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h2
              className="text-white text-[32px] mb-3 tracking-tight"
              style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}
            >
              Livaxis
            </h2>
            <p className="text-white/90 text-[14px] max-w-md leading-relaxed" style={{ fontWeight: 300 }}>
              Curated luxury furniture for timeless living spaces
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-[55%] xl:w-1/2 flex items-center justify-center px-6 sm:px-12 lg:px-16 xl:px-24">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-12">
                  <h1
                    className="text-[36px] text-black mb-3 tracking-tight"
                    style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}
                  >
                    Reset Your Password
                  </h1>
                  <p className="text-[14px] text-neutral-500 leading-relaxed" style={{ fontWeight: 300 }}>
                    Enter the email address associated with your account and we will send you a recovery link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="relative">
                    <label
                      htmlFor="email"
                      className={`absolute left-0 transition-all duration-200 pointer-events-none ${
                        emailFocused || email
                          ? 'top-0 text-[10px] text-neutral-500 tracking-[0.08em] uppercase'
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
                      className="w-full pt-8 pb-3 text-[15px] text-black bg-transparent outline-none transition-all duration-200"
                      style={{
                        borderBottom: `1px solid ${emailFocused ? '#1a1a1a' : '#e5e5e5'}`,
                        fontWeight: 300,
                      }}
                      autoComplete="email"
                    />
                  </div>

                  {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-600">{error}</p> : null}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-lg bg-[#1a1a1a] text-white hover:bg-black transition-all duration-300 disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2.5">
                          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
                            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span className="text-[12px] tracking-[0.15em] uppercase" style={{ fontWeight: 500 }}>
                            Sending
                          </span>
                        </span>
                      ) : (
                        <span className="text-[12px] tracking-[0.15em] uppercase" style={{ fontWeight: 500 }}>
                          Send Reset Link
                        </span>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-8 text-center">
                  <button
                    onClick={() => navigate('/sign-in')}
                    className="inline-flex items-center gap-2 text-[13px] text-neutral-600 hover:text-black transition-colors duration-200"
                    style={{ fontWeight: 400 }}
                  >
                    <ArrowLeft size={14} strokeWidth={2} />
                    Back to Sign In
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex justify-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-[#1a1a1a] flex items-center justify-center"
                  >
                    <CheckCircle2 size={40} className="text-white" strokeWidth={1.5} />
                  </motion.div>
                </div>

                <div className="mb-10 text-center">
                  <h1
                    className="text-[36px] text-black mb-3 tracking-tight"
                    style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}
                  >
                    Check Your Email
                  </h1>
                  <p className="text-[14px] text-neutral-500 leading-relaxed" style={{ fontWeight: 300 }}>
                    A reset link has been sent to <span className="text-black" style={{ fontWeight: 500 }}>{email}</span>.
                    Please check your inbox and follow instructions to reset your password.
                  </p>
                  {devToken ? (
                    <p className="mt-4 rounded-md bg-neutral-100 px-3 py-2 text-[12px] text-neutral-700">Dev reset token: {devToken}</p>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => window.open('mailto:', '_blank')}
                    className="w-full py-4 rounded-lg bg-[#1a1a1a] text-white hover:bg-black transition-all duration-300"
                  >
                    <span className="text-[12px] tracking-[0.15em] uppercase" style={{ fontWeight: 500 }}>
                      Open Email App
                    </span>
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-[13px] text-neutral-500" style={{ fontWeight: 300 }}>
                      Did not receive it?{' '}
                      <button
                        onClick={handleResend}
                        disabled={loading}
                        className="text-black hover:text-neutral-600 transition-colors duration-200 underline underline-offset-2 disabled:opacity-50"
                        style={{ fontWeight: 400 }}
                      >
                        Resend
                      </button>
                    </p>
                  </div>
                </div>

                <div className="mt-10 text-center">
                  <button
                    onClick={() => navigate('/sign-in')}
                    className="inline-flex items-center gap-2 text-[13px] text-neutral-600 hover:text-black transition-colors duration-200"
                    style={{ fontWeight: 400 }}
                  >
                    <ArrowLeft size={14} strokeWidth={2} />
                    Back to Sign In
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
