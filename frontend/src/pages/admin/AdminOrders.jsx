import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client.js'
import { formatDate, formatPrice } from '../../utils/format.js'
import Spinner from '../../components/Spinner.jsx'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const STATUSES = [
  { value: 'NEW', label: 'Новый' },
  { value: 'PROCESSING', label: 'В обработке' },
  { value: 'SHIPPED', label: 'Отправлен' },
  { value: 'DELIVERED', label: 'Доставлен' },
  { value: 'CANCELLED', label: 'Отменён' },
]

const STATUS_CLS = {
  NEW: 'badge-primary',
  PROCESSING: 'badge-warning',
  SHIPPED: 'badge-primary',
  DELIVERED: 'badge-success',
  CANCELLED: 'badge-danger',
}

function pageWindow(current, total) {
  const start = Math.max(0, Math.min(current - 2, total - 5))
  const end = Math.min(total, start + 5)
  return Array.from({ length: end - start }, (_, i) => start + i)
}

export default function AdminOrders() {
  const [data, setData] = useState(null)
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState('')
  const [trash, setTrash] = useState([])
  const [showTrash, setShowTrash] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fFrom, setFFrom] = useState('')
  const [fTo, setFTo] = useState('')
  const [fPhone, setFPhone] = useState('')
  const [fAddress, setFAddress] = useState('')
  const [fId, setFId] = useState('')
  const [creating, setCreating] = useState(false)
  const [newOrder, setNewOrder] = useState({ items: [], fullName: '', phone: '', email: '', address: '', comment: '' })
  const [psearch, setPsearch] = useState('')
  const [presults, setPresults] = useState([])
  const [creatingBusy, setCreatingBusy] = useState(false)
  const [createError, setCreateError] = useState('')
  const [esearch, setEsearch] = useState('')
  const [eresults, setEresults] = useState([])

  const load = useCallback(() => {
    const sp = new URLSearchParams()
    if (fStatus) sp.set('status', fStatus)
    if (fFrom) sp.set('from', fFrom)
    if (fTo) sp.set('to', fTo)
    if (fPhone) sp.set('phone', fPhone)
    if (fAddress) sp.set('address', fAddress)
    if (fId) sp.set('id', fId)
    if (sort) sp.set('sort', sort)
    sp.set('page', String(page))
    sp.set('size', '20')
    const q = sp.toString()
    api
      .get('/admin/orders' + (q ? '?' + q : ''))
      .then(setData)
      .catch(() => setData({ items: [], total: 0, totalPages: 0, page: 0, size: 20 }))
  }, [fStatus, fFrom, fTo, fPhone, fAddress, fId, page, sort])

  const loadTrash = useCallback(() => {
    api
      .get('/admin/orders/trash')
      .then(setTrash)
      .catch(() => setTrash([]))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    loadTrash()
  }, [loadTrash])

  useEffect(() => {
    setPage(0)
  }, [fStatus, fFrom, fTo, fPhone, fAddress, fId, sort])

  function resetFilters() {
    setFStatus('')
    setFFrom('')
    setFTo('')
    setFPhone('')
    setFAddress('')
    setFId('')
    setSort('')
    setPage(0)
  }

  async function changeStatus(id, status) {
    await api.patch(`/admin/orders/${id}/status`, { status })
    load()
  }

  async function exportCsv() {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_BASE}/admin/orders/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'orders.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // ---------- Редактирование заказа ----------
  function startEdit(o) {
    setEditingId(o.id)
    setEditForm({
      status: o.status,
      fullName: o.fullName || '',
      phone: o.phone || '',
      email: o.email || '',
      address: o.address || '',
      comment: o.comment || '',
      managerComment: o.managerComment || '',
      items: (o.items || []).map((it) => ({
        productId: it.productId,
        productName: it.productName,
        price: it.price,
        quantity: it.quantity,
      })),
    })
    setEsearch('')
    setEresults([])
    setError('')
  }

  function setEdit(field, value) {
    setEditForm((f) => ({ ...f, [field]: value }))
  }

  function addEditItem(p) {
    setEditForm((f) => {
      const items = f.items || []
      const existing = items.find((i) => i.productId === p.id)
      if (existing) {
        return { ...f, items: items.map((i) => (i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i)) }
      }
      return { ...f, items: [...items, { productId: p.id, productName: p.name, price: p.price, quantity: 1 }] }
    })
    setEsearch('')
    setEresults([])
  }

  function changeEditQty(index, qty) {
    setEditForm((f) => ({
      ...f,
      items: (f.items || []).map((it, i) => (i === index ? { ...it, quantity: Math.max(1, qty) } : it)),
    }))
  }

  function changeEditPrice(index, price) {
    const num = parseFloat(price) || 0
    setEditForm((f) => ({
      ...f,
      items: (f.items || []).map((it, i) => (i === index ? { ...it, price: num } : it)),
    }))
  }

  function removeEditItem(index) {
    setEditForm((f) => ({ ...f, items: (f.items || []).filter((_, i) => i !== index) }))
  }

  async function saveEdit() {
    setSaving(true)
    setError('')
    try {
      const items = (editForm.items || [])
        .filter((i) => i.productId != null)
        .map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price }))
      await api.put(`/admin/orders/${editingId}`, { ...editForm, items })
      setEditingId(null)
      load()
      loadTrash()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (editingId == null) return
    const t = esearch.trim()
    if (t.length < 2) {
      setEresults([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/admin/products?q=${encodeURIComponent(t)}&size=8`)
        setEresults(res.items || [])
      } catch {
        setEresults([])
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [esearch, editingId])

  // ---------- Удаление / корзина ----------
  async function softDeleteOrder(id) {
    if (!window.confirm('Переместить заказ в корзину?')) return
    await api.del(`/admin/orders/${id}`)
    load()
    loadTrash()
  }

  async function restoreOrder(id) {
    await api.patch(`/admin/orders/${id}/restore`)
    load()
    loadTrash()
  }

  async function permanentDelete(id) {
    if (!window.confirm('Удалить заказ навсегда? Это действие необратимо.')) return
    await api.del(`/admin/orders/${id}/permanent`)
    loadTrash()
  }

  // ---------- Создание заказа ----------
  useEffect(() => {
    if (!creating) return
    const t = psearch.trim()
    if (t.length < 2) {
      setPresults([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/admin/products?q=${encodeURIComponent(t)}&size=8`)
        setPresults(res.items || [])
      } catch {
        setPresults([])
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [psearch, creating])

  function openCreate() {
    setNewOrder({ items: [], fullName: '', phone: '', email: '', address: '', comment: '' })
    setPsearch('')
    setPresults([])
    setCreateError('')
    setCreating(true)
  }

  function setNewField(field, value) {
    setNewOrder((f) => ({ ...f, [field]: value }))
  }

  function addToOrder(p) {
    setNewOrder((f) => {
      const existing = f.items.find((i) => i.productId === p.id)
      if (existing) {
        return { ...f, items: f.items.map((i) => (i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i)) }
      }
      return {
        ...f,
        items: [...f.items, { productId: p.id, productName: p.name, price: p.price, quantity: 1, stock: p.stock }],
      }
    })
    setPsearch('')
    setPresults([])
  }

  function changeQty(productId, qty) {
    setNewOrder((f) => ({
      ...f,
      items: f.items.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, qty) } : i)),
    }))
  }

  function removeFromOrder(productId) {
    setNewOrder((f) => ({ ...f, items: f.items.filter((i) => i.productId !== productId) }))
  }

  async function submitCreate() {
    if (!newOrder.items.length) {
      setCreateError('Добавьте хотя бы один товар в заказ.')
      return
    }
    setCreatingBusy(true)
    setCreateError('')
    try {
      await api.post('/admin/orders', {
        items: newOrder.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        fullName: newOrder.fullName,
        phone: newOrder.phone,
        email: newOrder.email,
        address: newOrder.address,
        comment: newOrder.comment,
      })
      setCreating(false)
      load()
      loadTrash()
    } catch (err) {
      setCreateError(err.message)
    } finally {
      setCreatingBusy(false)
    }
  }

  function printWaybill(o) {
    const statusLabel = STATUSES.find((s) => s.value === o.status)?.label || o.status
    const rows = o.items
      .map(
        (it, i) =>
          `<tr><td>${i + 1}</td><td>${it.productName}</td><td>${formatPrice(it.price)}</td><td>${it.quantity}</td><td>${formatPrice(
            it.price * it.quantity,
          )}</td></tr>`,
      )
      .join('')
    const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><title>Накладная №${o.id}</title>
<style>
  body{font-family:Arial,sans-serif;margin:40px;color:#000}
  h1{font-size:20px;text-align:center;margin-bottom:24px}
  .cols{display:flex;justify-content:space-between;margin:16px 0;font-size:14px;line-height:1.6}
  table{width:100%;border-collapse:collapse;margin:16px 0}
  th,td{border:1px solid #000;padding:8px;font-size:13px;text-align:left}
  th{background:#f0f0f0}
  .total{text-align:right;font-size:16px;font-weight:bold;margin:12px 0}
  .meta{font-size:13px;margin:8px 0}
  .sign{display:flex;justify-content:space-between;margin-top:80px;font-size:14px}
</style></head><body>
<h1>Товарная накладная №${o.id} от ${formatDate(o.createdAt)}</h1>
<div class="cols">
  <div><strong>Продавец:</strong> TV Space, г. Москва<br>Тел: 8 (800) 000-00-00<br>Email: info@tvspace.ru</div>
  <div><strong>Покупатель:</strong> ${o.fullName}<br>Тел: ${o.phone}<br>Email: ${o.email}<br>Адрес: ${o.address}</div>
</div>
<table>
  <tr><th>№</th><th>Товар</th><th>Цена</th><th>Кол-во</th><th>Сумма</th></tr>
  ${rows}
</table>
<div class="total">Итого: ${formatPrice(o.total)}</div>
<div class="meta"><strong>Статус:</strong> ${statusLabel}${o.comment ? ` &nbsp;|&nbsp; <strong>Комментарий:</strong> ${o.comment}` : ''}</div>
<div class="sign"><span>Отпустил: ______________</span><span>Получил: ______________</span></div>
<script>window.onload=function(){window.print()}</script>
</body></html>`
    const w = window.open('', '_blank', 'width=820,height=700')
    if (!w) return
    w.document.write(html)
    w.document.close()
  }

  if (!data) return <Spinner />

  const orders = data.items || []

  return (
    <div className="mt-24">
      <div className="between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
          <h1 className="mt-0">{showTrash ? 'Корзина' : 'Заказы'}</h1>
          <button
            className={'btn btn-sm ' + (showTrash ? 'btn-primary' : 'btn-outline')}
            onClick={() => setShowTrash(!showTrash)}
          >
            {showTrash ? '← К заказам' : `🗑 Корзина${trash.length ? ` (${trash.length})` : ''}`}
          </button>
        </div>
        {!showTrash && (
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-outline" onClick={exportCsv}>
              📥 CSV
            </button>
            <button className="btn btn-primary" onClick={openCreate}>
              + Создать заказ
            </button>
          </div>
        )}
      </div>

      {showTrash ? (
        trash.length === 0 ? (
          <div className="empty">Корзина пуста — удалённых заказов нет.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {trash.map((o) => (
              <div className="card" key={o.id} style={{ padding: 16, opacity: 0.85 }}>
                <div className="between mb-8" style={{ flexWrap: 'wrap', gap: 8 }}>
                  <div className="row" style={{ gap: 10 }}>
                    <strong>№{o.id}</strong>
                    <span className="text-muted" style={{ fontSize: 13 }}>
                      {formatDate(o.createdAt)}
                    </span>
                    <span className={`badge ${STATUS_CLS[o.status] || 'badge-muted'}`}>
                      {STATUSES.find((s) => s.value === o.status)?.label || o.status}
                    </span>
                  </div>
                  <strong>{formatPrice(o.total)}</strong>
                </div>
                <div className="text-muted mb-12" style={{ fontSize: 13 }}>
                  👤 {o.fullName} · ☎ {o.phone} · 📍 {o.address}
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => restoreOrder(o.id)}>
                    ↩ Восстановить
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => permanentDelete(o.id)}>
                    ✕ Удалить навсегда
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <>
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div className="row" style={{ gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="field" style={{ margin: 0 }}>
                <label>Номер заказа</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  placeholder="№"
                  style={{ width: 'auto', minWidth: 90 }}
                  value={fId}
                  onChange={(e) => setFId(e.target.value)}
                />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Статус</label>
                <select className="select" style={{ width: 'auto', minWidth: 160 }} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
                  <option value="">Все статусы</option>
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>С даты</label>
                <input className="input" type="date" value={fFrom} onChange={(e) => setFFrom(e.target.value)} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>По дату</label>
                <input className="input" type="date" value={fTo} onChange={(e) => setFTo(e.target.value)} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Телефон</label>
                <input
                  className="input"
                  type="search"
                  placeholder="+7…"
                  style={{ width: 'auto', minWidth: 130 }}
                  value={fPhone}
                  onChange={(e) => setFPhone(e.target.value)}
                />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Адрес</label>
                <input
                  className="input"
                  type="search"
                  placeholder="Город, улица…"
                  style={{ width: 'auto', minWidth: 170 }}
                  value={fAddress}
                  onChange={(e) => setFAddress(e.target.value)}
                />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Сортировка</label>
                <select className="select" style={{ width: 'auto', minWidth: 160 }} value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="">Сначала новые</option>
                  <option value="date_asc">Сначала старые</option>
                  <option value="total_desc">Сумма ↓</option>
                  <option value="total_asc">Сумма ↑</option>
                </select>
              </div>
              <button className="btn btn-outline btn-sm" onClick={resetFilters}>
                Сбросить
              </button>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="empty">Заказы не найдены.</div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {orders.map((o) => (
                  <div className="card" key={o.id} style={{ padding: 20 }}>
                    <div className="between mb-16">
                      <div className="row" style={{ gap: 10 }}>
                        <strong>№{o.id}</strong>
                        <span className="text-muted" style={{ fontSize: 13 }}>
                          {formatDate(o.createdAt)}
                        </span>
                        <span className={`badge ${STATUS_CLS[o.status] || 'badge-muted'}`}>
                          {STATUSES.find((s) => s.value === o.status)?.label || o.status}
                        </span>
                      </div>
                      <strong>{formatPrice(o.total)}</strong>
                    </div>

                    {editingId === o.id ? (
                      <div className="card" style={{ padding: 16, background: 'var(--bg)', marginBottom: 16 }}>
                        {error && <div className="alert alert-error">{error}</div>}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div className="field">
                            <label>ФИО</label>
                            <input className="input" value={editForm.fullName} onChange={(e) => setEdit('fullName', e.target.value)} />
                          </div>
                          <div className="field">
                            <label>Телефон</label>
                            <input className="input" value={editForm.phone} onChange={(e) => setEdit('phone', e.target.value)} />
                          </div>
                          <div className="field">
                            <label>Email</label>
                            <input className="input" value={editForm.email} onChange={(e) => setEdit('email', e.target.value)} />
                          </div>
                          <div className="field">
                            <label>Статус</label>
                            <select className="select" value={editForm.status} onChange={(e) => setEdit('status', e.target.value)}>
                              {STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="field" style={{ gridColumn: '1 / -1' }}>
                            <label>Адрес</label>
                            <input className="input" value={editForm.address} onChange={(e) => setEdit('address', e.target.value)} />
                          </div>
                          <div className="field" style={{ gridColumn: '1 / -1' }}>
                            <label>Комментарий клиента</label>
                            <textarea className="textarea" value={editForm.comment} onChange={(e) => setEdit('comment', e.target.value)} />
                          </div>
                          <div className="field" style={{ gridColumn: '1 / -1' }}>
                            <label>📝 Комментарий менеджера (внутренний, не виден клиенту)</label>
                            <textarea className="textarea" value={editForm.managerComment} onChange={(e) => setEdit('managerComment', e.target.value)} />
                          </div>
                        </div>

                        <div className="mb-8" style={{ fontWeight: 700 }}>
                          Состав заказа
                        </div>

                        {(editForm.items || []).map((it, i) => (
                          <div className="summary-line" key={i} style={{ gap: 8 }}>
                            <span style={{ flex: 1, minWidth: 140 }}>{it.productName}</span>
                            <span className="qty">
                              <button type="button" onClick={() => changeEditQty(i, it.quantity - 1)}>
                                −
                              </button>
                              <span>{it.quantity}</span>
                              <button type="button" onClick={() => changeEditQty(i, it.quantity + 1)}>
                                +
                              </button>
                            </span>
                            <input
                              className="input"
                              type="number"
                              min="0"
                              step="0.01"
                              style={{ width: 110 }}
                              value={it.price}
                              onChange={(e) => changeEditPrice(i, e.target.value)}
                              title="Цена за единицу"
                            />
                            <span style={{ fontWeight: 600, minWidth: 70, textAlign: 'right' }}>
                              {formatPrice(it.price * it.quantity)}
                            </span>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeEditItem(i)}>
                              ✕
                            </button>
                          </div>
                        ))}

                        <div className="field" style={{ marginTop: 12 }}>
                          <label>Добавить товар</label>
                          <input
                            className="input"
                            placeholder="Начните вводить название…"
                            value={esearch}
                            onChange={(e) => setEsearch(e.target.value)}
                          />
                        </div>
                        {eresults.length > 0 && (
                          <div className="card" style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
                            {eresults.map((p) => (
                              <button key={p.id} type="button" className="search-suggest__item" onClick={() => addEditItem(p)}>
                                <span style={{ flex: 1, textAlign: 'left' }}>{p.name}</span>
                                <span style={{ fontWeight: 600 }}>{formatPrice(p.price)}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="row" style={{ marginTop: 8 }}>
                          <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>
                            {saving ? 'Сохраняем…' : 'Сохранить'}
                          </button>
                          <button className="btn btn-outline" onClick={() => setEditingId(null)}>
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-muted mb-16" style={{ fontSize: 14 }}>
                          👤 {o.fullName} · ☎ {o.phone} · ✉ {o.email}
                          <br />
                          📍 {o.address}
                          {o.comment && (
                            <>
                              <br />💬 {o.comment}
                            </>
                          )}
                          {o.managerComment && (
                            <>
                              <br />📝 {o.managerComment}
                            </>
                          )}
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

                        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                          <span className="text-muted" style={{ fontSize: 14 }}>
                            Статус:
                          </span>
                          <select
                            className="select"
                            style={{ width: 'auto' }}
                            value={o.status}
                            onChange={(e) => changeStatus(o.id, e.target.value)}
                          >
                            {STATUSES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                          <span style={{ flex: 1 }} />
                          <button className="btn btn-outline btn-sm" onClick={() => startEdit(o)}>
                            Изменить
                          </button>
                          <button className="btn btn-dark btn-sm" onClick={() => printWaybill(o)}>
                            🖨 Накладная
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => softDeleteOrder(o.id)}>
                            🗑 Удалить
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {data.totalPages > 1 && (
                <div className="pagination mt-16">
                  <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                    ← Назад
                  </button>
                  {pageWindow(page, data.totalPages).map((n) => (
                    <button
                      key={n}
                      className={'btn btn-sm ' + (n === page ? 'btn-primary' : 'btn-outline')}
                      onClick={() => setPage(n)}
                    >
                      {n + 1}
                    </button>
                  ))}
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={page >= data.totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Вперёд →
                  </button>
                </div>
              )}

              <p className="text-muted mt-8" style={{ fontSize: 13 }}>
                Всего заказов: {data.total} · Страница {page + 1} из {data.totalPages || 1}
              </p>
            </>
          )}
        </>
      )}

      {creating && (
        <div className="lightbox" onClick={() => setCreating(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="mt-0">Создать заказ (по телефону)</h3>
            {createError && <div className="alert alert-error">{createError}</div>}

            <div className="field">
              <label>Добавить товар (поиск)</label>
              <input
                className="input"
                placeholder="Начните вводить название товара…"
                value={psearch}
                onChange={(e) => setPsearch(e.target.value)}
              />
            </div>

            {presults.length > 0 && (
              <div className="card" style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 12 }}>
                {presults.map((p) => (
                  <button key={p.id} type="button" className="search-suggest__item" onClick={() => addToOrder(p)}>
                    <span style={{ flex: 1, textAlign: 'left' }}>{p.name}</span>
                    <span style={{ fontWeight: 600 }}>{formatPrice(p.price)}</span>
                  </button>
                ))}
              </div>
            )}

            {newOrder.items.length > 0 && (
              <div className="card" style={{ padding: 12, marginBottom: 12 }}>
                {newOrder.items.map((i) => (
                  <div className="summary-line" key={i.productId}>
                    <span style={{ flex: 1 }}>{i.productName}</span>
                    <span className="qty">
                      <button type="button" onClick={() => changeQty(i.productId, i.quantity - 1)}>
                        −
                      </button>
                      <span>{i.quantity}</span>
                      <button type="button" onClick={() => changeQty(i.productId, i.quantity + 1)}>
                        +
                      </button>
                    </span>
                    <span style={{ fontWeight: 600 }}>{formatPrice(i.price * i.quantity)}</span>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeFromOrder(i.productId)}>
                      ✕
                    </button>
                  </div>
                ))}
                <div className="summary-line total">
                  <span>Итого</span>
                  <span>{formatPrice(newOrder.items.reduce((s, i) => s + i.price * i.quantity, 0))}</span>
                </div>
              </div>
            )}

            <div className="field">
              <label>ФИО *</label>
              <input className="input" value={newOrder.fullName} onChange={(e) => setNewField('fullName', e.target.value)} />
            </div>
            <div className="field">
              <label>Телефон *</label>
              <input className="input" value={newOrder.phone} onChange={(e) => setNewField('phone', e.target.value)} />
            </div>
            <div className="field">
              <label>Email *</label>
              <input className="input" type="email" value={newOrder.email} onChange={(e) => setNewField('email', e.target.value)} />
            </div>
            <div className="field">
              <label>Адрес *</label>
              <input className="input" value={newOrder.address} onChange={(e) => setNewField('address', e.target.value)} />
            </div>
            <div className="field">
              <label>Комментарий</label>
              <textarea className="textarea" value={newOrder.comment} onChange={(e) => setNewField('comment', e.target.value)} />
            </div>

            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-primary" onClick={submitCreate} disabled={creatingBusy}>
                {creatingBusy ? 'Создаём…' : 'Создать заказ'}
              </button>
              <button className="btn btn-outline" onClick={() => setCreating(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
