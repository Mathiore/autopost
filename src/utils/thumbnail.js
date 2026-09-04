import { TIKTOK_HEIGHT, TIKTOK_WIDTH } from '@/constants/video'

function cropToTikTok(videoWidth, videoHeight) {
  const target = TIKTOK_WIDTH / TIKTOK_HEIGHT
  const source = videoWidth / videoHeight

  if (source > target) {
    const height = videoHeight
    const width = height * target
    return {
      sx: (videoWidth - width) / 2,
      sy: 0,
      sw: width,
      sh: height,
    }
  }

  const width = videoWidth
  const height = width / target
  return {
    sx: 0,
    sy: (videoHeight - height) / 2,
    sw: width,
    sh: height,
  }
}

export function captureFrame(objectUrl, timeSeconds) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.muted = true
    video.preload = 'auto'
    video.src = objectUrl

    const cleanup = () => {
      video.removeAttribute('src')
      video.load()
    }

    video.onerror = () => {
      cleanup()
      reject(new Error('Não foi possível ler o vídeo para gerar o preview.'))
    }

    video.onloadedmetadata = () => {
      const seekTo = Math.min(Math.max(timeSeconds, 0.1), Math.max(video.duration - 0.1, 0))
      video.currentTime = seekTo
    }

    video.onseeked = () => {
      try {
        const width = 270
        const height = 480
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        const crop = cropToTikTok(video.videoWidth, video.videoHeight)

        context.drawImage(
          video,
          crop.sx,
          crop.sy,
          crop.sw,
          crop.sh,
          0,
          0,
          width,
          height,
        )

        const dataUrl = canvas.toDataURL('image/jpeg', 0.72)
        cleanup()
        resolve(dataUrl)
      } catch (error) {
        cleanup()
        reject(error)
      }
    }
  })
}

export async function captureCutThumbnails(objectUrl, cuts) {
  const frames = []

  for (const cut of cuts) {
    try {
      const thumbnail = await captureFrame(objectUrl, cut.startSeconds + 1)
      frames.push({ id: cut.id, thumbnail })
    } catch {
      frames.push({ id: cut.id, thumbnail: '' })
    }
  }

  return frames
}
