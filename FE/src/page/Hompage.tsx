import { motion, AnimatePresence } from 'motion/react'
import {
  Camera,
  ChevronDown,
  ChevronRight,
  Heart,
  LogOut,
  Package,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  User,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth-context'
import { useCart } from '../contexts/cart-context'
import { getFeaturedProducts } from '../services/productApi'
import type { NewArrivalProduct } from '../services/productApi'
import heroAfterImage from '../assets/hero-after.png'
import heroBeforeImage from '../assets/hero-before.png'

// Explainer content for the "How it works" section.
const steps = [
  {
    icon: Camera,
    number: '01',
    title: 'Snap Your Space',
    text: 'Take a photo of your empty room corner. Any angle, any lighting - Gemini adapts.',
  },
  {
    icon: Sparkles,
    number: '02',
    title: 'Browse Matches',
    text: "Gemini processes your space and lists integration styles: 'Integrate into Corner', 'Center Placement', and more.",
  },
  {
    icon: ShoppingCart,
    number: '03',
    title: 'Finalize & Purchase',
    text: 'Confirm the perfect fit, adjust finishes and fabrics, then add directly to your cart.',
  },
]

// Global top navigation with account dropdown actions.
export function Header() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, loading: authLoading, logout } = useAuth()
  const { itemCount } = useCart()

  const navLinks = [
    { label: 'Discovery', href: '/discovery' },
    { label: 'Collections', href: '/collections' },
    { label: 'Subscription', href: '/subscription' },
  ]

  // Close the account dropdown when clicking outside.
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

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : 'U'

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    navigate('/sign-in')
  }

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
              aria-label={user ? `Account menu for ${user.name}` : 'Account menu'}
              aria-expanded={userMenuOpen}
            >
              {authLoading ? (
                <span className="inline-flex h-[19px] w-[19px] animate-pulse rounded-full bg-neutral-200" />
              ) : user ? (
                <span className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-[#f3ede3] text-[11px] font-semibold text-[#6f5a41] overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      userInitials
                    )}
                  </span>
                  <span className="hidden max-w-[130px] truncate text-[13px] text-black md:inline">{user.name}</span>
                  <ChevronDown size={13} className="hidden text-neutral-400 md:inline" />
                </span>
              ) : (
                <User size={19} strokeWidth={1.5} />
              )}
            </button>

            <AnimatePresence>
              {userMenuOpen ? (
                // Animated account menu for authenticated and guest states.
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
                  {user ? (
                    <>
                      {/* Signed-in menu content */}
                      <div
                        className="px-6 pb-5 pt-6"
                        style={{ background: 'linear-gradient(135deg, #faf9f7 0%, #f5f1eb 100%)' }}
                      >
                        <button
                          type="button"
                          className="flex w-full items-start gap-4 text-left transition-opacity duration-200 hover:opacity-80"
                          onClick={() => {
                            setUserMenuOpen(false)
                            navigate('/profile')
                          }}
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-[14px] font-semibold text-white overflow-hidden">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                              userInitials
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="mb-1 text-[22px] leading-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
                              {user.name}
                            </p>
                            <p className="truncate text-[12px] leading-snug text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                              {user.email}
                            </p>
                          </div>
                        </button>
                      </div>

                      <div className="space-y-2 px-3 py-3">
                        {[
                          { icon: User, label: 'Profile', sub: 'Personal information', href: '/profile' },
                          { icon: Heart, label: 'Saved Pieces', sub: 'Your wishlist' },
                          { icon: Package, label: 'Order History', sub: 'Track & manage' },
                          { icon: Settings, label: 'Settings', sub: 'Account preferences' },
                        ].map(({ icon: Icon, label, sub, href }) => (
                          <button
                            key={label}
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 hover:bg-[#f8f5f0]"
                            onClick={() => {
                              setUserMenuOpen(false)
                              if (href) {
                                navigate(href)
                              }
                            }}
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

                        <button
                          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 hover:bg-red-50"
                          onClick={() => {
                            void handleLogout()
                          }}
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-100 bg-red-50 transition-all duration-200 group-hover:border-red-200 group-hover:bg-red-100/60">
                            <LogOut
                              size={14}
                              className="text-red-400 transition-colors duration-200 group-hover:text-red-600"
                              strokeWidth={1.5}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate text-[12px] text-red-500 transition-colors group-hover:text-red-700"
                              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                            >
                              Logout
                            </p>
                            <p
                              className="truncate text-[10px] text-red-300"
                              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
                            >
                              End this session
                            </p>
                          </div>
                        </button>
                      </div>

                      <div className="mx-5 h-px bg-neutral-100" />

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
                    </>
                  ) : (
                    <>
                      {/* Guest menu content */}
                      <div
                        className="px-6 pb-5 pt-6"
                        style={{ background: 'linear-gradient(135deg, #faf9f7 0%, #f5f1eb 100%)' }}
                      >
                        <div className="mb-4 h-px w-8" style={{ background: 'linear-gradient(90deg, #c8b898, transparent)' }} />
                        <p className="mb-1 text-[22px] leading-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
                          Welcome
                        </p>
                        <p className="text-[12px] leading-snug text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
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
                    </>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <button
            onClick={() => navigate('/cart')}
            className="relative text-neutral-500 transition-colors duration-300 hover:text-black"
          >
            <ShoppingBag size={19} strokeWidth={1.5} />
            {itemCount > 0 ? (
              <span
                className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] text-white"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    // Global footer with brand info, quick links, and legal links.
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
              links: ['Discovery', 'Collections', 'Best Sellers', 'AI Room Planner'],
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

// Interactive before/after visual slider used in the hero area.
function BeforeAfterShowcase() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative grid gap-4 md:grid-cols-2 md:gap-5">
        <div className="group relative overflow-hidden rounded-[24px]">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={heroBeforeImage}
              alt="Before room"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p
              className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/60"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
            >
              Your Room
            </p>
            <p className="text-[18px] text-white" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
              Before
            </p>
          </div>
          <motion.div
            className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-[#c8b898] to-transparent"
            animate={isHovered ? { top: ['0%', '100%', '0%'] } : { top: '0%' }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ opacity: isHovered ? 0.6 : 0 }}
          />
        </div>

        <div className="group relative overflow-hidden rounded-[24px]">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={heroAfterImage}
              alt="After AI furniture integration"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p
              className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/60"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
            >
              AI Integration
            </p>
            <p className="text-[18px] text-white" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
              After
            </p>
          </div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={isHovered ? { x: ['-100%', '100%'] } : { x: '-100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
          <motion.div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl"
            animate={isHovered ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles size={20} className="text-[#a08c6a]" />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function Hompage() {
  const navigate = useNavigate()
  const [featuredProducts, setFeaturedProducts] = useState<NewArrivalProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price)

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const products = await getFeaturedProducts(6)
        setFeaturedProducts(products)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load featured products')
        console.error('Error loading featured products:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadFeaturedProducts()
  }, [])

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#fbf7f1_52%,#f4efe6_100%)] text-[#141311]">
      <Header />

      <main className="pt-[72px]">
        {/* Hero section with headline, CTA, and before/after demo */}
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

        {/* Product teaser cards section */}
        <section className="bg-white py-24 md:py-32">
          <div className="mx-auto max-w-[1440px] px-8 md:px-16">
            <div className="mb-16 text-center">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#a08c6a]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                Curated collection
              </p>
              <h2 className="mt-4 text-[clamp(1.5rem,3.5vw,2.5rem)] tracking-[-0.02em] text-[#1d1814]" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
                Try On Any Piece
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[14px] text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                Every item is ready for AI visualization in your space
              </p>
            </div>

            {isLoading ? (
              <div className="mt-10 flex justify-center">
                <div className="inline-flex items-center gap-2 text-[#a08c6a]">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#a08c6a]/30 border-t-[#a08c6a]" />
                  <span className="text-sm">Loading featured pieces...</span>
                </div>
              </div>
            ) : error ? (
              <div className="mt-10 rounded-[24px] border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {featuredProducts.map((product, index) => (
                  <motion.article
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.08 }}
                    className="group"
                  >
                    <div className="relative mb-5 overflow-hidden rounded-xl bg-neutral-50">
                      <div className="aspect-[4/5] overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = heroAfterImage
                          }}
                        />
                      </div>
                      <span
                        className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-neutral-500 backdrop-blur-sm"
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                      >
                        {product.category}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="mb-0.5 text-[16px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                          {product.name}
                        </h3>
                        <span className="text-[14px] text-neutral-500" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                          {formatPrice(product.price)}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <button
                          className="flex flex-1 items-center justify-center gap-2.5 rounded-lg border border-[#c8b898]/40 py-3 transition-all duration-300 hover:border-[#c8b898] hover:bg-[#c8b898]/5"
                          style={{ backgroundColor: 'rgba(200, 184, 152, 0.06)' }}
                          onClick={() => navigate('/ai-room-planner')}
                        >
                          <Camera size={15} className="text-[#a08c6a]" strokeWidth={1.5} />
                          <span className="text-[11px] uppercase tracking-[0.15em] text-[#8a7456]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                            AI Try-On
                          </span>
                        </button>

                        <button
                          className="flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-white transition-all duration-300 hover:bg-neutral-800"
                          onClick={() => navigate('/discovery')}
                        >
                          <ShoppingBag size={14} strokeWidth={1.5} />
                          <span className="text-[11px] uppercase tracking-[0.12em]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                            Add
                          </span>
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Process explanation section */}
        <section className="bg-[#faf9f7] px-6 py-24 sm:px-10 md:py-32 lg:px-16">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-20 text-center">
              <p
                className="mb-4 text-[11px] uppercase tracking-[0.2em] text-[#a08c6a]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                How it works
              </p>
              <h2
                className="mb-4 text-[clamp(1.5rem,3.5vw,2.5rem)] text-black"
                style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
              >
                Three Steps to Your Dream Room
              </h2>
              <p
                className="mx-auto max-w-md text-[14px] text-neutral-400"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                From photo to purchase in under 60 seconds
              </p>
            </div>

            <div className="relative mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-16">
              <div className="absolute left-[20%] right-[20%] top-16 hidden h-px bg-gradient-to-r from-transparent via-[#c8b898]/30 to-transparent md:block" />

              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="relative text-center"
                >
                  <div className="relative mb-8 inline-flex">
                    <div className="flex h-[80px] w-[80px] items-center justify-center rounded-2xl border border-[#c8b898]/20 bg-white shadow-sm">
                      <step.icon size={28} className="text-[#a08c6a]" strokeWidth={1.3} />
                    </div>
                    <span
                      className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black text-[10px] text-white"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                    >
                      {step.number}
                    </span>
                  </div>

                  <h3
                    className="mb-3 text-[18px] text-black"
                    style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="mx-auto max-w-[260px] text-[13px] leading-relaxed text-neutral-400"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
                  >
                    {step.text}
                  </p>
                </motion.div>
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