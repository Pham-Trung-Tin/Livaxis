import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import { Package, ArrowRight } from 'lucide-react'

export default function ManagerDashboard() {
  const { user } = useAuth()

  return (
    <div className="mgr-dash">
      {/* Header */}
      <div className="mgr-dash-header">
        <div>
          <p className="mgr-dash-greeting">Good day,</p>
          <h1 className="mgr-dash-title">{user?.name ?? 'Admin'}</h1>
        </div>
        <div className="mgr-dash-badge">
          <span>Admin Panel</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mgr-dash-section-label">Quick Actions</div>
      <div className="mgr-dash-cards">
        <Link to="/manager/products" className="mgr-dash-card">
          <div className="mgr-dash-card-icon">
            <Package size={22} strokeWidth={1.5} />
          </div>
          <div className="mgr-dash-card-body">
            <h3 className="mgr-dash-card-title">Product Management</h3>
            <p className="mgr-dash-card-desc">Add, edit, and remove products from the catalogue</p>
          </div>
          <ArrowRight size={16} className="mgr-dash-card-arrow" strokeWidth={1.5} />
        </Link>

        <Link to="/manager/products/new" className="mgr-dash-card mgr-dash-card--accent">
          <div className="mgr-dash-card-icon mgr-dash-card-icon--accent">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <div className="mgr-dash-card-body">
            <h3 className="mgr-dash-card-title">Add New Product</h3>
            <p className="mgr-dash-card-desc">Create a new product listing with affiliate link</p>
          </div>
          <ArrowRight size={16} className="mgr-dash-card-arrow" strokeWidth={1.5} />
        </Link>
      </div>

      <style>{`
        .mgr-dash {
          padding: 48px 52px;
          max-width: 900px;
        }

        .mgr-dash-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 52px;
          padding-bottom: 32px;
          border-bottom: 1px solid #e8e4de;
        }

        .mgr-dash-greeting {
          font-size: 13px;
          color: #999;
          font-weight: 300;
          margin-bottom: 4px;
          letter-spacing: 0.02em;
        }

        .mgr-dash-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.1;
        }

        .mgr-dash-badge {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #a08c6a;
          background: rgba(160, 140, 106, 0.08);
          border: 1px solid rgba(160, 140, 106, 0.2);
          padding: 5px 12px;
          border-radius: 20px;
        }

        .mgr-dash-section-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #aaa;
          margin-bottom: 16px;
        }

        .mgr-dash-cards {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .mgr-dash-card {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 22px 24px;
          background: #ffffff;
          border: 1px solid #ece8e1;
          border-radius: 14px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .mgr-dash-card:hover {
          border-color: #c8b898;
          box-shadow: 0 4px 16px rgba(160, 140, 106, 0.12);
          transform: translateY(-1px);
        }

        .mgr-dash-card--accent {
          background: linear-gradient(135deg, #fdfbf8, #faf6f0);
          border-color: rgba(160, 140, 106, 0.2);
        }

        .mgr-dash-card-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: #f5f3ef;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8a7a5f;
          flex-shrink: 0;
        }

        .mgr-dash-card-icon--accent {
          background: rgba(160, 140, 106, 0.12);
          color: #a08c6a;
        }

        .mgr-dash-card-body {
          flex: 1;
        }

        .mgr-dash-card-title {
          font-size: 15px;
          font-weight: 500;
          color: #1a1a1a;
          margin-bottom: 3px;
        }

        .mgr-dash-card-desc {
          font-size: 13px;
          color: #999;
          font-weight: 300;
        }

        .mgr-dash-card-arrow {
          color: #ccc;
          flex-shrink: 0;
          transition: transform 0.2s, color 0.2s;
        }

        .mgr-dash-card:hover .mgr-dash-card-arrow {
          transform: translateX(3px);
          color: #a08c6a;
        }
      `}</style>
    </div>
  )
}
