<template>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">Editor local</p>
      <h1>Cortes verticais com legenda, sem sair do navegador.</h1>
      <p class="muted">
        Envie um MP4 ou WebM, defina o início e o fim de cada corte, escreva a
        legenda e baixe o arquivo já em 9:16. Nada é enviado para o servidor.
      </p>
    </section>

    <div class="workspace">
      <div class="workspace__source">
        <VideoUpload
          v-if="!hasVideo"
          :error="sourceError"
          :is-loading="isLoadingSource"
          @select-file="onSelectFile"
        />

        <VideoPreview
          v-else
          :file-name="file.name"
          :object-url="objectUrl"
          :duration-seconds="durationSeconds"
          :file-size="file.size"
          @remove="onRemoveVideo"
        />
      </div>

      <div class="workspace__output">
        <p v-if="processorError" class="workspace__error">{{ processorError }}</p>

        <ClipsList
          :clips="clips"
          :has-video="hasVideo"
          :video-duration="durationSeconds"
          :is-engine-busy="isBusy"
          :is-engine-loading="isEngineLoading"
          @add="onAddClip"
          @update="onUpdateClip"
          @generate="onGenerateClip"
          @download="onDownloadClip"
          @remove="onRemoveClip"
          @download-all="onDownloadAll"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import ClipsList from '@/components/video-editor/ClipsList.vue'
import VideoPreview from '@/components/video-editor/VideoPreview.vue'
import VideoUpload from '@/components/video-editor/VideoUpload.vue'
import { useLocalVideo } from '@/composables/useLocalVideo'
import { useVideoProcessor } from '@/composables/useVideoProcessor'
import { CLIP_STATUS, DEFAULT_CLIP_DURATION, MAX_CLIP_DURATION } from '@/constants/editor'
import { createVideoClip } from '@/types/video'
import { validateClipTimes } from '@/utils/clipValidation'

const {
  file,
  objectUrl,
  durationSeconds,
  error: sourceError,
  isLoading: isLoadingSource,
  hasVideo,
  loadFile,
  reset: resetSource,
} = useLocalVideo()

const {
  isLoading: isEngineLoading,
  isBusy,
  loadError,
  loadFFmpeg,
  generateClip,
  generateDownload,
  generateDownloadAll,
  cleanup,
} = useVideoProcessor()

const clips = ref([])
const actionError = ref('')

const processorError = computed(() => actionError.value || loadError.value)

function clipUrls() {
  return clips.value.map((clip) => clip.outputUrl).filter(Boolean)
}

function nextClipRange() {
  const last = clips.value[clips.value.length - 1]
  const startTime = last ? Number(last.endTime) || 0 : 0
  const wantedEnd = startTime + DEFAULT_CLIP_DURATION
  const maxEnd = durationSeconds.value
    ? Math.min(durationSeconds.value, startTime + MAX_CLIP_DURATION)
    : wantedEnd
  const endTime = Math.max(startTime, Math.min(wantedEnd, maxEnd || wantedEnd))

  if (endTime > startTime) {
    return { startTime, endTime }
  }

  return {
    startTime: 0,
    endTime: Math.min(DEFAULT_CLIP_DURATION, durationSeconds.value || DEFAULT_CLIP_DURATION),
  }
}

function onAddClip() {
  clips.value = [
    ...clips.value,
    createVideoClip({
      ...nextClipRange(),
      videoDuration: durationSeconds.value,
    }),
  ]
}

function onUpdateClip(id, patch) {
  clips.value = clips.value.map((clip) => (clip.id === id ? { ...clip, ...patch } : clip))
}

async function onSelectFile(nextFile) {
  clipUrls().forEach((url) => cleanup([url]))
  clips.value = []
  actionError.value = ''
  const loaded = await loadFile(nextFile)
  if (!loaded) return
  onAddClip()
}

function onRemoveVideo() {
  clipUrls().forEach((url) => cleanup([url]))
  clips.value = []
  actionError.value = ''
  resetSource()
}

async function onGenerateClip(id) {
  const clip = clips.value.find((item) => item.id === id)
  if (!clip || !file.value) return

  const validationError = validateClipTimes({
    startTime: clip.startTime,
    endTime: clip.endTime,
    videoDuration: durationSeconds.value,
  })

  if (validationError) {
    onUpdateClip(id, { status: CLIP_STATUS.ERROR, error: validationError })
    return
  }

  if (clip.outputUrl) cleanup([clip.outputUrl])
  actionError.value = ''
  onUpdateClip(id, {
    status: CLIP_STATUS.PROCESSING,
    progress: 0,
    error: '',
    outputUrl: '',
  })

  try {
    const outputUrl = await generateClip({
      file: file.value,
      startTime: clip.startTime,
      endTime: clip.endTime,
      subtitle: clip.subtitle,
      subtitleSize: clip.subtitleSize,
      subtitlePosition: clip.subtitlePosition,
      onProgress(progress) {
        onUpdateClip(id, { progress })
      },
    })
    onUpdateClip(id, {
      status: CLIP_STATUS.READY,
      outputUrl,
      progress: 100,
      error: '',
    })
  } catch (error) {
    onUpdateClip(id, {
      status: CLIP_STATUS.ERROR,
      progress: 0,
      error: error.message || 'O processamento do vídeo falhou.',
    })
  }
}

function onDownloadClip(id) {
  const index = clips.value.findIndex((clip) => clip.id === id)
  const clip = clips.value[index]
  if (!clip?.outputUrl) return
  generateDownload(clip.outputUrl, index + 1)
}

function onRemoveClip(id) {
  const clip = clips.value.find((item) => item.id === id)
  if (clip?.outputUrl) cleanup([clip.outputUrl])
  clips.value = clips.value.filter((item) => item.id !== id)
}

function onDownloadAll() {
  generateDownloadAll(clips.value)
}

watch(hasVideo, (ready) => {
  if (ready) {
    loadFFmpeg().catch(() => {})
  }
})

onUnmounted(() => {
  clipUrls().forEach((url) => cleanup([url]))
  resetSource()
})
</script>

<style scoped>
.hero {
  max-width: 720px;
  margin-bottom: 32px;
}

.hero h1 {
  margin: 0 0 12px;
  font-family: var(--font-display);
  font-size: clamp(32px, 5vw, 48px);
  line-height: 1.05;
}

.hero p {
  margin: 0;
  font-size: 17px;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: 24px;
  align-items: start;
}

.workspace__source,
.workspace__output {
  display: grid;
  gap: 18px;
}

.workspace__error {
  margin: 0;
  color: var(--accent);
  font-size: 13px;
}

@media (max-width: 980px) {
  .workspace {
    grid-template-columns: 1fr;
  }
}
</style>
