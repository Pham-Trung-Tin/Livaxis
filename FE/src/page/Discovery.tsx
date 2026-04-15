import { type ReactNode, forwardRef, useMemo, useState } from 'react'
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
import * as Slider from '@radix-ui/react-slider'
import { Footer, Header } from './Hompage'

const ALL_PRODUCTS = [
  {
    id: 101,
    name: 'Serene Linen Sofa',
    subtitle: 'Cloud-soft performance linen',
    price: 4890,
    displayPrice: '$4,890',
    image:
      'https://images.unsplash.com/photo-1759722668767-3f9cb7468b7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBsaW5lbiUyMHNvZmElMjBtaW5pbWFsaXN0JTIwbGl2aW5nJTIwcm9vbXxlbnwxfHx8fDE3NzI3MzE0MTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Sofas',
    categoryBadgeColor: '#A8E6CF',
    isNew: true,
  },
  {
    id: 102,
    name: 'Carrara Side Table',
    subtitle: 'Hand-cut Italian marble base',
    price: 2290,
    displayPrice: '$2,290',
    image:
      'https://images.unsplash.com/photo-1765766638341-0beb9eb9926c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJibGUlMjBzaWRlJTIwdGFibGUlMjBsdXh1cnklMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzI3MzE0MTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Tables',
    categoryBadgeColor: '#E8C5E5',
    isNew: true,
  },
  {
    id: 103,
    name: 'Walnut Lounge Chair',
    subtitle: 'Solid black walnut, hand-oiled finish',
    price: 3140,
    displayPrice: '$3,140',
    image:
      'https://images.unsplash.com/photo-1762803841091-c5327f7aed37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YWxudXQlMjB3b29kJTIwbG91bmdlJTIwY2hhaXIlMjBtb2Rlcm4lMjBkZXNpZ258ZW58MXx8fHwxNzcyNzMxNDE4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Chairs',
    categoryBadgeColor: '#B5D8E4',
    isNew: true,
  },
  {
    id: 104,
    name: 'Atelier Brass Pendant',
    subtitle: 'Spun brass with antique patina',
    price: 1480,
    displayPrice: '$1,480',
    image:
      'https://images.unsplash.com/photo-1767979066193-83dffc4a4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFzcyUyMHBlbmRhbnQlMjBsaWdodCUyMG1vZGVybiUyMGx1eHVyeSUyMGJlZHJvb218ZW58MXx8fHwxNzcyNzMxNDE4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Lighting',
    categoryBadgeColor: '#FFAAA5',
    isNew: false,
  },
  {
    id: 105,
    name: 'Nordic Oak Dining Table',
    subtitle: 'FSC-certified solid white oak',
    price: 5640,
    displayPrice: '$5,640',
    image:
      'https://images.unsplash.com/photo-1772442363851-738a548f6c5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwb2FrJTIwZGluaW5nJTIwdGFibGUlMjBTY2FuZGluYXZpYW58ZW58MXx8fHwxNzcyNzMxNDE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Tables',
    categoryBadgeColor: '#E8C5E5',
    isNew: true,
  },
  {
    id: 106,
    name: 'Boucle Accent Chair',
    subtitle: 'Tufted bouclé weave, gilt legs',
    price: 2950,
    displayPrice: '$2,950',
    image:
      'https://images.unsplash.com/photo-1768946131690-247c5319f0d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3VjbCVDMyVBOSUyMGFjY2VudCUyMGFybWNoYWlyJTIwbmV1dHJhbCUyMGJlaWdlJTIwbHV4dXJ5fGVufDF8fHx8MTc3MjczMTQxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Chairs',
    categoryBadgeColor: '#B5D8E4',
    isNew: true,
  },
  {
    id: 107,
    name: 'Rattan Shelf System',
    subtitle: 'Woven rattan, ash wood frame',
    price: 1890,
    displayPrice: '$1,890',
    image:
      'https://images.unsplash.com/photo-1734120113877-ef06ed3a10f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYXR0YW4lMjB3aWNrZXIlMjBib29rc2hlbGYlMjBtb2Rlcm4lMjBsdXh1cnl8ZW58MXx8fHwxNzcyNzMxNDIwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Storage',
    categoryBadgeColor: '#C7CEEA',
    isNew: false,
  },
  {
    id: 108,
    name: 'Travertine Coffee Table',
    subtitle: 'Roman travertine, unlacquered iron',
    price: 3780,
    displayPrice: '$3,780',
    image:
      'https://images.unsplash.com/photo-1755770355297-1526e33a3c82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZXJ0aW5lJTIwc3RvbmUlMjBjb2ZmZWUlMjB0YWJsZSUyMGx1eHVyeXxlbnwxfHx8fDE3NzI3MzE0MjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Tables',
    categoryBadgeColor: '#E8C5E5',
    isNew: true,
  },
  {
    id: 109,
    name: 'Velvet Chaise Lounge',
    subtitle: 'Performance velvet, blackened brass',
    price: 4320,
    displayPrice: '$4,320',
    image:
      'https://images.unsplash.com/photo-1759774313258-b0111fb75cbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWx2ZXQlMjBjaGFpc2UlMjBsb3VuZ2UlMjBsdXh1cnklMjBpbnRlcmlvciUyMGRlc2lnbnxlbnwxfHx8fDE3NzI3MzE0MjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Sofas',
    categoryBadgeColor: '#A8E6CF',
    isNew: true,
  },
  {
    id: 110,
    name: 'Modern Platform Bed',
    subtitle: 'Upholstered in premium fabric',
    price: 3890,
    displayPrice: '$3,890',
    image:
      'https://images.unsplash.com/photo-1765862835193-3c37388a409e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwbGF0Zm9ybSUyMGJlZCUyMG1vZGVybiUyMGJlZHJvb218ZW58MXx8fHwxNzc2MjUzODU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Beds',
    categoryBadgeColor: '#FFDAC1',
    isNew: false,
  },
  {
    id: 111,
    name: 'Industrial Arc Lamp',
    subtitle: 'Brushed brass with marble base',
    price: 1650,
    displayPrice: '$1,650',
    image:
      'https://images.unsplash.com/photo-1775811035108-658b4b101cdb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwZmxvb3IlMjBsYW1wJTIwYnJhc3MlMjBtZXRhbHxlbnwxfHx8fDE3NzYyNTM4NjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Lighting',
    categoryBadgeColor: '#FFAAA5',
    isNew: true,
  },
  {
    id: 112,
    name: 'Walnut Credenza',
    subtitle: 'Handcrafted sideboard with brass details',
    price: 4150,
    displayPrice: '$4,150',
    image:
      'https://images.unsplash.com/photo-1549315393-aeac60e09d29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzaWRlYm9hcmQlMjBjcmVkZW56YSUyMHdhbG51dHxlbnwxfHx8fDE3NzYyNTM4NjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'Storage',
    categoryBadgeColor: '#C7CEEA',
    isNew: false,
  },
] as const

const CATEGORIES = ['All', 'Sofas', 'Tables', 'Chairs', 'Beds', 'Lighting', 'Storage', 'Decor']
const SORT_OPTIONS = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest First']

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
      <div className="flex h-full w-full items-center justify-center bg-[#f7f5f2] text-center text-sm text-[#8f7b5f]">
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

const ProductCard = forwardRef<HTMLElement, {
  product: (typeof ALL_PRODUCTS)[number]
  index: number
  onTryOn: (name: string) => void
}>(function ProductCard({ product, index, onTryOn }, ref) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

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
      <div className="relative mb-5 overflow-hidden rounded-2xl bg-[#f7f5f2]">
        <div className="aspect-[4/5] overflow-hidden">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>

        <div
          className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent transition-opacity duration-500"
          style={{ opacity: hovered ? 1 : 0 }}
        />

        <div className="absolute left-4 top-4">
          <span
            className="rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.18em]"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              backgroundColor: product.categoryBadgeColor,
              color: '#1a1a1a',
            }}
          >
            {product.category}
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
            {product.displayPrice}
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
})
ProductCard.displayName = 'ProductCard'

export function DiscoveryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [priceRange, setPriceRange] = useState([0, 6000])
  const [sortBy, setSortBy] = useState('Featured')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [tryOnProduct, setTryOnProduct] = useState<string | null>(null)

  const activeFiltersCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (priceRange[0] !== 0 || priceRange[1] !== 6000 ? 1 : 0)

  const filtered = useMemo(() => {
    let result = [...ALL_PRODUCTS]

    if (selectedCategory !== 'All') {
      result = result.filter((product) => product.category === selectedCategory)
    }

    result = result.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])

    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'Newest First') {
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
    }

    return result
  }, [priceRange, selectedCategory, sortBy])

  const SidebarContent = () => (
    <div className="py-2">
      {activeFiltersCount > 0 ? (
        <button
          onClick={() => {
            setSelectedCategory('All')
            setPriceRange([0, 6000])
          }}
          className="mb-6 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-[#a08c6a] transition-colors hover:text-[#7a6644]"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
        >
          <X size={11} />
          Clear all ({activeFiltersCount})
        </button>
      ) : null}

      <FilterSection title="Product Category">
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
              <span className="text-[13px]">{category}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="px-2">
          <Slider.Root
            className="relative flex h-5 w-full select-none items-center touch-none"
            value={priceRange}
            onValueChange={setPriceRange}
            max={6000}
            step={100}
            minStepsBetweenThumbs={1}
          >
            <Slider.Track className="relative h-[2px] grow rounded-full bg-neutral-200">
              <Slider.Range className="absolute h-full rounded-full bg-black" />
            </Slider.Track>
            <Slider.Thumb
              className="block h-4 w-4 rounded-full bg-black shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              style={{ cursor: 'grab' }}
              aria-label="Minimum price"
            />
            <Slider.Thumb
              className="block h-4 w-4 rounded-full bg-black shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              style={{ cursor: 'grab' }}
              aria-label="Maximum price"
            />
          </Slider.Root>
          <div
            className="mt-3 flex justify-between text-[12px] text-[#717182]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <span>${priceRange[0].toLocaleString()}</span>
            <span>${priceRange[1].toLocaleString()}</span>
          </div>
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
                See It In Your Space
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="mb-6 text-[clamp(2.2rem,6vw,4rem)] leading-[1.1] text-black"
                style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
              >
                Discovery
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-lg text-[15px] leading-relaxed text-neutral-400"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                Explore our entire curated collection of modern luxury furniture. Discover pieces designed to transform your space.
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
                <span className="text-[12px] text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                  Showing all items
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

                <span className="text-[13px] text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                  {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
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
                  {selectedCategory !== 'All' ? (
                    <span
                      className="flex items-center gap-2 rounded-full bg-[#f7f5f1] px-3 py-1.5 text-[11px] text-neutral-600"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                    >
                      {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory('All')}
                        className="text-neutral-400 transition-colors hover:text-black"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ) : null}
                  {priceRange[0] !== 0 || priceRange[1] !== 6000 ? (
                    <span
                      className="flex items-center gap-2 rounded-full bg-[#f7f5f1] px-3 py-1.5 text-[11px] text-neutral-600"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                    >
                      ${priceRange[0]} - ${priceRange[1]}
                      <button
                        onClick={() => setPriceRange([0, 6000])}
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
                  No pieces match your filters
                </p>
                <p className="mb-8 text-[13px] text-neutral-300" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                  Try adjusting your selection
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All')
                    setPriceRange([0, 6000])
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
                  {filtered.map((product, index) => (
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
                  Show {filtered.length} Results
                </button>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <AITryOnOverlay
        isOpen={tryOnProduct !== null}
        onClose={() => setTryOnProduct(null)}
        productName={tryOnProduct ?? undefined}
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
            Every piece, previewed in your room before you decide.
          </h2>
          <p
            className="mx-auto max-w-xl text-[14px] leading-relaxed text-neutral-400"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
          >
            Powered by Gemini AI, our Try-On feature places any piece from our collection into a photo of your space, complete with lighting simulation and scale accuracy.
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

export default DiscoveryPage
