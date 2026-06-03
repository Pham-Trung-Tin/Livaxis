import { useEffect } from 'react'
import { motion } from 'motion/react'
import { Check, X } from 'lucide-react'

export interface ToastProps {
  id: string
  title: string
  description?: string
  onClose: () => void
  duration?: number
}

export function Toast({ title, description, onClose, duration = 4000 }: ToastProps) {
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

      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className="absolute bottom-0 left-0 h-[3px] bg-[#c8b898]"
      />
    </motion.div>
  )
}
