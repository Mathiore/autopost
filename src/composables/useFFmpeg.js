import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import { ref } from 'vue'

const CORE_BASE_URL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm'

let ffmpeg
let loadingPromise

export function useFFmpeg() {
  const isReady = ref(Boolean(ffmpeg?.loaded))
  const isLoading = ref(false)

  async function ensureLoaded() {
    if (ffmpeg?.loaded) {
      isReady.value = true
      return ffmpeg
    }

    if (loadingPromise) {
      isLoading.value = true
      const instance = await loadingPromise
      isLoading.value = false
      isReady.value = true
      return instance
    }

    isLoading.value = true
    ffmpeg = new FFmpeg()

    loadingPromise = (async () => {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${CORE_BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      return ffmpeg
    })()

    try {
      const instance = await loadingPromise
      isReady.value = true
      return instance
    } catch (error) {
      ffmpeg = null
      loadingPromise = null
      const detail = error instanceof Error && error.message ? ` ${error.message}` : ''
      throw new Error(`Não foi possível carregar o motor de cortes no navegador.${detail}`)
    } finally {
      isLoading.value = false
    }
  }

  return {
    isReady,
    isLoading,
    ensureLoaded,
  }
}
