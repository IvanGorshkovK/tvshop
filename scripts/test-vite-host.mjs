import http from 'node:http'

const req = http.request(
  { host: '127.0.0.1', port: 5173, path: '/', headers: { Host: 'from-ambassador-fare-cornwall.trycloudflare.com' } },
  (res) => {
    let body = ''
    res.on('data', (c) => (body += c))
    res.on('end', () => {
      console.log('STATUS', res.statusCode)
      console.log('BODY', body.slice(0, 300))
    })
  },
)
req.on('error', (e) => console.log('ERR', e.message))
req.end()
