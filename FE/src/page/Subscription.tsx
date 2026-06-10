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
import { useLanguage } from '../contexts/LanguageContext'
import { translations } from '../contexts/translations'

type Plan = {
  id: string
  badge?: string
  name: string
  tagline: string
  price: string
  priceNote?: string
  turns: string
  turnsNote?: string
  turnsToAdd: number
  cta: string
  ctaStyle: 'ghost' | 'outline' | 'charcoal' | 'gold'
  highlight: boolean
  features: string[]
  extras?: string[]
}

// Globals removed to localize dynamically inside component

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
  const { language, t } = useLanguage()
  const subTrans = translations[language].subscription

  const PLANS: Plan[] = [
    {
      id: 'free',
      name: subTrans.plans.free.name,
      tagline: subTrans.plans.free.tagline,
      price: subTrans.plans.free.price,
      turns: subTrans.plans.free.turns,
      turnsNote: subTrans.plans.free.turnsNote,
      turnsToAdd: 0,
      cta: subTrans.plans.free.cta,
      ctaStyle: 'ghost',
      highlight: (user?.subscriptionPlan || 'free') === 'free',
      features: subTrans.plans.free.features,
    },
    {
      id: 'starter',
      name: subTrans.plans.starter.name,
      tagline: subTrans.plans.starter.tagline,
      price: subTrans.plans.starter.price,
      priceNote: subTrans.plans.starter.priceNote,
      turns: subTrans.plans.starter.turns,
      turnsNote: subTrans.plans.starter.turnsNote,
      turnsToAdd: 10,
      cta: subTrans.plans.starter.cta,
      ctaStyle: 'outline',
      highlight: user?.subscriptionPlan === 'starter',
      features: subTrans.plans.starter.features,
    },
    {
      id: 'standard',
      badge: subTrans.mostPopularBadge.toUpperCase(),
      name: subTrans.plans.standard.name,
      tagline: subTrans.plans.standard.tagline,
      price: subTrans.plans.standard.price,
      priceNote: subTrans.plans.standard.priceNote,
      turns: subTrans.plans.standard.turns,
      turnsNote: subTrans.plans.standard.turnsNote,
      turnsToAdd: 40,
      cta: subTrans.plans.standard.cta,
      ctaStyle: 'charcoal',
      highlight: user?.subscriptionPlan === 'standard',
      features: subTrans.plans.standard.features,
      extras: subTrans.plans.standard.extras,
    },
    {
      id: 'premium',
      name: subTrans.plans.premium.name,
      tagline: subTrans.plans.premium.tagline,
      price: subTrans.plans.premium.price,
      priceNote: subTrans.plans.premium.priceNote,
      turns: subTrans.plans.premium.turns,
      turnsNote: subTrans.plans.premium.turnsNote,
      turnsToAdd: 70,
      cta: subTrans.plans.premium.cta,
      ctaStyle: 'gold',
      highlight: user?.subscriptionPlan === 'premium',
      features: subTrans.plans.premium.features,
    },
  ]

  const COMPARISON_ROWS = [
    { label: subTrans.compareHeaders[0], values: [language === 'vi' ? '3/ngày' : '3/day', '10', '40', '70'] },
    { label: subTrans.compareHeaders[1], values: [false, true, true, true] },
    { label: subTrans.compareHeaders[2], values: [false, true, true, true] },
    { label: subTrans.compareHeaders[3], values: [false, true, true, true] },
    { label: subTrans.compareHeaders[4], values: [false, false, true, true] },
    { label: subTrans.compareHeaders[5], values: [false, false, false, true] },
    { label: subTrans.compareHeaders[6], values: [false, false, false, true] },
    { label: subTrans.compareHeaders[7], values: [false, false, false, true] },
  ]

  const TESTIMONIALS = subTrans.testimonials

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
    if (user?.id) {
      void registerSubscriptionOrder({
        orderId: subOrderId,
        userId: user.id,
        turnsToAdd: plan.turnsToAdd,
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
                {subTrans.poweredByGemini}
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
            {subTrans.unlockTitle}
            <br />
            <em className="italic" style={{ fontWeight: 400 }}>
              {subTrans.potentialTitle}
            </em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.18, duration: 0.55 }}
            className="mx-auto mb-10 max-w-lg text-[14px] leading-relaxed text-neutral-400"
            style={{ fontWeight: 300 }}
          >
            {subTrans.heroDesc}
          </motion.p>

        </section>

        <section className="mx-auto max-w-[1440px] px-6 pb-24">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan, index) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                index={index}
                selected={selectedPlan === plan.id}
                onSelect={() => setSelectedPlan(plan.id)}
                onNavigate={() => handlePlanPurchase(plan)}
              />
            ))}
          </div>

          <p className="mt-8 text-center text-[11px] text-neutral-300" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
            {subTrans.priceDisclosure}
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
                title: subTrans.featureTitle1,
                desc: subTrans.featureDesc1,
              },
              {
                icon: Cpu,
                title: subTrans.featureTitle2,
                desc: subTrans.featureDesc2,
              },
              {
                icon: Infinity,
                title: subTrans.featureTitle3,
                desc: subTrans.featureDesc3,
              },
            ].map(({ icon: Icon, title, desc }, index) => (
              <motion.div
                key={index}
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
              {subTrans.featureComparison}
            </p>
            <h2 className="text-[32px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
              {subTrans.featureComparisonSub}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={tableInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="overflow-hidden rounded-2xl"
            style={{ border: '1px solid rgba(0,0,0,0.07)' }}
          >
            <div className="grid grid-cols-5 border-b" style={{ borderColor: 'rgba(0,0,0,0.07)', background: '#fafafa' }}>
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
                        {subTrans.mostPopular}
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
                className="grid grid-cols-5"
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
              {subTrans.faqTitle}
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
                  {language === 'vi' ? 'Livaxis · Cao cấp' : 'Livaxis · Premium'}
                </span>
              </div>
              <h2 className="mb-5 text-[36px] leading-tight text-white sm:text-[46px]" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
                {subTrans.reimaginedTitle}
                <br />
                <em className="italic text-[#c8b898]">{subTrans.startToday}</em>
              </h2>
              <p className="mx-auto mb-10 max-w-md text-[13px] leading-relaxed text-white/40" style={{ fontWeight: 300 }}>
                {subTrans.startTodayDesc}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/sign-up')}
                  className="group flex items-center gap-2.5 rounded-xl bg-white px-8 py-3.5 text-black transition-all duration-300 hover:bg-white/90"
                >
                  <Sparkles size={14} strokeWidth={1.5} className="text-[#a08c6a]" />
                  <span className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    {subTrans.ctaFree}
                  </span>
                  <ArrowRight size={13} className="opacity-40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </button>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="flex items-center gap-2.5 rounded-xl border px-8 py-3.5 transition-all duration-300 hover:border-white/30 hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <span className="text-[11px] uppercase tracking-[0.18em] text-white/60" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    {subTrans.ctaViewPlans}
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
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#a08c6a]">{language === 'vi' ? 'Gói dịch vụ' : 'Service Plan'}</p>
                  <h3 className="mt-0.5 text-[20px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                    {paymentPlan.name}
                  </h3>
                  <p className="text-[12px] text-neutral-400">
                    {paymentPlan.price}
                    {paymentPlan.priceNote ? ` · ${paymentPlan.priceNote}` : ''}
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
                        {language === 'vi' ? 'Thanh toán thành công!' : 'Payment Successful!'}
                      </p>
                      <p className="text-[13px] text-neutral-400">
                        {language === 'vi' ? 'Gói ' : 'Plan '}
                        <span className="font-medium text-black">{paymentPlan.name}</span>
                        {language === 'vi' ? ' đã được kích hoạt.' : ' has been activated.'}
                      </p>
                      <button
                        onClick={closePay}
                        className="mt-2 rounded-xl bg-[#1a1a1a] px-8 py-3 text-[11px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-black"
                      >
                        {t('common.close')}
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="qr" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <p className="text-[13px] text-neutral-500">
                        {language === 'vi' ? 'Quét mã QR hoặc chuyển khoản theo thông tin bên dưới — hệ thống sẽ tự xác nhận.' : 'Scan the QR code or transfer funds using the details below — the system will automatically verify.'}
                      </p>

                      {/* QR + bank info side-by-side */}
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        {/* QR Code */}
                        <div className="flex flex-col items-center gap-2">
                          {/* Clickable QR wrapper */}
                          <button
                            onClick={() => qrLoaded && setQrExpanded(true)}
                            disabled={!qrLoaded}
                            className="group relative overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50 p-3 shadow-inner transition-all duration-200 hover:border-neutral-300 hover:shadow-md focus:outline-none"
                            title={language === 'vi' ? 'Bấm để phóng to mã QR' : 'Click to zoom QR code'}
                          >
                            {bankInfo ? (
                              <img
                                src={buildVietQrUrl(
                                  bankInfo,
                                  parsePrice(paymentPlan.price),
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
                                  <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-[#1a1a1a]">
                                    {language === 'vi' ? 'Phóng to' : 'Zoom'}
                                  </span>
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
                                {language === 'vi' ? 'Đang chờ xác nhận...' : 'Waiting for verification...'}
                              </>
                            ) : (
                              <span>{language === 'vi' ? 'Hệ thống xác nhận tự động' : 'Automatic system verification'}</span>
                            )}
                          </div>
                        </div>

                        {/* Bank details */}
                        <div className="flex-1 space-y-2.5">
                          {[
                            { label: language === 'vi' ? 'Ngân hàng' : 'Bank', value: bankInfo?.bankShortName ?? '—', copyable: false },
                            { label: language === 'vi' ? 'Số tài khoản' : 'Account Number', value: bankInfo?.accountNumber ?? '—', copyable: true, copyKey: 'account' },
                            { label: language === 'vi' ? 'Chủ tài khoản' : 'Account Holder', value: bankInfo?.accountName ?? '—', copyable: false },
                            {
                              label: language === 'vi' ? 'Số tiền' : 'Amount',
                              value: paymentPlan.price,
                              copyable: true,
                              copyKey: 'amount',
                            },
                            {
                              label: language === 'vi' ? 'Nội dung CK' : 'Transfer Content',
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
                              {language === 'vi' ? (
                                <>
                                  ⚠️ Vui lòng giữ đúng nội dung chuyển khoản{' '}
                                  <span className="font-semibold">{subOrderId}</span>{' '}
                                  để hệ thống tự động kích hoạt gói.
                                </>
                              ) : (
                                <>
                                  ⚠️ Please keep the exact transfer content{' '}
                                  <span className="font-semibold">{subOrderId}</span>{' '}
                                  for the system to automatically activate the plan.
                                </>
                              )}
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
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#a08c6a]">{language === 'vi' ? 'Thanh toán' : 'Payment'}</p>
                  <p className="mt-0.5 text-[18px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                    {paymentPlan.name}
                  </p>
                  <p className="text-[22px] font-semibold text-[#1a1a1a]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {paymentPlan.price}
                  </p>
                </div>

                {/* Large QR */}
                <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                  <img
                    src={buildVietQrUrl(
                      bankInfo,
                      parsePrice(paymentPlan.price),
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
                      <span className="text-[10px] text-amber-600">
                        {language === 'vi' ? 'Đang chờ xác nhận...' : 'Waiting for verification...'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hint */}
              <p className="text-[12px] text-white/60">
                {language === 'vi' ? 'Nhấn ra ngoài hoặc ✕ để đóng' : 'Click outside or ✕ to close'}
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function PricingCard({
  plan,
  index,
  selected,
  onSelect,
  onNavigate,
}: {
  plan: Plan
  index: number
  selected: boolean
  onSelect: () => void
  onNavigate: () => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { language } = useLanguage()
  const subTrans = translations[language].subscription

  const ctaStyles: Record<Plan['ctaStyle'], string> = {
    ghost: 'cursor-default border border-neutral-200 bg-white text-neutral-400',
    outline: 'border border-neutral-200 bg-white text-neutral-700 transition-all duration-300 hover:border-neutral-400 hover:text-black',
    charcoal: 'bg-[#1a1a1a] text-white transition-all duration-300 hover:bg-black group',
    gold: 'border border-[#c8b898]/40 bg-[#f8f5f0] text-[#6b5d45] transition-all duration-300 hover:border-[#c8b898]/80 hover:bg-[#f0ebe0]',
  }

  const currentPrice = plan.price

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
      {(plan.badge || plan.highlight) && (
        <div className={`absolute left-0 right-0 top-0 py-2 text-center ${plan.highlight ? 'bg-[#1a1a1a]' : 'bg-[#a08c6a]'}`}>
          <span className="text-[9px] uppercase tracking-[0.22em] text-white" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
            {plan.highlight 
              ? (language === 'vi' ? 'Gói hiện tại' : 'Current Plan') 
              : plan.badge}
          </span>
        </div>
      )}

      <div className={`flex flex-1 flex-col p-6 ${(plan.badge || plan.highlight) ? 'pt-10' : ''}`}>
        <div className="mb-5">
          <p className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-[#a08c6a]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            {plan.id === 'free' ? subTrans.freeForever : plan.id === 'starter' ? subTrans.oneTimePack : subTrans.mostPopularBadge}
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
                key={plan.id}
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
              {plan.priceNote}
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
              {plan.turns}
            </p>
            {plan.turnsNote && (
              <p className="mt-0.5 text-[10px] text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                {plan.turnsNote}
              </p>
            )}
          </div>
        </div>

        <ul className="mb-6 flex-1 space-y-2.5">
          {plan.features.map((feature, featureIndex) => (
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
            {subTrans.planStarterNote}
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
  const { language } = useLanguage()
  const faqs = translations[language].subscription.faqs

  return (
    <div className="space-y-2">
      {faqs.map((faq, index) => (
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