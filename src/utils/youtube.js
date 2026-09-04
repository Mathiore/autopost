const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/watch\?.*\bv=([a-zA-Z0-9_-]{11})/,
]

export function extractYouTubeId(url) {
  const value = String(url || '').trim()
  if (!value) return null

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = pattern.exec(value)
    if (match?.[1]) return match[1]
  }

  return null
}

export function isValidYouTubeUrl(url) {
  return Boolean(extractYouTubeId(url))
}

export function getYouTubeThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export function getYouTubeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`
}
