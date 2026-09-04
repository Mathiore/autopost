import { computed, ref } from 'vue'
import { CUT_STATUS } from '@/constants/video'
import { generateCuts } from '@/utils/cuts'
import { captureCutThumbnails } from '@/utils/thumbnail'

export function useCuts() {
  const items = ref([])
  const leftoverSeconds = ref(0)
  const isGenerating = ref(false)
  const thumbnails = ref({})

  const count = computed(() => items.value.length)
  const hasCuts = computed(() => count.value > 0)
  const totalCutSeconds = computed(() =>
    items.value.reduce((sum, cut) => sum + cut.durationSeconds, 0),
  )

  function reset() {
    items.value = []
    leftoverSeconds.value = 0
    thumbnails.value = {}
    isGenerating.value = false
  }

  async function generate(durationSeconds, objectUrl = '') {
    isGenerating.value = true

    const result = generateCuts(durationSeconds)
    leftoverSeconds.value = result.leftoverSeconds
    items.value = result.cuts.map((cut) => ({
      ...cut,
      status: CUT_STATUS.DRAFT,
      scheduledAt: null,
      thumbnail: '',
    }))

    if (objectUrl && items.value.length) {
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

    isGenerating.value = false
    return items.value
  }

  function updateStatuses(nextItems) {
    items.value = nextItems
  }

  return {
    items,
    leftoverSeconds,
    isGenerating,
    thumbnails,
    count,
    hasCuts,
    totalCutSeconds,
    generate,
    updateStatuses,
    reset,
  }
}
