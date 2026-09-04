export const CUT_MIN_MINUTES = 1
export const CUT_MAX_MINUTES = 5
export const DEFAULT_CUT_MINUTES = 1
export const SECONDS_PER_MINUTE = 60

export function clampCutMinutes(value) {
  const minutes = Math.round(Number(value) || DEFAULT_CUT_MINUTES)
  return Math.min(CUT_MAX_MINUTES, Math.max(CUT_MIN_MINUTES, minutes))
}

export function cutMinutesToSeconds(value) {
  return clampCutMinutes(value) * SECONDS_PER_MINUTE
}

export const TIKTOK_ASPECT_RATIO = '9:16'
export const TIKTOK_WIDTH = 9
export const TIKTOK_HEIGHT = 16
export const TIKTOK_OUTPUT_WIDTH = 1080
export const TIKTOK_OUTPUT_HEIGHT = 1920

export const DEFAULT_POST_INTERVAL_MINUTES = 4
export const MIN_POST_INTERVAL_MINUTES = 1
export const MAX_POST_INTERVAL_MINUTES = 60

export const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
]

export const ACCEPTED_VIDEO_EXTENSIONS = '.mp4,.webm,.mov,.mkv'

export const CUT_STATUS = {
  DRAFT: 'draft',
  PROCESSING: 'processing',
  READY: 'ready',
  QUEUED: 'queued',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
}

export const CUT_STATUS_LABEL = {
  [CUT_STATUS.DRAFT]: 'Rascunho',
  [CUT_STATUS.PROCESSING]: 'Gerando',
  [CUT_STATUS.READY]: 'Pronto',
  [CUT_STATUS.QUEUED]: 'Na fila',
  [CUT_STATUS.SCHEDULED]: 'Agendado',
  [CUT_STATUS.PUBLISHED]: 'Publicado',
}

export const SOURCE_TYPE = {
  FILE: 'file',
  YOUTUBE: 'youtube',
}
