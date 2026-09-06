import { CLIP_STATUS, DEFAULT_CLIP_DURATION, MAX_CLIP_DURATION } from '@/constants/editor'

/**
 * @typedef {'small' | 'medium' | 'large'} SubtitleSize
 * @typedef {'top' | 'center' | 'bottom'} SubtitlePosition
 * @typedef {'idle' | 'processing' | 'ready' | 'error'} ClipStatus
 *
 * @typedef {Object} SubtitleSegment
 * @property {number} start
 * @property {number} end
 * @property {string} text
 *
 * @typedef {Object} ClipSubtitle
 * @property {string} text
 * @property {SubtitleSegment[]} [segments]
 *
 * @typedef {Object} VideoClip
 * @property {string} id
 * @property {number} startTime
 * @property {number} endTime
 * @property {string} subtitle
 * @property {SubtitleSize} subtitleSize
 * @property {SubtitlePosition} subtitlePosition
 * @property {ClipStatus} status
 * @property {string} [outputUrl]
 * @property {number} [progress]
 * @property {string} [error]
 */

export function createClipId() {
  if (globalThis.crypto?.randomUUID) {
    return crypto.randomUUID()
  }
  return `clip-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/**
 * First-version helper: a typed subtitle becomes a single segment.
 * Later this can be replaced by speech-to-text timestamps.
 *
 * @param {string | ClipSubtitle | SubtitleSegment[] | null | undefined} subtitle
 * @param {number} clipDuration
 * @returns {SubtitleSegment[]}
 */
export function toSubtitleSegments(subtitle, clipDuration) {
  const duration = Math.max(0, Number(clipDuration) || 0)

  if (Array.isArray(subtitle)) {
    return subtitle
      .filter((segment) => segment && String(segment.text || '').trim())
      .map((segment) => ({
        start: Math.max(0, Number(segment.start) || 0),
        end: Math.max(0, Number(segment.end) || duration),
        text: String(segment.text).trim(),
      }))
  }

  if (subtitle && typeof subtitle === 'object') {
    if (Array.isArray(subtitle.segments) && subtitle.segments.length) {
      return toSubtitleSegments(subtitle.segments, duration)
    }
    return toSubtitleSegments(subtitle.text, duration)
  }

  const text = String(subtitle || '').trim()
  if (!text || duration <= 0) return []

  return [
    {
      start: 0,
      end: duration,
      text,
    },
  ]
}

/**
 * @param {Partial<VideoClip> & { videoDuration?: number }} [partial]
 * @returns {VideoClip}
 */
export function createVideoClip(partial = {}) {
  const videoDuration = Math.max(0, Number(partial.videoDuration) || 0)
  const startTime = Math.max(0, Number(partial.startTime) || 0)
  const fallbackEnd = startTime + DEFAULT_CLIP_DURATION
  const maxEnd = videoDuration > 0 ? Math.min(videoDuration, startTime + MAX_CLIP_DURATION) : fallbackEnd
  const endTime = Math.max(
    startTime,
    Number.isFinite(Number(partial.endTime)) ? Number(partial.endTime) : Math.min(fallbackEnd, maxEnd || fallbackEnd),
  )

  return {
    id: partial.id || createClipId(),
    startTime,
    endTime,
    subtitle: partial.subtitle || '',
    subtitleSize: partial.subtitleSize || 'medium',
    subtitlePosition: partial.subtitlePosition || 'bottom',
    status: partial.status || CLIP_STATUS.IDLE,
    outputUrl: partial.outputUrl || '',
    progress: Number(partial.progress) || 0,
    error: partial.error || '',
  }
}
