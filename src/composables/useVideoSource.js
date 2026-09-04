import { computed, reactive, ref } from 'vue'
import { ACCEPTED_VIDEO_TYPES, SOURCE_TYPE } from '@/constants/video'
import { cleanSourceTitle } from '@/utils/title'
import {
  extractYouTubeId,
  fetchYouTubeMeta,
  getYouTubeThumbnail,
  getYouTubeWatchUrl,
} from '@/utils/youtube'

function readVideoDuration(file, objectUrl) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = objectUrl

    video.onloadedmetadata = () => {
      const duration = video.duration
      video.removeAttribute('src')
      video.load()

      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error('Não foi possível ler a duração do vídeo.'))
        return
      }

      resolve(duration)
    }

    video.onerror = () => {
      reject(new Error(`Falha ao ler o arquivo ${file.name}.`))
    }
  })
}

export function useVideoSource() {
  const sourceType = ref(null)
  const file = ref(null)
  const objectUrl = ref('')
  const youtubeUrl = ref('')
  const youtubeId = ref('')
  const durationSeconds = ref(0)
  const durationInput = ref('')
  const error = ref('')
  const isLoading = ref(false)

  const meta = reactive({
    title: '',
    thumbnail: '',
  })

  const hasSource = computed(() => Boolean(sourceType.value))
  const canGenerateCuts = computed(
    () => hasSource.value && durationSeconds.value > 0,
  )

  function revokeObjectUrl() {
    if (objectUrl.value) {
      URL.revokeObjectURL(objectUrl.value)
      objectUrl.value = ''
    }
  }

  function reset() {
    revokeObjectUrl()
    sourceType.value = null
    file.value = null
    youtubeUrl.value = ''
    youtubeId.value = ''
    durationSeconds.value = 0
    durationInput.value = ''
    error.value = ''
    isLoading.value = false
    meta.title = ''
    meta.thumbnail = ''
  }

  async function loadFile(nextFile) {
    if (!nextFile) return

    if (nextFile.type && !ACCEPTED_VIDEO_TYPES.includes(nextFile.type)) {
      error.value = 'Envie um vídeo em MP4, WebM, MOV ou MKV.'
      return
    }

    reset()
    isLoading.value = true

    const url = URL.createObjectURL(nextFile)

    try {
      const duration = await readVideoDuration(nextFile, url)
      sourceType.value = SOURCE_TYPE.FILE
      file.value = nextFile
      objectUrl.value = url
      durationSeconds.value = Math.floor(duration)
      meta.title = cleanSourceTitle(nextFile.name) || nextFile.name
      meta.thumbnail = ''
      error.value = ''
    } catch (loadError) {
      URL.revokeObjectURL(url)
      error.value = loadError.message
    } finally {
      isLoading.value = false
    }
  }

  async function loadYouTube(url) {
    const videoId = extractYouTubeId(url)
    if (!videoId) {
      error.value = 'Cole um link válido do YouTube.'
      return false
    }

    revokeObjectUrl()
    sourceType.value = SOURCE_TYPE.YOUTUBE
    file.value = null
    youtubeUrl.value = getYouTubeWatchUrl(videoId)
    youtubeId.value = videoId
    durationSeconds.value = 0
    durationInput.value = ''
    meta.title = `YouTube · ${videoId}`
    meta.thumbnail = getYouTubeThumbnail(videoId)
    error.value = ''
    isLoading.value = true

    try {
      const youtubeMeta = await fetchYouTubeMeta(videoId)
      meta.title = youtubeMeta.title
      meta.thumbnail = youtubeMeta.thumbnail
      durationSeconds.value = youtubeMeta.durationSeconds

      if (!youtubeMeta.durationSeconds) {
        error.value = 'Não deu para ler a duração sozinho. Informe o tempo do vídeo.'
      }
    } catch {
      error.value = 'Não deu para ler a duração sozinho. Informe o tempo do vídeo.'
    } finally {
      isLoading.value = false
    }

    return true
  }

  function setManualDuration(seconds) {
    durationSeconds.value = Math.max(0, Math.floor(seconds || 0))
    if (durationSeconds.value > 0) {
      error.value = ''
    }
  }

  return {
    sourceType,
    file,
    objectUrl,
    youtubeUrl,
    youtubeId,
    durationSeconds,
    durationInput,
    error,
    isLoading,
    meta,
    hasSource,
    canGenerateCuts,
    loadFile,
    loadYouTube,
    setManualDuration,
    reset,
  }
}
