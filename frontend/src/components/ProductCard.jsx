import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/format.js'
import { useCart } from '../context/CartContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { isCompared, toggleCompare } from '../utils/compare.js'

export default function ProductCard({ product }) {
  const out = product.stock <= 0
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0
  const { add } = useCart()
  const { show } = useToast()
  const [adding, setAdding] = useState(false)
  const [compared, setCompared] = useState(isCompared(product.id))

  async function onAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    if (out) return
    setAdding(true)
    try {
      await add(product.id, 1, {
        name: product.name,
        slug: product.slug,
        imageUrl: product.imageUrl,
        price: product.price,
        stock: product.stock,
      })
      show('Товар добавлен в корзину 🛒')
    } catch (err) {
      show(err.message, 'error')
    } finally {
      setAdding(false)
    }
  }

  function onCompare(e) {
    e.preventDefault()
    e.stopPropagation()
    const added = toggleCompare(product.id)
    setCompared(added)
    show(added ? 'Товар добавлен к сравнению ⇄' : 'Товар убран из сравнения', 'info')
  }

  return (
    <div className="card product-card reveal">
      <Link to={`/product/${product.slug}`} className="product-card__img">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <span>📺</span>
        )}
        {discount > 0 && <span className="discount-badge">−{discount}%</span>}
      </Link>

      <Link to={`/product/${product.slug}`} className="product-card__body">
        <span className="product-card__category">{product.categoryName}</span>
        <span className="product-card__name">{product.name}</span>
        <div className="product-card__price">
          <span className="price">{formatPrice(product.price)}</span>
          {product.oldPrice && <span className="price-old">{formatPrice(product.oldPrice)}</span>}
        </div>
        <span className={`product-card__stock ${out ? 'text-muted' : 'in-stock'}`}>
          {out ? 'Нет в наличии' : 'В наличии'}
        </span>
      </Link>

      <div className="product-card__footer">
        <div className="row" style={{ gap: 6 }}>
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={onAdd} disabled={out || adding}>
            {adding ? '…' : out ? 'Нет в наличии' : '🛒 В корзину'}
          </button>
          <button
            className={'btn btn-outline btn-sm' + (compared ? ' is-active' : '')}
            onClick={onCompare}
            title={compared ? 'Убрать из сравнения' : 'Сравнить'}
          >
            ⇄
          </button>
        </div>
      </div>
    </div>
  )
}
