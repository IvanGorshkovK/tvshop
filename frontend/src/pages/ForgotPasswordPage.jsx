import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [demoLink, setDemoLink] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setDemoLink('')
    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email })
      setMessage(res.message)
      if (res.demoLink) setDemoLink(res.demoLink)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-24" style={{ maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
      <h1>Восстановление пароля</h1>
      <div className="card" style={{ padding: 24 }}>
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        {demoLink && (
          <div className="alert" style={{ wordBreak: 'break-all' }}>
            <a href={demoLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>
              {demoLink}
            </a>
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Отправка…' : 'Отправить ссылку для сброса'}
          </button>
        </form>
        <p className="text-muted mt-16" style={{ fontSize: 14 }}>
          Вспомнили пароль?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
