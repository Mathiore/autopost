<template>
  <div class="app-shell">
    <AppHeader />

    <main class="page">
      <section class="hero">
        <p class="eyebrow">Automação de cortes</p>
        <h1>Do vídeo longo ao feed vertical, em sequência.</h1>
        <p class="muted">
          Interface inicial do AutoTok. A origem entra aqui; os cortes já nascem
          no formato TikTok e saem com horários defasados para publicação em ordem.
        </p>
      </section>

      <div class="workspace">
        <div class="workspace__source">
          <SourceInput
            :error="sourceError"
            :is-loading="isLoadingSource"
            @select-file="onSelectFile"
            @submit-youtube="onSubmitYouTube"
          />

          <VideoPreview
            v-if="hasSource"
            :title="sourceMeta.title"
            :source-type="sourceType"
            :object-url="objectUrl"
            :youtube-id="youtubeId"
            :thumbnail="sourceMeta.thumbnail"
            :duration-seconds="durationSeconds"
            :is-loading="isLoadingSource"
            @set-duration="onManualDuration"
          />

          <CutSettings
            v-if="hasSource"
            :can-generate="canGenerateCuts"
            :is-generating="isGeneratingCuts"
            :source-type="sourceType"
            :error="cutsError"
            :progress="cutsProgress"
            @generate="onGenerateCuts"
            @reset="onReset"
          />
        </div>

        <div class="workspace__output">
          <CutsGrid
            :cuts="cutItems"
            :leftover-seconds="leftoverSeconds"
          />

          <div v-if="hasCuts" class="workspace__publish">
            <SchedulePanel
              v-model:start-clock="startClock"
              v-model:interval-minutes="intervalMinutes"
              :cut-count="cutCount"
              :is-posting="isPosting"
              :has-posted="hasPosted"
              :error="scheduleError"
              @post-all="onPostAll"
            />
            <PostQueue :cuts="cutItems" />
          </div>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import CutSettings from '@/components/cuts/CutSettings.vue'
import CutsGrid from '@/components/cuts/CutsGrid.vue'
import PostQueue from '@/components/schedule/PostQueue.vue'
import SchedulePanel from '@/components/schedule/SchedulePanel.vue'
import SourceInput from '@/components/source/SourceInput.vue'
import VideoPreview from '@/components/source/VideoPreview.vue'
import { useCuts } from '@/composables/useCuts'
import { useSchedule } from '@/composables/useSchedule'
import { useVideoSource } from '@/composables/useVideoSource'
import { watch } from 'vue'
import { parseFlexibleDuration } from '@/utils/time'

const {
  sourceType,
  file,
  objectUrl,
  youtubeId,
  durationSeconds,
  error: sourceError,
  isLoading: isLoadingSource,
  meta: sourceMeta,
  hasSource,
  canGenerateCuts,
  loadFile,
  loadYouTube,
  setManualDuration,
  reset: resetSource,
} = useVideoSource()

const {
  items: cutItems,
  leftoverSeconds,
  isGenerating: isGeneratingCuts,
  error: cutsError,
  progress: cutsProgress,
  count: cutCount,
  hasCuts,
  generate: generateCuts,
  updateStatuses,
  reset: resetCuts,
} = useCuts()

const {
  startClock,
  intervalMinutes,
  isPosting,
  hasPosted,
  error: scheduleError,
  plan,
  postAll,
} = useSchedule()

function applyPlan(nextCuts = cutItems.value) {
  updateStatuses(plan(nextCuts))
}

async function onSelectFile(file) {
  resetCuts()
  await loadFile(file)
}

async function onSubmitYouTube(url) {
  resetCuts()
  await loadYouTube(url)
}

function onManualDuration(value) {
  const seconds = parseFlexibleDuration(value)
  if (!seconds) {
    sourceError.value = 'Informe a duração como 12:40, 1:05:00 ou em segundos.'
    return
  }

  sourceError.value = ''
  setManualDuration(seconds)
}

async function onGenerateCuts() {
  const generated = await generateCuts({
    durationSeconds: durationSeconds.value,
    file: file.value,
    objectUrl: objectUrl.value,
    youtubeId: youtubeId.value,
    sourceTitle: sourceMeta.title,
  })
  applyPlan(generated)
}

async function onPostAll() {
  const posted = await postAll(cutItems.value, (next) => {
    updateStatuses(next)
  })
  updateStatuses(posted)
}

function onReset() {
  resetSource()
  resetCuts()
}

watch([startClock, intervalMinutes], () => {
  if (hasCuts.value) applyPlan()
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
.workspace__output,
.workspace__publish {
  display: grid;
  gap: 18px;
}

@media (max-width: 980px) {
  .workspace {
    grid-template-columns: 1fr;
  }
}
</style>
