const BASE = 'http://localhost:8080/api'

async function req(method, path, token, body) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data = null
  try { data = JSON.parse(text) } catch {}
  if (!res.ok) throw new Error(`${res.status}: ${text.slice(0, 160)}`)
  return data
}

const login = await req('POST', '/auth/login', null, { email: 'admin@tvspace.ru', password: 'admin123' })
const token = login.token

const all = await req('GET', '/admin/products?size=1000', token)
const items = all.items || []

// карта существующих слагов -> id
const slugMap = new Map()
for (const p of items) if (p.slug) slugMap.set(p.slug.toLowerCase(), p.id)

const target = items.filter((p) => /\.ARU[GB]?$/i.test(p.name))

let updated = 0
let deleted = 0
for (const p of target) {
  const newName = p.name.replace(/\.ARU[GB]?$/i, '')
  const newSlug = p.slug.replace(/-aru[gb]?$/i, '')
  const taken = slugMap.get(newSlug.toLowerCase())
  if (taken !== undefined && taken !== p.id) {
    try {
      await req('DELETE', `/admin/products/${p.id}`, token)
      deleted++
      console.log('  ДУБЛЬ удалён:', p.name)
    } catch (e) {
      console.log('  FAIL удалить', p.name, '-', e.message.slice(0, 120))
    }
  } else {
    const payload = {
      name: newName,
      slug: newSlug,
      description: p.description,
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
      powerOutputW: p.powerOutputW,
      channels: p.channels,
      luminousFluxLm: p.luminousFluxLm,
      contrast: p.contrast,
      stock: p.stock,
      active: p.active,
      categoryId: p.categoryId,
      specifications: Object.entries(p.specifications || {}).map(([name, value]) => ({ name, value })),
      images: p.images || [],
    }
    try {
      await req('PUT', `/admin/products/${p.id}`, token, payload)
      slugMap.set(newSlug.toLowerCase(), p.id)
      updated++
    } catch (e) {
      console.log('  FAIL обновить', p.name, '-', e.message.slice(0, 160))
    }
  }
}
console.log(`ГОТОВО: обновлено ${updated}, удалено дубликатов ${deleted}`)
