import { useState, useRef, type ReactNode } from 'react'
import { motion, useInView, AnimatePresence } from 'motion/react'
import { Sparkles, ArrowRight, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Footer } from './Hompage'
import { Header } from '../components/Header'
import { useLanguage } from '../contexts/LanguageContext'

type CollectionItem = {
  id: string
  name: string
  tagline: string
  description: string
  pieces: string
  highlight: string
  image: string
  palette: string[]
  layout: string
  numLabel: string
}

/* ─── Small helpers (kept local to match Discovery style) ─── */
function ImageWithFallback({ src, alt, className, style }: { src: string; alt: string; className?: string; style?: any }) {
  const [failed, setFailed] = useState(false)
  const { t } = useLanguage()

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#f7f5f2] text-center text-sm text-[#8f7b5f]">
        {t('common.imageUnavailable')}
      </div>
    )
  }
  return <img src={src} alt={alt} className={className} style={style} onError={() => setFailed(true)} loading="lazy" />
}

function AITryOnOverlay({ isOpen, onClose, productName }: { isOpen: boolean; onClose: () => void; productName?: string }) {
  const { t } = useLanguage()

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
                {t('common.aiTryOn')}
              </div>
              <h3 className="text-3xl text-[#1d1814]" style={{ fontFamily: 'Playfair Display, serif' }}>
                {productName || t('discovery.selectedItem')}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#74685a]">{t('discovery.tryOnPreviewText')}</p>
            </div>
            <div className="flex items-center justify-between gap-4 px-7 py-5">
              <button onClick={onClose} className="rounded-full border border-black/15 px-5 py-2 text-[11px] uppercase tracking-[0.16em] text-neutral-600">
                {t('common.close')}
              </button>
              <button onClick={onClose} className="inline-flex items-center gap-2 rounded-full bg-[#171412] px-5 py-2 text-[11px] uppercase tracking-[0.16em] text-white">
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
  const { t } = useLanguage()

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
        {t('collections.discoverCollection')}
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
function HeroCard({ collection }: { collection: CollectionItem }) {
  const navigate = useNavigate()
  return (
    <Reveal>
      <div className="relative w-full overflow-hidden rounded-2xl flex flex-col">
        <div className="relative h-[320px] w-full overflow-hidden">
          <ImageWithFallback src={collection.image} alt={collection.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-[10px] uppercase tracking-[0.18em] text-neutral-600 backdrop-blur-md" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              {collection.pieces}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-10" style={{ backgroundColor: '#F7F4EF' }}>
          <span className="mb-4 block text-[10px] uppercase tracking-[0.28em] text-[#a08c6a]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
            {collection.numLabel}
          </span>
          <h2 className="mb-4 text-[2.4rem] leading-[1.1] text-black" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
            {collection.name}
          </h2>
          <p className="mb-5 text-[16px] italic leading-snug text-neutral-500" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
            "{collection.tagline}"
          </p>
          <p className="mb-8 text-[13px] leading-relaxed text-neutral-500" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
            {collection.description}
          </p>
          <div className="mb-8 flex items-center gap-2">
            {collection.palette.map((hex) => (
              <span key={hex} className="h-5 w-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: hex }} />
            ))}
            <span className="ml-2 text-[10px] uppercase tracking-[0.12em] text-neutral-400" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
              {collection.highlight}
            </span>
          </div>
          <DiscoverButton onClick={() => navigate('/new-arrivals')} />
        </div>
      </div>
    </Reveal>
  )
}

function PanelCard({ collection, index }: { collection: CollectionItem; index: number }) {
  const navigate = useNavigate()
  return (
    <Reveal delay={index * 0.12}>
      <div className="relative flex cursor-pointer flex-col overflow-hidden rounded-2xl">
        <div className="relative h-[280px] w-full overflow-hidden">
          <ImageWithFallback src={collection.image} alt={collection.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute left-5 top-5">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-neutral-500 backdrop-blur-sm" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              {collection.pieces}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
            <p className="mb-1 text-[12px] italic text-white/70" style={{ fontFamily: "'Playfair Display', serif" }}>
              "{collection.tagline}"
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-6 py-8" style={{ backgroundColor: '#F7F4EF' }}>
          <div className="flex items-start justify-between">
            <div>
              <span className="mb-2 block text-[9px] uppercase tracking-[0.24em] text-[#a08c6a]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                {collection.highlight}
              </span>
              <h3 className="text-[1.8rem] leading-tight text-black" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
                {collection.name}
              </h3>
            </div>
            <div className="flex gap-1.5 pt-1">
              {collection.palette.map((hex) => (
                <span key={hex} className="h-4 w-4 shrink-0 rounded-full border border-white/80 shadow-sm" style={{ backgroundColor: hex }} />
              ))}
            </div>
          </div>
          <p className="text-[12px] leading-relaxed text-neutral-500" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
            {collection.description}
          </p>
          <DiscoverButton onClick={() => navigate('/new-arrivals')} />
        </div>
      </div>
    </Reveal>
  )
}

function WideCard({ collection, reverse = false }: { collection: CollectionItem; reverse?: boolean }) {
  const navigate = useNavigate()
  return (
    <Reveal>
      <div className="relative flex flex-col overflow-hidden rounded-2xl">
        <div className="relative h-[260px] w-full overflow-hidden">
          <ImageWithFallback src={collection.image} alt={collection.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute bottom-5 left-5">
            <span className="rounded-full bg-white/85 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-neutral-500 backdrop-blur-sm" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              {collection.pieces}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-10" style={{ backgroundColor: '#F2EDE6' }}>
          <span className="mb-4 block text-[9px] uppercase tracking-[0.28em] text-[#a08c6a]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
            {collection.highlight}
          </span>
          <h3 className="mb-3 text-[2.2rem] leading-tight text-black" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
            {collection.name}
          </h3>
          <p className="mb-5 text-[13px] italic leading-snug text-neutral-500" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
            "{collection.tagline}"
          </p>
          <p className="mb-8 text-[12px] leading-relaxed text-neutral-400" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
            {collection.description}
          </p>
          <div className="mb-8 flex items-center gap-2">
            {collection.palette.map((hex) => (
              <span key={hex} className="h-4 w-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: hex }} />
            ))}
          </div>
          <DiscoverButton onClick={() => navigate('/new-arrivals')} />
        </div>
      </div>
    </Reveal>
  )
}

export function CollectionsMobile() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [tryOnOpen, setTryOnOpen] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const COLLECTIONS: CollectionItem[] = [
    {
      id: 'living-room',
      name: t('collections.livingRoomTitle'),
      tagline: t('collections.livingRoomTagline'),
      description: t('collections.livingRoomDesc'),
      pieces: t('collections.piecesLabel').replace('{count}', '42'),
      highlight: t('collections.livingRoomHighlight'),
      image: 'https://images.unsplash.com/photo-1710367847994-7b456c7aa507?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      palette: ['#E8E0D4', '#C4A882', '#6B5B45'],
      layout: 'hero',
      numLabel: t('collections.collectionNo').replace('{num}', '01')
    },
    {
      id: 'dining-room',
      name: t('collections.diningRoomTitle'),
      tagline: t('collections.diningRoomTagline'),
      description: t('collections.diningRoomDesc'),
      pieces: t('collections.piecesLabel').replace('{count}', '28'),
      highlight: t('collections.diningRoomHighlight'),
      image: 'https://images.unsplash.com/photo-1695369646578-4b6d5fa04987?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      palette: ['#EDE6DC', '#B89A72', '#3D2E1E'],
      layout: 'panel',
      numLabel: t('collections.collectionNo').replace('{num}', '02')
    },
    {
      id: 'bedroom',
      name: t('collections.bedroomTitle'),
      tagline: t('collections.bedroomTagline'),
      description: t('collections.bedroomDesc'),
      pieces: t('collections.piecesLabel').replace('{count}', '35'),
      highlight: t('collections.bedroomHighlight'),
      image: 'https://images.unsplash.com/photo-1528908929486-dfaa209c6986?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      palette: ['#EDE8E2', '#C2A98A', '#5A4A38'],
      layout: 'panel',
      numLabel: t('collections.collectionNo').replace('{num}', '03')
    },
    {
      id: 'study',
      name: t('collections.studyTitle'),
      tagline: t('collections.studyTagline'),
      description: t('collections.studyDesc'),
      pieces: t('collections.piecesLabel').replace('{count}', '19'),
      highlight: t('collections.studyHighlight'),
      image: 'https://images.unsplash.com/photo-1651602855717-9f79c72893cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      palette: ['#E4DDD4', '#9C8060', '#2E2416'],
      layout: 'wide',
      numLabel: t('collections.collectionNo').replace('{num}', '04')
    },
    {
      id: 'outdoor',
      name: t('collections.outdoorTitle'),
      tagline: t('collections.outdoorTagline'),
      description: t('collections.outdoorDesc'),
      pieces: t('collections.piecesLabel').replace('{count}', '24'),
      highlight: t('collections.outdoorHighlight'),
      image: 'https://images.unsplash.com/photo-1614635893671-57d37f636bac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      palette: ['#E6E0D8', '#B09070', '#4A3C2C'],
      layout: 'wide',
      numLabel: t('collections.collectionNo').replace('{num}', '05')
    },
  ]

  const heroCollection = COLLECTIONS[0]
  const panelCollections = COLLECTIONS.slice(1, 3)
  const wideCollections = COLLECTIONS.slice(3)

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />

      {!bannerDismissed && (
        <div className="fixed top-[72px] left-0 right-0 z-40" style={{ backgroundColor: '#2C2218' }}>
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3">
            <div className="flex items-center gap-3 flex-1 justify-center">
              <Sparkles size={13} className="text-[#c8b898] shrink-0" />
              <p className="text-[11px] tracking-[0.08em] text-white/80 text-center" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
                {t('collections.notSureWhatFits')}{' '}
                <button onClick={() => setTryOnOpen(true)} className="text-[#c8b898] hover:text-white transition-colors underline underline-offset-2" style={{ fontWeight: 500 }}>
                  {t('collections.usePlanner')}
                </button>{' '}
                {t('collections.toFindPerfectStyle')}
              </p>
            </div>
            <button onClick={() => setBannerDismissed(true)} className="text-white/30 hover:text-white/70 transition-colors shrink-0 text-[18px] leading-none" aria-label="Dismiss banner">
              ×
            </button>
          </div>
        </div>
      )}

      <div style={{ paddingTop: bannerDismissed ? '72px' : '116px' }} />

      <section className="mx-auto max-w-[1440px] px-5 pb-10 pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-[10px] tracking-[0.28em] uppercase text-[#a08c6a] block mb-4" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              {t('collections.curatedSeason')}
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08 }} className="text-[clamp(2.4rem,6vw,4.5rem)] text-black leading-[1.0]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
              {t('collections.title')}
            </motion.h1>
          </div>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.18 }} className="text-[13px] text-neutral-400 max-w-xs md:text-right leading-relaxed" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
            {t('collections.subtitle')}
          </motion.p>
        </div>

        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }} style={{ transformOrigin: 'left' }} className="mt-10 h-px bg-gradient-to-r from-black/10 via-black/5 to-transparent" />
      </section>

      <main className="mx-auto max-w-[1440px] space-y-6 px-5 pb-20">
        <HeroCard collection={heroCollection} />

        <div className="grid grid-cols-1 gap-6">
          {panelCollections.map((col, i) => (
            <PanelCard key={col.id} collection={col} index={i} />
          ))}
        </div>

        <div className="space-y-6">
          {wideCollections.map((col, i) => (
            <WideCard key={col.id} collection={col} reverse={i % 2 === 1} />
          ))}
        </div>
      </main>

      <section className="relative overflow-hidden" style={{ backgroundColor: '#1C1611' }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundSize: '128px' }} />
        <div className="relative mx-auto max-w-[1440px] px-5 py-16 text-center">
          <Reveal>
            <span className="text-[10px] tracking-[0.28em] uppercase text-[#c8b898]/60 block mb-5" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              {t('collections.experienceTitle')}
            </span>
            <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] text-white leading-[1.1] mb-6 max-w-2xl mx-auto" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}>
              {t('collections.experienceSubtitle')}
            </h2>
            <p className="text-[13px] text-white/40 max-w-lg mx-auto leading-relaxed mb-12" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
              {t('collections.experienceDesc')}
            </p>
            <button onClick={() => setTryOnOpen(true)} className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full border border-[#c8b898]/30 hover:border-[#c8b898]/70 hover:bg-[#c8b898]/5 transition-all duration-300" style={{ fontFamily: "'Inter', sans-serif" }}>
              <Sparkles size={14} className="text-[#c8b898]" />
              <span className="text-[11px] tracking-[0.2em] uppercase text-[#c8b898]" style={{ fontWeight: 500 }}>
                {t('collections.openRoomPlanner')}
              </span>
              <ChevronRight size={13} className="text-[#c8b898]/60" />
            </button>
          </Reveal>
        </div>
      </section>

      <div className="bg-[#FAF8F5] border-t border-black/5 py-5">
        <div className="max-w-[1440px] mx-auto px-8 md:px-16 flex items-center gap-2">
          <button onClick={() => navigate('/')} className="text-[11px] tracking-[0.1em] text-neutral-400 hover:text-black transition-colors" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
            {t('common.home')}
          </button>
          <span className="text-neutral-300 text-[11px]">/</span>
          <span className="text-[11px] tracking-[0.1em] text-neutral-600" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
            {t('collections.title')}
          </span>
        </div>
      </div>

      <Footer />

      <AITryOnOverlay isOpen={tryOnOpen} onClose={() => setTryOnOpen(false)} productName={t('discovery.selectedItem')} />
    </div>
  )
}


