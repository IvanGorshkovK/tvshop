import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { api } from '../../api/client.js'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [newOrders, setNewOrders] = useState(0)

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((s) => setNewOrders(s.newOrders || 0))
      .catch(() => {})
  }, [location.pathname])

  const linkClass = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '')

  return (
    <div className="container">
      <div className="between" style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="row">
          <strong style={{ fontSize: 18 }}>⚙️ Админ-панель TV Space</strong>
        </div>
        <div className="row">
          <span className="text-muted" style={{ fontSize: 14 }}>
            {user?.fullName || user?.email}
          </span>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>
            На сайт
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="admin">
        <aside className="admin__side">
          <NavLink to="/admin" end className={linkClass}>
            📊 Дашборд
          </NavLink>
          <NavLink to="/admin/products" className={linkClass}>
            📦 Товары
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass}>
            🧾 Заказы
            {newOrders > 0 && <span className="nav-badge">{newOrders}</span>}
          </NavLink>
          <NavLink to="/admin/counterparties" className={linkClass}>
            👥 Контрагенты
          </NavLink>
          <NavLink to="/admin/users" className={linkClass}>
            👤 Пользователи
          </NavLink>
          <NavLink to="/admin/categories" className={linkClass}>
            🗂 Категории
          </NavLink>
          <NavLink to="/admin/audit" className={linkClass}>
            📋 Журнал
          </NavLink>
          <NavLink to="/admin/site" className={linkClass}>
            🌐 Сайт
          </NavLink>
          <NavLink to="/admin/filters" className={linkClass}>
            ⚙️ Фильтры
          </NavLink>
        </aside>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
