import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client.js'
import { formatPrice } from '../../utils/format.js'
import Spinner from '../../components/Spinner.jsx'

const BRANDS = ['Samsung', 'LG', 'Hisense', 'TCL', 'Onkron', 'Ugreen', 'Vital']
const SIZES = ['32', '43', '50', '55', '65', '75', '85', '100']

export default function Products() {
  const [data, setData] = useState(null)
  const [categories, setCategories] = useState([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [screenSize, setScreenSize] = useState('')

  const load = useCallback(() => {
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (category) sp.set('category', category)
    if (brand) sp.set('brand', brand)
    if (screenSize) sp.set('screenSize', screenSize)
    sp.set('size', '500')
    api.get(`/admin/products?${sp.toString()}`).then(setData).catch(() => setData(null))
  }, [q, category, brand, screenSize])

  useEffect(() => {
    api.get('/admin/categories').then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function onDelete(id, name) {
    if (!window.confirm(`Удалить товар «${name}»?`)) return
    await api.del(`/admin/products/${id}`)
    load()
  }

  async function onToggle(p) {
    await api.patch(`/admin/products/${p.id}/active?active=${!p.active}`)
    load()
  }

  return (
    <div className="mt-24">
      <div className="between mb-16">
        <h1 className="mt-0">Товары</h1>
        <Link to="/admin/products/new" className="btn btn-primary">
          + Добавить товар
        </Link>
      </div>

      <div className="card mb-16" style={{ padding: 16 }}>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <input
            className="input"
            style={{ maxWidth: 260 }}
            placeholder="Поиск по названию/бренду…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="select" style={{ width: 'auto' }} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select className="select" style={{ width: 'auto' }} value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="">Все бренды</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select className="select" style={{ width: 'auto' }} value={screenSize} onChange={(e) => setScreenSize(e.target.value)}>
            <option value="">Все диагонали</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}″
              </option>
            ))}
          </select>
        </div>
      </div>

      {!data ? (
        <Spinner />
      ) : data.items.length === 0 ? (
        <div className="empty">Товары не найдены.</div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Категория</th>
                <th>Бренд</th>
                <th>Диагональ</th>
                <th>Цена</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((p) => (
                <tr key={p.id}>
                  <td style={{ maxWidth: 320 }}>{p.name}</td>
                  <td>{p.categoryName}</td>
                  <td>{p.brand || '—'}</td>
                  <td>{p.screenSizeInches ? `${p.screenSizeInches}″` : '—'}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td>
                    {p.active ? (
                      <span className="badge badge-success">Активен</span>
                    ) : (
                      <span className="badge badge-muted">Скрыт</span>
                    )}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => onToggle(p)}>
                      {p.active ? 'Скрыть' : 'Показать'}
                    </button>{' '}
                    <Link to={`/admin/products/${p.id}/edit`} className="btn btn-outline btn-sm">
                      Изменить
                    </Link>{' '}
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(p.id, p.name)}>
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
