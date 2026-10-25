import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client.js'
import { formatDate, formatPrice } from '../../utils/format.js'
import Spinner from '../../components/Spinner.jsx'

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

export default function AdminOrders() {
  const [orders, setOrders] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fFrom, setFFrom] = useState('')
  const [fTo, setFTo] = useState('')

  const load = useCallback(() => {
    const sp = new URLSearchParams()
    if (fStatus) sp.set('status', fStatus)
    if (fFrom) sp.set('from', fFrom)
    if (fTo) sp.set('to', fTo)
    const q = sp.toString()
    api
      .get('/admin/orders' + (q ? '?' + q : ''))
      .then(setOrders)
      .catch(() => setOrders([]))
  }, [fStatus, fFrom, fTo])

  useEffect(() => {
    load()
  }, [load])

  function resetFilters() {
    setFStatus('')
    setFFrom('')
    setFTo('')
  }

  async function changeStatus(id, status) {
    await api.patch(`/admin/orders/${id}/status`, { status })
    load()
  }

  function startEdit(o) {
    setEditingId(o.id)
    setEditForm({
      status: o.status,
      fullName: o.fullName || '',
      phone: o.phone || '',
      email: o.email || '',
      address: o.address || '',
      comment: o.comment || '',
    })
    setError('')
  }

  async function saveEdit() {
    setSaving(true)
    setError('')
    try {
      await api.put(`/admin/orders/${editingId}`, editForm)
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function setEdit(field, value) {
    setEditForm((f) => ({ ...f, [field]: value }))
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

  if (!orders) return <Spinner />

  return (
    <div className="mt-24">
      <h1 className="mt-0">Заказы</h1>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Статус</label>
            <select className="select" style={{ width: 'auto', minWidth: 170 }} value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
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
          <button className="btn btn-outline btn-sm" onClick={resetFilters}>
            Сбросить
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty">Заказы не найдены.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map((o) => (
          <div className="card" key={o.id} style={{ padding: 20 }}>
            <div className="between mb-16">
              <div className="row">
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
              <div className="card" style={{ padding: 16, background: '#f8fafc', marginBottom: 16 }}>
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
                    <label>Комментарий</label>
                    <textarea className="textarea" value={editForm.comment} onChange={(e) => setEdit('comment', e.target.value)} />
                  </div>
                </div>
                <div className="row">
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
                </div>
              </>
            )}
          </div>
          ))}
        </div>
      )}
    </div>
  )
}
