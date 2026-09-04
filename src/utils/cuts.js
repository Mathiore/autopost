import { clampCutMinutes, cutMinutesToSeconds } from '@/constants/video'
import { buildCutTitle } from '@/utils/title'

export function generateCuts(totalDurationSeconds, { sourceTitle = '', cutMinutes = 1 } = {}) {
  const total = Math.floor(Number(totalDurationSeconds) || 0)
  const minutes = clampCutMinutes(cutMinutes)
  const cutSeconds = cutMinutesToSeconds(minutes)

  if (total < cutSeconds) {
    return {
      cuts: [],
      leftoverSeconds: Math.max(0, total),
    }
  }

  const count = Math.floor(total / cutSeconds)
  const leftoverSeconds = total - count * cutSeconds

  const cuts = Array.from({ length: count }, (_, index) => {
    const start = index * cutSeconds
    const end = start + cutSeconds

    return {
      id: `cut-${index + 1}`,
      index: index + 1,
      title: buildCutTitle(sourceTitle, index + 1, count),
      startSeconds: start,
      endSeconds: end,
      durationSeconds: cutSeconds,
      aspectRatio: '9:16',
    }
  })

  return {
    cuts,
    leftoverSeconds,
  }
}

export function buildSchedule(cuts, startDate, intervalMinutes) {
  return cuts.map((cut, index) => ({
    ...cut,
    scheduledAt: addMinutesSafe(startDate, index * intervalMinutes),
  }))
}

function addMinutesSafe(date, minutes) {
  const next = new Date(date)
  next.setMinutes(next.getMinutes() + minutes)
  return next
}
