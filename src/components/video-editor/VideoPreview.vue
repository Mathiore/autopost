<template>
  <section class="card preview">
    <div class="preview__copy">
      <p class="eyebrow">Pré-visualização</p>
      <h2>{{ fileName }}</h2>
      <p class="muted">Assista o original antes de definir os cortes.</p>
    </div>

    <div class="preview__stage">
      <video
        v-if="objectUrl"
        ref="videoEl"
        class="preview__media"
        :src="objectUrl"
        controls
        playsinline
      ></video>
      <div v-else class="preview__empty">Sem preview</div>
    </div>

    <dl class="preview__stats">
      <div>
        <dt>Duração</dt>
        <dd>{{ formattedDuration }}</dd>
      </div>
      <div>
        <dt>Tamanho</dt>
        <dd>{{ formattedSize }}</dd>
      </div>
    </dl>

    <button class="btn btn-ghost" type="button" @click="$emit('remove')">
      Remover vídeo
    </button>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { formatFileSize } from '@/utils/fileSize'
import { formatTimecode } from '@/utils/time'

const props = defineProps({
  fileName: {
    type: String,
    default: 'video.mp4',
  },
  objectUrl: {
    type: String,
    default: '',
  },
  durationSeconds: {
    type: Number,
    default: 0,
  },
  fileSize: {
    type: Number,
    default: 0,
  },
})

defineEmits(['remove'])

const formattedDuration = computed(() => formatTimecode(props.durationSeconds))
const formattedSize = computed(() => formatFileSize(props.fileSize))
</script>

<style scoped>
.preview {
  padding: 24px;
  display: grid;
  gap: 18px;
}

.preview__copy h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 20px;
  word-break: break-word;
}

.preview__copy p {
  margin: 6px 0 0;
}

.preview__stage {
  overflow: hidden;
  border-radius: 18px;
  background: #09090d;
  aspect-ratio: 16 / 9;
}

.preview__media,
.preview__empty {
  width: 100%;
  height: 100%;
  border: 0;
}

.preview__media {
  object-fit: contain;
  background: #09090d;
}

.preview__empty {
  display: grid;
  place-items: center;
  color: var(--text-dim);
}

.preview__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 0;
}

.preview__stats dt {
  color: var(--text-dim);
  font-size: 12px;
}

.preview__stats dd {
  margin: 4px 0 0;
  font-family: var(--font-mono);
  font-size: 18px;
}
</style>
