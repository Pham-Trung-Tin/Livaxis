import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from './auth-context'

const CART_STORAGE_KEY_PREFIX = 'livaxis-cart-items'

const getCartStorageKey = (userId: string | undefined) => {
  if (!userId) {
    return `${CART_STORAGE_KEY_PREFIX}-guest`
  }
  return `${CART_STORAGE_KEY_PREFIX}-user-${userId}`
}

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

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState<CartStoredItem[]>([])
  
  // The active storage key is based on the current user ID
  const storageKey = useMemo(() => getCartStorageKey(user?.id), [user?.id])
  const [loadedKey, setLoadedKey] = useState<string>('')

  // Load items from local storage whenever the storageKey changes
  useEffect(() => {
    if (authLoading) return // Wait until auth state is determined
    
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) {
        setItems([])
        setLoadedKey(storageKey)
        return
      }

      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        setItems([])
        setLoadedKey(storageKey)
        return
      }

      const validated = parsed
        .map((entry) => ({
          productId: typeof entry?.productId === 'string' ? entry.productId : '',
          quantity: Number(entry?.quantity) > 0 ? Number(entry.quantity) : 1,
        }))
        .filter((entry) => entry.productId)
      
      setItems(validated)
      setLoadedKey(storageKey)
    } catch {
      setItems([])
      setLoadedKey(storageKey)
    }
  }, [storageKey, authLoading])

  // Save items to local storage whenever items change
  useEffect(() => {
    if (authLoading || !loadedKey || loadedKey !== storageKey) return
    window.localStorage.setItem(storageKey, JSON.stringify(items))
  }, [items, storageKey, loadedKey, authLoading])

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