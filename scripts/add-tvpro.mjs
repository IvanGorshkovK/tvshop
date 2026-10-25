import fs from 'node:fs'

const BASE = 'http://localhost:8080/api'
const data = JSON.parse(fs.readFileSync('tvpro-products.json', 'utf8'))

async function req(method, path, token, body) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined })
  const text = await res.text()
  if (!res.ok) throw new Error(`${res.status}: ${text.slice(0, 140)}`)
  return JSON.parse(text)
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n) : s
}

function resolutionOf(specs) {
  const r = specs['Разрешение экрана'] || ''
  if (/8K/i.test(r)) return '8K'
  if (/4K/i.test(r) || /Ultra HD/i.test(r)) return '4K UHD'
  if (/Full HD/i.test(r) || /1080/i.test(r)) return 'Full HD'
  if (/\bHD\b/i.test(r)) return 'HD'
  return null
}

function technologyOf(specs) {
  const t = (specs['Технология'] || '').toLowerCase()
  if (/oled/i.test(t)) return 'OLED'
  if (/qled/i.test(t)) return 'QLED'
  if (/nanocell/i.test(t)) return 'NanoCell'
  if (/mini.?led/i.test(t)) return 'Mini-LED'
  return 'LED'
}

function numOf(specs, key) {
  const m = (specs[key] || '').match(/(\d+)/)
  return m ? parseInt(m[1], 10) : null
}

const login = await req('POST', '/auth/login', null, { email: 'admin@tvspace.ru', password: 'admin123' })
const token = login.token
const cats = await req('GET', '/categories')
const tv = cats.find((c) => c.slug === 'televizory')
if (!tv) { console.log('Категория не найдена'); process.exit(1) }

const existing = (await req('GET', '/admin/products?size=2000', token)).items || []
const existingNames = new Set(existing.map((p) => p.name))

const toAdd = []
const seen = new Set()
for (const it of data) {
  if (!it.brand || !it.price || it.error) continue
  const name = it.name
  if (seen.has(name) || existingNames.has(name)) continue
  seen.add(name)
  toAdd.push(it)
}
console.log(`К добавлению: ${toAdd.length} (из ${data.length})`)

let ok = 0
let fail = 0
let idx = 0
const CONC = 8
async function worker() {
  while (idx < toAdd.length) {
    const it = toAdd[idx++]
    const specs = it.specs || {}
    const model = it.name.replace(new RegExp('^Телевизор ' + it.brand + '\\s*', 'i'), '')
    const img = `https://placehold.co/600x400/111827/f9fafb?text=${encodeURIComponent(it.brand + ' ' + model)}`
    const specList = Object.entries(specs).map(([name, value]) => ({ name, value: truncate(String(value), 240) }))
    const desc = `${it.name} — ${specs['Диагональ'] || ''}, ${specs['Разрешение экрана'] || ''}, технология ${specs['Технология'] || ''}. Официальная гарантия производителя.`
    const payload = {
      name: it.name,
      description: desc,
      price: it.price,
      oldPrice: it.oldPrice && it.oldPrice > it.price ? it.oldPrice : null,
      imageUrl: img,
      brand: it.brand,
      screenSizeInches: numOf(specs, 'Диагональ'),
      resolution: resolutionOf(specs),
      smartTv: /Smart TV/i.test(specs['Основные функции'] || ''),
      technology: technologyOf(specs),
      refreshRateHz: numOf(specs, 'Частота обновления кадров') || numOf(specs, 'Частота обновления'),
      os: specs['Операционная система'] || null,
      stock: 5,
      active: true,
      categoryId: tv.id,
      specifications: specList,
      images: [img],
    }
    try {
      await req('POST', '/admin/products', token, payload)
      ok++
    } catch (e) {
      fail++
      if (fail <= 12) console.log('  FAIL', it.name, '-', e.message.slice(0, 110))
    }
  }
}
await Promise.all(Array.from({ length: CONC }, worker))
console.log(`ГОТОВО: добавлено ${ok}, ошибок ${fail}`)
