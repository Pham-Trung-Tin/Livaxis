import { AnimatePresence, motion } from 'motion/react'
import { Crown, Menu, Package, Shield, ShoppingBag, User, X, Mail, Phone, Camera, Check, AlertCircle } from 'lucide-react'
import { useEffect, useMemo, useState, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth-context'
import { uploadAvatar } from '../services/authApi'

type TabType = 'personal' | 'designs' | 'orders' | 'subscription' | 'security'

type ProfilePageProps = {
  defaultTab?: TabType
}

const navItems = [
  { id: 'personal' as TabType, label: 'Personal Info', icon: User },
  { id: 'designs' as TabType, label: 'My Designs', icon: Package },
  { id: 'orders' as TabType, label: 'Orders', icon: ShoppingBag },
  { id: 'subscription' as TabType, label: 'Subscription Plan', icon: Crown },
  { id: 'security' as TabType, label: 'Security', icon: Shield },
]

export default function UserProfilePage({ defaultTab = 'personal' }: ProfilePageProps) {
  const navigate = useNavigate()
  const { user, loading, setUser } = useAuth()
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
      setAvatarError('File is too large. Max 2MB allowed.')
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
        setAvatarSuccess('Avatar updated successfully!')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      setAvatarError(err.message || 'Failed to upload avatar')
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
        Loading profile...
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
                  Welcome Back,
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
                Account Settings
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
                        {item.label}
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
                          {item.label}
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
                    Personal Information
                  </h2>
                  <p className="mb-10 text-[13px] text-neutral-500" style={{ fontWeight: 300 }}>
                    Update your personal details and contact information
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
                              <span className="text-[9px] font-medium text-white uppercase tracking-wider">Update</span>
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
                              Standard Member
                            </span>
                          </div>
                          <p className="text-[13px] text-neutral-400 mt-0.5 truncate" style={{ fontWeight: 300 }}>
                            {email || user.email}
                          </p>
                        </div>

                        {isEditing && (
                          <div className="sm:self-center">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleAvatarChange}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={triggerFileInput}
                              disabled={avatarUploading}
                              className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-[11px] font-medium text-neutral-700 shadow-sm transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50"
                            >
                              {avatarUploading ? 'Uploading...' : 'Upload New'}
                            </button>
                          </div>
                        )}
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
                          Full Name
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
                          Phone Number
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
                            Email Address
                          </label>
                          {user.emailVerified && (
                            <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                              <Check size={12} strokeWidth={2.5} /> Verified
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
                            Edit Profile
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
                              Cancel
                            </span>
                          </button>
                          <button 
                            type="submit" 
                            disabled={saving} 
                            className="group flex items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] px-8 py-3.5 text-white transition-all duration-300 hover:bg-black hover:shadow-lg hover:shadow-black/5 disabled:opacity-50 cursor-pointer"
                          >
                            <span className="text-[12px] uppercase tracking-wider font-semibold">
                              {saving ? 'Saving...' : 'Save Changes'}
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
                    Subscription Plan
                  </h2>
                  <p className="mb-10 text-[13px] text-neutral-500" style={{ fontWeight: 300 }}>
                    Manage your subscription and billing information
                  </p>

                  <div className="mb-8 rounded-2xl border border-white/10 p-8" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
                    <div className="mb-6 flex items-start justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <Crown size={20} className="text-[#c8b898]" strokeWidth={1.5} />
                          <h3 className="text-[20px] tracking-tight text-white" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                            Standard Plan
                          </h3>
                        </div>
                        <p className="text-[13px] text-white/70" style={{ fontWeight: 300 }}>
                          49,000 VND per month
                        </p>
                      </div>
                      <div className="rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wider" style={{ backgroundColor: 'rgba(200,184,152,0.2)', color: '#c8b898', fontWeight: 500 }}>
                        Active
                      </div>
                    </div>

                    <div className="mb-6 space-y-3">
                      <p className="text-[13px] text-white/80" style={{ fontWeight: 300 }}>
                        5 AI Room Try-On generations per month
                      </p>
                      <p className="text-[13px] text-white/80" style={{ fontWeight: 300 }}>
                        Save up to 10 room designs
                      </p>
                      <p className="text-[13px] text-white/80" style={{ fontWeight: 300 }}>
                        Priority customer support
                      </p>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="mb-1 text-[11px] uppercase tracking-wide text-white/60" style={{ fontWeight: 400 }}>
                            Next Billing Date
                          </p>
                          <p className="text-[14px] text-white" style={{ fontWeight: 500 }}>
                            May 14, 2026
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-[11px] uppercase tracking-wide text-white/60" style={{ fontWeight: 400 }}>
                            Amount
                          </p>
                          <p className="text-[14px] text-white" style={{ fontWeight: 500 }}>
                            49,000 VND
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-neutral-50 p-6">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <h4 className="mb-1 text-[16px] text-black" style={{ fontWeight: 600 }}>
                          Need more AI generations?
                        </h4>
                        <p className="text-[13px] text-neutral-600" style={{ fontWeight: 300 }}>
                          Upgrade to Premium for unlimited AI Try-Ons and exclusive benefits
                        </p>
                      </div>
                      <button onClick={handleUpgrade} className="shrink-0 rounded-lg bg-[#1a1a1a] px-8 py-3 text-white transition-all duration-300 hover:bg-black">
                        <span className="text-[12px] uppercase tracking-[0.15em]" style={{ fontWeight: 500 }}>
                          Upgrade Plan
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'designs' && (
                <motion.div key="designs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="rounded-2xl bg-white p-8 lg:p-10">
                  <h2 className="mb-2 text-[26px] tracking-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                    My Designs
                  </h2>
                  <p className="mb-10 text-[13px] text-neutral-500" style={{ fontWeight: 300 }}>
                    Your saved AI Room Planner designs and visualizations
                  </p>
                  <div className="py-12 text-center text-neutral-400">
                    No saved designs yet. Start creating with AI Room Planner.
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="rounded-2xl bg-white p-8 lg:p-10">
                  <h2 className="mb-2 text-[26px] tracking-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                    Order History
                  </h2>
                  <p className="mb-10 text-[13px] text-neutral-500" style={{ fontWeight: 300 }}>
                    View and track your furniture orders
                  </p>
                  <div className="py-12 text-center text-neutral-400">
                    No orders yet. Browse our collections to get started.
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="rounded-2xl bg-white p-8 lg:p-10">
                  <h2 className="mb-2 text-[26px] tracking-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                    Security Settings
                  </h2>
                  <p className="mb-10 text-[13px] text-neutral-500" style={{ fontWeight: 300 }}>
                    Manage your password and security preferences
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-neutral-200 py-4">
                      <div>
                        <h4 className="mb-1 text-[14px] text-black" style={{ fontWeight: 500 }}>
                          Password
                        </h4>
                        <p className="text-[12px] text-neutral-500" style={{ fontWeight: 300 }}>
                          Last changed 3 months ago
                        </p>
                      </div>
                      <button onClick={() => navigate('/forgot-password')} className="rounded-lg border border-neutral-300 px-5 py-2.5 text-[12px] transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50">
                        <span style={{ fontWeight: 500 }}>Change Password</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-b border-neutral-200 py-4">
                      <div>
                        <h4 className="mb-1 text-[14px] text-black" style={{ fontWeight: 500 }}>
                          Two-Factor Authentication
                        </h4>
                        <p className="text-[12px] text-neutral-500" style={{ fontWeight: 300 }}>
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button className="rounded-lg border border-neutral-300 px-5 py-2.5 text-[12px] transition-all duration-200 hover:border-neutral-400 hover:bg-neutral-50">
                        <span style={{ fontWeight: 500 }}>Enable</span>
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