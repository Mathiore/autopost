import { OUTPUT_HEIGHT, OUTPUT_WIDTH } from '@/constants/editor'

const SIZE_SCALE = {
  small: 0.032,
  medium: 0.044,
  large: 0.058,
}

function fontSizeFor(height, size) {
  return Math.round(height * (SIZE_SCALE[size] || SIZE_SCALE.medium))
}

function wrapLines(ctx, text, maxWidth) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean)
  if (!words.length) return []

  const lines = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (current && ctx.measureText(next).width > maxWidth) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current) lines.push(current)
  return lines
}

function yForPosition(position, height, blockHeight) {
  const margin = height * 0.12
  if (position === 'top') return margin
  if (position === 'center') return Math.max(margin, (height - blockHeight) / 2)
  return Math.max(margin, height - margin - blockHeight)
}

function drawSubtitle(ctx, { text, width, height, size, position }) {
  const fontSize = fontSizeFor(height, size)
  ctx.save()
  ctx.font = `700 ${fontSize}px Sora, Manrope, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = Math.max(4, Math.round(fontSize * 0.16))
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2

  const lines = wrapLines(ctx, text, width * 0.82)
  const lineHeight = fontSize * 1.22
  const blockHeight = lines.length * lineHeight
  let y = yForPosition(position, height, blockHeight)
  const x = width / 2

  for (const line of lines) {
    ctx.strokeText(line, x, y)
    ctx.fillText(line, x, y)
    y += lineHeight
  }

  ctx.restore()
}

async function canvasToPngBytes(canvas) {
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((next) => {
      if (next) resolve(next)
      else reject(new Error('subtitle-render-failed'))
    }, 'image/png')
  })

  return new Uint8Array(await blob.arrayBuffer())
}

/**
 * Renders subtitle segments onto transparent PNGs so FFmpeg can burn them in.
 * The renderer only understands segments, never a raw string.
 *
 * @param {import('@/types/video').SubtitleSegment[]} segments
 * @param {{ width?: number, height?: number, size?: string, position?: string }} [options]
 */
export async function renderSubtitleOverlays(segments, options = {}) {
  const width = options.width || OUTPUT_WIDTH
  const height = options.height || OUTPUT_HEIGHT
  const size = options.size || 'medium'
  const position = options.position || 'bottom'

  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  const overlays = []

  for (const segment of segments || []) {
    const text = String(segment?.text || '').trim()
    if (!text) continue

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) continue

    ctx.clearRect(0, 0, width, height)
    drawSubtitle(ctx, { text, width, height, size, position })

    overlays.push({
      start: Math.max(0, Number(segment.start) || 0),
      end: Math.max(0, Number(segment.end) || 0),
      bytes: await canvasToPngBytes(canvas),
    })
  }

  return overlays
}
