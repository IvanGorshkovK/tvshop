import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.fullName, form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-24" style={{ maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
      <h1>Регистрация</h1>
      <div className="card" style={{ padding: 24 }}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Имя</label>
            <input className="input" value={form.fullName} onChange={set('fullName')} placeholder="Иван Петров" />
          </div>
          <div className="field">
            <label>Email *</label>
            <input className="input" type="email" required value={form.email} onChange={set('email')} />
          </div>
          <div className="field">
            <label>Пароль * (мин. 6 символов)</label>
            <input className="input" type="password" required minLength={6} value={form.password} onChange={set('password')} />
          </div>
          <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Создаём…' : 'Создать аккаунт'}
          </button>
        </form>
        <p className="text-muted mt-16" style={{ fontSize: 14 }}>
          Уже есть аккаунт?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
