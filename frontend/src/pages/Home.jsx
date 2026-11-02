import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { MAIN_SECTIONS } from '../config.js'
import ProductCard from '../components/ProductCard.jsx'
import { SkeletonGrid } from '../components/Skeleton.jsx'
import PromoSlider from '../components/PromoSlider.jsx'
import usePageMeta from '../hooks/usePageMeta.js'
import { useSite } from '../context/SiteContext.jsx'

const BRANDS = [
  { name: 'Samsung', logo: '/brands/samsung.svg' },
  { name: 'LG', logo: '/brands/lg.svg' },
  { name: 'Hisense', logo: '/brands/hisense.svg' },
  { name: 'TCL', logo: '/brands/tcl.svg' },
]

const BENEFITS = [
  { icon: '🚚', title: 'Быстрая доставка', text: 'По Москве и России, ежедневно' },
  { icon: '🛡️', title: 'Официальная гарантия', text: 'От производителя' },
  { icon: '📐', title: 'Подбор диагонали', text: 'Под вашу комнату' },
  { icon: '🔧', title: 'Установка и настройка', text: 'Подключим и настроим' },
  { icon: '💳', title: 'Оплата при получении', text: 'Проверьте товар до оплаты' },
]

export default function Home() {
  const { site } = useSite()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  usePageMeta(
    'TV Space — телевизоры, аудио и проекторы',
    'Интернет-магазин телевизоров, саундбаров и проекторов премиум-класса с доставкой и установкой.',
  )

  useEffect(() => {
    api
      .get('/products?size=100')
      .then((p) => setProducts(p.items || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const discounted = products.filter((p) => p.oldPrice).slice(0, 8)
  const popular = products.slice(0, 8)

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <img className="hero__bg" src={site.heroImage} alt="" />
        <span className="hero__overlay" />
        <div className="hero__content">
          <h1>{site.heroTitle}</h1>
          <p>{site.heroSubtitle}</p>
          <div className="hero__badges">
            <span>Официальная гарантия</span>
            <span>Доставка и установка</span>
            <span>Подбор под комнату</span>
          </div>
          <div className="row">
            <Link to="/catalog?category=televizory" className="btn btn-primary btn-lg">
              Смотреть телевизоры
            </Link>
            <Link to="/catalog" className="btn btn-light btn-lg">
              Весь каталог
            </Link>
          </div>
        </div>
      </section>

      {/* Слайдер акций */}
      <PromoSlider />

      {/* Преимущества */}
      <section className="benefits">
        {BENEFITS.map((b) => (
          <div className="benefit reveal" key={b.title}>
            <span className="benefit__icon">{b.icon}</span>
            <div>
              <div className="benefit__title">{b.title}</div>
              <div className="benefit__text">{b.text}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Три крупных раздела */}
      <section className="main-sections">
        {MAIN_SECTIONS.filter((s) => !s.navOnly).map((s) => (
          <Link
            key={s.slug}
            to={s.href || `/catalog?category=${s.slug}`}
            className={`main-section main-section--${s.accent} reveal`}
          >
            {s.image && <img className="main-section__bg" src={s.image} alt={s.title} loading="lazy" />}
            <span className="main-section__overlay" />
            <span className="main-section__icon">{s.icon}</span>
            <h2>{s.title}</h2>
            <p>{s.desc}</p>
            <span className="btn btn-light btn-sm">Перейти →</span>
          </Link>
        ))}
      </section>

      {/* Бренды */}
      <section>
        <div className="section-title">
          <h2>Бренды</h2>
        </div>
        <div className="brands">
          {BRANDS.map((b) => (
            <Link key={b.name} to={`/catalog?category=televizory&brand=${b.name}`} className="brand">
              <img src={b.logo} alt={b.name} />
            </Link>
          ))}
        </div>
      </section>

      {/* Выгодные предложения */}
      {discounted.length > 0 && (
        <section>
          <div className="section-title">
            <h2>Выгодные предложения</h2>
            <Link to="/catalog" className="btn btn-outline btn-sm">
              Все товары →
            </Link>
          </div>
          <div className="grid">
            {discounted.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Популярные товары */}
      <section>
        <div className="section-title">
          <h2>Популярные товары</h2>
          <Link to="/catalog" className="btn btn-outline btn-sm">
            Все товары →
          </Link>
        </div>
        {loading ? (
          <SkeletonGrid count={8} />
        ) : (
          <div className="grid">
            {popular.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
