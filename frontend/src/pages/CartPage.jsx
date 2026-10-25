import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatPrice } from '../utils/format.js'

export default function CartPage() {
  const { cart, updateQty, remove } = useCart()
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="empty">
        <div className="empty__icon">🛒</div>
        <p>
          Войдите, чтобы использовать корзину.
        </p>
        <Link to="/login" className="btn btn-primary mt-16">
          Войти
        </Link>
      </div>
    )
  }

  if (!cart.items.length) {
    return (
      <div className="empty">
        <div className="empty__icon">🛒</div>
        <p>Ваша корзина пуста.</p>
        <Link to="/catalog" className="btn btn-primary mt-16">
          Перейти в каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-24">
      <h1>Корзина</h1>
      <div className="card mb-16">
        {cart.items.map((item) => (
          <div className="cart-line" key={item.id}>
            <div className="cart-line__img">
              {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : <span>📦</span>}
            </div>
            <div>
              <Link to={`/product/${item.slug}`} style={{ fontWeight: 600 }}>
                {item.productName}
              </Link>
              <div className="text-muted" style={{ fontSize: 13 }}>
                {formatPrice(item.price)} / шт.
              </div>
            </div>
            <div className="qty">
              <button
                onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                aria-label="Уменьшить"
              >
                −
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() => updateQty(item.id, Math.min(item.stock, item.quantity + 1))}
                aria-label="Увеличить"
              >
                +
              </button>
            </div>
            <div className="price">{formatPrice(item.price * item.quantity)}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => remove(item.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="between mb-16">
        <div className="row">
          <span className="text-muted">Товаров: {cart.itemCount}</span>
        </div>
        <div className="row" style={{ alignItems: 'baseline' }}>
          <span className="text-muted">Итого:</span>
          <span className="price" style={{ fontSize: 24 }}>
            {formatPrice(cart.total)}
          </span>
        </div>
      </div>

      <Link to="/checkout" className="btn btn-primary btn-lg">
        Оформить заказ
      </Link>
    </div>
  )
}
