import { computed, ref } from 'vue'
import { EDITOR_ACCEPTED_VIDEO_TYPES } from '@/constants/editor'

function hasAcceptedExtension(file) {
  return /\.(mp4|webm)$/i.test(file?.name || '')
}

function isAcceptedVideo(file) {
  if (!file) return false
  if (EDITOR_ACCEPTED_VIDEO_TYPES.includes(file.type)) return true
  return !file.type && hasAcceptedExtension(file)
}

function readVideoDuration(objectUrl) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = objectUrl

    video.onloadedmetadata = () => {
      const duration = video.duration
      video.removeAttribute('src')
      video.load()

      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error('Não foi possível carregar o vídeo.'))
        return
      }

      resolve(duration)
    }

    video.onerror = () => {
      reject(new Error('Não foi possível carregar o vídeo.'))
    }
  })
}

export function useLocalVideo() {
  const file = ref(null)
  const objectUrl = ref('')
  const durationSeconds = ref(0)
  const error = ref('')
  const isLoading = ref(false)

  const hasVideo = computed(() => Boolean(file.value && objectUrl.value))

  function revokePreview() {
    if (objectUrl.value) {
      URL.revokeObjectURL(objectUrl.value)
      objectUrl.value = ''
    }
  }

  function reset() {
    revokePreview()
    file.value = null
    durationSeconds.value = 0
    error.value = ''
    isLoading.value = false
  }

  async function loadFile(nextFile) {
    if (!nextFile) return false

    if (!isAcceptedVideo(nextFile)) {
      error.value = 'Envie um vídeo em MP4 ou WebM.'
      return false
    }

    reset()
    isLoading.value = true
    const url = URL.createObjectURL(nextFile)

    try {
      const duration = await readVideoDuration(url)
      file.value = nextFile
      objectUrl.value = url
      durationSeconds.value = duration
      error.value = ''
      return true
    } catch (loadError) {
      URL.revokeObjectURL(url)
      error.value = loadError.message || 'Não foi possível carregar o vídeo.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    file,
    objectUrl,
    durationSeconds,
    error,
    isLoading,
    hasVideo,
    loadFile,
    reset,
  }
}
