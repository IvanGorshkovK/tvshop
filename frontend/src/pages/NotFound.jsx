import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'

export default function NotFound() {
  return (
    <EmptyState
      icon="🔍"
      title="Страница не найдена"
      text="Возможно, страница удалена или вы ввели неверный адрес."
    >
      <Link to="/" className="btn btn-primary">
        На главную
      </Link>
    </EmptyState>
  )
}
