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

export default function AdminCounterparties() {
  const { show } = useToast()
  const [list, setList] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [detailId, setDetailId] = useState(null)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // { key, name, phone, email }
  const [saving, setSaving] = useState(false)

  function load() {
    api
      .get('/admin/counterparties')
      .then(setList)
      .catch(() => setList([]))
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(c) {
    setEditing({ key: c.key, name: c.name || '', phone: c.phone || '', email: c.email || '' })
  }

  async function saveEdit() {
    setSaving(true)
    try {
      await api.put('/admin/counterparties/' + encodeURIComponent(editing.key), {
        name: editing.name,
        phone: editing.phone,
        email: editing.email,
      })
      show('Контрагент обновлён ✅')
      setEditing(null)
      load()
    } catch (e) {
      show(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function remove(key) {
    if (!window.confirm('Удалить контрагента? Все его заказы будут перемещены в корзину.')) return
    try {
      await api.del('/admin/counterparties/' + encodeURIComponent(key))
      show('Контрагент перемещён в корзину 🗑')
      load()
    } catch (e) {
      show(e.message, 'error')
    }
  }

  if (!list) return <Spinner />

  const term = search.trim().toLowerCase()
  const filtered = term
    ? list.filter((c) =>
        [c.phone, c.name, c.email].some((v) => v && String(v).toLowerCase().includes(term)),
      )
    : list

  return (
    <div className="mt-24">
      <h1 className="mt-0">Контрагенты</h1>
      <p className="text-muted" style={{ fontSize: 14, marginTop: 0 }}>
        Клиенты и их история покупок — всего: {list.length}
      </p>

      <div className="card" style={{ padding: 14, marginBottom: 16 }}>
        <input
          className="input"
          type="search"
          placeholder="🔍 Поиск по телефону, имени или email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 380 }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty">Контрагенты не найдены.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((c, i) => (
            <div className="card" key={c.key || i} style={{ padding: 16 }}>
              <div className="between" style={{ flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <strong style={{ fontSize: 16 }}>{c.name || 'Без имени'}</strong>
                  <div className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>
                    ☎ {c.phone || '—'} &nbsp;·&nbsp; ✉ {c.email || '—'}
                  </div>
                </div>
                <div className="row" style={{ gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="text-muted" style={{ fontSize: 13 }}>
                    Заказов: {c.orderCount}
                  </span>
                  <strong>{formatPrice(c.totalSpent)}</strong>
                  <button className="btn btn-outline btn-sm" onClick={() => setOpenId(openId === c.key ? null : c.key)}>
                    {openId === c.key ? 'Скрыть' : 'История'}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => startEdit(c)}>
                    ✏️ Редактировать
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(c.key)}>
                    🗑 Удалить
                  </button>
                </div>
              </div>

              {editing && editing.key === c.key && (
                <div className="card mt-16" style={{ padding: 16, background: 'var(--bg)' }}>
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div className="field">
                      <label>Имя / ФИО</label>
                      <input
                        className="input"
                        value={editing.name}
                        onChange={(e) => setEditing((f) => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div className="field">
                      <label>Телефон</label>
                      <input
                        className="input"
                        value={editing.phone}
                        onChange={(e) => setEditing((f) => ({ ...f, phone: e.target.value }))}
                      />
                    </div>
                    <div className="field">
                      <label>Email</label>
                      <input
                        className="input"
                        value={editing.email}
                        onChange={(e) => setEditing((f) => ({ ...f, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="row mt-8" style={{ gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>
                      {saving ? 'Сохранение…' : '💾 Сохранить'}
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => setEditing(null)}>
                      Отмена
                    </button>
                  </div>
                </div>
              )}

              {openId === c.key && (
                <div className="mt-16">
                  {c.orders.map((o) => {
                    const st = STATUSES[o.status] || { label: o.status, cls: 'badge-muted' }
                    const open = detailId === o.id
                    return (
                      <div className="card" key={o.id} style={{ padding: 12, marginBottom: 8, background: 'var(--bg)' }}>
                        <div className="between" style={{ flexWrap: 'wrap', gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>Заказ №{o.id}</span>
                          <span className={`badge ${st.cls}`}>{st.label}</span>
                          <span className="text-muted" style={{ fontSize: 12 }}>
                            {formatDate(o.createdAt)}
                          </span>
                          <strong>{formatPrice(o.total)}</strong>
                          <button className="btn btn-outline btn-sm" onClick={() => setDetailId(open ? null : o.id)}>
                            {open ? 'Скрыть' : 'Подробнее'}
                          </button>
                        </div>

                        <div className="text-muted" style={{ fontSize: 13, marginTop: 6 }}>
                          {o.items.map((it, j) => (
                            <span key={j} style={{ marginRight: 14, whiteSpace: 'nowrap' }}>
                              {it.productName} × {it.quantity}
                            </span>
                          ))}
                        </div>

                        {open && (
                          <div className="mt-8" style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                            <div className="text-muted" style={{ fontSize: 13, lineHeight: 1.7 }}>
                              <div>👤 {o.fullName || '—'}</div>
                              <div>☎ {o.phone || '—'}</div>
                              <div>✉ {o.email || '—'}</div>
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
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
