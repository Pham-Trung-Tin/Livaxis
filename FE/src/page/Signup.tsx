import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Eye, EyeOff, ArrowLeft, Sparkles, Check, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/auth-context'
import { signUp } from '../services/authApi'
import { Formik } from 'formik'
import * as Yup from 'yup'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1758448511348-54b10c30239f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwbHV4dXJ5JTIwYmVkcm9vbSUyMHNvZnQlMjBuYXR1cmFsJTIwbGlnaHRpbmclMjBuZXV0cmFsJTIwdG9uZXN8ZW58MXx8fHwxNzcyOTc1NDY3fDA&ixlib=rb-4.1.0&q=80&w=1080'

const STYLE_CARDS = [
  {
    id: 'minimalist',
    label: 'Minimalist',
    sub: 'Clean lines, white spaces',
    image:
      'https://images.unsplash.com/photo-1772475385327-ae6212f900aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwd2hpdGUlMjBsaXZpbmclMjByb29tJTIwY2xlYW4lMjBsaW5lcyUyMGludGVyaW9yfGVufDF8fHx8MTc3Mjk3NTQ2N3ww&ixlib=rb-4.1.0&q=80&w=400',
    accent: '#e8e4df',
  },
  {
    id: 'modern-luxury',
    label: 'Modern Luxury',
    sub: 'Marble, gold accents',
    image:
      'https://images.unsplash.com/photo-1758193783649-13371d7fb8dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBtYXJibGUlMjBnb2xkJTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MXx8fHwxNzcyOTc1NDY4fDA&ixlib=rb-4.1.0&q=80&w=400',
    accent: '#c8b898',
  },
  {
    id: 'scandi',
    label: 'Scandi',
    sub: 'Light wood, cozy textures',
    image:
      'https://images.unsplash.com/photo-1606602266678-d29114013ac6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2FuZGluYXZpYW4lMjBoeWdnZSUyMGNvenklMjBsaWdodCUyMHdvb2QlMjBiZWRyb29tJTIwbm9yZGljfGVufDF8fHx8MTc3Mjk3NTQ3MXww&ixlib=rb-4.1.0&q=80&w=400',
    accent: '#d4c9b5',
  },
  {
    id: 'industrial',
    label: 'Industrial',
    sub: 'Raw materials, dark tones',
    image:
      'https://images.unsplash.com/photo-1532279978316-c52202e84d66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwZGFyayUyMGxvZnQlMjBpbnRlcmlvciUyMHJhdyUyMGNvbmNyZXRlJTIwYnJpY2t8ZW58MXx8fHwxNzcyOTc1NDY5fDA&ixlib=rb-4.1.0&q=80&w=400',
    accent: '#4a4540',
  },
]

function FloatingInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
  rightSlot,
}: {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  rightSlot?: ReactNode
}) {
  const [focused, setFocused] = useState(false)
  const floated = focused || value.length > 0

  return (
    <div className="relative pt-1">
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 transition-all duration-200"
        style={{
          top: floated ? '0px' : '18px',
          fontSize: floated ? '10px' : '13px',
          color: floated ? (focused ? '#1a1a1a' : '#9ca3af') : '#9ca3af',
          letterSpacing: floated ? '0.10em' : '0',
          textTransform: floated ? 'uppercase' : 'none',
          fontWeight: floated ? 400 : 300,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        required
        className="w-full border-b bg-transparent pb-2.5 pt-6 pr-10 text-[14px] text-black outline-none transition-all duration-200"
        style={{
          borderColor: focused ? '#1a1a1a' : 'rgba(0,0,0,0.12)',
          fontWeight: 300,
          fontFamily: 'Inter, sans-serif',
        }}
      />
      {rightSlot ? <div className="absolute bottom-2.5 right-0">{rightSlot}</div> : null}
    </div>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '6+ characters', pass: password.length >= 6 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number or symbol', pass: /[0-9\W]/.test(password) },
  ]
  const score = checks.filter((check) => check.pass).length
  const colors = ['#e5e7eb', '#f87171', '#fbbf24', '#4ade80']
  const labels = ['', 'Weak', 'Fair', 'Strong']

  if (!password) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 space-y-2"
    >
      <div className="flex gap-1.5">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-0.5 flex-1 rounded-full transition-all duration-300"
            style={{ background: index <= score ? colors[score] : '#f3f4f6' }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map((check) => (
            <span
              key={check.label}
              className="flex items-center gap-1 text-[10px] transition-colors duration-200"
              style={{
                color: check.pass ? '#6b7280' : '#d1d5db',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 300,
              }}
            >
              <Check size={9} strokeWidth={2.5} className={check.pass ? 'text-green-400' : 'text-gray-300'} />
              {check.label}
            </span>
          ))}
        </div>
        {score > 0 ? (
          <span
            className="text-[10px] tracking-[0.06em]"
            style={{ color: colors[score], fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            {labels[score]}
          </span>
        ) : null}
      </div>
    </motion.div>
  )
}

function StyleCard({
  card,
  selected,
  onClick,
}: {
  card: (typeof STYLE_CARDS)[0]
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl text-left transition-all duration-300"
      style={{
        outline: selected ? `2px solid ${card.accent === '#4a4540' ? '#8a8078' : card.accent}` : '2px solid transparent',
        outlineOffset: '2px',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={card.image}
          alt={card.label}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: selected
            ? 'linear-gradient(to top, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.05) 60%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.0) 60%)',
        }}
      />

      <AnimatePresence>
        {selected ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'backOut' }}
            className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full"
            style={{ background: card.accent === '#4a4540' ? '#8a8078' : card.accent }}
          >
            <Check size={11} strokeWidth={2.5} className="text-white" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="text-[12px] leading-tight text-white" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
          {card.label}
        </p>
        <p
          className="mt-0.5 text-[10px] leading-tight text-white/65"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
        >
          {card.sub}
        </p>
      </div>
    </button>
  )
}

function SignUpPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  

  const validationSchema = Yup.object().shape({
    username: Yup.string().trim().min(3, 'Username must be at least 3 characters').max(30).required('Username is required'),
    name: Yup.string().trim().min(2, 'Name must be at least 2 characters').max(50).required('Full name is required'),
    email: Yup.string().email('Email is invalid').required('Email is required'),
    phone: Yup.string().trim().matches(/^\+?[0-9]{7,15}$/, 'Phone number is invalid').nullable().notRequired(),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
  })

  const handleSubmitFormik = async (values: any) => {
    setErrorMessage('')
    setLoading(true)
    try {
      const response = await signUp({
        username: values.username,
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        confirmPassword: values.confirmPassword,
      })

      setUser(response?.data?.user ?? null)
      setLoading(false)
      setStep('success')
      window.setTimeout(() => navigate('/'), 2000)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed'
      setErrorMessage(message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="relative hidden w-[42%] shrink-0 overflow-hidden lg:flex">
        <img src={HERO_IMAGE} alt="Livaxis luxury bedroom" className="h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.45) 100%)',
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-16"
          style={{ background: 'linear-gradient(to right, transparent, white)' }}
        />

        <div className="absolute left-8 top-8">
          <button onClick={() => navigate('/')} style={{ fontFamily: 'Playfair Display, serif' }}>
            <span
              className="text-[20px] tracking-[0.10em] text-white"
              style={{ fontWeight: 600, textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}
            >
              LIVAXIS
            </span>
          </button>
        </div>

        <div className="absolute bottom-10 left-8 right-12">
          <div className="mb-4 h-px w-6" style={{ background: 'rgba(200,184,152,0.85)' }} />
          <p
            className="text-[13px] leading-relaxed text-white/80"
            style={{ fontWeight: 300, textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}
          >
            &quot;Every room has a story.
            <br />
            Let us help you tell yours.&quot;
          </p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.10em] text-white/40" style={{ fontWeight: 400 }}>
            - Livaxis Design Studio
          </p>
        </div>
      </div>

      <div className="flex min-h-screen flex-1 flex-col overflow-y-auto bg-white">
        <div className="flex items-center justify-between px-8 pt-8 md:px-12">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 text-neutral-400 transition-colors duration-200 hover:text-black"
          >
            <ArrowLeft size={16} strokeWidth={1.5} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="text-[12px] uppercase tracking-[0.08em]" style={{ fontWeight: 400 }}>
              Back
            </span>
          </button>
          <button onClick={() => navigate('/')} className="lg:hidden" style={{ fontFamily: 'Playfair Display, serif' }}>
            <span className="text-[20px] tracking-[0.10em]" style={{ fontWeight: 600 }}>
              LIVAXIS
            </span>
          </button>
          <div className="w-16" />
        </div>

        <div className="flex flex-1 items-start justify-center px-8 py-10 md:px-14">
          <AnimatePresence mode="wait">
            {step === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex w-full max-w-[440px] flex-col items-center py-16 text-center"
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
                  Your account is ready. Redirecting you home...
                </p>
                <motion.div
                  className="mt-8 h-px bg-[#c8b898]"
                  initial={{ width: 0 }}
                  animate={{ width: '80px' }}
                  transition={{ duration: 1.8, ease: 'easeOut' }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                className="w-full max-w-[440px]"
              >
                <div className="mb-8">
                  <div className="mb-5 h-px w-8" style={{ background: 'linear-gradient(90deg, #c8b898, transparent)' }} />
                  <h1
                    className="mb-2 text-[34px] leading-tight text-black"
                    style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontStyle: 'italic' }}
                  >
                    Start Your Design Journey
                  </h1>
                  <p className="text-[13px] leading-relaxed text-neutral-400" style={{ fontWeight: 300 }}>
                    Join Livaxis for a personalised AI experience.
                  </p>
                </div>

                <Formik
                  initialValues={{ username: '', name: '', email: '', phone: '', password: '', confirmPassword: '' }}
                  validationSchema={validationSchema}
                  onSubmit={(values) => handleSubmitFormik(values)}
                >
                  {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
                    <form onSubmit={handleSubmit} className="space-y-1">
                      {errorMessage ? (
                        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-[12px] text-red-600">{errorMessage}</p>
                      ) : null}
                      <div className="space-y-5">
                        <div>
                          <FloatingInput id="username" label="Username" value={values.username} onChange={(v) => setFieldValue('username', v)} autoComplete="username" />
                          {touched.username && errors.username ? (
                            <p className="mt-1 text-[12px] text-red-600">{(errors.username as string) || ''}</p>
                          ) : null}
                        </div>

                        <div>
                          <FloatingInput id="fullname" label="Full Name" value={values.name} onChange={(v) => setFieldValue('name', v)} autoComplete="name" />
                          {touched.name && errors.name ? <p className="mt-1 text-[12px] text-red-600">{(errors.name as string) || ''}</p> : null}
                        </div>

                        <div>
                          <FloatingInput id="email" label="Email Address" type="email" value={values.email} onChange={(v) => setFieldValue('email', v)} autoComplete="email" />
                          {touched.email && errors.email ? <p className="mt-1 text-[12px] text-red-600">{(errors.email as string) || ''}</p> : null}
                        </div>

                        <div>
                          <FloatingInput id="phone" label="Phone (optional)" value={values.phone} onChange={(v) => setFieldValue('phone', v)} autoComplete="tel" />
                          {touched.phone && errors.phone ? <p className="mt-1 text-[12px] text-red-600">{(errors.phone as string) || ''}</p> : null}
                        </div>

                        <div>
                          <FloatingInput
                            id="password"
                            label="Create Password"
                            type={showPassword ? 'text' : 'password'}
                            value={values.password}
                            onChange={(v) => setFieldValue('password', v)}
                            autoComplete="new-password"
                            rightSlot={
                              <button
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                className="text-neutral-300 transition-colors duration-200 hover:text-neutral-600"
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                              >
                                {showPassword ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                              </button>
                            }
                          />
                          {touched.password && errors.password ? <p className="mt-1 text-[12px] text-red-600">{(errors.password as string) || ''}</p> : null}
                          <PasswordStrength password={values.password} />
                        </div>

                        <div>
                          <FloatingInput id="confirmPassword" label="Confirm Password" type={showPassword ? 'text' : 'password'} value={values.confirmPassword} onChange={(v) => setFieldValue('confirmPassword', v)} autoComplete="new-password" />
                          {touched.confirmPassword && errors.confirmPassword ? <p className="mt-1 text-[12px] text-red-600">{(errors.confirmPassword as string) || ''}</p> : null}
                        </div>
                      </div>

                      <div className="pb-2 pt-5">
                        <p className="text-center text-[11px] leading-relaxed text-neutral-400" style={{ fontWeight: 300 }}>
                          By creating an account you agree to our{' '}
                          <button type="button" className="underline underline-offset-2 transition-colors hover:text-black">
                            Terms of Service
                          </button>{' '}
                          and{' '}
                          <button type="button" className="underline underline-offset-2 transition-colors hover:text-black">
                            Privacy Policy
                          </button>
                          .
                        </p>
                      </div>

                      <div className="pt-1">
                        <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#1a1a1a] py-3.5 text-white transition-all duration-300 hover:bg-black disabled:opacity-60">
                          {loading ? (
                            <span className="flex items-center gap-2.5">
                              <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="white" strokeWidth="2.5" />
                                <path className="opacity-80" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              <span className="text-[11px] uppercase tracking-[0.22em]" style={{ fontWeight: 600 }}>
                                Creating Account...
                              </span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-2.5">
                              <span className="text-[11px] uppercase tracking-[0.22em]" style={{ fontWeight: 600 }}>
                                Create Account
                              </span>
                              <ChevronRight size={13} className="opacity-50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                            </span>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </Formik>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-8 pb-8 text-center">
          <p className="text-[12px] text-neutral-400" style={{ fontWeight: 300 }}>
            Already have an account?{' '}
            <button
              onClick={() => navigate('/sign-in')}
              className="text-black underline underline-offset-2 transition-colors duration-200 hover:text-[#a08c6a]"
              style={{ fontWeight: 400 }}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
