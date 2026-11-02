import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Пароли не совпадают')
      return
    }
    if (password.length < 6) {
      setError('Пароль должен быть не короче 6 символов')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/reset-password', { token, password })
      setMessage(res.message)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="mt-24" style={{ maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <p>Неверная ссылка для сброса пароля.</p>
          <Link to="/login" className="btn btn-primary">
            На страницу входа
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-24" style={{ maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
      <h1>Новый пароль</h1>
      <div className="card" style={{ padding: 24 }}>
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Новый пароль (мин. 6 символов)</label>
            <input
              className="input"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Повторите пароль</label>
            <input
              className="input"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Сохранение…' : 'Сохранить пароль'}
          </button>
        </form>
        <p className="text-muted mt-16" style={{ fontSize: 14 }}>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            ← Вернуться ко входу
          </Link>
        </p>
      </div>
    </div>
  )
}
