import { useEffect, useState } from 'react'
import { getAdminUsers, updateUserStatus, type AdminUser } from '../../services/adminApi'
import { useLanguage } from '../../contexts/LanguageContext'
import { translations } from '../../contexts/translations'

// Removed globals to localize dynamically inside component

function AiUsageBar({ used, max }: { used: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (used / max) * 100) : 0
  const color = pct > 80 ? '#7c3aed' : pct > 50 ? '#7c3aed' : '#a78bfa'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, background: '#f0ece6', borderRadius: 4, height: 5, maxWidth: 100 }}>
        <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 12, color: '#888', minWidth: 20 }}>{used}</span>
    </div>
  )
}

export default function UserManagement() {
  const { language } = useLanguage()
  const adminTrans = translations[language].admin

  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [newThisMonth, setNewThisMonth] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const planConfig = {
    premium: { label: '89k', bg: '#ede9fe', color: '#7c3aed', star: true },
    standard: { label: '49k', bg: '#fef3c7', color: '#d97706', star: false },
    starter: { label: '19k', bg: '#f3f4f6', color: '#6b7280', star: false },
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    if (language === 'vi') {
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
    } else {
      return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
    }
  }

  const load = async (q?: string) => {
    setLoading(true)
    try {
      const res = await getAdminUsers({ search: q, limit: 100 })
      setUsers(res.items)
      setTotal(res.total)
      setNewThisMonth(res.newThisMonth)
    } catch {
      // fallback to mock data when BE not available
      setUsers(MOCK_USERS)
      setTotal(MOCK_USERS.length)
      setNewThisMonth(6)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    void load(search)
  }

  const handleToggleStatus = async (user: AdminUser) => {
    setTogglingId(user.id)
    try {
      await updateUserStatus(user.id, !user.isActive)
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      )
    } catch {
      // ignore
    } finally {
      setTogglingId(null)
    }
  }

  const handleExportCSV = () => {
    const headers = adminTrans.tableHeaders.userHeaders
    const rows = users.map((u, i) => [
      `USR-${String(i + 1).padStart(3, '0')}`,
      u.name,
      u.email,
      u.subscriptionPlan ? (planConfig[u.subscriptionPlan as keyof typeof planConfig]?.label || u.subscriptionPlan) : 'none',
      u.aiTurnsUsed,
      formatDate(u.createdAt),
      u.isActive ? adminTrans.userStatus.active : adminTrans.userStatus.suspended,
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="adm-um">
      <div className="adm-card">
        {/* Header */}
        <div className="adm-um-header">
          <div>
            <h2 className="adm-um-title">{adminTrans.usersTitle}</h2>
            <p className="adm-um-meta">
              {language === 'vi'
                ? `${total} người dùng · ${newThisMonth} mới tháng này`
                : `${total} users · ${newThisMonth} new this month`}
            </p>
          </div>
          <div className="adm-um-actions">
            <form onSubmit={handleSearch} className="adm-um-search-form">
              <input
                className="adm-um-search"
                placeholder={language === 'vi' ? 'Tìm người dùng...' : 'Search users...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <button className="adm-btn-export" onClick={handleExportCSV}>
              {adminTrans.buttons.exportCsv}
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="adm-um-loading">
            <div className="adm-spinner" />
          </div>
        ) : (
          <table className="adm-um-table">
            <thead>
              <tr>
                {adminTrans.tableHeaders.userHeaders.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => {
                const planCfg = user.subscriptionPlan ? planConfig[user.subscriptionPlan as keyof typeof planConfig] : null
                const initials = user.name.split(' ').map((n) => n[0]).slice(-2).join('').toUpperCase()
                const avatarColors = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                const avatarBg = avatarColors[i % avatarColors.length]

                return (
                  <tr key={user.id}>
                    <td className="adm-td-id">
                      USR-{String(i + 1).padStart(3, '0')}
                    </td>
                    <td>
                      <div className="adm-user-row">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="adm-avatar-img" />
                        ) : (
                          <div className="adm-avatar-circle" style={{ background: avatarBg }}>
                            {initials[0]}
                          </div>
                        )}
                        <span className="adm-user-name">{user.name}</span>
                      </div>
                    </td>
                    <td className="adm-td-email">{user.email}</td>
                    <td>
                      {planCfg ? (
                        <span
                          className="adm-plan-chip"
                          style={{ background: planCfg.bg, color: planCfg.color }}
                        >
                          {planCfg.star && '★ '}
                          {planCfg.label}
                        </span>
                      ) : (
                        <span className="adm-plan-chip" style={{ background: '#f3f4f6', color: '#aaa' }}>—</span>
                      )}
                    </td>
                    <td>
                      <AiUsageBar used={user.aiTurnsUsed} max={user.aiTurns} />
                    </td>
                    <td className="adm-td-date">{formatDate(user.createdAt)}</td>
                    <td>
                      <button
                        className={`adm-status-chip ${user.isActive ? 'adm-status-chip--active' : 'adm-status-chip--suspended'}`}
                        onClick={() => handleToggleStatus(user)}
                        disabled={togglingId === user.id}
                        title={adminTrans.userStatus.toggleTooltip}
                      >
                        ● {user.isActive ? adminTrans.userStatus.active : adminTrans.userStatus.suspended}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .adm-um {
          max-width: 1280px;
        }

        .adm-card {
          background: #fff;
          border: 1px solid #ece8e1;
          border-radius: 14px;
          padding: 22px 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .adm-um-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 16px;
        }

        .adm-um-title {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 3px;
        }

        .adm-um-meta {
          font-size: 12.5px;
          color: #aaa;
          font-weight: 300;
        }

        .adm-um-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .adm-um-search-form {
          display: flex;
        }

        .adm-um-search {
          height: 34px;
          padding: 0 12px;
          border: 1px solid #e0dbd3;
          border-radius: 8px;
          font-size: 13px;
          color: #555;
          background: #fafaf8;
          outline: none;
          width: 200px;
          font-family: 'Inter', sans-serif;
        }

        .adm-um-search:focus {
          border-color: #a78bfa;
        }

        .adm-btn-export {
          height: 34px;
          padding: 0 16px;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background 0.15s;
          white-space: nowrap;
        }

        .adm-btn-export:hover {
          background: #333;
        }

        .adm-um-loading {
          display: flex;
          justify-content: center;
          padding: 48px;
        }

        .adm-spinner {
          width: 28px;
          height: 28px;
          border: 2px solid #e8e4de;
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: adm-spin 0.75s linear infinite;
        }

        @keyframes adm-spin { to { transform: rotate(360deg); } }

        .adm-um-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }

        .adm-um-table th {
          text-align: left;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: #aaa;
          padding: 0 12px 10px;
          border-bottom: 1px solid #f0ece6;
        }

        .adm-um-table td {
          padding: 13px 12px;
          color: #444;
          border-bottom: 1px solid #f8f6f3;
        }

        .adm-um-table tr:last-child td {
          border-bottom: none;
        }

        .adm-um-table tr:hover td {
          background: #fafaf8;
        }

        .adm-td-id {
          font-family: monospace;
          font-size: 12px;
          color: #aaa !important;
        }

        .adm-td-email {
          color: #666 !important;
          font-size: 13px;
        }

        .adm-td-date {
          color: #aaa !important;
          font-size: 12.5px;
        }

        .adm-user-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .adm-avatar-img {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
        }

        .adm-avatar-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .adm-user-name {
          font-weight: 500;
          color: #1a1a1a;
        }

        .adm-plan-chip {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 8px;
        }

        .adm-status-chip {
          display: inline-block;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 20px;
          border: none;
          cursor: pointer;
          transition: opacity 0.15s;
        }

        .adm-status-chip:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .adm-status-chip--active {
          background: rgba(22, 163, 74, 0.08);
          color: #16a34a;
        }

        .adm-status-chip--active:hover:not(:disabled) {
          background: rgba(22, 163, 74, 0.14);
        }

        .adm-status-chip--suspended {
          background: rgba(220, 38, 38, 0.08);
          color: #dc2626;
        }

        .adm-status-chip--suspended:hover:not(:disabled) {
          background: rgba(220, 38, 38, 0.14);
        }
      `}</style>
    </div>
  )
}

const MOCK_USERS: AdminUser[] = [
  { id: '1', name: 'Nguyễn Thu Hà', email: 'nguyen.thu@gmail.com', subscriptionPlan: 'premium', aiTurns: 70, aiTurnsUsed: 47, isActive: true, createdAt: '2026-03-01T00:00:00Z' },
  { id: '2', name: 'Trần Minh Đức', email: 'tran.minh@outlook.com', subscriptionPlan: 'standard', aiTurns: 30, aiTurnsUsed: 23, isActive: true, createdAt: '2026-03-02T00:00:00Z' },
  { id: '3', name: 'Lê Hoàng Anh', email: 'le.hoa@yahoo.com', subscriptionPlan: 'premium', aiTurns: 70, aiTurnsUsed: 61, isActive: true, createdAt: '2026-02-28T00:00:00Z' },
  { id: '4', name: 'Phạm Bảo Long', email: 'pham.long@gmail.com', subscriptionPlan: 'starter', aiTurns: 10, aiTurnsUsed: 8, isActive: true, createdAt: '2026-03-05T00:00:00Z' },
  { id: '5', name: 'Võ Thị Ánh', email: 'vo.anh@gmail.com', subscriptionPlan: 'standard', aiTurns: 30, aiTurnsUsed: 0, isActive: false, createdAt: '2026-03-07T00:00:00Z' },
  { id: '6', name: 'Hoàng Lan Phương', email: 'hoang.lan@icloud.com', subscriptionPlan: 'premium', aiTurns: 70, aiTurnsUsed: 89, isActive: true, createdAt: '2026-02-25T00:00:00Z' },
]
