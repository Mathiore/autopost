import { MAX_CLIP_DURATION } from '@/constants/editor'

export function validateClipTimes({ startTime, endTime, videoDuration }) {
  const start = Number(startTime)
  const end = Number(endTime)
  const duration = Number(videoDuration)

  if (!Number.isFinite(start) || start < 0) {
    return 'Informe um tempo inicial válido.'
  }

  if (!Number.isFinite(end) || end < 0) {
    return 'Informe um tempo final válido.'
  }

  if (end <= start) {
    return 'O tempo final precisa ser maior que o tempo inicial.'
  }

  if (Number.isFinite(duration) && duration > 0 && end > duration + 0.05) {
    return 'O tempo final não pode passar da duração do vídeo.'
  }

  if (end - start > MAX_CLIP_DURATION) {
    return 'Este corte excede o limite permitido.'
  }

  return ''
}

export function canGenerateClip({ hasVideo, startTime, endTime, videoDuration, isProcessing }) {
  if (!hasVideo || isProcessing) return false
  return !validateClipTimes({ startTime, endTime, videoDuration })
}
