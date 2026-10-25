import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client.js'
import Spinner from '../../components/Spinner.jsx'

export default function AdminCategories() {
  const [categories, setCategories] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '', icon: '' })
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api.get('/admin/categories').then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function onCreate(e) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/admin/categories', form)
      setForm({ name: '', slug: '', icon: '' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Удалить категорию?')) return
    try {
      await api.del(`/admin/categories/${id}`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!categories) return <Spinner />

  return (
    <div className="mt-24" style={{ maxWidth: 680 }}>
      <h1 className="mt-0">Категории</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="card mb-24" style={{ padding: 20 }} onSubmit={onCreate}>
        <h3 className="mt-0">Добавить категорию</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px auto', gap: 12 }}>
          <div className="field">
            <label>Название</label>
            <input className="input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="field">
            <label>Slug</label>
            <input className="input" placeholder="auto" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          </div>
          <div className="field">
            <label>Иконка</label>
            <input className="input" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} />
          </div>
          <div className="field" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-primary">+</button>
          </div>
        </div>
      </form>

      <div className="card" style={{ padding: 8 }}>
        {categories.map((c) => (
          <div className="between" key={c.id} style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
            <div className="row">
              <span style={{ fontSize: 22 }}>{c.icon || '📦'}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  /{c.slug} · {c.productCount} товаров
                </div>
              </div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(c.id)}>
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
