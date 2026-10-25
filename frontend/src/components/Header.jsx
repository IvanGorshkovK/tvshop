import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { SITE, MAIN_SECTIONS } from '../config.js'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatPrice } from '../utils/format.js'

const telHref = 'tel:' + SITE.phone.replace(/[^+\d]/g, '')

export default function Header() {
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const [q, setQ] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSug, setShowSug] = useState(false)
  const navigate = useNavigate()

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
            <span className="header__city">📍 г. {SITE.city}</span>
            <span className="header__divider" />
            <Link to="/delivery" className="header__top-link">
              {SITE.deliveryText}
            </Link>
          </div>
          <div className="header__top-side">
            <a href={`mailto:${SITE.email}`} className="header__top-link header__mail">
              ✉ {SITE.email}
            </a>
            <a href={telHref} className="header__phone">
              ☎ {SITE.phone}
            </a>
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
              <Link to={`/catalog?category=${s.slug}`} className="nav-link">
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
        </div>
      </nav>
    </header>
  )
}
