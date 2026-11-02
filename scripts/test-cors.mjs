import https from 'node:https'

function raw(origin) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        host: 'tvshop.onrender.com',
        port: 443,
        path: '/api/categories',
        method: 'GET',
        headers: { Origin: origin },
      },
      (res) => {
        let body = ''
        res.on('data', (c) => (body += c))
        res.on('end', () => {
          console.log(
            'Origin', origin,
            '-> status', res.statusCode,
            '| allow-origin:', res.headers['access-control-allow-origin'],
          )
          resolve()
        })
      },
    )
    req.on('error', (e) => {
      console.log('Origin', origin, '-> ERR', e.message)
      resolve()
    })
    req.end()
  })
}

await raw('https://tvspace-shop.netlify.app')
await raw('http://localhost:5173')
