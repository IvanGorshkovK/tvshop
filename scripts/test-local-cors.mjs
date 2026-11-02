import http from 'node:http'

function local(origin) {
  return new Promise((resolve) => {
    const req = http.request(
      { host: '127.0.0.1', port: 8080, path: '/api/categories', method: 'GET', headers: { Origin: origin } },
      (res) => {
        res.resume()
        res.on('end', () => {
          console.log('LOCAL Origin', origin, '->', res.statusCode, '| allow-origin:', res.headers['access-control-allow-origin'])
          resolve()
        })
      },
    )
    req.on('error', (e) => { console.log('LOCAL ERR', e.message); resolve() })
    req.end()
  })
}

await local('http://localhost:5173')
