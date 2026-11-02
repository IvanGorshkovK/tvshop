import { useEffect, useState } from 'react'
import { api } from '../../api/client.js'
import { formatDate, formatPrice } from '../../utils/format.js'
import { useToast } from '../../context/ToastContext.jsx'
import Spinner from '../../components/Spinner.jsx'

const STATUSES = {
  NEW: { label: 'Новый', cls: 'badge-primary' },
  PROCESSING: { label: 'В обработке', cls: 'badge-warning' },
  SHIPPED: { label: 'Отправлен', cls: 'badge-primary' },
  DELIVERED: { label: 'Доставлен', cls: 'badge-success' },
  CANCELLED: { label: 'Отменён', cls: 'badge-danger' },
}

export default function AdminUsers() {
  const { show } = useToast()
  const [users, setUsers] = useState(null)
  const [search, setSearch] = useState('')
  const [openOrders, setOpenOrders] = useState(null)
  const [openOrder, setOpenOrder] = useState(null)

  function load() {
    api
      .get('/admin/users')
      .then(setUsers)
      .catch(() => setUsers([]))
  }

  useEffect(() => {
    load()
  }, [])

  async function onToggleActive(u) {
    try {
      await api.patch(`/admin/users/${u.id}/toggle-active`)
      show(u.active ? 'Пользователь заблокирован 🔒' : 'Пользователь разблокирован 🔓')
      load()
    } catch (e) {
      show(e.message, 'error')
    }
  }

  async function onResetPassword(u) {
    const pwd = window.prompt(`Новый пароль для ${u.email} (мин. 6 символов):`)
    if (!pwd) return
    try {
      await api.put(`/admin/users/${u.id}/password`, { password: pwd })
      show('Пароль изменён ✅')
    } catch (e) {
      show(e.message, 'error')
    }
  }

  if (!users) return <Spinner />

  const term = search.trim().toLowerCase()
  const filtered = term
    ? users.filter((u) => [u.email, u.fullName].some((v) => v && String(v).toLowerCase().includes(term)))
    : users

  return (
    <div>
      <div className="admin-page__head">
        <h2>👥 Пользователи</h2>
      </div>
      <p className="text-muted" style={{ marginTop: 0 }}>
        Зарегистрированные покупатели — всего: {users.length}
      </p>

      <div className="card" style={{ padding: 14, marginBottom: 16 }}>
        <input
          className="input"
          type="search"
          placeholder="🔍 Поиск по имени или email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 380 }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty">Пользователи не найдены.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((u) => (
            <div className="card" key={u.id} style={{ padding: 16 }}>
              <div className="between" style={{ flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                    <strong style={{ fontSize: 16 }}>{u.fullName || 'Без имени'}</strong>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-warning' : 'badge-muted'}`}>
                      {u.role === 'ADMIN' ? 'Админ' : 'Покупатель'}
                    </span>
                    {!u.active && <span className="badge badge-danger">🔒 заблокирован</span>}
                  </div>
                  <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
                    ✉ {u.email} &nbsp;·&nbsp; 📅 {formatDate(u.createdAt)}
                  </div>
                  <div className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>
                    Заказов: {u.orderCount} · На сумму: {formatPrice(u.totalSpent)}
                  </div>
                </div>
                <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setOpenOrders(openOrders === u.id ? null : u.id)}>
                    🛒 Заказы ({u.orderCount})
                  </button>
                  {u.role !== 'ADMIN' && (
                    <button className="btn btn-outline btn-sm" onClick={() => onToggleActive(u)}>
                      {u.active ? '🔒 Заблокировать' : '🔓 Разблокировать'}
                    </button>
                  )}
                  <button className="btn btn-outline btn-sm" onClick={() => onResetPassword(u)}>
                    🔑 Сбросить пароль
                  </button>
                </div>
              </div>

              {openOrders === u.id && (
                <div className="mt-16" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  {u.orders.length === 0 ? (
                    <p className="text-muted" style={{ fontSize: 13 }}>
                      Заказов пока нет.
                    </p>
                  ) : (
                    u.orders.map((o) => {
                      const st = STATUSES[o.status] || { label: o.status, cls: 'badge-muted' }
                      const open = openOrder === o.id
                      return (
                        <div key={o.id} style={{ background: 'var(--bg)', borderRadius: 8, marginBottom: 6, padding: '8px 10px' }}>
                          <div className="row between" style={{ gap: 8 }}>
                            <span>
                              <strong>Заказ №{o.id}</strong>{' '}
                              <span className={`badge ${st.cls}`}>{st.label}</span>
                            </span>
                            <span className="text-muted" style={{ fontSize: 12 }}>
                              {formatDate(o.createdAt)}
                            </span>
                            <strong>{formatPrice(o.total)}</strong>
                            <button className="btn btn-outline btn-sm" onClick={() => setOpenOrder(open ? null : o.id)}>
                              {open ? 'Скрыть' : 'Подробнее'}
                            </button>
                          </div>
                          {open && (
                            <div className="mt-8" style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
                              <div className="text-muted" style={{ fontSize: 13, lineHeight: 1.7 }}>
                                <div>👤 {o.fullName || '—'}</div>
                                <div>☎ {o.phone || '—'}</div>
                                <div>📍 {o.address || '—'}</div>
                                {o.comment && <div>💬 {o.comment}</div>}
                              </div>
                              <div className="mt-8">
                                {o.items.map((it, j) => (
                                  <div className="summary-line" key={j}>
                                    <span style={{ flex: 1 }}>{it.productName}</span>
                                    <span>
                                      {formatPrice(it.price)} × {it.quantity}
                                    </span>
                                    <span style={{ fontWeight: 600 }}>{formatPrice(it.price * it.quantity)}</span>
                                  </div>
                                ))}
                                <div className="summary-line total">
                                  <span>Итого</span>
                                  <span>{formatPrice(o.total)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
