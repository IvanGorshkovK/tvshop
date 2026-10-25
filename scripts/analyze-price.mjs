const t = await (await fetch('https://televizory.pro/product-televizor-samsung-ue98u9000huxpy-2026/', { headers: { 'User-Agent': 'Mozilla/5.0' } })).text()

// найдём элементы с классом cur_price и price_wrapper
for (const cls of ['cur_price', 'price_wrapper', 'price']) {
  const re = new RegExp('<[^>]+class="[^"]*' + cls + '[^"]*"[^>]*>([\\s\\S]*?)</', 'g')
  const m = [...t.matchAll(re)].map((x) => x[1].replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean)
  console.log(cls, '=>', m.slice(0, 6))
}
