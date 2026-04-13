import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Eye, EyeOff, ArrowLeft, Sparkles, Check, ChevronRight } from 'lucide-react'

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
    { label: '8+ characters', pass: password.length >= 8 },
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
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const toggleStyle = (id: string) => {
    setSelectedStyles((previous) =>
      previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id],
    )
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)

    window.setTimeout(() => {
      setLoading(false)
      setStep('success')
      window.setTimeout(() => navigate('/'), 2000)
    }, 1600)
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

                <form onSubmit={handleSubmit} className="space-y-1">
                  <div className="space-y-5">
                    <FloatingInput id="fullname" label="Full Name" value={name} onChange={setName} autoComplete="name" />
                    <FloatingInput
                      id="email"
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      autoComplete="email"
                    />
                    <div>
                      <FloatingInput
                        id="password"
                        label="Create Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={setPassword}
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
                      <PasswordStrength password={password} />
                    </div>
                  </div>

                  <div className="pb-2 pt-8">
                    <div className="mb-1 flex items-center gap-3">
                      <Sparkles size={13} className="text-[#a08c6a]" />
                      <p
                        className="text-[11px] uppercase tracking-[0.14em] text-[#a08c6a]"
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                      >
                        Define Your Style
                      </p>
                    </div>
                    <div className="mb-5 flex items-center gap-2">
                      <div className="h-px w-4 bg-[#c8b898]/50" />
                      <p
                        className="text-[13px] leading-snug text-neutral-600"
                        style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
                      >
                        What inspires your ideal home?
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {STYLE_CARDS.map((card) => (
                        <StyleCard
                          key={card.id}
                          card={card}
                          selected={selectedStyles.includes(card.id)}
                          onClick={() => toggleStyle(card.id)}
                        />
                      ))}
                    </div>

                    <p className="mt-3 text-center text-[11px] text-neutral-300" style={{ fontWeight: 300 }}>
                      {selectedStyles.length === 0
                        ? 'Select one or more that resonate with you'
                        : `${selectedStyles.length} style${selectedStyles.length > 1 ? 's' : ''} selected · Your AI profile is being crafted`}
                    </p>
                  </div>

                  <div className="pb-2 pt-5">
                    <p className="text-center text-[11px] leading-relaxed text-neutral-400" style={{ fontWeight: 300 }}>
                      By creating an account you agree to our{' '}
                      <button
                        type="button"
                        className="underline underline-offset-2 transition-colors hover:text-black"
                      >
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        className="underline underline-offset-2 transition-colors hover:text-black"
                      >
                        Privacy Policy
                      </button>
                      .
                    </p>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#1a1a1a] py-3.5 text-white transition-all duration-300 hover:bg-black disabled:opacity-60"
                    >
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
                          <ChevronRight
                            size={13}
                            className="opacity-50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                          />
                        </span>
                      )}
                    </button>
                  </div>
                </form>
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
