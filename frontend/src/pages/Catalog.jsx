import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { MAIN_SECTIONS } from '../config.js'
import ProductCard from '../components/ProductCard.jsx'
import { SkeletonGrid } from '../components/Skeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'
import usePageMeta from '../hooks/usePageMeta.js'

const SORTS = [
  { value: '', label: 'По умолчанию' },
  { value: 'price_asc', label: 'Сначала дешевле' },
  { value: 'price_desc', label: 'Сначала дороже' },
  { value: 'name', label: 'По названию' },
]

const COLLECTION_TITLES = {
  interior: 'Интерьерные телевизоры',
  '8k': 'Телевизоры с разрешением 8K UHD',
}

function pageList(current, total) {
  const pages = []
  const range = 2
  for (let i = 0; i < total; i++) {
    if (i === 0 || i === total - 1 || Math.abs(i - current) <= range) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }
  return pages
}

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('grid')
  const [filterGroups, setFilterGroups] = useState([])

  const category = params.get('category') || ''
  const q = params.get('q') || ''
  const collection = params.get('collection') || ''
  const collectionTitle = COLLECTION_TITLES[collection] || ''
  const page = parseInt(params.get('page') || '0', 10) || 0

  usePageMeta(
    q ? `Поиск: ${q}` : 'Каталог товаров',
    'Каталог телевизоров, аудиосистем, проекторов и кронштейнов.',
  )

  useEffect(() => {
    api.get('/categories').then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    api
      .get(`/filters?category=${encodeURIComponent(category)}`)
      .then(setFilterGroups)
      .catch(() => setFilterGroups([]))
  }, [category])

  useEffect(() => {
    setLoading(true)
    const sp = new URLSearchParams(params)
    sp.set('size', '15')
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
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  function goToPage(p) {
    const next = new URLSearchParams(params)
    next.set('page', String(p))
    setParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  const hasFilters = filterGroups.length > 0

  return (
    <div>
      <div className="main-sections-strip">
        {MAIN_SECTIONS.filter((s) => !s.navOnly).map((s) => (
          <Link
            key={s.slug}
            to={s.href || `/catalog?category=${s.slug}`}
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
          <div className="between mb-16" style={{ flexWrap: 'wrap', gap: 10 }}>
            <h1 className="mt-0" style={{ fontSize: 24 }}>
              {collectionTitle ? (
                <>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 13,
                      color: 'var(--primary)',
                      fontWeight: 600,
                      marginBottom: 4,
                      letterSpacing: 0.5,
                    }}
                  >
                    ✨ Подборка
                  </span>
                  {collectionTitle}
                </>
              ) : q ? (
                `Результаты поиска: «${q}»`
              ) : (
                'Каталог товаров'
              )}
            </h1>
            <div className="row" style={{ gap: 8 }}>
              <div className="row" style={{ gap: 0, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ borderRadius: 0, background: view === 'grid' ? 'var(--primary-soft)' : 'transparent' }}
                  onClick={() => setView('grid')}
                  title="Сетка"
                >
                  ▦
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ borderRadius: 0, background: view === 'list' ? 'var(--primary-soft)' : 'transparent' }}
                  onClick={() => setView('list')}
                  title="Список"
                >
                  ☰
                </button>
              </div>
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
          </div>

          {loading ? (
            <SkeletonGrid count={8} />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="Ничего не найдено"
              text="Попробуйте изменить запрос или сбросить фильтры."
            >
              <button className="btn btn-outline" onClick={resetFilters}>
                Сбросить фильтры
              </button>
            </EmptyState>
          ) : (
            <>
              <div className={view === 'list' ? 'grid grid--list' : 'grid'}>
                {data.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <p className="text-muted mt-16" style={{ fontSize: 13 }}>
                Найдено товаров: {data.total} · Страница {page + 1} из {data.totalPages}
              </p>
              {data.totalPages > 1 && (
                <div className="pagination mt-8">
                  <button className="btn btn-outline btn-sm" disabled={page <= 0} onClick={() => goToPage(page - 1)}>
                    ‹ Назад
                  </button>
                  {pageList(page, data.totalPages).map((p, i) =>
                    p === '...' ? (
                      <span key={`e${i}`} style={{ color: 'var(--muted)', padding: '0 2px' }}>
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        className={'btn btn-sm ' + (p === page ? 'btn-primary' : 'btn-outline')}
                        onClick={() => goToPage(p)}
                      >
                        {p + 1}
                      </button>
                    ),
                  )}
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={page >= data.totalPages - 1}
                    onClick={() => goToPage(page + 1)}
                  >
                    Вперёд ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
