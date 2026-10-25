const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }

const catUrl = 'https://televizory.pro/katalog-televizorov/?arrFilter_P1_MIN=&arrFilter_P1_MAX=&arrFilter_20_3076719002=Y&arrFilter_20_3421137111=Y&arrFilter_20_3994858278=Y&arrFilter_20_36358138=Y&set_filter=%D0%9F%D0%BE%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D1%8C'
const prodUrl = 'https://televizory.pro/product-televizor-samsung-ue98u9000huxpy-2026/'

const c = await fetch(catUrl, { headers: UA })
const ct = await c.text()
console.log('CATALOG:', c.status, 'len', ct.length, '| product links:', (ct.match(/product-televizor-/g) || []).length)

const p = await fetch(prodUrl, { headers: UA })
const pt = await p.text()
console.log('PRODUCT:', p.status, 'len', pt.length)
const hi = pt.indexOf('Характеристики')
console.log('Характеристики at:', hi)
if (hi >= 0) console.log('sample:', pt.slice(hi, hi + 400).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 300))
