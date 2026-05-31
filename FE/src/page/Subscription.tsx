import { AnimatePresence, motion, useInView } from 'motion/react'
import {
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  Copy,
  Cpu,
  Download,
  Infinity,
  RefreshCw,
  Shield,
  Sparkles,
  Star,
  X,
  Zap,
  ZoomIn,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Footer, Header } from './Hompage'
import { checkPaymentStatus, fetchBankInfo, buildVietQrUrl, registerSubscriptionOrder, type BankInfo } from '../services/paymentApi'
import { useAuth } from '../contexts/auth-context'

type BillingCycle = 'monthly' | 'yearly'

type Plan = {
  id: string
  badge?: string
  name: string
  tagline: string
  price: { monthly: string; yearly: string }
  priceNote?: { monthly: string; yearly: string }
  turns: { monthly: string; yearly: string }
  turnsNote: { monthly: string; yearly: string }
  turnsToAdd: { monthly: number; yearly: number }
  cta: string
  ctaStyle: 'ghost' | 'outline' | 'charcoal' | 'gold'
  highlight: boolean
  features: { monthly: string[]; yearly: string[] }
  extras?: string[]
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Daily Inspiration',
    tagline: 'Begin your design journey',
    price: { monthly: '$0', yearly: '$0' },
    turns: { monthly: '3 AI Try-On turns', yearly: '3 AI Try-On turns' },
    turnsNote: { monthly: 'per day · resets at midnight', yearly: 'per day · resets at midnight' },
    turnsToAdd: { monthly: 0, yearly: 0 },
    cta: 'Current Plan',
    ctaStyle: 'ghost',
    highlight: false,
    features: {
      monthly: [
        '3 AI Try-On turns / day',
        'Standard resolution exports',
        'Basic room analysis',
        'Community gallery access',
      ],
      yearly: [
        '3 AI Try-On turns / day',
        'Standard resolution exports',
        'Basic room analysis',
        'Community gallery access',
      ],
    },
  },
  {
    id: 'starter',
    name: 'Starter Pack',
    tagline: 'Perfect for occasional use',
    price: { monthly: '19.000 ₫', yearly: '190.000 ₫' },
    priceNote: { monthly: 'one-time · no subscription', yearly: 'one-time · no subscription' },
    turns: { monthly: '10 AI Try-On turns', yearly: '10 AI Try-On turns' },
    turnsNote: { monthly: 'valid for 30 days', yearly: 'valid for 30 days' },
    turnsToAdd: { monthly: 10, yearly: 10 },
    cta: 'Choose Starter',
    ctaStyle: 'outline',
    highlight: false,
    features: {
      monthly: [
        '10 AI Try-On turns',
        'Unlimited high-res downloads',
        'Gemini AI Priority Processing',
        'Before / After comparisons',
        'Email support',
      ],
      yearly: [
        '10 AI Try-On turns',
        'Unlimited high-res downloads',
        'Gemini AI Priority Processing',
        'Before / After comparisons',
        'Email support',
      ],
    },
  },
  {
    id: 'standard',
    badge: 'MOST POPULAR',
    name: 'Design Enthusiast',
    tagline: 'Elevate your interiors',
    price: { monthly: '49.000 ₫', yearly: '490.000 ₫' },
    priceNote: { monthly: 'per month', yearly: 'per year · save 10%' },
    turns: { monthly: '50 AI Try-On turns', yearly: '600 AI Try-On turns' },
    turnsNote: { monthly: 'per month · rolls over', yearly: 'per year · ~50/month' },
    turnsToAdd: { monthly: 50, yearly: 600 },
    cta: 'Choose Standard',
    ctaStyle: 'charcoal',
    highlight: true,
    features: {
      monthly: [
        '50 AI Try-On turns / month',
        'Unlimited high-res downloads',
        'Gemini AI Priority Processing',
        'Advanced decor suggestions',
        'Style profile & mood board',
        'Priority email support',
      ],
      yearly: [
        '600 AI Try-On turns / year',
        'Unlimited high-res downloads',
        'Gemini AI Priority Processing',
        'Advanced decor suggestions',
        'Style profile & mood board',
        'Priority email support',
      ],
    },
    extras: ['Exclusive member drops', 'Early access to new features'],
  },
]

const COMPARISON_ROWS = [
  { label: 'AI Try-On turns', values: ['3/day', '10', '50/mo'] },
  { label: 'High-res downloads', values: [false, true, true] },
  { label: 'Gemini Priority Processing', values: [false, true, true] },
  { label: 'Before/After comparisons', values: [false, true, true] },
  { label: 'Style profile & mood board', values: [false, false, true] },
  { label: 'Multi-room projects', values: [false, false, false] },
  { label: 'Design concierge', values: [false, false, false] },
  { label: 'Client presentation exports', values: [false, false, false] },
]

const TESTIMONIALS = [
  {
    quote:
      'The Design Enthusiast plan completely changed how I plan interiors. Seeing the sofa in my actual room before buying was a big win.',
    author: 'Linh Nguyen',
    role: 'Interior Stylist, Hanoi',
  },
  {
    quote:
      'As a professional designer, the priority processing and client exports are invaluable. My clients love the AI simulations.',
    author: 'Thomas Beaumont',
    role: 'Principal Designer, London',
  },
  {
    quote:
      'I started on the free plan and upgraded within a week. The rendering speed makes the whole experience feel immediate.',
    author: 'An Tran',
    role: 'Architect, Ho Chi Minh City',
  },
]

const FAQS = [
  {
    q: 'Do AI Try-On turns expire?',
    a: 'Daily Inspiration resets at midnight. Starter Pack turns stay valid for 30 days. Design Enthusiast turns roll over every month.',
  },
  {
    q: 'Can I switch plans mid-month?',
    a: 'Yes. You can upgrade at any time. Downgrades take effect at the end of your current billing cycle.',
  },
  {
    q: 'What does Gemini AI Priority Processing mean?',
    a: 'Paid plans move your renders into a faster processing lane so results usually return much sooner.',
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'The free plan is available indefinitely. Paid plans do not include a trial, but you can cancel according to the plan terms.',
  },
  {
    q: 'Can I upgrade later?',
    a: 'Yes. You can start small and upgrade whenever your projects need more turns or higher usage limits.',
  },
]

function FeatureRow({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-start gap-2.5"
    >
      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#f0ece4]">
        <Check size={9} strokeWidth={2.5} className="text-[#8a7456]" />
      </div>
      <span className="text-[12px] leading-snug text-neutral-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
        {text}
      </span>
    </motion.li>
  )
}

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return (
      <span className="text-[12px] text-neutral-700" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
        {value}
      </span>
    )
  }

  return value ? (
    <div className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1a1a]">
      <Check size={10} strokeWidth={2.5} className="text-white" />
    </div>
  ) : (
    <div className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100">
      <div className="h-px w-2 rounded-full bg-neutral-300" />
    </div>
  )
}

/** Tạo order ID cho subscription với prefix SUB */
function generateSubOrderId(): string {
  return 'SUB' + Date.now()
}

/** Parse chuỗi giá như '19.000 ₫' hoặc '490.000 ₫' thành số nguyên VNĐ */
function parsePrice(priceStr: string): number {
  // Xoá tất cả ký tự không phải số (dấu chấm, dấu phẩy, ₫, khoảng trắng, $)
  const cleaned = priceStr.replace(/[^0-9]/g, '')
  return parseInt(cleaned, 10) || 0
}

export default function SubscriptionPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [billing, setBilling] = useState<BillingCycle>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)
  const heroInView = useInView(heroRef, { once: true })
  const tableRef = useRef<HTMLDivElement | null>(null)
  const tableInView = useInView(tableRef, { once: true, margin: '-80px' })

  // ── Payment modal state ──
  const [paymentPlan, setPaymentPlan] = useState<Plan | null>(null)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [subOrderId] = useState<string>(() => generateSubOrderId())
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending')
  const [polling, setPolling] = useState(false)
  const [qrLoaded, setQrLoaded] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [qrExpanded, setQrExpanded] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchBankInfo()
      .then(setBankInfo)
      .catch(() => console.warn('[SePay] Could not load bank info'))
  }, [])

  // Start/stop polling when modal opens/closes
  useEffect(() => {
    if (paymentOpen && paymentStatus === 'pending') {
      setPolling(true)
      pollingRef.current = setInterval(async () => {
        try {
          const result = await checkPaymentStatus(subOrderId)
          if (result.status === 'paid') {
            setPaymentStatus('paid')
            setPolling(false)
            if (pollingRef.current) clearInterval(pollingRef.current)
          }
        } catch {
          // ignore polling errors
        }
      }, 3000)
    } else {
      setPolling(false)
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentOpen, paymentStatus])

  const copyToClipboard = (text: string, key: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const handlePlanPurchase = (plan: Plan) => {
    if (plan.ctaStyle === 'ghost') return // free plan — no payment
    setPaymentPlan(plan)
    setPaymentOpen(true)
    // Register the order with the backend so the webhook can credit aiTurns
    // Use yearly turnsToAdd when billing is yearly
    if (user?.id) {
      void registerSubscriptionOrder({
        orderId: subOrderId,
        userId: user.id,
        turnsToAdd: plan.turnsToAdd[billing],
      }).catch((err) => console.warn('[Payment] Failed to register order:', err))
    }
  }

  const closePay = () => {
    setPaymentOpen(false)
    if (paymentStatus === 'paid') {
      // reload page so user gets fresh order ID if they want to buy again
      navigate(0)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#fbf7f1_52%,#f4efe6_100%)] text-[#141311]">
      <Header />

      <main className="pt-[72px]">
        <section ref={heroRef} className="relative overflow-hidden px-6 pb-16 pt-20 text-center sm:px-10 lg:px-16">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(200,184,152,0.12) 0%, transparent 70%)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-6 flex items-center justify-center gap-2.5"
          >
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#c8b898]/60" />
            <div className="flex items-center gap-2 rounded-full border border-[#c8b898]/30 bg-[rgba(200,184,152,0.10)] px-3.5 py-1.5">
              <Sparkles size={11} className="text-[#a08c6a]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8a7456]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                Gemini AI Powered
              </span>
            </div>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#c8b898]/60" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.08, duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
            className="mb-5 text-[44px] leading-[1.08] text-black sm:text-[58px] md:text-[68px]"
            style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
          >
            Unlock Your
            <br />
            <em className="italic" style={{ fontWeight: 400 }}>
              Design Potential
            </em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.18, duration: 0.55 }}
            className="mx-auto mb-10 max-w-lg text-[14px] leading-relaxed text-neutral-400"
            style={{ fontWeight: 300 }}
          >
            Visualise Livaxis pieces inside your space using Gemini AI. Pick the plan that matches your project volume and creative pace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.26, duration: 0.45 }}
            className="inline-flex items-center rounded-full border border-[#c8b898]/25 bg-[#f2ede6] p-1"
          >
            {(['monthly', 'yearly'] as BillingCycle[]).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBilling(cycle)}
                className="relative flex items-center gap-2 rounded-full px-6 py-2 transition-all duration-300"
                style={{
                  background: billing === cycle ? 'white' : 'transparent',
                  boxShadow: billing === cycle ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <span
                  className="text-[12px] uppercase tracking-[0.08em] capitalize"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: billing === cycle ? 500 : 400,
                    color: billing === cycle ? '#1a1a1a' : '#999',
                  }}
                >
                  {cycle}
                </span>
                {cycle === 'yearly' && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-[0.06em]"
                    style={{
                      background: billing === 'yearly' ? '#1a1a1a' : 'rgba(200,184,152,0.3)',
                      color: billing === 'yearly' ? 'white' : '#8a7456',
                      fontWeight: 600,
                    }}
                  >
                    Save 10%
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 pb-24">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PLANS.map((plan, index) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                billing={billing}
                index={index}
                selected={selectedPlan === plan.id}
                onSelect={() => setSelectedPlan(plan.id)}
                onNavigate={() => handlePlanPurchase(plan)}
              />
            ))}
          </div>

          <p className="mt-8 text-center text-[11px] text-neutral-300" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
            Prices in Vietnamese Dong (VNĐ). One-time packs do not auto-renew. Monthly plans are billed at the start of each period. Cancel anytime.
          </p>
        </section>

        <section
          className="border-y border-[#c8b898]/18 px-6 py-14"
          style={{ background: 'linear-gradient(135deg, #faf8f5 0%, #f5f0e8 100%)' }}
        >
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 sm:grid-cols-3">
            {[
              {
                icon: Download,
                title: 'Unlimited High-Res Downloads',
                desc: 'Export simulations in full resolution for print, proposals, and presentations.',
              },
              {
                icon: Cpu,
                title: 'Gemini AI Priority Processing',
                desc: 'Paid plans move your renders ahead in the queue so you get results faster.',
              },
              {
                icon: Infinity,
                title: 'Rollover Turns',
                desc: 'Unused turns stay available on monthly plans, so nothing gets wasted.',
              },
            ].map(({ icon: Icon, title, desc }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex items-start gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#c8b898]/30 bg-[rgba(200,184,152,0.15)]">
                  <Icon size={16} strokeWidth={1.5} className="text-[#a08c6a]" />
                </div>
                <div>
                  <p className="mb-1 text-[13px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
                    {title}
                  </p>
                  <p className="text-[11px] leading-relaxed text-neutral-500" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section ref={tableRef} className="mx-auto max-w-[1120px] px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={tableInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55 }}
            className="mb-12 text-center"
          >
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#a08c6a]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Feature Comparison
            </p>
            <h2 className="text-[32px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
              Everything, side by side
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={tableInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="overflow-hidden rounded-2xl"
            style={{ border: '1px solid rgba(0,0,0,0.07)' }}
          >
            <div className="grid grid-cols-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)', background: '#fafafa' }}>
              <div className="px-5 py-4" />
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className="relative px-3 py-4 text-center"
                  style={{
                    background: plan.highlight ? 'rgba(200,184,152,0.07)' : 'transparent',
                    borderLeft: '1px solid rgba(0,0,0,0.05)',
                  }}
                >
                  {plan.badge && (
                    <div className="absolute -top-px left-1/2 -translate-x-1/2 rounded-b-md bg-[#1a1a1a] px-2 py-0.5">
                      <span className="text-[8px] uppercase tracking-[0.14em] text-white" style={{ fontWeight: 600 }}>
                        Popular
                      </span>
                    </div>
                  )}
                  <p className="text-[11px] text-black" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    {plan.name}
                  </p>
                </div>
              ))}
            </div>

            {COMPARISON_ROWS.map((row, rowIndex) => (
              <div
                key={row.label}
                className="grid grid-cols-4"
                style={{
                  borderBottom: rowIndex < COMPARISON_ROWS.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  background: rowIndex % 2 === 0 ? 'white' : '#fdfcfb',
                }}
              >
                <div className="flex items-center px-5 py-3.5">
                  <span className="text-[12px] text-neutral-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                    {row.label}
                  </span>
                </div>
                {row.values.map((value, valueIndex) => (
                  <div
                    key={valueIndex}
                    className="flex items-center justify-center px-3 py-3.5"
                    style={{
                      background: PLANS[valueIndex]?.highlight ? 'rgba(200,184,152,0.04)' : 'transparent',
                      borderLeft: '1px solid rgba(0,0,0,0.04)',
                    }}
                  >
                    <ComparisonCell value={value} />
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto max-w-[1120px]">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {TESTIMONIALS.map((testimonial, index) => (
                <motion.div
                  key={testimonial.author}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="rounded-2xl border border-[#c8b898]/20 p-6"
                  style={{ background: 'linear-gradient(135deg, #faf8f5 0%, #f7f2ec 100%)' }}
                >
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} size={12} className="fill-[#c8b898] text-[#c8b898]" />
                    ))}
                  </div>
                  <p className="mb-5 text-[13px] leading-relaxed text-neutral-600 italic" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(200,184,152,0.20)]">
                      <span className="text-[12px] text-[#8a7456]" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                        {testimonial.author[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-[12px] text-black" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                        {testimonial.author}
                      </p>
                      <p className="text-[10px] text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[760px] px-6 pb-24">
          <div className="mb-10 text-center">
            <h2 className="text-[28px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
              Common questions
            </h2>
          </div>
          <FAQAccordion />
        </section>

        <section className="relative overflow-hidden bg-[#1a1a1a] px-6 py-20 text-center">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(200,184,152,0.08) 0%, transparent 70%)',
            }}
          />
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <div className="mb-6 flex items-center justify-center gap-2">
                <Sparkles size={14} className="text-[#c8b898]" />
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#c8b898]/70" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  Livaxis · Premium
                </span>
              </div>
              <h2 className="mb-5 text-[36px] leading-tight text-white sm:text-[46px]" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
                Your room, reimagined.
                <br />
                <em className="italic text-[#c8b898]">Start today.</em>
              </h2>
              <p className="mx-auto mb-10 max-w-md text-[13px] leading-relaxed text-white/40" style={{ fontWeight: 300 }}>
                Join design-conscious users who already use AI-assisted room planning to move faster from idea to purchase.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/sign-up')}
                  className="group flex items-center gap-2.5 rounded-xl bg-white px-8 py-3.5 text-black transition-all duration-300 hover:bg-white/90"
                >
                  <Sparkles size={14} strokeWidth={1.5} className="text-[#a08c6a]" />
                  <span className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    Try for Free
                  </span>
                  <ArrowRight size={13} className="opacity-40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </button>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="flex items-center gap-2.5 rounded-xl border px-8 py-3.5 transition-all duration-300 hover:border-white/30 hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <span className="text-[11px] uppercase tracking-[0.18em] text-white/60" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    View Plans
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      {/* ── Subscription Payment Modal ── */}
      <AnimatePresence>
        {paymentOpen && paymentPlan ? (
          <motion.div
            className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closePay} />
            <motion.div
              className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.28)]"
              initial={{ scale: 0.94, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 12, opacity: 0 }}
              transition={{ duration: 0.28 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-neutral-100 px-7 py-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#a08c6a]">Subscription</p>
                  <h3 className="mt-0.5 text-[20px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                    {paymentPlan.name}
                  </h3>
                  <p className="text-[12px] text-neutral-400">
                    {billing === 'monthly' ? paymentPlan.price.monthly : paymentPlan.price.yearly}
                    {paymentPlan.priceNote ? ` · ${paymentPlan.priceNote[billing]}` : ''}
                  </p>
                </div>
                <button
                  onClick={closePay}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 transition-colors hover:text-black"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body */}
              <div className="px-7 py-6">
                <AnimatePresence mode="wait">
                  {paymentStatus === 'paid' ? (
                    <motion.div
                      key="paid"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-4 py-10 text-center"
                    >
                      <motion.div
                        className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      >
                        <Check size={32} className="text-emerald-500" strokeWidth={2.5} />
                      </motion.div>
                      <p className="text-[20px] text-black" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Thanh toán thành công!
                      </p>
                      <p className="text-[13px] text-neutral-400">Gói <span className="font-medium text-black">{paymentPlan.name}</span> đã được kích hoạt.</p>
                      <button
                        onClick={closePay}
                        className="mt-2 rounded-xl bg-[#1a1a1a] px-8 py-3 text-[11px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-black"
                      >
                        Đóng
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="qr" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <p className="text-[13px] text-neutral-500">Quét mã QR hoặc chuyển khoản theo thông tin bên dưới — hệ thống sẽ tự xác nhận.</p>

                      {/* QR + bank info side-by-side */}
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        {/* QR Code */}
                        <div className="flex flex-col items-center gap-2">
                          {/* Clickable QR wrapper */}
                          <button
                            onClick={() => qrLoaded && setQrExpanded(true)}
                            disabled={!qrLoaded}
                            className="group relative overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50 p-3 shadow-inner transition-all duration-200 hover:border-neutral-300 hover:shadow-md focus:outline-none"
                            title="Bấm để phóng to mã QR"
                          >
                            {bankInfo ? (
                              <img
                                src={buildVietQrUrl(
                                  bankInfo,
                                  parsePrice(billing === 'monthly' ? paymentPlan.price.monthly : paymentPlan.price.yearly),
                                  subOrderId,
                                )}
                                alt="VietQR Payment"
                                className={`h-[160px] w-[160px] object-contain transition-opacity duration-500 ${qrLoaded ? 'opacity-100' : 'opacity-0'}`}
                                onLoad={() => setQrLoaded(true)}
                              />
                            ) : null}
                            {(!bankInfo || !qrLoaded) ? (
                              <div className="flex h-[160px] w-[160px] items-center justify-center">
                                <RefreshCw size={22} className="animate-spin text-neutral-300" />
                              </div>
                            ) : null}
                            {/* Zoom overlay on hover */}
                            {qrLoaded && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 transition-all duration-200 group-hover:bg-black/20">
                                <div className="flex flex-col items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-lg">
                                    <ZoomIn size={16} className="text-[#1a1a1a]" />
                                  </div>
                                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-[#1a1a1a]">Phóng to</span>
                                </div>
                              </div>
                            )}
                          </button>
                          <div className="flex items-center gap-1.5 rounded-full bg-[#003087]/5 px-3 py-1">
                            <div className="h-2 w-2 rounded-full bg-[#003087]" />
                            <span className="text-[10px] font-medium uppercase tracking-widest text-[#003087]">VietQR</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                            {polling ? (
                              <>
                                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                                Đang chờ xác nhận...
                              </>
                            ) : (
                              <span>Hệ thống xác nhận tự động</span>
                            )}
                          </div>
                        </div>

                        {/* Bank details */}
                        <div className="flex-1 space-y-2.5">
                          {[
                            { label: 'Ngân hàng', value: bankInfo?.bankShortName ?? '—', copyable: false },
                            { label: 'Số tài khoản', value: bankInfo?.accountNumber ?? '—', copyable: true, copyKey: 'account' },
                            { label: 'Chủ tài khoản', value: bankInfo?.accountName ?? '—', copyable: false },
                            {
                              label: 'Số tiền',
                              value: billing === 'monthly' ? paymentPlan.price.monthly : paymentPlan.price.yearly,
                              copyable: true,
                              copyKey: 'amount',
                            },
                            {
                              label: 'Nội dung CK',
                              value: subOrderId,
                              copyable: true,
                              copyKey: 'content',
                              important: true,
                            },
                          ].map((row) => (
                            <div
                              key={row.label}
                              className={`flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 ${
                                row.important ? 'border border-amber-200/80 bg-amber-50' : 'border border-neutral-100 bg-neutral-50'
                              }`}
                            >
                              <div className="min-w-0">
                                <p className="mb-0.5 text-[10px] uppercase tracking-[0.12em] text-neutral-400">{row.label}</p>
                                <p className={`truncate text-[13px] ${ row.important ? 'font-medium text-amber-700' : 'text-black' }`}>
                                  {row.value}
                                </p>
                              </div>
                              {row.copyable && row.copyKey ? (
                                <button
                                  onClick={() => copyToClipboard(row.value, row.copyKey!)}
                                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition-all hover:border-neutral-300 hover:text-black"
                                >
                                  {copied === row.copyKey ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                </button>
                              ) : null}
                            </div>
                          ))}

                          <div className="rounded-xl border border-amber-200/60 bg-amber-50/60 px-4 py-2.5">
                            <p className="text-[11px] leading-relaxed text-amber-700">
                              ⚠️ Vui lòng giữ đúng nội dung chuyển khoản{' '}
                              <span className="font-semibold">{subOrderId}</span>{' '}
                              để hệ thống tự động kích hoạt gói.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── QR Lightbox ── */}
      <AnimatePresence>
        {qrExpanded && paymentPlan && bankInfo ? (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setQrExpanded(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

            <motion.div
              className="relative flex flex-col items-center gap-5"
              initial={{ scale: 0.85, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 8 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setQrExpanded(false)}
                className="absolute -right-4 -top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-neutral-100"
              >
                <X size={15} className="text-neutral-600" />
              </button>

              {/* QR Card */}
              <div className="overflow-hidden rounded-3xl bg-white p-6 shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
                {/* Plan info */}
                <div className="mb-4 text-center">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#a08c6a]">Thanh toán</p>
                  <p className="mt-0.5 text-[18px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                    {paymentPlan.name}
                  </p>
                  <p className="text-[22px] font-semibold text-[#1a1a1a]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {billing === 'monthly' ? paymentPlan.price.monthly : paymentPlan.price.yearly}
                  </p>
                </div>

                {/* Large QR */}
                <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                  <img
                    src={buildVietQrUrl(
                      bankInfo,
                      parsePrice(billing === 'monthly' ? paymentPlan.price.monthly : paymentPlan.price.yearly),
                      subOrderId,
                    )}
                    alt="VietQR Payment - Large"
                    className="h-[280px] w-[280px] object-contain"
                  />
                </div>

                {/* VietQR badge */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full bg-[#003087]/5 px-3 py-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#003087]" />
                    <span className="text-[10px] font-medium uppercase tracking-widest text-[#003087]">VietQR</span>
                  </div>
                  {polling && (
                    <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                      <span className="text-[10px] text-amber-600">Đang chờ xác nhận...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hint */}
              <p className="text-[12px] text-white/60">Nhấn ra ngoài hoặc <span className="text-white/80">✕</span> để đóng</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function PricingCard({
  plan,
  billing,
  index,
  selected,
  onSelect,
  onNavigate,
}: {
  plan: Plan
  billing: BillingCycle
  index: number
  selected: boolean
  onSelect: () => void
  onNavigate: () => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const ctaStyles: Record<Plan['ctaStyle'], string> = {
    ghost: 'cursor-default border border-neutral-200 bg-white text-neutral-400',
    outline: 'border border-neutral-200 bg-white text-neutral-700 transition-all duration-300 hover:border-neutral-400 hover:text-black',
    charcoal: 'bg-[#1a1a1a] text-white transition-all duration-300 hover:bg-black group',
    gold: 'border border-[#c8b898]/40 bg-[#f8f5f0] text-[#6b5d45] transition-all duration-300 hover:border-[#c8b898]/80 hover:bg-[#f0ebe0]',
  }

  const currentPrice = billing === 'monthly' ? plan.price.monthly : plan.price.yearly

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      className={`relative flex min-h-[640px] cursor-pointer flex-col overflow-hidden rounded-2xl ${selected ? 'ring-1 ring-[#1a1a1a]' : ''}`}
      style={{
        background: 'white',
        border: plan.highlight ? '1.5px solid #1a1a1a' : '1px solid rgba(0,0,0,0.08)',
        boxShadow: plan.highlight ? '0 8px 40px rgba(0,0,0,0.10), 0 2px 12px rgba(0,0,0,0.06)' : '0 1px 4px rgba(0,0,0,0.04)',
      }}
      onClick={onSelect}
      whileHover={{
        y: plan.ctaStyle !== 'ghost' ? -4 : 0,
        transition: { duration: 0.25 },
      }}
    >
      {plan.badge && (
        <div className="absolute left-0 right-0 top-0 bg-[#1a1a1a] py-2 text-center">
          <span className="text-[9px] uppercase tracking-[0.22em] text-white" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
            {plan.badge}
          </span>
        </div>
      )}

      <div className={`flex flex-1 flex-col p-6 ${plan.badge ? 'pt-10' : ''}`}>
        <div className="mb-5">
          <p className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-[#a08c6a]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            {plan.id === 'free' ? 'Free Forever' : plan.id === 'starter' ? 'One-Time Pack' : 'Most Popular'}
          </p>
          <h3 className="text-[19px] leading-snug text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
            {plan.name}
          </h3>
          <p className="mt-0.5 text-[11px] text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
            {plan.tagline}
          </p>
        </div>

        <div className="mb-5 h-px" style={{ background: plan.highlight ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.05)' }} />

        <div className="mb-5">
          <div className="flex flex-wrap items-end gap-1.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={billing}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-[32px] leading-none text-black"
                style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
              >
                {currentPrice}
              </motion.span>
            </AnimatePresence>
          </div>
          {plan.priceNote && (
            <p className="mt-1 text-[10px] text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
              {plan.priceNote[billing]}
            </p>
          )}
        </div>

        <div
          className="mb-5 flex items-start gap-2.5 rounded-xl px-3.5 py-3"
          style={{
            background: plan.highlight ? 'rgba(200,184,152,0.10)' : 'rgba(0,0,0,0.025)',
            border: plan.highlight ? '1px solid rgba(200,184,152,0.25)' : '1px solid rgba(0,0,0,0.04)',
          }}
        >
          <Camera size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#a08c6a]" />
          <div>
            <p className="text-[12px] text-black" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              {plan.turns[billing]}
            </p>
            <p className="mt-0.5 text-[10px] text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
              {plan.turnsNote[billing]}
            </p>
          </div>
        </div>

        <ul className="mb-6 flex-1 space-y-2.5">
          {plan.features[billing].map((feature, featureIndex) => (
            <FeatureRow key={feature} text={feature} delay={featureIndex * 0.04} />
          ))}
          {plan.extras?.map((extra) => (
            <li key={extra} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a]">
                <Zap size={8} strokeWidth={2.5} className="text-white" />
              </div>
              <span className="text-[12px] leading-snug text-neutral-600" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                {extra}
              </span>
            </li>
          ))}
        </ul>

        <button
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[11px] uppercase tracking-[0.14em] ${ctaStyles[plan.ctaStyle]}`}
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: plan.highlight ? 600 : 500 }}
          onClick={(event) => {
            event.stopPropagation()
            if (plan.ctaStyle !== 'ghost') {
              onNavigate()
            }
          }}
        >
          {plan.cta}
          {plan.ctaStyle !== 'ghost' && (
            <ChevronRight
              size={13}
              className={`opacity-40 ${plan.ctaStyle === 'charcoal' ? 'transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100' : ''}`}
            />
          )}
        </button>

        {plan.id !== 'free' && (
          <p className="mt-2.5 flex items-center justify-center gap-1 text-center text-[9px] text-neutral-300" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
            <Shield size={9} strokeWidth={1.5} className="opacity-60" />
            {plan.id === 'starter' ? 'One-time · no auto-renewal' : 'Cancel anytime · No hidden fees'}
          </p>
        )}
      </div>

      {plan.highlight && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(200,184,152,0.5) 40%, rgba(200,184,152,0.8) 60%, transparent 100%)',
          }}
        />
      )}
    </motion.div>
  )
}

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {FAQS.map((faq, index) => (
        <motion.div
          key={faq.q}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ delay: index * 0.06, duration: 0.4 }}
          className="overflow-hidden rounded-xl"
          style={{ border: '1px solid rgba(0,0,0,0.07)' }}
        >
          <button
            className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors duration-200 hover:bg-[#faf8f5]"
            onClick={() => setOpen(open === index ? null : index)}
          >
            <span className="pr-4 text-[13px] text-black" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              {faq.q}
            </span>
            <motion.div animate={{ rotate: open === index ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight size={14} className="shrink-0 text-neutral-300" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {open === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <p className="px-5 pb-4 text-[12px] leading-relaxed text-neutral-500" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                  {faq.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}