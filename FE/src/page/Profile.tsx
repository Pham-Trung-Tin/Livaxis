import { AnimatePresence, motion } from 'motion/react'
import { Crown, Menu, Package, Shield, ShoppingBag, User, X, Mail, Phone, Camera, Check, AlertCircle, Globe } from 'lucide-react'
import { useEffect, useMemo, useState, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth-context'
import { uploadAvatar } from '../services/authApi'
import { useLanguage } from '../contexts/LanguageContext'
import { useToast } from '../contexts/toast-context'

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

export default function UserProfilePage({ defaultTab = 'personal' }: ProfilePageProps) {
  const navigate = useNavigate()
  const { user, loading, setUser } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { showToast } = useToast()
  
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab)
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

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

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
                  <h2 className="mb-2 text-[26px] tracking-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                    {t('profile.myDesigns')}
                  </h2>
                  <p className="mb-10 text-[13px] text-neutral-500" style={{ fontWeight: 300 }}>
                    {t('profile.myDesignsSub')}
                  </p>
                  <div className="py-12 text-center text-neutral-400">
                    {t('profile.noSavedDesigns')}
                  </div>
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
    </div>
  )
}