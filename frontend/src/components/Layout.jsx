import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function Layout() {
  const { pathname } = useLocation()
  const [showTop, setShowTop] = useState(false)

  // Прокрутка вверх при смене страницы
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Показывать кнопку «наверх» после прокрутки
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Плавное появление блоков при прокрутке
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('reveal-visible'))
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('reveal-visible')
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.08 },
    )
    const scan = () => document.querySelectorAll('.reveal:not(.reveal-visible)').forEach((el) => obs.observe(el))
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      obs.disconnect()
      mo.disconnect()
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main className="container" style={{ flex: 1 }}>
        <div key={pathname} className="page-fade">
          <Outlet />
        </div>
      </main>
      <Footer />

      {showTop && (
        <button className="to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="Наверх">
          ↑
        </button>
      )}
    </div>
  )
}
