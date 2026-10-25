import fs from 'node:fs'

const BASE = 'http://localhost:8080/api'
const data = JSON.parse(fs.readFileSync('technopark-tvs.json', 'utf8'))
const items = data.items || []

async function req(method, path, token, body) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined })
  const text = await res.text()
  let d = null
  try { d = JSON.parse(text) } catch {}
  if (!res.ok) throw new Error(`${res.status}: ${text.slice(0, 160)}`)
  return d
}

function parse(t) {
  const nm = t.match(/Телевизор\s+([A-Za-z]+)\s+([A-Z0-9]+)/i)
  const brand = nm ? nm[1] : null
  const model = nm ? nm[2] : null
  const code = (t.match(/Код:\s*(\d+)/) || [])[1]
  const diag = parseInt((t.match(/Диагональ экрана\s*(\d+)/) || [])[1], 10) || null
  const type = (t.match(/Тип\s+(.+?)(?=\s+Диагональ)/) || [])[1] || null
  const resolution = (t.match(/Разрешение экрана\s+(.+?)(?=\s+Частота)/) || [])[1] || null
  const refresh = parseInt((t.match(/Частота обновления экрана\s*(\d+)/) || [])[1], 10) || null
  const smart = /Smart TV\s*есть/i.test(t)
  const prices = [...t.matchAll(/([\d\s]+)\s*₽(?!\/мес)/g)].map((m) => parseInt(m[1].replace(/\s/g, ''), 10))
  const price = prices.length ? prices[prices.length - 1] : null
  const oldPrice = prices.length >= 2 ? prices[0] : null
  return { brand, model, code, diag, type, resolution, refresh, smart, price, oldPrice }
}

function desc(p) {
  let s = `Телевизор ${p.brand} ${p.model} с диагональю ${p.diag}" и разрешением ${p.resolution}.`
  if (p.type) s += ` Технология — ${p.type}.`
  if (p.refresh) s += ` Частота обновления ${p.refresh} Гц.`
  s += ' Поддержка Smart TV открывает доступ к онлайн-кинотеатрам и приложениям. Официальная гарантия производителя.'
  return s
}

const login = await req('POST', '/auth/login', null, { email: 'admin@tvspace.ru', password: 'admin123' })
const token = login.token
const cats = await req('GET', '/categories')
const tv = cats.find((c) => c.slug === 'televizory')
if (!tv) { console.log('Категория не найдена'); process.exit(1) }

const existing = (await req('GET', '/admin/products?size=1000', token)).items || []
const existingNames = new Set(existing.map((p) => p.name))

let ok = 0
let skip = 0
let fail = 0
for (const raw of items) {
  const p = parse(raw)
  if (!p.brand || !p.model || !p.price) { skip++; continue }
  const name = `Телевизор ${p.brand} ${p.model}`
  if (existingNames.has(name)) { skip++; console.log('  ПРОПУСК (уже есть):', name); continue }

  const img = `https://placehold.co/600x400/111827/f9fafb?text=${encodeURIComponent(p.brand + ' ' + p.model)}`
  const specList = []
  if (p.type) specList.push({ name: 'Тип', value: p.type })
  if (p.diag) specList.push({ name: 'Диагональ экрана', value: `${p.diag}"` })
  if (p.resolution) specList.push({ name: 'Разрешение экрана', value: p.resolution })
  if (p.refresh) specList.push({ name: 'Частота обновления экрана', value: `${p.refresh} Гц` })
  specList.push({ name: 'Smart TV', value: p.smart ? 'есть' : 'нет' })

  const payload = {
    name,
    description: desc(p),
    price: p.price,
    oldPrice: p.oldPrice && p.oldPrice > p.price ? p.oldPrice : null,
    imageUrl: img,
    brand: p.brand,
    screenSizeInches: p.diag,
    resolution: p.resolution,
    smartTv: p.smart,
    technology: p.type,
    refreshRateHz: p.refresh,
    os: null,
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
    console.log('  FAIL', name, '-', e.message.slice(0, 140))
  }
}
console.log(`ГОТОВО: добавлено ${ok}, пропущено ${skip}, ошибок ${fail}`)
