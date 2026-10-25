const BASE = 'http://localhost:8080/api'

const login = await (await fetch(`${BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@tvspace.ru', password: 'admin123' }),
})).json()

const r = await fetch(`${BASE}/admin/ai/description`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + login.token },
  body: JSON.stringify({
    name: 'Телевизор Samsung QE85QN990FUXRU',
    brand: 'Samsung',
    specs: 'диагональ 85", разрешение 8K UHD, технология Neo QLED, частота 120 Гц, Smart TV',
  }),
})

console.log('STATUS', r.status)
console.log((await r.text()).slice(0, 600))
