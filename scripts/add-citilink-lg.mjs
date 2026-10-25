import fs from 'node:fs'

const BASE = 'http://localhost:8080/api'
const DATA = JSON.parse(fs.readFileSync('citilink-lg-tvs.json', 'utf8'))

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

function desc(p) {
  const c = p.color ? ` Цвет — ${p.color}.` : ''
  return `Телевизор LG ${p.model} с диагональю ${p.diag}" и разрешением ${p.resolution}. Технология экрана — ${p.technology}.${c} Смарт ТВ на платформе webOS. Официальная гарантия производителя.`
}

const login = await req('POST', '/auth/login', null, { email: 'admin@tvspace.ru', password: 'admin123' })
const token = login.token
const cats = await req('GET', '/categories')
const tv = cats.find((c) => c.slug === 'televizory')
if (!tv) { console.log('Категория televizory не найдена'); process.exit(1) }

const items = DATA.filter((p) => p.price && p.diag)
console.log(`Категория «${tv.name}» id=${tv.id} | на добавление: ${items.length}`)

let ok = 0
let fail = 0
for (const p of items) {
  const img = `https://placehold.co/600x400/111827/f9fafb?text=${encodeURIComponent('LG ' + p.model)}`
  const payload = {
    name: `Телевизор LG ${p.model}`,
    description: desc(p),
    price: p.price,
    oldPrice: p.oldPrice && p.oldPrice > p.price ? p.oldPrice : null,
    imageUrl: img,
    brand: 'LG',
    screenSizeInches: p.diag,
    resolution: p.resolution,
    smartTv: true,
    technology: p.technology,
    os: 'webOS',
    stock: 5,
    active: true,
    categoryId: tv.id,
    specifications: p.color ? [{ name: 'Цвет', value: p.color }] : [],
    images: [img],
  }
  try {
    await req('POST', '/admin/products', token, payload)
    ok++
  } catch (e) {
    fail++
    console.log('  FAIL', p.model, '-', e.message.slice(0, 120))
  }
}
console.log(`ГОТОВО: добавлено ${ok}, ошибок ${fail}`)
