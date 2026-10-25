const BASE = 'http://localhost:8080/api'

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  return res.json()
}

// Характеристики товара
const tv = await get('/products/samsung-qe55q60c')
console.log('TV:', tv.name)
console.log('  технология=', tv.technology, '| 60Гц=', tv.refreshRateHz, '| HDR=', tv.hdr, '| ОС=', tv.os)

const audio = await get('/products/samsung-hw-b550')
console.log('AUDIO:', audio.name, '| мощность=', audio.powerOutputW, 'Вт | каналы=', audio.channels)

const proj = await get('/products/hisense-c1-4k')
console.log('PROJ:', proj.name, '| поток=', proj.luminousFluxLm, 'лм | контраст=', proj.contrast, '| разрешение=', proj.resolution)

// Фильтры
const cases = [
  ['ТВ brand=Samsung', '/products?category=televizory&brand=Samsung'],
  ['ТВ technology=OLED', '/products?category=televizory&technology=OLED'],
  ['ТВ screenSize=65', '/products?category=televizory&screenSize=65'],
  ['ТВ цена 50–100 тыс', '/products?category=televizory&priceMin=50000&priceMax=100000'],
  ['Аудио channels=2.1', '/products?category=audio-sistemy&channels=2.1'],
  ['Аудио мощность ≥300 Вт', '/products?category=audio-sistemy&powerOutputMin=300'],
  ['Проектор 4K UHD', `/products?category=proektory&resolution=${encodeURIComponent('4K UHD')}`],
  ['Проектор поток ≥2000 лм', '/products?category=proektory&luminousFluxMin=2000'],
]

console.log('\n--- Фильтры ---')
for (const [label, path] of cases) {
  const d = await get(path)
  console.log(`${label}: ${d.total} → ${(d.items || []).map((p) => p.name).join(' | ')}`)
}
