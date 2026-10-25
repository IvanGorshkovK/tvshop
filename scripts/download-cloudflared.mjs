import fs from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'

const url = 'https://github.com/cloudflare/cloudflared/releases/download/2026.10.3/cloudflared-windows-amd64.exe'
fs.mkdirSync('.tools', { recursive: true })
const r = await fetch(url, { redirect: 'follow' })
if (!r.ok || !r.body) {
  console.log('download failed:', r.status)
  process.exit(1)
}
const ws = fs.createWriteStream('.tools/cloudflared.exe')
await pipeline(Readable.fromWeb(r.body), ws)
console.log('OK, скачано ->', '.tools/cloudflared.exe', '(', (await fs.promises.stat('.tools/cloudflared.exe')).size, 'байт)')
