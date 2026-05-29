import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import {
  LayoutGrid,
  Package,
  Users,
  CreditCard,
  Zap,
  Settings,
  LogOut,
  ChevronLeft,
  Bell,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard Overview', href: '/admin', icon: LayoutGrid, end: true },
  { label: 'Product Inventory', href: '/admin/products', icon: Package, end: false, badge: null as number | null },
  { label: 'User Management', href: '/admin/users', icon: Users, end: false },
  { label: 'Subscription Plans', href: '/admin/subscriptions', icon: CreditCard, end: false },
  { label: 'AI Analytics', href: '/admin/ai-analytics', icon: Zap, end: false },
]

const pageTitleMap: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'Dashboard Overview', subtitle: 'Chào buổi sáng, Admin — đây là tổng quan hôm nay.' },
  '/admin/products': { title: 'Product Inventory', subtitle: 'Quản lý danh mục sản phẩm Livaxis' },
  '/admin/users': { title: 'User Management', subtitle: 'Danh sách người dùng đã đăng ký' },
  '/admin/subscriptions': { title: 'Subscription Plans', subtitle: 'Theo dõi các gói và doanh thu' },
  '/admin/ai-analytics': { title: 'AI Analytics', subtitle: 'Thống kê AI của hệ thống' },
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [productAlertCount] = useState(2)

  const handleLogout = async () => {
    await logout()
    navigate('/sign-in')
  }

  const currentPage = pageTitleMap[location.pathname] ?? { title: 'Admin', subtitle: '' }
  const avatarLetter = (user?.name ?? user?.email ?? 'A').charAt(0).toUpperCase()

  const sidebarWidth = collapsed ? 64 : 240

  return (
    <div className="adm-root">
      {/* Sidebar */}
      <aside className="adm-sidebar" style={{ width: sidebarWidth }}>
        {/* Logo */}
        <div className="adm-logo-area">
          <Link to="/admin" className="adm-logo-link">
            {!collapsed && (
              <>
                <span className="adm-logo-text">LIVAXIS</span>
                <span className="adm-logo-badge">ADMIN</span>
              </>
            )}
            {collapsed && <span className="adm-logo-text" style={{ fontSize: 14 }}>L</span>}
          </Link>
        </div>

        {/* Nav */}
        <nav className="adm-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `adm-nav-item ${isActive ? 'adm-nav-item--active' : ''} ${collapsed ? 'adm-nav-item--collapsed' : ''}`
              }
            >
              <item.icon size={16} strokeWidth={1.5} className="adm-nav-icon" />
              {!collapsed && <span className="adm-nav-label">{item.label}</span>}
              {!collapsed && item.label === 'Product Inventory' && productAlertCount > 0 && (
                <span className="adm-nav-badge">{productAlertCount}</span>
              )}
              {collapsed && item.label === 'Product Inventory' && productAlertCount > 0 && (
                <span className="adm-nav-badge adm-nav-badge--dot" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="adm-sidebar-bottom">
          <NavLink
            to="/admin/settings"
            title={collapsed ? 'Settings' : undefined}
            className={({ isActive }) =>
              `adm-nav-item ${isActive ? 'adm-nav-item--active' : ''} ${collapsed ? 'adm-nav-item--collapsed' : ''}`
            }
          >
            <Settings size={16} strokeWidth={1.5} className="adm-nav-icon" />
            {!collapsed && <span className="adm-nav-label">Settings</span>}
          </NavLink>

          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign Out' : undefined}
            className={`adm-nav-item adm-signout-btn ${collapsed ? 'adm-nav-item--collapsed' : ''}`}
          >
            <LogOut size={16} strokeWidth={1.5} className="adm-nav-icon" />
            {!collapsed && <span className="adm-nav-label">Sign Out</span>}
          </button>

          <button
            onClick={() => setCollapsed((v) => !v)}
            className={`adm-nav-item adm-collapse-btn ${collapsed ? 'adm-nav-item--collapsed' : ''}`}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <ChevronLeft
              size={16}
              strokeWidth={1.5}
              className="adm-nav-icon"
              style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}
            />
            {!collapsed && <span className="adm-nav-label">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="adm-main-wrap" style={{ marginLeft: sidebarWidth }}>
        {/* Top header */}
        <header className="adm-header">
          <div className="adm-header-left">
            <h1 className="adm-header-title">{currentPage.title}</h1>
            {currentPage.subtitle && (
              <p className="adm-header-subtitle">{currentPage.subtitle}</p>
            )}
          </div>
          <div className="adm-header-right">
            <button className="adm-notif-btn" title="Notifications">
              <Bell size={18} strokeWidth={1.5} />
            </button>
            <div className="adm-user-chip">
              <div className="adm-user-avatar">{avatarLetter}</div>
              <div className="adm-user-info">
                <span className="adm-user-email">{user?.email ?? 'admin@gmail.com'}</span>
                <span className="adm-super-badge">SUPER ADMIN</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="adm-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;600&display=swap');

        .adm-root {
          display: flex;
          min-height: 100vh;
          background: #f5f4f2;
          font-family: 'Inter', sans-serif;
        }

        /* ── Sidebar ── */
        .adm-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          background: #0f0f0f;
          display: flex;
          flex-direction: column;
          z-index: 40;
          border-right: 1px solid #1e1e1e;
          transition: width 0.25s ease;
          overflow: hidden;
        }

        .adm-logo-area {
          padding: 24px 20px 20px;
          border-bottom: 1px solid #1e1e1e;
          min-height: 72px;
          display: flex;
          align-items: center;
        }

        .adm-logo-link {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          white-space: nowrap;
        }

        .adm-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: 0.05em;
        }

        .adm-logo-badge {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #a78bfa;
          background: rgba(167, 139, 250, 0.1);
          border: 1px solid rgba(167, 139, 250, 0.25);
          padding: 2px 7px;
          border-radius: 4px;
        }

        /* Nav */
        .adm-nav {
          flex: 1;
          padding: 16px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }

        .adm-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 8px;
          text-decoration: none;
          color: #666;
          font-size: 13px;
          font-weight: 400;
          transition: all 0.15s ease;
          border: none;
          background: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          white-space: nowrap;
          position: relative;
        }

        .adm-nav-item--collapsed {
          justify-content: center;
          padding: 9px;
        }

        .adm-nav-item:hover {
          background: #1a1a1a;
          color: #ccc;
        }

        .adm-nav-item--active {
          background: rgba(124, 58, 237, 0.1);
          color: #a78bfa;
          font-weight: 500;
        }

        .adm-nav-item--active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: #7c3aed;
          border-radius: 0 2px 2px 0;
        }

        .adm-nav-item--collapsed.adm-nav-item--active::before {
          height: 50%;
        }

        .adm-nav-icon {
          flex-shrink: 0;
        }

        .adm-nav-label {
          flex: 1;
        }

        .adm-nav-badge {
          background: #7c3aed;
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        .adm-nav-badge--dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          padding: 0;
          min-width: unset;
        }

        /* Bottom section */
        .adm-sidebar-bottom {
          padding: 10px 10px 16px;
          border-top: 1px solid #1e1e1e;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .adm-signout-btn:hover {
          color: #f87171 !important;
        }

        .adm-collapse-btn {
          color: #444 !important;
        }

        .adm-collapse-btn:hover {
          color: #888 !important;
        }

        /* ── Main wrap ── */
        .adm-main-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          transition: margin-left 0.25s ease;
        }

        /* ── Header ── */
        .adm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          height: 72px;
          background: #f5f4f2;
          border-bottom: 1px solid #e8e4de;
          position: sticky;
          top: 0;
          z-index: 30;
          gap: 16px;
        }

        .adm-header-left {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .adm-header-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.2;
        }

        .adm-header-subtitle {
          font-size: 12.5px;
          color: #999;
          font-weight: 300;
        }

        .adm-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .adm-notif-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #e0dbd3;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #777;
          transition: all 0.15s;
        }

        .adm-notif-btn:hover {
          border-color: #c5bcb0;
          color: #444;
        }

        .adm-user-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff;
          border: 1px solid #e0dbd3;
          border-radius: 10px;
          padding: 6px 12px 6px 8px;
        }

        .adm-user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #7c3aed;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .adm-user-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .adm-user-email {
          font-size: 12.5px;
          font-weight: 500;
          color: #1a1a1a;
        }

        .adm-super-badge {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #7c3aed;
        }

        /* ── Content ── */
        .adm-content {
          flex: 1;
          padding: 28px 32px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  )
}
