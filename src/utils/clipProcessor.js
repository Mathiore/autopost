import { fetchFile } from '@ffmpeg/util'
import { OUTPUT_HEIGHT, OUTPUT_WIDTH } from '@/constants/editor'
import { renderSubtitleOverlays } from '@/utils/subtitleRenderer'
import { toSubtitleSegments } from '@/types/video'

function toPlayableBlob(data) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return new Blob([copy], { type: 'video/mp4' })
}

export function inputNameForFile(file) {
  const ext = String(file?.name || '').split('.').pop()?.toLowerCase()
  return ext === 'webm' ? 'editor-input.webm' : 'editor-input.mp4'
}

async function safeDelete(ffmpeg, name) {
  try {
    await ffmpeg.deleteFile(name)
  } catch {
    // File may not exist after a failed run.
  }
}

function buildVerticalFilter(overlays) {
  const width = OUTPUT_WIDTH
  const height = OUTPUT_HEIGHT
  const filters = [
    '[0:v]split=2[bg][fg]',
    `[bg]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},scale=180:320,boxblur=10:2,scale=${width}:${height}[bg]`,
    `[fg]scale=${width}:${height}:force_original_aspect_ratio=decrease[fg]`,
    '[bg][fg]overlay=(W-w)/2:(H-h)/2[v0]',
  ]

  overlays.forEach((overlay, index) => {
    const start = Number(overlay.start).toFixed(3)
    const end = Number(overlay.end).toFixed(3)
    const inputIndex = index + 1
    filters.push(
      `[${inputIndex}:v]format=rgba[s${index}]`,
      `[v${index}][s${index}]overlay=0:0:enable='between(t,${start},${end})'[v${index + 1}]`,
    )
  })

  return {
    filter: filters.join(';'),
    outputLabel: `v${overlays.length}`,
  }
}

function logDevError(error) {
  if (import.meta.env.DEV) {
    console.error('[video-editor]', error)
  }
}

/**
 * @param {import('@ffmpeg/ffmpeg').FFmpeg} ffmpeg
 * @param {{
 *   file: File,
 *   startTime: number,
 *   endTime: number,
 *   subtitle: string | import('@/types/video').ClipSubtitle | import('@/types/video').SubtitleSegment[],
 *   subtitleSize: string,
 *   subtitlePosition: string,
 *   onProgress?: (percent: number) => void,
 * }} options
 */
export async function processClip(ffmpeg, options) {
  const {
    file,
    startTime,
    endTime,
    subtitle,
    subtitleSize,
    subtitlePosition,
    onProgress,
  } = options

  const duration = endTime - startTime
  const inputName = inputNameForFile(file)
  const outputName = 'editor-output.mp4'
  const overlayNames = []
  const segments = toSubtitleSegments(subtitle, duration)

  const onFFmpegProgress = ({ progress } = {}) => {
    const percent = Math.round(Math.min(0.99, Math.max(0, Number(progress) || 0)) * 100)
    onProgress?.(percent)
  }

  ffmpeg.on('progress', onFFmpegProgress)

  try {
    await safeDelete(ffmpeg, inputName)
    await safeDelete(ffmpeg, outputName)
    await ffmpeg.writeFile(inputName, await fetchFile(file))

    const overlays = await renderSubtitleOverlays(segments, {
      width: OUTPUT_WIDTH,
      height: OUTPUT_HEIGHT,
      size: subtitleSize,
      position: subtitlePosition,
    })

    const extraInputs = []
    for (let index = 0; index < overlays.length; index += 1) {
      const name = `editor-sub-${index}.png`
      overlayNames.push(name)
      await safeDelete(ffmpeg, name)
      await ffmpeg.writeFile(name, overlays[index].bytes)
      extraInputs.push('-loop', '1', '-i', name)
    }

    const { filter, outputLabel } = buildVerticalFilter(overlays)
    const common = [
      '-ss', Number(startTime).toFixed(3),
      '-i', inputName,
      ...extraInputs,
      '-t', Number(duration).toFixed(3),
      '-filter_complex', filter,
      '-map', `[${outputLabel}]`,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '28',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-shortest',
    ]

    const withAudio = [
      ...common,
      '-map', '0:a',
      '-c:a', 'aac',
      '-ac', '2',
      '-ar', '44100',
      outputName,
    ]
    const withoutAudio = [...common, '-an', outputName]

    let exitCode = await ffmpeg.exec(withAudio)
    if (exitCode !== 0) {
      await safeDelete(ffmpeg, outputName)
      exitCode = await ffmpeg.exec(withoutAudio)
    }

    if (exitCode !== 0) {
      throw new Error('encode-failed')
    }

    const data = await ffmpeg.readFile(outputName)
    const blob = toPlayableBlob(data)
    if (blob.size < 32) {
      throw new Error('empty-output')
    }

    onProgress?.(100)
    return URL.createObjectURL(blob)
  } catch (error) {
    logDevError(error)
    throw error
  } finally {
    ffmpeg.off('progress', onFFmpegProgress)
    await safeDelete(ffmpeg, inputName)
    await safeDelete(ffmpeg, outputName)
    await Promise.all(overlayNames.map((name) => safeDelete(ffmpeg, name)))
  }
}

export function downloadFromUrl(outputUrl, fileName) {
  const link = document.createElement('a')
  link.href = outputUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function clipFileName(index) {
  return `clip-${String(index).padStart(2, '0')}.mp4`
}
