const url = process.argv[2] || 'https://www.citilink.ru/product/televizor-led-lg-43-43nu900b6la-aru-smart-chernyi-4k-ultra-hd-dvb-t-60-2207664/'
const t = await (await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text()

// ищем все вхождения "Характеристики" и смотрим, есть ли таблица после
const idxs = []
let i = -1
while ((i = t.indexOf('Характеристики', i + 1)) !== -1) idxs.push(i)
console.log('Характеристики at:', idxs)

// ищем spec-термины
const terms = ['Тип матрицы', 'HDR', 'Операционная система', 'Количество HDMI', 'Мощность звука', 'Разрешение экрана', 'Тип подсветки', 'Частота обновления', 'Smart TV', 'Вес', 'Диагональ экрана', 'Формат HDR']
for (const term of terms) {
  const j = t.indexOf(term)
  console.log(term.padEnd(24), '->', j)
}

// выведем кусок после второго вхождения "Характеристики" (таб), если есть контент
if (idxs.length >= 1) {
  const base = idxs[idxs.length - 1]
  const seg = t.slice(base, base + 4000)
  console.log('\n=== HTML around last "Характеристики" (text) ===')
  console.log(seg.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 1200))
}
