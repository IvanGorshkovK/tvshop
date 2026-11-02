import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { formatPrice } from '../utils/format.js'
import { getCompare, removeCompare } from '../utils/compare.js'
import Spinner from '../components/Spinner.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function ComparePage() {
  const [ids, setIds] = useState(() => getCompare())
  const [products, setProducts] = useState(null)

  useEffect(() => {
    if (!ids.length) {
      setProducts([])
      return
    }
    api
      .get('/products/by-ids?ids=' + ids.join(','))
      .then((list) => setProducts(list || []))
      .catch(() => setProducts([]))
  }, [ids])

  function remove(id) {
    setIds(removeCompare(id))
  }

  if (products === null) return <Spinner />

  if (!products.length) {
    return (
      <EmptyState
        icon="⇄"
        title="Сравнение пусто"
        text="Добавьте товары к сравнению — нажмите «⇄ Сравнить» на карточке товара."
      >
        <Link to="/catalog" className="btn btn-primary">
          Перейти в каталог
        </Link>
      </EmptyState>
    )
  }

  const allNames = [...new Set(products.flatMap((p) => (p.specifications || []).map((s) => s.name)))].slice(0, 25)

  return (
    <div className="mt-24">
      <h1>Сравнение товаров</h1>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="table compare-table">
          <thead>
            <tr>
              <th style={{ minWidth: 160 }}>Характеристика</th>
              {products.map((p) => (
                <th key={p.id} style={{ minWidth: 210, verticalAlign: 'top' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} style={{ width: 140, height: 90, objectFit: 'cover', borderRadius: 8 }} />
                    ) : (
                      <span style={{ fontSize: 40 }}>📺</span>
                    )}
                    <button className="img-remove" onClick={() => remove(p.id)} title="Убрать из сравнения">
                      ✕
                    </button>
                  </div>
                  <Link to={`/product/${p.slug}`} style={{ display: 'block', marginTop: 8, fontWeight: 600, fontSize: 13 }}>
                    {p.name}
                  </Link>
                  <div className="price" style={{ marginTop: 6, fontSize: 16 }}>
                    {formatPrice(p.price)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allNames.map((name) => (
              <tr key={name}>
                <td className="text-muted" style={{ fontSize: 13 }}>
                  {name}
                </td>
                {products.map((p) => {
                  const spec = (p.specifications || []).find((s) => s.name === name)
                  return (
                    <td key={p.id} style={{ fontSize: 13 }}>
                      {spec ? spec.value : '—'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
