import { AnimatePresence, motion } from 'motion/react'
import { Crown, Menu, Package, Shield, ShoppingBag, User, X, Mail, Phone, Camera, Check, AlertCircle, Globe, Calendar, Trash2, ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState, useRef, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/auth-context'
import { uploadAvatar } from '../services/authApi'
import { useLanguage } from '../contexts/LanguageContext'
import { useToast } from '../contexts/toast-context'
import { getUserDesigns, deleteDesign, type UserDesign } from '../services/designApi'

type TabType = 'personal' | 'designs' | 'orders' | 'subscription' | 'security' | 'language'

type ProfilePageProps = {
  defaultTab?: TabType
}

const navItems = [
  { id: 'personal' as TabType, labelKey: 'profile.personalInfo', icon: User },
  { id: 'designs' as TabType, labelKey: 'profile.myDesigns', icon: Package },
  { id: 'orders' as TabType, labelKey: 'profile.orders', icon: ShoppingBag },
  { id: 'subscription' as TabType, labelKey: 'profile.subscriptionPlan', icon: Crown },
  { id: 'security' as TabType, labelKey: 'profile.security', icon: Shield },
  { id: 'language' as TabType, labelKey: 'profile.language', icon: Globe },
]

// Before/After Hover Slider Card Component
function DesignCard({ design, onClick, onDelete }: { design: UserDesign; onClick: () => void; onDelete: (e: React.MouseEvent) => void }) {
  const [hoverPos, setHoverPos] = useState(50);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setHoverPos(percentage);
  };

  const formattedDate = new Date(design.createdAt).toLocaleDateString(
    undefined,
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  return (
    <div 
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoverPos(50);
      }}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer h-full"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100 select-none">
        <img 
          src={design.afterImageUrl} 
          alt={design.name} 
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div 
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - hoverPos}% 0 0)` }}
        >
          <img 
            src={design.beforeImageUrl} 
            alt="Before" 
            className="absolute inset-0 h-full w-full object-cover"
            style={{ width: cardRef.current?.getBoundingClientRect().width || '100%', height: '100%' }}
          />
        </div>

        {isHovered && (
          <div 
            className="absolute top-0 bottom-0 w-[2px] bg-white shadow-lg pointer-events-none"
            style={{ left: `${hoverPos}%` }}
          />
        )}

        {!isHovered && (
          <div className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 text-[9px] font-medium tracking-wider text-white uppercase opacity-0 group-hover:opacity-100 transition-opacity">
            Hover to Compare
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h4 className="text-[14px] font-semibold text-neutral-900 group-hover:text-black line-clamp-1 mb-1">
          {design.name}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-auto">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formattedDate}
          </span>
          <span className="text-neutral-500 font-medium group-hover:underline flex items-center gap-0.5">
            View details <ArrowRight size={10} />
          </span>
        </div>
      </div>

      <button
        onClick={onDelete}
        className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-500 shadow hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200"
        title="Delete design"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function UserProfilePage({ defaultTab = 'personal' }: ProfilePageProps) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, loading, setUser } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { showToast } = useToast()
  
  const tabQuery = searchParams.get('tab') as TabType
  
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const validTabs: TabType[] = ['personal', 'designs', 'orders', 'subscription', 'security', 'language']
    if (tabQuery && validTabs.includes(tabQuery)) {
      return tabQuery
    }
    return defaultTab
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('+1 (555) 123-4567')
  const [nameFocused, setNameFocused] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Designs states
  const [designs, setDesigns] = useState<UserDesign[]>([])
  const [loadingDesigns, setLoadingDesigns] = useState(false)
  const [selectedDesign, setSelectedDesign] = useState<UserDesign | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [productsList, setProductsList] = useState<any[]>([])
  const [sliderPosDetail, setSliderPosDetail] = useState(50)

  // Sync activeTab when defaultTab changes (if any external prop change)
  useEffect(() => {
    if (!tabQuery) {
      setActiveTab(defaultTab)
    }
  }, [defaultTab, tabQuery])

  // Sync search parameters when activeTab changes
  useEffect(() => {
    const validTabs: TabType[] = ['personal', 'designs', 'orders', 'subscription', 'security', 'language']
    if (validTabs.includes(activeTab)) {
      setSearchParams({ tab: activeTab }, { replace: true })
    }
  }, [activeTab, setSearchParams])

  // Sync activeTab when URL search parameters change externally
  useEffect(() => {
    const validTabs: TabType[] = ['personal', 'designs', 'orders', 'subscription', 'security', 'language']
    if (tabQuery && validTabs.includes(tabQuery) && tabQuery !== activeTab) {
      setActiveTab(tabQuery)
    }
  }, [tabQuery, activeTab])

  // Load user designs and product catalog
  useEffect(() => {
    if (activeTab === 'designs') {
      setLoadingDesigns(true)
      getUserDesigns()
        .then((data) => setDesigns(data))
        .catch((err) => console.error("Failed to load designs:", err))
        .finally(() => setLoadingDesigns(false))

      // Also fetch catalog products to map Shopee links and images
      fetch('/api/products?limit=100')
        .then(r => r.json())
        .then(res => {
          if (res.success && res.data?.items) {
            setProductsList(res.data.items);
          }
        })
        .catch(e => console.error("Failed to load products list:", e));
    }
  }, [activeTab])

  // Delete Design helper
  const handleDeleteDesign = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!window.confirm(language === 'vi' ? 'Bạn có chắc chắn muốn xóa thiết kế này?' : 'Are you sure you want to delete this design?')) {
      return
    }
    setDeletingId(id)
    try {
      await deleteDesign(id)
      setDesigns(prev => prev.filter(d => d._id !== id))
      showToast({ 
        title: language === 'vi' ? 'Xóa thành công!' : 'Deleted successfully!', 
        description: language === 'vi' ? 'Thiết kế đã được xóa khỏi tài khoản.' : 'The design has been removed.' 
      })
      if (selectedDesign?._id === id) {
        setSelectedDesign(null)
      }
    } catch (err: any) {
      console.error(err)
      showToast({ 
        title: language === 'vi' ? 'Xóa thất bại' : 'Failed to delete', 
        description: err.message 
      })
    } finally {
      setDeletingId(null)
    }
  }

  // Continue Editing helper
  const handleContinueEditing = (design: UserDesign) => {
    navigate('/ai-room-planner', {
      state: {
        roomImageUrl: design.afterImageUrl,
        placements: design.products,
        name: design.name,
      }
    })
  }

  useEffect(() => {
    if (!loading && !user) {
      navigate('/sign-in')
    }
  }, [loading, navigate, user])

  useEffect(() => {
    setFullName(user?.name ?? 'Alexandra Chen')
    setEmail(user?.email ?? 'user@gmail.com')
  }, [user])

  const userInitials = useMemo(() => {
    if (!user?.name) {
      return 'U'
    }

    return user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')
  }, [user])

  const handleSaveChanges = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      setIsEditing(false)
    }, 1200)
  }

  const handleCancelEdit = () => {
    setFullName(user?.name ?? 'Alexandra Chen')
    setEmail(user?.email ?? 'alexandra.chen@design.com')
    setPhone('+1 (555) 123-4567')
    setIsEditing(false)
    setAvatarError(null)
    setAvatarSuccess(null)
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError(t('profile.avatarSizeError'))
      setAvatarSuccess(null)
      return
    }

    setAvatarUploading(true)
    setAvatarError(null)
    setAvatarSuccess(null)

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await uploadAvatar(formData)
      if (response?.data?.user) {
        setUser(response.data.user)
        setAvatarSuccess(t('profile.avatarSuccess'))
      } else {
        throw new Error(t('auth.invalidResponse'))
      }
    } catch (err: any) {
      setAvatarError(err.message || t('profile.avatarError'))
    } finally {
      setAvatarUploading(false)
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleUpgrade = () => {
    navigate('/subscription')
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5f0] px-6 text-center text-neutral-500">
        {t('profile.loadingProfile')}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-12">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/')} className="group">
              <h1 className="text-[22px] tracking-tight text-black transition-opacity group-hover:opacity-70" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                LIVAXIS
              </h1>
            </button>
 
            <div className="hidden items-center gap-3 md:flex">
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wide text-neutral-500" style={{ fontWeight: 400 }}>
                  {t('profile.welcomeBack')}
                </p>
                <p className="text-[13px] text-black" style={{ fontWeight: 500 }}>
                  {user.email}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1a] overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[12px] font-semibold text-white">{userInitials}</span>
                )}
              </div>
            </div>
 
            <button onClick={() => setMobileMenuOpen((value) => !value)} className="flex h-10 w-10 items-center justify-center md:hidden">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
 
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-6 rounded-2xl bg-white p-6">
              <h2 className="mb-6 text-[18px] tracking-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                {t('profile.accountSettings')}
              </h2>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
 
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${isActive ? 'bg-[#1a1a1a] text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}
                    >
                      <Icon size={18} strokeWidth={1.5} />
                      <span className="text-[13px]" style={{ fontWeight: isActive ? 500 : 400 }}>
                        {t(item.labelKey)}
                      </span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>
 
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden rounded-2xl bg-white lg:hidden"
              >
                <nav className="space-y-1 p-4">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.id
 
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id)
                          setMobileMenuOpen(false)
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${isActive ? 'bg-[#1a1a1a] text-white' : 'text-neutral-700 hover:bg-neutral-100'}`}
                      >
                        <Icon size={18} strokeWidth={1.5} />
                        <span className="text-[13px]" style={{ fontWeight: isActive ? 500 : 400 }}>
                          {t(item.labelKey)}
                        </span>
                      </button>
                    )
                  })}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'personal' && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl bg-white p-8 lg:p-10"
                >
                  <h2 className="mb-2 text-[26px] tracking-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                    {t('profile.personalInfo')}
                  </h2>
                  <p className="mb-10 text-[13px] text-neutral-500" style={{ fontWeight: 300 }}>
                    {t('profile.personalInfoSub')}
                  </p>

                  <div className="mb-8 overflow-hidden rounded-2xl border border-neutral-100 bg-[#faf9f6]">
                    {/* Premium Profile Banner */}
                    <div className="h-28 w-full bg-gradient-to-r from-[#f3ece0] via-[#ebe3d5] to-[#dfd5c4]" />
                    
                    {/* Profile Header Info */}
                    <div className="relative px-6 pb-6 sm:px-8">
                      <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12">
                        {/* Avatar container with hover upload effect */}
                        <div 
                          onClick={isEditing ? triggerFileInput : undefined}
                          className={`group relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-[#1a1a1a] shadow-md transition-all duration-300 shrink-0 ${isEditing ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
                        >
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-[28px] font-semibold text-white">{userInitials}</span>
                          )}
                          {isEditing && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              <Camera size={18} className="text-white mb-0.5" />
                              <span className="text-[9px] font-medium text-white uppercase tracking-wider">{t('profile.updateBtn')}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[20px] tracking-tight text-black truncate" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                              {fullName || user.name}
                            </h3>
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#c8b898]/15 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-[#8a7456] shrink-0">
                              <Crown size={10} />
                              {t('profile.standardMember')}
                            </span>
                          </div>
                          <p className="text-[13px] text-neutral-400 mt-0.5 truncate" style={{ fontWeight: 300 }}>
                            {email || user.email}
                          </p>
                        </div>

                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleAvatarChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>

                      {/* Status alerts */}
                      {(avatarSuccess || avatarError) && (
                        <div className="mt-4">
                          {avatarSuccess && (
                            <div className="flex items-center gap-2 rounded-lg bg-emerald-50/65 px-4 py-2.5 text-[12px] text-emerald-700 border border-emerald-100/80">
                              <Check size={14} />
                              <span>{avatarSuccess}</span>
                            </div>
                          )}
                          {avatarError && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50/65 px-4 py-2.5 text-[12px] text-red-700 border border-red-100/80">
                              <AlertCircle size={14} />
                              <span>{avatarError}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSaveChanges} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <label htmlFor="fullName" className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                          {t('profile.fullName')}
                        </label>
                        <div className="relative flex items-center">
                          <User size={16} className={`absolute left-4 transition-colors duration-200 ${nameFocused ? 'text-[#a08c6a]' : 'text-neutral-300'}`} strokeWidth={1.5} />
                          <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                            onFocus={() => setNameFocused(true)}
                            onBlur={() => setNameFocused(false)}
                            required
                            disabled={!isEditing}
                            className={`w-full rounded-xl border py-3.5 pl-11 pr-4 text-[14px] text-black outline-none transition-all duration-300 ${
                              isEditing 
                                ? nameFocused 
                                  ? 'border-[#c8b898] bg-white shadow-sm shadow-[#c8b898]/10' 
                                  : 'border-neutral-200 bg-[#faf9f6]/40 hover:border-neutral-300'
                                : 'border-transparent bg-neutral-50/50 cursor-not-allowed text-neutral-700'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                          {t('profile.phoneNumber')}
                        </label>
                        <div className="relative flex items-center">
                          <Phone size={16} className={`absolute left-4 transition-colors duration-200 ${phoneFocused ? 'text-[#a08c6a]' : 'text-neutral-300'}`} strokeWidth={1.5} />
                          <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            onFocus={() => setPhoneFocused(true)}
                            onBlur={() => setPhoneFocused(false)}
                            disabled={!isEditing}
                            className={`w-full rounded-xl border py-3.5 pl-11 pr-4 text-[14px] text-black outline-none transition-all duration-300 ${
                              isEditing 
                                ? phoneFocused 
                                  ? 'border-[#c8b898] bg-white shadow-sm shadow-[#c8b898]/10' 
                                  : 'border-neutral-200 bg-[#faf9f6]/40 hover:border-neutral-300'
                                : 'border-transparent bg-neutral-50/50 cursor-not-allowed text-neutral-700'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Email Address */}
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex justify-between items-center">
                          <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                            {t('profile.emailAddress')}
                          </label>
                          {user.emailVerified && (
                            <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                              <Check size={12} strokeWidth={2.5} /> {t('profile.verified')}
                            </span>
                          )}
                        </div>
                        <div className="relative flex items-center">
                          <Mail size={16} className={`absolute left-4 transition-colors duration-200 ${emailFocused ? 'text-[#a08c6a]' : 'text-neutral-300'}`} strokeWidth={1.5} />
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                            required
                            disabled={!isEditing}
                            className={`w-full rounded-xl border py-3.5 pl-11 pr-4 text-[14px] text-black outline-none transition-all duration-300 ${
                              isEditing 
                                ? emailFocused 
                                  ? 'border-[#c8b898] bg-white shadow-sm shadow-[#c8b898]/10' 
                                  : 'border-neutral-200 bg-[#faf9f6]/40 hover:border-neutral-300'
                                : 'border-transparent bg-neutral-50/50 cursor-not-allowed text-neutral-700'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      {!isEditing ? (
                        <button 
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-8 py-3.5 text-black transition-all duration-300 hover:bg-neutral-50 cursor-pointer"
                        >
                          <span className="text-[12px] uppercase tracking-wider font-semibold">
                            {t('profile.editProfile')}
                          </span>
                        </button>
                      ) : (
                        <>
                          <button 
                            type="button"
                            onClick={handleCancelEdit}
                            className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-3.5 text-neutral-500 transition-all duration-300 hover:bg-neutral-50 cursor-pointer"
                          >
                            <span className="text-[12px] uppercase tracking-wider font-semibold">
                              {t('common.cancel')}
                            </span>
                          </button>
                          <button 
                            type="submit" 
                            disabled={saving} 
                            className="group flex items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] px-8 py-3.5 text-white transition-all duration-300 hover:bg-black hover:shadow-lg hover:shadow-black/5 disabled:opacity-50 cursor-pointer"
                          >
                            <span className="text-[12px] uppercase tracking-wider font-semibold">
                              {saving ? t('common.saving') : t('common.save')}
                            </span>
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'subscription' && (
                <motion.div
                  key="subscription"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl bg-white p-8 lg:p-10"
                >
                  <h2 className="mb-2 text-[26px] tracking-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                    {language === 'vi' ? 'Lượt thử AI của bạn' : 'Your AI Turns'}
                  </h2>
                  <p className="mb-10 text-[13px] text-neutral-500" style={{ fontWeight: 300 }}>
                    {language === 'vi' ? 'Quản lý số lượt sử dụng AI và số lượt mua thêm của bạn' : 'Manage your AI generation turns and purchased credit balance'}
                  </p>

                  <div className="mb-8 rounded-2xl border border-white/10 p-8" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
                    <div className="mb-6 flex items-start justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <Crown size={20} className="text-[#c8b898]" strokeWidth={1.5} />
                          <h3 className="text-[20px] tracking-tight text-white" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                            {language === 'vi' ? 'Hạng thành viên' : 'Membership Level'}
                          </h3>
                        </div>
                        <p className="text-[13px] text-white/70" style={{ fontWeight: 300 }}>
                          {language === 'vi' ? 'Tài khoản Livaxis Standard (3 lượt miễn phí/ngày)' : 'Livaxis Standard Account (3 free turns/day)'}
                        </p>
                      </div>
                      <div className="rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wider" style={{ backgroundColor: 'rgba(200,184,152,0.2)', color: '#c8b898', fontWeight: 500 }}>
                        {language === 'vi' ? 'Đang hoạt động' : 'Active'}
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="mb-1 text-[11px] uppercase tracking-wide text-white/60" style={{ fontWeight: 400 }}>
                            {language === 'vi' ? 'Miễn phí hôm nay' : 'Daily Free Turns'}
                          </p>
                          <p className="text-[14px] text-white" style={{ fontWeight: 500 }}>
                            {Math.max(0, 3 - (user.aiTurnsUsed ?? 0))} / 3 {language === 'vi' ? 'lượt còn lại' : 'remaining'}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-[11px] uppercase tracking-wide text-white/60" style={{ fontWeight: 400 }}>
                            {language === 'vi' ? 'Lượt mua thêm' : 'Purchased Turns'}
                          </p>
                          <p className="text-[14px] text-white" style={{ fontWeight: 500 }}>
                            {user.aiTurns ?? 0} {language === 'vi' ? 'lượt' : 'turns'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-neutral-50 p-6">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <h4 className="mb-1 text-[16px] text-black" style={{ fontWeight: 600 }}>
                          {language === 'vi' ? 'Cần thêm lượt tạo trực quan bằng AI?' : 'Need more AI generations?'}
                        </h4>
                        <p className="text-[13px] text-neutral-600" style={{ fontWeight: 300 }}>
                          {language === 'vi' ? 'Mua thêm lượt thử AI bất cứ lúc nào với các gói ưu đãi giá rẻ.' : 'Purchase more AI turns at any time with our affordable one-time packages.'}
                        </p>
                      </div>
                      <button onClick={handleUpgrade} className="shrink-0 rounded-lg bg-[#1a1a1a] px-8 py-3 text-white transition-all duration-300 hover:bg-black">
                        <span className="text-[12px] uppercase tracking-[0.15em]" style={{ fontWeight: 500 }}>
                          {language === 'vi' ? 'Mua thêm lượt' : 'Buy turns'}
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'designs' && (
                <motion.div key="designs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="rounded-2xl bg-white p-8 lg:p-10">
                  <h2 className="mb-2 text-[26px] tracking-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'normal', fontWeight: 600 }}>
                    {t('profile.myDesigns')}
                  </h2>
                  <p className="mb-10 text-[13px] text-neutral-500" style={{ fontWeight: 300 }}>
                    {t('profile.myDesignsSub')}
                  </p>

                  {loadingDesigns ? (
                    <div className="py-12 text-center text-neutral-400">
                      {t('common.loading')}
                    </div>
                  ) : designs.length === 0 ? (
                    <div className="py-12 text-center text-neutral-400">
                      {t('profile.noSavedDesigns')}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {designs.map((design) => (
                        <DesignCard
                          key={design._id}
                          design={design}
                          onClick={() => {
                            setSelectedDesign(design)
                            setSliderPosDetail(50)
                          }}
                          onDelete={(e) => handleDeleteDesign(e, design._id)}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="rounded-2xl bg-white p-8 lg:p-10">
                  <h2 className="mb-2 text-[26px] tracking-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                    {t('profile.orders')}
                  </h2>
                  <p className="mb-10 text-[13px] text-neutral-500" style={{ fontWeight: 300 }}>
                    {t('profile.orderHistorySub')}
                  </p>
                  <div className="py-12 text-center text-neutral-400">
                    {t('profile.noOrders')}
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="rounded-2xl bg-white p-8 lg:p-10">
                  <h2 className="mb-2 text-[26px] tracking-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                    {t('profile.security')}
                  </h2>
                  <p className="mb-10 text-[13px] text-neutral-500" style={{ fontWeight: 300 }}>
                    {t('profile.securitySub')}
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-neutral-200 py-4">
                      <div>
                        <h4 className="mb-1 text-[14px] text-black" style={{ fontWeight: 500 }}>
                          {t('profile.password')}
                        </h4>
                        <p className="text-[12px] text-neutral-500" style={{ fontWeight: 300 }}>
                          {t('profile.lastChangedPassword')}
                        </p>
                      </div>
                      <button onClick={() => navigate('/forgot-password')} className="rounded-lg border border-neutral-300 px-5 py-2.5 text-[12px] transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50">
                        <span style={{ fontWeight: 500 }}>{t('profile.changePassword')}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-b border-neutral-200 py-4">
                      <div>
                        <h4 className="mb-1 text-[14px] text-black" style={{ fontWeight: 500 }}>
                          {t('profile.twoFactorAuth')}
                        </h4>
                        <p className="text-[12px] text-neutral-500" style={{ fontWeight: 300 }}>
                          {t('profile.twoFactorDesc')}
                        </p>
                      </div>
                      <button className="rounded-lg border border-neutral-300 px-5 py-2.5 text-[12px] transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50">
                        <span style={{ fontWeight: 500 }}>{t('profile.enable')}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'language' && (
                <motion.div
                  key="language"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl bg-white p-8 lg:p-10"
                >
                  <h2 className="mb-2 text-[26px] tracking-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                    {t('profile.language')}
                  </h2>
                  <p className="mb-10 text-[13px] text-neutral-500" style={{ fontWeight: 300 }}>
                    {t('profile.languageSub')}
                  </p>

                  <div className="space-y-6">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                      {t('profile.languageSelectLabel')}
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Vietnamese option */}
                      <button
                        type="button"
                        onClick={() => {
                          setLanguage('vi')
                          showToast({ title: 'Đã đổi ngôn ngữ hiển thị!', description: 'Ngôn ngữ hiện tại là Tiếng Việt.' })
                        }}
                        className={`flex items-center justify-between rounded-xl border p-5 text-left transition-all duration-300 ${
                          language === 'vi'
                            ? 'border-black bg-neutral-50/50 shadow-sm'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[20px]">🇻🇳</span>
                          <div>
                            <p className="text-[14px] font-semibold text-black">Tiếng Việt</p>
                            <p className="text-[12px] text-neutral-400">Vietnamese</p>
                          </div>
                        </div>
                        {language === 'vi' && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black">
                            <Check size={12} className="text-white" strokeWidth={2.5} />
                          </div>
                        )}
                      </button>

                      {/* English option */}
                      <button
                        type="button"
                        onClick={() => {
                          setLanguage('en')
                          showToast({ title: 'Language changed successfully!', description: 'Current display language is English.' })
                        }}
                        className={`flex items-center justify-between rounded-xl border p-5 text-left transition-all duration-300 ${
                          language === 'en'
                            ? 'border-black bg-neutral-50/50 shadow-sm'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[20px]">🇬🇧</span>
                          <div>
                            <p className="text-[14px] font-semibold text-black">English</p>
                            <p className="text-[12px] text-[#888]">Tiếng Anh</p>
                          </div>
                        </div>
                        {language === 'en' && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black">
                            <Check size={12} className="text-white" strokeWidth={2.5} />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
      {/* Design Detail Modal */}
      <AnimatePresence>
        {selectedDesign && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDesign(null)}
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className="fixed left-1/2 top-1/2 z-[80] w-[min(94vw,900px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl flex flex-col md:flex-row h-[min(90vh,600px)]"
            >
              {/* Left Side: Before/After Slider */}
              <div className="relative flex-1 bg-neutral-100 h-64 md:h-full overflow-hidden select-none">
                {/* After Image */}
                <img 
                  src={selectedDesign.afterImageUrl} 
                  alt="Generated Design" 
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Before Image (clipped) */}
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosDetail}% 0 0)` }}
                >
                  <img 
                    src={selectedDesign.beforeImageUrl} 
                    alt="Before Design" 
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>

                {/* Vertical split line */}
                <div 
                  className="absolute top-0 bottom-0 w-[2px] bg-white shadow-lg pointer-events-none"
                  style={{ left: `${sliderPosDetail}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-black border border-neutral-300 flex items-center justify-center font-bold text-[12px] shadow-md">
                    ↔
                  </div>
                </div>

                {/* Invisible input range covering the area */}
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosDetail}
                  onChange={(e) => setSliderPosDetail(Number(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-1.5 pointer-events-none">
                  <span className="rounded bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">Before</span>
                </div>
                <div className="absolute top-4 right-4 flex gap-1.5 pointer-events-none">
                  <span className="rounded bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">After</span>
                </div>
              </div>

              {/* Right Side: Details & Products */}
              <div className="w-full md:w-[360px] bg-white border-t md:border-t-0 md:border-l border-neutral-100 p-6 flex flex-col h-full overflow-y-auto">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-[20px] font-semibold text-black" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {selectedDesign.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-1">
                      {new Date(selectedDesign.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedDesign(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>

                {selectedDesign.prompt && (
                  <div className="mb-6 rounded-xl bg-neutral-50 p-4 border border-neutral-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">Prompt</span>
                    <p className="text-[12px] text-neutral-600 leading-relaxed italic">
                      "{selectedDesign.prompt}"
                    </p>
                  </div>
                )}

                {/* Continue Editing Button */}
                <button
                  onClick={() => handleContinueEditing(selectedDesign)}
                  className="w-full mb-6 rounded-xl bg-[#1a1a1a] py-3.5 text-white text-[13px] font-semibold uppercase tracking-wider hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <ArrowRight size={15} />
                  {language === 'vi' ? 'Tiếp tục chỉnh sửa' : 'Continue Editing'}
                </button>

                {/* Shopping List Section */}
                <div className="flex-1 flex flex-col min-h-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                    {language === 'vi' ? 'Sản phẩm trong thiết kế' : 'Products in Design'}
                  </span>
                  
                  <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                    {selectedDesign.products.length === 0 ? (
                      <p className="text-[12px] text-neutral-400 italic">
                        {language === 'vi' ? 'Không có sản phẩm catalog nào.' : 'No catalog products featured.'}
                      </p>
                    ) : (
                      selectedDesign.products.map((p, idx) => {
                        const matchedProduct = productsList.find(item => item._id === p.productId || item.id === p.productId);
                        if (!matchedProduct) return null;

                        return (
                          <div key={idx} className="flex items-center gap-3 p-2 rounded-lg border border-neutral-100 bg-[#fafafa]">
                            <img 
                              src={matchedProduct.imageUrl} 
                              alt={matchedProduct.name} 
                              className="w-12 h-12 rounded object-contain bg-white border border-neutral-200 p-1"
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-[12px] font-semibold text-neutral-900 truncate">
                                {matchedProduct.name}
                              </h5>
                              <p className="text-[10px] text-neutral-400">
                                {matchedProduct.category}
                              </p>
                            </div>
                            {matchedProduct.affiliateUrl && (
                              <a 
                                href={matchedProduct.affiliateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-md bg-[#EE4D2D] hover:bg-[#d94429] text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
                              >
                                Shop
                              </a>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Delete in modal */}
                <button
                  onClick={(e) => {
                    handleDeleteDesign(e, selectedDesign._id);
                  }}
                  className="mt-6 w-full py-2.5 text-[11px] font-semibold text-red-500 hover:text-red-700 hover:bg-red-50/50 rounded-lg transition-colors border border-dashed border-red-200"
                >
                  {language === 'vi' ? 'Xóa thiết kế này' : 'Delete Design'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}