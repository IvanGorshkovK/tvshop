import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)
const EMPTY = { items: [], total: 0, itemCount: 0 }

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState(EMPTY)

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(EMPTY)
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

  const add = async (productId, quantity = 1) => {
    const data = await api.post('/cart', { productId, quantity })
    setCart(data)
    return data
  }

  const updateQty = async (itemId, quantity) => {
    const data = await api.patch(`/cart/${itemId}?quantity=${quantity}`)
    setCart(data)
    return data
  }

  const remove = async (itemId) => {
    const data = await api.del(`/cart/${itemId}`)
    setCart(data)
    return data
  }

  const clear = () => setCart(EMPTY)

  return (
    <CartContext.Provider value={{ cart, refresh, add, updateQty, remove, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
