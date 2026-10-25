const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }

// 1) структура карточки в каталоге
const cat = await (await fetch('https://televizory.pro/katalog-televizorov/?arrFilter_P1_MIN=&arrFilter_P1_MAX=&arrFilter_20_3076719002=Y&arrFilter_20_3421137111=Y&arrFilter_20_3994858278=Y&arrFilter_20_36358138=Y&set_filter=%D0%9F%D0%BE%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D1%8C', { headers: UA })).text()
const i = cat.indexOf('product-televizor')
console.log('=== CATALOG around first product link ===')
console.log(cat.slice(i - 700, i + 300).replace(/\s+/g, ' ').slice(0, 900))

// 2) структура характеристик
const p = await (await fetch('https://televizory.pro/product-televizor-samsung-ue98u9000huxpy-2026/', { headers: UA })).text()
const hi = p.indexOf('Характеристики')
console.log('\n=== PRODUCT Характеристики HTML ===')
console.log(p.slice(hi, hi + 2500).replace(/\s+/g, ' ').slice(0, 2000))
