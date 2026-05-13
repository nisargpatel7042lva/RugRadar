export function formatAge(ageMs) {
  if (ageMs == null) return '—'
  const mins = Math.floor(ageMs / 60000)
  if (mins < 1) return '<1m'
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function formatDollar(val) {
  if (val == null || val === 0) return '$0'
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`
  if (val >= 1e3) return `$${(val / 1e3).toFixed(1)}K`
  return `$${Number(val).toFixed(0)}`
}

export function truncateAddr(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

export function formatPercent(val) {
  if (val == null) return '—'
  return `${(val * 100).toFixed(1)}%`
}

export function formatPrice(val) {
  if (val == null) return '—'
  if (val < 0.000001) return `$${val.toExponential(2)}`
  if (val < 0.01) return `$${val.toFixed(6)}`
  if (val < 1) return `$${val.toFixed(4)}`
  return `$${val.toFixed(2)}`
}
