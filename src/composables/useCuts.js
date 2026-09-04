import { computed, ref } from 'vue'
import { CUT_STATUS, SOURCE_TYPE } from '@/constants/video'
import { useFFmpeg } from '@/composables/useFFmpeg'
import { generateCuts } from '@/utils/cuts'
import { captureCutThumbnails } from '@/utils/thumbnail'
import { encodeCuts } from '@/utils/transcode'

function revokeCutUrls(cuts) {
  cuts.forEach((cut) => {
    if (cut.objectUrl) URL.revokeObjectURL(cut.objectUrl)
  })
}

export function useCuts() {
  const items = ref([])
  const leftoverSeconds = ref(0)
  const isGenerating = ref(false)
  const error = ref('')
  const thumbnails = ref({})
  const progress = ref({
    phase: '',
    current: 0,
    total: 0,
  })

  const { ensureLoaded } = useFFmpeg()

  const count = computed(() => items.value.length)
  const hasCuts = computed(() => count.value > 0)
  const encodedCount = computed(
    () => items.value.filter((cut) => Boolean(cut.objectUrl)).length,
  )
  const totalCutSeconds = computed(() =>
    items.value.reduce((sum, cut) => sum + cut.durationSeconds, 0),
  )

  function reset() {
    revokeCutUrls(items.value)
    items.value = []
    leftoverSeconds.value = 0
    thumbnails.value = {}
    error.value = ''
    isGenerating.value = false
    progress.value = { phase: '', current: 0, total: 0 }
  }

  function updateStatuses(nextItems) {
    items.value = nextItems
  }

  async function generate({
    durationSeconds,
    file = null,
    objectUrl = '',
    youtubeId = '',
    sourceTitle = '',
  }) {
    revokeCutUrls(items.value)
    isGenerating.value = true
    error.value = ''
    progress.value = { phase: 'planning', current: 0, total: 0 }

    const result = generateCuts(durationSeconds, { sourceTitle })
    leftoverSeconds.value = result.leftoverSeconds
    items.value = result.cuts.map((cut) => ({
      ...cut,
      status: file ? CUT_STATUS.PROCESSING : CUT_STATUS.DRAFT,
      scheduledAt: null,
      thumbnail: '',
      objectUrl: '',
      youtubeId,
      sourceType: file ? SOURCE_TYPE.FILE : youtubeId ? SOURCE_TYPE.YOUTUBE : '',
    }))

    if (!items.value.length) {
      isGenerating.value = false
      error.value = 'O vídeo precisa ter pelo menos 1:01 para gerar um corte.'
      return items.value
    }

    if (objectUrl) {
      progress.value = { phase: 'thumbnails', current: 0, total: items.value.length }
      const frames = await captureCutThumbnails(objectUrl, items.value)
      const nextThumbnails = {}

      frames.forEach(({ id, thumbnail }) => {
        nextThumbnails[id] = thumbnail
      })

      thumbnails.value = nextThumbnails
      items.value = items.value.map((cut) => ({
        ...cut,
        thumbnail: nextThumbnails[cut.id] || '',
      }))
    } else {
      thumbnails.value = {}
    }

    if (file) {
      try {
        progress.value = { phase: 'loading-engine', current: 0, total: items.value.length }
        const ffmpeg = await ensureLoaded()

        progress.value = { phase: 'writing', current: 0, total: items.value.length }
        const encoded = await encodeCuts(ffmpeg, file, items.value, (nextProgress) => {
          progress.value = nextProgress
        })

        const urls = Object.fromEntries(encoded.map((item) => [item.id, item.objectUrl]))
        items.value = items.value.map((cut) => ({
          ...cut,
          objectUrl: urls[cut.id] || '',
          status: urls[cut.id] ? CUT_STATUS.READY : CUT_STATUS.DRAFT,
        }))
      } catch (encodeError) {
        error.value = encodeError.message
        items.value = items.value.map((cut) => ({
          ...cut,
          status: CUT_STATUS.DRAFT,
        }))
      }
    }

    isGenerating.value = false
    progress.value = {
      phase: 'done',
      current: items.value.length,
      total: items.value.length,
    }
    return items.value
  }

  return {
    items,
    leftoverSeconds,
    isGenerating,
    error,
    thumbnails,
    progress,
    count,
    hasCuts,
    encodedCount,
    totalCutSeconds,
    generate,
    updateStatuses,
    reset,
  }
}
