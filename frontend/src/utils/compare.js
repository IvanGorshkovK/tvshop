export function getCompare() {
  try {
    return JSON.parse(localStorage.getItem('cmp') || '[]')
  } catch {
    return []
  }
}

export function isCompared(id) {
  return getCompare().includes(id)
}

export function toggleCompare(id) {
  const list = getCompare()
  const has = list.includes(id)
  const next = has ? list.filter((x) => x !== id) : [...list, id]
  localStorage.setItem('cmp', JSON.stringify(next))
  window.dispatchEvent(new Event('cmp-changed'))
  return !has
}

export function removeCompare(id) {
  const next = getCompare().filter((x) => x !== id)
  localStorage.setItem('cmp', JSON.stringify(next))
  window.dispatchEvent(new Event('cmp-changed'))
  return next
}
