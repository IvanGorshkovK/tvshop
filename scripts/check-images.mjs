const candidates = {
  tv: [
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=900&q=80',
    'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=900&q=80',
    'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=900&q=80',
    'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=900&q=80',
    'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=900&q=80',
  ],
  audio: [
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=900&q=80',
    'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=900&q=80',
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&q=80',
    'https://images.unsplash.com/photo-1610018556010-6a11691bc905?w=900&q=80',
  ],
  proj: [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&q=80',
    'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=900&q=80',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=900&q=80',
  ],
}

for (const [key, urls] of Object.entries(candidates)) {
  for (const u of urls) {
    try {
      const r = await fetch(u, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } })
      const ct = r.headers.get('content-type') || ''
      console.log(key, r.status, ct.slice(0, 30), u)
    } catch (e) {
      console.log(key, 'ERR', e.message, u)
    }
  }
}
