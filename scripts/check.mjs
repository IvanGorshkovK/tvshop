import net from 'node:net'

function tcp(port) {
  return new Promise((r) => {
    const s = net.connect(port, 'localhost', () => { s.destroy(); r(true) })
    s.on('error', () => r(false))
    s.setTimeout(2000, () => { s.destroy(); r(false) })
  })
}

const db = await tcp(5432)
console.log('POSTGRES_5432:', db ? 'UP' : 'DOWN')

try {
  const r = await fetch('http://localhost:8080/api/categories')
  console.log('BACKEND_8080:', r.status)
} catch {
  console.log('BACKEND_8080: DOWN')
}

try {
  const r = await fetch('http://localhost:5173/')
  console.log('FRONTEND_5173:', r.status)
} catch {
  console.log('FRONTEND_5173: DOWN')
}
