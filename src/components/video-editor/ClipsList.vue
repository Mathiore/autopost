<template>
  <section class="clips">
    <div class="clips__head">
      <div>
        <p class="eyebrow">Cortes</p>
        <h2 class="section-title">{{ title }}</h2>
      </div>
      <div class="clips__actions">
        <button
          class="btn btn-ghost"
          type="button"
          :disabled="!hasVideo || isEngineBusy"
          @click="$emit('add')"
        >
          Adicionar corte
        </button>
        <button
          v-if="readyCount > 1"
          class="btn btn-cyan"
          type="button"
          @click="$emit('download-all')"
        >
          Baixar todos
        </button>
      </div>
    </div>

    <p v-if="engineMessage" class="clips__engine">{{ engineMessage }}</p>

    <div v-if="clips.length" class="clips__list">
      <ClipCard
        v-for="(clip, index) in clips"
        :key="clip.id"
        :clip="clip"
        :index="index + 1"
        :has-video="hasVideo"
        :video-duration="videoDuration"
        :is-engine-busy="isEngineBusy && clip.status !== 'processing'"
        @update="$emit('update', clip.id, $event)"
        @generate="$emit('generate', clip.id)"
        @download="$emit('download', clip.id)"
        @remove="$emit('remove', clip.id)"
      />
    </div>

    <div v-else class="card clips__empty">
      <p>
        Adicione um corte, informe início e fim e gere o MP4 vertical. Cada corte
        pode ter até {{ maxClipDuration }} segundos.
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import ClipCard from './ClipCard.vue'
import { CLIP_STATUS, MAX_CLIP_DURATION } from '@/constants/editor'

const props = defineProps({
  clips: {
    type: Array,
    default: () => [],
  },
  hasVideo: {
    type: Boolean,
    default: false,
  },
  videoDuration: {
    type: Number,
    default: 0,
  },
  isEngineBusy: {
    type: Boolean,
    default: false,
  },
  isEngineLoading: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['add', 'update', 'generate', 'download', 'remove', 'download-all'])

const maxClipDuration = MAX_CLIP_DURATION

const readyCount = computed(
  () => props.clips.filter((clip) => clip.status === CLIP_STATUS.READY && clip.outputUrl).length,
)

const title = computed(() => {
  if (!props.clips.length) return 'Nenhum corte ainda'
  return `${props.clips.length} corte${props.clips.length > 1 ? 's' : ''}`
})

const engineMessage = computed(() =>
  props.isEngineLoading ? 'Preparando editor de vídeo...' : '',
)
</script>

<style scoped>
.clips__head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
  margin-bottom: 18px;
}

.clips__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.clips__engine {
  margin: 0 0 16px;
  color: var(--cyan);
  font-size: 13px;
  font-weight: 700;
}

.clips__list {
  display: grid;
  gap: 16px;
}

.clips__empty {
  padding: 36px;
  color: var(--text-soft);
}

@media (max-width: 720px) {
  .clips__head {
    flex-direction: column;
    align-items: start;
  }
}
</style>
