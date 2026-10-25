import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client.js'
import { formatPrice } from '../../utils/format.js'
import Spinner from '../../components/Spinner.jsx'

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/admin/stats').then(setStats).catch(() => setStats(null))
  }, [])

  if (!stats) return <Spinner />

  const cards = [
    { label: 'Товаров', value: stats.products, icon: '📦' },
    { label: 'Заказов', value: stats.orders, icon: '🧾' },
    { label: 'Выручка', value: formatPrice(stats.revenue), icon: '💰' },
    { label: 'Пользователей', value: stats.users, icon: '👥' },
  ]

  return (
    <div className="mt-24">
      <h1 className="mt-0">Дашборд</h1>
      <div className="stat-grid">
        {cards.map((c) => (
          <div className="card stat" key={c.label}>
            <div style={{ fontSize: 26 }}>{c.icon}</div>
            <div className="stat__label">{c.label}</div>
            <div className="stat__value">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="row mt-24">
        <Link to="/admin/products/new" className="btn btn-primary">
          + Добавить товар
        </Link>
        <Link to="/admin/orders" className="btn btn-outline">
          Открыть заказы
        </Link>
      </div>
    </div>
  )
}
