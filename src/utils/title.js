const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|mkv|avi|m4v)$/i
const UNSAFE_FILE_CHARS = /[<>:"/\\|?*]/g

export function cleanSourceTitle(value) {
  return String(value || '')
    .trim()
    .replace(VIDEO_EXTENSIONS, '')
    .trim()
}

export function buildCutTitle(sourceTitle, index, total) {
  const base = cleanSourceTitle(sourceTitle) || 'Corte'
  return `${base} ${index}/${total}`
}

export function toDownloadFileName(title) {
  const safe = String(title || 'corte')
    .replace(/\//g, '-')
    .replace(UNSAFE_FILE_CHARS, '')
    .replace(/\s+/g, ' ')
    .trim()

  return `${safe || 'corte'}.mp4`
}
