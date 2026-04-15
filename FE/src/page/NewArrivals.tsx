import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowUpDown,
  ChevronDown,
  Eye,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  getNewArrivals,
  type GetNewArrivalsParams,
  type NewArrivalProduct,
} from '../services/productApi'
import { Footer, Header } from './Hompage'

const PRICE_RANGES = [
  { label: 'Under $1,500', value: 'under_1500' },
  { label: '$1,500 - $3,000', value: '1500_3000' },
  { label: '$3,000 - $5,000', value: '3000_5000' },
  { label: '$5,000+', value: '5000_plus' },
] as const

const SORT_OPTIONS = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest First'] as const
type PriceRangeCode = (typeof PRICE_RANGES)[number]['value']

const SORT_OPTION_TO_API: Record<(typeof SORT_OPTIONS)[number], GetNewArrivalsParams['sortBy']> = {
  Featured: 'featured',
  'Price: Low to High': 'priceAsc',
  'Price: High to Low': 'priceDesc',
  'Newest First': 'newestFirst',
}

const getPriceRangeCode = (label: string): PriceRangeCode | undefined => {
  const found = PRICE_RANGES.find((item) => item.label === label)
  return found?.value
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
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

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#efeae2] text-center text-sm text-[#8f7b5f]">
        Image unavailable
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
                AI Try-On
              </div>
              <h3 className="text-3xl text-[#1d1814]" style={{ fontFamily: 'Playfair Display, serif' }}>
                {productName || 'Selected item'}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#74685a]">
                Day la ban UI preview cho tinh nang AI Try-On. O buoc tiep theo, minh co the ket noi upload
                anh phong va API render de cho ket qua truc tiep.
              </p>
            </div>
            <div className="flex items-center justify-between gap-4 px-7 py-5">
              <button
                onClick={onClose}
                className="rounded-full border border-black/15 px-5 py-2 text-[11px] uppercase tracking-[0.16em] text-neutral-600 transition-colors hover:border-black/35"
              >
                Close
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full bg-[#171412] px-5 py-2 text-[11px] uppercase tracking-[0.16em] text-white"
              >
                <Sparkles size={12} />
                Continue
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

function ProductCard({
  product,
  index,
  onTryOn,
}: {
  product: NewArrivalProduct
  index: number
  onTryOn: (name: string) => void
}) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="group flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative mb-5 overflow-hidden rounded-2xl bg-[#f7f5f2]">
        <div className="aspect-[4/5] overflow-hidden">
          <ImageWithFallback
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>

        <div
          className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-500"
          style={{ opacity: hovered ? 1 : 0 }}
        />

        <div className="absolute left-4 top-4 flex gap-2">
          {product.isNew ? (
            <span
              className="rounded-full bg-black px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-white"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
            >
              New 2026
            </span>
          ) : null}
          <span
            className="rounded-full bg-white/90 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-neutral-500 backdrop-blur-sm"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            {product.category}
          </span>
        </div>

        <div className="absolute bottom-4 right-4">
          <span
            className="flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-neutral-500 backdrop-blur-sm"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full border border-white/60"
              style={{ backgroundColor: product.colorHex || '#d8d2c8' }}
            />
            {product.material || 'Material'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-1">
        <div>
          <h3
            className="mb-1 text-[17px] leading-snug text-black"
            style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}
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
            {formatPrice(product.price)}
          </span>
          <span
            className="text-[10px] uppercase tracking-[0.12em] text-neutral-300"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          >
            Free delivery
          </span>
        </div>

        <div className="mt-1 flex gap-2.5">
          <button
            onClick={() => navigate(`/product/${product.id}`)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-black/12 py-2.5 transition-all duration-300 hover:border-black/30 hover:bg-black/[0.02]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Eye size={13} className="text-neutral-500" strokeWidth={1.5} />
            <span
              className="text-[10px] uppercase tracking-[0.15em] text-neutral-600"
              style={{ fontWeight: 500 }}
            >
              View Details
            </span>
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation()
              onTryOn(product.name)
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
              AI Try-On
            </span>
          </button>
        </div>
      </div>
    </motion.article>
  )
}

export default function NewArrivals() {
  const [products, setProducts] = useState<NewArrivalProduct[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [materials, setMaterials] = useState<string[]>([])
  const [colors, setColors] = useState<Array<{ name: string; hex: string }>>([])
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedPrices, setSelectedPrices] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]>('Featured')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [tryOnProduct, setTryOnProduct] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const activeFiltersCount = selectedMaterials.length + selectedColors.length + selectedPrices.length

  const toggle = (arr: string[], val: string, setter: (value: string[]) => void) =>
    arr.includes(val) ? setter(arr.filter((item) => item !== val)) : setter([...arr, val])

  const selectedPriceCodes = useMemo(
    () => selectedPrices.map((label) => getPriceRangeCode(label)).filter(Boolean) as NonNullable<GetNewArrivalsParams['priceRanges']>,
    [selectedPrices],
  )

  const requestParams = useMemo<GetNewArrivalsParams>(
    () => ({
      page: 1,
      limit: 12,
      materials: selectedMaterials,
      colors: selectedColors,
      priceRanges: selectedPriceCodes,
      sortBy: SORT_OPTION_TO_API[sortBy],
    }),
    [selectedColors, selectedMaterials, selectedPriceCodes, sortBy],
  )

  useEffect(() => {
    let active = true

    const fetchProducts = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const response = await getNewArrivals(requestParams)
        if (!active) {
          return
        }

        setProducts(response.items)
        setTotalItems(response.pagination.totalItems)
        setMaterials(response.availableFilters.materials)
        setColors(response.availableFilters.colors)
      } catch (error) {
        if (!active) {
          return
        }

        setProducts([])
        setTotalItems(0)
        setLoadError(error instanceof Error ? error.message : 'Failed to load products')
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void fetchProducts()

    return () => {
      active = false
    }
  }, [requestParams])

  const SidebarContent = () => (
    <div className="py-2">
      {activeFiltersCount > 0 ? (
        <button
          onClick={() => {
            setSelectedMaterials([])
            setSelectedColors([])
            setSelectedPrices([])
          }}
          className="mb-6 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-[#a08c6a] transition-colors hover:text-[#7a6644]"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
        >
          <X size={11} />
          Clear all ({activeFiltersCount})
        </button>
      ) : null}

      <FilterSection title="Material">
        <div className="flex flex-col gap-2.5">
          {materials.map((material) => (
            <label key={material} className="group/check flex cursor-pointer items-center gap-3">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-200 ${
                  selectedMaterials.includes(material)
                    ? 'border-black bg-black'
                    : 'border-black/20 group-hover/check:border-black/40'
                }`}
                onClick={() => toggle(selectedMaterials, material, setSelectedMaterials)}
              >
                {selectedMaterials.includes(material) ? (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path
                      d="M1 3L3 5L7 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
              <span
                className="text-[13px] text-neutral-600 transition-colors group-hover/check:text-black"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                onClick={() => toggle(selectedMaterials, material, setSelectedMaterials)}
              >
                {material}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Color">
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => toggle(selectedColors, color.name, setSelectedColors)}
              title={color.name}
              className={`relative h-7 w-7 rounded-full border-2 transition-all duration-200 ${
                selectedColors.includes(color.name)
                  ? 'scale-110 border-[#a08c6a]'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: color.hex, boxShadow: '0 0 0 1px rgba(0,0,0,0.1)' }}
            >
              {selectedColors.includes(color.name) ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke={color.name === 'Ivory' || color.name === 'Sand' ? '#5a4a38' : 'white'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : null}
            </button>
          ))}
        </div>
        {selectedColors.length > 0 ? (
          <p className="mt-3 text-[11px] text-neutral-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            {selectedColors.join(', ')}
          </p>
        ) : null}
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="flex flex-col gap-2.5">
          {PRICE_RANGES.map((range) => (
            <label key={range.label} className="group/check flex cursor-pointer items-center gap-3">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-200 ${
                  selectedPrices.includes(range.label)
                    ? 'border-black bg-black'
                    : 'border-black/20 group-hover/check:border-black/40'
                }`}
                onClick={() => toggle(selectedPrices, range.label, setSelectedPrices)}
              >
                {selectedPrices.includes(range.label) ? (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path
                      d="M1 3L3 5L7 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
              <span
                className="text-[13px] text-neutral-600 transition-colors group-hover/check:text-black"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                onClick={() => toggle(selectedPrices, range.label, setSelectedPrices)}
              >
                {range.label}
              </span>
            </label>
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
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
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
                Spring - Summer 2026
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="mb-6 text-[clamp(2.2rem,6vw,4rem)] leading-[1.1] text-black"
                style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
              >
                New Arrivals
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-lg text-[15px] leading-relaxed text-neutral-400"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                Our most anticipated collection yet - each piece designed to be experienced in your
                space with Livaxis AI, before it arrives.
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
                    AI Try-On Enabled
                  </span>
                </div>
                <span
                  className="text-[12px] text-neutral-400"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
                >
                  {totalItems} Pieces
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
                  Refine
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
                    Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}
                  </span>
                </button>

                <span
                  className="text-[13px] text-neutral-400"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
                >
                  {totalItems} {totalItems === 1 ? 'piece' : 'pieces'}
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
                    {sortBy}
                  </span>
                  <ChevronDown
                    size={12}
                    className={`text-neutral-400 transition-transform ${showSortMenu ? 'rotate-180' : ''}`}
                  />
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
                          {option}
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
                  {[...selectedMaterials, ...selectedColors, ...selectedPrices].map((chip) => (
                    <span
                      key={chip}
                      className="flex items-center gap-2 rounded-full bg-[#f7f5f1] px-3 py-1.5 text-[11px] text-neutral-600"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                    >
                      {chip}
                      <button
                        onClick={() => {
                          if (selectedMaterials.includes(chip)) {
                            setSelectedMaterials(selectedMaterials.filter((value) => value !== chip))
                          }
                          if (selectedColors.includes(chip)) {
                            setSelectedColors(selectedColors.filter((value) => value !== chip))
                          }
                          if (selectedPrices.includes(chip)) {
                            setSelectedPrices(selectedPrices.filter((value) => value !== chip))
                          }
                        }}
                        className="text-neutral-400 transition-colors hover:text-black"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <p className="text-[14px] text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                  Loading new arrivals...
                </p>
              </motion.div>
            ) : loadError ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <p
                  className="mb-2 text-[22px] text-neutral-300"
                  style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
                >
                  Unable to load products
                </p>
                <p className="mb-8 text-[13px] text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                  {loadError}
                </p>
                <button
                  onClick={() => {
                    setSelectedMaterials([])
                    setSelectedColors([])
                    setSelectedPrices([])
                  }}
                  className="rounded-full border border-black/12 px-6 py-2.5 text-[11px] uppercase tracking-[0.15em] text-neutral-600 transition-colors hover:border-black/30"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  Reset filters
                </button>
              </motion.div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <p
                  className="mb-3 text-[22px] text-neutral-200"
                  style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
                >
                  No pieces match your filters
                </p>
                <p className="mb-8 text-[13px] text-neutral-300" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                  Try adjusting your selection
                </p>
                <button
                  onClick={() => {
                    setSelectedMaterials([])
                    setSelectedColors([])
                    setSelectedPrices([])
                  }}
                  className="rounded-full border border-black/12 px-6 py-2.5 text-[11px] uppercase tracking-[0.15em] text-neutral-600 transition-colors hover:border-black/30"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  Clear filters
                </button>
              </motion.div>
            ) : (
              <motion.div layout className="grid grid-cols-1 gap-x-7 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      onTryOn={(name) => setTryOnProduct(name)}
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
                  Refine
                </span>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="text-neutral-400 transition-colors hover:text-black"
                >
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
                  Show {totalItems} Results
                </button>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <AITryOnOverlay
        isOpen={tryOnProduct !== null}
        onClose={() => setTryOnProduct(null)}
        productName={tryOnProduct || undefined}
      />

      <section className="border-t border-black/5 bg-[#f7f5f1] py-20">
        <div className="mx-auto max-w-[1440px] px-8 text-center md:px-16">
          <span
            className="mb-5 block text-[11px] uppercase tracking-[0.24em] text-[#a08c6a]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            The Livaxis Promise
          </span>
          <h2
            className="mx-auto mb-5 max-w-2xl text-[clamp(1.6rem,3vw,2.4rem)] leading-snug text-black"
            style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
          >
            Every piece, previewed in your room - before you decide.
          </h2>
          <p
            className="mx-auto max-w-xl text-[14px] leading-relaxed text-neutral-400"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
          >
            Powered by Gemini AI, our Try-On feature places any piece from the 2026 collection into
            a photo of your space, complete with lighting simulation and scale accuracy.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-10">
            {[
              { stat: '99.4%', label: 'Placement accuracy' },
              { stat: '< 8s', label: 'AI render time' },
              { stat: '3M+', label: 'Try-ons completed' },
            ].map((item) => (
              <div key={item.stat} className="text-center">
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
