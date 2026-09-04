import { fetchFile } from '@ffmpeg/util'
import { TIKTOK_OUTPUT_HEIGHT, TIKTOK_OUTPUT_WIDTH } from '@/constants/video'

const TIKTOK_FILTER = `scale=${TIKTOK_OUTPUT_WIDTH}:${TIKTOK_OUTPUT_HEIGHT}:force_original_aspect_ratio=increase,crop=${TIKTOK_OUTPUT_WIDTH}:${TIKTOK_OUTPUT_HEIGHT}`

export function inputNameForFile(file) {
  const ext = String(file?.name || '').split('.').pop()?.toLowerCase()
  const safe = ['mp4', 'webm', 'mov', 'mkv'].includes(ext) ? ext : 'mp4'
  return `input.${safe}`
}

export async function writeInputFile(ffmpeg, file) {
  const inputName = inputNameForFile(file)
  await ffmpeg.writeFile(inputName, await fetchFile(file))
  return inputName
}

export async function encodeCut(ffmpeg, { inputName, startSeconds, durationSeconds, outputName }) {
  const exitCode = await ffmpeg.exec([
    '-ss', Number(startSeconds).toFixed(3),
    '-i', inputName,
    '-t', Number(durationSeconds).toFixed(3),
    '-vf', TIKTOK_FILTER,
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-crf', '28',
    '-c:a', 'aac',
    '-ac', '2',
    '-ar', '44100',
    '-movflags', '+faststart',
    '-pix_fmt', 'yuv420p',
    outputName,
  ])

  if (exitCode !== 0) {
    throw new Error(`FFmpeg falhou no arquivo ${outputName}.`)
  }

  const data = await ffmpeg.readFile(outputName)
  await ffmpeg.deleteFile(outputName)

  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
  return new Blob([bytes], { type: 'video/mp4' })
}

export async function encodeCuts(ffmpeg, file, cuts, onProgress) {
  const inputName = await writeInputFile(ffmpeg, file)
  const results = []

  try {
    for (let index = 0; index < cuts.length; index += 1) {
      const cut = cuts[index]
      onProgress?.({
        phase: 'cutting',
        current: index + 1,
        total: cuts.length,
      })

      const blob = await encodeCut(ffmpeg, {
        inputName,
        startSeconds: cut.startSeconds,
        durationSeconds: cut.durationSeconds,
        outputName: `cut-${String(cut.index).padStart(2, '0')}.mp4`,
      })

      results.push({
        id: cut.id,
        objectUrl: URL.createObjectURL(blob),
      })
    }
  } finally {
    try {
      await ffmpeg.deleteFile(inputName)
    } catch {
      // The input may already have been removed after a failed run.
    }
  }

  return results
}
