export function padTime(value) {
  return String(value).padStart(2, '0')
}

export function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60

  if (hours > 0) {
    return `${hours}:${padTime(minutes)}:${padTime(seconds)}`
  }

  return `${minutes}:${padTime(seconds)}`
}

export function formatClock(date) {
  const instance = date instanceof Date ? date : new Date(date)
  return `${padTime(instance.getHours())}:${padTime(instance.getMinutes())}`
}

export function parseClock(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value || '').trim())
  if (!match) return null

  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null

  return { hours, minutes }
}

export function clockToDate(value, baseDate = new Date()) {
  const parsed = parseClock(value)
  if (!parsed) return null

  const date = new Date(baseDate)
  date.setSeconds(0, 0)
  date.setHours(parsed.hours, parsed.minutes, 0, 0)
  return date
}

export function addMinutes(date, minutes) {
  const next = new Date(date)
  next.setMinutes(next.getMinutes() + minutes)
  return next
}

export function parseFlexibleDuration(value) {
  const raw = String(value || '').trim()
  if (!raw) return null

  if (/^\d+$/.test(raw)) {
    return Number(raw)
  }

  const parts = raw.split(':').map((part) => Number(part))
  if (parts.some((part) => Number.isNaN(part) || part < 0)) return null

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }

  return null
}

export function todayClock(minutesAhead = 10) {
  return formatClock(addMinutes(new Date(), minutesAhead))
}
