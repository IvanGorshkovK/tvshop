import { Link } from 'react-router-dom'
import { SITE } from '../config.js'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <h4>TV Space</h4>
            <p style={{ fontSize: 14, margin: 0 }}>
              Интернет-магазин телевизоров, аудиосистем и проекторов.
            </p>
          </div>
          <div>
            <h4>Разделы</h4>
            <ul>
              <li><Link to="/catalog?category=televizory">Телевизоры</Link></li>
              <li><Link to="/catalog?category=audio-sistemy">Аудиосистемы</Link></li>
              <li><Link to="/catalog?category=proektory">Проекторы</Link></li>
              <li><Link to="/catalog">Весь каталог</Link></li>
            </ul>
          </div>
          <div>
            <h4>Информация</h4>
            <ul>
              <li><Link to="/delivery">Доставка</Link></li>
              <li><Link to="/install">Установка</Link></li>
              <li><Link to="/payment">Оплата</Link></li>
            </ul>
          </div>
          <div>
            <h4>Покупателям</h4>
            <ul>
              <li><Link to="/cart">Корзина</Link></li>
              <li><Link to="/orders">Мои заказы</Link></li>
              <li><Link to="/privacy">Политика конфиденциальности</Link></li>
              <li><Link to="/warranty">Гарантия и возврат</Link></li>
            </ul>
          </div>
          <div>
            <h4>Контакты</h4>
            <ul>
              <li>г. {SITE.city}</li>
              <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
              <li><a href={'tel:' + SITE.phone.replace(/[^+\d]/g, '')}>{SITE.phone}</a></li>
              <li>Ежедневно 9:00–21:00</li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          © {new Date().getFullYear()} TV Space. Демонстрационный проект.
        </div>
      </div>
    </footer>
  )
}
