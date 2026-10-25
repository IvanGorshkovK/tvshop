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
  return { status: res.status, data }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let ready = false
for (let i = 0; i < 40; i++) {
  try {
    const r = await req('GET', '/products?size=1')
    if (r.status === 200) { ready = true; break }
  } catch {}
  await sleep(2000)
}
console.log('READY:', ready)
if (!ready) process.exit(1)

const cat = await req('GET', '/categories')
console.log('CATEGORIES:', cat.status, JSON.stringify(cat.data?.map((c) => c.name)))

const prod = await req('GET', '/products?size=3')
console.log('PRODUCTS:', prod.status, 'total=', prod.data?.total, '| first=', prod.data?.items?.[0]?.name)

const login = await req('POST', '/auth/login', null, { email: 'admin@tvspace.ru', password: 'admin123' })
console.log('LOGIN:', login.status, 'role=', login.data?.role, 'hasToken=', Boolean(login.data?.token))

const stats = await req('GET', '/admin/stats', login.data?.token)
console.log('STATS:', stats.status, JSON.stringify(stats.data))

const register = await req('POST', '/auth/register', null, { fullName: 'Тест', email: 'test@tvspace.ru', password: 'test123' })
console.log('REGISTER:', register.status, register.data?.email)

// add to cart + create order (as admin, uses own cart)
const addCart = await req('POST', '/cart', login.data?.token, { productId: 1, quantity: 1 })
console.log('CART_ADD:', addCart.status, 'itemCount=', addCart.data?.itemCount)

const order = await req('POST', '/orders', login.data?.token, {
  fullName: 'Админ Тест', phone: '+79990000000', email: 'admin@tvspace.ru', address: 'г. Москва, ул. Тестовая, 1', comment: ''
})
console.log('ORDER_CREATE:', order.status, 'orderId=', order.data?.id, 'total=', order.data?.total)

const orders = await req('GET', '/admin/orders', login.data?.token)
console.log('ADMIN_ORDERS:', orders.status, 'count=', orders.data?.length)
