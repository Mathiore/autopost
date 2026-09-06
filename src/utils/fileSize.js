export function formatFileSize(bytes) {
  const size = Math.max(0, Number(bytes) || 0)

  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} KB`
  }

  const megaBytes = size / (1024 * 1024)
  if (megaBytes < 10) {
    return `${megaBytes.toFixed(1)} MB`
  }

  return `${Math.round(megaBytes)} MB`
}
