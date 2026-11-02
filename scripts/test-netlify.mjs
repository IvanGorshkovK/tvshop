const url = process.argv[2] || 'https://tvspace-shop.netlify.app/'
const c = new AbortController()
setTimeout(() => c.abort(), 30000)
try {
  const r = await fetch(url, { signal: c.signal })
  const t = await r.text()
  const m = t.match(/<title>([^<]*)<\/title>/)
  console.log('FRONT STATUS', r.status, '| title:', m ? m[1] : '(нет)', '| len', t.length)
} catch (e) {
  console.log('FRONT ERR', e.name, e.message)
}
