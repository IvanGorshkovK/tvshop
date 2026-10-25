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

// wait ready
let ready = false
for (let i = 0; i < 40; i++) {
  try {
    const r = await req('GET', '/products?size=1')
    if (r.status === 200) { ready = true; break }
  } catch {}
  await new Promise((r) => setTimeout(r, 2000))
}
if (!ready) { console.log('NOT_READY'); process.exit(1) }

const login = await req('POST', '/auth/login', null, { email: 'admin@tvspace.ru', password: 'admin123' })
const token = login.data?.token
console.log('LOGIN:', login.status, 'token=', Boolean(token))

// 1. products filter by brand
const hisense = await req('GET', '/admin/products?brand=Hisense&size=500', token)
console.log('FILTER brand=Hisense:', hisense.data?.total)

// 2. products filter by screenSize
const size65 = await req('GET', '/admin/products?screenSize=65&size=500', token)
console.log('FILTER screenSize=65:', size65.data?.total)

// 3. toggle active
const first = hisense.data?.items?.[0]
if (first) {
  const tog = await req('PATCH', `/admin/products/${first.id}/active?active=${!first.active}`, token)
  console.log('TOGGLE active ->', tog.data?.active, '(было', first.active + ')')
  // вернуть обратно
  await req('PATCH', `/admin/products/${first.id}/active?active=${first.active}`, token)
}

// 4. upload (fake png)
const fd = new FormData()
fd.append('file', new Blob(['test-image-bytes'], { type: 'image/png' }), 'test.png')
const upRes = await fetch(`${BASE}/admin/upload`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: fd,
})
const upData = await upRes.json().catch(() => null)
console.log('UPLOAD:', upRes.status, 'url=', upData?.url)

// 5. order edit (если есть заказ)
const orders = await req('GET', '/admin/orders', token)
const o = orders.data?.[0]
if (o) {
  const upd = await req('PUT', `/admin/orders/${o.id}`, token, { fullName: o.fullName, phone: o.phone, email: o.email, address: o.address, comment: o.comment, status: o.status })
  console.log('ORDER EDIT:', upd.status, 'id=', upd.data?.id)
} else {
  console.log('ORDER EDIT: заказов нет, пропущено')
}
