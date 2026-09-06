export const OUTPUT_WIDTH = 720
export const OUTPUT_HEIGHT = 1280
export const OUTPUT_ASPECT_RATIO = '9:16'

export const MAX_CLIP_DURATION = 90
export const DEFAULT_CLIP_DURATION = 15

export const EDITOR_ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm']
export const EDITOR_ACCEPTED_VIDEO_EXTENSIONS = '.mp4,.webm'

export const CLIP_STATUS = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  READY: 'ready',
  ERROR: 'error',
}

export const CLIP_STATUS_LABEL = {
  [CLIP_STATUS.IDLE]: 'Aguardando',
  [CLIP_STATUS.PROCESSING]: 'Processando...',
  [CLIP_STATUS.READY]: 'Concluído',
  [CLIP_STATUS.ERROR]: 'Erro',
}

export const SUBTITLE_SIZES = [
  { id: 'small', label: 'Pequeno' },
  { id: 'medium', label: 'Médio' },
  { id: 'large', label: 'Grande' },
]

export const SUBTITLE_POSITIONS = [
  { id: 'top', label: 'Superior' },
  { id: 'center', label: 'Centro' },
  { id: 'bottom', label: 'Inferior' },
]
