import { createRequire } from 'node:module'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const { parse } = require('C:/Users/Иван/Desktop/AIGHS/frontend/node_modules/.pnpm/@babel+parser@7.29.9/node_modules/@babel/parser')

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

const files = walk(SRC).sort()
let errors = 0
for (const f of files) {
  const code = readFileSync(f, 'utf8')
  const rel = f.replace('C:/Users/Иван/Desktop/AIGHS/frontend/', '')
  try {
    parse(code, { sourceType: 'module', plugins: ['jsx'] })
    console.log('OK   ', rel)
  } catch (e) {
    errors++
    console.log('FAIL ', rel, '→', String(e.message).split('\n')[0])
  }
}
console.log(`\nChecked ${files.length} files, syntax errors: ${errors}`)
process.exit(errors ? 1 : 0)
