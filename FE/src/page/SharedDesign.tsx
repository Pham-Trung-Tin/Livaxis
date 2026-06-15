import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, ArrowRight, ShoppingBag, Calendar, AlertCircle } from 'lucide-react'
import { getPublicDesign, type UserDesign } from '../services/designApi'
import { Header, Footer } from './Hompage'
import { useLanguage } from '../contexts/LanguageContext'

export default function SharedDesignPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { language, t } = useLanguage()

  const [design, setDesign] = useState<UserDesign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sliderPos, setSliderPos] = useState(50)
  const [productsList, setProductsList] = useState<any[]>([])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)

    getPublicDesign(id)
      .then((data) => {
        setDesign(data)
        // Fetch products to resolve catalog details (names, Shopee URLs, images)
        return fetch('/api/products?limit=100')
      })
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data?.items) {
          setProductsList(res.data.items)
        }
      })
      .catch((err) => {
        console.error(err)
        setError(language === 'vi' ? 'Không tìm thấy thiết kế này hoặc thiết kế không tồn tại.' : 'Design not found or does not exist.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id, language])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5f0] text-neutral-500">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c8b898] border-t-transparent" />
          <p className="text-[13px] tracking-wide uppercase">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !design) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f5f0] px-6 text-center">
        <AlertCircle size={40} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-neutral-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          {language === 'vi' ? 'Có lỗi xảy ra' : 'Error Occurred'}
        </h2>
        <p className="text-sm text-neutral-500 max-w-sm mb-6">{error || 'Unknown error'}</p>
        <button
          onClick={() => navigate('/')}
          className="rounded-full bg-black px-6 py-2.5 text-[11px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-neutral-800"
        >
          {language === 'vi' ? 'Về trang chủ' : 'Back to Home'}
        </button>
      </div>
    )
  }

  const formattedDate = new Date(design.createdAt).toLocaleDateString(
    undefined,
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  return (
    <div className="min-h-screen bg-[#f8f5f0]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#c8b898]/15 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-[#8a7456]">
              <Sparkles size={10} />
              {language === 'vi' ? 'Ý tưởng thiết kế AI' : 'AI Room Design Idea'}
            </div>
            <h1 className="text-3xl tracking-tight text-black md:text-4xl" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
              {design.name}
            </h1>
            <p className="mt-2 text-[12px] text-neutral-400 flex items-center gap-1.5">
              <Calendar size={13} />
              {language === 'vi' ? 'Thiết kế ngày' : 'Designed on'} {formattedDate}
            </p>
          </div>

          <button
            onClick={() => navigate('/ai-room-planner')}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-[11px] uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-neutral-800 hover:shadow-lg"
          >
            <Sparkles size={13} className="text-[#c8b898]" />
            <span>{language === 'vi' ? 'Thiết kế phòng của bạn' : 'Design Your Room'}</span>
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl flex flex-col lg:flex-row min-h-[560px]">
          {/* Left Side: Before/After Interactive Slider */}
          <div className="relative flex-1 bg-neutral-100 min-h-[350px] lg:min-h-[560px] overflow-hidden select-none">
            {/* After Image */}
            <img
              src={design.afterImageUrl}
              alt="After Generation"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Before Image (clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <img
                src={design.beforeImageUrl}
                alt="Before Generation"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            {/* Vertical Split Line */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-white shadow-lg pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-black border border-neutral-300 flex items-center justify-center shadow-md">
                ↔
              </div>
            </div>

            {/* Range Input covering canvas */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-1.5 pointer-events-none">
              <span className="rounded bg-black/60 px-2.5 py-1 text-[9px] font-bold text-white uppercase tracking-wider">Before</span>
            </div>
            <div className="absolute top-4 right-4 flex gap-1.5 pointer-events-none">
              <span className="rounded bg-black/60 px-2.5 py-1 text-[9px] font-bold text-white uppercase tracking-wider">After</span>
            </div>
          </div>

          {/* Right Side: Design Details & Products List */}
          <div className="w-full lg:w-[380px] bg-white border-t lg:border-t-0 lg:border-l border-neutral-100 p-8 flex flex-col justify-between h-auto lg:h-[560px]">
            <div className="flex-1 overflow-y-auto pr-1">
              {design.prompt && (
                <div className="mb-6 rounded-2xl bg-neutral-50 p-4 border border-neutral-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">AI Prompt</span>
                  <p className="text-[12px] text-neutral-600 leading-relaxed italic">
                    "{design.prompt}"
                  </p>
                </div>
              )}

              <div className="flex-1 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                  {language === 'vi' ? 'Sản phẩm nổi bật trong phòng' : 'Featured Products in Room'}
                </span>

                <div className="space-y-3">
                  {design.products.length === 0 ? (
                    <p className="text-[12px] text-neutral-400 italic">
                      {language === 'vi' ? 'Không có sản phẩm nào được đánh dấu.' : 'No items cataloged in this design.'}
                    </p>
                  ) : (
                    design.products.map((p, idx) => {
                      const matched = productsList.find(item => item._id === p.productId || item.id === p.productId)
                      const productName = matched ? matched.name : `Product #${idx + 1}`
                      const productPrice = matched?.price
                      const productImage = matched?.imageUrl || design.afterImageUrl // fallback
                      const shopeeUrl = matched?.affiliateUrl || `https://shopee.vn/search?keyword=${encodeURIComponent(productName)}`

                      return (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100 bg-[#fafafa]">
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-12 h-12 rounded-lg object-contain bg-white border border-neutral-200 p-1"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[12px] font-semibold text-neutral-900 truncate">
                              {productName}
                            </h5>
                            <p className="text-[10px] text-neutral-400">
                              {productPrice ? `${productPrice.toLocaleString('vi-VN')}₫` : (language === 'vi' ? 'Tìm trên Shopee' : 'Shop on Shopee')}
                            </p>
                          </div>
                          <a
                            href={shopeeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-lg bg-[#ee4d2d] hover:bg-[#d94429] text-white text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 text-center shrink-0"
                            style={{ textDecoration: 'none' }}
                          >
                            <ShoppingBag size={11} />
                            <span>Mua</span>
                          </a>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Call to Action for Viral conversion */}
            <div className="mt-8 border-t border-neutral-100 pt-6">
              <div className="text-center">
                <p className="text-[12px] text-neutral-500 mb-3 font-medium">
                  {language === 'vi' ? 'Bạn muốn thiết kế lại ngôi nhà của mình?' : 'Want to redesign your own home?'}
                </p>
                <button
                  onClick={() => navigate('/ai-room-planner')}
                  className="w-full rounded-xl bg-black py-3.5 text-white text-[12px] font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles size={14} className="text-[#c8b898]" />
                  <span>{language === 'vi' ? 'Bắt đầu thiết kế miễn phí' : 'Start Designing for Free'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
