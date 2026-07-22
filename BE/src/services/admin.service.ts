import User from '../models/user.model';
import Product from '../models/product.model';
import Feedback from '../models/feedback.model';
import AiDailyUsage from '../models/aiDailyUsage.model';

export type AdminUserItem = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  subscriptionPlan: 'starter' | 'standard' | 'premium' | null;
  aiTurns: number;
  aiTurnsUsed: number;
  isActive: boolean;
  createdAt: Date;
};

export type AdminUserListResult = {
  items: AdminUserItem[];
  total: number;
  newThisMonth: number;
};

export type AdminDashboardStats = {
  totalActiveUsers: number;
  aiTurnsConsumed: number;
  newUsersThisWeek: number;
  chartData: {
    roomTryOn: number[];
    roomPlanner: number[];
    labels: string[];
  };
};

export type AdminProductItem = {
  id: string;
  sku?: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  createdAt: Date;
};

export const listAdminUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<AdminUserListResult> => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 50;
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = { role: { $ne: 'admin' } };
  if (params.search) {
    const regex = new RegExp(params.search, 'i');
    query.$or = [{ name: regex }, { email: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('name email avatarUrl subscriptionPlan aiTurns aiTurnsUsed isActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = await User.countDocuments({
    ...query,
    createdAt: { $gte: startOfMonth },
  });

  const items: AdminUserItem[] = users.map((u) => ({
    id: String(u._id),
    name: u.name,
    email: u.email,
    avatarUrl: u.avatarUrl,
    subscriptionPlan: (u.subscriptionPlan as AdminUserItem['subscriptionPlan']) ?? null,
    aiTurns: u.aiTurns ?? 5,
    aiTurnsUsed: u.aiTurnsUsed ?? 0,
    isActive: u.isActive,
    createdAt: u.createdAt,
  }));

  return { items, total, newThisMonth };
};

export const updateUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
  await User.findByIdAndUpdate(userId, { isActive });
};

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 29);
  const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];

  const [totalActiveUsers, aiTurnsResult, newUsersThisWeek, dailyUsage] = await Promise.all([
    User.countDocuments({ isActive: true, role: { $ne: 'admin' } }),
    User.aggregate([{ $group: { _id: null, total: { $sum: '$aiTurnsUsed' } } }]),
    User.countDocuments({ createdAt: { $gte: startOfWeek }, role: { $ne: 'admin' } }),
    AiDailyUsage.find({ date: { $gte: startDateStr } }).sort({ date: 1 }).lean(),
  ]);

  const chartData = {
    roomTryOn: [] as number[],
    roomPlanner: [] as number[],
    labels: [] as string[],
  };

  // Map to a dictionary for quick lookup
  const usageMap = new Map<string, any>();
  for (const item of dailyUsage) {
    usageMap.set(item.date, item);
  }

  // Ensure exactly 30 days are returned in order
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - (29 - i));
    const dateStr = d.toISOString().split('T')[0];
    
    // Format label (e.g., '12 thg 7')
    const day = d.getDate();
    const month = d.getMonth() + 1;
    chartData.labels.push(`${day} thg ${month}`);

    const record = usageMap.get(dateStr);
    chartData.roomTryOn.push(record?.roomTryOn ?? 0);
    chartData.roomPlanner.push(record?.roomPlanner ?? 0);
  }

  return {
    totalActiveUsers,
    aiTurnsConsumed: aiTurnsResult[0]?.total ?? 0,
    newUsersThisWeek,
    chartData,
  };
};

export const listAdminProducts = async (): Promise<{ items: AdminProductItem[]; alertCount: number }> => {
  const products = await Product.find()
    .select('name sku category stock price createdAt')
    .sort({ createdAt: -1 })
    .lean();

  const items: AdminProductItem[] = products.map((p) => ({
    id: String(p._id),
    sku: p.sku,
    name: p.name,
    category: p.category,
    stock: p.stock ?? 0,
    price: p.price,
    createdAt: p.createdAt,
  }));

  const alertCount = items.filter((p) => p.stock <= 5).length;

  return { items, alertCount };
};

export const getSubscriptionStats = async () => {
  const plans = ['starter', 'standard', 'premium'] as const;
  const planPrices = { starter: 19000, standard: 49000, premium: 89000 };

  const stats = await Promise.all(
    plans.map(async (plan) => {
      const count = await User.countDocuments({ subscriptionPlan: plan });
      return {
        plan,
        price: planPrices[plan],
        userCount: count,
        revenue: count * planPrices[plan],
      };
    }),
  );

  const totalUsers = stats.reduce((sum, s) => sum + s.userCount, 0);
  const mrr = stats.reduce((sum, s) => sum + s.revenue, 0);
  const arpu = totalUsers > 0 ? Math.round(mrr / totalUsers) : 0;

  return { plans: stats, totalUsers, mrr, arpu };
};

export const listAdminFeedbacks = async () => {
  const feedbacks = await Feedback.find().sort({ createdAt: -1 });
  return feedbacks;
};



export const deleteFeedbackAdmin = async (id: string) => {
  const feedback = await Feedback.findByIdAndDelete(id);
  if (!feedback) {
    throw new Error('Feedback not found');
  }
  return feedback;
};
