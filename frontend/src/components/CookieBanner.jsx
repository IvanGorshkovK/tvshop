import { useState } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem('cookie-consent'))

  function accept() {
    localStorage.setItem('cookie-consent', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner">
      <span>🍪 Мы используем файлы cookie для корректной работы сайта.</span>
      <button className="btn btn-primary btn-sm" onClick={accept}>
        Принять
      </button>
    </div>
  )
}
