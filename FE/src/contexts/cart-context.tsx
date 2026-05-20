import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from './auth-context'

const CART_STORAGE_KEY = 'livaxis-cart-items'

type CartStoredItem = {
  productId: string
  quantity: number
}

type CartContextValue = {
  items: CartStoredItem[]
  itemCount: number
  addToCart: (productId: string, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const readInitialItems = (): CartStoredItem[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((entry) => ({
        productId: typeof entry?.productId === 'string' ? entry.productId : '',
        quantity: Number(entry?.quantity) > 0 ? Number(entry.quantity) : 1,
      }))
      .filter((entry) => entry.productId)
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartStoredItem[]>(readInitialItems)
  const { user } = useAuth()
  const [hadUser, setHadUser] = useState(false)

  useEffect(() => {
    if (user) {
      setHadUser(true)
    } else if (hadUser && !user) {
      setItems([])
      setHadUser(false)
    }
  }, [user, hadUser])

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = (productId: string, quantity = 1) => {
    if (!productId || quantity <= 0) {
      return
    }

    setItems((current) => {
      const existing = current.find((item) => item.productId === productId)
      if (existing) {
        return current.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }

      return [...current, { productId, quantity }]
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (!productId) {
      return
    }

    setItems((current) => {
      if (quantity <= 0) {
        return current.filter((item) => item.productId !== productId)
      }

      return current.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    })
  }

  const removeFromCart = (productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId))
  }

  const clearCart = () => {
    setItems([])
  }

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  )

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }

  return context
}