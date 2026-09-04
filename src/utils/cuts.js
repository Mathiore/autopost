import {
  CUT_MAX_SECONDS,
  CUT_MIN_SECONDS,
  FORBIDDEN_DURATION_SECONDS,
} from '@/constants/video'
import { buildCutTitle } from '@/utils/title'

function clampDuration(value) {
  return Math.min(CUT_MAX_SECONDS, Math.max(CUT_MIN_SECONDS, value))
}

function applyVariety(durations) {
  if (durations.length < 2) return durations

  const varied = [...durations]
  const offsets = [2, -1, 1, -2, 1]

  for (let index = 0; index < varied.length; index += 1) {
    const neighbor = (index + 1) % varied.length
    const offset = offsets[index % offsets.length]
    const nextValue = varied[index] + offset
    const neighborValue = varied[neighbor] - offset

    const bothValid =
      nextValue >= CUT_MIN_SECONDS &&
      nextValue <= CUT_MAX_SECONDS &&
      nextValue !== FORBIDDEN_DURATION_SECONDS &&
      neighborValue >= CUT_MIN_SECONDS &&
      neighborValue <= CUT_MAX_SECONDS &&
      neighborValue !== FORBIDDEN_DURATION_SECONDS

    if (bothValid) {
      varied[index] = nextValue
      varied[neighbor] = neighborValue
    }
  }

  return varied
}

export function generateCuts(totalDurationSeconds, { sourceTitle = '' } = {}) {
  const total = Math.floor(Number(totalDurationSeconds) || 0)

  if (total < CUT_MIN_SECONDS) {
    return {
      cuts: [],
      leftoverSeconds: Math.max(0, total),
    }
  }

  const maxCuts = Math.floor(total / CUT_MIN_SECONDS)
  const targetCoverage = Math.min(total, maxCuts * CUT_MAX_SECONDS)
  const extra = targetCoverage - maxCuts * CUT_MIN_SECONDS
  const durations = Array.from({ length: maxCuts }, () => CUT_MIN_SECONDS)

  for (let spent = 0; spent < extra; spent += 1) {
    const index = spent % maxCuts
    if (durations[index] < CUT_MAX_SECONDS) {
      durations[index] += 1
    }
  }

  const varied = applyVariety(durations).map(clampDuration)

  let cursor = 0
  const cuts = varied.map((duration, index) => {
    const start = cursor
    const end = cursor + duration
    cursor = end

    return {
      id: `cut-${index + 1}`,
      index: index + 1,
      title: buildCutTitle(sourceTitle, index + 1, varied.length),
      startSeconds: start,
      endSeconds: end,
      durationSeconds: duration,
      aspectRatio: '9:16',
    }
  })

  return {
    cuts,
    leftoverSeconds: Math.max(0, total - cursor),
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
