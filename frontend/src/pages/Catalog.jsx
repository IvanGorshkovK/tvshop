import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { FILTER_CONFIG, MAIN_SECTIONS } from '../config.js'
import ProductCard from '../components/ProductCard.jsx'
import Spinner from '../components/Spinner.jsx'

const SORTS = [
  { value: '', label: 'По умолчанию' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'price_desc', label: 'Сначала дороже' },
  { value: 'name', label: 'По названию' },
]

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const category = params.get('category') || ''
  const q = params.get('q') || ''

  useEffect(() => {
    api.get('/categories').then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const sp = new URLSearchParams(params)
    sp.set('size', '40')
    api
      .get(`/products?${sp.toString()}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [params])

  function update(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  function toggleCsv(key, value) {
    const current = (params.get(key) || '').split(',').filter(Boolean)
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    update(key, next.join(','))
  }

  function resetFilters() {
    const next = new URLSearchParams()
    if (category) next.set('category', category)
    if (q) next.set('q', q)
    setParams(next)
  }

  const filterGroups = FILTER_CONFIG[category] || []
  const hasFilters = filterGroups.length > 0

  return (
    <div>
      <div className="main-sections-strip">
        {MAIN_SECTIONS.map((s) => (
          <Link
            key={s.slug}
            to={`/catalog?category=${s.slug}`}
            className={`main-section-chip main-section--${s.accent}`}
          >
            <span className="main-section-chip__icon">{s.icon}</span>
            <span>{s.title}</span>
          </Link>
        ))}
      </div>

      <div className="catalog">
        <aside className="catalog__sidebar">
          <div className="filter-group">
            <h3>Категории</h3>
            {categories.map((c) => (
              <a
                key={c.id}
                className={'filter-link' + (category === c.slug ? ' active' : '')}
                href="#!"
                onClick={(e) => {
                  e.preventDefault()
                  update('category', c.slug)
                }}
              >
                {c.icon} {c.name}
              </a>
            ))}
          </div>

          {hasFilters && (
            <div className="filter-divider" />
          )}

          {filterGroups.map((group) => {
            if (group.type === 'checkbox') {
              const values = (params.get(group.key) || '').split(',').filter(Boolean)
              return (
                <div className="filter-group" key={group.key}>
                  <h3>{group.label}</h3>
                  {group.options.map((opt) => (
                    <label className="filter-check" key={opt}>
                      <input
                        type="checkbox"
                        checked={values.includes(opt)}
                        onChange={() => toggleCsv(group.key, opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )
            }
            const minKey = group.key + 'Min'
            const maxKey = group.key + 'Max'
            return (
              <div className="filter-group" key={group.key}>
                <h3>{group.label}</h3>
                <div className="filter-range">
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder="от"
                    value={params.get(minKey) || ''}
                    onChange={(e) => update(minKey, e.target.value)}
                  />
                  <span>—</span>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder="до"
                    value={params.get(maxKey) || ''}
                    onChange={(e) => update(maxKey, e.target.value)}
                  />
                </div>
              </div>
            )
          })}

          {hasFilters && (
            <button className="btn btn-outline btn-sm" onClick={resetFilters}>
              Сбросить фильтры
            </button>
          )}
        </aside>

        <div>
          <div className="between mb-16">
            <h1 className="mt-0" style={{ fontSize: 24 }}>
              {q ? `Результаты поиска: «${q}»` : 'Каталог товаров'}
            </h1>
            <select
              className="select"
              style={{ width: 'auto' }}
              value={params.get('sort') || ''}
              onChange={(e) => update('sort', e.target.value)}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <Spinner />
          ) : !data || data.items.length === 0 ? (
            <div className="empty">
              <div className="empty__icon">🔍</div>
              <p>Ничего не найдено. Попробуйте изменить запрос или фильтры.</p>
            </div>
          ) : (
            <>
              <div className="grid">
                {data.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <p className="text-muted mt-16" style={{ fontSize: 13 }}>
                Найдено товаров: {data.total}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
