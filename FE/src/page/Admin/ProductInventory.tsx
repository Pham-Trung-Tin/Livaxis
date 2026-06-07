import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminProducts, type AdminProduct } from '../../services/adminApi'
import { useLanguage } from '../../contexts/LanguageContext'
import { translations } from '../../contexts/translations'

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return 'out_of_stock'
  if (stock <= 5) return 'low_stock'
  return 'in_stock'
}

const MOCK_PRODUCTS: AdminProduct[] = [
  { id: '1', sku: 'PRD-001', name: 'Ghế Sofa Lotus', category: 'Sofas', stock: 24, price: 45900000, createdAt: '2026-01-01T00:00:00Z' },
  { id: '2', sku: 'PRD-002', name: 'Bàn ăn Marble Elite', category: 'Dining', stock: 8, price: 32500000, createdAt: '2026-01-02T00:00:00Z' },
  { id: '3', sku: 'PRD-003', name: 'Giường Aurora King', category: 'Chairs', stock: 15, price: 58900000, createdAt: '2026-01-03T00:00:00Z' },
  { id: '4', sku: 'PRD-004', name: 'Kệ sách Walnut', category: 'Storage', stock: 0, price: 12800000, createdAt: '2026-01-04T00:00:00Z' },
  { id: '5', sku: 'PRD-005', name: 'Đèn cây Onyx', category: 'Lighting', stock: 42, price: 8900000, createdAt: '2026-01-05T00:00:00Z' },
  { id: '6', sku: 'PRD-006', name: 'Ghế văn phòng Aria', category: 'Storage', stock: 3, price: 22500000, createdAt: '2026-01-06T00:00:00Z' },
  { id: '7', sku: 'PRD-007', name: 'Tủ quần áo Zenith', category: 'Chairs', stock: 11, price: 38000000, createdAt: '2026-01-07T00:00:00Z' },
]

export default function ProductInventory() {
  const { language } = useLanguage()
  const adminTrans = translations[language].admin

  const [products, setProducts] = useState<AdminProduct[]>(MOCK_PRODUCTS)
  const [alertCount, setAlertCount] = useState(2)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StockStatus | ''>('')

  const stockStatusConfig = {
    in_stock: { label: adminTrans.stockStatus.in_stock, bg: 'rgba(22,163,74,0.08)', color: '#16a34a' },
    low_stock: { label: adminTrans.stockStatus.low_stock, bg: 'rgba(234,179,8,0.1)', color: '#b45309' },
    out_of_stock: { label: adminTrans.stockStatus.out_of_stock, bg: 'rgba(220,38,38,0.08)', color: '#dc2626' },
  }

  const categoryMap: Record<string, string> = language === 'vi' ? {
    'Lounge Chair': 'Phòng khách',
    'Seating': 'Chỗ ngồi',
    'Dining': 'Phòng ăn',
    'Lighting': 'Ánh sáng',
    'Accent': 'Phụ kiện',
    'Storage': 'Phòng làm việc',
    'Sofas': 'Sofa',
    'Tables': 'Bàn',
    'Chairs': 'Ghế',
  } : {
    'Lounge Chair': 'Lounge Chair',
    'Seating': 'Seating',
    'Dining': 'Dining',
    'Lighting': 'Lighting',
    'Accent': 'Accent',
    'Storage': 'Storage',
    'Sofas': 'Sofas',
    'Tables': 'Tables',
    'Chairs': 'Chairs',
  }

  useEffect(() => {
    getAdminProducts()
      .then((res) => {
        setProducts(res.items)
        setAlertCount(res.alertCount)
      })
      .catch(() => {
        setProducts(MOCK_PRODUCTS)
        setAlertCount(MOCK_PRODUCTS.filter((p) => p.stock <= 5).length)
      })
      .finally(() => setLoading(false))
  }, [])

  const formatPrice = (n: number) => {
    return n.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US') + (language === 'vi' ? 'đ' : ' ₫')
  }

  const filtered = filter
    ? products.filter((p) => getStockStatus(p.stock) === filter)
    : products

  return (
    <div className="adm-pi">
      <div className="adm-card">
        {/* Header */}
        <div className="adm-pi-header">
          <div>
            <h2 className="adm-pi-title">{adminTrans.inventoryTitle}</h2>
            <p className="adm-pi-meta">
              {language === 'vi'
                ? `${products.length} sản phẩm · ${alertCount} cần chú ý`
                : `${products.length} products · ${alertCount} attention required`}
            </p>
          </div>
          <div className="adm-pi-actions">
            <div className="adm-filter-wrap">
              <button
                className={`adm-filter-btn ${filter === '' ? 'adm-filter-btn--active' : ''}`}
                onClick={() => setFilter('')}
              >
                {language === 'vi' ? 'Tất cả' : 'All'}
              </button>
              <button
                className={`adm-filter-btn ${filter === 'low_stock' ? 'adm-filter-btn--active adm-filter-btn--warn' : ''}`}
                onClick={() => setFilter((v) => (v === 'low_stock' ? '' : 'low_stock'))}
              >
                {adminTrans.stockStatus.low_stock}
              </button>
              <button
                className={`adm-filter-btn ${filter === 'out_of_stock' ? 'adm-filter-btn--active adm-filter-btn--danger' : ''}`}
                onClick={() => setFilter((v) => (v === 'out_of_stock' ? '' : 'out_of_stock'))}
              >
                {adminTrans.stockStatus.out_of_stock}
              </button>
            </div>
            <Link to="/manager/products/new" className="adm-btn-add">
              + {language === 'vi' ? 'Thêm sản phẩm' : 'Add Product'}
            </Link>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="adm-pi-loading">
            <div className="adm-spinner" />
          </div>
        ) : (
          <table className="adm-pi-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>{language === 'vi' ? 'TÊN SẢN PHẨM' : 'PRODUCT NAME'}</th>
                <th>{language === 'vi' ? 'DANH MỤC' : 'CATEGORY'}</th>
                <th>{language === 'vi' ? 'TỒN KHO' : 'STOCK'}</th>
                <th>{language === 'vi' ? 'GIÁ' : 'PRICE'}</th>
                <th>{language === 'vi' ? 'TRẠNG THÁI' : 'STATUS'}</th>
                <th>{language === 'vi' ? 'THAO TÁC' : 'ACTION'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, i) => {
                const status = getStockStatus(product.stock)
                const cfg = stockStatusConfig[status]
                const sku = product.sku ?? `PRD-${String(i + 1).padStart(3, '0')}`
                const categoryLabel = categoryMap[product.category] ?? product.category

                return (
                  <tr key={product.id}>
                    <td className="adm-td-sku">{sku}</td>
                    <td>
                      <span className="adm-pi-product-name">{product.name}</span>
                    </td>
                    <td className="adm-td-cat">{categoryLabel}</td>
                    <td>
                      <span
                        className="adm-td-stock"
                        style={{ color: status === 'out_of_stock' ? '#dc2626' : status === 'low_stock' ? '#d97706' : '#1a1a1a' }}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="adm-td-price">{formatPrice(product.price)}</td>
                    <td>
                      <span
                        className="adm-stock-badge"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        ● {cfg.label}
                      </span>
                    </td>
                    <td>
                      <div className="adm-td-actions">
                        <Link
                          to={`/manager/products/${product.id}`}
                          className="adm-action-btn"
                          title={language === 'vi' ? 'Chỉnh sửa' : 'Edit'}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="adm-td-empty">
                    {language === 'vi' ? 'Không có sản phẩm nào' : 'No products found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .adm-pi {
          max-width: 1280px;
        }

        .adm-card {
          background: #fff;
          border: 1px solid #ece8e1;
          border-radius: 14px;
          padding: 22px 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .adm-pi-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 16px;
        }

        .adm-pi-title {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 3px;
        }

        .adm-pi-meta {
          font-size: 12.5px;
          color: #aaa;
          font-weight: 300;
        }

        .adm-pi-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .adm-filter-wrap {
          display: flex;
          align-items: center;
          gap: 4px;
          border: 1px solid #e0dbd3;
          border-radius: 8px;
          padding: 3px;
          background: #fafaf8;
        }

        .adm-filter-btn {
          height: 28px;
          padding: 0 12px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          background: transparent;
          color: #888;
          transition: all 0.15s;
          font-family: 'Inter', sans-serif;
        }

        .adm-filter-btn:hover {
          background: #f0ece6;
          color: #555;
        }

        .adm-filter-btn--active {
          background: #1a1a1a;
          color: #fff;
        }

        .adm-filter-btn--active.adm-filter-btn--warn {
          background: #d97706;
        }

        .adm-filter-btn--active.adm-filter-btn--danger {
          background: #dc2626;
        }

        .adm-btn-add {
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
          text-decoration: none;
          display: flex;
          align-items: center;
          transition: background 0.15s;
          white-space: nowrap;
        }

        .adm-btn-add:hover {
          background: #333;
        }

        .adm-pi-loading {
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

        .adm-pi-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }

        .adm-pi-table th {
          text-align: left;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: #aaa;
          padding: 0 12px 10px;
          border-bottom: 1px solid #f0ece6;
        }

        .adm-pi-table td {
          padding: 14px 12px;
          color: #444;
          border-bottom: 1px solid #f8f6f3;
        }

        .adm-pi-table tr:last-child td {
          border-bottom: none;
        }

        .adm-pi-table tr:hover td {
          background: #fafaf8;
        }

        .adm-td-sku {
          font-family: monospace;
          font-size: 12px;
          color: #aaa !important;
        }

        .adm-pi-product-name {
          font-weight: 600;
          color: #1a1a1a;
        }

        .adm-td-cat {
          color: #888 !important;
          font-size: 13px;
        }

        .adm-td-stock {
          font-weight: 600;
          font-size: 14px;
        }

        .adm-td-price {
          font-size: 13.5px;
          color: #555 !important;
        }

        .adm-td-price::after {
          text-decoration: underline;
        }

        .adm-stock-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 20px;
          white-space: nowrap;
        }

        .adm-td-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .adm-action-btn {
          width: 28px;
          height: 28px;
          border: 1px solid #e0dbd3;
          border-radius: 6px;
          background: #fafaf8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #888;
          text-decoration: none;
          transition: all 0.15s;
        }

        .adm-action-btn:hover {
          border-color: #a78bfa;
          color: #7c3aed;
          background: #f5f3ff;
        }

        .adm-td-empty {
          text-align: center;
          color: #aaa;
          font-size: 13px;
          padding: 32px !important;
        }
      `}</style>
    </div>
  )
}
