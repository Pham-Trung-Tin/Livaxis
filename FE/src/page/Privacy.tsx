import { motion } from 'motion/react'
import { Header } from '../components/Header'
import { useLanguage } from '../contexts/LanguageContext'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
            {language === 'vi' ? 'Chính sách bảo mật' : 'Privacy Policy'}
          </h1>
          
          <div 
            className="space-y-8 text-sm leading-relaxed text-neutral-600 md:text-[15px]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
          >
            <section>
              <h2 className="mb-4 text-lg text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                {language === 'vi' ? '1. Giới thiệu' : '1. Introduction'}
              </h2>
              <p>
                {language === 'vi' 
                  ? 'Chào mừng bạn đến với Livaxis. Chúng tôi tôn trọng quyền riêng tư của bạn và cam kết bảo vệ dữ liệu cá nhân của bạn. Chính sách bảo mật này sẽ thông báo cho bạn về cách chúng tôi chăm sóc dữ liệu cá nhân của bạn khi bạn truy cập trang web của chúng tôi và cho bạn biết về quyền riêng tư của bạn.'
                  : 'Welcome to Livaxis. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.'}
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-lg text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                {language === 'vi' ? '2. Dữ liệu chúng tôi thu thập' : '2. Data we collect'}
              </h2>
              <p>
                {language === 'vi' 
                  ? 'Chúng tôi có thể thu thập, sử dụng, lưu trữ và chuyển giao các loại dữ liệu cá nhân khác nhau về bạn như: Dữ liệu nhận dạng (tên, tên người dùng), Dữ liệu liên hệ (địa chỉ email, số điện thoại), Dữ liệu hình ảnh (ảnh phòng bạn tải lên để sử dụng AI) và Dữ liệu kỹ thuật (địa chỉ IP, loại trình duyệt).'
                  : 'We may collect, use, store and transfer different kinds of personal data about you such as: Identity Data (name, username), Contact Data (email address, telephone numbers), Image Data (room photos you upload for AI try-ons), and Technical Data (IP address, browser type).'}
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-lg text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                {language === 'vi' ? '3. Cách chúng tôi sử dụng hình ảnh của bạn' : '3. How we use your images'}
              </h2>
              <p>
                {language === 'vi' 
                  ? 'Khi bạn sử dụng công cụ Trực quan hóa phòng AI của chúng tôi, những hình ảnh bạn tải lên chỉ được sử dụng cho mục đích tạo mô phỏng đồ nội thất. Chúng tôi không sử dụng hình ảnh cá nhân của bạn để đào tạo mô hình AI công khai mà không có sự đồng ý rõ ràng của bạn.'
                  : 'When you use our AI Room Visualiser, the images you upload are processed solely for the purpose of generating furniture previews. We do not use your personal images to train public AI models without your explicit consent.'}
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-lg text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                {language === 'vi' ? '4. Bảo mật dữ liệu' : '4. Data Security'}
              </h2>
              <p>
                {language === 'vi' 
                  ? 'Chúng tôi đã áp dụng các biện pháp bảo mật thích hợp để ngăn chặn dữ liệu cá nhân của bạn bị mất mát, sử dụng hoặc truy cập trái phép, thay đổi hoặc tiết lộ vô tình.'
                  : 'We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.'}
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-lg text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                {language === 'vi' ? '5. Quyền lợi của bạn' : '5. Your legal rights'}
              </h2>
              <p>
                {language === 'vi' 
                  ? 'Trong một số trường hợp nhất định, bạn có các quyền theo luật bảo vệ dữ liệu liên quan đến dữ liệu cá nhân của mình, bao gồm quyền yêu cầu truy cập, chỉnh sửa, xóa hoặc hạn chế xử lý dữ liệu cá nhân của bạn.'
                  : 'Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure or restriction of processing of your personal data.'}
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
