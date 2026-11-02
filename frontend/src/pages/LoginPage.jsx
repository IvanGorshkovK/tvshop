import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from || '/'

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-24" style={{ maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
      <h1>Вход</h1>
      <div className="card" style={{ padding: 24 }}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Пароль</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="row between" style={{ marginBottom: 12 }}>
            <span />
            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 600 }}>
              Забыли пароль?
            </Link>
          </div>
          <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Входим…' : 'Войти'}
          </button>
        </form>
        <p className="text-muted mt-16" style={{ fontSize: 14 }}>
          Нет аккаунта?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}
