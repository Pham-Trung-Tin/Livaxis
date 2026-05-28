import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import {
  listManagerProducts,
  deleteManagerProduct,
  type ManagerProduct,
} from '../../../services/managerProductApi'

const CATEGORIES = [
  'Lounge Chair',
  'Seating',
  'Dining',
  'Lighting',
  'Accent',
  'Storage',
  'Sofas',
  'Tables',
  'Chairs',
] as const

const STYLES = ['Minimalist', 'Modern Luxury', 'Industrial'] as const

const LIMIT = 12

type DeleteDialogState =
  | { open: false }
  | { open: true; productId: string; productName: string }

export default function ProductListPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<ManagerProduct[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: LIMIT,
    totalItems: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory] = useState('')
  const [style, setStyle] = useState('')
  const [page, setPage] = useState(1)
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({ open: false })
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await listManagerProducts({
        page,
        limit: LIMIT,
        search: search || undefined,
        category: category || undefined,
        style: style || undefined,
      })
      setProducts(result.items)
      setPagination(result.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [page, search, category, style])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setSearch(value)
      setPage(1)
    }, 400)
  }

  const handleFilterChange = (type: 'category' | 'style', value: string) => {
    if (type === 'category') setCategory(value)
    else setStyle(value)
    setPage(1)
  }

  const openDeleteDialog = (product: ManagerProduct) => {
    setDeleteDialog({ open: true, productId: product.id, productName: product.name })
  }

  const handleDelete = async () => {
    if (!deleteDialog.open) return
    setDeleting(true)
    try {
      await deleteManagerProduct(deleteDialog.productId)
      setDeleteDialog({ open: false })
      setSuccessMsg(`"${deleteDialog.productName}" deleted successfully`)
      setTimeout(() => setSuccessMsg(''), 3500)
      void fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      setDeleteDialog({ open: false })
    } finally {
      setDeleting(false)
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

  return (
    <div className="plist">
      {/* Page header */}
      <div className="plist-header">
        <div>
          <h1 className="plist-title">Products</h1>
          <p className="plist-subtitle">
            {pagination.totalItems > 0
              ? `${pagination.totalItems} products in catalogue`
              : 'Manage your product catalogue'}
          </p>
        </div>
        <Link to="/manager/products/new" className="plist-add-btn">
          <Plus size={15} strokeWidth={2} />
          Add Product
        </Link>
      </div>

      {/* Toast messages */}
      {successMsg && (
        <div className="plist-toast plist-toast--success">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X size={14} /></button>
        </div>
      )}
      {error && (
        <div className="plist-toast plist-toast--error">
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}

      {/* Filters */}
      <div className="plist-filters">
        <div className="plist-search-wrap">
          <Search size={15} className="plist-search-icon" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="plist-search-input"
          />
          {searchInput && (
            <button
              className="plist-search-clear"
              onClick={() => {
                setSearchInput('')
                setSearch('')
                setPage(1)
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        <select
          value={category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="plist-select"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={style}
          onChange={(e) => handleFilterChange('style', e.target.value)}
          className="plist-select"
        >
          <option value="">All Styles</option>
          {STYLES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="plist-table-wrap">
        {loading ? (
          <div className="plist-state-center">
            <Loader2 size={28} className="plist-spinner" strokeWidth={1.5} />
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="plist-state-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
            <p className="plist-empty-title">No products found</p>
            <p className="plist-empty-sub">Try adjusting filters or add a new product</p>
            <Link to="/manager/products/new" className="plist-add-btn" style={{ marginTop: 16 }}>
              <Plus size={15} strokeWidth={2} />
              Add First Product
            </Link>
          </div>
        ) : (
          <table className="plist-table">
            <thead>
              <tr>
                <th className="plist-th" style={{ width: 56 }}></th>
                <th className="plist-th">Product</th>
                <th className="plist-th">Category</th>
                <th className="plist-th">Style</th>
                <th className="plist-th">Price</th>
                <th className="plist-th">Affiliate</th>
                <th className="plist-th" style={{ width: 90, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="plist-tr">
                  <td className="plist-td">
                    <div className="plist-thumb-wrap">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="plist-thumb"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="%23e5e5e5"%3E%3Crect width="24" height="24" rx="4"/%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                  </td>
                  <td className="plist-td">
                    <p className="plist-product-name">{product.name}</p>
                    {product.subtitle && (
                      <p className="plist-product-sub">{product.subtitle}</p>
                    )}
                  </td>
                  <td className="plist-td">
                    <span className="plist-badge plist-badge--cat">{product.category}</span>
                  </td>
                  <td className="plist-td">
                    <span className={`plist-badge plist-badge--style plist-badge--style-${product.style.replace(/\s+/g, '-').toLowerCase()}`}>
                      {product.style}
                    </span>
                  </td>
                  <td className="plist-td plist-price">{formatPrice(product.price)}</td>
                  <td className="plist-td">
                    <a
                      href={product.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="plist-affiliate-link"
                      title={product.affiliateUrl}
                    >
                      <ExternalLink size={12} strokeWidth={1.5} />
                      Shopee
                    </a>
                  </td>
                  <td className="plist-td plist-actions">
                    <button
                      className="plist-action-btn plist-action-btn--edit"
                      onClick={() => navigate(`/manager/products/${product.id}`)}
                      title="Edit product"
                    >
                      <Pencil size={13} strokeWidth={1.5} />
                    </button>
                    <button
                      className="plist-action-btn plist-action-btn--delete"
                      onClick={() => openDeleteDialog(product)}
                      title="Delete product"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="plist-pagination">
          <p className="plist-pagination-info">
            Page {pagination.page} of {pagination.totalPages} — {pagination.totalItems} total
          </p>
          <div className="plist-pagination-btns">
            <button
              className="plist-page-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft size={15} strokeWidth={1.5} />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2)
              .map((p) => (
                <button
                  key={p}
                  className={`plist-page-btn ${p === page ? 'plist-page-btn--active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
            <button
              className="plist-page-btn"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
            >
              <ChevronRight size={15} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {deleteDialog.open && (
        <div className="plist-overlay" onClick={() => !deleting && setDeleteDialog({ open: false })}>
          <div className="plist-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="plist-dialog-icon">
              <AlertTriangle size={22} strokeWidth={1.5} />
            </div>
            <h3 className="plist-dialog-title">Delete Product?</h3>
            <p className="plist-dialog-body">
              This will permanently delete{' '}
              <strong>"{deleteDialog.productName}"</strong> from your catalogue.
              This action cannot be undone.
            </p>
            <div className="plist-dialog-actions">
              <button
                className="plist-dialog-btn plist-dialog-btn--cancel"
                onClick={() => setDeleteDialog({ open: false })}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="plist-dialog-btn plist-dialog-btn--delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <><Loader2 size={13} className="plist-spinner" /> Deleting...</>
                ) : (
                  <><Trash2 size={13} /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .plist {
          padding: 40px 52px;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }

        /* Header */
        .plist-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .plist-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 4px;
        }

        .plist-subtitle {
          font-size: 13px;
          color: #999;
          font-weight: 300;
          margin: 0;
        }

        .plist-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 18px;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, transform 0.15s;
          font-family: 'Inter', sans-serif;
        }

        .plist-add-btn:hover {
          background: #000;
          transform: translateY(-1px);
        }

        /* Toast */
        .plist-toast {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 9px;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .plist-toast--success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #15803d;
        }

        .plist-toast--error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .plist-toast button {
          background: none;
          border: none;
          cursor: pointer;
          color: inherit;
          opacity: 0.6;
          display: flex;
          padding: 2px;
          flex-shrink: 0;
        }

        /* Filters */
        .plist-filters {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .plist-search-wrap {
          position: relative;
          flex: 1;
          min-width: 220px;
          max-width: 320px;
        }

        .plist-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #aaa;
          pointer-events: none;
        }

        .plist-search-input {
          width: 100%;
          padding: 9px 36px 9px 36px;
          border: 1px solid #e5e0d8;
          border-radius: 9px;
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          background: #fff;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }

        .plist-search-input:focus {
          border-color: #a08c6a;
        }

        .plist-search-clear {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #aaa;
          display: flex;
          padding: 2px;
        }

        .plist-search-clear:hover { color: #555; }

        .plist-select {
          padding: 9px 14px;
          border: 1px solid #e5e0d8;
          border-radius: 9px;
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          background: #fff;
          color: #1a1a1a;
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
        }

        .plist-select:focus { border-color: #a08c6a; }

        /* Table */
        .plist-table-wrap {
          background: #fff;
          border: 1px solid #ece8e1;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .plist-state-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 80px 20px;
          color: #aaa;
          font-size: 14px;
        }

        .plist-empty-title {
          font-size: 16px;
          font-weight: 500;
          color: #555;
          margin: 0;
        }

        .plist-empty-sub {
          font-size: 13px;
          color: #aaa;
          margin: 0;
        }

        .plist-spinner {
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .plist-table {
          width: 100%;
          border-collapse: collapse;
        }

        .plist-th {
          padding: 13px 16px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #aaa;
          text-align: left;
          background: #fdfcfa;
          border-bottom: 1px solid #ece8e1;
        }

        .plist-tr {
          transition: background 0.1s;
        }

        .plist-tr:hover {
          background: #fdfbf8;
        }

        .plist-tr:not(:last-child) {
          border-bottom: 1px solid #f3efe8;
        }

        .plist-td {
          padding: 13px 16px;
          vertical-align: middle;
        }

        .plist-thumb-wrap {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #ece8e1;
          flex-shrink: 0;
        }

        .plist-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .plist-product-name {
          font-size: 13.5px;
          font-weight: 500;
          color: #1a1a1a;
          margin: 0 0 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }

        .plist-product-sub {
          font-size: 12px;
          color: #aaa;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
          font-weight: 300;
        }

        .plist-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 9px;
          border-radius: 5px;
          font-size: 11.5px;
          font-weight: 500;
          white-space: nowrap;
        }

        .plist-badge--cat {
          background: #f0ece4;
          color: #7a6a4f;
        }

        .plist-badge--style {
          background: #f5f3ef;
          color: #888;
        }

        .plist-badge--style-minimalist { background: #f0f4ff; color: #5a6fb0; }
        .plist-badge--style-modern-luxury { background: #fdf0e8; color: #b0754a; }
        .plist-badge--style-industrial { background: #f0f0f0; color: #666; }

        .plist-price {
          font-size: 13.5px;
          font-weight: 500;
          color: #2a2a2a;
          white-space: nowrap;
        }

        .plist-affiliate-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #e4380d;
          text-decoration: none;
          font-weight: 500;
          padding: 3px 9px;
          border-radius: 5px;
          background: #fff1ee;
          transition: background 0.15s;
        }

        .plist-affiliate-link:hover { background: #ffe0d9; }

        .plist-actions {
          display: flex;
          gap: 6px;
          justify-content: flex-end;
        }

        .plist-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          background: none;
        }

        .plist-action-btn--edit {
          color: #7a6a4f;
          border-color: #e5e0d8;
          background: #faf8f5;
        }

        .plist-action-btn--edit:hover {
          background: #a08c6a;
          color: #fff;
          border-color: #a08c6a;
        }

        .plist-action-btn--delete {
          color: #cc4444;
          border-color: #fde8e8;
          background: #fff9f9;
        }

        .plist-action-btn--delete:hover {
          background: #dc2626;
          color: #fff;
          border-color: #dc2626;
        }

        /* Pagination */
        .plist-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 0 0;
        }

        .plist-pagination-info {
          font-size: 12.5px;
          color: #aaa;
        }

        .plist-pagination-btns {
          display: flex;
          gap: 4px;
        }

        .plist-page-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: 1px solid #e5e0d8;
          background: #fff;
          cursor: pointer;
          font-size: 13px;
          color: #555;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          font-family: 'Inter', sans-serif;
        }

        .plist-page-btn:hover:not(:disabled) {
          border-color: #a08c6a;
          color: #a08c6a;
        }

        .plist-page-btn--active {
          background: #1a1a1a;
          border-color: #1a1a1a;
          color: #fff;
        }

        .plist-page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* Delete Dialog */
        .plist-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          backdrop-filter: blur(4px);
        }

        .plist-dialog {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          max-width: 380px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          animation: dialogIn 0.2s ease;
        }

        @keyframes dialogIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .plist-dialog-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: #fff3f3;
          color: #dc2626;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .plist-dialog-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 10px;
        }

        .plist-dialog-body {
          font-size: 13.5px;
          color: #666;
          font-weight: 300;
          line-height: 1.6;
          margin: 0 0 24px;
        }

        .plist-dialog-body strong {
          font-weight: 500;
          color: #333;
        }

        .plist-dialog-actions {
          display: flex;
          gap: 10px;
        }

        .plist-dialog-btn {
          flex: 1;
          padding: 11px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.15s;
        }

        .plist-dialog-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .plist-dialog-btn--cancel {
          background: #f5f3ef;
          color: #555;
          border: 1px solid #e5e0d8;
        }

        .plist-dialog-btn--cancel:hover:not(:disabled) {
          background: #ece8e1;
        }

        .plist-dialog-btn--delete {
          background: #dc2626;
          color: #fff;
        }

        .plist-dialog-btn--delete:hover:not(:disabled) {
          background: #b91c1c;
        }
      `}</style>
    </div>
  )
}
