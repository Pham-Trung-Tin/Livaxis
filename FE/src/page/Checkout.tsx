import { ArrowLeft, Lock, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Footer, Header } from './Hompage'
import { useCart } from '../contexts/cart-context'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { itemCount } = useCart()

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#fbf7f1_52%,#f4efe6_100%)] text-[#141311]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Header />

      <main className="pt-[72px]">
        <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-[1100px] items-center px-6 py-16 md:px-10 lg:px-16">
          <div className="w-full rounded-[32px] border border-black/5 bg-white p-8 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:p-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#c8b898]/10 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[#8a7456]">
              <Lock size={12} />
              Secure Checkout
            </div>

            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#a08c6a]">Checkout</p>
                <h1 className="mt-3 text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] text-black" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}>
                  Checkout is ready for the next integration step.
                </h1>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-500">
                  The cart is already connected to the backend product API. This page is a temporary place-holder so the secure checkout route exists while the payment flow is being built.
                </p>

                <div className="mt-8 flex flex-wrap gap-3 text-[12px] text-neutral-500">
                  <span className="rounded-full border border-black/6 bg-[#faf9f7] px-4 py-2">{itemCount} items in cart</span>
                  <span className="rounded-full border border-black/6 bg-[#faf9f7] px-4 py-2">Backend hydrated</span>
                  <span className="rounded-full border border-black/6 bg-[#faf9f7] px-4 py-2">Credentials included</span>
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/cart')}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-neutral-600 transition-colors hover:border-black/25 hover:text-black"
                  >
                    <ArrowLeft size={14} />
                    Back to Cart
                  </button>
                  <button
                    onClick={() => navigate('/discovery')}
                    className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-neutral-800"
                  >
                    <Sparkles size={14} />
                    Continue Shopping
                  </button>
                </div>
              </div>

              <div className="rounded-[28px] bg-[linear-gradient(135deg,#f8f5ef_0%,#efe5d4_100%)] p-8">
                <div className="rounded-[24px] bg-white/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">Order summary</span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-[#8a7456]">Preview</span>
                  </div>
                  <div className="space-y-3 text-[13px] text-neutral-500">
                    <div className="flex justify-between"><span>Subtotal</span><span>Calculated from BE</span></div>
                    <div className="flex justify-between"><span>Shipping</span><span>Complimentary</span></div>
                    <div className="flex justify-between"><span>Taxes</span><span>To be computed</span></div>
                  </div>
                  <div className="mt-6 border-t border-black/5 pt-5">
                    <p className="text-[12px] text-neutral-400">
                      The final payment integration can hook into this route without changing the cart API layer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}