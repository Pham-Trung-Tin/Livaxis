import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import {
  LayoutGrid,
  Package,
  LogOut,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  {
    label: 'Dashboard',
    href: '/manager',
    icon: LayoutGrid,
    end: true,
  },
  {
    label: 'Products',
    href: '/manager/products',
    icon: Package,
    end: false,
  },
]

export default function ManagerLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/sign-in')
  }

  return (
    <div className="manager-root">
      {/* Sidebar */}
      <aside className="manager-sidebar">
        <div className="manager-sidebar-logo">
          <Link to="/manager" className="manager-logo-link">
            <span className="manager-logo-text">Livaxis</span>
            <span className="manager-logo-badge">Admin</span>
          </Link>
        </div>

        <nav className="manager-nav">
          <p className="manager-nav-section-label">Management</p>
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }) =>
                `manager-nav-item ${isActive ? 'manager-nav-item--active' : ''}`
              }
            >
              <item.icon size={16} strokeWidth={1.5} />
              <span>{item.label}</span>
              <ChevronRight size={12} className="manager-nav-chevron" />
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="manager-sidebar-footer">
          <div className="manager-user-info">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="manager-user-avatar" />
            ) : (
              <div className="manager-user-avatar manager-user-avatar--placeholder">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="manager-user-details">
              <p className="manager-user-name">{user?.name}</p>
              <p className="manager-user-email">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="manager-logout-btn" title="Sign out">
            <LogOut size={15} strokeWidth={1.5} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="manager-main">
        <Outlet />
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;600&display=swap');

        .manager-root {
          display: flex;
          min-height: 100vh;
          background: #f5f4f2;
          font-family: 'Inter', sans-serif;
        }

        /* ── Sidebar ── */
        .manager-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 240px;
          background: #0f0f0f;
          display: flex;
          flex-direction: column;
          z-index: 40;
          border-right: 1px solid #1e1e1e;
        }

        .manager-sidebar-logo {
          padding: 28px 24px 20px;
          border-bottom: 1px solid #1e1e1e;
        }

        .manager-logo-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .manager-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: -0.3px;
        }

        .manager-logo-badge {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #a08c6a;
          background: rgba(160, 140, 106, 0.12);
          border: 1px solid rgba(160, 140, 106, 0.25);
          padding: 2px 7px;
          border-radius: 4px;
        }

        /* Nav */
        .manager-nav {
          flex: 1;
          padding: 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }

        .manager-nav-section-label {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #444;
          padding: 0 12px;
          margin-bottom: 6px;
        }

        .manager-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 8px;
          text-decoration: none;
          color: #777;
          font-size: 13.5px;
          font-weight: 400;
          transition: all 0.15s ease;
          position: relative;
        }

        .manager-nav-item:hover {
          background: #1a1a1a;
          color: #d4c4a8;
        }

        .manager-nav-item--active {
          background: rgba(160, 140, 106, 0.1);
          color: #c8b898;
          font-weight: 500;
        }

        .manager-nav-item--active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: #a08c6a;
          border-radius: 0 2px 2px 0;
        }

        .manager-nav-chevron {
          margin-left: auto;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .manager-nav-item:hover .manager-nav-chevron,
        .manager-nav-item--active .manager-nav-chevron {
          opacity: 0.5;
        }

        /* Footer */
        .manager-sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid #1e1e1e;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .manager-user-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .manager-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid #2a2a2a;
          flex-shrink: 0;
        }

        .manager-user-avatar--placeholder {
          background: rgba(160, 140, 106, 0.15);
          color: #a08c6a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
        }

        .manager-user-details {
          min-width: 0;
        }

        .manager-user-name {
          font-size: 12.5px;
          font-weight: 500;
          color: #d0d0d0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .manager-user-email {
          font-size: 11px;
          color: #555;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .manager-logout-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #444;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.15s;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .manager-logout-btn:hover {
          background: #1e1e1e;
          color: #e07070;
        }

        /* ── Main content ── */
        .manager-main {
          margin-left: 240px;
          flex: 1;
          min-height: 100vh;
          overflow-y: auto;
        }
      `}</style>
    </div>
  )
}
