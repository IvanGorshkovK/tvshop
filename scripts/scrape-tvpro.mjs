import fs from 'node:fs'

const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
const BASE = 'https://televizory.pro'
const LIMIT = parseInt(process.argv[2] || '1000', 10)

async function get(url) {
  const r = await fetch(url, { headers: UA })
  if (!r.ok) throw new Error('HTTP ' + r.status)
  return r.text()
}

// --- Phase 1: каталог (собрать ссылки + названия) ---
const seen = new Set()
const items = []
for (let p = 1; p <= 16; p++) {
  const url = `${BASE}/katalog-televizorov/?arrFilter_P1_MIN=&arrFilter_P1_MAX=&arrFilter_20_3076719002=Y&arrFilter_20_3421137111=Y&arrFilter_20_3994858278=Y&arrFilter_20_36358138=Y&set_filter=%D0%9F%D0%BE%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D1%8C&PAGEN_1=${p}`
  const html = await get(url)
  const re = /<a[^>]+class="img_wrapper"[^>]+href="([^"]+)"[^>]+title="([^"]+)"/g
  let m
  while ((m = re.exec(html))) {
    if (!seen.has(m[1])) {
      seen.add(m[1])
      items.push({ href: m[1], name: m[2] })
    }
  }
}
console.log('catalog items:', items.length)

// --- Phase 2: страницы товаров ---
function parseSpecs(html) {
  const specs = {}
  const re = /<span class="name">([^<]+)<\/span>[\s\S]*?<span class="val">([^<]+)<\/span>/g
  let m
  while ((m = re.exec(html))) {
    const n = m[1].trim()
    const v = m[2].replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim()
    if (n) specs[n] = v
  }
  return specs
}

function parsePrice(html) {
  const grab = (cls) => {
    const m = html.match(new RegExp('<[^>]+class="[^"]*' + cls + '[^"]*"[^>]*>([\\s\\S]*?)</[^>]+>'))
    if (!m) return null
    const t = m[1].replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, ' ')
    const pm = t.match(/(\d[\d\s]{3,})\s*р\./)
    return pm ? parseInt(pm[1].replace(/\s/g, ''), 10) : null
  }
  return { price: grab('cur_price'), oldPrice: grab('old_price') }
}

const slice = items.slice(0, LIMIT)
const out = new Array(slice.length)
let idx = 0
const CONC = 12

async function worker() {
  while (true) {
    const i = idx++
    if (i >= slice.length) break
    const it = slice[i]
    try {
      const html = await get(BASE + it.href)
      const specs = parseSpecs(html)
      const { price, oldPrice } = parsePrice(html)
      const brand = (it.name.match(/Телевизор\s+([A-Za-z]+)/i) || [])[1] || null
      out[i] = { ...it, brand, price, oldPrice, specs }
    } catch (e) {
      out[i] = { ...it, error: e.message }
    }
  }
}
await Promise.all(Array.from({ length: CONC }, worker))

const final = out.filter(Boolean)
fs.writeFileSync('tvpro-products.json', JSON.stringify(final, null, 0))
console.log('done:', final.length)
if (final[0]) {
  console.log('SAMPLE name:', final[0].name, '| brand:', final[0].brand, '| price:', final[0].oldPrice, '->', final[0].price)
  console.log('SAMPLE specs:', JSON.stringify(final[0].specs).slice(0, 500))
}
