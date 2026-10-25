const BASE = 'http://localhost:8080/api'

async function req(method, path, token, body) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data = null
  try { data = JSON.parse(text) } catch {}
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${data?.message || text}`)
  return data
}

const login = await req('POST', '/auth/login', null, { email: 'admin@tvspace.ru', password: 'admin123' })
const token = login.token

// Проверить, есть ли уже категория
let cats = await req('GET', '/categories', null)
let cat = cats.find((c) => c.slug === 'kronshteyny')
if (!cat) {
  cat = await req('POST', '/admin/categories', token, { name: 'Кронштейны', slug: 'kronshteyny', icon: '🔩' })
  console.log('CATEGORY CREATED:', cat.id, cat.name)
} else {
  console.log('CATEGORY EXISTS:', cat.id, cat.name)
}

async function ensureProduct(payload) {
  // Проверить, нет ли товара с таким slug (по списку)
  const all = await req('GET', `/admin/products?size=200`, token)
  const existing = (all.items || []).find((p) => p.slug === payload.slug)
  if (existing) {
    console.log('PRODUCT EXISTS:', existing.name)
    return existing
  }
  const p = await req('POST', '/admin/products', token, payload)
  console.log('PRODUCT CREATED:', p.name)
  return p
}

await ensureProduct({
  name: 'Кронштейн наклонно-поворотный 32–65"',
  slug: 'kronshteyn-naklonno-povorotny',
  description: 'Настенный кронштейн с наклоном и поворотом, нагрузка до 45 кг.',
  price: 1990,
  oldPrice: 2490,
  brand: 'Onkron',
  stock: 30,
  active: true,
  categoryId: cat.id,
})

await ensureProduct({
  name: 'Кронштейн фиксированный 26–55"',
  slug: 'kronshteyn-fiksirovanny',
  description: 'Простой фиксированный кронштейн для телевизоров до 55 дюймов.',
  price: 890,
  brand: 'Onkron',
  stock: 30,
  active: true,
  categoryId: cat.id,
})

cats = await req('GET', '/categories', null)
console.log('\nCATEGORIES:', cats.map((c) => c.name).join(', '))
const all = await req('GET', '/products?size=100', null)
console.log('TOTAL PRODUCTS:', all.total)
