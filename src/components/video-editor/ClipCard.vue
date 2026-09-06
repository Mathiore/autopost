<template>
  <article class="card clip">
    <div class="clip__frame">
      <video
        v-if="clip.outputUrl"
        :src="clip.outputUrl"
        controls
        playsinline
        preload="metadata"
      ></video>
      <div v-else class="clip__placeholder">
        <span v-if="isProcessing">{{ processingLabel }}</span>
        <span v-else-if="clip.subtitle.trim()">“{{ clip.subtitle.trim() }}”</span>
        <span v-else>Preview 9:16</span>
      </div>
      <div class="clip__overlay">
        <span>{{ rangeLabel }}</span>
        <span :class="`status-${clip.status}`">{{ statusLabel }}</span>
      </div>
    </div>

    <div class="clip__body">
      <div class="clip__head">
        <h3>Corte {{ index }}</h3>
        <p>{{ rangeLabel }}</p>
      </div>

      <ClipEditor
        :clip="clip"
        :has-video="hasVideo"
        :video-duration="videoDuration"
        :is-engine-busy="isEngineBusy"
        @update="$emit('update', $event)"
        @generate="$emit('generate')"
      />

      <div class="clip__actions">
        <button
          class="btn btn-cyan"
          type="button"
          :disabled="!clip.outputUrl"
          @click="$emit('download')"
        >
          Baixar MP4
        </button>
        <button class="btn btn-ghost" type="button" @click="$emit('remove')">
          Remover
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import ClipEditor from './ClipEditor.vue'
import { CLIP_STATUS, CLIP_STATUS_LABEL } from '@/constants/editor'
import { formatTimecode } from '@/utils/time'

const props = defineProps({
  clip: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
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
})

defineEmits(['update', 'generate', 'download', 'remove'])

const isProcessing = computed(() => props.clip.status === CLIP_STATUS.PROCESSING)
const rangeLabel = computed(
  () => `${formatTimecode(props.clip.startTime)} → ${formatTimecode(props.clip.endTime)}`,
)
const statusLabel = computed(() => {
  if (isProcessing.value && props.clip.progress) {
    return `Processando ${props.clip.progress}%`
  }
  return CLIP_STATUS_LABEL[props.clip.status] || CLIP_STATUS_LABEL.idle
})
const processingLabel = computed(() =>
  props.clip.progress ? `Processando ${props.clip.progress}%` : 'Processando...',
)
</script>

<style scoped>
.clip {
  display: grid;
  grid-template-columns: minmax(140px, 180px) minmax(0, 1fr);
  gap: 16px;
  padding: 16px;
}

.clip__frame {
  position: relative;
  overflow: hidden;
  aspect-ratio: 9 / 16;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(46, 230, 214, 0.12), rgba(255, 59, 92, 0.18)),
    #101016;
  border: 1px solid var(--line);
}

.clip__frame video,
.clip__placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.clip__placeholder {
  display: grid;
  place-items: center;
  padding: 18px;
  color: var(--text-soft);
  text-align: center;
  font-size: 13px;
}

.clip__overlay {
  position: absolute;
  inset: 10px 10px auto;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 9px;
  border-radius: 10px;
  background: rgba(8, 8, 12, 0.78);
  font-size: 11px;
  font-weight: 700;
  pointer-events: none;
}

.clip__body {
  display: grid;
  align-content: start;
  gap: 14px;
}

.clip__head h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 18px;
}

.clip__head p {
  margin: 4px 0 0;
  color: var(--text-soft);
  font-family: var(--font-mono);
  font-size: 13px;
}

.clip__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 720px) {
  .clip {
    grid-template-columns: 1fr;
  }

  .clip__frame {
    max-width: 240px;
    margin: 0 auto;
  }
}
</style>
