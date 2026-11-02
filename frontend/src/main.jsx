import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { SiteProvider } from './context/SiteContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './styles/global.css'

// Тема (тёмная/светлая) — применяем до рендера, чтобы не было «мигания»
try {
  const saved = localStorage.getItem('theme')
  if (saved === 'light' || saved === 'dark') {
    document.documentElement.setAttribute('data-theme', saved)
  }
} catch {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <SiteProvider>
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </SiteProvider>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
