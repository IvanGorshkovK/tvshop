import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client.js'
import { formatPrice } from '../../utils/format.js'
import Spinner from '../../components/Spinner.jsx'

const BRANDS = ['Samsung', 'LG', 'Hisense', 'TCL', 'Onkron', 'Ugreen', 'Vital']
const SIZES = ['32', '43', '50', '55', '65', '75', '85', '100']

export default function Products() {
  const [data, setData] = useState(null)
  const [categories, setCategories] = useState([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [screenSize, setScreenSize] = useState('')
  const [sort, setSort] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState(new Set())
  const [priceEdit, setPriceEdit] = useState(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importMsg, setImportMsg] = useState('')

  const load = useCallback(() => {
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (category) sp.set('category', category)
    if (brand) sp.set('brand', brand)
    if (screenSize) sp.set('screenSize', screenSize)
    if (sort) sp.set('sort', sort)
    sp.set('page', String(page))
    sp.set('size', '20')
    api.get(`/admin/products?${sp.toString()}`).then(setData).catch(() => setData(null))
  }, [q, category, brand, screenSize, sort, page])

  useEffect(() => {
    api.get('/admin/categories').then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setPage(0)
  }, [q, category, brand, screenSize, sort])

  function pageWindow(current, total) {
    const start = Math.max(0, Math.min(current - 2, total - 5))
    const end = Math.min(total, start + 5)
    return Array.from({ length: end - start }, (_, i) => start + i)
  }

  async function onDelete(id, name) {
    if (!window.confirm(`Удалить товар «${name}»?`)) return
    await api.del(`/admin/products/${id}`)
    load()
  }

  async function onToggle(p) {
    await api.patch(`/admin/products/${p.id}/active?active=${!p.active}`)
    load()
  }

  // ---------- Массовые действия ----------
  function toggleSelect(id) {
    setSelected((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  function toggleAll() {
    const all = (data.items || []).map((p) => p.id)
    setSelected((s) => (s.size === all.length && all.length > 0 ? new Set() : new Set(all)))
  }

  async function batch(action) {
    if (!selected.size) return
    if (action === 'delete' && !window.confirm(`Удалить выбранные товары (${selected.size})?`)) return
    await api.post('/admin/products/batch', { ids: [...selected], action })
    setSelected(new Set())
    load()
  }

  // ---------- Инлайн-редактирование цены ----------
  async function savePrice() {
    if (!priceEdit) return
    await api.patch(`/admin/products/${priceEdit.id}/price`, { price: priceEdit.value })
    setPriceEdit(null)
    load()
  }

  // ---------- Импорт CSV ----------
  async function submitImport() {
    setImportMsg('')
    try {
      const res = await api.post('/admin/products/import', { csv: importText })
      setImportMsg(`Импортировано товаров: ${res.imported}`)
      setImportText('')
      load()
    } catch (err) {
      setImportMsg(err.message)
    }
  }

  return (
    <div className="mt-24">
      <div className="between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
        <h1 className="mt-0">Товары</h1>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setImportOpen(true)}>
            📥 Импорт CSV
          </button>
          <Link to="/admin/products/new" className="btn btn-primary">
            + Добавить товар
          </Link>
        </div>
      </div>

      <div className="card mb-16" style={{ padding: 16 }}>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <input
            className="input"
            style={{ maxWidth: 240 }}
            placeholder="Поиск по названию/бренду…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="select" style={{ width: 'auto' }} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select className="select" style={{ width: 'auto' }} value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="">Все бренды</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select className="select" style={{ width: 'auto' }} value={screenSize} onChange={(e) => setScreenSize(e.target.value)}>
            <option value="">Все диагонали</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}″
              </option>
            ))}
          </select>
          <select className="select" style={{ width: 'auto' }} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">По умолчанию</option>
            <option value="price_asc">Дешевле</option>
            <option value="price_desc">Дороже</option>
            <option value="name">По названию</option>
          </select>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="card mb-16" style={{ padding: 12 }}>
          <div className="row" style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: 14 }}>Выбрано: {selected.size}</strong>
            <button className="btn btn-outline btn-sm" onClick={() => batch('hide')}>
              Скрыть
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => batch('show')}>
              Показать
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => batch('delete')}>
              Удалить
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>
              Сбросить
            </button>
          </div>
        </div>
      )}

      {!data ? (
        <Spinner />
      ) : data.items.length === 0 ? (
        <div className="empty">Товары не найдены.</div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input type="checkbox" checked={selected.size === data.items.length && data.items.length > 0} onChange={toggleAll} />
                </th>
                <th>Название</th>
                <th>Категория</th>
                <th>Бренд</th>
                <th>Диагональ</th>
                <th>Цена</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((p) => (
                <tr key={p.id}>
                  <td>
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} />
                  </td>
                  <td style={{ maxWidth: 300 }}>{p.name}</td>
                  <td>{p.categoryName}</td>
                  <td>{p.brand || '—'}</td>
                  <td>{p.screenSizeInches ? `${p.screenSizeInches}″` : '—'}</td>
                  <td
                    style={{ cursor: 'pointer', minWidth: 120 }}
                    title="Нажмите, чтобы изменить цену"
                    onClick={() => setPriceEdit({ id: p.id, value: p.price })}
                  >
                    {priceEdit && priceEdit.id === p.id ? (
                      <input
                        className="input"
                        type="number"
                        min="1"
                        step="0.01"
                        autoFocus
                        style={{ width: 100 }}
                        value={priceEdit.value}
                        onChange={(e) => setPriceEdit({ id: p.id, value: e.target.value })}
                        onBlur={savePrice}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') savePrice()
                          if (e.key === 'Escape') setPriceEdit(null)
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      formatPrice(p.price)
                    )}
                  </td>
                  <td>
                    {p.active ? (
                      <span className="badge badge-success">Активен</span>
                    ) : (
                      <span className="badge badge-muted">Скрыт</span>
                    )}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => onToggle(p)}>
                      {p.active ? 'Скрыть' : 'Показать'}
                    </button>{' '}
                    <Link to={`/admin/products/${p.id}/edit`} className="btn btn-outline btn-sm">
                      Изменить
                    </Link>{' '}
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(p.id, p.name)}>
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
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

      {data && (
        <p className="text-muted mt-8" style={{ fontSize: 13 }}>
          Всего товаров: {data.total} · Страница {page + 1} из {data.totalPages || 1}
        </p>
      )}

      {importOpen && (
        <div className="lightbox" onClick={() => setImportOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="mt-0">Импорт товаров из CSV</h3>
            <p className="text-muted" style={{ fontSize: 13 }}>
              Формат (по одному товару на строку, разделитель — точка с запятой):
              <br />
              <code>название;цена;бренд;slug_категории;остаток</code>
              <br />
              Например: <code>Телевизор Test 50";29990;Samsung;televizory;10</code>
            </p>
            <div className="field">
              <label>CSV-данные</label>
              <textarea
                className="textarea"
                rows={8}
                placeholder={'Телевизор Test;29990;Samsung;televizory;10\nСаундбар Test;9990;LG;audio-sistemy;5'}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
            </div>
            {importMsg && <div className="alert alert-success">{importMsg}</div>}
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-primary" onClick={submitImport}>
                Импортировать
              </button>
              <button className="btn btn-outline" onClick={() => setImportOpen(false)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
