const url = process.argv[2] || 'https://matches-schema-rolled-distinct.trycloudflare.com/'
try {
  const r = await fetch(url)
  const t = await r.text()
  const m = t.match(/<title>([^<]*)<\/title>/)
  console.log('STATUS', r.status, '| title:', m ? m[1] : '(нет)')
} catch (e) {
  console.log('ERR', e.message)
}
