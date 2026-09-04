export const CUT_MIN_SECONDS = 61
export const CUT_MAX_SECONDS = 65
export const FORBIDDEN_DURATION_SECONDS = 60

export const TIKTOK_ASPECT_RATIO = '9:16'
export const TIKTOK_WIDTH = 9
export const TIKTOK_HEIGHT = 16

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
  QUEUED: 'queued',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
}

export const CUT_STATUS_LABEL = {
  [CUT_STATUS.DRAFT]: 'Rascunho',
  [CUT_STATUS.QUEUED]: 'Na fila',
  [CUT_STATUS.SCHEDULED]: 'Agendado',
  [CUT_STATUS.PUBLISHED]: 'Publicado',
}

export const SOURCE_TYPE = {
  FILE: 'file',
  YOUTUBE: 'youtube',
}
