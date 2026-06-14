import { connectDB, disconnectDB } from '../config/database';
import SubscriptionPlan from '../models/subscriptionPlan.model';

const seedPlans = [
  {
    planId: 'free',
    name: { vi: 'Cảm hứng hàng ngày', en: 'Daily Inspiration' },
    tagline: { vi: 'Bắt đầu hành trình thiết kế của bạn', en: 'Begin your design journey' },
    price: 0,
    turns: 3,
    turnsNote: { vi: 'mỗi ngày · làm mới vào nửa đêm', en: 'per day · resets at midnight' },
    turnsToAdd: 0,
    cta: { vi: 'Gói hiện tại', en: 'Current Plan' },
    ctaStyle: 'ghost',
    features: {
      vi: [
        '3 lượt Thử đồ AI / ngày',
        'Dành cho mọi tài khoản Livaxis',
        'Phân tích phòng cơ bản',
        'Truy cập thư viện cộng đồng'
      ],
      en: [
        '3 AI Try-On turns / day',
        'Available for all accounts',
        'Basic room analysis',
        'Community gallery access'
      ]
    },
    order: 1,
    isActive: true
  },
  {
    planId: 'starter',
    name: { vi: 'Gói Khởi đầu (10 lượt)', en: 'Starter Pack (10 turns)' },
    tagline: { vi: 'Hoàn hảo cho nhu cầu thỉnh thoảng sử dụng', en: 'Perfect for occasional use' },
    price: 19000,
    priceNote: { vi: 'mua một lần · không giới hạn thời gian', en: 'one-time · no expiration date' },
    turns: 10,
    turnsNote: { vi: 'hiệu lực trọn đời', en: 'lifetime validity' },
    turnsToAdd: 10,
    cta: { vi: 'Chọn gói Khởi đầu', en: 'Choose 10 Turns' },
    ctaStyle: 'outline',
    features: {
      vi: [
        '10 lượt Thử đồ AI',
        'Tải xuống chất lượng cao không giới hạn',
        'Ưu tiên xử lý bằng Gemini AI',
        'So sánh Trước / Sau trực quan',
        'Hỗ trợ qua Email'
      ],
      en: [
        '10 AI Try-On turns',
        'Unlimited high-res downloads',
        'Gemini AI Priority Processing',
        'Before / After comparisons',
        'Email support'
      ]
    },
    order: 2,
    isActive: true
  },
  {
    planId: 'standard',
    name: { vi: 'Đam mê thiết kế (40 lượt)', en: 'Design Enthusiast (40 turns)' },
    tagline: { vi: 'Nâng tầm không gian nội thất của bạn', en: 'Elevate your interiors' },
    price: 49000,
    priceNote: { vi: 'mua một lần · không giới hạn thời gian', en: 'one-time · no expiration date' },
    turns: 40,
    turnsNote: { vi: 'hiệu lực trọn đời', en: 'lifetime validity' },
    turnsToAdd: 40,
    cta: { vi: 'Chọn gói Đam mê', en: 'Choose 40 Turns' },
    ctaStyle: 'charcoal',
    badge: { vi: 'PHỔ BIẾN NHẤT', en: 'MOST POPULAR' },
    features: {
      vi: [
        '40 lượt Thử đồ AI',
        'Tải xuống chất lượng cao không giới hạn',
        'Ưu tiên xử lý bằng Gemini AI',
        'Gợi ý trang trí nâng cao',
        'Hồ sơ phong cách & bảng ý tưởng',
        'Ưu tiên hỗ trợ qua Email'
      ],
      en: [
        '40 AI Try-On turns',
        'Unlimited high-res downloads',
        'Gemini AI Priority Processing',
        'Advanced decor suggestions',
        'Style profile & mood board',
        'Priority email support'
      ]
    },
    extras: {
      vi: ['Đặc quyền thành viên sớm'],
      en: ['Early member privileges']
    },
    order: 3,
    isActive: true
  },
  {
    planId: 'premium',
    name: { vi: 'Chuyên gia sáng tạo (70 lượt)', en: 'Creative Professional (70 turns)' },
    tagline: { vi: 'Trực quan hóa không giới hạn giới hạn sáng tạo', en: 'Unlimited creative visualization' },
    price: 79000,
    priceNote: { vi: 'mua một lần · không giới hạn thời gian', en: 'one-time · no expiration date' },
    turns: 70,
    turnsNote: { vi: 'hiệu lực trọn đời', en: 'lifetime validity' },
    turnsToAdd: 70,
    cta: { vi: 'Chọn gói Chuyên gia', en: 'Choose 70 Turns' },
    ctaStyle: 'gold',
    features: {
      vi: [
        '70 lượt Thử đồ AI',
        'Tải xuống chất lượng cao không giới hạn',
        'Ưu tiên xử lý bằng Gemini AI',
        'Bố trí dự án nhiều phòng',
        'Tư vấn thiết kế riêng & Xuất thuyết trình',
        'Hỗ trợ kỹ thuật 24/7'
      ],
      en: [
        '70 AI Try-On turns',
        'Unlimited high-res downloads',
        'Gemini AI Priority Processing',
        'Multi-room projects',
        'Personal design consultation & export',
        '24/7 Priority support'
      ]
    },
    order: 4,
    isActive: true
  }
];

const runSeed = async () => {
  try {
    await connectDB();
    await SubscriptionPlan.deleteMany({});
    const inserted = await SubscriptionPlan.insertMany(seedPlans);
    console.log(`Seed completed: inserted ${inserted.length} subscription plans.`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

void runSeed();
