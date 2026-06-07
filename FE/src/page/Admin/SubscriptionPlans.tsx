import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { getSubscriptionStats, type SubscriptionStatsResponse } from '../../services/adminApi'
import { useLanguage } from '../../contexts/LanguageContext'
import { translations } from '../../contexts/translations'

const MOCK_STATS: SubscriptionStatsResponse = {
  plans: [
    { plan: 'starter', price: 19000, userCount: 342, revenue: 6498000 },
    { plan: 'standard', price: 49000, userCount: 218, revenue: 10682000 },
    { plan: 'premium', price: 89000, userCount: 97, revenue: 8633000 },
  ],
  totalUsers: 657,
  mrr: 25813000,
  arpu: 39289,
}

export default function SubscriptionPlans() {
  const { language } = useLanguage()
  const adminTrans = translations[language].admin

  const [stats, setStats] = useState<SubscriptionStatsResponse>(MOCK_STATS)

  const planMeta = {
    starter: {
      name: adminTrans.subPlans.starter,
      aiLabel: language === 'vi' ? '10 lượt AI / tháng' : '10 AI turns / month',
      progressColor: '#9ca3af',
      progressBg: '#f3f4f6',
      trendColor: '#16a34a',
      trend: '+12%',
      badgeColor: '#6b7280',
      badgeBg: '#f3f4f6',
      best: false,
    },
    standard: {
      name: adminTrans.subPlans.standard,
      aiLabel: language === 'vi' ? '30 lượt AI / tháng' : '30 AI turns / month',
      progressColor: '#f59e0b',
      progressBg: '#fef3c7',
      trendColor: '#16a34a',
      trend: '+28%',
      badgeColor: '#d97706',
      badgeBg: '#fef3c7',
      best: false,
    },
    premium: {
      name: adminTrans.subPlans.premium,
      aiLabel: language === 'vi' ? '70 lượt AI / tháng' : '70 AI turns / month',
      progressColor: '#7c3aed',
      progressBg: '#ede9fe',
      trendColor: '#16a34a',
      trend: '+41%',
      badgeColor: '#7c3aed',
      badgeBg: '#ede9fe',
      best: true,
    },
  }

  useEffect(() => {
    getSubscriptionStats()
      .then(setStats)
      .catch(() => setStats(MOCK_STATS))
  }, [])

  const formatPrice = (n: number) => {
    return n.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US') + (language === 'vi' ? 'đ' : ' ₫')
  }

  const totalUsers = stats.plans.reduce((s, p) => s + p.userCount, 0)

  return (
    <div className="adm-sub">
      {/* Plan cards */}
      <div className="adm-sub-grid">
        {stats.plans.map((planStat) => {
          const meta = planMeta[planStat.plan as keyof typeof planMeta] || planMeta.starter
          const pct = totalUsers > 0 ? Math.round((planStat.userCount / totalUsers) * 100) : 0

          return (
            <div key={planStat.plan} className="adm-sub-card">
              {meta.best && <span className="adm-sub-best-badge">{adminTrans.subPlans.bestBadge}</span>}
              <div className="adm-sub-card-header">
                <h3 className="adm-sub-plan-name">
                  {meta.name} – {Math.round(planStat.price / 1000)}k
                </h3>
                <p className="adm-sub-ai-label">{meta.aiLabel}</p>
              </div>

              <div className="adm-sub-row">
                <span className="adm-sub-row-label">{language === 'vi' ? 'Người dùng' : 'Users'}</span>
                <span className="adm-sub-row-value">{planStat.userCount}</span>
              </div>
              <div className="adm-sub-row">
                <span className="adm-sub-row-label">{language === 'vi' ? 'Doanh thu' : 'Revenue'}</span>
                <span className="adm-sub-row-value">{formatPrice(planStat.revenue)}</span>
              </div>
              <div className="adm-sub-row">
                <span className="adm-sub-row-label">{language === 'vi' ? 'Tăng trưởng' : 'Growth'}</span>
                <span className="adm-sub-trend">
                  <TrendingUp size={11} />
                  {meta.trend}
                </span>
              </div>

              <div className="adm-sub-bar-wrap">
                <div
                  className="adm-sub-bar-fill"
                  style={{ width: `${pct}%`, background: meta.progressColor }}
                />
              </div>
              <p className="adm-sub-bar-label">
                {language === 'vi' ? `${pct}% tổng người dùng` : `${pct}% of total users`}
              </p>
            </div>
          )
        })}
      </div>

      {/* Revenue overview */}
      <div className="adm-card">
        <h3 className="adm-rev-title">{language === 'vi' ? 'Tổng quan doanh thu' : 'Revenue Overview'}</h3>
        <div className="adm-rev-grid">
          <div className="adm-rev-item">
            <p className="adm-rev-item-label">{language === 'vi' ? 'Tổng người dùng trả phí' : 'Total Paid Users'}</p>
            <p className="adm-rev-item-value">{stats.totalUsers.toLocaleString()}</p>
          </div>
          <div className="adm-rev-divider" />
          <div className="adm-rev-item">
            <p className="adm-rev-item-label">MRR (Monthly Recurring)</p>
            <p className="adm-rev-item-value adm-rev-item-value--accent">
              {formatPrice(stats.mrr)}
            </p>
          </div>
          <div className="adm-rev-divider" />
          <div className="adm-rev-item">
            <p className="adm-rev-item-label">ARPU</p>
            <p className="adm-rev-item-value adm-rev-item-value--accent">
              {formatPrice(stats.arpu)}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .adm-sub {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 1280px;
        }

        .adm-sub-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .adm-sub-card {
          background: #fff;
          border: 1px solid #ece8e1;
          border-radius: 14px;
          padding: 22px 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          position: relative;
        }

        .adm-sub-best-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #7c3aed;
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.04em;
        }

        .adm-sub-card-header {
          margin-bottom: 16px;
          padding-bottom: 14px;
          border-bottom: 1px solid #f0ece6;
        }

        .adm-sub-plan-name {
          font-size: 17px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 3px;
        }

        .adm-sub-ai-label {
          font-size: 12px;
          color: #aaa;
          font-weight: 300;
        }

        .adm-sub-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 5px 0;
        }

        .adm-sub-row-label {
          font-size: 13px;
          color: #888;
        }

        .adm-sub-row-value {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .adm-sub-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 600;
          color: #16a34a;
        }

        .adm-sub-bar-wrap {
          background: #f5f4f2;
          border-radius: 4px;
          height: 6px;
          margin-top: 14px;
          overflow: hidden;
        }

        .adm-sub-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }

        .adm-sub-bar-label {
          font-size: 11.5px;
          color: #bbb;
          margin-top: 5px;
          font-weight: 300;
        }

        /* Revenue card */
        .adm-card {
          background: #fff;
          border: 1px solid #ece8e1;
          border-radius: 14px;
          padding: 22px 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .adm-rev-title {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 20px;
        }

        .adm-rev-grid {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .adm-rev-item {
          flex: 1;
          text-align: center;
          padding: 8px 0;
        }

        .adm-rev-divider {
          width: 1px;
          height: 48px;
          background: #f0ece6;
        }

        .adm-rev-item-label {
          font-size: 12px;
          color: #aaa;
          font-weight: 300;
          margin-bottom: 6px;
        }

        .adm-rev-item-value {
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .adm-rev-item-value--accent {
          color: #1a1a1a;
        }

        .adm-rev-item-value--accent::after {
          content: '';
        }

        @media (max-width: 900px) {
          .adm-sub-grid { grid-template-columns: 1fr; }
          .adm-rev-grid { flex-direction: column; }
          .adm-rev-divider { width: 100%; height: 1px; }
        }
      `}</style>
    </div>
  )
}
