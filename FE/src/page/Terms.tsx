import { motion } from 'motion/react'
import { Header } from '../components/Header'
import { useLanguage } from '../contexts/LanguageContext'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  const { language } = useLanguage()

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-[linear-gradient(180deg,#fffdf9_0%,#fbf7f1_52%,#f4efe6_100%)] text-[#141311]">
      <Header />
      
      <main className="mx-auto max-w-4xl px-6 pt-[120px] pb-24 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link 
            to="/" 
            className="mb-8 inline-flex items-center gap-2 text-[13px] font-medium text-neutral-400 transition-colors hover:text-black"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <ArrowLeft size={16} />
            {language === 'vi' ? 'Quay lại' : 'Back'}
          </Link>

          <h1 
            className="mb-8 text-4xl text-black md:text-5xl"
            style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}
          >
            {language === 'vi' ? 'Điều khoản dịch vụ' : 'Terms of Service'}
          </h1>
          
          <div 
            className="space-y-8 text-sm leading-relaxed text-neutral-600 md:text-[15px]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
          >
            <section>
              <h2 className="mb-4 text-lg text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                {language === 'vi' ? '1. Chấp nhận các điều khoản' : '1. Acceptance of terms'}
              </h2>
              <p>
                {language === 'vi' 
                  ? 'Bằng việc truy cập và sử dụng các dịch vụ của Livaxis, bạn đồng ý bị ràng buộc bởi các Điều khoản Dịch vụ này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản, bạn không nên sử dụng nền tảng của chúng tôi.'
                  : 'By accessing and using Livaxis services, you agree to be bound by these Terms of Service. If you do not agree to any part of the terms, you may not access our platform.'}
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-lg text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                {language === 'vi' ? '2. Sử dụng dịch vụ Trực quan hóa AI' : '2. Use of AI Visualisation Service'}
              </h2>
              <p>
                {language === 'vi' 
                  ? 'Công cụ Trực quan hóa phòng AI của chúng tôi được cung cấp cho mục đích cá nhân, phi thương mại. Số lượt sử dụng AI được cấp dựa trên loại tài khoản (Miễn phí, Khởi đầu, Đam mê, Chuyên gia). Lượt sử dụng miễn phí sẽ được làm mới hằng ngày, trong khi lượt thuộc gói trả phí sẽ được cộng dồn theo thông tin đã mua.'
                  : 'Our AI Room Visualiser is provided for personal, non-commercial use. AI try-on limits are based on your account tier (Free, Starter, Standard, Premium). Free turns reset daily, while paid turns accumulate based on your purchased plan.'}
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-lg text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                {language === 'vi' ? '3. Quyền sở hữu trí tuệ' : '3. Intellectual Property Rights'}
              </h2>
              <p>
                {language === 'vi' 
                  ? 'Tất cả nội dung, tính năng và chức năng ban đầu (bao gồm thiết kế, giao diện, logo, mô phỏng nội thất) thuộc sở hữu của Livaxis và được bảo vệ bởi luật bản quyền quốc tế. Hình ảnh người dùng tải lên thuộc quyền sở hữu của người dùng.'
                  : 'All original content, features, and functionality (including design, UI, logos, furniture simulations) are owned by Livaxis and are protected by international copyright laws. Images uploaded by users remain the property of the users.'}
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-lg text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                {language === 'vi' ? '4. Sản phẩm và Liên kết mua sắm' : '4. Products and Shopping Links'}
              </h2>
              <p>
                {language === 'vi' 
                  ? 'Livaxis không trực tiếp bán đồ nội thất. Chúng tôi cung cấp các đề xuất trực quan và liên kết đến các nhà bán lẻ bên thứ ba (như Shopee). Chúng tôi không chịu trách nhiệm về quá trình thanh toán, vận chuyển hoặc chất lượng sản phẩm thực tế từ bên thứ ba.'
                  : 'Livaxis does not sell furniture directly. We provide visual recommendations and links to third-party retailers (such as Shopee). We are not responsible for the checkout process, shipping, or actual product quality provided by third parties.'}
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-lg text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                {language === 'vi' ? '5. Giới hạn trách nhiệm' : '5. Limitation of Liability'}
              </h2>
              <p>
                {language === 'vi' 
                  ? 'Livaxis sẽ không chịu trách nhiệm cho bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt, hậu quả hoặc trừng phạt nào, bao gồm nhưng không giới hạn ở việc mất lợi nhuận, dữ liệu hoặc quyền sử dụng phát sinh từ việc bạn sử dụng các dịch vụ của chúng tôi.'
                  : 'In no event shall Livaxis be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, or use, arising out of your access to or use of our services.'}
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-black/10">
              <p className="text-sm italic text-neutral-500">
                {language === 'vi' ? 'Cập nhật lần cuối: 22 tháng 7, 2026' : 'Last updated: July 22, 2026'}
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
