import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Check,
  ChevronLeft,
  Copy,
  Eye,
  Lock,
  Package,
  RefreshCw,
  Shield,
  Sparkles,
  Truck,
  X,
  Zap,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Footer, Header } from './Hompage'
import { useCart } from '../contexts/cart-context'
import { getProductsByIds, type ProductDetail } from '../services/productApi'
import { checkPaymentStatus, fetchBankInfo, buildVietQrUrl, type BankInfo } from '../services/paymentApi'

type Step = 'shipping' | 'payment' | 'review'
type DeliveryMethod = 'standard' | 'express'

/** Generate a unique order ID for SePay transfer content (product purchase = PRD prefix) */
function generateOrderId(): string {
  return 'PRD' + Date.now()
}

type FieldProps = {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  type?: string
  half?: boolean
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function ImageWithFallback({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#f7f5f2] text-center text-[11px] text-neutral-400">
        Image unavailable
      </div>
    )
  }

  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />
}

function Field({ label, placeholder, value, onChange, type = 'text', half = false }: FieldProps) {
  return (
    <div className={half ? 'flex-1 min-w-0' : 'w-full'}>
      <label className="mb-2 block text-[11px] uppercase tracking-[0.12em] text-neutral-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-200/80 bg-white px-4 py-3 text-[13px] text-black placeholder:text-neutral-300 transition-all focus:border-[#c8b898]/50 focus:outline-none focus:ring-1 focus:ring-[#c8b898]/20"
      />
    </div>
  )
}

function SummaryRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[13px]">
      <span className="text-neutral-500">{label}</span>
      <span className={muted ? 'text-neutral-400' : 'text-black'}>{value}</span>
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items } = useCart()
  const [currentStep, setCurrentStep] = useState<Step>('shipping')
  const [delivery, setDelivery] = useState<DeliveryMethod>('standard')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolvedProducts, setResolvedProducts] = useState<Record<string, ProductDetail>>({})

  // SePay payment state
  const [orderId] = useState<string>(() => generateOrderId())
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending')
  const [polling, setPolling] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [qrLoaded, setQrLoaded] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  // Fetch bank info on mount
  useEffect(() => {
    fetchBankInfo()
      .then(setBankInfo)
      .catch(() => console.warn('[SePay] Could not load bank info – using fallback'))
  }, [])

  // Start/stop polling when entering/leaving payment step
  useEffect(() => {
    if (currentStep === 'payment' && paymentStatus === 'pending') {
      setPolling(true)
      pollingRef.current = setInterval(async () => {
        try {
          const result = await checkPaymentStatus(orderId)
          if (result.status === 'paid') {
            setPaymentStatus('paid')
            setPolling(false)
            if (pollingRef.current) clearInterval(pollingRef.current)
            // Auto-advance to Review after brief celebration delay
            setTimeout(() => goNext(), 1800)
          }
        } catch {
          // silently ignore polling errors
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
  }, [currentStep, paymentStatus])

  useEffect(() => {
    const loadCheckoutProducts = async () => {
      if (items.length === 0) {
        setResolvedProducts({})
        setLoading(false)
        setError(null)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await getProductsByIds(items.map((item) => item.productId))
        setResolvedProducts(
          response.items.reduce<Record<string, ProductDetail>>((accumulator, product) => {
            accumulator[product.id] = product
            return accumulator
          }, {}),
        )

        if (response.missingIds.length > 0) {
          setError('One or more products are no longer available in the catalog.')
        }
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Failed to load checkout items')
      } finally {
        setLoading(false)
      }
    }

    void loadCheckoutProducts()
  }, [items])

  const subtotal = useMemo(
    () =>
      items.reduce((total, item) => total + (resolvedProducts[item.productId]?.price ?? 0) * item.quantity, 0),
    [items, resolvedProducts],
  )
  const shippingCost = delivery === 'express' ? 195 : 0
  const total = subtotal + shippingCost
  const hasItems = items.length > 0

  const steps: { key: Step; label: string }[] = [
    { key: 'shipping', label: 'Shipping' },
    { key: 'payment', label: 'Payment' },
    { key: 'review', label: 'Review' },
  ]

  const stepIndex = steps.findIndex((step) => step.key === currentStep)

  const goNext = () => {
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].key)
    }
  }

  const goBack = () => {
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].key)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const simulationImage =
    'https://images.unsplash.com/photo-1680503397667-3877494708a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBsaXZpbmclMjByb29tJTIwc29mYSUyMGNvZmZlZSUyMHRhYmxlJTIwc3R5bGVkJTIwd2FybSUyMGxpZ2h0aW5nfGVufDF8fHx8MTc3MjY5NjM0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#fbf7f1_52%,#f4efe6_100%)] text-[#141311]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />

      <main className="pt-[72px]">
        <section className="mx-auto max-w-[1440px] px-6 py-6 md:px-10 lg:px-16 lg:py-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <button
              onClick={() => navigate('/cart')}
              className="inline-flex items-center gap-2 text-[12px] text-neutral-400 transition-colors hover:text-black"
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
              Back to Cart
            </button>

            <div className="inline-flex items-center gap-2 rounded-full border border-[#c8b898]/30 bg-white/80 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[#8a7456] shadow-[0_1px_0_rgba(0,0,0,0.02)]">
              <Lock size={12} />
              Secure Checkout
            </div>
          </div>

          <div className="mb-5 max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#a08c6a]">Checkout</p>
            <h1 className="mt-3 text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
              Complete your order with a calm, secure checkout flow.
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-500">
              This page is wired to the existing cart store and product API, so it fits the current FE structure without introducing a separate Figma-only layer.
            </p>
          </div>

          <div className="mb-8 max-w-[520px]">
            <div className="relative flex items-center justify-between">
              <div className="absolute left-[15%] right-[15%] top-[11px] h-px bg-neutral-200" />
              <div
                className="absolute left-[15%] top-[11px] h-px bg-[#c8b898] transition-all duration-500"
                style={{ width: stepIndex === 0 ? '0%' : stepIndex === 1 ? '50%' : '100%', maxWidth: '70%' }}
              />

              {steps.map((step, index) => {
                const isActive = index === stepIndex
                const isComplete = index < stepIndex

                return (
                  <button
                    key={step.key}
                    onClick={() => index <= stepIndex && setCurrentStep(step.key)}
                    className="relative z-10 flex flex-col items-center gap-2"
                  >
                    <div
                      className={`flex h-[22px] w-[22px] items-center justify-center rounded-full transition-all duration-300 ${
                        isComplete
                          ? 'bg-[#c8b898] text-white'
                          : isActive
                            ? 'border-2 border-[#c8b898] bg-white text-[#c8b898]'
                            : 'border border-neutral-200 bg-white text-neutral-300'
                      }`}
                    >
                      {isComplete ? <Check size={11} strokeWidth={2.5} /> : <span className="text-[9px] font-semibold">{index + 1}</span>}
                    </div>
                    <span className={`text-[10px] uppercase tracking-[0.1em] ${isActive || isComplete ? 'text-neutral-700' : 'text-neutral-300'}`}>
                      {step.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {!hasItems ? (
            <div className="grid min-h-[420px] place-items-center rounded-[32px] border border-black/5 bg-white/90 p-8 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
              <div className="max-w-xl text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-50">
                  <Package size={28} className="text-neutral-300" strokeWidth={1.3} />
                </div>
                <h2 className="text-[24px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                  Your checkout is empty
                </h2>
                <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-neutral-400">
                  Add items from the catalog first, then return here to complete shipping and payment.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => navigate('/discovery')}
                    className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-neutral-800"
                  >
                    <Sparkles size={14} />
                    Explore Collection
                  </button>
                  <button
                    onClick={() => navigate('/cart')}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-neutral-600 transition-colors hover:border-black/25 hover:text-black"
                  >
                    <ChevronLeft size={14} />
                    Back to Cart
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
              <div>
                {loading ? (
                  <div className="rounded-[28px] border border-black/5 bg-white p-8 text-center text-neutral-500">
                    Loading checkout items...
                  </div>
                ) : null}

                <AnimatePresence mode="wait">
                  {currentStep === 'shipping' ? (
                    <motion.div
                      key="shipping"
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 18 }}
                      transition={{ duration: 0.3 }}
                    >
                      <section className="mb-10 rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:p-8">
                        <h2 className="text-[22px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                          Shipping Information
                        </h2>
                        <p className="mb-7 mt-1 text-[13px] text-neutral-400">Where should we deliver your pieces?</p>

                        <div className="space-y-5">
                          <div className="flex gap-4">
                            <Field label="First Name" placeholder="Alexander" value={firstName} onChange={setFirstName} half />
                            <Field label="Last Name" placeholder="Mitchell" value={lastName} onChange={setLastName} half />
                          </div>
                          <Field label="Email Address" placeholder="alexander@email.com" value={email} onChange={setEmail} type="email" />
                          <Field label="Phone Number" placeholder="+1 (555) 000-0000" value={phone} onChange={setPhone} type="tel" />
                          <Field label="Street Address" placeholder="1234 Park Avenue, Apt 5B" value={address} onChange={setAddress} />
                          <div className="flex gap-4">
                            <Field label="City" placeholder="New York" value={city} onChange={setCity} half />
                            <Field label="State" placeholder="NY" value={state} onChange={setState} half />
                          </div>
                          <div className="flex gap-4">
                            <Field label="ZIP Code" placeholder="10021" value={zip} onChange={setZip} half />
                            <div className="flex-1" />
                          </div>
                        </div>
                      </section>

                      <section className="mb-10 rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:p-8">
                        <h2 className="text-[18px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                          Delivery Method
                        </h2>
                        <p className="mb-5 mt-1 text-[13px] text-neutral-400">All deliveries include white-glove service</p>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {[
                            {
                              key: 'standard' as DeliveryMethod,
                              icon: Truck,
                              title: 'Standard Delivery',
                              desc: '5-10 business days',
                              price: 'Complimentary',
                              priceColor: 'text-[#8a7456]',
                            },
                            {
                              key: 'express' as DeliveryMethod,
                              icon: Zap,
                              title: 'Express Delivery',
                              desc: '2-3 business days',
                              price: '$195',
                              priceColor: 'text-black',
                            },
                          ].map((option) => {
                            const active = delivery === option.key

                            return (
                              <button
                                key={option.key}
                                onClick={() => setDelivery(option.key)}
                                className={`relative rounded-xl border p-5 text-left transition-all duration-300 ${
                                  active
                                    ? 'border-[#c8b898]/50 bg-[#c8b898]/[0.04] ring-1 ring-[#c8b898]/20'
                                    : 'border-neutral-200/60 bg-white hover:border-neutral-300'
                                }`}
                              >
                                <div className="absolute right-5 top-5">
                                  <div className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 ${active ? 'border-[#c8b898]' : 'border-neutral-200'}`}>
                                    {active ? <motion.div className="h-2 w-2 rounded-full bg-[#c8b898]" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }} /> : null}
                                  </div>
                                </div>

                                <div className="flex items-start gap-3.5">
                                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${active ? 'bg-[#c8b898]/10' : 'bg-neutral-50'}`}>
                                    <option.icon size={17} className={active ? 'text-[#a08c6a]' : 'text-neutral-400'} strokeWidth={1.5} />
                                  </div>
                                  <div>
                                    <span className="mb-0.5 block text-[13px] text-black" style={{ fontWeight: 500 }}>
                                      {option.title}
                                    </span>
                                    <span className="mb-2 block text-[11px] text-neutral-400">{option.desc}</span>
                                    <span className={`text-[12px] ${option.priceColor}`} style={{ fontWeight: 500 }}>
                                      {option.price}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </section>

                      <button
                        onClick={goNext}
                        className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#2a2a2a] px-12 py-4 text-white transition-all duration-300 hover:bg-[#1a1a1a] sm:w-auto"
                      >
                        <span className="text-[13px] uppercase tracking-[0.1em]" style={{ fontWeight: 500 }}>
                          Continue to Payment
                        </span>
                      </button>
                    </motion.div>
                  ) : null}

                  {currentStep === 'payment' ? (
                    <motion.div
                      key="payment"
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 18 }}
                      transition={{ duration: 0.3 }}
                    >
                      <section className="mb-10 rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:p-8">
                        <h2 className="text-[22px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                          Thanh toán qua chuyển khoản
                        </h2>
                        <p className="mb-7 mt-1 text-[13px] text-neutral-400">
                          Quét mã QR hoặc chuyển khoản theo thông tin bên dưới — hệ thống sẽ tự xác nhận
                        </p>

                        {/* SePay QR Payment UI */}
                        <AnimatePresence mode="wait">
                          {paymentStatus === 'paid' ? (
                            /* ── Payment confirmed ── */
                            <motion.div
                              key="paid"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex flex-col items-center gap-4 py-12 text-center"
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
                              <p className="text-[13px] text-neutral-400">Đang chuyển sang bước xác nhận đơn hàng...</p>
                            </motion.div>
                          ) : (
                            /* ── QR + bank details ── */
                            <motion.div
                              key="qr"
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col gap-6 lg:flex-row lg:items-start"
                            >
                              {/* QR Code */}
                              <div className="flex flex-col items-center gap-3">
                                <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-neutral-50 p-3 shadow-inner">
                                  {bankInfo ? (
                                    <img
                                      src={buildVietQrUrl(bankInfo, total, orderId)}
                                      alt="VietQR Payment"
                                      className={`h-[200px] w-[200px] object-contain transition-opacity duration-500 ${qrLoaded ? 'opacity-100' : 'opacity-0'}`}
                                      onLoad={() => setQrLoaded(true)}
                                    />
                                  ) : null}
                                  {(!bankInfo || !qrLoaded) ? (
                                    <div className="flex h-[200px] w-[200px] items-center justify-center">
                                      <RefreshCw size={24} className="animate-spin text-neutral-300" />
                                    </div>
                                  ) : null}
                                </div>
                                {/* VietQR logo badge */}
                                <div className="flex items-center gap-1.5 rounded-full bg-[#003087]/5 px-3 py-1">
                                  <div className="h-2 w-2 rounded-full bg-[#003087]" />
                                  <span className="text-[10px] font-medium uppercase tracking-widest text-[#003087]">VietQR</span>
                                </div>
                                {/* Polling indicator */}
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
                              <div className="flex-1 space-y-3">
                                {/* Row helper */}
                                {[
                                  {
                                    label: 'Ngân hàng',
                                    value: bankInfo?.bankShortName ?? '—',
                                    copyable: false,
                                  },
                                  {
                                    label: 'Số tài khoản',
                                    value: bankInfo?.accountNumber ?? '—',
                                    copyable: true,
                                    copyKey: 'account',
                                  },
                                  {
                                    label: 'Chủ tài khoản',
                                    value: bankInfo?.accountName ?? '—',
                                    copyable: false,
                                  },
                                  {
                                    label: 'Số tiền',
                                    value: formatCurrency(total),
                                    copyable: true,
                                    copyKey: 'amount',
                                    rawValue: String(total),
                                    highlight: true,
                                  },
                                  {
                                    label: 'Nội dung CK',
                                    value: orderId,
                                    copyable: true,
                                    copyKey: 'content',
                                    important: true,
                                  },
                                ].map((row) => (
                                  <div
                                    key={row.label}
                                    className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 ${
                                      row.important
                                        ? 'border border-amber-200/80 bg-amber-50'
                                        : 'border border-neutral-100 bg-neutral-50'
                                    }`}
                                  >
                                    <div className="min-w-0">
                                      <p className="mb-0.5 text-[10px] uppercase tracking-[0.12em] text-neutral-400">{row.label}</p>
                                      <p
                                        className={`truncate text-[14px] ${
                                          row.highlight
                                            ? 'font-semibold text-black'
                                            : row.important
                                              ? 'font-medium text-amber-700'
                                              : 'text-black'
                                        }`}
                                      >
                                        {row.value}
                                      </p>
                                    </div>
                                    {row.copyable && row.copyKey ? (
                                      <button
                                        onClick={() => copyToClipboard(row.rawValue ?? row.value, row.copyKey!)}
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition-all hover:border-neutral-300 hover:text-black"
                                        title={`Sao chép ${row.label}`}
                                      >
                                        {copied === row.copyKey ? (
                                          <Check size={13} className="text-emerald-500" />
                                        ) : (
                                          <Copy size={13} />
                                        )}
                                      </button>
                                    ) : null}
                                  </div>
                                ))}

                                {/* Important notice */}
                                <div className="rounded-xl border border-amber-200/60 bg-amber-50/60 px-4 py-3">
                                  <p className="text-[11px] leading-relaxed text-amber-700">
                                    ⚠️ Vui lòng giữ đúng nội dung chuyển khoản{' '}
                                    <span className="font-semibold">{orderId}</span>{' '}
                                    để hệ thống tự động xác nhận đơn hàng.
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </section>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={goBack}
                          className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-6 py-4 text-neutral-500 transition-all hover:border-neutral-300 hover:text-black"
                        >
                          <ChevronLeft size={15} />
                          <span className="text-[12px] uppercase tracking-[0.08em]">Back</span>
                        </button>
                        <button
                          onClick={goNext}
                          disabled={paymentStatus !== 'paid'}
                          className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-[#2a2a2a] px-12 py-4 text-white transition-all duration-300 hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                        >
                          <span className="text-[13px] uppercase tracking-[0.1em]" style={{ fontWeight: 500 }}>
                            Review Order
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  ) : null}

                  {currentStep === 'review' ? (
                    <motion.div
                      key="review"
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 18 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:p-8"
                    >
                      <h2 className="text-[22px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                        Review Your Order
                      </h2>
                      <p className="mb-8 mt-1 text-[13px] text-neutral-400">Please confirm the details below before placing your order</p>

                      <div className="mb-5 rounded-xl border border-neutral-100 bg-white p-5">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">Shipping Address</span>
                          <button onClick={() => setCurrentStep('shipping')} className="text-[11px] text-[#8a7456] transition-colors hover:text-[#6b5d45]">
                            Edit
                          </button>
                        </div>
                        <p className="text-[13px] text-black">{firstName || 'Alexander'} {lastName || 'Mitchell'}</p>
                        <p className="text-[12px] text-neutral-400">
                          {address || '1234 Park Avenue, Apt 5B'}
                          <br />
                          {city || 'New York'}, {state || 'NY'} {zip || '10021'}
                        </p>
                      </div>

                      <div className="mb-5 rounded-xl border border-neutral-100 bg-white p-5">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">Payment Method</span>
                          <button onClick={() => setCurrentStep('payment')} className="text-[11px] text-[#8a7456] transition-colors hover:text-[#6b5d45]">
                            Edit
                          </button>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#003087]/10">
                            <div className="h-2 w-2 rounded-full bg-[#003087]" />
                          </div>
                          <div>
                            <span className="block text-[13px] text-black">Chuyển khoản ngân hàng</span>
                            <span className="text-[11px] text-neutral-400">Mã đơn hàng: {orderId}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-8 rounded-xl border border-neutral-100 bg-white p-5">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-500">Delivery</span>
                          <button onClick={() => setCurrentStep('shipping')} className="text-[11px] text-[#8a7456] transition-colors hover:text-[#6b5d45]">
                            Edit
                          </button>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {delivery === 'standard' ? <Truck size={16} className="text-neutral-400" strokeWidth={1.5} /> : <Zap size={16} className="text-neutral-400" strokeWidth={1.5} />}
                          <span className="text-[13px] text-black">
                            {delivery === 'standard' ? 'Standard (5-10 days) - Free' : 'Express (2-3 days) - $195'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={goBack}
                          className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-6 py-4 text-neutral-500 transition-all hover:border-neutral-300 hover:text-black"
                        >
                          <ChevronLeft size={15} />
                          <span className="text-[12px] uppercase tracking-[0.08em]">Back</span>
                        </button>
                        <button
                          onClick={() => setOrderPlaced(true)}
                          className="flex flex-1 items-center justify-center gap-3 rounded-xl bg-[#2a2a2a] px-14 py-4 text-white transition-all duration-300 hover:bg-[#1a1a1a] sm:flex-none"
                        >
                          <Lock size={14} strokeWidth={1.5} />
                          <span className="text-[13px] uppercase tracking-[0.14em]" style={{ fontWeight: 600 }}>
                            Place Order
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <AnimatePresence>
                  {error ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 0 }}
                      className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800"
                    >
                      {error}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="space-y-5 lg:sticky lg:top-[96px]">
                <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
                  <h3 className="mb-5 text-[17px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                    Order Summary
                  </h3>

                  <div className="mb-5 space-y-4">
                    {items.map((item) => {
                      const product = resolvedProducts[item.productId]

                      return (
                        <div key={item.productId} className="flex gap-3.5">
                          <div className="h-[68px] w-[60px] shrink-0 overflow-hidden rounded-lg bg-[#f7f6f3]">
                            {product ? (
                              <ImageWithFallback src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[11px] text-neutral-400">Loading</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-[13px] text-black" style={{ fontWeight: 500 }}>
                              {product?.name ?? 'Loading item'}
                            </h4>
                            <p className="mb-1 text-[11px] text-neutral-400" style={{ fontWeight: 300 }}>
                              {product?.subtitle ?? product?.category ?? 'Fetching product details'}
                            </p>
                            <span className="text-[11px] text-neutral-500">Qty: {item.quantity}</span>
                          </div>
                          <span className="shrink-0 text-[14px] text-black" style={{ fontWeight: 400 }}>
                            {product ? formatCurrency(product.price * item.quantity) : '—'}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mb-4 h-px bg-neutral-100" />

                  <div className="mb-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles size={12} className="text-[#a08c6a]" />
                      <span className="text-[10px] uppercase tracking-[0.12em] text-[#8a7456]" style={{ fontWeight: 500 }}>
                        Final Look - AI Simulation
                      </span>
                    </div>
                    <button onClick={() => setPreviewOpen(true)} className="group relative w-full overflow-hidden rounded-xl">
                      <div className="aspect-[16/9]">
                        <ImageWithFallback src={simulationImage} alt="AI room simulation" className="h-full w-full object-cover" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20">
                        <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                          <Eye size={13} className="text-neutral-700" />
                          <span className="text-[11px] text-neutral-700" style={{ fontWeight: 500 }}>
                            View Full Preview
                          </span>
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/50 px-2.5 py-1.5 backdrop-blur-md">
                        <Check size={10} className="text-green-400" />
                        <span className="text-[9px] text-white/80" style={{ fontWeight: 400 }}>
                          Gemini AI Verified - 96% fit
                        </span>
                      </div>
                    </button>
                  </div>

                  <div className="mb-4 h-px bg-neutral-100" />

                  <div className="space-y-3">
                    <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
                    <SummaryRow label="Shipping" value={delivery === 'standard' ? 'Complimentary' : formatCurrency(shippingCost)} muted={delivery === 'standard'} />
                    <SummaryRow label="Tax" value="Calculated at next step" muted />
                  </div>

                  <div className="my-4 h-px bg-neutral-100" />

                  <div className="flex items-baseline justify-between">
                    <span className="text-[14px] text-black" style={{ fontWeight: 500 }}>
                      Total
                    </span>
                    <span className="text-[26px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                      {formatCurrency(total)}
                    </span>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-4 text-[9px] text-neutral-400">
                    {[
                      { icon: Truck, label: 'Free Delivery' },
                      { icon: Shield, label: 'Secure Payment' },
                      { icon: Package, label: 'White-Glove Service' },
                    ].map((entry) => (
                      <div key={entry.label} className="flex items-center gap-1.5">
                        <entry.icon size={11} strokeWidth={1.5} />
                        <span>{entry.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-50">
                      <Lock size={15} className="text-neutral-400" strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="block text-[11px] text-black" style={{ fontWeight: 500 }}>
                        SSL Encryption
                      </span>
                      <span className="text-[10px] text-neutral-400">256-bit secure checkout</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-50">
                      <Package size={15} className="text-neutral-400" strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="block text-[11px] text-black" style={{ fontWeight: 500 }}>
                        Luxury Delivery
                      </span>
                      <span className="text-[10px] text-neutral-400">White-glove service</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-50">
                      <Shield size={15} className="text-neutral-400" strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="block text-[11px] text-black" style={{ fontWeight: 500 }}>
                        Buyer Protection
                      </span>
                      <span className="text-[10px] text-neutral-400">Full purchase guarantee</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#c8b898]/8">
                      <Sparkles size={15} className="text-[#a08c6a]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <span className="block text-[11px] text-black" style={{ fontWeight: 500 }}>
                        AI Verified Fit
                      </span>
                      <span className="text-[10px] text-neutral-400">Gemini room analysis</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />

      <AnimatePresence>
        {previewOpen ? (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewOpen(false)} />
            <motion.div
              className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-[#111] shadow-2xl"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            >
              <div className="relative aspect-[16/10]">
                <ImageWithFallback src={simulationImage} alt="AI Room Simulation" className="h-full w-full object-cover" />
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-md">
                  <Sparkles size={11} className="text-[#c8b898]" />
                  <span className="text-[10px] uppercase tracking-[0.12em] text-white/70" style={{ fontWeight: 500 }}>
                    Your Final Look - Gemini AI
                  </span>
                </div>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/50 backdrop-blur-md transition-colors hover:text-white"
                >
                  <X size={14} />
                </button>
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-md">
                  <Check size={11} className="text-green-400" />
                  <span className="text-[10px] text-white/70">
                    Fit confidence: <span className="text-[#c8b898]" style={{ fontWeight: 500 }}>96%</span>
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {orderPlaced ? (
          <motion.div className="fixed inset-0 z-[110] flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={() => setOrderPlaced(false)} />
            <motion.div
              className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.28)]"
              initial={{ scale: 0.94, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 12, opacity: 0 }}
              transition={{ duration: 0.28 }}
            >
              <div className="bg-[linear-gradient(135deg,#f8f5ef_0%,#eee6d8_100%)] px-7 py-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#8a7456]">
                  <Check size={12} />
                  Order placed
                </div>
                <h3 className="text-3xl text-[#1d1814]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Thanks. Your order is confirmed.
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#74685a]">
                  This version keeps the flow local to the checkout page, so you can connect it to the backend payment API later without changing the page structure.
                </p>
              </div>

              <div className="flex flex-col gap-3 px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={() => setOrderPlaced(false)}
                  className="rounded-full border border-black/15 px-5 py-2 text-[11px] uppercase tracking-[0.16em] text-neutral-600 transition-colors hover:border-black/35"
                >
                  Keep reviewing
                </button>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/discovery')}
                    className="inline-flex items-center gap-2 rounded-full bg-[#171412] px-5 py-2 text-[11px] uppercase tracking-[0.16em] text-white"
                  >
                    <Sparkles size={12} />
                    Continue shopping
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2 text-[11px] uppercase tracking-[0.16em] text-neutral-600 transition-colors hover:border-black/25 hover:text-black"
                  >
                    Home
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}