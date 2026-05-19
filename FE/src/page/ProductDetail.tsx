import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sparkles,
  ShoppingBag,
  Heart,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Shield,
  Headphones,
  Truck,
  RotateCcw,
  Camera,
  Star,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Header } from './Hompage'
import { Footer } from './Hompage'
import { getProductById, type ProductDetail as ProductDetailType } from '../services/productApi'

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

function AITryOnOverlay({ isOpen, onClose, productName }: { isOpen: boolean; onClose: () => void; productName?: string }) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="fixed left-1/2 top-1/2 z-[80] w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-[#c8b898]/40 bg-white"
          >
            <div className="p-6">
              <h3 className="text-2xl font-medium">{productName || 'Try-On'}</h3>
              <p className="mt-3 text-sm text-neutral-600">Upload a photo of your room to try this product in your space.</p>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={onClose} className="rounded-md px-4 py-2 border">Close</button>
                <button onClick={onClose} className="rounded-md px-4 py-2 bg-black text-white">Upload</button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<ProductDetailType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [showSpecs, setShowSpecs] = useState(false)
  const [aiGlowing, setAiGlowing] = useState(false)
  const [showTryOn, setShowTryOn] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  useEffect(() => {
    if (!id) return

    // validate Mongo ObjectId format before calling backend
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

  const galleryImages = [product.imageUrl]
  const galleryLabels = galleryImages.map((_, i) => `Image ${i + 1}`)

  const colorOptions = product.color ? [{ name: product.color, hex: product.colorHex ?? '#C4A08A' }] : []
  const fabricOptions = product.material ? [product.material] : []

  const specs = [
    { label: 'Dimensions', value: product.dimensions ?? '—' },
    { label: 'Material', value: product.material ?? '—' },
    { label: 'Color', value: product.color ?? '—' },
    { label: 'Stock', value: product.stock?.toString() ?? '—' },
  ]

  const nextImage = () => setActiveImage((prev) => (prev + 1) % galleryImages.length)
  const prevImage = () => setActiveImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />

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

      <section className="max-w-[1440px] mx-auto px-8 md:px-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl bg-[#f7f6f3] aspect-[4/4.2]">
              <AnimatePresence mode="wait">
                <motion.div key={activeImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0">
                  <ImageWithFallback src={galleryImages[activeImage]} alt={product.name} className="w-full h-full object-cover" />
                </motion.div>
              </AnimatePresence>

              <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-sm">
                <ChevronLeft size={18} className="text-neutral-700" />
              </button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-sm">
                <ChevronRight size={18} className="text-neutral-700" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full">
                <span className="text-[11px] tracking-[0.1em] text-neutral-500">{activeImage + 1} / {galleryImages.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(idx)} className={`relative overflow-hidden rounded-xl aspect-square transition-all duration-300 ${activeImage === idx ? 'ring-2 ring-[#a08c6a] ring-offset-2' : 'opacity-60 hover:opacity-100'}`}>
                  <ImageWithFallback src={img} alt={galleryLabels[idx]} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:pt-4">
            <div className="flex items-center gap-3 mb-5">
              {product.isNew ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-[#c8b898]/5 text-[10px] text-[#8a7456]"> <Sparkles size={11} /> New Arrival</span>
              ) : null}
            </div>

            <h1 className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.15] text-black mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{product.name}</h1>
            <p className="text-[13px] text-neutral-400 mb-5">{product.subtitle}</p>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-0.5">{[1,2,3,4,5].map((s)=> <Star key={s} size={14} className={s<=4? 'fill-[#c8b898] text-[#c8b898]':'fill-neutral-200 text-neutral-200'} />)}</div>
              <span className="text-[12px] text-neutral-400">4.8 (127 reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-[28px] text-black" style={{ fontFamily: "'Playfair Display', serif" }}>${product.price.toLocaleString()}</span>
            </div>

            <p className="text-neutral-500 text-[14px] leading-[1.8] mb-8 max-w-lg">{product.description}</p>

            <div className="h-px bg-neutral-100 mb-8" />

            <div className="mb-7">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase text-neutral-800">Color</span>
                <span className="text-[12px] text-neutral-400">{colorOptions[0]?.name ?? '—'}</span>
              </div>
              <div className="flex gap-3">
                {colorOptions.map((color, idx) => (
                  <button key={color.name} onClick={() => {}} className={`relative w-10 h-10 rounded-full ${idx === 0 ? 'ring-2 ring-offset-3 ring-[#a08c6a]' : 'hover:scale-110'}`} style={{ backgroundColor: color.hex }} title={color.name}>
                    <Check size={14} className="absolute inset-0 m-auto text-white" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <span className="text-[11px] uppercase text-neutral-800 block mb-3">Fabric</span>
              <div className="flex gap-3">
                {fabricOptions.map((fabric, idx) => (
                  <button key={fabric} className={`px-5 py-2.5 rounded-lg text-[12px] ${idx===0? 'bg-black text-white' : 'bg-neutral-50'}`}>{fabric}</button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <span className="text-[11px] uppercase text-neutral-800 block mb-3">Quantity</span>
              <div className="inline-flex items-center border border-neutral-200 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 flex items-center justify-center text-neutral-400"><Minus size={14} /></button>
                <span className="w-12 text-center text-[14px] text-black">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-11 h-11 flex items-center justify-center text-neutral-400"><Plus size={14} /></button>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-3 py-4 bg-black text-white rounded-xl"> <ShoppingBag size={17} /> <span className="text-[13px] uppercase">Add to Cart</span></button>
                <button onClick={() => setIsWishlisted(!isWishlisted)} className={`w-[52px] flex items-center justify-center rounded-xl border ${isWishlisted? 'bg-red-50 border-red-200 text-red-500':'border-neutral-200 text-neutral-400'}`}><Heart size={18} /></button>
                <button className="w-[52px] flex items-center justify-center rounded-xl border border-neutral-200 text-neutral-400"><Share2 size={17} /></button>
              </div>

              <motion.button onMouseEnter={() => setAiGlowing(true)} onMouseLeave={() => setAiGlowing(false)} onClick={() => setShowTryOn(true)} className="relative w-full flex items-center justify-center gap-3 py-5 rounded-xl border-2" style={{ background: 'linear-gradient(135deg, rgba(200,184,152,0.06) 0%, rgba(200,184,152,0.12) 100%)' }} whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}>
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c8b898]/10 to-transparent" animate={{ x: ['-200%', '200%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
                <div className="relative flex items-center gap-3"><Camera size={18} className="text-[#8a7456]" /><span className="text-[13px] tracking-[0.15em] uppercase text-[#6b5d45]">Try-On in Your Room (AI)</span></div>
              </motion.button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#faf9f7] border border-[#c8b898]/10">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-[#c8b898]/15"><Sparkles size={16} className="text-[#a08c6a]" /></div>
                <div><span className="text-[11px] block">Gemini AI Verified Fit</span><span className="text-[10px] text-neutral-400">Precision room matching</span></div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#faf9f7] border border-[#c8b898]/10">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-[#c8b898]/15"><Headphones size={16} className="text-[#a08c6a]" /></div>
                <div><span className="text-[11px] block">Design Support</span><span className="text-[10px] text-neutral-400">Professional consultation</span></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mb-8 py-5 border-y border-neutral-100">
              {[{ icon: Truck, label: 'Free White-Glove Delivery' }, { icon: RotateCcw, label: '30-Day Returns' }, { icon: Shield, label: '10-Year Warranty' }].map((item) => (
                <div key={item.label} className="flex items-center gap-2"><item.icon size={14} className="text-neutral-300" /> <span className="text-[11px] text-neutral-400">{item.label}</span></div>
              ))}
            </div>

            <button onClick={() => setShowSpecs(!showSpecs)} className="w-full flex items-center justify-between py-4 text-left group">
              <span className="text-[11px] uppercase text-neutral-800">Specifications</span>
              <div className="text-neutral-400">+</div>
            </button>

            <AnimatePresence>{showSpecs && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden"><div className="grid grid-cols-2 gap-x-8 gap-y-3 pb-6">{specs.map((spec) => (<div key={spec.label} className="flex justify-between py-2 border-b border-neutral-50"><span className="text-[12px] text-neutral-400">{spec.label}</span><span className="text-[12px] text-neutral-700">{spec.value}</span></div>))}</div></motion.div>)}</AnimatePresence>
          </div>
        </div>
      </section>

      <section className="bg-[#faf9f7] py-20 md:py-28">
        <div className="max-w-[1440px] mx-auto px-8 md:px-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8 inline-flex items-center gap-2 px-5 py-2 rounded-full border bg-white"><Sparkles size={13} className="text-[#a08c6a]" /><span className="text-[10px] uppercase text-[#8a7456]">AI Room Try-On</span></div>
            <h2 className="text-[clamp(1.5rem,3.5vw,2.5rem)] leading-[1.15] text-black mb-5">Not Sure About the Fit?</h2>
            <p className="text-neutral-400 text-[15px] leading-[1.8] mb-10 max-w-lg mx-auto">Upload a photo of your room and our Gemini AI will seamlessly integrate the product into your space.</p>
            <button onClick={() => setShowTryOn(true)} className="inline-flex items-center gap-3 px-10 py-4 bg-black text-white rounded-full"> <Camera size={16} /> <span className="text-[13px] uppercase">Try It Now — It's Free</span></button>
          </div>
        </div>
      </section>

      <Footer />
      <AITryOnOverlay isOpen={showTryOn} onClose={() => setShowTryOn(false)} productName={product.name} />
    </div>
  )
}
