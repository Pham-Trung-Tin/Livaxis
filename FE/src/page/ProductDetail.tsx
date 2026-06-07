import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  Camera,
  Star,
  ExternalLink,
  Upload,
  CheckCircle2,
  X,
  Loader2,
  ShoppingCart,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from './Hompage'
import { Footer } from './Hompage'
import { getProductById, type ProductDetail as ProductDetailType } from '../services/productApi'
import { useLanguage } from '../contexts/LanguageContext'

// ─── Fallback image ───────────────────────────────────────────────────────────
function ImageWithFallback({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const { t } = useLanguage()

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#f7f5f2] text-center text-sm text-[#8f7b5f]">
        {t('common.imageUnavailable')}
      </div>
    )
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" />
}

// ─── AI Try-On Overlay (3 steps: idle → processing → success) ─────────────────
type TryOnStep = 'idle' | 'processing' | 'success'

function AITryOnOverlay({
  isOpen,
  onClose,
  productName,
  affiliateUrl,
}: {
  isOpen: boolean
  onClose: () => void
  productName?: string
  affiliateUrl?: string
}) {
  const [step, setStep] = useState<TryOnStep>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage()

  // reset khi đóng
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('idle')
        setPreviewUrl(null)
      }, 300)
    }
  }, [isOpen])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setStep('processing')

    // Simulate AI processing (2.5s)
    setTimeout(() => setStep('success'), 2500)
  }

  const handleBuyOnShopee = () => {
    if (affiliateUrl) window.open(affiliateUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            onClick={step !== 'processing' ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed left-1/2 top-1/2 z-[80] w-[min(94vw,540px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-[#c8b898]/30 bg-white shadow-2xl"
          >
            {/* Close button */}
            {step !== 'processing' && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
              >
                <X size={15} />
              </button>
            )}

            {/* ── Step: IDLE ── */}
            {step === 'idle' && (
              <div className="p-8">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c8b898]/15">
                    <Camera size={15} className="text-[#8a7456]" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-[#8a7456]">{t('common.aiTryOn')}</span>
                </div>
                <h3 className="mb-1 text-2xl font-semibold text-black" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {t('productDetail.tryInRoom').replace('sản phẩm này', productName || t('discovery.selectedItem')).replace('this product', productName || t('discovery.selectedItem'))}
                </h3>
                <p className="mb-7 text-sm text-neutral-500 leading-relaxed">
                  {t('productDetail.tryInRoomDesc')}
                </p>

                {/* Drop zone */}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="group relative flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#c8b898]/50 bg-[#faf9f7] py-10 transition-all hover:border-[#a08c6a] hover:bg-[#f5f1eb]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c8b898]/20 group-hover:bg-[#c8b898]/30 transition-colors">
                    <Upload size={20} className="text-[#8a7456]" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-neutral-700">{t('productDetail.uploadPhotoLabel')}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">{t('productDetail.uploadPhotoDesc')}</p>
                  </div>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
            )}

            {/* ── Step: PROCESSING ── */}
            {step === 'processing' && (
              <div className="p-8">
                {previewUrl && (
                  <div className="relative mb-6 overflow-hidden rounded-2xl aspect-video bg-[#f7f6f3]">
                    <img src={previewUrl} alt="Your room" className="w-full h-full object-cover" />
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
                    <motion.div
                      className="absolute inset-x-0 h-0.5 bg-[#c8b898]/80"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                )}
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <Loader2 size={28} className="animate-spin text-[#a08c6a]" />
                  <p className="font-medium text-neutral-800">{t('productDetail.analyzingRoom')}</p>
                  <p className="text-xs text-neutral-400">{t('productDetail.analyzingSub')}</p>
                  <div className="mt-2 flex gap-1.5">
                    {[t('productDetail.detectingSpace'), t('productDetail.matchingScale'), t('productDetail.renderingFit')].map((label, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.6 }}
                        className="rounded-full bg-[#c8b898]/15 px-2.5 py-1 text-[10px] text-[#8a7456]"
                      >
                        {label}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step: SUCCESS ── */}
            {step === 'success' && (
              <div className="p-8">
                {previewUrl && (
                  <div className="relative mb-6 overflow-hidden rounded-2xl aspect-video bg-[#f7f6f3]">
                    <img src={previewUrl} alt="Room result" className="w-full h-full object-cover" />
                    {/* Success badge */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-sm">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      <span className="text-[11px] font-medium text-neutral-700">{t('productDetail.fitComplete')}</span>
                    </div>
                  </div>
                )}

                <div className="mb-5 flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                  <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{t('productDetail.looksGreat')}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {t('productDetail.readyToPurchase')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  {/* Primary CTA → Shopee */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuyOnShopee}
                    className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#EE4D2D] py-4 text-white shadow-md shadow-[#EE4D2D]/20"
                  >
                    <ShoppingCart size={17} />
                    <span className="text-[13px] font-semibold uppercase tracking-wide">{t('productDetail.buyOnShopee')}</span>
                    <ExternalLink size={13} className="opacity-70" />
                  </motion.button>

                  {/* Secondary: retry */}
                  <button
                    onClick={() => { setStep('idle'); setPreviewUrl(null) }}
                    className="w-full rounded-xl border border-neutral-200 py-3 text-[12px] text-neutral-500 hover:bg-neutral-50 transition-colors"
                  >
                    {t('productDetail.tryAnotherPhoto')}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [product, setProduct] = useState<ProductDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeImage, setActiveImage] = useState(0)
  const [showSpecs, setShowSpecs] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  useEffect(() => {
    if (!id) return
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id)
    if (!isObjectId) {
      setLoading(false)
      setError(t('productDetail.invalidIdFormat'))
      return
    }
    setLoading(true)
    setError(null)
    void getProductById(id)
      .then((p) => setProduct(p))
      .catch((err) => setError(err.message || t('productDetail.loadFailed')))
      .finally(() => setLoading(false))
  }, [id, t])

  if (loading) return <div className="p-8 text-center">{t('common.loading')}</div>
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>
  if (!product) return <div className="p-8 text-center">{t('productDetail.productNotFound')}</div>

  // Gallery: imageUrl chính + images[] thumbnails, loại trùng
  const rawImages = Array.isArray(product.images) && product.images.length > 0 ? product.images : []
  const galleryImages = [product.imageUrl, ...rawImages.filter((img) => img !== product.imageUrl)]
  const galleryLabels = galleryImages.map((_, i) => (i === 0 ? t('productDetail.galleryLabels.main') : t('productDetail.galleryLabels.view').replace('{num}', String(i))))

  const colorOptions = product.color ? [{ name: product.color, hex: product.colorHex ?? '#C4A08A' }] : []
  const fabricOptions = product.material ? [product.material] : []

  const specs = [
    { label: t('productDetail.specs.dimensions'), value: product.dimensions ?? '—' },
    { label: t('productDetail.specs.material'), value: product.material ?? '—' },
    { label: t('productDetail.specs.color'), value: product.color ?? '—' },
    { label: t('productDetail.specs.style'), value: product.style ?? '—' },
  ]

  const nextImage = () => setActiveImage((prev) => (prev + 1) % galleryImages.length)
  const prevImage = () => setActiveImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)

  const handleBuyOnShopee = () => {
    if (product.affiliateUrl) window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />

      {/* Breadcrumb */}
      <div className="pt-[72px]">
        <div className="max-w-[1440px] mx-auto px-8 md:px-16 py-5">
          <nav className="flex items-center gap-2 text-[12px] text-neutral-400">
            <button onClick={() => navigate('/')} className="hover:text-black transition-colors">{t('common.home')}</button>
            <span>/</span>
            <span className="hover:text-black transition-colors cursor-pointer">{product.category}</span>
            <span>/</span>
            <span className="text-neutral-800">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product section */}
      <section className="max-w-[1440px] mx-auto px-8 md:px-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* ── Left: Gallery ── */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-[#f7f6f3] aspect-[4/4.2]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0"
                >
                  <ImageWithFallback src={galleryImages[activeImage]} alt={product.name} className="w-full h-full object-cover" />
                </motion.div>
              </AnimatePresence>

              {galleryImages.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-sm">
                    <ChevronLeft size={18} className="text-neutral-700" />
                  </button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-sm">
                    <ChevronRight size={18} className="text-neutral-700" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full">
                <span className="text-[11px] tracking-[0.1em] text-neutral-500">{activeImage + 1} / {galleryImages.length}</span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    title={galleryLabels[idx]}
                    className={`relative flex-shrink-0 overflow-hidden rounded-xl transition-all duration-300 ${
                      activeImage === idx
                        ? 'ring-2 ring-[#a08c6a] ring-offset-2 opacity-100'
                        : 'opacity-50 hover:opacity-80'
                    }`}
                    style={{ width: 76, height: 76 }}
                  >
                    <ImageWithFallback src={img} alt={galleryLabels[idx]} className="w-full h-full object-cover" />
                    {activeImage === idx && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#a08c6a]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info + CTAs ── */}
          <div className="lg:pt-4">
            {/* Badge */}
            <div className="flex items-center gap-3 mb-5">
            </div>

            {/* Name */}
            <h1 className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.15] text-black mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              {product.name}
            </h1>
            <p className="text-[13px] text-neutral-400 mb-5">{product.subtitle}</p>

            {/* Stars */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className={s <= 4 ? 'fill-[#c8b898] text-[#c8b898]' : 'fill-neutral-200 text-neutral-200'} />
                ))}
              </div>
              <span className="text-[12px] text-neutral-400">4.8 {t('productDetail.reviews').replace('{count}', '127')}</span>
            </div>

            {/* Reference price — affiliate style */}
            {product.price && (
              <div className="flex items-center gap-2 mb-6">
                <span className="text-[13px] text-neutral-400">{t('productDetail.approx')}</span>
                <span className="text-[15px] font-medium text-neutral-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
                <span className="text-[11px] text-neutral-300">· {t('productDetail.refPriceShopee')}</span>
              </div>
            )}

            <p className="text-neutral-500 text-[14px] leading-[1.8] mb-8 max-w-lg">{product.description}</p>

            <div className="h-px bg-neutral-100 mb-8" />

            {/* Color — info only */}
            {colorOptions.length > 0 && (
              <div className="mb-6">
                <span className="text-[11px] uppercase tracking-[0.1em] text-neutral-400 block mb-2">{t('productDetail.specs.color')}</span>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-4 h-4 rounded-full border border-black/10 flex-shrink-0"
                    style={{ backgroundColor: colorOptions[0].hex }}
                  />
                  <span className="text-[13px] text-neutral-600">{colorOptions[0].name}</span>
                </div>
              </div>
            )}

            {/* Material — info only */}
            {fabricOptions.length > 0 && (
              <div className="mb-8">
                <span className="text-[11px] uppercase tracking-[0.1em] text-neutral-400 block mb-2">{t('productDetail.specs.material')}</span>
                <div className="flex flex-wrap gap-2">
                  {fabricOptions.map((fabric) => (
                    <span
                      key={fabric}
                      className="px-3 py-1 rounded-full text-[12px] text-neutral-500 bg-neutral-100 border border-neutral-200"
                    >
                      {fabric}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── CTAs ── */}
            <div className="space-y-3 mb-8">
              {/* Primary: AI Try-On */}
              <motion.button
                onClick={() => navigate('/ai-room-planner')}
                className="relative w-full flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-[#c8b898]/40 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(200,184,152,0.06) 0%, rgba(200,184,152,0.14) 100%)' }}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c8b898]/15 to-transparent"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="relative flex items-center gap-2.5">
                  <Camera size={18} className="text-[#8a7456]" />
                  <span className="text-[13px] tracking-[0.12em] uppercase text-[#6b5d45] font-medium">
                    {t('productDetail.tryInRoomBtn')}
                  </span>
                </div>
              </motion.button>

              {/* Secondary: Buy on Shopee */}
              {product.affiliateUrl && (
                <motion.button
                  onClick={handleBuyOnShopee}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#EE4D2D] py-4 text-white shadow-lg shadow-[#EE4D2D]/20"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingCart size={17} />
                  <span className="text-[13px] font-semibold uppercase tracking-wide">{t('productDetail.buyOnShopee')}</span>
                  <ExternalLink size={13} className="opacity-70" />
                </motion.button>
              )}
            </div>

            {/* Trust badge: AI only */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#faf9f7] border border-[#c8b898]/10 mb-8">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-[#c8b898]/15">
                <Sparkles size={16} className="text-[#a08c6a]" />
              </div>
              <div>
                <span className="text-[11px] block text-neutral-700">{t('productDetail.aiVerifiedTitle')}</span>
                <span className="text-[10px] text-neutral-400">{t('productDetail.aiVerifiedDesc')}</span>
              </div>
            </div>

            {/* Affiliate disclaimer */}
            <div className="flex items-center gap-2 mb-8 py-4 border-y border-neutral-100">
              <Shield size={13} className="text-neutral-300 flex-shrink-0" />
              <span className="text-[11px] text-neutral-400 leading-relaxed">
                {t('productDetail.shopeeDisclosure')}
              </span>
            </div>

            {/* Specs accordion */}
            <button
              onClick={() => setShowSpecs(!showSpecs)}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <span className="text-[11px] uppercase text-neutral-800">{t('productDetail.specifications')}</span>
              <motion.div
                animate={{ rotate: showSpecs ? 45 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-neutral-400 text-lg leading-none"
              >
                +
              </motion.div>
            </button>

            <AnimatePresence>
              {showSpecs && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 pb-6">
                    {specs.map((spec) => (
                      <div key={spec.label} className="flex justify-between py-2 border-b border-neutral-50">
                        <span className="text-[12px] text-neutral-400">{spec.label}</span>
                        <span className="text-[12px] text-neutral-700">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Bottom AI section */}
      <section className="bg-[#faf9f7] py-20 md:py-28">
        <div className="max-w-[1440px] mx-auto px-8 md:px-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8 inline-flex items-center gap-2 px-5 py-2 rounded-full border bg-white">
              <Sparkles size={13} className="text-[#a08c6a]" />
              <span className="text-[10px] uppercase text-[#8a7456]">{t('common.aiTryOn')}</span>
            </div>
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] leading-[1.15] text-black mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t('productDetail.seeItInYourSpaceTitle').split(' trước khi mua')[0]}<br />{t('productDetail.seeItInYourSpaceTitle').includes('trước khi mua') ? 'trước khi mua' : ''}
            </h2>
            <p className="text-neutral-400 text-[15px] leading-[1.8] mb-10 max-w-lg mx-auto">
              {t('productDetail.seeItInYourSpaceDesc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/ai-room-planner')}
                className="inline-flex items-center gap-3 px-10 py-4 bg-black text-white rounded-full hover:bg-neutral-800 transition-colors"
              >
                <Camera size={16} />
                <span className="text-[13px] uppercase">{t('productDetail.tryItFree')}</span>
              </button>
              {product.affiliateUrl && (
                <button
                  onClick={handleBuyOnShopee}
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#EE4D2D] text-white rounded-full hover:bg-[#d94429] transition-colors"
                >
                  <ShoppingCart size={15} />
                  <span className="text-[13px] uppercase">{t('productDetail.buyOnShopee')}</span>
                  <ExternalLink size={12} className="opacity-70" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
