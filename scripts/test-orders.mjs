const BASE = 'http://localhost:8080/api'

const login = await (await fetch(`${BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@tvspace.ru', password: 'admin123' }),
})).json()

for (const path of ['/admin/orders', '/admin/orders?status=NEW']) {
  const r = await fetch(`${BASE}${path}`, { headers: { Authorization: 'Bearer ' + login.token } })
  const t = await r.text()
  console.log(path, '->', r.status, '|', t.slice(0, 300))
}
