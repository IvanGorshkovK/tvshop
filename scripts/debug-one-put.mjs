const BASE = 'http://localhost:8080/api'

async function req(method, path, token, body) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined })
  const text = await res.text()
  console.log(method, path, '->', res.status)
  if (!res.ok) console.log(text.slice(0, 1000))
  let data = null
  try { data = JSON.parse(text) } catch {}
  return data
}

const login = await req('POST', '/auth/login', null, { email: 'admin@tvspace.ru', password: 'admin123' })
const token = login.token
const all = await req('GET', '/admin/products?size=1000', token)
const p = (all.items || []).find((x) => x.name === 'Телевизор LG 86MRGB96B6B')
console.log('found:', p ? p.id : null, p ? p.slug : null)

const payload = {
  name: p.name,
  slug: p.slug,
  description: p.description,
  price: p.price,
  oldPrice: p.oldPrice,
  imageUrl: p.imageUrl,
  brand: p.brand,
  screenSizeInches: p.screenSizeInches,
  resolution: p.resolution,
  smartTv: p.smartTv,
  technology: p.technology,
  refreshRateHz: 144,
  hdr: 'HDR',
  os: p.os,
  stock: p.stock,
  active: p.active,
  categoryId: p.categoryId,
  specifications: [{ name: 'Частота обновления', value: '144 Гц' }],
  images: p.images || [],
}
await req('PUT', `/admin/products/${p.id}`, token, payload)
