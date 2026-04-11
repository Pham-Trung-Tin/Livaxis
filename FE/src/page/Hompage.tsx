import { motion, AnimatePresence } from 'motion/react'
import {
  ChevronRight,
  Heart,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  User,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const featuredPieces = [
  {
    title: 'Moss Velvet Chair',
    category: 'Lounge chair',
    price: '$340',
    tone: 'from-emerald-100 via-emerald-200 to-emerald-300',
  },
  {
    title: 'Linen Curve Sofa',
    category: 'Seating',
    price: '$980',
    tone: 'from-amber-100 via-amber-200 to-amber-300',
  },
  {
    title: 'Oak Dining Set',
    category: 'Dining',
    price: '$1,240',
    tone: 'from-stone-100 via-stone-200 to-stone-300',
  },
  {
    title: 'Column Floor Lamp',
    category: 'Lighting',
    price: '$180',
    tone: 'from-neutral-100 via-neutral-200 to-neutral-300',
  },
  {
    title: 'Canyon Side Table',
    category: 'Accent',
    price: '$210',
    tone: 'from-orange-100 via-orange-200 to-orange-300',
  },
  {
    title: 'Shelved Display',
    category: 'Storage',
    price: '$690',
    tone: 'from-zinc-100 via-zinc-200 to-zinc-300',
  },
]

const steps = [
  {
    title: 'Snap Your Space',
    text: 'Upload a room photo and capture the layout in seconds.',
  },
  {
    title: 'Browse Matches',
    text: 'Try curated furniture pieces that fit the same visual language.',
  },
  {
    title: 'Finalize & Purchase',
    text: 'Preview the room, save the look, and move to checkout.',
  },
]

export function Header() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const navLinks = [
    { label: 'New Arrivals', href: '/new-arrivals' },
    { label: 'Collections', href: '/collections' },
    { label: 'Subscription', href: '/subscription' },
  ]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6 md:px-10 lg:px-16">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1"
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          <span className="text-[22px] font-semibold tracking-[0.08em]">LIVAXIS</span>
        </button>

        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                if (!link.href.startsWith('#')) {
                  e.preventDefault()
                  navigate(link.href)
                }
              }}
              className="relative text-[13px] uppercase tracking-[0.12em] text-neutral-600 transition-colors duration-300 hover:text-black"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
              onMouseEnter={() => setHoveredLink(link.label)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {link.label}
              <span
                className={`absolute -bottom-1 left-0 h-px bg-black transition-all duration-300 ${
                  hoveredLink === link.label ? 'w-full' : 'w-0'
                }`}
              />
            </a>
          ))}
          <a
            href="/ai-room-planner"
            onClick={(e) => {
              e.preventDefault()
              navigate('/ai-room-planner')
            }}
            className="flex items-center gap-2 rounded-full border border-[#c8b898]/40 px-4 py-1.5 text-[13px] uppercase tracking-[0.12em] text-[#8a7456] transition-colors duration-300 hover:border-[#c8b898] hover:bg-[#c8b898]/5"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            <Sparkles size={14} />
            AI Room Planner
          </a>
        </nav>

        <div className="flex items-center gap-6">
          <button className="text-neutral-500 transition-colors duration-300 hover:text-black">
            <Search size={19} strokeWidth={1.5} />
          </button>

          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen((value) => !value)}
              className={`transition-colors duration-300 ${userMenuOpen ? 'text-black' : 'text-neutral-500 hover:text-black'}`}
              aria-label="Account menu"
              aria-expanded={userMenuOpen}
            >
              <User size={19} strokeWidth={1.5} />
            </button>

            <AnimatePresence>
              {userMenuOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute right-0 top-[calc(100%+14px)] w-[280px] overflow-hidden rounded-2xl bg-white"
                  style={{
                    boxShadow:
                      '0 8px 40px rgba(0,0,0,0.10), 0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    className="px-6 pb-5 pt-6"
                    style={{ background: 'linear-gradient(135deg, #faf9f7 0%, #f5f1eb 100%)' }}
                  >
                    <div
                      className="mb-4 h-px w-8"
                      style={{ background: 'linear-gradient(90deg, #c8b898, transparent)' }}
                    />
                    <p
                      className="mb-1 text-[22px] leading-tight text-black"
                      style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
                    >
                      Welcome
                    </p>
                    <p
                      className="text-[12px] leading-snug text-neutral-400"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
                    >
                      Sign in for a personalised experience
                    </p>
                  </div>

                  <div className="space-y-2.5 px-5 pb-3 pt-4">
                    <button
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] py-3 text-white transition-all duration-300 hover:bg-black"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      onClick={() => {
                        setUserMenuOpen(false)
                        navigate('/sign-in')
                      }}
                    >
                      <span className="text-[11px] uppercase tracking-[0.22em]" style={{ fontWeight: 600 }}>
                        Sign In
                      </span>
                      <ChevronRight
                        size={13}
                        className="opacity-50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                      />
                    </button>

                    <div className="flex items-center gap-3 py-0.5">
                      <div className="h-px flex-1 bg-neutral-100" />
                      <span
                        className="text-[10px] uppercase tracking-[0.1em] text-neutral-300"
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                      >
                        or
                      </span>
                      <div className="h-px flex-1 bg-neutral-100" />
                    </div>

                    <button
                      className="group flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-150 py-2.5 transition-all duration-300 hover:border-[#c8b898]/40 hover:bg-[#f8f5f0]"
                      style={{ fontFamily: 'Inter, sans-serif', borderColor: 'rgba(0,0,0,0.07)' }}
                      onClick={() => {
                        setUserMenuOpen(false)
                        navigate('/sign-up')
                      }}
                    >
                      <span
                        className="text-[11px] uppercase tracking-[0.15em] text-neutral-600 transition-colors group-hover:text-neutral-800"
                        style={{ fontWeight: 500 }}
                      >
                        Create Account
                      </span>
                    </button>
                  </div>

                  <div className="mx-5 h-px bg-neutral-100" />

                  <div className="px-3 py-3">
                    {[
                      { icon: Heart, label: 'Saved Pieces', sub: 'Your wishlist' },
                      { icon: Package, label: 'Order History', sub: 'Track & manage' },
                      { icon: Settings, label: 'Preferences', sub: 'Room style profile' },
                    ].map(({ icon: Icon, label, sub }) => (
                      <button
                        key={label}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 hover:bg-[#f8f5f0]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50 transition-all duration-200 group-hover:border-[#c8b898]/30 group-hover:bg-[#fdf9f5]">
                          <Icon
                            size={14}
                            className="text-neutral-400 transition-colors duration-200 group-hover:text-[#a08c6a]"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-[12px] text-neutral-700 transition-colors group-hover:text-black"
                            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                          >
                            {label}
                          </p>
                          <p
                            className="truncate text-[10px] text-neutral-400"
                            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
                          >
                            {sub}
                          </p>
                        </div>
                        <ChevronRight size={12} className="shrink-0 text-neutral-200 transition-colors group-hover:text-neutral-400" />
                      </button>
                    ))}
                  </div>

                  <div
                    className="mx-3 mb-3 flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(200,184,152,0.10) 0%, rgba(200,184,152,0.05) 100%)',
                      border: '1px solid rgba(200,184,152,0.20)',
                    }}
                    onClick={() => {
                      setUserMenuOpen(false)
                      navigate('/ai-room-planner')
                    }}
                  >
                    <Sparkles size={14} className="shrink-0 text-[#a08c6a]" />
                    <div>
                      <p className="text-[11px] text-[#6b5d45]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                        Try AI Room Planner
                      </p>
                      <p className="text-[10px] text-[#a08c6a]/70" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                        Visualise furniture in your space
                      </p>
                    </div>
                    <ChevronRight size={11} className="ml-auto text-[#c8b898]/50 transition-colors group-hover:text-[#c8b898]" />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <button
            onClick={() => navigate('/cart')}
            className="relative text-neutral-500 transition-colors duration-300 hover:text-black"
          >
            <ShoppingBag size={19} strokeWidth={1.5} />
            <span
              className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] text-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              2
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white py-16">
      <div className="mx-auto max-w-[1440px] px-8 md:px-16">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <span
              className="mb-4 block text-[20px] tracking-[0.08em] text-black"
              style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}
            >
              LIVAXIS
            </span>
            <p
              className="max-w-[240px] text-[13px] leading-relaxed text-neutral-400"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
            >
              Redefining luxury interiors with AI-powered visualization. See it before you buy it.
            </p>
          </div>

          {[
            {
              title: 'Shop',
              links: ['New Arrivals', 'Collections', 'Best Sellers', 'AI Room Planner'],
            },
            {
              title: 'About',
              links: ['Our Story', 'Sustainability', 'Craftsmanship', 'Press'],
            },
            {
              title: 'Support',
              links: ['Contact Us', 'Shipping', 'Returns', 'FAQ'],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4
                className="mb-5 text-[11px] uppercase tracking-[0.2em] text-black"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[13px] text-neutral-400 transition-colors duration-300 hover:text-black"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-8 md:flex-row">
          <span className="text-[12px] text-neutral-300" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
            &copy; 2026 Livaxis. All rights reserved.
          </span>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[12px] text-neutral-300 transition-colors duration-300 hover:text-neutral-500"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function BeforeAfterShowcase() {
  const [split, setSplit] = useState(50)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateSplit = (clientX: number) => {
    if (!containerRef.current) {
      return
    }

    const bounds = containerRef.current.getBoundingClientRect()
    const rawSplit = ((clientX - bounds.left) / bounds.width) * 100
    const limitedSplit = Math.min(90, Math.max(10, rawSplit))
    setSplit(limitedSplit)
  }

  useEffect(() => {
    if (!dragging) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      updateSplit(event.clientX)
    }

    const handlePointerUp = () => {
      setDragging(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragging])

  return (
    <div
      ref={containerRef}
      onPointerDown={(event) => {
        setDragging(true)
        updateSplit(event.clientX)
      }}
      className="relative min-h-[360px] select-none overflow-hidden rounded-[28px] border border-black/5 bg-[#ebe3d7] p-4 shadow-[0_24px_80px_rgba(28,22,16,0.12)]"
      style={{ touchAction: 'none' }}
    >
      <div className="relative h-full min-h-[320px] overflow-hidden rounded-[24px] bg-[linear-gradient(155deg,#efe3d2_0%,#cdb79a_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(255,255,255,0.72),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.2),transparent_45%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-[linear-gradient(180deg,transparent,rgba(67,50,35,0.28))]" />

        <div className="absolute bottom-8 right-6 rounded-full border border-white/40 bg-white/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#5d4a39] backdrop-blur-sm">
          after
        </div>

        <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${split}%` }}>
          <div className="relative h-full min-h-[320px] w-[1200px] max-w-none bg-[linear-gradient(155deg,#f7f0e4_0%,#d8c8b1_100%)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.75),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.25),transparent_45%)]" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(61,44,28,0.18))]" />
          </div>
        </div>

        <div className="absolute bottom-8 left-6 rounded-full border border-white/40 bg-white/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#5d4a39] backdrop-blur-sm">
          before
        </div>

        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${split}%`, transform: 'translateX(-50%)' }}>
          <div className="h-full w-px bg-white/70 shadow-[0_0_0_1px_rgba(0,0,0,0.03)]" />
        </div>

        <button
          type="button"
          aria-label="Drag to compare before and after"
          className="absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#8a7456] shadow-lg shadow-black/10"
          style={{ left: `${split}%`, transform: 'translate(-50%, -50%)' }}
        >
          <ChevronRight size={18} className="-rotate-90" />
        </button>
      </div>
    </div>
  )
}

function Hompage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#fbf7f1_52%,#f4efe6_100%)] text-[#141311]">
      <Header />

      <main className="pt-[72px]">
        <section className="relative overflow-hidden px-6 pb-16 pt-16 sm:px-10 lg:px-16 lg:pb-24 lg:pt-20">
          <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top,rgba(200,184,152,0.22),transparent_50%)]" />
          <div className="mx-auto max-w-7xl text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-[11px] uppercase tracking-[0.36em] text-[#a08c6a]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              AI room visualiser
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="mt-5 text-5xl leading-[0.95] tracking-[-0.04em] text-[#1d1814] sm:text-6xl lg:text-[5.25rem]"
              style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}
            >
              See It In Your Space
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="mx-auto mt-5 max-w-2xl text-sm text-[#7b7368] sm:text-base"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Visualise furniture in your room before you buy. A calm, editorial shopping experience built for modern interiors.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mx-auto mt-10 max-w-5xl"
            >
              <BeforeAfterShowcase />
            </motion.div>

            <div className="mt-8 flex justify-center">
              <button className="group inline-flex items-center gap-2 rounded-full bg-[#161311] px-6 py-3 text-[11px] uppercase tracking-[0.24em] text-white shadow-[0_18px_40px_rgba(20,17,14,0.18)] transition-transform duration-300 hover:-translate-y-0.5">
                Start your room scan
                <ChevronRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </section>

        <section className="px-6 pb-16 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-[0.36em] text-[#a08c6a]">Curated pieces</p>
              <h2 className="mt-4 text-3xl tracking-[-0.03em] text-[#1d1814] sm:text-4xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                Try On Any Piece
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-[#746b60] sm:text-base">
                Browse furniture cards that feel editorial and tactile, with a clean visual hierarchy that keeps the focus on the product.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {featuredPieces.map((piece) => (
                <motion.article
                  key={piece.title}
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                  className="overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-[0_18px_50px_rgba(20,17,14,0.08)]"
                >
                  <div className={`relative h-72 bg-gradient-to-br ${piece.tone}`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.75),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.22),transparent_45%)]" />
                    <div className="absolute left-4 top-4 rounded-full bg-white/70 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#6f5f4a] backdrop-blur-sm">
                      {piece.category}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(31,24,16,0.18))]" />
                    <div className="absolute bottom-4 left-4 right-4 rounded-[18px] bg-white/65 p-3 backdrop-blur-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-[#1f1a16]">{piece.title}</p>
                          <p className="text-xs text-[#7b7368]">{piece.category}</p>
                        </div>
                        <span className="rounded-full bg-[#161311] px-3 py-1 text-[11px] text-white">{piece.price}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4 text-sm text-[#6f655a]">
                    <span>Preview in room</span>
                    <button className="inline-flex items-center gap-1 text-[#8a7456] transition-transform duration-200 hover:translate-x-0.5">
                      Open
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-20 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl rounded-[32px] border border-black/5 bg-white/75 px-6 py-12 shadow-[0_24px_80px_rgba(20,17,14,0.06)] backdrop-blur-sm lg:px-10 lg:py-14">
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-[0.36em] text-[#a08c6a]">How it works</p>
              <h2 className="mt-4 text-3xl tracking-[-0.03em] text-[#1d1814] sm:text-4xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                Three Steps to Your Dream Room
              </h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-[24px] border border-black/5 bg-[#fbf8f2] p-6 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#161311] text-sm text-white">
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-xl text-[#1d1814]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm text-[#746b60]">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Hompage