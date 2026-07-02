import { useState } from 'react'
import { motion } from 'motion/react'
import { Phone, Mail, Send, MessageCircle, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { submitFeedback } from '../services/feedbackApi'

export function ContactSection({ activeSection }: { activeSection: string }) {
  const { language } = useLanguage()

  const isActive = activeSection === 'contact'

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    content: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.service || !formData.content) return
    setIsSubmitting(true)
    try {
      await submitFeedback({ ...formData, language })
      setIsSuccess(true)
      setFormData({ name: '', phone: '', email: '', service: '', content: '' })
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      alert(language === 'vi' ? 'Gửi phản hồi thất bại, vui lòng thử lại sau.' : 'Failed to send feedback, please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="relative flex h-[100dvh] md:h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#faf8f5] py-12 pt-20">
      {/* Subtle Background elements */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#c8b898]/5 to-transparent blur-[120px]" />
        <div className="absolute -right-1/4 bottom-0 h-[600px] w-[600px] rounded-full bg-gradient-to-tl from-[#c8b898]/5 to-transparent blur-[120px]" />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(#c8b898 1px, transparent 1px), linear-gradient(90deg, #c8b898 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col gap-16 px-6 lg:flex-row lg:items-center xl:px-12">
        {/* Left Side: Information */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 lg:pr-10 xl:pr-16"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-8 bg-[#c8b898]" />
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#a08c6a]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              {language === 'vi' ? 'Kết nối với chúng tôi' : 'Connect with us'}
            </p>
          </div>
          
          <h2
            className="mb-6 text-[clamp(2.2rem,4vw,3.5rem)] leading-[1.1] text-[#1a1a1a]"
            style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}
          >
            {language === 'vi' ? 'Livaxis tự hào khi trở thành một phần trong ngôi nhà của bạn' : 'Livaxis is proud to be a part of your home'}
          </h2>
          
          <p
            className="mb-12 max-w-[520px] text-[15px] leading-[1.7] text-neutral-500"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
          >
            {language === 'vi'
              ? 'Bạn đang tìm kiếm giải pháp thiết kế nội thất AI hiệu quả được thực thi bởi các đơn vị uy tín, chuyên nghiệp? Kết nối ngay với Livaxis để được tư vấn các chiến lược tối ưu, đạt mục tiêu nhanh chóng!'
              : 'Looking for an effective AI interior design solution executed by reputable, professional units? Connect with Livaxis now for consulting on optimal strategies and achieve your goals quickly!'}
          </p>
          
          <div className="mb-12 flex flex-col gap-8 sm:flex-row sm:gap-12 lg:flex-col lg:gap-8 xl:flex-row xl:gap-16">
            <div className="flex items-center gap-5">
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-[#a08c6a] transition-transform hover:scale-110">
                <Phone size={22} strokeWidth={1.5} />
              </div>
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-wider text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  {language === 'vi' ? 'Số điện thoại' : 'Phone Number'}
                </p>
                <p className="text-[17px] text-[#1a1a1a]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  0987 654 321
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-[#a08c6a] transition-transform hover:scale-110">
                <Mail size={22} strokeWidth={1.5} />
              </div>
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-wider text-neutral-400" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  Email
                </p>
                <p className="text-[17px] text-[#1a1a1a]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  contact@livaxis.com
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-4 text-[13px] text-neutral-500" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              {language === 'vi' ? 'Theo dõi chúng tôi qua' : 'Follow us on'}
            </p>
            <div className="flex gap-4">
              {[
                { 
                  label: 'Facebook',
                  icon: (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                },
                { 
                  label: 'Instagram',
                  icon: (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                },
                { 
                  label: 'LinkedIn',
                  icon: (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                },
                { 
                  label: 'Zalo/Chat',
                  icon: (props: any) => <MessageCircle {...props} />
                },
                { 
                  label: 'Youtube',
                  icon: (props: any) => <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                }
              ].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={social.label}
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-black/5 bg-white text-neutral-400 transition-all duration-300 hover:border-[#c8b898]/40 hover:bg-[#f8f5f0] hover:text-[#a08c6a]"
                >
                  <social.icon className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex-1 max-w-[600px] lg:max-w-none mx-auto"
        >
          <div className="relative overflow-hidden rounded-[2rem] bg-[#1a1714] p-8 shadow-2xl sm:p-10">
            {/* Form Background glows */}
            <div className="pointer-events-none absolute -right-32 -top-32 h-[300px] w-[300px] rounded-full bg-[#c8b898] opacity-[0.06] blur-[60px]" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 h-[300px] w-[300px] rounded-full bg-[#c8b898] opacity-[0.04] blur-[60px]" />
            
            <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2.5">
                  <label className="text-[12px] font-medium text-white/80">
                    {language === 'vi' ? 'Tên của bạn' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={language === 'vi' ? 'Họ và tên' : 'Full name'}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-[14px] text-white placeholder-white/30 outline-none transition-all focus:border-[#c8b898]/50 focus:bg-white/10"
                  />
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="text-[12px] font-medium text-white/80">
                    {language === 'vi' ? 'Số điện thoại' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0987 654 321"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-[14px] text-white placeholder-white/30 outline-none transition-all focus:border-[#c8b898]/50 focus:bg-white/10"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2.5">
                <label className="text-[12px] font-medium text-white/80">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-[14px] text-white placeholder-white/30 outline-none transition-all focus:border-[#c8b898]/50 focus:bg-white/10"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-[12px] font-medium text-white/80">
                  {language === 'vi' ? 'Chọn dịch vụ góp ý' : 'Select feedback service'}
                </label>
                <div className="relative">
                  <select
                    name="service"
                    required
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-[14px] text-white outline-none transition-all focus:border-[#c8b898]/50 focus:bg-white/10"
                  >
                    <option value="" disabled selected hidden className="bg-[#1a1714] text-white/30">
                      {language === 'vi' ? 'Chọn dịch vụ góp ý' : 'Select feedback service'}
                    </option>
                    <option value="response_speed" className="bg-[#1a1714]">{language === 'vi' ? 'Tốc độ phản hồi' : 'Response speed'}</option>
                    <option value="image_quality" className="bg-[#1a1714]">{language === 'vi' ? 'Chất lượng hình ảnh' : 'Image quality'}</option>
                    <option value="ai_quality" className="bg-[#1a1714]">{language === 'vi' ? 'Chất lượng AI' : 'AI quality'}</option>
                    <option value="other" className="bg-[#1a1714]">{language === 'vi' ? 'Khác' : 'Other'}</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <svg className="h-4 w-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-[12px] font-medium text-white/80">
                  {language === 'vi' ? 'Gửi phản hồi' : 'Send Feedback'}
                </label>
                <textarea
                  name="content"
                  required
                  value={formData.content}
                  onChange={handleChange}
                  rows={4}
                  placeholder={language === 'vi' ? 'Bạn có ý tưởng gì mới cho chúng tôi?' : 'Do you have any new ideas for us?'}
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-[14px] text-white placeholder-white/30 outline-none transition-all focus:border-[#c8b898]/50 focus:bg-white/10"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-2 flex w-full items-center justify-center gap-2.5 rounded-xl px-8 py-4 text-[13px] font-bold uppercase tracking-[0.15em] text-[#1a1714] transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  background: 'linear-gradient(135deg, #d4bc94 0%, #c8b898 60%, #b8a47e 100%)',
                  boxShadow: '0 4px 24px rgba(200,184,152,0.2)'
                }}
              >
                {isSubmitting ? (language === 'vi' ? 'Đang gửi...' : 'Sending...') : (language === 'vi' ? 'Gửi phản hồi' : 'Send Feedback')}
                {!isSubmitting && <Send size={15} className="transition-transform duration-300 group-hover:translate-x-1" />}
              </button>

              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-[2rem] bg-[#1a1714]/90 backdrop-blur-sm"
                >
                  <CheckCircle2 size={48} className="mb-4 text-[#c8b898]" />
                  <p className="text-center font-medium text-white">
                    {language === 'vi' ? 'Cảm ơn bạn đã gửi phản hồi!' : 'Thank you for your feedback!'}
                  </p>
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
