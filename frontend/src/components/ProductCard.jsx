import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/format.js'

export default function ProductCard({ product }) {
  const out = product.stock <= 0
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0

  return (
    <Link to={`/product/${product.slug}`} className="card product-card reveal">
      <div className="product-card__img">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <span>📺</span>
        )}
        {discount > 0 && <span className="discount-badge">−{discount}%</span>}
      </div>
      <div className="product-card__body">
        <span className="product-card__category">{product.categoryName}</span>
        <span className="product-card__name">{product.name}</span>
        <div className="product-card__price">
          <span className="price">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="price-old">{formatPrice(product.oldPrice)}</span>
          )}
        </div>
        <span className={`product-card__stock ${out ? 'text-muted' : 'in-stock'}`}>
          {out ? 'Нет в наличии' : 'В наличии'}
        </span>
      </div>
    </Link>
  )
}
