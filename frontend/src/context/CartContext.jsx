import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)
const EMPTY = { items: [], total: 0, itemCount: 0 }
const GUEST_KEY = 'guest_cart'

function readGuest() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]')
  } catch {
    return []
  }
}

function writeGuest(items) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items))
  } catch {}
}

function normalize(items) {
  const total = items.reduce((s, i) => s + (Number(i.price) || 0) * (i.quantity || 0), 0)
  const itemCount = items.reduce((s, i) => s + (i.quantity || 0), 0)
  return { items, total, itemCount }
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState(EMPTY)

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(normalize(readGuest()))
      return
    }
    try {
      const data = await api.get('/cart')
      setCart(data || EMPTY)
    } catch {
      setCart(EMPTY)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  const add = async (productId, quantity = 1, meta = null) => {
    if (user) {
      const data = await api.post('/cart', { productId, quantity })
      setCart(data)
      return data
    }
    const items = readGuest()
    const existing = items.find((i) => i.productId === productId)
    if (existing) {
      existing.quantity += quantity
    } else if (meta) {
      items.push({
        id: productId,
        productId,
        productName: meta.name,
        slug: meta.slug,
        imageUrl: meta.imageUrl,
        price: meta.price,
        quantity,
        stock: meta.stock,
      })
    }
    writeGuest(items)
    const state = normalize(items)
    setCart(state)
    return state
  }

  const updateQty = async (itemId, quantity) => {
    if (user) {
      const data = await api.patch(`/cart/${itemId}?quantity=${quantity}`)
      setCart(data)
      return data
    }
    const items = readGuest().map((i) => (i.id === itemId ? { ...i, quantity } : i))
    writeGuest(items)
    const state = normalize(items)
    setCart(state)
    return state
  }

  const remove = async (itemId) => {
    if (user) {
      const data = await api.del(`/cart/${itemId}`)
      setCart(data)
      return data
    }
    const items = readGuest().filter((i) => i.id !== itemId)
    writeGuest(items)
    const state = normalize(items)
    setCart(state)
    return state
  }

  const clear = () => {
    if (!user) writeGuest([])
    setCart(EMPTY)
  }

  return (
    <CartContext.Provider value={{ cart, refresh, add, updateQty, remove, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
