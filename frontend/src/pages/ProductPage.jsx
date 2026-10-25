import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatPrice } from '../utils/format.js'
import { productSpecs } from '../utils/specs.js'
import Spinner from '../components/Spinner.jsx'

function readList(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

const GROUP_RULES = [
  { title: 'Функции', re: /функци|smart|hdr|голосов|dlna|управлен|запись|таймер|pip/i },
  { title: 'Звук', re: /звук|мощн|динамик|сабвуфер|аудио|dolby|саундбар|колонк/i },
  { title: 'Разъемы и интерфейсы', re: /hdmi|usb|разъем|разъём|вход|выход|порт|ethernet|оптическ|jack|bluetooth|wi-?fi|wifi|компонент|композит/i },
  { title: 'Прием сигнала', re: /тюнер|dvb|прием|приём|антенн|телевещани|спутников/i },
  { title: 'Габариты и вес', re: /вес|габарит|размер|vesa|ширин|высот|глубин|толщин|кронштейн/i },
]

function groupSpecs(specs) {
  const groups = new Map()
  const DEFAULT = 'Основные характеристики'
  for (const s of specs) {
    let title = DEFAULT
    for (const r of GROUP_RULES) {
      if (r.re.test(s.label)) {
        title = r.title
        break
      }
    }
    if (!groups.has(title)) groups.set(title, [])
    groups.get(title).push(s)
  }
  const order = ['Основные характеристики', 'Функции', 'Звук', 'Разъемы и интерфейсы', 'Прием сигнала', 'Габариты и вес']
  return [...groups.entries()].sort((a, b) => {
    const ia = order.indexOf(a[0])
    const ib = order.indexOf(b[0])
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
  })
}

export default function ProductPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { add } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [lightbox, setLightbox] = useState(null)
  const [quickOpen, setQuickOpen] = useState(false)
  const [quickForm, setQuickForm] = useState({ fullName: '', phone: '', consent: false })
  const [quickMsg, setQuickMsg] = useState('')
  const [quickDone, setQuickDone] = useState('')
  const [fav, setFav] = useState(false)
  const [cmp, setCmp] = useState(false)

  useEffect(() => {
    api
      .get(`/products/${slug}`)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!product) return
    setFav(readList('fav').includes(product.id))
    setCmp(readList('cmp').includes(product.id))
  }, [product])

  useEffect(() => {
    if (lightbox === null || !product) return
    const imgs =
      product.images && product.images.length > 0
        ? product.images
        : product.imageUrl
          ? [product.imageUrl]
          : []
    function onKey(e) {
      if (e.key === 'Escape') setLightbox(null)
      else if (e.key === 'ArrowLeft') setLightbox((i) => (i - 1 + imgs.length) % imgs.length)
      else if (e.key === 'ArrowRight') setLightbox((i) => (i + 1) % imgs.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, product])

  function toggleList(key, id) {
    const list = readList(key)
    const has = list.includes(id)
    localStorage.setItem(key, JSON.stringify(has ? list.filter((x) => x !== id) : [...list, id]))
    return !has
  }

  async function onAdd() {
    if (!user) {
      navigate('/login', { state: { from: `/product/${slug}` } })
      return
    }
    setAdding(true)
    setError('')
    try {
      await add(product.id, qty)
      navigate('/cart')
    } catch (e) {
      setError(e.message)
    } finally {
      setAdding(false)
    }
  }

  function openQuick() {
    setQuickForm({ fullName: (user && user.fullName) || '', phone: '', consent: false })
    setQuickMsg('')
    setQuickDone('')
    setQuickOpen(true)
  }

  async function submitQuick(e) {
    e.preventDefault()
    setQuickMsg('')
    if (!quickForm.consent) {
      setQuickMsg('Подтвердите согласие на обработку персональных данных')
      return
    }
    try {
      await api.post('/orders/quick', {
        productId: product.id,
        quantity: qty,
        fullName: quickForm.fullName,
        phone: quickForm.phone,
      })
      setQuickOpen(false)
      setQuickDone('Заявка отправлена! Мы свяжемся с вами для подтверждения заказа.')
    } catch (err) {
      setQuickMsg(err.message)
    }
  }

  if (loading) return <Spinner />
  if (!product) {
    return (
      <div className="empty">
        <div className="empty__icon">😕</div>
        <p>Товар не найден.</p>
      </div>
    )
  }

  const out = product.stock <= 0
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : []
  const specs =
    product.specifications && Object.keys(product.specifications).length > 0
      ? Object.entries(product.specifications).map(([label, value]) => ({ label, value }))
      : productSpecs(product)
  const keySpecs = specs.slice(0, 5)
  const groupedSpecs = groupSpecs(specs)

  return (
    <div>
      <div className="product-page">
        <div className="product-gallery">
          <div className="product-gallery__viewport">
            <div
              className="product-gallery__track"
              style={{ transform: `translateX(-${activeImg * 100}%)` }}
            >
              {images.length > 0 ? (
                images.map((url, i) => (
                  <div className="product-gallery__slide" key={i} onClick={() => setLightbox(i)}>
                    <img src={url} alt={product.name} />
                  </div>
                ))
              ) : (
                <div className="product-gallery__slide">
                  <span>📺</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <>
                <button
                  className="gal-nav gal-prev"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveImg((i) => (i - 1 + images.length) % images.length)
                  }}
                >
                  ‹
                </button>
                <button
                  className="gal-nav gal-next"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveImg((i) => (i + 1) % images.length)
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="product-thumbs">
              {images.map((url, i) => (
                <button
                  key={i}
                  className={'thumb' + (i === activeImg ? ' active' : '')}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <nav className="breadcrumbs">
            <Link to="/">Главная</Link>
            <span className="breadcrumbs__sep">—</span>
            <Link to={`/catalog?category=${product.categorySlug}`}>Каталог</Link>
            <span className="breadcrumbs__sep">—</span>
            <span className="breadcrumbs__current">{product.name}</span>
          </nav>

          <h1>{product.name}</h1>

          <div className="product-code">Код товара: {product.id}</div>

          <div className="row" style={{ alignItems: 'baseline', gap: 12 }}>
            <span className="price" style={{ fontSize: 30 }}>
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="price-old" style={{ fontSize: 18 }}>
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          <div className="row mt-8" style={{ gap: 10 }}>
            <span className={out ? 'badge badge-danger' : 'badge badge-success'}>
              {out ? 'Нет в наличии' : 'В наличии на складе'}
            </span>
          </div>

          <div className="row mt-16" style={{ gap: 8 }}>
            <button className={'btn btn-outline btn-sm' + (cmp ? ' is-active' : '')} onClick={() => setCmp(toggleList('cmp', product.id))}>
              ⇄ {cmp ? 'В сравнении' : 'Сравнить'}
            </button>
            <button className={'btn btn-outline btn-sm' + (fav ? ' is-active' : '')} onClick={() => setFav(toggleList('fav', product.id))}>
              ♥ {fav ? 'В избранном' : 'В избранное'}
            </button>
          </div>

          {keySpecs.length > 0 && (
            <div className="key-specs mt-16">
              {keySpecs.map((s) => (
                <div className="key-spec" key={s.label}>
                  <span className="key-spec__label">{s.label}</span>
                  <span className="key-spec__dots" />
                  <span className="key-spec__value">{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {error && <div className="alert alert-error mt-16">{error}</div>}
          {quickDone && <div className="alert alert-success mt-16">{quickDone}</div>}

          {!out && (
            <div className="product-page__actions">
              <div className="buy-row">
                <div className="qty">
                  <button onClick={() => setQty((v) => Math.max(1, v - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((v) => Math.min(product.stock, v + 1))}>+</button>
                </div>
                <button className="btn btn-primary btn-lg" onClick={onAdd} disabled={adding}>
                  {adding ? 'Добавляем…' : 'В корзину'}
                </button>
              </div>
              <button className="btn btn-dark btn-lg" onClick={openQuick}>
                ⚡ Купить в 1 клик
              </button>
            </div>
          )}

          <div className="delivery-info mt-16">
            <div className="delivery-info__title">Доставка и оплата</div>
            <div className="delivery-info__row">🚚 Доставка по Москве и МО</div>
            <div className="delivery-info__row">🏬 Самовывоз — бесплатно</div>
            <div className="delivery-info__row">💵 Оплата наличными при получении</div>
            <Link to="/delivery" className="delivery-info__link">
              Подробнее о доставке →
            </Link>
          </div>
        </div>
      </div>

      <section className="product-specs">
        <h2 className="specs-title">Коротко о товаре</h2>
        {product.description && <p className="product-desc">{product.description}</p>}
        {keySpecs.length > 0 && (
          <div className="short-specs-grid">
            {keySpecs.map((s) => (
              <div className="short-spec" key={s.label}>
                <div className="short-spec__label">{s.label}</div>
                <div className="short-spec__value">{s.value}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {groupedSpecs.length > 0 && (
        <section className="product-specs">
          <h2 className="specs-title">Характеристики</h2>
          <div className="spec-groups">
            {groupedSpecs.map(([group, items]) => (
              <div className="spec-group" key={group}>
                <h3 className="spec-group__title">{group}</h3>
                <div className="product-page__specs">
                  {items.map((s) => (
                    <div className="spec-row" key={s.label}>
                      <span>{s.label}</span>
                      <span>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {lightbox !== null && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <div className="lightbox__inner" onClick={(e) => e.stopPropagation()}>
            <img src={images[lightbox]} alt={product.name} />
            <button className="lightbox__close" onClick={() => setLightbox(null)}>
              ✕
            </button>
          </div>
          {images.length > 1 && (
            <>
              <button
                className="lightbox__nav lightbox__prev"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightbox((i) => (i - 1 + images.length) % images.length)
                }}
              >
                ‹
              </button>
              <button
                className="lightbox__nav lightbox__next"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightbox((i) => (i + 1) % images.length)
                }}
              >
                ›
              </button>
            </>
          )}
        </div>
      )}

      {quickOpen && (
        <div className="lightbox" onClick={() => setQuickOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Купить в 1 клик</h3>
            <p className="text-muted">Оставьте контакты — мы перезвоним для подтверждения заказа.</p>

            <div className="quick-product">
              {images.length > 0 && <img src={images[0]} alt="" />}
              <div>
                <div className="quick-product__name">{product.name}</div>
                <div className="quick-product__price">
                  {formatPrice(product.price)} × {qty} = {formatPrice(product.price * qty)}
                </div>
              </div>
            </div>

            <form onSubmit={submitQuick}>
              <div className="field">
                <label>Имя *</label>
                <input
                  className="input"
                  required
                  value={quickForm.fullName}
                  onChange={(e) => setQuickForm((f) => ({ ...f, fullName: e.target.value }))}
                />
              </div>
              <div className="field">
                <label>Телефон *</label>
                <input
                  className="input"
                  required
                  placeholder="+7 (___) ___-__-__"
                  value={quickForm.phone}
                  onChange={(e) => setQuickForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="row" style={{ gap: 8, fontSize: 14, margin: '12px 0', alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  style={{ marginTop: 3 }}
                  checked={quickForm.consent}
                  onChange={(e) => setQuickForm((f) => ({ ...f, consent: e.target.checked }))}
                />
                <span>
                  Я согласен на{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--primary)', textDecoration: 'underline' }}
                  >
                    обработку персональных данных
                  </a>
                </span>
              </div>
              {quickMsg && <div className="alert alert-error">{quickMsg}</div>}
              <button className="btn btn-primary btn-lg" type="submit" style={{ width: '100%' }}>
                Отправить заявку на покупку
              </button>
              <button
                className="btn btn-outline"
                type="button"
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => setQuickOpen(false)}
              >
                Отмена
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
