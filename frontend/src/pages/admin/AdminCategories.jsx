import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client.js'
import { useToast } from '../../context/ToastContext.jsx'
import Spinner from '../../components/Spinner.jsx'

export default function AdminCategories() {
  const { show } = useToast()
  const [categories, setCategories] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '', icon: '' })
  const [error, setError] = useState('')
  const [openSubs, setOpenSubs] = useState(null) // category id
  const [subForm, setSubForm] = useState({ title: '', query: '' })
  const [editingSub, setEditingSub] = useState(null)

  const load = useCallback(() => {
    api
      .get('/admin/categories')
      .then(setCategories)
      .catch(() => setCategories([]))
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
      show('Категория добавлена ✅')
    } catch (err) {
      setError(err.message)
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Удалить категорию?')) return
    try {
      await api.del(`/admin/categories/${id}`)
      load()
      show('Категория удалена 🗑')
    } catch (err) {
      setError(err.message)
    }
  }

  async function onToggleHidden(c) {
    try {
      await api.patch(`/admin/categories/${c.id}/toggle-hidden`)
      load()
      show(c.hidden ? 'Категория показана на сайте 👁' : 'Категория скрыта с сайта 🙈')
    } catch (err) {
      show(err.message, 'error')
    }
  }

  async function onAddSub(id) {
    if (!subForm.title.trim()) {
      show('Укажите название подкатегории', 'error')
      return
    }
    try {
      await api.post(`/admin/categories/${id}/subcategories`, subForm)
      setSubForm({ title: '', query: '' })
      load()
      show('Подкатегория добавлена ✅')
    } catch (err) {
      show(err.message, 'error')
    }
  }

  async function onDeleteSub(id) {
    if (!window.confirm('Удалить подкатегорию?')) return
    try {
      await api.del(`/admin/subcategories/${id}`)
      setEditingSub(null)
      load()
    } catch (err) {
      show(err.message, 'error')
    }
  }

  async function onSaveSub() {
    if (!editingSub.title.trim()) {
      show('Укажите название подкатегории', 'error')
      return
    }
    try {
      await api.put(`/admin/subcategories/${editingSub.id}`, { title: editingSub.title, query: editingSub.query })
      setEditingSub(null)
      load()
      show('Подкатегория обновлена ✅')
    } catch (err) {
      show(err.message, 'error')
    }
  }

  if (!categories) return <Spinner />

  return (
    <div className="mt-24" style={{ maxWidth: 760 }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {categories.map((c) => (
          <div className="card" key={c.id} style={{ padding: 14 }}>
            <div className="between" style={{ flexWrap: 'wrap', gap: 10 }}>
              <div className="row">
                <span style={{ fontSize: 22 }}>{c.icon || '📦'}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {c.name}{' '}
                    {c.hidden && (
                      <span className="badge badge-muted" style={{ fontSize: 11 }}>
                        🙈 скрыта
                      </span>
                    )}
                  </div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    /{c.slug} · {c.productCount} товаров
                  </div>
                </div>
              </div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-outline btn-sm" onClick={() => setOpenSubs(openSubs === c.id ? null : c.id)}>
                  📂 Подкатегории ({c.subcategories?.length || 0})
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => onToggleHidden(c)}>
                  {c.hidden ? '👁 Показать на сайте' : '🙈 Скрыть с сайта'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(c.id)}>
                  Удалить
                </button>
              </div>
            </div>

            {openSubs === c.id && (
              <div className="mt-16" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                {(c.subcategories || []).length === 0 ? (
                  <p className="text-muted" style={{ fontSize: 13 }}>
                    Подкатегорий пока нет.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                    {c.subcategories.map((s) => {
                      if (editingSub && editingSub.id === s.id) {
                        return (
                          <div key={s.id} className="row" style={{ gap: 8, padding: '8px 10px', background: 'var(--bg)', borderRadius: 8 }}>
                            <input
                              className="input"
                              value={editingSub.title}
                              onChange={(e) => setEditingSub((f) => ({ ...f, title: e.target.value }))}
                            />
                            <input
                              className="input"
                              value={editingSub.query}
                              onChange={(e) => setEditingSub((f) => ({ ...f, query: e.target.value }))}
                            />
                            <button className="btn btn-primary btn-sm" onClick={onSaveSub}>
                              💾
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => setEditingSub(null)}>
                              Отмена
                            </button>
                          </div>
                        )
                      }
                      return (
                        <div key={s.id} className="row between" style={{ gap: 8, padding: '6px 10px', background: 'var(--bg)', borderRadius: 8 }}>
                          <span style={{ fontSize: 14 }}>
                            {s.title}{' '}
                            <span className="text-muted" style={{ fontSize: 12 }}>
                              · /catalog?{s.query}
                            </span>
                          </span>
                          <div className="row" style={{ gap: 6 }}>
                            <button
                              className="btn btn-outline btn-sm"
                              title="Редактировать"
                              onClick={() => setEditingSub({ id: s.id, title: s.title, query: s.query })}
                            >
                              ✏️
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => onDeleteSub(s.id)}>
                              🗑
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="row" style={{ gap: 8 }}>
                  <input
                    className="input"
                    placeholder="Название (например: OLED)"
                    value={subForm.title}
                    onChange={(e) => setSubForm((f) => ({ ...f, title: e.target.value }))}
                  />
                  <input
                    className="input"
                    placeholder="Фильтр (например: category=televizory&technology=OLED)"
                    value={subForm.query}
                    onChange={(e) => setSubForm((f) => ({ ...f, query: e.target.value }))}
                  />
                  <button className="btn btn-primary btn-sm" onClick={() => onAddSub(c.id)}>
                    + Добавить
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
