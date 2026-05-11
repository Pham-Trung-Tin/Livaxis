import { useState, useRef, type ReactNode } from 'react'
import { motion, useInView, AnimatePresence } from 'motion/react'
import { Sparkles, ArrowRight, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Header, Footer } from './Hompage'

/* ─── Small helpers (kept local to match Discovery style) ─── */
function ImageWithFallback({ src, alt, className, style }: { src: string; alt: string; className?: string; style?: any }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#f7f5f2] text-center text-sm text-[#8f7b5f]">
        Image unavailable
      </div>
    )
  }
  return <img src={src} alt={alt} className={className} style={style} onError={() => setFailed(true)} loading="lazy" />
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
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#74685a]">AI Room Planner preview placeholder.</p>
            </div>
            <div className="flex items-center justify-between gap-4 px-7 py-5">
              <button onClick={onClose} className="rounded-full border border-black/15 px-5 py-2 text-[11px] uppercase tracking-[0.16em] text-neutral-600">
                Close
              </button>
              <button onClick={onClose} className="inline-flex items-center gap-2 rounded-full bg-[#171412] px-5 py-2 text-[11px] uppercase tracking-[0.16em] text-white">
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

/* ─── Collection data (copied from Figma excerpt) ─── */
const COLLECTIONS = [
  {
    id: 'living-room',
    name: 'Living Room',
    tagline: 'Where comfort meets composition.',
    description:
      'Curated sofas, lounge chairs, and coffee tables built for the art of gathering. Each piece a quiet statement, every arrangement a considered whole.',
    pieces: '42 Pieces',
    highlight: 'Featuring the 2026 Aria & Solstice Series',
    image: 'https://images.unsplash.com/photo-1710367847994-7b456c7aa507?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    palette: ['#E8E0D4', '#C4A882', '#6B5B45'],
    layout: 'hero',
  },
  {
    id: 'dining-room',
    name: 'Dining Room',
    tagline: 'Set the scene for every occasion.',
    description:
      'From intimate suppers to celebratory feasts, our dining collection balances architectural weight with warm material warmth. Marble, oak, and linen in harmony.',
    pieces: '28 Pieces',
    highlight: 'New: Solstice & Nordic Oak Tables',
    image: 'https://images.unsplash.com/photo-1695369646578-4b6d5fa04987?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    palette: ['#EDE6DC', '#B89A72', '#3D2E1E'],
    layout: 'panel',
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    tagline: 'Sanctuary, redefined.',
    description:
      'Rest is not passive. Our bedroom collection — layered linens, upholstered frames, and artisanal nightstands — transforms sleep into ritual.',
    pieces: '35 Pieces',
    highlight: 'Exclusive: Serene Linen Collection',
    image: 'https://images.unsplash.com/photo-1528908929486-dfaa209c6986?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    palette: ['#EDE8E2', '#C2A98A', '#5A4A38'],
    layout: 'panel',
  },
  {
    id: 'study',
    name: 'Home Study',
    tagline: 'Craft your most considered space.',
    description:
      'A desk should inspire the work done at it. Solid walnut, aged brass, and supple leather converge in a collection made for focused living.',
    pieces: '19 Pieces',
    highlight: 'New: Atelier Desk System',
    image: 'https://images.unsplash.com/photo-1651602855717-9f79c72893cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    palette: ['#E4DDD4', '#9C8060', '#2E2416'],
    layout: 'wide',
  },
  {
    id: 'outdoor',
    name: 'Outdoor',
    tagline: 'The garden as a living room.',
    description:
      'Weather-resilient materials that refuse to compromise on beauty. Stone, teak, and powder-coat aluminium for spaces that blur inside and out.',
    pieces: '24 Pieces',
    highlight: 'New: Atelier Terrace Series',
    image: 'https://images.unsplash.com/photo-1614635893671-57d37f636bac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    palette: ['#E6E0D8', '#B09070', '#4A3C2C'],
    layout: 'wide',
  },
] as const

/* ─── Small reveal wrapper using motion's useInView ─── */
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function DiscoverButton({ light = false, onClick }: { light?: boolean; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group inline-flex items-center gap-3 relative overflow-hidden ${
        light ? 'text-white/90 hover:text-white' : 'text-neutral-800 hover:text-black'
      } transition-colors duration-300`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <span className={`text-[11px] tracking-[0.22em] uppercase transition-all duration-300 ${hovered ? 'translate-x-0.5' : ''}`} style={{ fontWeight: 500 }}>
        Discover Collection
      </span>
      <span className={`flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-300 ${
        light ? 'border-white/40 group-hover:border-white group-hover:bg-white/10' : 'border-black/20 group-hover:border-black group-hover:bg-black/5'
      } ${hovered ? 'translate-x-1' : ''}`}>
        <ArrowRight size={11} strokeWidth={2} />
      </span>
    </button>
  )
}

/* ─── Card components (Hero / Panel / Wide) — adapted for project */
function HeroCard({ collection }: { collection: (typeof COLLECTIONS)[0] }) {
  const navigate = useNavigate()
  return (
    <Reveal>
      <div className="relative w-full overflow-hidden rounded-3xl" style={{ minHeight: '560px' }}>
        <div className="flex flex-col lg:flex-row h-full" style={{ minHeight: '560px' }}>
          <div className="relative lg:w-[60%] h-[360px] lg:h-auto overflow-hidden">
            <ImageWithFallback src={collection.image} alt={collection.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10" />
            <div className="absolute bottom-6 left-6">
              <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] tracking-[0.18em] uppercase text-neutral-600" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                {collection.pieces}
              </span>
            </div>
          </div>

          <div className="lg:w-[40%] flex flex-col justify-center px-10 py-14 lg:px-16" style={{ backgroundColor: '#F7F4EF' }}>
            <span className="text-[10px] tracking-[0.28em] uppercase text-[#a08c6a] mb-5 block" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              Collection No. 01
            </span>
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] text-black leading-[1.05] mb-5" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
              {collection.name}
            </h2>
            <p className="text-[18px] text-neutral-500 italic mb-6 leading-snug" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
              "{collection.tagline}"
            </p>
            <p className="text-[13px] text-neutral-500 leading-relaxed mb-10 max-w-xs" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
              {collection.description}
            </p>
            <div className="flex items-center gap-2 mb-10">
              {collection.palette.map((hex) => (
                <span key={hex} className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: hex }} />
              ))}
              <span className="ml-2 text-[10px] tracking-[0.12em] uppercase text-neutral-400" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
                {collection.highlight}
              </span>
            </div>
            <DiscoverButton onClick={() => navigate('/new-arrivals')} />
          </div>
        </div>
      </div>
    </Reveal>
  )
}

function PanelCard({ collection, index }: { collection: (typeof COLLECTIONS)[0]; index: number }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  return (
    <Reveal delay={index * 0.12}>
      <div className="group relative overflow-hidden rounded-2xl flex flex-col cursor-pointer" style={{ minHeight: '580px' }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <div className="relative flex-1 overflow-hidden" style={{ minHeight: '380px' }}>
          <ImageWithFallback src={collection.image} alt={collection.name} className="w-full h-full object-cover transition-transform duration-700 ease-out" style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute top-5 left-5">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[9px] tracking-[0.2em] uppercase text-neutral-500" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              {collection.pieces}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-7 pb-7">
            <p className="text-white/70 text-[12px] italic mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              "{collection.tagline}"
            </p>
          </div>
        </div>

        <div className="px-7 py-7 flex flex-col gap-4" style={{ backgroundColor: '#F7F4EF' }}>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[9px] tracking-[0.24em] uppercase text-[#a08c6a] block mb-2" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                {collection.highlight}
              </span>
              <h3 className="text-[1.6rem] text-black leading-tight" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
                {collection.name}
              </h3>
            </div>
            <div className="flex gap-1.5 pt-1">
              {collection.palette.map((hex) => (
                <span key={hex} className="w-4 h-4 rounded-full border border-white/80 shadow-sm shrink-0" style={{ backgroundColor: hex }} />
              ))}
            </div>
          </div>
          <p className="text-[12px] text-neutral-500 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
            {collection.description}
          </p>
          <DiscoverButton onClick={() => navigate('/new-arrivals')} />
        </div>
      </div>
    </Reveal>
  )
}

function WideCard({ collection, reverse = false }: { collection: (typeof COLLECTIONS)[0]; reverse?: boolean }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  return (
    <Reveal>
      <div className={`relative overflow-hidden rounded-2xl flex flex-col md:flex-row ${reverse ? 'md:flex-row-reverse' : ''}`} style={{ minHeight: '340px' }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <div className="md:w-1/2 h-[260px] md:h-auto relative overflow-hidden">
          <ImageWithFallback src={collection.image} alt={collection.name} className="w-full h-full object-cover transition-transform duration-700 ease-out" style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)' }} />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/20 to-transparent" />
          <div className="absolute bottom-5 left-5">
            <span className="px-3 py-1 bg-white/85 backdrop-blur-sm rounded-full text-[9px] tracking-[0.18em] uppercase text-neutral-500" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              {collection.pieces}
            </span>
          </div>
        </div>

        <div className="md:w-1/2 flex flex-col justify-center px-10 py-10 md:py-14 md:px-14" style={{ backgroundColor: '#F2EDE6' }}>
          <span className="text-[9px] tracking-[0.28em] uppercase text-[#a08c6a] mb-4 block" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
            {collection.highlight}
          </span>
          <h3 className="text-[2rem] text-black leading-tight mb-3" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
            {collection.name}
          </h3>
          <p className="text-[13px] italic text-neutral-500 mb-5 leading-snug" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
            "{collection.tagline}"
          </p>
          <p className="text-[12px] text-neutral-400 leading-relaxed mb-8 max-w-sm" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
            {collection.description}
          </p>
          <div className="flex items-center gap-2 mb-8">
            {collection.palette.map((hex) => (
              <span key={hex} className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: hex }} />
            ))}
          </div>
          <DiscoverButton onClick={() => navigate('/new-arrivals')} />
        </div>
      </div>
    </Reveal>
  )
}

export function CollectionsPage() {
  const navigate = useNavigate()
  const [tryOnOpen, setTryOnOpen] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const heroCollection = COLLECTIONS[0]
  const panelCollections = COLLECTIONS.slice(1, 3)
  const wideCollections = COLLECTIONS.slice(3)

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />

      {!bannerDismissed && (
        <div className="fixed top-[72px] left-0 right-0 z-40" style={{ backgroundColor: '#2C2218' }}>
          <div className="max-w-[1440px] mx-auto px-8 md:px-16 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 justify-center">
              <Sparkles size={13} className="text-[#c8b898] shrink-0" />
              <p className="text-[11px] tracking-[0.08em] text-white/80 text-center" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
                Not sure what fits your space?{' '}
                <button onClick={() => setTryOnOpen(true)} className="text-[#c8b898] hover:text-white transition-colors underline underline-offset-2" style={{ fontWeight: 500 }}>
                  Use our AI Room Planner
                </button>{' '}
                to find your perfect style.
              </p>
            </div>
            <button onClick={() => setBannerDismissed(true)} className="text-white/30 hover:text-white/70 transition-colors shrink-0 text-[18px] leading-none" aria-label="Dismiss banner">
              ×
            </button>
          </div>
        </div>
      )}

      <div style={{ paddingTop: bannerDismissed ? '72px' : '116px' }} />

      <section className="max-w-[1440px] mx-auto px-8 md:px-16 pt-16 pb-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-[10px] tracking-[0.28em] uppercase text-[#a08c6a] block mb-4" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              Livaxis — 2026 Edit
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08 }} className="text-[clamp(2.4rem,6vw,4.5rem)] text-black leading-[1.0]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
              Collections
            </motion.h1>
          </div>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.18 }} className="text-[13px] text-neutral-400 max-w-xs md:text-right leading-relaxed" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
            Five curated worlds. Each a complete vision for how your home can feel — and every piece ready for AI visualization before it arrives.
          </motion.p>
        </div>

        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }} style={{ transformOrigin: 'left' }} className="mt-10 h-px bg-gradient-to-r from-black/10 via-black/5 to-transparent" />
      </section>

      <main className="max-w-[1440px] mx-auto px-8 md:px-16 space-y-8 pb-24">
        <HeroCard collection={heroCollection} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {panelCollections.map((col, i) => (
            <PanelCard key={col.id} collection={col} index={i} />
          ))}
        </div>

        <div className="space-y-8">
          {wideCollections.map((col, i) => (
            <WideCard key={col.id} collection={col} reverse={i % 2 === 1} />
          ))}
        </div>
      </main>

      <section className="relative overflow-hidden" style={{ backgroundColor: '#1C1611' }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundSize: '128px' }} />
        <div className="relative max-w-[1440px] mx-auto px-8 md:px-16 py-24 text-center">
          <Reveal>
            <span className="text-[10px] tracking-[0.28em] uppercase text-[#c8b898]/60 block mb-5" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              The Livaxis Experience
            </span>
            <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] text-white leading-[1.1] mb-6 max-w-2xl mx-auto" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
              Every collection, visualized in your space before you commit.
            </h2>
            <p className="text-[13px] text-white/40 max-w-lg mx-auto leading-relaxed mb-12" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
              Powered by Gemini AI, the Livaxis Room Planner places any piece from any collection into your own photo — with precise lighting, scale, and shadow simulation.
            </p>
            <button onClick={() => setTryOnOpen(true)} className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full border border-[#c8b898]/30 hover:border-[#c8b898]/70 hover:bg-[#c8b898]/5 transition-all duration-300" style={{ fontFamily: "'Inter', sans-serif" }}>
              <Sparkles size={14} className="text-[#c8b898]" />
              <span className="text-[11px] tracking-[0.2em] uppercase text-[#c8b898]" style={{ fontWeight: 500 }}>
                Open AI Room Planner
              </span>
              <ChevronRight size={13} className="text-[#c8b898]/60" />
            </button>
          </Reveal>
        </div>
      </section>

      <div className="bg-[#FAF8F5] border-t border-black/5 py-5">
        <div className="max-w-[1440px] mx-auto px-8 md:px-16 flex items-center gap-2">
          <button onClick={() => navigate('/')} className="text-[11px] tracking-[0.1em] text-neutral-400 hover:text-black transition-colors" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
            Home
          </button>
          <span className="text-neutral-300 text-[11px]">/</span>
          <span className="text-[11px] tracking-[0.1em] text-neutral-600" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
            Collections
          </span>
        </div>
      </div>

      <Footer />

      <AITryOnOverlay isOpen={tryOnOpen} onClose={() => setTryOnOpen(false)} productName="your selected piece" />
    </div>
  )
}

export default CollectionsPage
