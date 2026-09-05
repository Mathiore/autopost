import { computed, ref } from 'vue'
import {
  CUT_STATUS,
  DEFAULT_CUT_MINUTES,
  SOURCE_TYPE,
  clampCutMinutes,
} from '@/constants/video'
import { useFFmpeg } from '@/composables/useFFmpeg'
import { generateCuts } from '@/utils/cuts'
import { captureCutThumbnails } from '@/utils/thumbnail'
import { extractCuts } from '@/utils/transcode'

function revokeCutUrls(cuts) {
  cuts.forEach((cut) => {
    if (cut.objectUrl) URL.revokeObjectURL(cut.objectUrl)
  })
}

const items = ref([])
const leftoverSeconds = ref(0)
const cutMinutes = ref(DEFAULT_CUT_MINUTES)
const isGenerating = ref(false)
const error = ref('')
const thumbnails = ref({})
const progress = ref({
  phase: '',
  current: 0,
  total: 0,
})

export function useCuts() {

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
    cutMinutes: nextCutMinutes = cutMinutes.value,
  }) {
    revokeCutUrls(items.value)
    isGenerating.value = true
    error.value = ''
    progress.value = { phase: 'planning', current: 0, total: 0 }

    const selectedMinutes = clampCutMinutes(nextCutMinutes)
    cutMinutes.value = selectedMinutes
    const result = generateCuts(durationSeconds, {
      sourceTitle,
      cutMinutes: selectedMinutes,
    })
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
      error.value = `O vídeo precisa ter pelo menos ${selectedMinutes} min para gerar um corte.`
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
        await extractCuts(ffmpeg, file, items.value, {
          onProgress(nextProgress) {
            progress.value = nextProgress
          },
          onCutReady({ id, objectUrl }) {
            items.value = items.value.map((cut) =>
              cut.id === id
                ? { ...cut, objectUrl, status: CUT_STATUS.READY }
                : cut,
            )
          },
        })
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
    cutMinutes,
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
