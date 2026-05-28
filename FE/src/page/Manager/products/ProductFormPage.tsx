import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Save, ExternalLink } from 'lucide-react'
import {
  createManagerProduct,
  updateManagerProduct,
  getManagerProductById,
  type CreateProductPayload,
} from '../../../services/managerProductApi'

const CATEGORIES = [
  'Lounge Chair', 'Seating', 'Dining', 'Lighting',
  'Accent', 'Storage', 'Sofas', 'Tables', 'Chairs',
] as const

const STYLES = ['Minimalist', 'Modern Luxury', 'Industrial'] as const

type FormMode = 'create' | 'edit'

interface ProductFormPageProps {
  mode: FormMode
}

type FormState = {
  name: string
  subtitle: string
  category: string
  style: string
  price: string
  imageUrl: string
  images: string
  affiliateUrl: string
  description: string
  material: string
  color: string
  colorHex: string
  dimensions: string
}

const emptyForm: FormState = {
  name: '', subtitle: '', category: '', style: 'Modern Luxury',
  price: '', imageUrl: '', images: '', affiliateUrl: '',
  description: '', material: '', color: '', colorHex: '', dimensions: '',
}

export default function ProductFormPage({ mode }: ProductFormPageProps) {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loadingData, setLoadingData] = useState(mode === 'edit')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    if (mode === 'edit' && id) {
      setLoadingData(true)
      getManagerProductById(id)
        .then((product) => {
          setForm({
            name: product.name ?? '',
            subtitle: product.subtitle ?? '',
            category: product.category ?? '',
            style: product.style ?? 'Modern Luxury',
            price: String(product.price ?? ''),
            imageUrl: product.imageUrl ?? '',
            images: (product.images ?? []).join('\n'),
            affiliateUrl: product.affiliateUrl ?? '',
            description: product.description ?? '',
            material: product.material ?? '',
            color: product.color ?? '',
            colorHex: product.colorHex ?? '',
            dimensions: product.dimensions ?? '',
          })
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load product'))
        .finally(() => setLoadingData(false))
    }
  }, [mode, id])

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const price = parseFloat(form.price)
    if (!form.name.trim()) return setError('Product name is required')
    if (!form.category) return setError('Category is required')
    if (!form.affiliateUrl.trim()) return setError('Affiliate URL is required')
    if (isNaN(price) || price < 0) return setError('Price must be a valid number')
    if (!form.imageUrl.trim()) return setError('Main image URL is required')

    const payload: CreateProductPayload = {
      name: form.name.trim(),
      subtitle: form.subtitle.trim() || undefined,
      category: form.category as CreateProductPayload['category'],
      style: form.style as CreateProductPayload['style'],
      price,
      imageUrl: form.imageUrl.trim(),
      images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
      affiliateUrl: form.affiliateUrl.trim(),
      description: form.description.trim() || undefined,
      material: form.material.trim() || undefined,
      color: form.color.trim() || undefined,
      colorHex: form.colorHex.trim() || undefined,
      dimensions: form.dimensions.trim() || undefined,
    }

    setSaving(true)
    try {
      if (mode === 'create') {
        await createManagerProduct(payload)
      } else if (id) {
        await updateManagerProduct(id, payload)
      }
      navigate('/manager/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loadingData) {
    return (
      <div className="pform-loading">
        <Loader2 size={28} className="pform-spinner" strokeWidth={1.5} />
        <p>Loading product...</p>
      </div>
    )
  }

  return (
    <div className="pform">
      {/* Header */}
      <div className="pform-header">
        <button className="pform-back-btn" onClick={() => navigate('/manager/products')}>
          <ArrowLeft size={15} strokeWidth={1.5} />
          Back to Products
        </button>
        <h1 className="pform-title">
          {mode === 'create' ? 'Add New Product' : 'Edit Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="pform-layout">
        {/* Left column — main fields */}
        <div className="pform-col pform-col--main">

          {/* Basic Info */}
          <div className="pform-card">
            <h2 className="pform-card-title">Basic Information</h2>

            <div className="pform-field">
              <label className="pform-label">Product Name <span className="pform-required">*</span></label>
              <input className="pform-input" value={form.name} onChange={set('name')} placeholder="e.g. Nordic Lounge Chair" required />
            </div>

            <div className="pform-field">
              <label className="pform-label">Subtitle</label>
              <input className="pform-input" value={form.subtitle} onChange={set('subtitle')} placeholder="Short description (max 180 chars)" maxLength={180} />
            </div>

            <div className="pform-row">
              <div className="pform-field">
                <label className="pform-label">Category <span className="pform-required">*</span></label>
                <select className="pform-select" value={form.category} onChange={set('category')} required>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="pform-field">
                <label className="pform-label">Style <span className="pform-required">*</span></label>
                <select className="pform-select" value={form.style} onChange={set('style')}>
                  {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="pform-field">
              <label className="pform-label">Reference Price (VND) <span className="pform-required">*</span></label>
              <input className="pform-input" type="number" min={0} value={form.price} onChange={set('price')} placeholder="e.g. 2500000" required />
            </div>
          </div>

          {/* Images */}
          <div className="pform-card">
            <h2 className="pform-card-title">Images</h2>

            <div className="pform-field">
              <label className="pform-label">Main Image URL <span className="pform-required">*</span></label>
              <input className="pform-input" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." required />
              {form.imageUrl && (
                <div className="pform-img-preview">
                  <img src={form.imageUrl} alt="preview" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}
            </div>

            <div className="pform-field">
              <label className="pform-label">Gallery Images</label>
              <p className="pform-hint">One URL per line</p>
              <textarea className="pform-textarea" rows={4} value={form.images} onChange={set('images')} placeholder={"https://...\nhttps://..."} />
            </div>
          </div>

          {/* Description */}
          <div className="pform-card">
            <h2 className="pform-card-title">Description</h2>
            <div className="pform-field">
              <textarea className="pform-textarea" rows={5} value={form.description} onChange={set('description')} placeholder="Describe the product, its features and use cases..." />
            </div>
          </div>
        </div>

        {/* Right column — meta + submit */}
        <div className="pform-col pform-col--side">

          {/* Submit */}
          <div className="pform-card">
            {error && <p className="pform-error">{error}</p>}
            <button type="submit" className="pform-submit-btn" disabled={saving}>
              {saving
                ? <><Loader2 size={14} className="pform-spinner" /> Saving...</>
                : <><Save size={14} /> {mode === 'create' ? 'Create Product' : 'Save Changes'}</>
              }
            </button>
            <button type="button" className="pform-cancel-btn" onClick={() => navigate('/manager/products')} disabled={saving}>
              Cancel
            </button>
          </div>

          {/* Affiliate */}
          <div className="pform-card">
            <h2 className="pform-card-title">Affiliate Link</h2>
            <div className="pform-field">
              <label className="pform-label">Shopee URL <span className="pform-required">*</span></label>
              <input className="pform-input" value={form.affiliateUrl} onChange={set('affiliateUrl')} placeholder="https://shopee.vn/..." required />
              {form.affiliateUrl && (
                <a href={form.affiliateUrl} target="_blank" rel="noopener noreferrer" className="pform-preview-link">
                  <ExternalLink size={12} strokeWidth={1.5} /> Preview Shopee link
                </a>
              )}
            </div>
          </div>

          {/* Specs */}
          <div className="pform-card">
            <h2 className="pform-card-title">Specifications</h2>

            <div className="pform-field">
              <label className="pform-label">Material</label>
              <input className="pform-input" value={form.material} onChange={set('material')} placeholder="e.g. Oak wood, Leather" />
            </div>

            <div className="pform-field">
              <label className="pform-label">Color</label>
              <input className="pform-input" value={form.color} onChange={set('color')} placeholder="e.g. Walnut Brown" />
            </div>

            <div className="pform-field">
              <label className="pform-label">Color Hex</label>
              <div className="pform-color-row">
                <input
                  type="color"
                  className="pform-color-picker"
                  value={form.colorHex || '#000000'}
                  onChange={(e) => setForm((prev) => ({ ...prev, colorHex: e.target.value }))}
                />
                <input
                  className="pform-input"
                  value={form.colorHex}
                  onChange={set('colorHex')}
                  placeholder="#a08c6a"
                  pattern="^#([0-9a-fA-F]{6})$"
                />
              </div>
            </div>

            <div className="pform-field">
              <label className="pform-label">Dimensions</label>
              <input className="pform-input" value={form.dimensions} onChange={set('dimensions')} placeholder="e.g. 80W x 85D x 75H cm" />
            </div>
          </div>
        </div>
      </form>

      <style>{`
        .pform {
          padding: 40px 52px;
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
        }

        .pform-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 120px 20px;
          color: #aaa;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
        }

        .pform-spinner {
          animation: pfspin 0.9s linear infinite;
        }
        @keyframes pfspin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .pform-header {
          margin-bottom: 32px;
        }

        .pform-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13px;
          color: #999;
          padding: 0;
          font-family: 'Inter', sans-serif;
          margin-bottom: 12px;
          transition: color 0.15s;
        }

        .pform-back-btn:hover { color: #555; }

        .pform-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        /* Layout */
        .pform-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 20px;
          align-items: start;
        }

        .pform-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Card */
        .pform-card {
          background: #fff;
          border: 1px solid #ece8e1;
          border-radius: 14px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .pform-card-title {
          font-size: 13px;
          font-weight: 600;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0ece5;
        }

        /* Fields */
        .pform-field {
          margin-bottom: 16px;
        }

        .pform-field:last-child { margin-bottom: 0; }

        .pform-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .pform-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #777;
          margin-bottom: 7px;
          letter-spacing: 0.02em;
        }

        .pform-required { color: #dc2626; }

        .pform-hint {
          font-size: 11px;
          color: #bbb;
          margin: -4px 0 6px;
        }

        .pform-input, .pform-select, .pform-textarea {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #e5e0d8;
          border-radius: 9px;
          font-size: 13.5px;
          font-family: 'Inter', sans-serif;
          color: #1a1a1a;
          background: #fdfcfa;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
          font-weight: 300;
        }

        .pform-input:focus, .pform-select:focus, .pform-textarea:focus {
          border-color: #a08c6a;
          box-shadow: 0 0 0 3px rgba(160, 140, 106, 0.1);
          background: #fff;
        }

        .pform-select { cursor: pointer; }

        .pform-textarea { resize: vertical; line-height: 1.6; }

        /* Image preview */
        .pform-img-preview {
          margin-top: 10px;
          width: 100%;
          height: 160px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #e5e0d8;
          background: #f5f3ef;
        }

        .pform-img-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Color picker */
        .pform-color-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .pform-color-picker {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 1px solid #e5e0d8;
          padding: 2px;
          cursor: pointer;
          background: none;
          flex-shrink: 0;
        }

        /* Affiliate preview */
        .pform-preview-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #e4380d;
          text-decoration: none;
          margin-top: 8px;
          font-weight: 500;
        }

        .pform-preview-link:hover { text-decoration: underline; }

        /* Submit */
        .pform-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          margin-bottom: 14px;
        }

        .pform-submit-btn {
          width: 100%;
          padding: 12px;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: background 0.15s;
          margin-bottom: 10px;
        }

        .pform-submit-btn:hover:not(:disabled) { background: #000; }
        .pform-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .pform-cancel-btn {
          width: 100%;
          padding: 11px;
          background: #f5f3ef;
          color: #555;
          border: 1px solid #e5e0d8;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 400;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background 0.15s;
        }

        .pform-cancel-btn:hover:not(:disabled) { background: #ece8e1; }
        .pform-cancel-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  )
}
