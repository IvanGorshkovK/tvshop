const tv = [
  'photo-1593359677879-a4bb92f829d1',
  'photo-1522869635100-9f4c5e86aa37',
  'photo-1547658719-da2b51169166',
  'photo-1574375927938-d5a98e8ffe85',
  'photo-1593305841991-05c297ba4575',
  'photo-1567696911980-2eed69a46042',
  'photo-1558888401-3cc1de77652d',
  'photo-1585647347483-22b66260dfff',
  'photo-1593784991095-a205069470b6',
]
const hero = [
  'photo-1540221652346-e5dd6b96f312',
  'photo-1550745165-9bc0b252726f',
  'photo-1585647347483-22b66260dfff',
  'photo-1461151304267-38535e780c79',
  'photo-1517604931442-7e0c8ed2963c',
  'photo-1574375927938-d5a98e8ffe85',
  'photo-1593784991095-a205069470b6',
  'photo-1547658719-da2b51169166',
]

async function test(key, ids) {
  console.log('=== ' + key + ' ===')
  for (const id of ids) {
    const u = `https://images.unsplash.com/${id}?w=800&q=80`
    try {
      const r = await fetch(u, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } })
      if (r.status === 200) console.log('OK  ', id)
      else console.log('skip', r.status, id)
    } catch (e) {
      console.log('ERR ', id)
    }
  }
}
await test('tv', tv)
await test('hero', hero)
