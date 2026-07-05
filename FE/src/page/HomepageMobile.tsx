import { motion } from 'motion/react'
import {
  Camera,
  ChevronRight,
  ExternalLink,
  Globe,
  Menu,
  Sparkles,
  Star,
  Check,
  ChevronUp,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/auth-context'
import { getFeaturedProducts } from '../services/productApi'
import { Header } from '../components/Header'

// ---------------------------------------------------------------------------
// Reusable fade-in-on-scroll wrapper
// ---------------------------------------------------------------------------
function FadeInSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.08 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main HomepageMobile component
// ---------------------------------------------------------------------------
export function HomepageMobile() {
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const [dbProducts, setDbProducts] = useState<any[]>([])
  const [dbPlans, setDbPlans] = useState<any[]>([])

  useEffect(() => {
    let active = true
    getFeaturedProducts(12)
      .then((items) => { if (active && items && items.length > 0) setDbProducts(items) })
      .catch(() => {})
    fetch('/api/payment/subscription-plans')
      .then((res) => res.json())
      .then((json) => { if (active && json.success && json.data) setDbPlans(json.data) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  // ── Data ──────────────────────────────────────────────────────────────────

  const steps = [
    { icon: Camera, number: '01', title: t('homepage.step1Title'), text: t('homepage.step1Text'), imageUrl: 'https://res.cloudinary.com/dgz3rhiv4/image/upload/v1781088956/Section_6_vtmkxe.png' },
    { icon: Sparkles, number: '02', title: t('homepage.step2Title'), text: t('homepage.step2Text'), imageUrl: 'https://res.cloudinary.com/dgz3rhiv4/image/upload/v1781089224/section5-2_a5xrcl.png' },
    { icon: ExternalLink, number: '03', title: t('homepage.step3Title'), text: t('homepage.step3Text'), imageUrl: 'https://res.cloudinary.com/dgz3rhiv4/image/upload/v1781089207/section5-3_pmdfqo.png' },
  ]

  const features = [
    { icon: Sparkles, titleKey: 'feature1Title', descKey: 'feature1Desc', color: '#c8b898', bgColor: 'rgba(200,184,152,0.12)' },
    { icon: SlidersHorizontal, titleKey: 'feature2Title', descKey: 'feature2Desc', color: '#a08c6a', bgColor: 'rgba(160,140,106,0.1)' },
    { icon: ChevronUp, titleKey: 'feature3Title', descKey: 'feature3Desc', color: '#8a7456', bgColor: 'rgba(138,116,86,0.1)' },
    { icon: ShoppingBag, titleKey: 'feature4Title', descKey: 'feature4Desc', color: '#6f5a41', bgColor: 'rgba(111,90,65,0.1)' },
  ]

  const stats = [
    { valueKey: 'stat1Value', labelKey: 'stat1Label' },
    { valueKey: 'stat2Value', labelKey: 'stat2Label' },
    { valueKey: 'stat3Value', labelKey: 'stat3Label' },
    { valueKey: 'stat4Value', labelKey: 'stat4Label' },
  ]

  const CATEGORY_KEYS: Record<string, string> = {
    All: 'discovery.allProducts', Sofas: 'discovery.sofas', Tables: 'discovery.tables',
    Chairs: 'discovery.chairs', Beds: 'discovery.beds', Lighting: 'discovery.lighting',
    Storage: 'discovery.storage', Decor: 'discovery.decor',
  }

  const staticProducts = [
    { id: '1', name: language === 'vi' ? 'Sofa vải lanh Serene' : 'Serene Linen Sofa', category: language === 'vi' ? 'Sofa' : 'Sofas', price: language === 'vi' ? '110.000.000 ₫' : '$4,890', imageUrl: 'https://images.unsplash.com/photo-1759722668767-3f9cb7468b7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
    { id: '2', name: language === 'vi' ? 'Bàn bên Carrara' : 'Carrara Side Table', category: language === 'vi' ? 'Bàn' : 'Tables', price: language === 'vi' ? '51.000.000 ₫' : '$2,290', imageUrl: 'https://images.unsplash.com/photo-1765766638341-0beb9eb9926c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
    { id: '3', name: language === 'vi' ? 'Ghế thư giãn gỗ óc chó' : 'Walnut Lounge Chair', category: language === 'vi' ? 'Ghế' : 'Chairs', price: language === 'vi' ? '70.000.000 ₫' : '$3,140', imageUrl: 'https://images.unsplash.com/photo-1762803841091-c5327f7aed37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
    { id: '4', name: language === 'vi' ? 'Đèn thả đồng thau Atelier' : 'Atelier Brass Pendant', category: language === 'vi' ? 'Đèn chiếu sáng' : 'Lighting', price: language === 'vi' ? '33.000.000 ₫' : '$1,480', imageUrl: 'https://images.unsplash.com/photo-1767979066193-83dffc4a4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
    { id: '5', name: language === 'vi' ? 'Bàn ăn gỗ sồi Nordic' : 'Nordic Oak Dining Table', category: language === 'vi' ? 'Bàn' : 'Tables', price: language === 'vi' ? '127.000.000 ₫' : '$5,640', imageUrl: 'https://images.unsplash.com/photo-1772442363851-738a548f6c5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
    { id: '6', name: language === 'vi' ? 'Ghế accent Boucle' : 'Boucle Accent Chair', category: language === 'vi' ? 'Ghế' : 'Chairs', price: language === 'vi' ? '66.000.000 ₫' : '$2,950', imageUrl: 'https://images.unsplash.com/photo-1768946131690-247c5319f0d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600' },
  ]

  const discoveryProducts = useMemo(() => {
    if (dbProducts.length === 0) return staticProducts
    return dbProducts.slice(0, 6).map((p) => ({
      id: p.id, name: p.name,
      category: t(CATEGORY_KEYS[p.category] || p.category as any),
      price: `${p.price.toLocaleString('vi-VN')}₫`,
      imageUrl: p.imageUrl,
    }))
  }, [dbProducts, language, t])

  const pricingPlans = useMemo(() => {
    if (dbPlans.length === 0) {
      return [
        { planId: 'free', name: t('homepage.pricingFreeName'), price: t('homepage.pricingFreePrice'), desc: t('homepage.pricingFreeDesc'), turnsLabel: language === 'vi' ? '3 lượt AI / ngày' : '3 AI / day' },
        { planId: 'starter', name: t('homepage.pricingStarterName'), price: t('homepage.pricingStarterPrice'), desc: t('homepage.pricingStarterDesc'), turnsLabel: language === 'vi' ? '10 lượt AI' : '10 AI try-ons' },
        { planId: 'standard', name: t('homepage.pricingStandardName'), price: t('homepage.pricingStandardPrice'), desc: t('homepage.pricingStandardDesc'), features: [language === 'vi' ? '40 lượt AI' : '40 AI try-ons', language === 'vi' ? 'Tất cả phong cách' : 'All styles', language === 'vi' ? 'Lưu & chia sẻ' : 'Save & share', language === 'vi' ? 'Ưu tiên xử lý' : 'Priority processing'] },
        { planId: 'premium', name: t('homepage.pricingPremiumName'), price: t('homepage.pricingPremiumPrice'), desc: t('homepage.pricingPremiumDesc'), tags: [language === 'vi' ? '70 lượt AI' : '70 AI try-ons', language === 'vi' ? 'Tất cả tính năng' : 'All features', language === 'vi' ? 'Hỗ trợ ưu tiên' : 'Priority support'] },
      ]
    }
    return dbPlans.map((p: any) => {
      const formattedPrice = p.price === 0
        ? (language === 'vi' ? '0 ₫' : '0 ₫')
        : p.price.toLocaleString('vi-VN') + ' ₫'

      let desc = ''
      if (p.planId === 'free') {
        desc = language === 'vi'
          ? '3 lượt AI / ngày, làm mới lúc nửa đêm'
          : '3 AI turns / day, resets at midnight'
      } else {
        const typeText = p.priceNote ? (p.priceNote[language] || p.priceNote.en) : ''
        desc = language === 'vi'
          ? `${p.turns} lượt AI · ${typeText}`
          : `${p.turns} AI turns · ${typeText}`
      }

      const turnsSuffix = p.planId === 'free'
        ? (language === 'vi' ? 'lượt AI / ngày' : 'AI try-ons / day')
        : (language === 'vi' ? 'lượt AI' : 'AI try-ons')
      const turnsLabel = `${p.turns} ${turnsSuffix}`

      const tags = p.tags ? (p.tags[language] || p.tags.en) : []

      return {
        planId: p.planId,
        name: p.name[language] || p.name.en,
        price: formattedPrice,
        desc: desc,
        turnsLabel: turnsLabel,
        features: p.features ? (p.features[language] || p.features.en) : [],
        tags: tags
      }
    })
  }, [dbPlans, language, t])

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-[#fdfcf9] text-[#141311]">
      <Header />

      {/* ═══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative pt-[60px]">
        <div className="absolute inset-x-0 top-0 -z-10 h-[320px] bg-[radial-gradient(ellipse_at_top,rgba(200,184,152,0.18),transparent_60%)]" />

        <div className="px-5 pt-10 pb-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#a08c6a]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {t('homepage.roomVisualiser')}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="text-[2.1rem] leading-[1.08] tracking-[-0.03em] text-[#1d1814]"
            style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}
          >
            {t('homepage.heroTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mx-auto mt-3 max-w-[300px] text-[13px] leading-relaxed text-[#7b7368]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {t('homepage.heroDesc')}
          </motion.p>
        </div>

        {/* Before / After side-by-side */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.28 }}
          className="relative mx-4 grid grid-cols-2 gap-2"
        >
          <div className="group relative overflow-hidden rounded-2xl">
            <div className="aspect-[3/4] overflow-hidden">
              <img src="https://res.cloudinary.com/dgz3rhiv4/image/upload/v1780894218/ChatGPT_Image_Jun_8_2026_11_50_07_AM_xycatx.png" alt="Before room" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="eager" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-[8px] uppercase tracking-[0.18em] text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>{t('homepage.yourRoom')}</p>
              <p className="text-[13px] text-white" style={{ fontFamily: 'Playfair Display, serif' }}>{t('homepage.before')}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl">
            <div className="aspect-[3/4] overflow-hidden">
              <img src="https://res.cloudinary.com/dgz3rhiv4/image/upload/v1780894205/ChatGPT_Image_Jun_8_2026_11_47_54_AM_unvcav.png" alt="After AI integration" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="eager" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-[8px] uppercase tracking-[0.18em] text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>{t('homepage.aiIntegration')}</p>
              <p className="text-[13px] text-white" style={{ fontFamily: 'Playfair Display, serif' }}>{t('homepage.after')}</p>
            </div>
          </div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg">
              <Sparkles size={15} className="text-[#a08c6a]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-5 flex justify-center pb-10"
        >
          <button
            onClick={() => navigate('/ai-room-planner')}
            className="inline-flex items-center gap-2 rounded-full bg-[#161311] px-6 py-3 text-[10px] uppercase tracking-[0.24em] text-white shadow-[0_12px_30px_rgba(20,17,14,0.22)]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            {t('homepage.startScan')}
            <ChevronRight size={13} />
          </button>
        </motion.div>
      </section>

      {/* ═══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section className="bg-[#faf9f7] px-5 py-12">
        <FadeInSection>
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-[#a08c6a]" style={{ fontFamily: 'Inter, sans-serif' }}>{t('homepage.howItWorks')}</p>
          <h2 className="mb-2 text-[1.5rem] leading-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>{t('homepage.howItWorksTitle')}</h2>
          <p className="mb-8 text-[12px] leading-relaxed text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>{t('homepage.howItWorksDesc')}</p>
        </FadeInSection>

        <div className="flex flex-col gap-4">
          {steps.map((step) => (
            <FadeInSection key={step.number}>
              <div className="flex gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
                <div className="h-[80px] w-[80px] shrink-0 overflow-hidden rounded-xl bg-neutral-50">
                  <img src={step.imageUrl} alt={step.title} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <div className="mb-1.5 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#c8b898]/20 bg-[#faf8f5]">
                      <step.icon size={13} className="text-[#a08c6a]" strokeWidth={1.5} />
                    </div>
                    <span className="text-[9px] font-semibold text-neutral-300" style={{ fontFamily: 'Inter, sans-serif' }}>{step.number}</span>
                  </div>
                  <h3 className="text-[14px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>{step.title}</h3>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>{step.text}</p>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES ════════════════════════════════════════════════════════ */}
      <section className="bg-white px-5 py-12">
        <FadeInSection>
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-[#a08c6a]" style={{ fontFamily: 'Inter, sans-serif' }}>{t('homepage.featuresLabel')}</p>
          <h2 className="mb-2 text-[1.5rem] leading-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>{t('homepage.featuresTitle')}</h2>
          <p className="mb-6 text-[12px] leading-relaxed text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>{t('homepage.featuresDesc')}</p>
        </FadeInSection>

        <FadeInSection>
          <div className="mb-6 overflow-hidden rounded-2xl border border-black/5 aspect-[4/3] bg-neutral-50">
            <img src="https://res.cloudinary.com/dgz3rhiv4/image/upload/v1781088228/section3_kxaym5.png" alt="Livaxis AI Features" className="h-full w-full object-cover" loading="lazy" />
          </div>
        </FadeInSection>

        <div className="grid grid-cols-2 gap-3">
          {features.map((feat, i) => {
            const Icon = feat.icon
            return (
              <FadeInSection key={i}>
                <div className="rounded-2xl border border-black/5 bg-[#fdfcfb] p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: feat.bgColor }}>
                    <Icon size={16} style={{ color: feat.color }} strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-1 text-[13px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                    {t(`homepage.${feat.titleKey}` as Parameters<typeof t>[0])}
                  </h3>
                  <p className="text-[10px] leading-relaxed text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                    {t(`homepage.${feat.descKey}` as Parameters<typeof t>[0])}
                  </p>
                </div>
              </FadeInSection>
            )
          })}
        </div>
      </section>

      {/* ═══ DISCOVERY — Horizontal carousel ════════════════════════════════ */}
      <section className="bg-[#faf9f7] py-12">
        <FadeInSection className="px-5">
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-[#a08c6a]" style={{ fontFamily: 'Inter, sans-serif' }}>{t('homepage.discoveryLabel')}</p>
          <h2 className="mb-2 text-[1.5rem] leading-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>{t('homepage.discoveryTitle')}</h2>
          <p className="mb-6 text-[12px] leading-relaxed text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>{t('homepage.discoveryDesc')}</p>
        </FadeInSection>

        <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide snap-x snap-mandatory">
          {discoveryProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="flex-shrink-0 w-[155px] snap-start cursor-pointer rounded-2xl border border-black/5 bg-white overflow-hidden shadow-sm active:scale-95 transition-transform"
            >
              <div className="aspect-[3/4] overflow-hidden bg-neutral-50 relative">
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute top-2 left-2 rounded-full bg-white/80 backdrop-blur-sm px-2 py-0.5 text-[8px] uppercase tracking-wider text-[#a08c6a] border border-[#c8b898]/20">
                  {product.category}
                </div>
              </div>
              <div className="p-3">
                <h4 className="text-[12px] font-medium text-black line-clamp-2 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{product.name}</h4>
                <p className="text-[11px] font-semibold text-[#8a7456]" style={{ fontFamily: 'Inter, sans-serif' }}>{product.price}</p>
              </div>
            </div>
          ))}
        </div>

        <FadeInSection className="mt-6 flex justify-center px-5">
          <button
            onClick={() => navigate('/discovery')}
            className="flex items-center gap-2 rounded-full border border-[#c8b898]/40 px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] text-[#8a7456]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            {t('homepage.exploreAll')}
            <ChevronRight size={13} />
          </button>
        </FadeInSection>
      </section>

      {/* ═══ PRICING ═════════════════════════════════════════════════════════ */}
      <section className="bg-white px-5 py-12">
        <FadeInSection>
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-[#a08c6a]" style={{ fontFamily: 'Inter, sans-serif' }}>{t('homepage.pricingLabel')}</p>
          <h2 className="mb-2 text-[1.5rem] leading-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>{t('homepage.pricingTitle')}</h2>
          <p className="mb-6 text-[12px] leading-relaxed text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>{t('homepage.pricingDesc')}</p>
        </FadeInSection>

        <div className="flex flex-col gap-3">
          {/* Standard — hero card */}
          {(() => {
            const plan = pricingPlans.find((p) => p.planId === 'standard') || pricingPlans[2]
            if (!plan) return null
            return (
              <FadeInSection key="standard">
                <div onClick={() => navigate('/subscription')} className="relative cursor-pointer overflow-hidden rounded-2xl p-6" style={{ background: 'linear-gradient(150deg, #1a1714 0%, #24201a 55%, #2c2419 100%)', boxShadow: '0 16px 48px rgba(20,17,14,0.24)' }}>
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,184,152,0.4), transparent)' }} />
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#c8b898]/70" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{plan.name}</p>
                    <div className="flex items-center gap-1.5 rounded-full border border-[#c8b898]/30 bg-[#c8b898]/10 px-2.5 py-1">
                      <Star size={8} className="fill-[#c8b898] text-[#c8b898]" />
                      <span className="text-[9px] uppercase tracking-[0.15em] text-[#c8b898]" style={{ fontWeight: 600 }}>{language === 'vi' ? 'Phổ biến' : 'Popular'}</span>
                    </div>
                  </div>
                  <p className="mb-1 text-[2.4rem] leading-none text-white" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>{plan.price}</p>
                  <p className="mb-5 text-[11px] text-white/40" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>{plan.desc}</p>
                  {plan.features && Array.isArray(plan.features) && (
                    <div className="mb-5 flex flex-col gap-2.5">
                      {plan.features.slice(0, 4).map((feat: string) => (
                        <div key={feat} className="flex items-center gap-2.5">
                          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#c8b898]/20 border border-[#c8b898]/30">
                            <Check size={8} strokeWidth={2.5} className="text-[#c8b898]" />
                          </div>
                          <span className="text-[12px] text-white/70" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); navigate('/subscription') }} className="w-full rounded-[12px] py-3 text-[11px] uppercase tracking-[0.16em] text-[#1a1714]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, background: 'linear-gradient(135deg, #d4bc94 0%, #c8b898 60%, #b8a47e 100%)' }}>
                    {language === 'vi' ? 'Chọn gói này' : 'Get started'}
                  </button>
                </div>
              </FadeInSection>
            )
          })()}

          {/* Free + Starter side by side */}
          <div className="grid grid-cols-2 gap-3">
            {['free', 'starter'].map((planId) => {
              const plan = pricingPlans.find((p) => p.planId === planId)
              if (!plan) return null
              return (
                <FadeInSection key={planId}>
                  <div onClick={() => navigate('/subscription')} className="cursor-pointer rounded-2xl border border-[#c8b898]/20 bg-[#fdfcfb] p-4">
                    <p className="mb-2 text-[9px] uppercase tracking-[0.14em] text-[#a08c6a]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{plan.name}</p>
                    <p className="mb-1 text-[1.5rem] leading-none text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>{plan.price}</p>
                    <p className="text-[10px] text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>{plan.turnsLabel}</p>
                  </div>
                </FadeInSection>
              )
            })}
          </div>

          {/* Premium */}
          {(() => {
            const plan = pricingPlans.find((p) => p.planId === 'premium') || pricingPlans[3]
            if (!plan) return null
            return (
              <FadeInSection key="premium">
                <div onClick={() => navigate('/subscription')} className="cursor-pointer rounded-2xl border border-[#c8b898]/25 p-5" style={{ background: 'linear-gradient(120deg, rgba(26,23,20,0.04) 0%, rgba(200,184,152,0.08) 50%, rgba(244,239,230,0.6) 100%)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #2c2419, #1a1714)' }}>
                      <Star size={15} className="fill-[#c8b898] text-[#c8b898]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#6b5a3e]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{plan.name}</p>
                      <p className="text-[1.4rem] leading-none text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>{plan.price}</p>
                    </div>
                  </div>
                  {plan.tags && Array.isArray(plan.tags) && (
                    <div className="flex flex-wrap gap-2">
                      {plan.tags.map((tag: string) => (
                        <span key={tag} className="rounded-full border border-[#c8b898]/30 bg-white/60 px-2.5 py-1 text-[9px] uppercase tracking-[0.1em] text-[#6b5a3e]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </FadeInSection>
            )
          })()}
        </div>

        <FadeInSection className="mt-5 flex justify-center">
          <button onClick={() => navigate('/subscription')} className="flex items-center gap-2 rounded-xl bg-[#1a1a1a] px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-white" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
            {t('homepage.pricingCta')}
            <ChevronRight size={13} className="opacity-60" />
          </button>
        </FadeInSection>
      </section>

      {/* ═══ STATS ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-5 py-14" style={{ background: 'linear-gradient(135deg, #1a1714 0%, #1c1815 100%)' }}>
        <div className="pointer-events-none absolute inset-0">
          <img src="https://res.cloudinary.com/dgz3rhiv4/image/upload/v1781088227/section_2_uurhnf.png" alt="" className="h-full w-full object-cover opacity-10 mix-blend-overlay" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1714]/60 via-[#1a1714]/20 to-[#1a1714]/80" />
        </div>

        <div className="relative z-10 text-center">
          <FadeInSection>
            <p className="mb-2 text-[10px] uppercase tracking-[0.26em] text-[#c8b898]/70" style={{ fontFamily: 'Inter, sans-serif' }}>{t('homepage.statsLabel')}</p>
            <h2 className="mb-10 text-[1.4rem] leading-tight text-white" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>{t('homepage.statsTitle')}</h2>
          </FadeInSection>

          <div className="grid grid-cols-2 gap-8">
            {stats.map((stat, i) => (
              <FadeInSection key={i}>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="mb-1 h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, #c8b898, transparent)' }} />
                  <span className="text-[2.2rem] leading-none text-white" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
                    {t(`homepage.${stat.valueKey}` as Parameters<typeof t>[0])}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-[#c8b898]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {t(`homepage.${stat.labelKey}` as Parameters<typeof t>[0])}
                  </span>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER CTA ══════════════════════════════════════════════════════ */}
      <section className="bg-[#faf9f7] px-5 py-10 text-center">
        <FadeInSection>
          <h2 className="mb-3 text-[1.4rem] leading-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
            {language === 'vi' ? 'Sẵn sàng thử ngay?' : 'Ready to visualize?'}
          </h2>
          <p className="mb-6 text-[12px] leading-relaxed text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
            {language === 'vi' ? 'Chụp ảnh phòng của bạn và khám phá nội thất phù hợp.' : 'Snap your room and discover furniture that fits perfectly.'}
          </p>
          <button
            onClick={() => navigate('/ai-room-planner')}
            className="inline-flex items-center gap-2 rounded-full bg-[#161311] px-7 py-3.5 text-[10px] uppercase tracking-[0.24em] text-white shadow-[0_12px_30px_rgba(20,17,14,0.2)]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            <Sparkles size={14} />
            {t('homepage.aiRoomPlanner')}
          </button>
        </FadeInSection>
      </section>
    </div>
  )
}
