import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Star, Quote } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getRandomFeedbacks } from '../services/feedbackApi'

export function TestimonialsSection({ activeSection }: { activeSection: string }) {
  const { language } = useLanguage()
  const isActive = activeSection === 'testimonials'

  const mockFeedbacks = [
    {
      name: 'Trần Lê Quốc Đạt',
      role: language === 'vi' ? 'Chủ nhà' : 'Homeowner',
      content: language === 'vi' 
        ? 'Trải nghiệm tuyệt vời! Tính năng AI thiết kế phòng siêu nhanh và chân thực. Tôi đã tìm được ý tưởng tuyệt vời cho phòng khách nhà mình.'
        : 'Amazing experience! The AI room design feature is super fast and realistic. I found the perfect idea for my living room.',
      rating: 5,
    },
    {
      name: 'Nguyễn Minh Tuấn',
      role: language === 'vi' ? 'Kiến trúc sư' : 'Architect',
      content: language === 'vi'
        ? 'Một công cụ đắc lực hỗ trợ cho công việc của tôi. Nó giúp tôi nhanh chóng phác thảo ý tưởng cho khách hàng và chốt hợp đồng dễ dàng hơn.'
        : 'A powerful tool to support my work. It helps me quickly sketch ideas for clients and close deals much easier.',
      rating: 5,
    },
    {
      name: 'Phạm Quỳnh Nga',
      role: language === 'vi' ? 'Kinh doanh nội thất' : 'Furniture Retailer',
      content: language === 'vi'
        ? 'Khách hàng của tôi rất thích thú khi được xem trước nội thất trong không gian thực qua công nghệ của Livaxis. Chắc chắn sẽ sử dụng lâu dài.'
        : 'My customers are very excited to preview furniture in their real space through Livaxis technology. Will definitely use long-term.',
      rating: 5,
    },
    {
      name: 'Lê Bảo Ngọc',
      role: language === 'vi' ? 'Chủ quán Cafe' : 'Cafe Owner',
      content: language === 'vi'
        ? 'Chỉ với vài thao tác, tôi đã thiết kế lại không gian quán cafe cực kỳ ấn tượng. Các mẫu nội thất đề xuất rất phù hợp với phong cách tôi muốn.'
        : 'With just a few clicks, I redesigned my cafe space very impressively. The suggested furniture models perfectly match my desired style.',
      rating: 5,
    },
    {
      name: 'Đỗ Hoàng Hải',
      role: language === 'vi' ? 'Khách hàng' : 'Customer',
      content: language === 'vi'
        ? 'Giao diện cực kỳ dễ dùng, tốc độ xử lý AI rất nhanh. Livaxis thực sự mang thiết kế nội thất chuyên nghiệp đến với tất cả mọi người.'
        : 'Extremely easy-to-use interface, very fast AI processing speed. Livaxis truly brings professional interior design to everyone.',
      rating: 5,
    }
  ]

  const [feedbacks, setFeedbacks] = useState(mockFeedbacks)

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const data = await getRandomFeedbacks(5)
        if (data && data.length > 0) {
          // If we have fewer than 5, we can duplicate them to fill the carousel, or just use them
          const formattedFeedbacks = data.map(item => ({
            name: item.name || 'Khách hàng',
            role: item.role || (language === 'vi' ? 'Khách hàng' : 'Customer'),
            content: item.content,
            rating: item.rating || 5
          }))
          // ensure at least 3 items for a good scrolling effect
          if (formattedFeedbacks.length < 3) {
            setFeedbacks([...formattedFeedbacks, ...mockFeedbacks].slice(0, 5))
          } else {
            setFeedbacks(formattedFeedbacks)
          }
        }
      } catch (error) {
        console.error('Error fetching feedbacks:', error)
      }
    }
    fetchFeedbacks()
  }, [language])

  // Duplicate for infinite scrolling effect
  const scrollingFeedbacks = [...feedbacks, ...feedbacks, ...feedbacks]

  return (
    <section id="testimonials" className="relative flex h-[100dvh] md:h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#1a1714] py-16">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-[#c8b898] opacity-[0.03] blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative z-10 w-full mb-16 px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 text-[11px] uppercase tracking-[0.25em] text-[#c8b898]/70"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
        >
          {language === 'vi' ? 'Khách hàng nói gì' : 'What they say'}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(2rem,4vw,3.5rem)] text-white leading-tight"
          style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400 }}
        >
          {language === 'vi' ? 'Phản Hồi Từ Người Dùng' : 'User Feedback'}
        </motion.h2>
      </div>

      <div className="relative z-10 w-full overflow-hidden">
        {/* Left and right fading edges */}
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-20 w-32 bg-gradient-to-r from-[#1a1714] to-transparent" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-20 w-32 bg-gradient-to-l from-[#1a1714] to-transparent" />

        {/* Marquee track */}
        <div className="flex w-fit animate-[marquee_40s_linear_infinite] items-center gap-6 px-6 hover:[animation-play-state:paused]">
          {scrollingFeedbacks.map((item, idx) => (
            <div
              key={idx}
              className="flex min-h-[260px] w-[360px] shrink-0 flex-col justify-between gap-6 rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-md transition-colors hover:bg-white/[0.04] md:w-[460px] md:p-10"
            >
              <div>
                <div className="mb-6 text-[#c8b898]">
                  <Quote size={32} strokeWidth={1} className="opacity-40" />
                </div>
                <p className="text-[16px] leading-[1.8] text-white/80 md:text-[18px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
                  "{item.content}"
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#c8b898] to-[#a08c6a] text-[14px] font-bold text-white shadow-lg">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-medium text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {item.name}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 12px)); }
        }
      `}</style>
    </section>
  )
}
