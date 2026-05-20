import { useEffect } from 'react'
import { motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export interface ToastProps {
  id: string
  title: string
  description?: string
  product?: {
    name: string
    imageUrl: string
    price: number
    quantity: number
  }
  onClose: () => void
  duration?: number
}

export function Toast({ title, description, product, onClose, duration = 4000 }: ToastProps) {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative w-full max-w-[360px] md:max-w-[380px] overflow-hidden rounded-2xl border border-[#c8b898]/30 bg-white/95 backdrop-blur-md p-4 shadow-[0_15px_40px_rgba(200,184,152,0.15)] flex flex-col gap-3 pointer-events-auto"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#c8b898]/10 text-[#8a7456]">
            <Check size={14} strokeWidth={3} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-800">{title}</h4>
            {description && <p className="text-[11px] text-neutral-500 mt-0.5">{description}</p>}
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {product && (
        <div className="flex items-center gap-3 rounded-xl bg-[#faf9f7] border border-[#c8b898]/10 p-2.5">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white border border-neutral-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23f7f5f2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%238f7b5f" font-size="10">Image</text></svg>';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="truncate text-xs font-semibold text-neutral-800">{product.name}</h5>
            <p className="mt-0.5 text-[10px] text-neutral-400">Quantity: {product.quantity}</p>
            <p className="mt-0.5 text-xs font-medium text-[#8a7456]">${(product.price * product.quantity).toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => {
            onClose()
            navigate('/cart')
          }}
          className="flex-1 cursor-pointer rounded-lg bg-black py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-neutral-800 transition-colors"
        >
          View Cart
        </button>
        <button
          onClick={onClose}
          className="flex-1 cursor-pointer rounded-lg border border-neutral-200 bg-white py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          Continue
        </button>
      </div>

      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className="absolute bottom-0 left-0 h-[3px] bg-[#c8b898]"
      />
    </motion.div>
  )
}
