import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { dirname } from 'node:path';
import { mkdir, stat } from 'node:fs/promises';

const [url, out] = process.argv.slice(2);
if (!url || !out) {
  console.error('usage: node download.mjs <url> <out>');
  process.exit(2);
}

await mkdir(dirname(out), { recursive: true });

console.log(`GET ${url}`);
const res = await fetch(url, { redirect: 'follow' });
if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

const total = Number(res.headers.get('content-length')) || 0;
let done = 0;
const body = Readable.fromWeb(res.body);
body.on('data', (c) => {
  done += c.length;
  if (total) process.stderr.write(`\r  ${(done / 1048576).toFixed(1)} / ${(total / 1048576).toFixed(1)} MB`);
});

await pipeline(body, createWriteStream(out));

const s = await stat(out);
console.log(`\nDONE ${out} (${(s.size / 1048576).toFixed(1)} MB)`);
