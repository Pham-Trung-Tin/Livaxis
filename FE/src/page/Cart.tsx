import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Lock, Minus, Plus, ShoppingBag, Sparkles, Trash2, Truck, RotateCcw, Shield, Package } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Footer, Header } from './Hompage'
import { getProductsByIds, type ProductDetail } from '../services/productApi'
import { useCart } from '../contexts/cart-context'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

function CartLineItem({
  product,
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  product: ProductDetail | null
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  onRemove: () => void
}) {
  return (
    <motion.div layout className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <div className="flex gap-4 sm:gap-5">
        <div className="h-[110px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-[#f7f5f2] sm:h-[124px] sm:w-[100px]">
          {product ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[11px] text-neutral-400">
              Missing
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                {product?.category ?? 'Unavailable'}
              </p>
              <h3 className="truncate text-[18px] leading-tight text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                {product?.name ?? 'This product is no longer available'}
              </h3>
              <p className="mt-1 text-[12px] text-neutral-400">
                {product?.subtitle ?? 'Please remove this item from your cart.'}
              </p>
            </div>

            <span className="shrink-0 text-[18px] text-black" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              {product ? formatCurrency(product.price * quantity) : '—'}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-lg border border-black/8">
              <button onClick={onDecrease} className="flex h-9 w-9 items-center justify-center text-neutral-400 transition-colors hover:text-black">
                <Minus size={13} />
              </button>
              <span className="w-10 text-center text-[13px] text-black">{quantity}</span>
              <button onClick={onIncrease} className="flex h-9 w-9 items-center justify-center text-neutral-400 transition-colors hover:text-black">
                <Plus size={13} />
              </button>
            </div>

            <button onClick={onRemove} className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 transition-colors hover:text-neutral-700">
              <Trash2 size={11} />
              Remove
            </button>
          </div>

          {product?.material || product?.color ? (
            <p className="mt-3 text-[11px] text-neutral-400">
              {product.material ?? ''}{product.material && product.color ? ' · ' : ''}{product.color ?? ''}
            </p>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}

export default function CartPage() {
  const navigate = useNavigate()
  const { items, itemCount, updateQuantity, removeFromCart, clearCart } = useCart()
  const [resolvedProducts, setResolvedProducts] = useState<Record<string, ProductDetail>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)

  const cartIdsKey = items.map((item) => item.productId).join('|')

  useEffect(() => {
    const loadCart = async () => {
      if (items.length === 0) {
        setResolvedProducts({})
        setLoading(false)
        setError(null)
        return
      }

      try {
        setError(null)
        const response = await getProductsByIds(items.map((item) => item.productId))
        const shouldShowLoading = Object.keys(resolvedProducts).length === 0

        setResolvedProducts(
          response.items.reduce<Record<string, ProductDetail>>((acc, product) => {
            acc[product.id] = product
            return acc
          }, {}),
        )

        if (response.missingIds.length > 0) {
          setError('One or more products were removed from the catalog.')
        }

        if (shouldShowLoading) {
          setLoading(false)
        }
      } catch (fetchError) {
        if (Object.keys(resolvedProducts).length === 0) {
          setLoading(false)
        }
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load cart items')
      }
    }

    void loadCart()
  }, [cartIdsKey])

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (resolvedProducts[item.productId]?.price ?? 0) * item.quantity,
        0,
      ),
    [items, resolvedProducts],
  )
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0
  const shipping = subtotal > 0 ? 0 : 0
  const total = Math.max(0, subtotal - discount + shipping)
  const hasItems = items.length > 0

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#fbf7f1_52%,#f4efe6_100%)] text-[#141311]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />

      <main className="pt-[72px]">
        <div className="mx-auto max-w-[1440px] px-6 py-5 md:px-10 lg:px-16">
          <nav className="flex items-center gap-2 text-[12px] text-neutral-400">
            <button onClick={() => navigate('/')} className="transition-colors hover:text-black">Home</button>
            <span>/</span>
            <span className="text-neutral-800">Shopping Cart</span>
          </nav>
        </div>

        <section className="mx-auto max-w-[1440px] px-6 pb-24 md:px-10 lg:px-16">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#a08c6a]">Your Bag</p>
              <h1 className="mt-3 text-[clamp(1.8rem,3.5vw,3rem)] leading-[0.95] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                Shopping Cart
              </h1>
              <p className="mt-2 text-[13px] text-neutral-400">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>

            <button
              onClick={() => navigate('/discovery')}
              className="inline-flex items-center gap-2 self-start text-[12px] text-neutral-400 transition-colors hover:text-black"
            >
              <ArrowLeft size={14} strokeWidth={1.5} />
              Continue Shopping
            </button>
          </div>

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-black/5 bg-white/80">
              <div className="inline-flex items-center gap-3 text-[#a08c6a]">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#a08c6a]/30 border-t-[#a08c6a]" />
                <span className="text-sm">Loading cart...</span>
              </div>
            </div>
          ) : !hasItems ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl rounded-3xl border border-black/5 bg-white p-10 text-center shadow-[0_1px_0_rgba(0,0,0,0.02)]">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-50">
                <ShoppingBag size={28} className="text-neutral-300" strokeWidth={1.3} />
              </div>
              <h2 className="text-[24px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                Your cart is empty
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-neutral-400">
                Browse the collection and add products from the catalog to build your order.
              </p>
              <button
                onClick={() => navigate('/discovery')}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-neutral-800"
              >
                Explore Collection
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <CartLineItem
                      key={item.productId}
                      product={resolvedProducts[item.productId] ?? null}
                      quantity={item.quantity}
                      onIncrease={() => {
                        updateQuantity(item.productId, item.quantity + 1)
                      }}
                      onDecrease={() => {
                        updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                      }}
                      onRemove={() => {
                        removeFromCart(item.productId)
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>

              <div className="space-y-6 lg:sticky lg:top-[96px]">
                <div className="rounded-3xl border border-black/5 bg-white p-7 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
                  <div className="mb-6 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#c8b898]/10">
                      <Sparkles size={14} className="text-[#a08c6a]" />
                    </div>
                    <div>
                      <h2 className="text-[18px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                        Order Summary
                      </h2>
                      <p className="text-[10px] text-neutral-400">Based on the products in your cart</p>
                    </div>
                  </div>

                  <div className="space-y-4 border-b border-black/5 pb-5">
                    <div className="flex items-center justify-between text-[13px] text-neutral-500">
                      <span>Subtotal</span>
                      <span className="text-black">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px] text-neutral-500">
                      <span>Shipping</span>
                      <span className="text-[#8a7456]">Complimentary</span>
                    </div>
                    {promoApplied ? (
                      <div className="flex items-center justify-between text-[13px] text-green-600">
                        <span>Promo discount</span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 flex gap-2">
                    <input
                      value={promoCode}
                      onChange={(event) => setPromoCode(event.target.value)}
                      placeholder="Promo code"
                      className="flex-1 rounded-xl border border-black/6 bg-[#faf9f7] px-4 py-3 text-[12px] text-black placeholder:text-neutral-300 focus:border-[#c8b898]/40 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (promoCode.trim()) {
                          setPromoApplied(true)
                        }
                      }}
                      className="rounded-xl bg-neutral-100 px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-neutral-600 transition-colors hover:bg-neutral-200"
                    >
                      Apply
                    </button>
                  </div>

                  <div className="mt-6 flex items-baseline justify-between border-t border-black/5 pt-5">
                    <span className="text-[13px] font-medium text-neutral-800">Total</span>
                    <span className="text-[28px] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                      {formatCurrency(total)}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate('/checkout')}
                    className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1f1d1b] py-4 text-white transition-colors hover:bg-black"
                  >
                    <Lock size={14} strokeWidth={1.5} />
                    <span className="text-[12px] uppercase tracking-[0.12em]">Proceed to Secure Checkout</span>
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-4 text-[9px] text-neutral-400">
                    {[{ icon: Truck, label: 'Free Delivery' }, { icon: RotateCcw, label: '30-Day Returns' }, { icon: Shield, label: 'Secure Payment' }].map((entry) => (
                      <div key={entry.label} className="flex items-center gap-1.5">
                        <entry.icon size={11} strokeWidth={1.5} />
                        <span>{entry.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-start gap-3 rounded-2xl bg-neutral-50/80 px-4 py-4">
                    <Package size={15} className="mt-0.5 text-neutral-300" strokeWidth={1.5} />
                    <p className="text-[11px] leading-relaxed text-neutral-400">
                      All items ship with premium packaging and white-glove delivery within 5-10 business days.
                    </p>
                  </div>
                </div>
           

                <button
                  onClick={clearCart}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/8 bg-white py-3 text-[11px] uppercase tracking-[0.12em] text-neutral-500 transition-colors hover:border-black/15 hover:text-black"
                >
                  <Trash2 size={13} />
                  Clear Cart
                </button>
              </div>
            </div>
          )}

          <AnimatePresence>
            {error ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
                {error}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>
      </main>

      <Footer />
    </div>
  )
}