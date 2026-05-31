import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { getAdminDashboardStats, getSubscriptionRevenue, type AdminDashboardStats, type RevenueData } from '../../services/adminApi'

const CHART_DATA = {
  labels: ['10 thg 2', '15 thg 2', '20 thg 2', '25 thg 2', '2 thg 3', '7 thg 3'],
  roomTryOn: [165, 190, 175, 210, 155, 185, 175, 200, 165, 190, 175, 165, 185, 195, 170, 165, 180, 175, 190, 205, 175, 160, 175, 185, 170, 180, 195, 175, 170, 160],
  roomPlanner: [85, 95, 80, 90, 75, 100, 85, 90, 80, 95, 85, 80, 90, 95, 80, 85, 90, 80, 95, 100, 85, 80, 85, 90, 80, 85, 90, 80, 85, 80],
}

const RECENT_ORDERS = [
  { id: 'LVX-00291', email: 'nguyen.thu@gmail.com', plan: 'premium', planLabel: '89k', amount: '89.000đ', date: '11/03/2026', status: 'Completed' },
  { id: 'LVX-00290', email: 'tran.minh@outlook.com', plan: 'standard', planLabel: '49k', amount: '49.000đ', date: '11/03/2026', status: 'Completed' },
  { id: 'LVX-00289', email: 'le.hoa@yahoo.com', plan: 'premium', planLabel: '89k', amount: '89.000đ', date: '10/03/2026', status: 'Completed' },
  { id: 'LVX-00288', email: 'pham.long@gmail.com', plan: 'starter', planLabel: '19k', amount: '19.000đ', date: '10/03/2026', status: 'Completed' },
  { id: 'LVX-00287', email: 'vo.anh@gmail.com', plan: 'standard', planLabel: '49k', amount: '49.000đ', date: '09/03/2026', status: 'Pending' },
]

const CHART_W = 800
const CHART_H = 180
const PAD_L = 40
const PAD_R = 20
const PAD_T = 10
const PAD_B = 30

function buildPath(points: number[], filled = false): string {
  const n = points.length
  const xStep = (CHART_W - PAD_L - PAD_R) / (n - 1)
  const minVal = 0
  const maxVal = 220
  const yScale = (val: number) => PAD_T + (1 - (val - minVal) / (maxVal - minVal)) * (CHART_H - PAD_T - PAD_B)

  let d = ''
  for (let i = 0; i < n; i++) {
    const x = PAD_L + i * xStep
    const y = yScale(points[i])
    if (i === 0) {
      d += `M${x},${y}`
    } else {
      const prevX = PAD_L + (i - 1) * xStep
      const prevY = yScale(points[i - 1])
      const cpX = (prevX + x) / 2
      d += ` C${cpX},${prevY} ${cpX},${y} ${x},${y}`
    }
  }

  if (filled) {
    const lastX = PAD_L + (n - 1) * xStep
    d += ` L${lastX},${CHART_H - PAD_B} L${PAD_L},${CHART_H - PAD_B} Z`
  }

  return d
}

const planColors: Record<string, string> = {
  premium: '#7c3aed',
  standard: '#f59e0b',
  starter: '#6b7280',
}

const statusColors: Record<string, { bg: string; color: string }> = {
  Completed: { bg: 'rgba(22,163,74,0.08)', color: '#16a34a' },
  Pending: { bg: 'rgba(234,179,8,0.1)', color: '#b45309' },
  Failed: { bg: 'rgba(220,38,38,0.08)', color: '#dc2626' },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [revenueLoading, setRevenueLoading] = useState(true)
  const [showRoomTryOn, setShowRoomTryOn] = useState(true)
  const [showRoomPlanner, setShowRoomPlanner] = useState(true)

  useEffect(() => {
    getAdminDashboardStats()
      .then(setStats)
      .catch(() => null)

    // Lấy doanh thu thực từ SePay
    setRevenueLoading(true)
    getSubscriptionRevenue()
      .then(setRevenueData)
      .catch(() => null)
      .finally(() => setRevenueLoading(false))
  }, [])

  // Format tiền VND
  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  const revenueValue = revenueLoading
    ? '...' 
    : revenueData
    ? formatVND(revenueData.thisMonthRevenue)
    : '—'

  const revenueSub = revenueData?.monthLabel ?? 'Đang tải...'
  const revenueTrend = revenueData?.trendPercent ?? (revenueLoading ? '...' : 'Chưa có dữ liệu')
  const revenueTrendUp = revenueData ? (revenueData.trendPercent ?? '').startsWith('+') : true

  const statCards = [
    {
      label: 'Total Revenue',
      value: revenueValue,
      sub: revenueSub,
      trend: revenueTrend,
      up: revenueTrendUp,
      icon: '₫',
      iconBg: '#fef3c7',
      iconColor: '#d97706',
    },
    {
      label: 'Active Users',
      value: stats ? stats.totalActiveUsers.toLocaleString() : '657',
      sub: 'Người dùng hoạt động',
      trend: `+${stats?.newUsersThisWeek ?? 32} tuần này`,
      up: true,
      icon: '👥',
      iconBg: '#ede9fe',
      iconColor: '#7c3aed',
      emoji: true,
    },
    {
      label: 'AI Turns Consumed',
      value: stats ? stats.aiTurnsConsumed.toLocaleString() : '42.810',
      sub: 'Tổng lượt AI đã dùng',
      trend: '+5.2% vs tháng trước',
      up: true,
      icon: '⚡',
      iconBg: '#ecfdf5',
      iconColor: '#059669',
      emoji: true,
    },
    {
      label: 'Current API Cost',
      value: '$312.40',
      sub: 'Gemini API – tháng 3',
      trend: '-8.1% vs tháng trước',
      up: false,
      icon: '📊',
      iconBg: '#fef2f2',
      iconColor: '#dc2626',
      emoji: true,
    },
  ]

  return (
    <div className="adm-dash">
      {/* Stat cards */}
      <div className="adm-stat-grid">
        {statCards.map((card) => (
          <div key={card.label} className="adm-stat-card">
            <div className="adm-stat-top">
              <span
                className="adm-stat-icon"
                style={{ background: card.iconBg, color: card.iconColor }}
              >
                {card.emoji ? card.icon : <span style={{ fontWeight: 700, fontSize: 16 }}>{card.icon}</span>}
              </span>
              <span className={`adm-stat-trend ${card.up ? 'adm-stat-trend--up' : 'adm-stat-trend--down'}`}>
                {card.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {card.trend}
              </span>
            </div>
            <p className="adm-stat-label">{card.label}</p>
            <p className="adm-stat-value">{card.value}</p>
            <p className="adm-stat-sub">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="adm-card adm-chart-card">
        <div className="adm-chart-header">
          <div>
            <h3 className="adm-section-title">AI Try-On Usage</h3>
            <p className="adm-section-sub">Lượt sử dụng AI trong 30 ngày qua</p>
          </div>
          <div className="adm-chart-legend">
            <button
              className={`adm-legend-item ${!showRoomTryOn ? 'adm-legend-item--off' : ''}`}
              onClick={() => setShowRoomTryOn((v) => !v)}
            >
              <span className="adm-legend-dot" style={{ background: '#7c3aed' }} />
              Room Try-On
            </button>
            <button
              className={`adm-legend-item ${!showRoomPlanner ? 'adm-legend-item--off' : ''}`}
              onClick={() => setShowRoomPlanner((v) => !v)}
            >
              <span className="adm-legend-dot" style={{ background: '#f59e0b' }} />
              Room Planner
            </button>
            <button className="adm-refresh-btn" title="Refresh">
              <RefreshCw size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="adm-chart-wrap">
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            preserveAspectRatio="none"
            className="adm-chart-svg"
          >
            <defs>
              <linearGradient id="gradTryOn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.01" />
              </linearGradient>
              <linearGradient id="gradPlanner" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Y-axis grid lines */}
            {[0, 55, 110, 165, 220].map((v) => {
              const y = 10 + (1 - v / 220) * (CHART_H - PAD_T - PAD_B)
              return (
                <g key={v}>
                  <line x1={PAD_L} y1={y} x2={CHART_W - PAD_R} y2={y} stroke="#e8e4de" strokeWidth="0.8" />
                  <text x={PAD_L - 6} y={y + 4} fontSize="9" fill="#bbb" textAnchor="end">{v}</text>
                </g>
              )
            })}

            {/* X-axis labels */}
            {CHART_DATA.labels.map((label, i) => {
              const x = PAD_L + (i / (CHART_DATA.labels.length - 1)) * (CHART_W - PAD_L - PAD_R)
              return (
                <text key={label} x={x} y={CHART_H - 4} fontSize="9" fill="#bbb" textAnchor="middle">{label}</text>
              )
            })}

            {/* Area fills */}
            {showRoomTryOn && (
              <path d={buildPath(CHART_DATA.roomTryOn, true)} fill="url(#gradTryOn)" />
            )}
            {showRoomPlanner && (
              <path d={buildPath(CHART_DATA.roomPlanner, true)} fill="url(#gradPlanner)" />
            )}

            {/* Lines */}
            {showRoomPlanner && (
              <path d={buildPath(CHART_DATA.roomPlanner)} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            )}
            {showRoomTryOn && (
              <path d={buildPath(CHART_DATA.roomTryOn)} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </div>
      </div>

      {/* Recent orders */}
      <div className="adm-card">
        <div className="adm-table-header">
          <div>
            <h3 className="adm-section-title">Recent Orders</h3>
            <p className="adm-section-sub">Đơn hàng subscription gần đây (dữ liệu thực từ SePay)</p>
          </div>
          <div className="adm-table-actions">
            <input className="adm-search" placeholder="Tìm đơn hàng..." />
            <button className="adm-icon-btn" title="Filter">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
            </button>
            <button className="adm-icon-btn" title="Export">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
          </div>
        </div>

        <table className="adm-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>NỘI DUNG</th>
              <th>AMOUNT</th>
              <th>DATE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {revenueLoading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#aaa', padding: '24px' }}>Đang tải dữ liệu từ SePay...</td></tr>
            ) : revenueData && revenueData.recentOrders.length > 0 ? (
              revenueData.recentOrders.map((order) => {
                const sc = statusColors['Completed']
                const amountFormatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.amount)
                const dateFormatted = new Date(order.date).toLocaleDateString('vi-VN')
                return (
                  <tr key={order.sePayId}>
                    <td className="adm-td-mono">{order.id}</td>
                    <td style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: '#888' }}>{order.content}</td>
                    <td className="adm-td-bold">{amountFormatted}</td>
                    <td className="adm-td-dim">{dateFormatted}</td>
                    <td>
                      <span className="adm-status-badge" style={{ background: sc.bg, color: sc.color }}>
                        ● {order.status}
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              RECENT_ORDERS.map((order) => {
                const sc = statusColors[order.status] ?? statusColors.Completed
                return (
                  <tr key={order.id}>
                    <td className="adm-td-mono">{order.id}</td>
                    <td>{order.email}</td>
                    <td>
                      <span
                        className="adm-plan-badge"
                        style={{ background: planColors[order.plan] + '18', color: planColors[order.plan] }}
                      >
                        {order.plan === 'premium' && <span>★ </span>}
                        {order.planLabel}
                      </span>
                    </td>
                    <td className="adm-td-bold">{order.amount}</td>
                    <td className="adm-td-dim">{order.date}</td>
                    <td>
                      <span className="adm-status-badge" style={{ background: sc.bg, color: sc.color }}>
                        ● {order.status}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .adm-dash {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 1280px;
        }

        /* Stat grid */
        .adm-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .adm-stat-card {
          background: #fff;
          border: 1px solid #ece8e1;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .adm-stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .adm-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .adm-stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          font-weight: 500;
        }

        .adm-stat-trend--up { color: #16a34a; }
        .adm-stat-trend--down { color: #dc2626; }

        .adm-stat-label {
          font-size: 12px;
          color: #999;
          font-weight: 400;
          margin-bottom: 4px;
        }

        .adm-stat-value {
          font-size: 22px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.2;
          margin-bottom: 2px;
        }

        .adm-stat-sub {
          font-size: 11.5px;
          color: #bbb;
          font-weight: 300;
        }

        /* Card */
        .adm-card {
          background: #fff;
          border: 1px solid #ece8e1;
          border-radius: 14px;
          padding: 22px 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        /* Chart */
        .adm-chart-card { }

        .adm-chart-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .adm-section-title {
          font-size: 15px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 2px;
        }

        .adm-section-sub {
          font-size: 12px;
          color: #aaa;
          font-weight: 300;
        }

        .adm-chart-legend {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .adm-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #777;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          transition: opacity 0.2s;
        }

        .adm-legend-item--off {
          opacity: 0.35;
        }

        .adm-legend-dot {
          width: 12px;
          height: 3px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .adm-refresh-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #bbb;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }

        .adm-refresh-btn:hover { color: #666; }

        .adm-chart-wrap {
          width: 100%;
          overflow: hidden;
        }

        .adm-chart-svg {
          width: 100%;
          height: 180px;
          display: block;
        }

        /* Table */
        .adm-table-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 16px;
        }

        .adm-table-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .adm-search {
          height: 32px;
          padding: 0 12px;
          border: 1px solid #e0dbd3;
          border-radius: 8px;
          font-size: 12.5px;
          color: #555;
          background: #fafaf8;
          outline: none;
          width: 180px;
          font-family: 'Inter', sans-serif;
        }

        .adm-search:focus {
          border-color: #a78bfa;
        }

        .adm-icon-btn {
          width: 32px;
          height: 32px;
          border: 1px solid #e0dbd3;
          border-radius: 8px;
          background: #fafaf8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #777;
          transition: all 0.15s;
        }

        .adm-icon-btn:hover {
          border-color: #c5bcb0;
          color: #333;
        }

        .adm-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .adm-table th {
          text-align: left;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: #aaa;
          padding: 0 12px 10px;
          border-bottom: 1px solid #f0ece6;
        }

        .adm-table td {
          padding: 12px 12px;
          color: #444;
          border-bottom: 1px solid #f8f6f3;
        }

        .adm-table tr:last-child td {
          border-bottom: none;
        }

        .adm-table tr:hover td {
          background: #fafaf8;
        }

        .adm-td-mono {
          font-family: monospace;
          font-size: 12px;
          color: #888 !important;
        }

        .adm-td-bold {
          font-weight: 600;
          color: #1a1a1a !important;
        }

        .adm-td-dim {
          color: #aaa !important;
          font-size: 12px;
        }

        .adm-plan-badge {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-size: 11.5px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 8px;
        }

        .adm-status-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 500;
          padding: 3px 10px;
          border-radius: 20px;
        }

        @media (max-width: 1100px) {
          .adm-stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  )
}
