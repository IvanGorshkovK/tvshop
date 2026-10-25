const SPEC_NAMES = ['Экран', 'Частота обновления', 'Тип подсветки', 'Тюнеры', 'Технологии', 'Операционная система', 'Размер VESA']

const url = 'https://www.citilink.ru/product/televizor-led-lg-86-86mrgb96b6b-arug-smart-chernyi-4k-ultra-hd-120hz-2207502/'
// возьмём реальный URL из списка
import fs from 'node:fs'
const urls = JSON.parse(fs.readFileSync('citilink-lg-urls.json', 'utf8'))
const entry = urls.find((u) => u.model.startsWith('86MRGB96B6B'))
const u = entry ? entry.url : url
console.log('URL:', u)

const res = await fetch(u.replace(/\/$/, '') + '/properties/', { headers: { 'User-Agent': 'Mozilla/5.0' } })
const html = await res.text()
const text = html.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

console.log('text length:', text.length)
for (let i = 0; i < SPEC_NAMES.length; i++) {
  const name = SPEC_NAMES[i]
  const next = SPEC_NAMES[i + 1]
  const re = next ? new RegExp(name + '\\s*:\\s*([\\s\\S]*?)(?=' + next + '\\s*:|$)') : new RegExp(name + '\\s*:\\s*([\\s\\S]*?)$')
  const m = text.match(re)
  const val = m ? m[1].trim() : '(нет)'
  console.log(`[${name}] len=${val.length} => ${val.slice(0, 120)}`)
}
