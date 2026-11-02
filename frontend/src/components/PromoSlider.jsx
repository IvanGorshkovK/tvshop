import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'

const GRADIENTS = [
  'linear-gradient(120deg, #1e1b4b 0%, #6d28d9 60%, #a78bfa 100%)',
  'linear-gradient(120deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%)',
  'linear-gradient(120deg, #111827 0%, #0e7490 60%, #06b6d4 100%)',
]

export default function PromoSlider() {
  const [slides, setSlides] = useState([])
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    api
      .get('/slides')
      .then((s) => setSlides(s || []))
      .catch(() => setSlides([]))
  }, [])

  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [slides.length])

  function go(i) {
    setIdx((i + slides.length) % slides.length)
  }

  if (!slides.length) return null

  return (
    <section className="promo-slider" aria-label="Акции">
      <div className="promo-slider__track" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {slides.map((s, i) => (
          <div
            className="promo-slider__slide"
            style={{ background: s.image ? undefined : GRADIENTS[i % GRADIENTS.length] }}
            key={s.id}
          >
            {s.image && <img className="promo-slider__bg" src={s.image} alt="" />}
            {s.image && <span className="promo-slider__overlay" />}
            <div className="promo-slider__content">
              {s.tag && <span className="promo-slider__tag">{s.tag}</span>}
              <h2>{s.title}</h2>
              {s.text && <p>{s.text}</p>}
              {s.link && (
                <Link to={s.link} className="btn btn-light">
                  Смотреть подборку →
                </Link>
              )}
            </div>
            <span className="promo-slider__icon" aria-hidden="true">
              {s.icon}
            </span>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            className="promo-slider__arrow promo-slider__arrow--prev"
            onClick={() => go(idx - 1)}
            aria-label="Предыдущий слайд"
          >
            ‹
          </button>
          <button
            className="promo-slider__arrow promo-slider__arrow--next"
            onClick={() => go(idx + 1)}
            aria-label="Следующий слайд"
          >
            ›
          </button>
          <div className="promo-slider__dots">
            {slides.map((s, i) => (
              <button
                key={s.id}
                className={`promo-slider__dot${i === idx ? ' active' : ''}`}
                onClick={() => go(i)}
                aria-label={`Слайд ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
