const BASE = 'http://localhost:8080/api'

async function req(method, path, token, body) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined })
  const text = await res.text()
  if (!res.ok) throw new Error(`${res.status}: ${text.slice(0, 200)}`)
  return JSON.parse(text)
}

const MAP = {
  98: 'The Frame QE98LS03HEUXPY',
  65: 'The Frame QE65LS03HAUXPY',
}

const login = await req('POST', '/auth/login', null, { email: 'admin@tvspace.ru', password: 'admin123' })
const token = login.token
const all = (await req('GET', '/admin/products?size=1000', token)).items || []
const bad = all.filter((x) => x.name === 'Телевизор Samsung The')
for (const p of bad) {
  const model = MAP[p.screenSizeInches]
  if (!model) { console.log('пропуск, диагональ', p.screenSizeInches); continue }
  const name = `Телевизор Samsung ${model}`
  const payload = {
    name,
    slug: null,
    description: p.description.replace(/Samsung The с диагональю/, `Samsung ${model} с диагональю`),
    price: p.price,
    oldPrice: p.oldPrice,
    imageUrl: p.imageUrl,
    brand: p.brand,
    screenSizeInches: p.screenSizeInches,
    resolution: p.resolution,
    smartTv: p.smartTv,
    technology: p.technology,
    refreshRateHz: p.refreshRateHz,
    hdr: p.hdr,
    os: p.os,
    stock: p.stock,
    active: p.active,
    categoryId: p.categoryId,
    specifications: Object.entries(p.specifications || {}).map(([name, value]) => ({ name, value })),
    images: p.images || [],
  }
  await req('PUT', `/admin/products/${p.id}`, token, payload)
  console.log('Исправлен:', p.id, '->', name)
}
