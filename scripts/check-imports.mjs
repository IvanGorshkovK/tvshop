import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'

const SRC = 'C:/Users/Иван/Desktop/AIGHS/frontend/src'

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) out.push(...walk(p))
    else if (/\.(jsx?|mjs)$/.test(name)) out.push(p)
  }
  return out
}

let errors = 0
let total = 0
for (const f of walk(SRC)) {
  const code = readFileSync(f, 'utf8')
  const re = /(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/g
  let m
  while ((m = re.exec(code))) {
    const spec = m[1]
    if (!spec.startsWith('.')) continue
    total++
    const base = resolve(dirname(f), spec)
    const candidates = [base, base + '.js', base + '.jsx', base + '.mjs', base + '/index.js', base + '/index.jsx']
    if (!candidates.some((c) => existsSync(c))) {
      errors++
      console.log('MISSING', f.replace('C:/Users/Иван/Desktop/AIGHS/frontend/', ''), '→', spec)
    }
  }
}
console.log(`\nRelative imports checked: ${total}, missing: ${errors}`)
process.exit(errors ? 1 : 0)
