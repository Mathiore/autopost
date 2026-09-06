import { ref } from 'vue'
import { useFFmpeg } from '@/composables/useFFmpeg'
import { clipFileName, downloadFromUrl, processClip } from '@/utils/clipProcessor'
import { renderSubtitleOverlays } from '@/utils/subtitleRenderer'
import { toSubtitleSegments } from '@/types/video'

let processChain = Promise.resolve()

function logDevError(error) {
  if (import.meta.env.DEV) {
    console.error('[video-editor]', error)
  }
}

export function useVideoProcessor() {
  const { ensureLoaded, isReady, isLoading } = useFFmpeg()
  const isBusy = ref(false)
  const loadError = ref('')

  async function loadFFmpeg() {
    loadError.value = ''
    try {
      return await ensureLoaded()
    } catch (error) {
      logDevError(error)
      loadError.value = 'Não foi possível preparar o editor de vídeo.'
      throw new Error(loadError.value)
    }
  }

  async function renderSubtitle(subtitle, clipDuration, options = {}) {
    const segments = toSubtitleSegments(subtitle, clipDuration)
    return renderSubtitleOverlays(segments, options)
  }

  async function generateClip({
    file,
    startTime,
    endTime,
    subtitle,
    subtitleSize,
    subtitlePosition,
    onProgress,
  }) {
    const run = async () => {
      isBusy.value = true
      try {
        const ffmpeg = await loadFFmpeg()
        return await processClip(ffmpeg, {
          file,
          startTime,
          endTime,
          subtitle,
          subtitleSize,
          subtitlePosition,
          onProgress,
        })
      } catch (error) {
        logDevError(error)
        if (loadError.value) throw error
        throw new Error('O processamento do vídeo falhou.')
      } finally {
        isBusy.value = false
      }
    }

    const result = processChain.then(run, run)
    processChain = result.then(
      () => {},
      () => {},
    )
    return result
  }

  function generateDownload(outputUrl, index) {
    if (!outputUrl) return
    downloadFromUrl(outputUrl, clipFileName(index))
  }

  async function generateDownloadAll(clips) {
    const ready = (clips || []).filter((clip) => clip.outputUrl)
    for (let index = 0; index < ready.length; index += 1) {
      const clip = ready[index]
      const listIndex = (clips || []).findIndex((item) => item.id === clip.id) + 1
      generateDownload(clip.outputUrl, listIndex || index + 1)
      await new Promise((resolve) => setTimeout(resolve, 350))
    }
  }

  function cleanup(urls = []) {
    urls.forEach((url) => {
      if (url) URL.revokeObjectURL(url)
    })
  }

  return {
    isReady,
    isLoading,
    isBusy,
    loadError,
    loadFFmpeg,
    generateClip,
    renderSubtitle,
    generateDownload,
    generateDownloadAll,
    cleanup,
  }
}
