import fs from 'node:fs'

const BASE = 'http://localhost:8080/api'
const urls = JSON.parse(fs.readFileSync('citilink-lg-urls.json', 'utf8'))

const SPEC_NAMES = ['Экран', 'Частота обновления', 'Тип подсветки', 'Тюнеры', 'Технологии', 'Операционная система', 'Размер VESA']

async function req(method, path, token, body) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined })
  const text = await res.text()
  let data = null
  try { data = JSON.parse(text) } catch {}
  if (!res.ok) throw new Error(`${res.status}: ${text.slice(0, 160)}`)
  return data
}

async function fetchSpecs(url) {
  const propsUrl = url.replace(/\/$/, '') + '/properties/'
  const res = await fetch(propsUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) return null
  const html = await res.text()
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const specs = {}
  for (let i = 0; i < SPEC_NAMES.length; i++) {
    const name = SPEC_NAMES[i]
    const next = SPEC_NAMES[i + 1]
    const re = next
      ? new RegExp(name + '\\s*:\\s*([\\s\\S]*?)(?=' + next + '\\s*:|$)')
      : new RegExp(name + '\\s*:\\s*([\\s\\S]*?)(?=Все характеристики|Все услуги|Все телевизоры|$)')
    const m = text.match(re)
    if (m && m[1].trim()) {
      let val = m[1].trim()
      if (val.length > 200) val = val.slice(0, 200)
      specs[name] = val
    }
  }
  return specs
}

const login = await req('POST', '/auth/login', null, { email: 'admin@tvspace.ru', password: 'admin123' })
const token = login.token

const all = await req('GET', '/admin/products?size=1000', token)
const byName = new Map()
for (const p of all.items || []) byName.set(p.name, p)

const DRY = process.argv.includes('--dry')

let ok = 0
let fail = 0
let processed = 0
for (const entry of urls) {
  const model = entry.model.replace(/\.ARU[GB]?$/i, '')
  const name = `Телевизор LG ${model}`
  const product = byName.get(name)
  if (!product) {
    fail++
    console.log('  НЕТ В БД:', name)
    continue
  }
  processed++
  let specs
  try {
    specs = await fetchSpecs(entry.url)
  } catch (e) {
    specs = null
  }
  if (!specs || Object.keys(specs).length === 0) {
    fail++
    console.log('  НЕТ ХАРАКТЕРИСТИК:', name)
    continue
  }

  const existingColor = Object.entries(product.specifications || {}).find(([k]) => k.toLowerCase() === 'цвет')
  const specList = []
  if (existingColor) specList.push({ name: existingColor[0], value: existingColor[1] })
  for (const [k, v] of Object.entries(specs)) specList.push({ name: k, value: v })

  let refreshRateHz = product.refreshRateHz
  const hz = (specs['Частота обновления'] || '').match(/(\d+)/)
  if (hz) refreshRateHz = parseInt(hz[1], 10)

  let hdr = product.hdr
  if (/HDR/i.test(specs['Технологии'] || '')) hdr = hdr || 'HDR'

  if (DRY) {
    console.log('DRY', name, '->', Object.keys(specs).length, 'характеристик')
    ok++
    continue
  }

  const payload = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    oldPrice: product.oldPrice,
    imageUrl: product.imageUrl,
    brand: product.brand,
    screenSizeInches: product.screenSizeInches,
    resolution: product.resolution,
    smartTv: product.smartTv,
    technology: product.technology,
    refreshRateHz,
    hdr,
    os: product.os,
    powerOutputW: product.powerOutputW,
    channels: product.channels,
    luminousFluxLm: product.luminousFluxLm,
    contrast: product.contrast,
    stock: product.stock,
    active: product.active,
    categoryId: product.categoryId,
    specifications: specList,
    images: product.images || [],
  }
  try {
    await req('PUT', `/admin/products/${product.id}`, token, payload)
    ok++
  } catch (e) {
    fail++
    console.log('  FAIL', name, '-', e.message.slice(0, 140))
  }
}
console.log(`ГОТОВО: обработано ${processed}, обновлено ${ok}, ошибок ${fail}`)
