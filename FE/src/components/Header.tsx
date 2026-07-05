import { motion, AnimatePresence } from 'motion/react'
import {
  ChevronDown,
  ChevronRight,
  Globe,
  Heart,
  LogOut,
  Search,
  Settings,
  Sparkles,
  User,
  Menu,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth-context'
import { useLanguage } from '../contexts/LanguageContext'
import { getAiTurns, type TurnsInfo } from '../services/aiRoomPlannerApi'

// ---------------------------------------------------------------------------
// Detect mobile screen — uses matchMedia (reliable in DevTools responsive mode)
// ---------------------------------------------------------------------------
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia('(max-width: 767px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

// ---------------------------------------------------------------------------
// Desktop Header
// ---------------------------------------------------------------------------
function DesktopHeader() {
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

                      <div
                        style={{
                          margin: '12px',
                          borderRadius: 14,
                          border: '1px solid rgba(0,0,0,0.07)',
                          background: 'linear-gradient(135deg, #fdfcfa 0%, #f8f4ee 100%)',
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px 10px' }}>
                          <div style={{
                            width: 30, height: 30,
                            borderRadius: 8,
                            background: turnsInfo?.unlimited
                              ? 'linear-gradient(135deg, #e8f5e9, #c8e6c9)'
                              : 'linear-gradient(135deg, rgba(200,184,152,0.2), rgba(200,184,152,0.4))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <Sparkles size={14} color={turnsInfo?.unlimited ? '#2e7d32' : '#8a7456'} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{
                              margin: 0, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em',
                              color: 'rgba(0,0,0,0.4)', fontFamily: 'Inter, sans-serif', fontWeight: 600,
                              marginBottom: 2
                            }}>
                              {t('homepage.aiTurns')}
                            </p>
                            <p style={{
                              margin: 0, fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#1a1a1a'
                            }}>
                              {turnsInfo?.unlimited ? 'Unlimited' : (turnsInfo?.remaining ?? 0)} remaining
                            </p>
                          </div>
                        </div>

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
                          { icon: User, label: t('profile.personalInfo'), sub: t('profile.personalInfoSub'), href: '/profile?tab=personal' },
                          { icon: Heart, label: t('profile.myDesigns'), sub: t('profile.myDesignsSub'), href: '/profile?tab=designs' },
                          { icon: Settings, label: t('profile.accountSettings'), sub: t('profile.personalInfoSub'), href: '/profile?tab=personal' },
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
                          { icon: Heart, label: t('profile.myDesigns'), sub: t('profile.myDesignsSub'), href: '/profile?tab=designs' },
                          { icon: Settings, label: t('profile.personalInfo'), sub: t('profile.personalInfoSub'), href: '/profile?tab=personal' },
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
                      </div>
                    </>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

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

// ---------------------------------------------------------------------------
// Mobile Header
// ---------------------------------------------------------------------------
function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()
  const { user } = useAuth()

  const navLinks = [
    { label: t('common.discovery'), href: '/discovery' },
    { label: t('common.collections'), href: '/collections' },
    { label: t('common.subscription'), href: '/subscription' },
  ]

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-md">
        <div className="flex h-[60px] items-center justify-between px-5">
          <button onClick={() => navigate('/')} style={{ fontFamily: 'Playfair Display, serif' }}>
            <span className="text-[20px] font-semibold tracking-[0.08em]">LIVAXIS</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="flex items-center gap-1 rounded-full border border-[#c8b898]/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#6f5a41]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Globe size={11} strokeWidth={1.5} />
              {language.toUpperCase()}
            </button>
            <button onClick={() => setMenuOpen(true)} className="text-neutral-600">
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-[99] bg-black/30 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: menuOpen ? 0 : '100%' }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="fixed right-0 top-0 z-[100] flex h-full w-[80vw] max-w-[320px] flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
          <span className="text-[18px] font-semibold tracking-[0.08em]" style={{ fontFamily: 'Playfair Display, serif' }}>
            LIVAXIS
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100"
          >
            <X size={18} strokeWidth={1.5} className="text-neutral-600" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-4 pt-6">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => { setMenuOpen(false); navigate(link.href) }}
              className="flex items-center justify-between rounded-xl px-4 py-3.5 text-left text-[15px] text-neutral-800 transition-colors hover:bg-[#faf8f5]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {link.label}
              <ChevronRight size={14} className="text-neutral-300" />
            </button>
          ))}
        </nav>

        <div className="mx-4 mt-4 h-px bg-neutral-100" />

        <div className="px-4 pt-4">
          <button
            onClick={() => { setMenuOpen(false); navigate('/ai-room-planner') }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1714] py-3.5 text-[12px] uppercase tracking-[0.15em] text-white"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            <Sparkles size={14} />
            {t('homepage.aiRoomPlanner')}
          </button>
        </div>

        <div className="mt-auto border-t border-neutral-100 px-4 py-5">
          {user ? (
            <button
              onClick={() => { setMenuOpen(false); navigate('/profile') }}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3ede3] text-[12px] font-semibold text-[#6f5a41] overflow-hidden">
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                  : user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[13px] font-medium text-black" style={{ fontFamily: 'Inter, sans-serif' }}>{user.name}</p>
                <p className="text-[11px] text-neutral-400" style={{ fontFamily: 'Inter, sans-serif' }}>{user.email}</p>
              </div>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setMenuOpen(false); navigate('/sign-in') }}
                className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-[12px] text-neutral-700"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                {t('auth.signIn')}
              </button>
              <button
                onClick={() => { setMenuOpen(false); navigate('/sign-up') }}
                className="flex-1 rounded-xl bg-[#1a1714] py-2.5 text-[12px] text-white"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                {t('auth.createAccount')}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Header Router (Responsive)
// ---------------------------------------------------------------------------
export function Header() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileHeader /> : <DesktopHeader />
}
