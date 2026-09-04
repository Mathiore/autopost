import { computed, ref } from 'vue'
import {
  CUT_STATUS,
  DEFAULT_POST_INTERVAL_MINUTES,
  MAX_POST_INTERVAL_MINUTES,
  MIN_POST_INTERVAL_MINUTES,
} from '@/constants/video'
import { buildSchedule } from '@/utils/cuts'
import { clockToDate, todayClock } from '@/utils/time'

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function useSchedule() {
  const startClock = ref(todayClock(15))
  const intervalMinutes = ref(DEFAULT_POST_INTERVAL_MINUTES)
  const isPosting = ref(false)
  const hasPosted = ref(false)
  const error = ref('')

  const intervalLabel = computed(() => {
    const minutes = Number(intervalMinutes.value)
    return minutes === 1 ? '1 minuto' : `${minutes} minutos`
  })

  function plan(cuts) {
    const startDate = clockToDate(startClock.value)
    if (!startDate) {
      error.value = 'Informe um horário inicial válido, no formato HH:MM.'
      return cuts
    }

    const interval = Number(intervalMinutes.value)
    if (
      !Number.isFinite(interval) ||
      interval < MIN_POST_INTERVAL_MINUTES ||
      interval > MAX_POST_INTERVAL_MINUTES
    ) {
      error.value = `O intervalo deve ficar entre ${MIN_POST_INTERVAL_MINUTES} e ${MAX_POST_INTERVAL_MINUTES} minutos.`
      return cuts
    }

    error.value = ''
    hasPosted.value = false

    return buildSchedule(cuts, startDate, interval).map((cut) => ({
      ...cut,
      status: CUT_STATUS.DRAFT,
    }))
  }

  async function postAll(cuts, onProgress) {
    if (!cuts.length || isPosting.value) return cuts

    const planned = plan(cuts)
    if (error.value) return cuts

    isPosting.value = true
    hasPosted.value = false

    let current = planned.map((cut) => ({
      ...cut,
      status: CUT_STATUS.QUEUED,
    }))
    onProgress?.(current)

    for (let index = 0; index < current.length; index += 1) {
      current = current.map((cut, cutIndex) => ({
        ...cut,
        status: cutIndex === index ? CUT_STATUS.SCHEDULED : cut.status,
      }))
      onProgress?.(current)
      await wait(420)
    }

    isPosting.value = false
    hasPosted.value = true
    return current
  }

  return {
    startClock,
    intervalMinutes,
    isPosting,
    hasPosted,
    error,
    intervalLabel,
    plan,
    postAll,
  }
}
