import { useEffect, useState } from 'react'
import { api } from '../../api/client.js'
import { formatDate } from '../../utils/format.js'
import Spinner from '../../components/Spinner.jsx'

const ACTION_LABELS = {
  CREATE: 'Создание',
  UPDATE: 'Изменение',
  DELETE: 'Удаление',
  STATUS: 'Статус',
  TRASH: 'В корзину',
  RESTORE: 'Восстановление',
  PERMANENT_DELETE: 'Полное удаление',
  PRICE: 'Цена',
  IMPORT: 'Импорт',
  SHOW: 'Показать',
  HIDE: 'Скрыть',
}

export default function AdminAudit() {
  const [logs, setLogs] = useState(null)

  useEffect(() => {
    api
      .get('/admin/audit')
      .then(setLogs)
      .catch(() => setLogs([]))
  }, [])

  if (!logs) return <Spinner />

  return (
    <div className="mt-24">
      <h1 className="mt-0">Журнал действий</h1>
      <p className="text-muted" style={{ fontSize: 14, marginTop: 0 }}>
        Последние действия администраторов (до 500 записей).
      </p>

      {logs.length === 0 ? (
        <div className="empty">Записей пока нет.</div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Администратор</th>
                <th>Действие</th>
                <th>Объект</th>
                <th>ID</th>
                <th>Детали</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatDate(l.createdAt)}</td>
                  <td>{l.actor}</td>
                  <td>{ACTION_LABELS[l.action] || l.action}</td>
                  <td>{l.entity}</td>
                  <td>{l.entityId ?? '—'}</td>
                  <td style={{ maxWidth: 340 }}>{l.detail || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
