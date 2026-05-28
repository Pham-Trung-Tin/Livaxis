import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sparkles,
  Check,
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

// ─── Fallback image ───────────────────────────────────────────────────────────
function ImageWithFallback({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#f7f5f2] text-center text-sm text-[#8f7b5f]">
        Image unavailable
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
                  <span className="text-[10px] uppercase tracking-widest text-[#8a7456]">AI Room Try-On</span>
                </div>
                <h3 className="mb-1 text-2xl font-semibold text-black" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Try {productName || 'this product'} in your room
                </h3>
                <p className="mb-7 text-sm text-neutral-500 leading-relaxed">
                  Upload a photo of your room and our Gemini AI will place this product in your space — so you can see exactly how it looks before buying.
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
                    <p className="text-sm font-medium text-neutral-700">Upload a room photo</p>
                    <p className="mt-0.5 text-xs text-neutral-400">JPG, PNG · Max 10MB</p>
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
                  <p className="font-medium text-neutral-800">Analyzing your room…</p>
                  <p className="text-xs text-neutral-400">Gemini AI is placing the product in your space</p>
                  <div className="mt-2 flex gap-1.5">
                    {['Detecting space', 'Matching scale', 'Rendering fit'].map((label, i) => (
                      <motion.span
                        key={label}
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
                      <span className="text-[11px] font-medium text-neutral-700">AI Fit Complete</span>
                    </div>
                  </div>
                )}

                <div className="mb-5 flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                  <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Looks great in your room!</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      The product fits naturally in your space. Ready to purchase?
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
                    <span className="text-[13px] font-semibold uppercase tracking-wide">Buy on Shopee</span>
                    <ExternalLink size={13} className="opacity-70" />
                  </motion.button>

                  {/* Secondary: retry */}
                  <button
                    onClick={() => { setStep('idle'); setPreviewUrl(null) }}
                    className="w-full rounded-xl border border-neutral-200 py-3 text-[12px] text-neutral-500 hover:bg-neutral-50 transition-colors"
                  >
                    Try with another photo
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
  const [product, setProduct] = useState<ProductDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeImage, setActiveImage] = useState(0)
  const [showSpecs, setShowSpecs] = useState(false)
  const [showTryOn, setShowTryOn] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  useEffect(() => {
    if (!id) return
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id)
    if (!isObjectId) {
      setLoading(false)
      setError('Invalid product id format. Please open a product from the catalog.')
      return
    }
    setLoading(true)
    setError(null)
    void getProductById(id)
      .then((p) => setProduct(p))
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-center">Loading product...</div>
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>
  if (!product) return <div className="p-8 text-center">Product not found</div>

  // Gallery: imageUrl chính + images[] thumbnails, loại trùng
  const rawImages = Array.isArray(product.images) && product.images.length > 0 ? product.images : []
  const galleryImages = [product.imageUrl, ...rawImages.filter((img) => img !== product.imageUrl)]
  const galleryLabels = galleryImages.map((_, i) => (i === 0 ? 'Main' : `View ${i}`))

  const colorOptions = product.color ? [{ name: product.color, hex: product.colorHex ?? '#C4A08A' }] : []
  const fabricOptions = product.material ? [product.material] : []

  const specs = [
    { label: 'Dimensions', value: product.dimensions ?? '—' },
    { label: 'Material', value: product.material ?? '—' },
    { label: 'Color', value: product.color ?? '—' },
    { label: 'Style', value: product.style ?? '—' },
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
            <button onClick={() => navigate('/')} className="hover:text-black transition-colors">Home</button>
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
              <span className="text-[12px] text-neutral-400">4.8 (127 reviews)</span>
            </div>

            {/* Reference price — affiliate style */}
            {product.price && (
              <div className="flex items-center gap-2 mb-6">
                <span className="text-[13px] text-neutral-400">Khoảng</span>
                <span className="text-[15px] font-medium text-neutral-600" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
                <span className="text-[11px] text-neutral-300">· giá tham khảo trên Shopee</span>
              </div>
            )}

            <p className="text-neutral-500 text-[14px] leading-[1.8] mb-8 max-w-lg">{product.description}</p>

            <div className="h-px bg-neutral-100 mb-8" />

            {/* Color (info only) */}
            {colorOptions.length > 0 && (
              <div className="mb-7">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase text-neutral-800">Color</span>
                  <span className="text-[12px] text-neutral-400">{colorOptions[0].name}</span>
                </div>
                <div className="flex gap-3">
                  {colorOptions.map((color) => (
                    <div
                      key={color.name}
                      className="relative w-10 h-10 rounded-full ring-2 ring-offset-3 ring-[#a08c6a]"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      <Check size={14} className="absolute inset-0 m-auto text-white" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Material (info only) */}
            {fabricOptions.length > 0 && (
              <div className="mb-8">
                <span className="text-[11px] uppercase text-neutral-800 block mb-3">Material</span>
                <div className="flex gap-3">
                  {fabricOptions.map((fabric) => (
                    <span key={fabric} className="px-5 py-2.5 rounded-lg text-[12px] bg-black text-white">{fabric}</span>
                  ))}
                </div>
              </div>
            )}

            {/* ── CTAs ── */}
            <div className="space-y-3 mb-8">
              {/* Primary: AI Try-On */}
              <motion.button
                onClick={() => setShowTryOn(true)}
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
                    Try in Your Room (AI)
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
                  <span className="text-[13px] font-semibold uppercase tracking-wide">Shop on Shopee</span>
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
                <span className="text-[11px] block text-neutral-700">Gemini AI Verified Fit</span>
                <span className="text-[10px] text-neutral-400">See exactly how it looks in your room before buying</span>
              </div>
            </div>

            {/* Affiliate disclaimer */}
            <div className="flex items-center gap-2 mb-8 py-4 border-y border-neutral-100">
              <Shield size={13} className="text-neutral-300 flex-shrink-0" />
              <span className="text-[11px] text-neutral-400 leading-relaxed">
                Clicking "Shop on Shopee" will take you to the product page on Shopee. Livaxis may earn a commission at no extra cost to you.
              </span>
            </div>

            {/* Specs accordion */}
            <button
              onClick={() => setShowSpecs(!showSpecs)}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <span className="text-[11px] uppercase text-neutral-800">Specifications</span>
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
              <span className="text-[10px] uppercase text-[#8a7456]">AI Room Try-On</span>
            </div>
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] leading-[1.15] text-black mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              See it in your room<br />before you buy
            </h2>
            <p className="text-neutral-400 text-[15px] leading-[1.8] mb-10 max-w-lg mx-auto">
              Upload a photo of your room and our Gemini AI will seamlessly place the product in your space — then head straight to Shopee to purchase.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setShowTryOn(true)}
                className="inline-flex items-center gap-3 px-10 py-4 bg-black text-white rounded-full hover:bg-neutral-800 transition-colors"
              >
                <Camera size={16} />
                <span className="text-[13px] uppercase">Try It Free</span>
              </button>
              {product.affiliateUrl && (
                <button
                  onClick={handleBuyOnShopee}
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#EE4D2D] text-white rounded-full hover:bg-[#d94429] transition-colors"
                >
                  <ShoppingCart size={15} />
                  <span className="text-[13px] uppercase">Shop on Shopee</span>
                  <ExternalLink size={12} className="opacity-70" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <AITryOnOverlay
        isOpen={showTryOn}
        onClose={() => setShowTryOn(false)}
        productName={product.name}
        affiliateUrl={product.affiliateUrl}
      />
    </div>
  )
}
