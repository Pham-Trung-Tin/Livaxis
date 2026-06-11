import { motion, AnimatePresence } from 'motion/react'
import {
  Camera,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Globe,
  Heart,
  LogOut,
  Search,
  Settings,
  Sparkles,
  User,
  Zap,
  Star,
  Check,
  ChevronUp,
  Cpu,
  ShoppingBag,
  SlidersHorizontal,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth-context'
import { useLanguage } from '../contexts/LanguageContext'
import { getAiTurns, type TurnsInfo } from '../services/aiRoomPlannerApi'
// test deploy 2

// ---------------------------------------------------------------------------
// Section type — 8 fullscreen sections total
// ---------------------------------------------------------------------------
type SectionId = 'hero' | 'features' | 'stats' | 'discovery' | 'pricing' | 'process'

// ---------------------------------------------------------------------------
// Global top navigation with account dropdown actions.
// ---------------------------------------------------------------------------
export function Header() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [turnsInfo, setTurnsInfo] = useState<TurnsInfo | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, loading: authLoading, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()

  const navLinks = [
    { label: t('common.discovery'), href: '/discovery' },
    { label: t('common.collections'), href: '/collections' },
    { label: t('common.subscription'), href: '/subscription' },
  ]

  // Fetch AI turns quota when the dropdown opens for authenticated users
  useEffect(() => {
    if (userMenuOpen && user) {
      getAiTurns()
        .then((info) => setTurnsInfo(info))
        .catch(() => setTurnsInfo(null))
    }
  }, [userMenuOpen, user])

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
                className={`absolute -bottom-1 left-0 h-px bg-black transition-all duration-300 ${hoveredLink === link.label ? 'w-full' : 'w-0'
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
            {t('homepage.aiRoomPlanner')}
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

                      {/* AI Turns card — Google-style credit display */}
                      <div
                        style={{
                          margin: '12px',
                          borderRadius: 14,
                          border: '1px solid rgba(0,0,0,0.07)',
                          background: 'linear-gradient(135deg, #fdfcfa 0%, #f8f4ee 100%)',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Turns row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px 10px' }}>
                          <div style={{
                            width: 30, height: 30,
                            borderRadius: 8,
                            background: turnsInfo?.unlimited
                              ? 'linear-gradient(135deg, #e8f5e9, #c8e6c9)'
                              : (turnsInfo?.turnsRemaining ?? 1) > 0
                                ? 'linear-gradient(135deg, #fef9ec, #fdecc8)'
                                : 'linear-gradient(135deg, #fdecea, #fcd0cc)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <Zap
                              size={14}
                              strokeWidth={2}
                              style={{
                                color: turnsInfo?.unlimited
                                  ? '#4caf50'
                                  : (turnsInfo?.turnsRemaining ?? 1) > 0
                                    ? '#e5a20e'
                                    : '#e53935',
                              }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {turnsInfo ? (
                              turnsInfo.unlimited ? (
                                <>
                                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1a1a1a', fontFamily: 'Inter, sans-serif', lineHeight: 1.3 }}>
                                    {t('homepage.unlimitedAiTryon')}
                                  </p>
                                  <p style={{ margin: 0, fontSize: 11, color: '#4caf50', fontFamily: 'Inter, sans-serif', fontWeight: 500, textTransform: 'capitalize' }}>
                                    Gói {turnsInfo.subscriptionPlan}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1a1a1a', fontFamily: 'Inter, sans-serif', lineHeight: 1.3 }}>
                                    {turnsInfo.purchasedTurns && turnsInfo.purchasedTurns > 0
                                      ? (language === 'vi'
                                        ? `${turnsInfo.turnsRemaining} lượt thử AI (${turnsInfo.purchasedTurns} mua thêm)`
                                        : `${turnsInfo.turnsRemaining} AI Try-ons (${turnsInfo.purchasedTurns} purchased)`)
                                      : t('homepage.turnsRemaining')
                                          .replace('{remaining}', String(turnsInfo.turnsRemaining ?? 0))
                                          .replace('{limit}', String(turnsInfo.dailyLimit ?? 3))}
                                  </p>
                                  <p style={{ margin: 0, fontSize: 10, color: '#a08c6a', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                                    {t('homepage.resetsDaily')}
                                  </p>
                                </>
                              )
                            ) : (
                              <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', fontFamily: 'Inter, sans-serif' }}>{t('homepage.loading')}</p>
                            )}
                          </div>
                        </div>

                        {/* Upgrade button — only for free users */}
                        {turnsInfo && !turnsInfo.unlimited && (
                          <div style={{ padding: '0 10px 10px' }}>
                            <button
                              onClick={() => { setUserMenuOpen(false); navigate('/subscription') }}
                              style={{
                                width: '100%',
                                padding: '8px 0',
                                borderRadius: 10,
                                border: '1px solid rgba(200,184,152,0.35)',
                                background: 'white',
                                fontSize: 12,
                                fontWeight: 600,
                                color: '#6b5d45',
                                fontFamily: 'Inter, sans-serif',
                                cursor: 'pointer',
                                letterSpacing: '0.03em',
                                transition: 'background 0.18s, border-color 0.18s',
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = '#fdf9f4'
                                  ; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(200,184,152,0.7)'
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'white'
                                  ; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(200,184,152,0.35)'
                              }}
                            >
                              {t('homepage.upgrade')}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 px-3 py-3">
                        {[
                          { icon: User, label: t('profile.personalInfo'), sub: t('profile.personalInfoSub'), href: '/profile' },
                          { icon: Heart, label: t('profile.myDesigns'), sub: t('profile.myDesignsSub') },
                          { icon: Settings, label: t('profile.accountSettings'), sub: t('profile.personalInfoSub') },
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
                              {t('common.logout')}
                            </p>
                            <p
                              className="truncate text-[10px] text-red-300"
                              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
                            >
                              {t('homepage.logoutSub')}
                            </p>
                          </div>
                        </button>
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
                          {t('homepage.welcome')}
                        </p>
                        <p className="text-[12px] leading-snug text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                          {t('homepage.signInForPersonalised')}
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
                            {t('auth.signIn')}
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
                            {t('homepage.or')}
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
                            {t('auth.createAccount')}
                          </span>
                        </button>
                      </div>

                      <div className="mx-5 h-px bg-neutral-100" />

                      <div className="px-3 py-3">
                        {[
                          { icon: Heart, label: t('profile.myDesigns'), sub: t('profile.myDesignsSub') },
                          { icon: Settings, label: t('profile.personalInfo'), sub: t('profile.personalInfoSub') },
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
                    </>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            className="group flex items-center gap-1.5 rounded-full border border-[#c8b898]/20 bg-[#faf8f5]/80 px-2.5 py-1.5 text-[11px] font-semibold tracking-wider text-[#6f5a41] transition-all duration-300 hover:border-[#c8b898]/60 hover:bg-[#f5f1eb] hover:text-black"
            style={{ fontFamily: "'Inter', sans-serif" }}
            title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          >
            <Globe size={13} strokeWidth={1.5} className="text-[#a08c6a] transition-transform duration-500 group-hover:rotate-12" />
            <span className="font-semibold uppercase">{language}</span>
          </button>

        </div>
      </div>
    </header>
  )
}

export function Footer() {
  const { t } = useLanguage()
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
              {t('homepage.redefiningLuxury')}
            </p>
          </div>

          {[
            {
              title: t('homepage.shopTitle'),
              links: [t('homepage.shopLinks.0'), t('homepage.shopLinks.1'), t('homepage.shopLinks.2'), t('homepage.shopLinks.3')],
            },
            {
              title: t('homepage.aboutTitle'),
              links: [t('homepage.aboutLinks.0'), t('homepage.aboutLinks.1'), t('homepage.aboutLinks.2'), t('homepage.aboutLinks.3')],
            },
            {
              title: t('homepage.supportTitle'),
              links: [t('homepage.supportLinks.0'), t('homepage.supportLinks.1'), t('homepage.supportLinks.2'), t('homepage.supportLinks.3')],
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
            {t('homepage.rightsReserved')}
          </span>
          <div className="flex gap-6">
            {[{ label: t('homepage.privacy'), key: 'Privacy' }, { label: t('homepage.terms'), key: 'Terms' }, { label: t('homepage.cookies'), key: 'Cookies' }].map((item) => (
              <a
                key={item.key}
                href="#"
                className="text-[12px] text-neutral-300 transition-colors duration-300 hover:text-neutral-500"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ---------------------------------------------------------------------------
// Interactive before/after visual slider used in the hero area.
// ---------------------------------------------------------------------------
function BeforeAfterShowcase() {
  const [isHovered, setIsHovered] = useState(false)
  const { t } = useLanguage()

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
              src="https://res.cloudinary.com/dgz3rhiv4/image/upload/v1780894218/ChatGPT_Image_Jun_8_2026_11_50_07_AM_xycatx.png"
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
              {t('homepage.yourRoom')}
            </p>
            <p className="text-[18px] text-white" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
              {t('homepage.before')}
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
              src="https://res.cloudinary.com/dgz3rhiv4/image/upload/v1780894205/ChatGPT_Image_Jun_8_2026_11_47_54_AM_unvcav.png"
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
              {t('homepage.aiIntegration')}
            </p>
            <p className="text-[18px] text-white" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
              {t('homepage.after')}
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

// ---------------------------------------------------------------------------
// FAQ Accordion — used in FAQ section
// ---------------------------------------------------------------------------
function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-black/6 last:border-0"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span
          className="text-[14px] text-black"
          style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, lineHeight: 1.5 }}
        >
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="shrink-0"
        >
          <ChevronDown size={16} className="text-[#a08c6a]" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p
              className="pb-5 text-[13px] leading-relaxed text-neutral-500"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
            >
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main Homepage component
// ---------------------------------------------------------------------------
function Hompage() {
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const [activeSection, setActiveSection] = useState<SectionId>('hero')
  const containerRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const activeSectionRef = useRef<SectionId>('hero')
  // Keep ref in sync with state
  useEffect(() => {
    activeSectionRef.current = activeSection
  }, [activeSection])

  const sectionsList: SectionId[] = ['hero', 'process', 'features', 'discovery', 'pricing', 'stats']

  const scrollToSection = (id: SectionId) => {
    const el = document.getElementById(id)
    if (el) {
      isScrollingRef.current = true
      el.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(id)
      setTimeout(() => {
        isScrollingRef.current = false
      }, 1000)
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 1. Intersection Observer for visual syncing
    const observerOptions = {
      root: container,
      rootMargin: '0px',
      threshold: 0.25,
    }

    const observer = new IntersectionObserver((entries) => {
      // Ignore intersection updates during programmatic smooth scrolls
      if (isScrollingRef.current) return

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id as SectionId)
        }
      })
    }, observerOptions)

    sectionsList.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    // 2. Custom wheel & keyboard scroll snapping
    const handleWheel = (e: WheelEvent) => {
      if (window.innerWidth < 768) return

      // Filter out small trackpad drifts
      if (Math.abs(e.deltaY) < 30) return

      e.preventDefault()

      if (isScrollingRef.current) return

      const currentIndex = sectionsList.indexOf(activeSectionRef.current)
      let nextIndex = currentIndex

      if (e.deltaY > 0) {
        if (currentIndex < sectionsList.length - 1) {
          nextIndex = currentIndex + 1
        }
      } else {
        if (currentIndex > 0) {
          nextIndex = currentIndex - 1
        }
      }

      if (nextIndex !== currentIndex) {
        scrollToSection(sectionsList[nextIndex])
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (window.innerWidth < 768) return
      if (isScrollingRef.current) return

      const currentIndex = sectionsList.indexOf(activeSectionRef.current)
      let nextIndex = currentIndex

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        if (currentIndex < sectionsList.length - 1) {
          nextIndex = currentIndex + 1
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        if (currentIndex > 0) {
          nextIndex = currentIndex - 1
        }
      }

      if (nextIndex !== currentIndex) {
        scrollToSection(sectionsList[nextIndex])
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      sectionsList.forEach((id) => {
        const el = document.getElementById(id)
        if (el) observer.unobserve(el)
      })
      container.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKeyDown)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const steps = [
    {
      icon: Camera,
      number: '01',
      title: t('homepage.step1Title'),
      text: t('homepage.step1Text'),
      imageUrl: 'https://res.cloudinary.com/dgz3rhiv4/image/upload/v1781088956/Section_6_vtmkxe.png',
    },
    {
      icon: Sparkles,
      number: '02',
      title: t('homepage.step2Title'),
      text: t('homepage.step2Text'),
      imageUrl: 'https://res.cloudinary.com/dgz3rhiv4/image/upload/v1781089224/section5-2_a5xrcl.png',
    },
    {
      icon: ExternalLink,
      number: '03',
      title: t('homepage.step3Title'),
      text: t('homepage.step3Text'),
      imageUrl: 'https://res.cloudinary.com/dgz3rhiv4/image/upload/v1781089207/section5-3_pmdfqo.png',
    },
  ]

  const features = [
    { icon: Sparkles, titleKey: 'feature1Title', descKey: 'feature1Desc', color: '#c8b898', bgColor: 'rgba(200,184,152,0.12)' },
    { icon: SlidersHorizontal, titleKey: 'feature2Title', descKey: 'feature2Desc', color: '#a08c6a', bgColor: 'rgba(160,140,106,0.1)' },
    { icon: ChevronUp, titleKey: 'feature3Title', descKey: 'feature3Desc', color: '#8a7456', bgColor: 'rgba(138,116,86,0.1)' },
    { icon: ShoppingBag, titleKey: 'feature4Title', descKey: 'feature4Desc', color: '#6f5a41', bgColor: 'rgba(111,90,65,0.1)' },
  ]

  const stats = [
    { valueKey: 'stat1Value', labelKey: 'stat1Label' },
    { valueKey: 'stat2Value', labelKey: 'stat2Label' },
    { valueKey: 'stat3Value', labelKey: 'stat3Label' },
    { valueKey: 'stat4Value', labelKey: 'stat4Label' },
  ]

  const discoveryProducts = [
    {
      id: '1',
      name: language === 'vi' ? 'Sofa vải lanh Serene' : 'Serene Linen Sofa',
      category: language === 'vi' ? 'Sofa' : 'Sofas',
      price: language === 'vi' ? '110.000.000 ₫' : '$4,890',
      imageUrl: 'https://images.unsplash.com/photo-1759722668767-3f9cb7468b7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
    {
      id: '2',
      name: language === 'vi' ? 'Bàn bên Carrara' : 'Carrara Side Table',
      category: language === 'vi' ? 'Bàn' : 'Tables',
      price: language === 'vi' ? '51.000.000 ₫' : '$2,290',
      imageUrl: 'https://images.unsplash.com/photo-1765766638341-0beb9eb9926c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
    {
      id: '3',
      name: language === 'vi' ? 'Ghế thư giãn gỗ óc chó' : 'Walnut Lounge Chair',
      category: language === 'vi' ? 'Ghế' : 'Chairs',
      price: language === 'vi' ? '70.000.000 ₫' : '$3,140',
      imageUrl: 'https://images.unsplash.com/photo-1762803841091-c5327f7aed37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
    {
      id: '4',
      name: language === 'vi' ? 'Đèn thả đồng thau Atelier' : 'Atelier Brass Pendant',
      category: language === 'vi' ? 'Đèn chiếu sáng' : 'Lighting',
      price: language === 'vi' ? '33.000.000 ₫' : '$1,480',
      imageUrl: 'https://images.unsplash.com/photo-1767979066193-83dffc4a4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
    {
      id: '5',
      name: language === 'vi' ? 'Bàn ăn gỗ sồi Nordic' : 'Nordic Oak Dining Table',
      category: language === 'vi' ? 'Bàn' : 'Tables',
      price: language === 'vi' ? '127.000.000 ₫' : '$5,640',
      imageUrl: 'https://images.unsplash.com/photo-1772442363851-738a548f6c5c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
    {
      id: '6',
      name: language === 'vi' ? 'Ghế accent Boucle' : 'Boucle Accent Chair',
      category: language === 'vi' ? 'Ghế' : 'Chairs',
      price: language === 'vi' ? '66.000.000 ₫' : '$2,950',
      imageUrl: 'https://images.unsplash.com/photo-1768946131690-247c5319f0d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
    {
      id: '7',
      name: language === 'vi' ? 'Hệ kệ mây Rattan' : 'Rattan Shelf System',
      category: language === 'vi' ? 'Tủ lưu trữ' : 'Storage',
      price: language === 'vi' ? '42.000.000 ₫' : '$1,890',
      imageUrl: 'https://images.unsplash.com/photo-1734120113877-ef06ed3a10f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
    {
      id: '8',
      name: language === 'vi' ? 'Bàn trà Travertine' : 'Travertine Coffee Table',
      category: language === 'vi' ? 'Bàn' : 'Tables',
      price: language === 'vi' ? '85.000.000 ₫' : '$3,780',
      imageUrl: 'https://images.unsplash.com/photo-1755770355297-1526e33a3c82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
  ]

  const pricingPlans = [
    {
      nameKey: 'pricingFreeName',
      priceKey: 'pricingFreePrice',
      descKey: 'pricingFreeDesc',
      highlight: false,
      imageUrl: 'https://res.cloudinary.com/dgz3rhiv4/image/upload/v1781088637/section5_jxnt0i.png',
    },
    { nameKey: 'pricingStarterName', priceKey: 'pricingStarterPrice', descKey: 'pricingStarterDesc', highlight: false },
    { nameKey: 'pricingStandardName', priceKey: 'pricingStandardPrice', descKey: 'pricingStandardDesc', highlight: true },
    { nameKey: 'pricingPremiumName', priceKey: 'pricingPremiumPrice', descKey: 'pricingPremiumDesc', highlight: false },
  ]

  const faqs = [
    { qKey: 'faq1Q', aKey: 'faq1A' },
    { qKey: 'faq2Q', aKey: 'faq2A' },
    { qKey: 'faq3Q', aKey: 'faq3A' },
    { qKey: 'faq4Q', aKey: 'faq4A' },
    { qKey: 'faq5Q', aKey: 'faq5A' },
  ]

  const dotNavItems = [
    { id: 'hero' as SectionId, label: t('homepage.roomVisualiser') },
    { id: 'process' as SectionId, label: t('homepage.howItWorks') },
    { id: 'features' as SectionId, label: t('homepage.featuresLabel') },
    { id: 'discovery' as SectionId, label: t('homepage.discoveryLabel') },
    { id: 'pricing' as SectionId, label: t('homepage.pricingLabel') },
    { id: 'stats' as SectionId, label: t('homepage.statsLabel') },
  ]

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[linear-gradient(180deg,#fffdf9_0%,#fbf7f1_52%,#f4efe6_100%)] text-[#141311]">
      <Header />

      {/* Main Snap Scroll Container */}
      <main
        ref={containerRef}
        className="h-full w-full overflow-y-auto scrollbar-hide relative"
      >
        {/* ═══════════════════════════════════════════════════
            Section 1: Hero / AI Room Planner Visualization
        ═══════════════════════════════════════════════════ */}
        <section
          id="hero"
          className="w-full min-h-[100dvh] md:h-screen flex flex-col justify-center items-center relative pt-[72px] px-6 pb-8 overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top,rgba(200,184,152,0.22),transparent_50%)]" />
          <div className="mx-auto max-w-7xl text-center flex flex-col items-center justify-center">
            <motion.p
              initial={{ opacity: 0, filter: 'blur(12px)', y: 8 }}
              animate={activeSection === 'hero'
                ? { opacity: 1, filter: 'blur(0px)', y: 0 }
                : { opacity: 0, filter: 'blur(12px)', y: 8 }
              }
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-[11px] uppercase tracking-[0.36em] text-[#a08c6a]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {t('homepage.roomVisualiser')}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, filter: 'blur(20px)', scale: 0.97, y: 10 }}
              animate={activeSection === 'hero'
                ? { opacity: 1, filter: 'blur(0px)', scale: 1, y: 0 }
                : { opacity: 0, filter: 'blur(20px)', scale: 0.97, y: 10 }
              }
              transition={{ duration: 0.85, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 text-4xl leading-[1.05] tracking-[-0.04em] text-[#1d1814] sm:text-5xl lg:text-[4.5rem]"
              style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}
            >
              {t('homepage.heroTitle')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, filter: 'blur(10px)', y: 6 }}
              animate={activeSection === 'hero'
                ? { opacity: 1, filter: 'blur(0px)', y: 0 }
                : { opacity: 0, filter: 'blur(10px)', y: 6 }
              }
              transition={{ duration: 0.75, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm text-[#7b7368]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {t('homepage.heroDesc')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, filter: 'blur(8px)', y: 24, scale: 0.98 }}
              animate={activeSection === 'hero'
                ? { opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }
                : { opacity: 0, filter: 'blur(8px)', y: 24, scale: 0.98 }
              }
              transition={{ duration: 0.9, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-8 w-full max-w-4xl"
            >
              <BeforeAfterShowcase />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, filter: 'blur(8px)', y: 12 }}
              animate={activeSection === 'hero'
                ? { opacity: 1, filter: 'blur(0px)', y: 0 }
                : { opacity: 0, filter: 'blur(8px)', y: 12 }
              }
              transition={{ duration: 0.65, delay: 0.58, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex justify-center"
            >
              <button
                className="group inline-flex items-center gap-2 rounded-full bg-[#161311] px-5 py-2.5 text-[10px] uppercase tracking-[0.24em] text-white shadow-[0_18px_40px_rgba(20,17,14,0.18)] transition-transform duration-300 hover:-translate-y-0.5"
                onClick={() => navigate('/ai-room-planner')}
              >
                {t('homepage.startScan')}
                <ChevronRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer z-10 hidden md:block"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            onClick={() => scrollToSection('process')}
          >
            <ChevronDown size={28} className="text-[#a08c6a] opacity-80 hover:opacity-100 transition-opacity" />
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════
            Section 2: How it works / Process Explanation
        ═══════════════════════════════════════════════════ */}
        <section
          id="process"
          className="w-full min-h-[100dvh] md:h-screen flex flex-col justify-center items-center bg-[#faf9f7] px-6 py-16 md:py-0 relative overflow-hidden pt-[72px]"
        >
          <div className="mx-auto max-w-[1440px] w-full flex flex-col items-center justify-center">
            <div className="mb-14 text-center">
              {/* Process: Slide-from-left animation */}
              <motion.p
                initial={{ opacity: 0, x: -40 }}
                animate={activeSection === 'process' ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#a08c6a]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                {t('homepage.howItWorks')}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, x: -50 }}
                animate={activeSection === 'process' ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="mb-3 text-[clamp(1.5rem,3vw,2.25rem)] text-black"
                style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
              >
                {t('homepage.howItWorksTitle')}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -35 }}
                animate={activeSection === 'process' ? { opacity: 1, x: 0 } : { opacity: 0, x: -35 }}
                transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto max-w-md text-[13px] text-neutral-400"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                {t('homepage.howItWorksDesc')}
              </motion.p>
            </div>

            <motion.div
              initial="hidden"
              animate={activeSection === 'process' ? 'visible' : 'hidden'}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.15
                  }
                }
              }}
              className="relative mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-16 w-full"
            >
              <div className="absolute left-[20%] right-[20%] top-[256px] hidden h-px bg-gradient-to-r from-transparent via-[#c8b898]/30 to-transparent md:block" />

              {steps.map((step) => (
                <motion.div
                  key={step.number}
                  variants={{
                    hidden: { opacity: 0, y: 40, filter: 'blur(6px)' },
                    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } }
                  }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Step Image */}
                  {step.imageUrl && (
                    <div className="relative mb-6 w-full max-w-[280px] aspect-[4/3] overflow-hidden rounded-[20px] border border-black/5 shadow-[0_10px_30px_rgba(200,184,152,0.08)] bg-neutral-50 group">
                      <img
                        src={step.imageUrl}
                        alt={step.title}
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="relative mb-5 inline-flex z-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#c8b898]/20 bg-white shadow-sm transition-transform duration-300 hover:scale-105">
                      <step.icon size={18} className="text-[#a08c6a]" strokeWidth={1.3} />
                    </div>
                    <span
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[9px] text-white"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                    >
                      {step.number}
                    </span>
                  </div>

                  <h3
                    className="mb-2 text-[17px] text-black"
                    style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="mx-auto max-w-[250px] text-[12px] leading-relaxed text-neutral-400"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
                  >
                    {step.text}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer z-10 hidden md:block"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            onClick={() => scrollToSection('features')}
          >
            <ChevronDown size={28} className="text-[#a08c6a] opacity-80 hover:opacity-100 transition-opacity" />
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════
            Section 2: Features & Benefits
        ═══════════════════════════════════════════════════ */}
        <section
          id="features"
          className="w-full min-h-[100dvh] md:h-screen flex flex-col justify-center items-center bg-white px-6 py-16 md:py-0 relative overflow-hidden pt-[72px]"
        >
          {/* Subtle decorative gradient */}
          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,184,152,0.10) 0%, transparent 60%)' }} />
          <div className="mx-auto max-w-[1440px] w-full px-4 md:px-8">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              
              {/* Left Column: Text & Feature Cards */}
              <div className="lg:col-span-5 flex flex-col justify-center text-left">
                {/* Features: Slide-from-left + scale reveal */}
                <motion.p
                  initial={{ opacity: 0, x: -30, filter: 'blur(8px)' }}
                  animate={activeSection === 'features' ? { opacity: 1, x: 0, filter: 'blur(0px)' } : { opacity: 0, x: -30, filter: 'blur(8px)' }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#a08c6a]"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  {t('homepage.featuresLabel')}
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, x: -40, scale: 0.97 }}
                  animate={activeSection === 'features' ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -40, scale: 0.97 }}
                  transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-4 text-[clamp(1.5rem,3vw,2.25rem)] leading-tight text-black"
                  style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
                >
                  {t('homepage.featuresTitle')}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -25 }}
                  animate={activeSection === 'features' ? { opacity: 1, x: 0 } : { opacity: 0, x: -25 }}
                  transition={{ duration: 0.65, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-8 max-w-lg text-[13px] text-neutral-400"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
                >
                  {t('homepage.featuresDesc')}
                </motion.p>

                {/* 2x2 Grid for smaller feature cards */}
                <motion.div
                  initial="hidden"
                  animate={activeSection === 'features' ? 'visible' : 'hidden'}
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.1 } }
                  }}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  {features.map((feat, i) => {
                    const Icon = feat.icon
                    return (
                      <motion.div
                        key={i}
                        variants={{
                          hidden: { opacity: 0, x: -20, filter: 'blur(4px)' },
                          visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }
                        }}
                        className="group relative flex flex-col rounded-[16px] border border-black/5 bg-[#fdfcfb] p-5 transition-all duration-300 hover:shadow-[0_8px_20px_rgba(200,184,152,0.1)] hover:-translate-y-0.5"
                      >
                        {/* Icon */}
                        <div
                          className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                          style={{ background: feat.bgColor }}
                        >
                          <Icon size={18} style={{ color: feat.color }} strokeWidth={1.5} />
                        </div>
                        <h3
                          className="mb-1.5 text-[14px] font-medium text-black"
                          style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                          {t(`homepage.${feat.titleKey}` as Parameters<typeof t>[0])}
                        </h3>
                        <p
                          className="text-[11px] leading-relaxed text-neutral-400"
                          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
                        >
                          {t(`homepage.${feat.descKey}` as Parameters<typeof t>[0])}
                        </p>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </div>

              {/* Right Column: High-Res Image Showcase */}
              <div className="lg:col-span-7 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, x: 40, filter: 'blur(10px)' }}
                  animate={activeSection === 'features' ? { opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' } : { opacity: 0, scale: 0.92, x: 40, filter: 'blur(10px)' }}
                  transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full overflow-hidden rounded-[24px] border border-black/5 bg-neutral-100 shadow-[0_20px_50px_rgba(200,184,152,0.15)] aspect-[4/3] max-w-[680px]"
                >
                  <img
                    src="https://res.cloudinary.com/dgz3rhiv4/image/upload/v1781088228/section3_kxaym5.png"
                    alt="Livaxis AI Features Mockup"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
                </motion.div>
              </div>

            </div>
          </div>

          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer z-10 hidden md:block"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            onClick={() => scrollToSection('discovery')}
          >
            <ChevronDown size={28} className="text-[#a08c6a] opacity-80 hover:opacity-100 transition-opacity" />
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════
            Section 4: Testimonials
        ═══════════════════════════════════════════════════ */}
        {/* ═══════════════════════════════════════════════════
            Section 4: Discovery
        ═══════════════════════════════════════════════════ */}
        <section
          id="discovery"
          className="w-full min-h-[100dvh] md:h-screen flex flex-col justify-center items-center bg-[#faf9f7] px-6 py-16 md:py-0 relative overflow-hidden pt-[72px]"
        >
          <style>{`
            @keyframes marquee-up {
              0% { transform: translateY(0); }
              100% { transform: translateY(-50%); }
            }
            @keyframes marquee-down {
              0% { transform: translateY(-50%); }
              100% { transform: translateY(0); }
            }
            .animate-marquee-up {
              animation: marquee-up 28s linear infinite;
            }
            .animate-marquee-down {
              animation: marquee-down 28s linear infinite;
            }
          `}</style>

          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 100%, rgba(200,184,152,0.08) 0%, transparent 70%)' }} />
          
          <div className="relative mx-auto max-w-[1440px] w-full px-4 md:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
              
              {/* Left Column: Vertical Marquees */}
              <div className="lg:col-span-7 h-[420px] md:h-[500px] overflow-hidden grid grid-cols-2 gap-6 relative select-none rounded-[24px]">
                {/* Fade overlays for elevation depth */}
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-[#faf9f7] to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-[#faf9f7] to-transparent" />

                {/* Column 1: Upwards */}
                <div className="overflow-hidden relative h-full">
                  <div className="flex flex-col gap-5 animate-marquee-up hover:[animation-play-state:paused]">
                    {[...discoveryProducts.slice(0, 4), ...discoveryProducts.slice(0, 4)].map((product, i) => (
                      <div
                        key={`up-${i}`}
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="group flex flex-col rounded-2xl border border-black/5 bg-white p-4 transition-all duration-300 hover:shadow-[0_12px_24px_rgba(200,184,152,0.15)] hover:border-[#c8b898]/40 hover:-translate-y-0.5 cursor-pointer"
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-50 mb-3.5 relative">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute top-2 left-2 rounded-full bg-white/80 backdrop-blur-md px-2 py-0.5 text-[8px] uppercase tracking-wider text-[#a08c6a] border border-[#c8b898]/20">
                            {product.category}
                          </div>
                        </div>
                        <h4 className="text-[12px] font-medium text-black line-clamp-1 group-hover:text-[#a08c6a] transition-colors" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-[#8a7456] mt-1 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {product.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Downwards */}
                <div className="overflow-hidden relative h-full">
                  <div className="flex flex-col gap-5 animate-marquee-down hover:[animation-play-state:paused]">
                    {[...discoveryProducts.slice(4, 8), ...discoveryProducts.slice(4, 8)].map((product, i) => (
                      <div
                        key={`down-${i}`}
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="group flex flex-col rounded-2xl border border-black/5 bg-white p-4 transition-all duration-300 hover:shadow-[0_12px_24px_rgba(200,184,152,0.15)] hover:border-[#c8b898]/40 hover:-translate-y-0.5 cursor-pointer"
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-50 mb-3.5 relative">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute top-2 left-2 rounded-full bg-white/80 backdrop-blur-md px-2 py-0.5 text-[8px] uppercase tracking-wider text-[#a08c6a] border border-[#c8b898]/20">
                            {product.category}
                          </div>
                        </div>
                        <h4 className="text-[12px] font-medium text-black line-clamp-1 group-hover:text-[#a08c6a] transition-colors" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-[#8a7456] mt-1 font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {product.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Copy text & CTA */}
              <div className="lg:col-span-5 flex flex-col justify-center text-left">
                {/* Discovery: Slide-from-right animation */}
                <motion.p
                  initial={{ opacity: 0, x: 35 }}
                  animate={activeSection === 'discovery' ? { opacity: 1, x: 0 } : { opacity: 0, x: 35 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#a08c6a]"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  {t('homepage.discoveryLabel')}
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, x: 50, filter: 'blur(8px)' }}
                  animate={activeSection === 'discovery' ? { opacity: 1, x: 0, filter: 'blur(0px)' } : { opacity: 0, x: 50, filter: 'blur(8px)' }}
                  transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-5 text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight text-black"
                  style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
                >
                  {t('homepage.discoveryTitle')}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: 30 }}
                  animate={activeSection === 'discovery' ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                  transition={{ duration: 0.65, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="mb-8 text-[13px] leading-relaxed text-neutral-500"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
                >
                  {t('homepage.discoveryDesc')}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, x: 25, filter: 'blur(4px)' }}
                  animate={activeSection === 'discovery' ? { opacity: 1, x: 0, filter: 'blur(0px)' } : { opacity: 0, x: 25, filter: 'blur(4px)' }}
                  transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <button
                    onClick={() => navigate('/discovery')}
                    className="group inline-flex items-center gap-2.5 rounded-xl bg-[#161311] px-7 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white shadow-[0_12px_30px_rgba(20,17,14,0.15)] transition-transform duration-300 hover:-translate-y-0.5"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                  >
                    {t('homepage.discoveryCta')}
                    <ChevronRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                </motion.div>
              </div>

            </div>
          </div>

          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer z-10 hidden md:block"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            onClick={() => scrollToSection('pricing')}
          >
            <ChevronDown size={28} className="text-[#a08c6a] opacity-80 hover:opacity-100 transition-opacity" />
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════
            Section 5: Pricing Preview — Bento Grid
        ═══════════════════════════════════════════════════ */}
        <section
          id="pricing"
          className="w-full min-h-[100dvh] md:h-screen flex flex-col justify-center items-center bg-white px-6 py-16 md:py-0 relative overflow-hidden pt-[72px]"
        >
          {/* Subtle radial gradient overlays */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 15% 50%, rgba(200,184,152,0.07) 0%, transparent 60%)' }} />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 60% at 85% 50%, rgba(244,239,230,0.5) 0%, transparent 55%)' }} />
          </div>

          <div className="relative mx-auto max-w-[1440px] w-full z-10">
            <div className="mb-10 text-center">
              <motion.p
                initial={{ opacity: 0, scale: 0.85, letterSpacing: '0.5em' }}
                animate={activeSection === 'pricing' ? { opacity: 1, scale: 1, letterSpacing: '0.2em' } : { opacity: 0, scale: 0.85, letterSpacing: '0.5em' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#a08c6a]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                {t('homepage.pricingLabel')}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, scale: 0.94, filter: 'blur(12px)' }}
                animate={activeSection === 'pricing' ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : { opacity: 0, scale: 0.94, filter: 'blur(12px)' }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="mb-3 text-[clamp(1.5rem,3vw,2.25rem)] text-black"
                style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
              >
                {t('homepage.pricingTitle')}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                animate={activeSection === 'pricing' ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 12, filter: 'blur(6px)' }}
                transition={{ duration: 0.65, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto max-w-lg text-[13px] text-neutral-400"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                {t('homepage.pricingDesc')}
              </motion.p>
            </div>

            {/* ── Bento Grid ── */}
            <motion.div
              initial="hidden"
              animate={activeSection === 'pricing' ? 'visible' : 'hidden'}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid grid-cols-1 gap-4 px-4 mb-8 lg:grid-cols-3 lg:grid-rows-2 lg:h-[400px]"
            >
              {/* ── STANDARD (highlight) — tall card, col-span-1 row-span-2 ── */}
              {(() => {
                const plan = pricingPlans[2] // Standard
                return (
                  <motion.div
                    key="standard"
                    variants={{
                      hidden: { opacity: 0, x: -40, scale: 0.93, filter: 'blur(8px)' },
                      visible: { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className="relative flex flex-col rounded-[24px] p-8 overflow-hidden lg:col-span-1 lg:row-span-2 transition-all duration-500 hover:-translate-y-1 group cursor-pointer"
                    style={{
                      background: 'linear-gradient(150deg, #1a1714 0%, #24201a 55%, #2c2419 100%)',
                      boxShadow: '0 24px 64px rgba(20,17,14,0.28), 0 0 0 1px rgba(200,184,152,0.1)',
                    }}
                    onClick={() => navigate('/subscription')}
                  >
                    {/* Animated golden shimmer */}
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-[24px]"
                      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(200,184,152,0.14) 0%, transparent 60%)' }}
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    />
                    {/* Top-right corner glow */}
                    <motion.div
                      className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#c8b898]/20 blur-[40px]"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
                      transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                    />
                    {/* Popular badge */}
                    <div className="absolute top-6 right-6">
                      <div className="flex items-center gap-1.5 rounded-full bg-[#c8b898]/15 border border-[#c8b898]/30 px-3 py-1">
                        <Star size={9} className="fill-[#c8b898] text-[#c8b898]" />
                        <span className="text-[9px] uppercase tracking-[0.18em] text-[#c8b898]" style={{ fontWeight: 600 }}>
                          {language === 'vi' ? 'Phổ biến' : 'Popular'}
                        </span>
                      </div>
                    </div>
                    {/* Plan name */}
                    <p
                      className="mb-2 text-[11px] uppercase tracking-[0.18em] text-[#c8b898]/70"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                    >
                      {t(`homepage.${plan.nameKey}` as Parameters<typeof t>[0])}
                    </p>
                    {/* Price */}
                    <p
                      className="mb-1 text-[clamp(2.5rem,4vw,3.2rem)] leading-none text-white"
                      style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
                    >
                      {t(`homepage.${plan.priceKey}` as Parameters<typeof t>[0])}
                    </p>
                    <p
                      className="mb-8 text-[11px] text-white/40"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
                    >
                      {t(`homepage.${plan.descKey}` as Parameters<typeof t>[0])}
                    </p>
                    {/* Feature list */}
                    <div className="flex flex-col gap-3 mt-auto">
                      {[
                        language === 'vi' ? 'Không giới hạn lượt AI' : 'Unlimited AI try-ons',
                        language === 'vi' ? 'Tất cả phong cách nội thất' : 'All interior styles',
                        language === 'vi' ? 'Lưu & chia sẻ thiết kế' : 'Save & share designs',
                        language === 'vi' ? 'Ưu tiên xử lý nhanh' : 'Priority processing',
                      ].map((feat) => (
                        <div key={feat} className="flex items-center gap-3">
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c8b898]/20 border border-[#c8b898]/30">
                            <Check size={10} strokeWidth={2.5} className="text-[#c8b898]" />
                          </div>
                          <span className="text-[12px] text-white/70" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>{feat}</span>
                        </div>
                      ))}
                    </div>
                    {/* CTA button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('/subscription') }}
                      className="mt-8 w-full rounded-[14px] py-3.5 text-[11px] uppercase tracking-[0.18em] text-[#1a1714] transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #d4bc94 0%, #c8b898 60%, #b8a47e 100%)',
                        boxShadow: '0 4px 20px rgba(200,184,152,0.35)',
                      }}
                    >
                      {language === 'vi' ? 'Chọn gói này' : 'Get started'}
                    </button>
                  </motion.div>
                )
              })()}

              {/* ── FREE — small top-center ── */}
              {(() => {
                const plan = pricingPlans[0]
                return (
                  <motion.div
                    key="free"
                    variants={{
                      hidden: { opacity: 0, y: -30, scale: 0.94, filter: 'blur(6px)' },
                      visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className="relative flex flex-col rounded-[20px] p-6 overflow-hidden transition-all duration-400 hover:-translate-y-1 group cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,248,245,0.9) 100%)',
                      border: '1px solid rgba(200,184,152,0.2)',
                      boxShadow: '0 8px 32px rgba(200,184,152,0.08)',
                    }}
                    onClick={() => navigate('/subscription')}
                  >
                    <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-[20px]" style={{ background: 'linear-gradient(90deg, transparent, #e8dfd0, transparent)' }} />
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #f4efe6, #e8dfd0)' }}>
                        <Sparkles size={15} className="text-[#a08c6a]" />
                      </div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-[#a08c6a]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                        {t(`homepage.${plan.nameKey}` as Parameters<typeof t>[0])}
                      </p>
                    </div>
                    <p className="mb-1 text-[2rem] leading-none text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
                      {t(`homepage.${plan.priceKey}` as Parameters<typeof t>[0])}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                      {t(`homepage.${plan.descKey}` as Parameters<typeof t>[0])}
                    </p>
                    <div className="mt-auto pt-4 flex items-center gap-2 text-[11px] text-[#a08c6a]">
                      <Check size={11} strokeWidth={2.5} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                        {language === 'vi' ? '3 lượt AI / ngày' : '3 AI try-ons / day'}
                      </span>
                    </div>
                  </motion.div>
                )
              })()}

              {/* ── STARTER — small top-right ── */}
              {(() => {
                const plan = pricingPlans[1]
                return (
                  <motion.div
                    key="starter"
                    variants={{
                      hidden: { opacity: 0, y: -30, scale: 0.94, filter: 'blur(6px)' },
                      visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className="relative flex flex-col rounded-[20px] p-6 overflow-hidden transition-all duration-400 hover:-translate-y-1 group cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, rgba(244,239,230,0.75) 0%, rgba(232,223,208,0.55) 100%)',
                      border: '1px solid rgba(200,184,152,0.25)',
                      boxShadow: '0 8px 32px rgba(160,140,106,0.08)',
                    }}
                    onClick={() => navigate('/subscription')}
                  >
                    <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-[20px]" style={{ background: 'linear-gradient(90deg, transparent, #c8b898, transparent)' }} />
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #e8dfd0, #d4c8b0)' }}>
                        <Zap size={15} className="text-[#8a7456]" />
                      </div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-[#8a7456]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                        {t(`homepage.${plan.nameKey}` as Parameters<typeof t>[0])}
                      </p>
                    </div>
                    <p className="mb-1 text-[2rem] leading-none text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
                      {t(`homepage.${plan.priceKey}` as Parameters<typeof t>[0])}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                      {t(`homepage.${plan.descKey}` as Parameters<typeof t>[0])}
                    </p>
                    <div className="mt-auto pt-4 flex items-center gap-2 text-[11px] text-[#8a7456]">
                      <Check size={11} strokeWidth={2.5} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                        {language === 'vi' ? '20 lượt AI / tháng' : '20 AI try-ons / mo'}
                      </span>
                    </div>
                  </motion.div>
                )
              })()}

              {/* ── PREMIUM — wide bottom card spanning 2 cols ── */}
              {(() => {
                const plan = pricingPlans[3]
                return (
                  <motion.div
                    key="premium"
                    variants={{
                      hidden: { opacity: 0, y: 30, scale: 0.94, filter: 'blur(6px)' },
                      visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className="relative flex flex-col justify-between rounded-[20px] p-6 overflow-hidden transition-all duration-400 hover:-translate-y-1 group cursor-pointer lg:col-span-2 lg:flex-row lg:items-center"
                    style={{
                      background: 'linear-gradient(120deg, rgba(26,23,20,0.05) 0%, rgba(200,184,152,0.09) 50%, rgba(244,239,230,0.6) 100%)',
                      border: '1px solid rgba(200,184,152,0.28)',
                      boxShadow: '0 12px 40px rgba(200,184,152,0.10)',
                    }}
                    onClick={() => navigate('/subscription')}
                  >
                    {/* Animated shimmer line across bottom */}
                    <motion.div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-[1px]"
                      style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(200,184,152,0.5) 50%, transparent 100%)' }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    />
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #2c2419, #1a1714)' }}>
                        <Star size={18} className="fill-[#c8b898] text-[#c8b898]" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-[#6b5a3e] mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                          {t(`homepage.${plan.nameKey}` as Parameters<typeof t>[0])}
                        </p>
                        <p className="text-[1.8rem] leading-none text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}>
                          {t(`homepage.${plan.priceKey}` as Parameters<typeof t>[0])}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
                      {[
                        language === 'vi' ? 'Không giới hạn' : 'Unlimited',
                        language === 'vi' ? 'Tất cả tính năng' : 'All features',
                        language === 'vi' ? 'Hỗ trợ ưu tiên' : 'Priority support',
                      ].map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[#c8b898]/30 bg-white/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-[#6b5a3e]"
                          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 mt-4 lg:mt-0 text-[#8a7456] group-hover:text-[#6b5a3e] transition-colors">
                      <span className="text-[11px] uppercase tracking-[0.14em]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                        {language === 'vi' ? 'Khám phá' : 'Explore'}
                      </span>
                      <ChevronRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                  </motion.div>
                )
              })()}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={activeSection === 'pricing' ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.55, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center"
            >
              <button
                onClick={() => navigate('/subscription')}
                className="group flex items-center gap-2.5 rounded-xl bg-[#1a1a1a] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-black"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
              >
                {t('homepage.pricingCta')}
                <ChevronRight size={13} className="opacity-60 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
              </button>
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 cursor-pointer z-10 hidden md:block"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            onClick={() => scrollToSection('stats')}
          >
            <ChevronDown size={28} className="text-[#c8b898]/60 opacity-80 hover:opacity-100 transition-opacity" />
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════
            Section 7: Stats / Social Proof
        ═══════════════════════════════════════════════════ */}
        <section
          id="stats"
          className="w-full min-h-[100dvh] md:h-screen flex flex-col justify-center items-center relative overflow-hidden pt-[72px]"
          style={{ background: 'linear-gradient(135deg, #1a1714 0%, #1c1815 100%)' }}
        >
          {/* Background image overlay */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <img
              src="https://res.cloudinary.com/dgz3rhiv4/image/upload/v1781088227/section_2_uurhnf.png"
              alt="Stats Background"
              className="h-full w-full object-cover opacity-15 mix-blend-overlay"
              loading="lazy"
            />
            {/* Dark overlay gradient to ensure high text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1714]/60 via-[#1a1714]/30 to-[#1a1714]/80" />
          </div>

          {/* Grid texture overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04] z-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(200,184,152,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(200,184,152,0.3) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          {/* Radial glow */}
          <div className="pointer-events-none absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(200,184,152,0.06) 0%, transparent 70%)' }} />

          <div className="relative mx-auto max-w-[1440px] w-full px-6 text-center z-10">
            {/* Stats: Glow-blur reveal on dark background */}
            <motion.p
              initial={{ opacity: 0, filter: 'blur(10px)', letterSpacing: '0.6em' }}
              animate={activeSection === 'stats' ? { opacity: 1, filter: 'blur(0px)', letterSpacing: '0.26em' } : { opacity: 0, filter: 'blur(10px)', letterSpacing: '0.6em' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mb-3 text-[11px] uppercase tracking-[0.26em] text-[#c8b898]/70"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
            >
              {t('homepage.statsLabel')}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, filter: 'blur(24px)', scale: 0.95, textShadow: '0 0 40px rgba(200,184,152,0)' }}
              animate={activeSection === 'stats'
                ? { opacity: 1, filter: 'blur(0px)', scale: 1, textShadow: '0 0 0px rgba(200,184,152,0)' }
                : { opacity: 0, filter: 'blur(24px)', scale: 0.95, textShadow: '0 0 40px rgba(200,184,152,0)' }}
              transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="mb-16 text-[clamp(1.5rem,3vw,2.5rem)] text-white"
              style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
            >
              {t('homepage.statsTitle')}
            </motion.h2>

            <motion.div
              initial="hidden"
              animate={activeSection === 'stats' ? 'visible' : 'hidden'}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.15 } }
              }}
              className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-16"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 50, scale: 0.85, filter: 'blur(12px)' },
                    visible: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                  }}
                  className="flex flex-col items-center gap-3"
                >
                  {/* Gold decorative top line */}
                  <div className="mb-2 h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, #c8b898, transparent)' }} />
                  <span
                    className="text-[clamp(2.2rem,5vw,3.8rem)] leading-none text-white"
                    style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
                  >
                    {t(`homepage.${stat.valueKey}` as Parameters<typeof t>[0])}
                  </span>
                  <span
                    className="text-[11px] uppercase tracking-[0.18em] text-[#c8b898]/60"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                  >
                    {t(`homepage.${stat.labelKey}` as Parameters<typeof t>[0])}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* ── Final CTA ── */}
            <motion.div
              initial={{ opacity: 0, y: 32, filter: 'blur(12px)' }}
              animate={activeSection === 'stats' ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 32, filter: 'blur(12px)' }}
              transition={{ duration: 0.8, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="mt-20 flex flex-col items-center gap-6"
            >
              {/* Decorative line */}
              <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,184,152,0.5), transparent)' }} />
              <p
                className="text-[clamp(1.8rem,4vw,3rem)] text-white text-center leading-snug"
                style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
              >
                {language === 'vi'
                  ? <>Sẵn sàng biến phòng của bạn<br />thành kiệt tác?</>
                  : <>Ready to transform your<br />space into a masterpiece?</>}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => navigate('/ai-room-planner')}
                  className="group flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-[#1a1714] transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #d4bc94 0%, #c8b898 60%, #b8a47e 100%)',
                    boxShadow: '0 4px 24px rgba(200,184,152,0.3)',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  <Sparkles size={13} />
                  {language === 'vi' ? 'Thử ngay miễn phí' : 'Try for free'}
                </button>
                <button
                  onClick={() => navigate('/subscription')}
                  className="group flex items-center gap-2 rounded-xl border px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white/60 transition-all duration-300 hover:border-[#c8b898]/40 hover:text-white"
                  style={{ border: '1px solid rgba(200,184,152,0.18)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                >
                  {language === 'vi' ? 'Xem các gói' : 'View plans'}
                  <ChevronRight size={12} className="opacity-40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* ── Mini footer bar — pinned to bottom of stats section ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={activeSection === 'stats' ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 1, ease: 'easeOut' }}
            className="relative z-10 w-full border-t px-6 py-5 md:px-16"
            style={{ borderColor: 'rgba(200,184,152,0.1)' }}
          >
            <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 md:flex-row">
              <span
                className="text-[11px] text-[#c8b898]/30"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                {t('homepage.rightsReserved')}
              </span>
              <div className="flex items-center gap-6">
                {[
                  { label: language === 'vi' ? 'Khám phá' : 'Discovery', href: '/discovery' },
                  { label: language === 'vi' ? 'Bộ sưu tập' : 'Collections', href: '/collections' },
                  { label: language === 'vi' ? 'Gói đăng ký' : 'Subscription', href: '/subscription' },
                  { label: t('homepage.privacy'), href: '#' },
                  { label: t('homepage.terms'), href: '#' },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => {
                      if (!link.href.startsWith('#')) {
                        e.preventDefault()
                        navigate(link.href)
                      }
                    }}
                    className="text-[11px] text-[#c8b898]/40 transition-colors duration-300 hover:text-[#c8b898]/80"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════
          Side Dot Navigation (desktop only)
      ═══════════════════════════════════════════════════ */}
      <div className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3.5 md:flex">
        {dotNavItems.map((sec) => {
          const isActive = activeSection === sec.id
          return (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className="group relative flex items-center justify-end"
              aria-label={`Scroll to ${sec.label}`}
            >
              <span
                className="absolute right-8 scale-95 rounded-lg bg-black/90 px-3 py-1.5 text-[10px] tracking-wider text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
                style={{ fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}
              >
                {sec.label}
              </span>
              <div
                className={`h-2 rounded-full transition-all duration-300 ${isActive
                  ? 'w-5 bg-[#a08c6a]'
                  : 'w-2 bg-neutral-300 hover:bg-neutral-500'
                  }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Hompage