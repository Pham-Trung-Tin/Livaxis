import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sparkles,
  Camera,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Check,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Lightbulb,
  CornerDownRight,
  Palette,
  Layers,
  Move,
  RefreshCw,
  Download,
  ShoppingBag,
  Info,
  Eye,
  EyeOff,
  Scan,
  Box,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/* ═══════════════════════════════════════════════════════════════════ */
/* Constants */
/* ═══════════════════════════════════════════════════════════════════ */

const BEFORE_IMG =
  'https://images.unsplash.com/photo-1700798001708-dacda2a012b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbXB0eSUyMG1pbmltYWxpc3QlMjByb29tJTIwY29ybmVyJTIwd2hpdGUlMjB3YWxscyUyMHdvb2RlbiUyMGZsb29yJTIwc3VubGlnaHR8ZW58MXx8fHwxNzcyODE2MDcxfDA&ixlib=rb-4.1.0&q=80&w=1080'

const AFTER_IMG =
  'https://images.unsplash.com/photo-1771316210386-39662a3b28fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBsaXZpbmclMjByb29tJTIwY29ybmVyJTIBc29mYSUyMGFjY2VudCUyMGNoYWlyJTIwc3R5bGVkJTIwaW50ZXJpb3IlMjBkZXNpZ258ZW58MXx8fHwxNzcyODE2MDcxfDA&ixlib=rb-4.1.0&q=80&w=1080'

const PRODUCT_THUMBNAIL =
  'https://images.unsplash.com/photo-1772208392357-e074b8c1f100?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2ZWx2ZXQlMjBzb2ZhJTIwd2FybSUyMGxpZ2h0JTIwZWRpdG9yaWFsJTIwcHJvZHVjdCUyMHNob3R8ZW58MXx8fHwxNzcyODE2MDc0fDA&ixlib=rb-4.1.0&q=80&w=200'

const ROOM_THUMB_2 =
  'https://images.unsplash.com/photo-1676973694580-2fca4513e6e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiZWRyb29tJTIwY29ybmVyJTIwbmV1dHJhbCUyMGxpbmVuJTIwbW9ybmluZyUyMGxpZ2h0JTIwZW1wdHklMjB3YWxsfGVufDF8fHx8MTc3MjgxNjA3Mnww&ixlib=rb-4.1.0&q=80&w=200'

const PRODUCTS = [
  {
    id: 1,
    name: 'Aria Velvet Sofa',
    sku: 'LVX-0201',
    category: 'Living Room',
    img: PRODUCT_THUMBNAIL,
    confidence: 96,
  },
  {
    id: 2,
    name: 'Nordic Armchair',
    sku: 'LVX-0108',
    category: 'Living Room',
    img: PRODUCT_THUMBNAIL,
    confidence: 91,
  },
  {
    id: 3,
    name: 'Solstice Side Table',
    sku: 'LVX-0312',
    category: 'Living Room',
    img: PRODUCT_THUMBNAIL,
    confidence: 88,
  },
]

const GEMINI_OPTIONS = [
  {
    id: 'corner',
    icon: CornerDownRight,
    label: 'Integrate into Corner',
    desc: 'Optimal corner placement with shadow mapping',
    default: true,
  },
  {
    id: 'lighting',
    icon: Lightbulb,
    label: 'Auto-match Lighting',
    desc: 'Adapt product lighting to room ambience',
    default: false,
  },
  {
    id: 'decor',
    icon: Palette,
    label: 'Suggest Matching Decor',
    desc: 'AI-curated accessory recommendations',
    default: false,
  },
  {
    id: 'shadow',
    icon: Layers,
    label: 'Realistic Shadow Cast',
    desc: 'Physically-based shadow rendering',
    default: true,
  },
]

const PROCESSING_STEPS = [
  'Analyzing room geometry & depth...',
  'Detecting ambient light sources...',
  'Mapping floor & wall surfaces...',
  'Integrating product into scene...',
  'Applying material & shadow pass...',
  'Rendering final composition...',
]

type StudioState = 'upload' | 'processing' | 'studio'

/* ═══════════════════════════════════════════════════════════════════ */
/* Helper Components */
/* ═══════════════════════════════════════════════════════════════════ */

function GeminiLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
      <path
        d="M14 2C14 8.627 8.627 14 2 14C8.627 14 14 19.373 14 26C14 19.373 19.373 14 26 14C19.373 14 14 8.627 14 2Z"
        fill="#c8b898"
      />
    </svg>
  )
}

function ImageWithFallback({
  src,
  alt,
  className,
  style,
}: {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
}) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#f7f5f2] text-center text-sm text-[#8f7b5f]">
        Image unavailable
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  )
}

function ScanLine() {
  return (
    <motion.div
      className="absolute left-[12%] right-[12%] h-px"
      style={{
        background:
          'linear-gradient(90deg, transparent, rgba(200,184,152,0.5), transparent)',
      }}
      animate={{ top: ['15%', '85%', '15%'] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

function CornerBracket({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const base = 'absolute w-8 h-8'
  const corners = {
    tl: 'top-0 left-0 border-t border-l',
    tr: 'top-0 right-0 border-t border-r',
    bl: 'bottom-0 left-0 border-b border-l',
    br: 'bottom-0 right-0 border-b border-r',
  }
  return <div className={`${base} ${corners[pos]} border-white/20`} />
}

function SlimSlider({
  label,
  value,
  min,
  max,
  unit = '',
  onChange,
  accent = false,
}: {
  label: string
  value: number
  min: number
  max: number
  unit?: string
  onChange: (v: number) => void
  accent?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[0.16em] uppercase text-white/35">
          {label}
        </span>
        <span
          className={`text-[10px] tabular-nums ${
            accent ? 'text-[#c8b898]' : 'text-white/50'
          }`}
        >
          {value}
          {unit}
        </span>
      </div>
      <div className="group relative h-[2px] cursor-pointer rounded-full bg-white/[0.06]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#8a7456] to-[#c8b898] transition-none"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
          style={{ height: '16px', top: '-7px' }}
        />
        <div
          className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full border border-white/20 bg-white shadow-lg"
          style={{ left: `${((value - min) / (max - min)) * 100}%` }}
        />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/* Upload View */
/* ═══════════════════════════════════════════════════════════════════ */

function UploadView({ onStart }: { onStart: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  return (
    <motion.div
      key="upload"
      className="relative flex flex-1 flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(200,184,152,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="mb-12 flex items-center gap-6">
        {['Step 1', 'Step 2', 'Step 3'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[9px] ${
                i === 0
                  ? 'border-[#c8b898] bg-[#c8b898]/10 text-[#c8b898]'
                  : 'border-white/10 text-white/20'
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-[10px] tracking-[0.14em] uppercase ${
                i === 0 ? 'text-[#c8b898]' : 'text-white/20'
              }`}
            >
              {s === 'Step 1'
                ? 'Capture Room'
                : s === 'Step 2'
                  ? 'AI Processing'
                  : 'Review & Place'}
            </span>
            {i < 2 && <div className="ml-2 h-px w-8 bg-white/10" />}
          </div>
        ))}
      </div>

      <div
        className={`relative h-[340px] w-[340px] cursor-pointer rounded-2xl border transition-all duration-300 sm:h-[420px] sm:w-[420px] ${
          dragOver
            ? 'border-[#c8b898]/50 bg-[#c8b898]/[0.03]'
            : 'border-white/[0.08] hover:border-white/[0.15]'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          onStart()
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onStart}
        />

        <CornerBracket pos="tl" />
        <CornerBracket pos="tr" />
        <CornerBracket pos="bl" />
        <CornerBracket pos="br" />

        <ScanLine />

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute left-1/2 top-0 h-px w-16 -translate-x-1/2 bg-white/8" />
            <div className="absolute left-0 top-1/2 h-16 w-px -translate-y-1/2 bg-white/8" />
          </div>
        </div>

        {[
          { cls: 'top-3 left-3' },
          { cls: 'top-3 right-3' },
          { cls: 'bottom-3 left-3' },
          { cls: 'bottom-3 right-3' },
        ].map(({ cls }, i) => (
          <motion.div
            key={i}
            className={`absolute ${cls} h-1 w-1 rounded-full bg-[#c8b898]`}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
          />
        ))}

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
          <motion.div
            className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Camera size={32} className="text-white/20" strokeWidth={1} />
          </motion.div>

          <div className="px-6 text-center">
            <p className="mb-1.5 text-[15px] text-white/70">
              Capture or Upload your room corner
            </p>
            <p className="text-[11px] leading-relaxed text-white/25">
              Drop an image here, or click to browse. Best results with
              <br />a clear, well-lit corner view.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded border border-white/[0.07] px-3 py-1 text-[9px] tracking-[0.18em] uppercase text-white/25">
              JPG / PNG / WEBP
            </span>
            <span className="rounded border border-white/[0.07] px-3 py-1 text-[9px] tracking-[0.18em] uppercase text-white/25">
              Up to 20 MB
            </span>
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-3 rounded-xl bg-white px-7 py-3 text-black hover:bg-white/90 transition-all"
        >
          <Upload size={14} strokeWidth={2} />
          <span className="text-[11px] tracking-[0.14em] uppercase font-semibold">
            Upload Photo
          </span>
        </button>
        <button
          onClick={onStart}
          className="flex items-center gap-3 rounded-xl border border-white/10 px-7 py-3 text-white/50 hover:border-white/25 hover:text-white transition-all"
        >
          <Camera size={14} strokeWidth={1.5} />
          <span className="text-[11px] tracking-[0.14em] uppercase font-medium">
            Use Camera
          </span>
        </button>
      </div>

      <button
        onClick={onStart}
        className="mt-5 text-[11px] text-[#c8b898]/50 underline underline-offset-4 decoration-[#c8b898]/20 hover:text-[#c8b898] transition-colors"
      >
        Try with a sample room instead →
      </button>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/* Processing View */
/* ═══════════════════════════════════════════════════════════════════ */

function ProcessingView({
  progress,
  step,
}: {
  progress: number
  step: number
}) {
  return (
    <motion.div
      key="processing"
      className="relative flex flex-1 items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(200,184,152,0.05) 0%, transparent 60%)',
        }}
      />

      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
        (angle, i) => (
          <motion.div
            key={angle}
            className="pointer-events-none absolute left-1/2 top-1/2 origin-left"
            style={{ rotate: `${angle}deg`, width: '260px', height: '1px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{
              duration: 3,
              delay: i * 0.18,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div
              className="h-full"
              style={{
                background:
                  'linear-gradient(90deg, rgba(200,184,152,0.5), rgba(200,184,152,0.1), transparent)',
              }}
            />
          </motion.div>
        )
      )}

      <div className="relative z-10 max-w-sm px-4 text-center">
        <div className="relative mx-auto mb-10 h-28 w-28">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: '1px solid rgba(200,184,152,0.15)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-3 rounded-full"
            style={{ border: '1px dashed rgba(200,184,152,0.1)' }}
            animate={{ rotate: -360 }}
            transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-6 rounded-full"
            style={{ border: '1px solid rgba(200,184,152,0.2)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-0 h-2 w-2 rounded-full"
              style={{
                backgroundColor: '#c8b898',
                boxShadow: '0 0 10px rgba(200,184,152,0.8)',
              }}
            />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <GeminiLogo />
            </motion.div>
          </div>
        </div>

        <p className="mb-1 text-[17px] text-white/80">
          Gemini is reading your space
        </p>
        <p className="mb-8 text-[11px] tracking-wide text-white/25">
          Powered by Google Gemini AI
        </p>

        <div className="mb-8 space-y-2.5 text-left">
          {PROCESSING_STEPS.map((s, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: i <= step ? 1 : 0.18, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
            >
              <div className="flex h-4 w-4 items-center justify-center shrink-0">
                {i < step ? (
                  <Check size={11} className="text-[#c8b898]" />
                ) : i === step ? (
                  <motion.div
                    className="h-3 w-3 rounded-full border border-[#c8b898] border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                ) : (
                  <div className="h-2.5 w-2.5 rounded-full border border-white/10" />
                )}
              </div>
              <span
                className={`text-[11px] ${
                  i < step
                    ? 'text-white/40 line-through decoration-white/20'
                    : i === step
                      ? 'text-white/75'
                      : 'text-white/18'
                }`}
              >
                {s}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-full bg-white/[0.05] h-[2px]">
            <motion.div
              className="rounded-full h-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #8a7456, #c8b898)',
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[9px] tracking-[0.14em] uppercase text-white/20">
              Processing
            </span>
            <span className="text-[10px] tabular-nums text-[#c8b898]/70">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/* Gemini Side Panel */
/* ═══════════════════════════════════════════════════════════════════ */

function GeminiPanel({
  selectedOptions,
  onToggle,
  onReprocess,
  selectedProduct,
  onSelectProduct,
  confidence,
}: {
  selectedOptions: string[]
  onToggle: (id: string) => void
  onReprocess: () => void
  selectedProduct: number
  onSelectProduct: (id: number) => void
  confidence: number
}) {
  const [geminiExpanded, setGeminiExpanded] = useState(true)

  return (
    <div
      className="flex w-[280px] shrink-0 flex-col overflow-y-auto border-l xl:w-[300px]"
      style={{
        backgroundColor: '#0C0C0C',
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      {/* Gemini Header */}
      <div
        className="flex items-center justify-between border-b px-5 py-4"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{
              backgroundColor: 'rgba(200,184,152,0.1)',
              border: '1px solid rgba(200,184,152,0.15)',
            }}
          >
            <GeminiLogo />
          </div>
          <div>
            <p className="text-[11px] tracking-[0.06em] text-white/70">
              Gemini AI Studio
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <motion.div
                className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[9px] tracking-[0.1em] uppercase text-white/30">
                Analysis complete
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setGeminiExpanded((p) => !p)}
          className="flex h-6 w-6 items-center justify-center rounded text-white/25 hover:text-white/60 transition-colors"
        >
          {geminiExpanded ? (
            <Minimize2 size={12} />
          ) : (
            <Maximize2 size={12} />
          )}
        </button>
      </div>

      {/* Fit Confidence */}
      <div
        className="border-b px-5 py-4"
        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
      >
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[9px] tracking-[0.18em] uppercase text-white/30">
            Fit Confidence
          </span>
          <span className="text-[13px] text-[#c8b898] font-semibold">
            {confidence}%
          </span>
        </div>
        <div className="overflow-hidden rounded-full h-1 bg-white/[0.05]">
          <motion.div
            className="rounded-full h-full"
            style={{
              background: 'linear-gradient(90deg, #6B5B45, #c8b898)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
        <div className="mt-3 flex items-start gap-2">
          <Check size={10} className="mt-0.5 shrink-0 text-emerald-400" />
          <p className="text-[10px] leading-relaxed text-white/30">
            Excellent spatial match. Corner angle and ceiling height are ideal
            for this piece.
          </p>
        </div>
      </div>

      {/* Room Analysis */}
      <div
        className="border-b px-5 py-4"
        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
      >
        <p className="mb-3 text-[9px] tracking-[0.18em] uppercase text-white/30">
          Room Analysis
        </p>
        <div className="space-y-2">
          {[
            { label: 'Lighting', value: 'Warm natural', icon: Lightbulb },
            { label: 'Floor Type', value: 'Light oak hardwood', icon: Layers },
            { label: 'Wall Tone', value: 'Warm white #F7F5F0', icon: Palette },
            { label: 'Room Size', value: 'Est. 4.2 × 3.8 m', icon: Scan },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon size={11} className="shrink-0 text-white/20" />
                <span className="text-[10px] text-white/30">{label}</span>
              </div>
              <span className="text-right text-[10px] text-white/55">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Options */}
      <AnimatePresence>
        {geminiExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className="border-b px-5 py-4"
              style={{ borderColor: 'rgba(255,255,255,0.04)' }}
            >
              <p className="mb-3 text-[9px] tracking-[0.18em] uppercase text-white/30">
                Integration Options
              </p>
              <div className="space-y-2">
                {GEMINI_OPTIONS.map((opt) => {
                  const active = selectedOptions.includes(opt.id)
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onToggle(opt.id)}
                      className={`w-full rounded-lg border px-3 py-2.5 text-left transition-all duration-200 flex items-start gap-3 ${
                        active
                          ? 'bg-[#c8b898]/[0.08] border-[#c8b898]/20'
                          : 'border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]'
                      }`}
                    >
                      <Icon
                        size={13}
                        className={`mt-0.5 shrink-0 ${
                          active
                            ? 'text-[#c8b898]'
                            : 'text-white/25'
                        }`}
                        strokeWidth={1.5}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[11px] leading-tight font-medium ${
                            active ? 'text-white/80' : 'text-white/35'
                          }`}
                        >
                          {opt.label}
                        </p>
                        <p className="mt-0.5 text-[10px] leading-snug text-white/20">
                          {opt.desc}
                        </p>
                      </div>
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                          active
                            ? 'border-[#c8b898] bg-[#c8b898]'
                            : 'border-white/10'
                        }`}
                      >
                        {active && (
                          <Check size={9} className="text-black" strokeWidth={3} />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Selector */}
      <div
        className="border-b px-5 py-4"
        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
      >
        <p className="mb-3 text-[9px] tracking-[0.18em] uppercase text-white/30">
          Selected Product
        </p>
        <div className="space-y-1.5">
          {PRODUCTS.map((p) => {
            const active = selectedProduct === p.id
            return (
              <button
                key={p.id}
                onClick={() => onSelectProduct(p.id)}
                className={`w-full rounded-lg border px-2.5 py-2 text-left transition-all duration-200 flex items-center gap-3 ${
                  active
                    ? 'border-white/[0.08] bg-white/[0.05]'
                    : 'border-transparent hover:bg-white/[0.02]'
                }`}
              >
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-white/5">
                  <ImageWithFallback
                    src={p.img}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`truncate text-[10px] leading-tight ${
                      active ? 'text-white/75' : 'text-white/35'
                    } font-medium`}
                  >
                    {p.name}
                  </p>
                  <p className="mt-0.5 text-[9px] text-white/20">{p.sku}</p>
                </div>
                {active && (
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#c8b898]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2.5 px-5 py-4">
        <button
          onClick={onReprocess}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#c8b898]/20 py-2.5 text-[#c8b898]/70 hover:border-[#c8b898]/40 hover:bg-[#c8b898]/[0.04] hover:text-[#c8b898] transition-all"
        >
          <RefreshCw size={12} />
          <span className="text-[10px] tracking-[0.12em] uppercase font-medium">
            Re-generate
          </span>
        </button>
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-black hover:bg-white/90 transition-all">
          <ShoppingBag size={12} />
          <span className="text-[10px] tracking-[0.12em] uppercase font-semibold">
            Add to Cart
          </span>
        </button>
      </div>

      {/* Disclaimer */}
      <div className="mt-auto px-5 pb-5">
        <div
          className="flex items-start gap-2 rounded-lg p-3"
          style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <Info size={10} className="mt-0.5 shrink-0 text-white/20" />
          <p className="text-[9px] leading-relaxed text-white/20">
            AI visualization is indicative. Final product may vary slightly in
            colour and scale. Powered by Google Gemini.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/* Left Project Panel */
/* ═══════════════════════════════════════════════════════════════════ */

function LeftPanel({
  currentState,
  onReset,
}: {
  currentState: StudioState
  onReset: () => void
}) {
  return (
    <div
      className="flex w-[200px] shrink-0 flex-col border-r xl:w-[220px]"
      style={{
        backgroundColor: '#0C0C0C',
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      {/* Project Info */}
      <div
        className="border-b px-4 py-4"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <p className="mb-3 text-[9px] tracking-[0.18em] uppercase text-white/25">
          Session
        </p>
        <p className="text-[11px] leading-tight text-white/50">
          Untitled Session
        </p>
        <p className="mt-0.5 text-[9px] text-white/20">Living Room · 1 scene</p>
      </div>

      {/* Workflow Steps */}
      <div
        className="flex flex-1 border-b px-4 py-4"
        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
      >
        <div className="w-full">
          <p className="mb-4 text-[9px] tracking-[0.18em] uppercase text-white/25">
            Workflow
          </p>
          <div className="space-y-1">
            {[
              {
                label: 'Upload Room',
                state: 'upload' as StudioState,
                icon: Camera,
              },
              {
                label: 'AI Processing',
                state: 'processing' as StudioState,
                icon: Sparkles,
              },
              { label: 'Review & Place', state: 'studio' as StudioState, icon: Box },
            ].map(({ label, state, icon: Icon }, i) => {
              const states: StudioState[] = ['upload', 'processing', 'studio']
              const currentIdx = states.indexOf(currentState)
              const stepIdx = states.indexOf(state)
              const done = stepIdx < currentIdx
              const active = stepIdx === currentIdx

              return (
                <div key={label} className="relative">
                  <div className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 ${active ? 'bg-white/[0.04]' : ''}`}>
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
                        done
                          ? 'border border-[#c8b898]/20 bg-[#c8b898]/15'
                          : active
                            ? 'border border-white/10 bg-white/[0.06]'
                            : 'border border-white/[0.06]'
                      }`}
                    >
                      {done ? (
                        <Check size={9} className="text-[#c8b898]" />
                      ) : (
                        <Icon
                          size={9}
                          className={
                            active ? 'text-white/60' : 'text-white/15'
                          }
                          strokeWidth={1.5}
                        />
                      )}
                    </div>
                    <span
                      className={`text-[10px] ${
                        done
                          ? 'text-white/30'
                          : active
                            ? 'text-white/65'
                            : 'text-white/20'
                      } ${active ? 'font-medium' : 'font-normal'}`}
                    >
                      {label}
                    </span>
                    {active && (
                      <div className="ml-auto h-1 w-1 shrink-0 rounded-full bg-[#c8b898]" />
                    )}
                  </div>
                  {i < 2 && (
                    <div
                      className="absolute left-[18px] top-full h-1 w-px"
                      style={{
                        backgroundColor: done
                          ? 'rgba(200,184,152,0.15)'
                          : 'rgba(255,255,255,0.04)',
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Room Scenes */}
      <div
        className="border-b px-4 py-4"
        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
      >
        <p className="mb-3 text-[9px] tracking-[0.18em] uppercase text-white/25">
          Scenes
        </p>
        <div className="space-y-1.5">
          {[
            { label: 'Main Room', img: BEFORE_IMG, active: true },
            { label: 'Bedroom Corner', img: ROOM_THUMB_2, active: false },
          ].map(({ label, img, active }) => (
            <div
              key={label}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-all ${
                active
                  ? 'border border-white/[0.07] bg-white/[0.04]'
                  : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-white/5">
                <ImageWithFallback
                  src={img}
                  alt={label}
                  className="h-full w-full object-cover"
                />
              </div>
              <p
                className={`truncate text-[10px] ${
                  active ? 'text-white/60' : 'text-white/25'
                }`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="px-4 py-4">
        <button
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.06] py-2 text-white/25 hover:border-white/10 hover:text-white/50 transition-all"
        >
          <RotateCcw size={11} />
          <span className="text-[10px] tracking-[0.1em] uppercase">
            Start Over
          </span>
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/* Studio Canvas */
/* ═══════════════════════════════════════════════════════════════════ */

function StudioCanvas({
  sliderPos,
  setSliderPos,
  zoom,
  setZoom,
  rotation,
  setRotation,
  opacity,
  setOpacity,
  showOverlay,
  setShowOverlay,
}: {
  sliderPos: number
  setSliderPos: (v: number) => void
  zoom: number
  setZoom: (v: number) => void
  rotation: number
  setRotation: (v: number) => void
  opacity: number
  setOpacity: (v: number) => void
  showOverlay: boolean
  setShowOverlay: (v: boolean) => void
}) {
  const compareRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [viewMode, setViewMode] = useState<'split' | 'before' | 'after'>(
    'split'
  )

  const handleSliderMove = useCallback(
    (clientX: number) => {
      if (!compareRef.current || !isDragging) return
      const rect = compareRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
      setSliderPos((x / rect.width) * 100)
    },
    [isDragging, setSliderPos]
  )

  useEffect(() => {
    const onMove = (e: MouseEvent) => handleSliderMove(e.clientX)
    const onTouchMove = (e: TouchEvent) =>
      handleSliderMove(e.touches[0].clientX)
    const onUp = () => setIsDragging(false)
    if (isDragging) {
      window.addEventListener('mousemove', onMove)
      window.addEventListener('touchmove', onTouchMove)
      window.addEventListener('mouseup', onUp)
      window.addEventListener('touchend', onUp)
    }
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
    }
  }, [isDragging, handleSliderMove])

  return (
    <div className="flex flex-1 flex-col min-w-0">
      {/* View mode tabs */}
      <div
        className="flex shrink-0 items-center justify-between border-b px-5 py-2.5"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-1">
          {(['split', 'before', 'after'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded px-3 py-1 text-[10px] tracking-[0.1em] uppercase transition-all ${
                viewMode === mode
                  ? 'border border-white/[0.08] bg-white/[0.07] text-white/70'
                  : 'text-white/25 hover:text-white/45'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className="flex items-center gap-1.5 text-[10px] text-white/25 hover:text-white/50 transition-colors"
          >
            {showOverlay ? (
              <Eye size={11} />
            ) : (
              <EyeOff size={11} />
            )}
            <span className="tracking-[0.1em] uppercase">Overlays</span>
          </button>
          <div className="h-3 w-px bg-white/10" />
          <button className="text-white/25 hover:text-white/50 transition-colors">
            <Download size={13} />
          </button>
          <button className="text-white/25 hover:text-white/50 transition-colors">
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* Main canvas area */}
      <div className="relative flex-1 overflow-hidden bg-[#070707]">
        {/* Canvas grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Image comparison */}
        <div
          ref={compareRef}
          className="absolute inset-0 flex select-none items-center justify-center cursor-col-resize"
          onMouseDown={() => viewMode === 'split' && setIsDragging(true)}
          onTouchStart={() => viewMode === 'split' && setIsDragging(true)}
        >
          {/* After (full) */}
          {viewMode !== 'before' && (
            <div className="absolute inset-0">
              <ImageWithFallback
                src={AFTER_IMG}
                alt="AI Result"
                className="h-full w-full object-contain"
              />
            </div>
          )}

          {/* Before (clipped) */}
          {viewMode !== 'after' && (
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: viewMode === 'before' ? '100%' : `${sliderPos}%` }}
            >
              <ImageWithFallback
                src={BEFORE_IMG}
                alt="Original Room"
                className="h-full object-contain"
                style={{
                  width: compareRef.current
                    ? `${compareRef.current.offsetWidth}px`
                    : '100%',
                  maxWidth: 'none',
                }}
              />
            </div>
          )}

          {/* Split divider */}
          {viewMode === 'split' && (
            <div
              className="pointer-events-none absolute bottom-0 top-0 z-20"
              style={{
                left: `${sliderPos}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {/* Line */}
              <div className="h-full w-px bg-white/50" />
              {/* Drag handle */}
              <div className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-col-resize">
                <motion.div
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-2xl backdrop-blur-sm"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SlidersHorizontal
                    size={14}
                    className="rotate-90 text-neutral-600"
                  />
                </motion.div>
              </div>
              {/* Labels */}
              <div className="absolute top-6 -translate-x-[calc(100%+10px)]">
                <span className="rounded bg-black/50 px-2 py-1 text-[8px] tracking-[0.16em] uppercase text-white/60 backdrop-blur-sm">
                  Original
                </span>
              </div>
              <div className="absolute left-2.5 top-6">
                <span
                  className="rounded px-2 py-1 text-[8px] tracking-[0.16em] uppercase text-[#c8b898] backdrop-blur-sm"
                  style={{
                    backgroundColor: 'rgba(200,184,152,0.2)',
                    border: '1px solid rgba(200,184,152,0.2)',
                  }}
                >
                  AI Result
                </span>
              </div>
            </div>
          )}

          {/* Overlay annotations */}
          {showOverlay && viewMode !== 'before' && (
            <>
              {/* Measurement lines */}
              <motion.div
                className="absolute bottom-20 right-12 z-20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div
                  className="flex flex-col gap-1.5 rounded-xl p-3 backdrop-blur-md"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.55)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#c8b898]" />
                    <span className="text-[9px] tracking-wide text-white/50">
                      W: 220 cm · D: 95 cm · H: 80 cm
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={9} className="text-emerald-400" />
                    <span className="text-[9px] text-white/40">
                      Fits room proportions
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Fit confidence tag */}
              <motion.div
                className="absolute right-5 top-5 z-20"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-md"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.55)',
                    border: '1px solid rgba(200,184,152,0.15)',
                  }}
                >
                  <GeminiLogo />
                  <span className="text-[9px] text-[#c8b898]">
                    Gemini · 96% match
                  </span>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div
        className="shrink-0 border-t px-5 py-4"
        style={{
          backgroundColor: '#0C0C0C',
          borderColor: 'rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center gap-8">
          {/* Zoom control */}
          <div className="flex shrink-0 items-center gap-2.5">
            <button
              onClick={() => setZoom(Math.max(60, zoom - 10))}
              className="flex h-6 w-6 items-center justify-center rounded border border-white/[0.07] text-white/30 hover:border-white/15 hover:text-white/60 transition-all"
            >
              <ZoomOut size={11} />
            </button>
            <span className="w-10 text-center text-[10px] tabular-nums text-white/40">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(150, zoom + 10))}
              className="flex h-6 w-6 items-center justify-center rounded border border-white/[0.07] text-white/30 hover:border-white/15 hover:text-white/60 transition-all"
            >
              <ZoomIn size={11} />
            </button>
          </div>

          <div className="h-5 w-px shrink-0 bg-white/[0.06]" />

          {/* Sliders */}
          <div className="grid flex-1 grid-cols-3 gap-6">
            <SlimSlider
              label="Scale"
              value={zoom}
              min={60}
              max={150}
              unit="%"
              onChange={setZoom}
              accent
            />
            <SlimSlider
              label="Rotation"
              value={rotation}
              min={-45}
              max={45}
              unit="°"
              onChange={setRotation}
            />
            <SlimSlider
              label="Blend"
              value={opacity}
              min={0}
              max={100}
              unit="%"
              onChange={setOpacity}
            />
          </div>

          <div className="h-5 w-px shrink-0 bg-white/[0.06]" />

          {/* Position reset */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => {
                setZoom(100)
                setRotation(0)
                setOpacity(100)
                setSliderPos(50)
              }}
              className="flex items-center gap-1.5 text-[10px] text-white/25 hover:text-white/50 transition-colors"
            >
              <Move size={11} />
              <span className="tracking-[0.1em] uppercase">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════ */
/* Main Page */
/* ═══════════════════════════════════════════════════════════════════ */

export default function AIRoomPlanner() {
  const navigate = useNavigate()
  const [state, setState] = useState<StudioState>('upload')
  const [progress, setProgress] = useState(0)
  const [processingStep, setProcessingStep] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState(['corner', 'shadow'])
  const [selectedProduct, setSelectedProduct] = useState(1)
  const [sliderPos, setSliderPos] = useState(50)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [opacity, setOpacity] = useState(100)
  const [showOverlay, setShowOverlay] = useState(true)
  const [isEntering, setIsEntering] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setIsEntering(false), 100)
    return () => clearTimeout(t)
  }, [])

  const confidence = PRODUCTS.find((p) => p.id === selectedProduct)?.confidence ?? 96

  const startProcessing = useCallback(() => {
    setState('processing')
    setProgress(0)
    setProcessingStep(0)

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => setState('studio'), 500)
          return 100
        }
        return p + 1.5 > 100 ? 100 : p + 1.5
      })
    }, 50)

    const stepInterval = setInterval(() => {
      setProcessingStep((s) => {
        if (s >= PROCESSING_STEPS.length - 1) {
          clearInterval(stepInterval)
          return PROCESSING_STEPS.length - 1
        }
        return s + 1
      })
    }, 800)
  }, [])

  const handleReset = () => {
    setState('upload')
    setProgress(0)
    setProcessingStep(0)
    setSliderPos(50)
    setZoom(100)
    setRotation(0)
    setOpacity(100)
  }

  const handleToggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    )
  }

  const handleReprocess = () => {
    setState('processing')
    setProgress(0)
    setProcessingStep(0)
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => setState('studio'), 400)
          return 100
        }
        return p + 2 > 100 ? 100 : p + 2
      })
    }, 40)
    const stepInterval = setInterval(() => {
      setProcessingStep((s) => {
        if (s >= PROCESSING_STEPS.length - 1) {
          clearInterval(stepInterval)
          return PROCESSING_STEPS.length - 1
        }
        return s + 1
      })
    }, 700)
  }

  return (
    <motion.div
      className="flex h-screen select-none flex-col overflow-hidden"
      style={{ backgroundColor: '#080808' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isEntering ? 0 : 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* ── Top Bar ───────────────────────────────────────────────── */}
      <div
        className="z-50 flex h-[52px] shrink-0 items-center justify-between border-b px-5"
        style={{
          backgroundColor: '#0C0C0C',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2"
          >
            <ChevronLeft
              size={14}
              className="text-white/20 group-hover:text-white/50 transition-colors"
            />
            <span className="text-[13px] tracking-[0.1em] text-white/40 group-hover:text-white/70 transition-colors">
              LIVAXIS
            </span>
          </button>

          <div className="h-4 w-px bg-white/[0.08]" />

          <div
            className="flex items-center gap-2 rounded-md px-2.5 py-1"
            style={{
              backgroundColor: 'rgba(200,184,152,0.07)',
              border: '1px solid rgba(200,184,152,0.12)',
            }}
          >
            <GeminiLogo />
            <span className="text-[9px] tracking-[0.2em] uppercase text-[#c8b898]/80">
              AI Room Planner Studio
            </span>
          </div>
        </div>

        {/* Center — Workflow breadcrumb */}
        <div className="hidden flex-col items-center gap-[3px] md:flex">
          <span className="text-[7.5px] tracking-[0.26em] uppercase text-white/15">
            Workflow
          </span>

          <div className="flex items-center">
            {[
              {
                key: 'upload' as StudioState,
                num: '01',
                label: 'Capture',
              },
              {
                key: 'processing' as StudioState,
                num: '02',
                label: 'Process',
              },
              { key: 'studio' as StudioState, num: '03', label: 'Review' },
            ].map(({ key, num, label }, i) => {
              const order: StudioState[] = ['upload', 'processing', 'studio']
              const currentIdx = order.indexOf(state)
              const thisIdx = order.indexOf(key)
              const done = thisIdx < currentIdx
              const active = key === state

              return (
                <div key={key} className="flex items-center">
                  <div className="relative flex items-center gap-1.5 px-2.5 py-0.5">
                    {active && (
                      <motion.div
                        layoutId="bc-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-px"
                        style={{
                          background:
                            'linear-gradient(90deg, transparent, rgba(200,184,152,0.7), transparent)',
                        }}
                        transition={{
                          duration: 0.35,
                          ease: 'easeInOut',
                        }}
                      />
                    )}

                    <div
                      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        done
                          ? 'border-[#c8b898]/30 bg-[#c8b898]/12'
                          : active
                            ? 'border-white/18 bg-white/[0.04]'
                            : 'border border-white/[0.05]'
                      }`}
                    >
                      {done ? (
                        <Check size={8} className="text-[#c8b898]" strokeWidth={2.5} />
                      ) : (
                        <span
                          className={`text-[7px] tabular-nums ${
                            active ? 'text-white/55' : 'text-white/14'
                          }`}
                        >
                          {num}
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] tracking-[0.1em] transition-colors duration-300 ${
                        done
                          ? 'text-white/28'
                          : active
                            ? 'text-white/72'
                            : 'text-white/16'
                      } ${active ? 'font-medium' : 'font-normal'}`}
                    >
                      {label}
                    </span>

                    {active && (
                      <motion.div
                        className="h-[5px] w-[5px] rounded-full bg-[#c8b898]"
                        animate={{
                          opacity: [1, 0.25, 1],
                          scale: [1, 0.7, 1],
                        }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    )}
                  </div>

                  {i < 2 && (
                    <div className="relative h-px w-7">
                      <div className="absolute inset-0 bg-white/[0.06]" />
                      {done && (
                        <motion.div
                          className="absolute inset-0"
                          style={{
                            background:
                              'linear-gradient(90deg, rgba(200,184,152,0.35), rgba(200,184,152,0.15))',
                            transformOrigin: 'left',
                          }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{
                            duration: 0.45,
                            ease: 'easeOut',
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {state === 'studio' && (
              <motion.button
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 rounded-lg border border-[#c8b898]/20 px-4 py-1.5 text-[#c8b898]/60 hover:border-[#c8b898]/40 hover:text-[#c8b898] transition-all"
              >
                <Download size={12} />
                <span className="text-[10px] tracking-[0.1em] uppercase font-medium">
                  Export
                </span>
              </motion.button>
            )}
          </AnimatePresence>
          <button
            onClick={() => navigate('/')}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] text-white/25 hover:border-white/15 hover:text-white/60 transition-all"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ── Main Body ────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* UPLOAD STATE */}
          {state === 'upload' && (
            <motion.div
              key="upload-full"
              className="flex flex-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <UploadView onStart={startProcessing} />
            </motion.div>
          )}

          {/* PROCESSING STATE */}
          {state === 'processing' && (
            <motion.div
              key="processing-full"
              className="flex flex-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProcessingView
                progress={Math.round(progress)}
                step={processingStep}
              />
            </motion.div>
          )}

          {/* STUDIO STATE */}
          {state === 'studio' && (
            <motion.div
              key="studio-panels"
              className="flex flex-1 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <LeftPanel currentState={state} onReset={handleReset} />

              <StudioCanvas
                sliderPos={sliderPos}
                setSliderPos={setSliderPos}
                zoom={zoom}
                setZoom={setZoom}
                rotation={rotation}
                setRotation={setRotation}
                opacity={opacity}
                setOpacity={setOpacity}
                showOverlay={showOverlay}
                setShowOverlay={setShowOverlay}
              />

              <GeminiPanel
                selectedOptions={selectedOptions}
                onToggle={handleToggleOption}
                onReprocess={handleReprocess}
                selectedProduct={selectedProduct}
                onSelectProduct={setSelectedProduct}
                confidence={confidence}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Status Bar ───────────────────────────────────────────── */}
      <div
        className="flex h-7 shrink-0 items-center justify-between border-t px-5"
        style={{
          backgroundColor: '#090909',
          borderColor: 'rgba(255,255,255,0.04)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <motion.div
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor:
                  state === 'processing' ? '#f59e0b' : '#34d399',
              }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[9px] tracking-[0.1em] uppercase text-white/20">
              {state === 'upload'
                ? 'Ready'
                : state === 'processing'
                  ? 'Gemini processing...'
                  : 'Analysis complete'}
            </span>
          </div>
          {state === 'studio' && (
            <>
              <div className="h-3 w-px bg-white/[0.06]" />
              <span className="text-[9px] text-white/15">
                Aria Velvet Sofa · LVX-0201
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] text-white/15">
            Powered by Google Gemini
          </span>
          <span className="text-[9px] text-white/10">·</span>
          <span className="text-[9px] text-white/15">v2.4.1</span>
        </div>
      </div>
    </motion.div>
  )
}
