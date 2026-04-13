import { ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SignIn() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    // Placeholder async behavior to mimic authentication request.
    window.setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fffdf9_0%,#fbf7f1_55%,#f4efe6_100%)] text-[#141311]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col justify-center px-5 py-10 sm:px-8 lg:px-16">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[680px] -translate-x-1/2 bg-[radial-gradient(circle,rgba(200,184,152,0.22)_0%,rgba(200,184,152,0)_68%)]" />

        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute left-3 top-7 z-10 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-neutral-400 transition-colors duration-200 hover:text-[#8a7456] sm:left-4 sm:top-8 lg:left-6"
          style={{ fontWeight: 500 }}
        >
          <ArrowLeft size={13} strokeWidth={1.8} />
          Back to Home
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto w-full max-w-[460px] overflow-hidden rounded-[28px] border border-black/5 bg-white/90 shadow-[0_24px_80px_rgba(28,22,16,0.10)] backdrop-blur-md"
        >
          <div className="border-b border-black/5 px-8 pb-7 pt-8">
            <p
              className="text-[12px] uppercase tracking-[0.28em] text-[#a08c6a]"
              style={{ fontWeight: 500 }}
            >
              Welcome Back
            </p>
            <h1
              className="mt-2 text-[40px] leading-none tracking-[-0.03em] text-[#1d1814]"
              style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}
            >
              Sign In
            </h1>
            <p className="mt-3 max-w-[320px] text-[13px] leading-relaxed text-neutral-500" style={{ fontWeight: 300 }}>
              Continue your interior journey and manage saved rooms, pieces, and AI previews.
            </p>
          </div>

          <div className="px-8 pt-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <label
                  htmlFor="email"
                  className={`pointer-events-none absolute left-0 transition-all duration-200 ${
                    emailFocused || email
                      ? 'top-2 text-[10px] uppercase tracking-[0.10em] text-neutral-400'
                      : 'top-[22px] text-[13px] text-neutral-400'
                  }`}
                  style={{ fontWeight: emailFocused || email ? 400 : 300 }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  className="w-full border-b bg-transparent pb-2 pt-7 text-[14px] text-black outline-none transition-all duration-200"
                  style={{
                    borderColor: emailFocused ? '#1a1a1a' : 'rgba(0,0,0,0.12)',
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
                      ? 'top-2 text-[10px] uppercase tracking-[0.10em] text-neutral-400'
                      : 'top-[22px] text-[13px] text-neutral-400'
                  }`}
                  style={{ fontWeight: passwordFocused || password ? 400 : 300 }}
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
                  className="w-full border-b bg-transparent pb-2 pt-7 pr-10 text-[14px] text-black outline-none transition-all duration-200"
                  style={{
                    borderColor: passwordFocused ? '#1a1a1a' : 'rgba(0,0,0,0.12)',
                    fontWeight: 300,
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute bottom-2.5 right-0 text-neutral-300 transition-colors duration-200 hover:text-neutral-600"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  className="text-[11px] text-neutral-400 underline underline-offset-2 transition-colors duration-200 hover:text-black"
                  style={{ fontWeight: 400 }}
                >
                  Forgot Password?
                </button>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#1a1a1a] py-3.5 text-white transition-all duration-300 hover:bg-black disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="2.5" />
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-[11px] uppercase tracking-[0.22em]" style={{ fontWeight: 600 }}>
                        Signing In...
                      </span>
                    </span>
                  ) : (
                    <span className="text-[11px] uppercase tracking-[0.22em]" style={{ fontWeight: 600 }}>
                      Sign In
                    </span>
                  )}
                </button>
              </div>
            </form>

            <div
              className="group mt-8 flex cursor-pointer items-start gap-3 rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(200,184,152,0.08) 0%, rgba(200,184,152,0.04) 100%)',
                border: '1px solid rgba(200,184,152,0.22)',
              }}
              onClick={() => navigate('/ai-room-planner')}
            >
              <Sparkles size={14} className="mt-0.5 shrink-0 text-[#a08c6a]" />
              <div>
                <p
                  className="mb-0.5 text-[11px] text-[#6b5d45] transition-colors group-hover:text-[#5a4a38]"
                  style={{ fontWeight: 500 }}
                >
                  Discover AI Room Planner
                </p>
                <p className="text-[11px] leading-relaxed text-[#a08c6a]/70" style={{ fontWeight: 300 }}>
                  Visualise any piece of furniture inside your own room before you buy.
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8 pt-8 text-center">
            <p className="text-[12px] text-neutral-400" style={{ fontWeight: 300 }}>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => navigate('/sign-up')}
                className="text-black underline underline-offset-2 transition-colors duration-200 hover:text-[#a08c6a]"
                style={{ fontWeight: 400 }}
              >
                Create one
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SignIn
