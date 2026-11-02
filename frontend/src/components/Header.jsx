import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { MAIN_SECTIONS } from '../config.js'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useSite } from '../context/SiteContext.jsx'
import { formatPrice } from '../utils/format.js'
import { getCompare } from '../utils/compare.js'

export default function Header() {
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const { site } = useSite()
  const telHref = 'tel:' + site.phone.replace(/[^+\d]/g, '')
  const [q, setQ] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSug, setShowSug] = useState(false)
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'dark')
  const [cmpCount, setCmpCount] = useState(() => getCompare().length)
  const [cats, setCats] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/categories').then(setCats).catch(() => setCats([]))
  }, [])

  useEffect(() => {
    const update = () => setCmpCount(getCompare().length)
    window.addEventListener('cmp-changed', update)
    return () => window.removeEventListener('cmp-changed', update)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('theme', next)
    } catch {}
  }

  useEffect(() => {
    const t = q.trim()
    if (t.length < 2) {
      setSuggestions([])
      setShowSug(false)
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/products?q=${encodeURIComponent(t)}&size=6`)
        setSuggestions(res.items || [])
        setShowSug(true)
      } catch {
        setSuggestions([])
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [q])

  function onSearch(e) {
    e.preventDefault()
    navigate(`/catalog?q=${encodeURIComponent(q.trim())}`)
  }

  function goToProduct(slug) {
    setShowSug(false)
    setQ('')
    navigate(`/product/${slug}`)
  }

  return (
    <header className="header">
      {/* Верхняя панель: слева город + доставка, справа почта + телефон */}
      <div className="header__top">
        <div className="container header__top-row">
          <div className="header__top-side">
            <span className="header__city">📍 г. {site.city}</span>
            <span className="header__divider" />
            <Link to="/delivery" className="header__top-link">
              {site.deliveryText}
            </Link>
          </div>
          <div className="header__top-side">
            <a href={`mailto:${site.email}`} className="header__top-link header__mail">
              ✉ {site.email}
            </a>
            <a href={telHref} className="header__phone">
              ☎ {site.phone}
            </a>
            {site.telegram && (
              <a
                href={`https://t.me/${site.telegram}`}
                className="header__top-link"
                target="_blank"
                rel="noreferrer"
                title="Telegram"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M9.04 15.51l-.38 5.36c.54 0 .78-.23 1.06-.51l2.55-2.45 5.28 3.88c.97.53 1.66.25 1.9-.9l3.44-16.19c.31-1.44-.52-2-1.46-1.65L1.34 10.6c-1.4.55-1.38 1.33-.24 1.68l5.24 1.64L19.3 5.17c.57-.38 1.09-.17.66.21L9.04 15.51z" />
                </svg>
                Telegram
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="header__main">
        <div className="container">
          <Link to="/" className="logo">
            TV <span>Space</span>
          </Link>

          <form className="header__search" onSubmit={onSearch}>
            <input
              className="input"
              type="search"
              placeholder="Поиск: Samsung, OLED, проектор, саундбар…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => q.trim().length >= 2 && suggestions.length > 0 && setShowSug(true)}
              onBlur={() => setTimeout(() => setShowSug(false), 150)}
            />
            <button className="btn btn-primary" type="submit">
              Найти
            </button>

            {showSug && suggestions.length > 0 && (
              <div className="search-suggest">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="search-suggest__item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goToProduct(p.slug)}
                  >
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" />
                    ) : (
                      <span className="search-suggest__icon">📺</span>
                    )}
                    <span className="search-suggest__name">{p.name}</span>
                    <span className="search-suggest__price">{formatPrice(p.price)}</span>
                  </button>
                ))}
              </div>
            )}
          </form>

          <div className="header__actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
              aria-label="Переключить тему"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <Link to="/compare" className="cart-link" title="Сравнение товаров">
              ⇄ Сравнение
              {cmpCount > 0 && <span className="cart-count">{cmpCount}</span>}
            </Link>
            <Link to="/cart" className="cart-link">
              🛒 Корзина
              {cart.itemCount > 0 && <span className="cart-count">{cart.itemCount}</span>}
            </Link>

            {user ? (
              <>
                <Link to="/orders" className="btn btn-ghost btn-sm">
                  Заказы
                </Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="btn btn-outline btn-sm">
                    Админ-панель
                  </Link>
                )}
                <span className="text-muted" style={{ fontSize: 14 }}>
                  {user.fullName || user.email}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Войти
                </Link>
                <Link to="/register" className="btn btn-dark btn-sm">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <nav className="header__nav">
        <div className="container">
          <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            Главная
          </NavLink>
          {MAIN_SECTIONS.map((s) => (
            <div className="nav-dropdown" key={s.slug}>
              <Link to={s.href || `/catalog?category=${s.slug}`} className="nav-link">
                {s.title} <span className="nav-caret">▾</span>
              </Link>
              {s.subcategories && (
                <div className="nav-dropdown__menu">
                  {s.subcategories.map((sub) => (
                    <Link key={sub.title} to={`/catalog?${sub.q}`} className="nav-dropdown__item">
                      {sub.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          {cats
            .filter((c) => !MAIN_SECTIONS.some((s) => s.slug === c.slug))
            .map((c) => {
              if (c.subcategories && c.subcategories.length > 0) {
                return (
                  <div className="nav-dropdown" key={c.slug}>
                    <Link to={`/catalog?category=${c.slug}`} className="nav-link">
                      {c.name} <span className="nav-caret">▾</span>
                    </Link>
                    <div className="nav-dropdown__menu">
                      <Link to={`/catalog?category=${c.slug}`} className="nav-dropdown__item">
                        Все {c.name}
                      </Link>
                      {c.subcategories.map((sub) => (
                        <Link key={sub.id} to={`/catalog?${sub.query}`} className="nav-dropdown__item">
                          {sub.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }
              return (
                <Link key={c.slug} to={`/catalog?category=${c.slug}`} className="nav-link">
                  {c.name}
                </Link>
              )
            })}
        </div>
      </nav>
    </header>
  )
}
