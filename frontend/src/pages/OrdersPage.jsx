import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { formatDate, formatPrice } from '../utils/format.js'
import Spinner from '../components/Spinner.jsx'

const STATUS = {
  NEW: { label: 'Новый', cls: 'badge-primary' },
  PROCESSING: { label: 'В обработке', cls: 'badge-warning' },
  SHIPPED: { label: 'Отправлен', cls: 'badge-primary' },
  DELIVERED: { label: 'Доставлен', cls: 'badge-success' },
  CANCELLED: { label: 'Отменён', cls: 'badge-danger' },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(null)

  useEffect(() => {
    api.get('/orders').then(setOrders).catch(() => setOrders([]))
  }, [])

  if (orders === null) return <Spinner />

  if (!orders.length) {
    return (
      <div className="empty">
        <div className="empty__icon">📦</div>
        <p>У вас пока нет заказов.</p>
        <Link to="/catalog" className="btn btn-primary mt-16">
          Перейти в каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-24">
      <h1>Мои заказы</h1>
      {orders.map((o) => {
        const s = STATUS[o.status] || { label: o.status, cls: 'badge-muted' }
        return (
          <div className="card mb-16" key={o.id} style={{ padding: 20 }}>
            <div className="between mb-16">
              <div className="row">
                <strong>Заказ №{o.id}</strong>
                <span className="text-muted" style={{ fontSize: 13 }}>
                  {formatDate(o.createdAt)}
                </span>
              </div>
              <span className={`badge ${s.cls}`}>{s.label}</span>
            </div>

            <div className="mb-16">
              {o.items.map((it, i) => (
                <div className="summary-line" key={i}>
                  <span>
                    {it.productName} × {it.quantity}
                  </span>
                  <span>{formatPrice(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="summary-line total">
              <span>Итого</span>
              <span>{formatPrice(o.total)}</span>
            </div>

            <div className="text-muted mt-8" style={{ fontSize: 13 }}>
              Доставка: {o.address}
            </div>
          </div>
        )
      })}
    </div>
  )
}
