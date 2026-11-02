import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatPrice } from '../utils/format.js'

export default function CheckoutPage() {
  const { cart, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    comment: '',
    consent: false,
  })
  const [error, setError] = useState('')
  const [placing, setPlacing] = useState(false)
  const [placed, setPlaced] = useState(null)

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.consent) {
      setError('Подтвердите согласие на обработку персональных данных')
      return
    }
    setPlacing(true)
    try {
      const order = user
        ? await api.post('/orders', form)
        : await api.post('/orders/guest', {
            items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
            ...form,
          })
      clear()
      setPlaced(order)
    } catch (err) {
      setError(err.message)
    } finally {
      setPlacing(false)
    }
  }

  if (placed) {
    return (
      <div className="empty mt-24">
        <div className="empty__icon">✅</div>
        <h2>Заказ №{placed.id} оформлен!</h2>
        <p>Сумма заказа: {formatPrice(placed.total)}. Наш менеджер свяжется с вами для подтверждения.</p>
        <div className="row mt-16" style={{ justifyContent: 'center' }}>
          {user ? (
            <button className="btn btn-primary" onClick={() => navigate('/orders')}>
              Мои заказы
            </button>
          ) : (
            <Link to="/" className="btn btn-primary">
              На главную
            </Link>
          )}
          <Link to="/catalog" className="btn btn-outline">
            Продолжить покупки
          </Link>
        </div>
      </div>
    )
  }

  if (!cart.items.length) {
    return (
      <div className="empty mt-24">
        <div className="empty__icon">🛒</div>
        <p>Корзина пуста — нечего оформлять.</p>
        <Link to="/catalog" className="btn btn-primary mt-16">
          В каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-24" style={{ maxWidth: 760 }}>
      <h1>Оформление заказа</h1>

      {!user && (
        <div className="card" style={{ padding: 14, marginBottom: 16, borderColor: 'var(--warning)' }}>
          <span style={{ fontWeight: 600 }}>👤 Оформление без регистрации.</span>{' '}
          <span className="text-muted">
            Укажите контакты ниже — или{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              войдите
            </Link>{' '}
            /{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              зарегистрируйтесь
            </Link>
            .
          </span>
        </div>
      )}

      <div className="card mb-16" style={{ padding: 16 }}>
        <h3 className="mt-0 mb-16">Ваш заказ</h3>
        {cart.items.map((item) => (
          <div className="summary-line" key={item.id}>
            <span>
              {item.productName} × {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="summary-line total">
          <span>Итого</span>
          <span>{formatPrice(cart.total)}</span>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="card" style={{ padding: 20 }} onSubmit={onSubmit}>
        <div className="field">
          <label>ФИО получателя *</label>
          <input className="input" required value={form.fullName} onChange={set('fullName')} />
        </div>
        <div className="field">
          <label>Телефон *</label>
          <input className="input" required placeholder="+7 (___) ___-__-__" value={form.phone} onChange={set('phone')} />
        </div>
        <div className="field">
          <label>Email *</label>
          <input className="input" type="email" required value={form.email} onChange={set('email')} />
        </div>
        <div className="field">
          <label>Адрес доставки *</label>
          <input className="input" required placeholder="Город, улица, дом, квартира" value={form.address} onChange={set('address')} />
        </div>
        <div className="field">
          <label>Комментарий</label>
          <textarea className="textarea" value={form.comment} onChange={set('comment')} />
        </div>

        <div className="alert alert-success" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
          💳 Демо-оплата: реальные деньги не списываются. Заказ будет создан сразу после подтверждения.
        </div>

        <div className="row" style={{ gap: 8, fontSize: 14, margin: '12px 0', alignItems: 'flex-start' }}>
          <input
            type="checkbox"
            style={{ marginTop: 3 }}
            checked={form.consent}
            onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
          />
          <span>
            Я согласен на{' '}
            <a href="/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
              обработку персональных данных
            </a>
          </span>
        </div>

        <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={placing}>
          {placing ? 'Оформляем…' : `Подтвердить заказ · ${formatPrice(cart.total)}`}
        </button>
      </form>
    </div>
  )
}
