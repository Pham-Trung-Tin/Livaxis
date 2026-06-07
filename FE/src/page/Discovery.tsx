import { type ReactNode, forwardRef, useMemo, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowUpDown,
  ChevronDown,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getFeaturedProducts } from '../services/productApi'
import type { NewArrivalProduct } from '../services/productApi'
import { Footer, Header } from './Hompage'
import { useLanguage } from '../contexts/LanguageContext'

function categoryToColor(cat: string) {
  const map: Record<string, string> = {
    Sofas: '#A8E6CF',
    Tables: '#E8C5E5',
    Chairs: '#B5D8E4',
    Beds: '#FFDAC1',
    Lighting: '#FFAAA5',
    Storage: '#C7CEEA',
  }
  return map[cat] ?? '#f3e8d0'
}

const CATEGORIES = ['All', 'Sofas', 'Tables', 'Chairs', 'Beds', 'Lighting', 'Storage', 'Decor']

const CATEGORY_KEYS: Record<string, string> = {
  All: 'discovery.allProducts',
  Sofas: 'discovery.sofas',
  Tables: 'discovery.tables',
  Chairs: 'discovery.chairs',
  Beds: 'discovery.beds',
  Lighting: 'discovery.lighting',
  Storage: 'discovery.storage',
  Decor: 'discovery.decor',
}

const SORT_OPTIONS = ['Featured', 'A – Z', 'Z – A', 'Newest First']

const SORT_KEYS: Record<string, string> = {
  Featured: 'discovery.sortFeatured',
  'A – Z': 'discovery.sortAZ',
  'Z – A': 'discovery.sortZA',
  'Newest First': 'discovery.sortNewest',
}

function ImageWithFallback({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
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

function AITryOnOverlay({
  isOpen,
  onClose,
  productName,
}: {
  isOpen: boolean
  onClose: () => void
  productName?: string
}) {
  const { t } = useLanguage()
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="fixed left-1/2 top-1/2 z-[80] w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-[#c8b898]/40 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)]"
          >
            <div className="bg-[linear-gradient(135deg,#f8f5ef_0%,#eee6d8_100%)] px-7 py-6">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#8a7456]">
                <Sparkles size={12} />
                {t('common.aiTryOn')}
              </div>
              <h3 className="text-3xl text-[#1d1814]" style={{ fontFamily: 'Playfair Display, serif' }}>
                {productName || t('discovery.selectedItem')}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#74685a]">
                {t('discovery.tryOnPreviewText')}
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 px-7 py-5">
              <button
                onClick={onClose}
                className="rounded-full border border-black/15 px-5 py-2 text-[11px] uppercase tracking-[0.16em] text-neutral-600 transition-colors hover:border-black/35"
              >
                {t('common.close')}
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full bg-[#171412] px-5 py-2 text-[11px] uppercase tracking-[0.16em] text-white"
              >
                <Sparkles size={12} />
                {t('common.continue')}
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

function FilterSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-6 border-b border-black/6 pb-6">
      <button onClick={() => setOpen((value) => !value)} className="mb-4 flex w-full items-center justify-between">
        <span
          className="text-[11px] uppercase tracking-[0.2em] text-black"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
        >
          {title}
        </span>
        <ChevronDown
          size={14}
          className={`text-neutral-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

const ProductCard = forwardRef<HTMLElement, {
  product: NewArrivalProduct
  index: number
  onTryOn: (product: NewArrivalProduct) => void
}>(function ProductCard({ product, index, onTryOn }, ref) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const { t } = useLanguage()

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="group flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Clickable image area → Product Detail */}
      <div
        className="relative mb-5 overflow-hidden rounded-2xl bg-[#f7f5f2] cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
        role="button"
        aria-label={`View details for ${product.name}`}
      >
        <div className="aspect-[4/5] overflow-hidden">
          <ImageWithFallback
            src={(product as any).imageUrl ?? (product as any).image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>

        <div
          className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-500"
          style={{ opacity: hovered ? 1 : 0 }}
        />

        {/* Category badge */}
        <div className="absolute left-4 top-4">
          <span
            className="rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.18em]"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              backgroundColor: categoryToColor((product as any).category),
              color: '#1a1a1a',
            }}
          >
            {t(CATEGORY_KEYS[product.category] || 'discovery.allProducts')}
          </span>
        </div>

        {/* "View details" hint on hover */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-300"
          style={{ opacity: hovered ? 1 : 0, transform: `translateX(-50%) translateY(${hovered ? '0' : '6px'})` }}
        >
          <span
            className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-black backdrop-blur-sm"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            {t('discovery.viewDetails')}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-1">
        <div>
          <h3
            className="mb-1 cursor-pointer text-[17px] leading-snug text-black transition-colors hover:text-[#a08c6a]"
            style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}
            onClick={() => navigate(`/product/${product.id}`)}
          >
            {product.name}
          </h3>
          <p
            className="text-[12px] leading-relaxed text-neutral-400"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
          >
            {product.subtitle}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span
            className="text-[15px] text-[#5a4a38]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            {product.price ? `${product.price.toLocaleString('vi-VN')}₫` : ''}
          </span>
          <span
            className="text-[10px] uppercase tracking-[0.12em] text-neutral-300"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          >
            {t('discovery.shopOnShopee')}
          </span>
        </div>

        <div className="mt-1 flex gap-2.5">
          {/* BUY ON SHOPEE — external affiliate link */}
          <a
            href={(product as any).affiliateUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { if (!(product as any).affiliateUrl) e.preventDefault() }}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#ee4d2d]/20 py-2.5 transition-all duration-300 hover:border-[#ee4d2d]/50 hover:bg-[#ee4d2d]/[0.03]"
            style={{ fontFamily: 'Inter, sans-serif', textDecoration: 'none' }}
          >
            <ShoppingBag size={13} className="text-[#ee4d2d]/70" strokeWidth={1.5} />
            <span
              className="text-[10px] uppercase tracking-[0.15em] text-[#ee4d2d]/80"
              style={{ fontWeight: 500 }}
            >
              {t('discovery.shopOnShopee')}
            </span>
          </a>

          {/* AI TRY-ON — opens the Gemini AI room planner wizard */}
          <button
            onClick={(event) => {
              event.stopPropagation()
              onTryOn(product)
            }}
            className="relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl py-2.5 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #c8b898 0%, #a08c6a 100%)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
            <Sparkles size={12} className="text-white/90" strokeWidth={2} />
            <span
              className="relative z-10 text-[10px] uppercase tracking-[0.15em] text-white"
              style={{ fontWeight: 600 }}
            >
              {t('common.aiTryOn')}
            </span>
          </button>
        </div>
      </div>
    </motion.article>
  )
})
ProductCard.displayName = 'ProductCard'

export function DiscoveryPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('Featured')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [products, setProducts] = useState<NewArrivalProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoadingProducts(true)
    void getFeaturedProducts(24)
      .then((items) => {
        if (!mounted) return
        setProducts(items)
      })
      .catch((err) => {
        if (!mounted) return
        setProductsError(err.message || t('discovery.loadProductsFailed'))
      })
      .finally(() => {
        if (!mounted) return
        setLoadingProducts(false)
      })

    return () => {
      mounted = false
    }
  }, [t])

  const activeFiltersCount = selectedCategory !== 'All' ? 1 : 0

  const filtered = useMemo(() => {
    let result = [...products]

    if (selectedCategory !== 'All') {
      result = result.filter((product) => product.category === selectedCategory)
    }

    if (sortBy === 'A – Z') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'Z – A') {
      result.sort((a, b) => b.name.localeCompare(a.name))
    }

    return result
  }, [selectedCategory, sortBy, products])

  const SidebarContent = () => (
    <div className="py-2">
      {activeFiltersCount > 0 ? (
        <button
          onClick={() => {
            setSelectedCategory('All')
          }}
          className="mb-6 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-[#a08c6a] transition-colors hover:text-[#7a6644]"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
        >
          <X size={11} />
          {t('discovery.clearAll').replace('{count}', String(activeFiltersCount))}
        </button>
      ) : null}

      <FilterSection title={t('discovery.categoryFilterTitle')}>
        <div className="flex flex-col gap-2.5">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`text-left rounded-lg px-3 py-2 transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-black text-white'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-black'
              }`}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: selectedCategory === category ? 500 : 400,
              }}
            >
              <span className="text-[13px]">{t(CATEGORY_KEYS[category] || 'discovery.allProducts')}</span>
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  )

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />

      <section className="pt-[72px]">
        <div className="relative overflow-hidden bg-[#f7f5f1]">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          />

          <div className="relative mx-auto max-w-[1440px] px-8 py-20 md:px-16 md:py-28">
            <div className="max-w-2xl">
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-5 block text-[11px] uppercase tracking-[0.28em] text-[#a08c6a]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                {t('homepage.heroTitle')}
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="mb-6 text-[clamp(2.2rem,6vw,4rem)] leading-[1.1] text-black"
                style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
              >
                {t('common.discovery')}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-lg text-[15px] leading-relaxed text-neutral-400"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                {t('discovery.exploreSubtitle')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex items-center gap-6"
              >
                <div className="flex items-center gap-2 rounded-full border border-[#c8b898]/40 bg-white/60 px-4 py-2 backdrop-blur-sm">
                  <Sparkles size={13} className="text-[#a08c6a]" />
                  <span
                    className="text-[11px] uppercase tracking-[0.15em] text-[#8a7456]"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                  >
                    {t('discovery.aiTryOnEnabled')}
                  </span>
                </div>
                <span className="text-[12px] text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                  {t('discovery.showingAll')}
                </span>
              </motion.div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/8 to-transparent" />
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-8 py-14 md:px-16">
        <div className="flex gap-14">
          <aside className="hidden w-[240px] shrink-0 lg:block">
            <div className="sticky top-[88px]">
              <div className="mb-8 flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-neutral-400" strokeWidth={1.5} />
                <span
                  className="text-[11px] uppercase tracking-[0.2em] text-neutral-400"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  {t('discovery.refine')}
                </span>
                {activeFiltersCount > 0 ? (
                  <span
                    className="ml-auto rounded-full bg-black px-2 py-0.5 text-[9px] text-white"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                  >
                    {activeFiltersCount}
                  </span>
                ) : null}
              </div>
              <SidebarContent />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-10 flex items-center justify-between border-b border-black/6 pb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-black/12 px-4 py-2 transition-colors hover:border-black/25 lg:hidden"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <SlidersHorizontal size={13} className="text-neutral-500" />
                  <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-600" style={{ fontWeight: 500 }}>
                    {t('discovery.refine')}{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
                  </span>
                </button>

                <span className="text-[13px] text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                  {t('collections.piecesLabel').replace('{count}', String(filtered.length))}
                </span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowSortMenu((value) => !value)}
                  className="flex items-center gap-2.5 rounded-lg border border-black/10 px-4 py-2 transition-colors hover:border-black/25"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <ArrowUpDown size={12} className="text-neutral-400" />
                  <span className="text-[11px] tracking-[0.1em] text-neutral-600" style={{ fontWeight: 500 }}>
                    {t(SORT_KEYS[sortBy] || sortBy)}
                  </span>
                  <ChevronDown size={12} className={`text-neutral-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showSortMenu ? (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-xl border border-black/8 bg-white py-1 shadow-xl"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option)
                            setShowSortMenu(false)
                          }}
                          className={`w-full px-5 py-3 text-left text-[12px] transition-colors ${
                            sortBy === option
                              ? 'bg-[#f7f5f1] text-black'
                              : 'text-neutral-500 hover:bg-neutral-50 hover:text-black'
                          }`}
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: sortBy === option ? 500 : 400,
                          }}
                        >
                          {t(SORT_KEYS[option] || option)}
                        </button>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {activeFiltersCount > 0 ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 flex flex-wrap gap-2 overflow-hidden"
                >
                  {selectedCategory !== 'All' ? (
                    <span
                      className="flex items-center gap-2 rounded-full bg-[#f7f5f1] px-3 py-1.5 text-[11px] text-neutral-600"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                    >
                      {t(CATEGORY_KEYS[selectedCategory] || selectedCategory)}
                      <button
                        onClick={() => setSelectedCategory('All')}
                        className="text-neutral-400 transition-colors hover:text-black"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ) : null}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <p
                  className="mb-3 text-[22px] text-neutral-200"
                  style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
                >
                  {t('discovery.noPiecesMatch')}
                </p>
                <p className="mb-8 text-[13px] text-neutral-300" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                  {t('discovery.tryAdjusting')}
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All')
                  }}
                  className="rounded-full border border-black/12 px-6 py-2.5 text-[11px] uppercase tracking-[0.15em] text-neutral-600 transition-colors hover:border-black/30"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  {t('discovery.clearFilters')}
                </button>
              </motion.div>
            ) : (
              <motion.div layout className="grid grid-cols-1 gap-x-7 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filtered.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      onTryOn={(p) => navigate('/ai-room-planner')}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileFiltersOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-full w-[300px] overflow-y-auto bg-white shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-black/6 px-6 py-5">
                <span
                  className="text-[11px] uppercase tracking-[0.2em] text-black"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                >
                  {t('discovery.refine')}
                </span>
                <button onClick={() => setMobileFiltersOpen(false)} className="text-neutral-400 transition-colors hover:text-black">
                  <X size={18} />
                </button>
              </div>
              <div className="px-6 pt-6">
                <SidebarContent />
              </div>
              <div className="sticky bottom-0 border-t border-black/6 bg-white px-6 py-4">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full rounded-xl bg-black py-3 text-[11px] uppercase tracking-[0.15em] text-white"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                >
                  {t('discovery.showingResultsCount').replace('{count}', String(filtered.length))}
                </button>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>


      <section className="border-t border-black/5 bg-[#f7f5f1] py-20">
        <div className="mx-auto max-w-[1440px] px-8 text-center md:px-16">
          <span
            className="mb-5 block text-[11px] uppercase tracking-[0.24em] text-[#a08c6a]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            {t('discovery.promiseTitle')}
          </span>
          <h2
            className="mx-auto mb-5 max-w-2xl text-[clamp(1.6rem,3vw,2.4rem)] leading-snug text-black"
            style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
          >
            {t('discovery.promiseSubtitle')}
          </h2>
          <p
            className="mx-auto max-w-xl text-[14px] leading-relaxed text-neutral-400"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
          >
            {t('discovery.promiseDesc')}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-10">
            {[
              { stat: '99.4%', label: t('discovery.accuracyLabel') },
              { stat: '< 8s', label: t('discovery.renderTimeLabel') },
              { stat: '3M+', label: t('discovery.tryonsCompletedLabel') },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p
                  className="mb-1 text-[2rem] text-black"
                  style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
                >
                  {item.stat}
                </p>
                <p
                  className="text-[11px] uppercase tracking-[0.16em] text-neutral-400"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default DiscoveryPage
