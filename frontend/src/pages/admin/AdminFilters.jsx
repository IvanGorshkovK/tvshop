import { useEffect, useState } from 'react'
import { api } from '../../api/client.js'
import { useToast } from '../../context/ToastContext.jsx'
import Spinner from '../../components/Spinner.jsx'

const KEYS = [
  { value: 'brand', label: 'Производитель (brand)' },
  { value: 'price', label: 'Цена (price)' },
  { value: 'screenSize', label: 'Диагональ (screenSize)' },
  { value: 'technology', label: 'Технология (technology)' },
  { value: 'resolution', label: 'Разрешение (resolution)' },
  { value: 'powerOutput', label: 'Мощность (powerOutput)' },
  { value: 'channels', label: 'Каналы (channels)' },
  { value: 'luminousFlux', label: 'Световой поток (luminousFlux)' },
]

export default function AdminFilters() {
  const { show } = useToast()
  const [list, setList] = useState(null)
  const [cats, setCats] = useState([])
  const [edit, setEdit] = useState(null)
  const [saving, setSaving] = useState(false)

  function load() {
    api
      .get('/admin/filters')
      .then(setList)
      .catch(() => setList([]))
  }

  useEffect(() => {
    load()
    api
      .get('/categories')
      .then(setCats)
      .catch(() => {})
  }, [])

  async function save() {
    if (!edit.categorySlug || !edit.filterKey || !edit.label || !edit.type) {
      show('Заполните категорию, ключ, название и тип', 'error')
      return
    }
    setSaving(true)
    try {
      if (edit.id) await api.put('/admin/filters/' + edit.id, edit)
      else await api.post('/admin/filters', edit)
      show('Фильтр сохранён ✅')
      setEdit(null)
      load()
    } catch (e) {
      show(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    if (!window.confirm('Удалить фильтр?')) return
    try {
      await api.del('/admin/filters/' + id)
      show('Фильтр удалён 🗑')
      load()
    } catch (e) {
      show(e.message, 'error')
    }
  }

  if (!list) return <Spinner />

  return (
    <div>
      <div className="admin-page__head">
        <h2>⚙️ Фильтры каталога</h2>
        <button
          className="btn btn-primary btn-sm"
          onClick={() =>
            setEdit({
              categorySlug: cats[0]?.slug || '',
              filterKey: 'brand',
              label: '',
              type: 'checkbox',
              options: '',
              position: 0,
            })
          }
        >
          ➕ Добавить фильтр
        </button>
      </div>
      <p className="text-muted" style={{ marginTop: 0 }}>
        Фильтры применяются в каталоге для выбранной категории. «Ключ» определяет, по какому полю товара идёт
        фильтрация.
      </p>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Категория</th>
              <th>Ключ</th>
              <th>Название</th>
              <th>Тип</th>
              <th>Значения</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((f) => (
              <tr key={f.id}>
                <td>{f.categorySlug}</td>
                <td>{f.filterKey}</td>
                <td>{f.label}</td>
                <td>{f.type}</td>
                <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.options || '—'}
                </td>
                <td>
                  <div className="row" style={{ gap: 6 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setEdit({ ...f })}>
                      ✏️
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(f.id)}>
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && (
        <div className="card mt-16" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>{edit.id ? 'Редактировать фильтр' : 'Новый фильтр'}</h3>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Категория</label>
              <select
                className="select"
                value={edit.categorySlug}
                onChange={(e) => setEdit((f) => ({ ...f, categorySlug: e.target.value }))}
              >
                {cats.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Ключ (поле товара)</label>
              <select
                className="select"
                value={edit.filterKey}
                onChange={(e) => setEdit((f) => ({ ...f, filterKey: e.target.value }))}
              >
                {KEYS.map((k) => (
                  <option key={k.value} value={k.value}>
                    {k.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Название</label>
              <input className="input" value={edit.label} onChange={(e) => setEdit((f) => ({ ...f, label: e.target.value }))} />
            </div>
            <div className="field">
              <label>Тип</label>
              <select className="select" value={edit.type} onChange={(e) => setEdit((f) => ({ ...f, type: e.target.value }))}>
                <option value="checkbox">Чекбоксы (список значений)</option>
                <option value="range">Диапазон (от/до)</option>
              </select>
            </div>
          </div>
          {edit.type === 'checkbox' && (
            <div className="field">
              <label>Значения (через запятую)</label>
              <input
                className="input"
                value={edit.options}
                onChange={(e) => setEdit((f) => ({ ...f, options: e.target.value }))}
                placeholder="Например: Samsung,LG,Hisense"
              />
            </div>
          )}
          <div className="row mt-8" style={{ gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
              {saving ? 'Сохранение…' : '💾 Сохранить'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setEdit(null)}>
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
