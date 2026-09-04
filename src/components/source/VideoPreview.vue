<template>
  <section class="card preview">
    <div class="preview__copy">
      <p class="eyebrow">Pré-visualização</p>
      <h2>{{ title }}</h2>
      <p class="muted">{{ sourceLabel }}</p>
    </div>

    <div class="preview__stage">
      <video
        v-if="objectUrl"
        class="preview__media"
        :src="objectUrl"
        controls
        playsinline
      ></video>
      <iframe
        v-else-if="youtubeId"
        class="preview__media"
        :src="embedUrl"
        title="Pré-visualização do YouTube"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
      <img
        v-else-if="thumbnail"
        class="preview__media preview__media--image"
        :src="thumbnail"
        alt="Capa do vídeo do YouTube"
      />
      <div v-else class="preview__empty">Sem preview</div>
      <span class="preview__badge">Fonte 16:9</span>
    </div>

    <p v-if="isLoading" class="dim preview__hint">Lendo título e duração do YouTube…</p>

    <form v-else-if="needsDuration" class="preview__duration" @submit.prevent="onSubmitDuration">
      <label class="field-label" for="manual-duration">
        Duração do vídeo do YouTube
      </label>
      <div class="preview__row">
        <input
          id="manual-duration"
          v-model="localDuration"
          class="input"
          type="text"
          placeholder="Ex: 12:40 ou 760"
        />
        <button class="btn btn-ghost" type="submit">Aplicar</button>
      </div>
      <p class="dim preview__hint">
        Se a leitura automática falhar, informe a duração para montar os cortes.
      </p>
    </form>

    <dl v-else class="preview__stats">
      <div>
        <dt>Duração</dt>
        <dd>{{ formattedDuration }}</dd>
      </div>
      <div>
        <dt>Formato final</dt>
        <dd>9:16 vertical</dd>
      </div>
    </dl>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { SOURCE_TYPE } from '@/constants/video'
import { formatDuration } from '@/utils/time'
import { getYouTubeEmbedUrl } from '@/utils/youtube'

const props = defineProps({
  title: {
    type: String,
    default: 'Vídeo sem título',
  },
  sourceType: {
    type: String,
    default: '',
  },
  objectUrl: {
    type: String,
    default: '',
  },
  youtubeId: {
    type: String,
    default: '',
  },
  thumbnail: {
    type: String,
    default: '',
  },
  durationSeconds: {
    type: Number,
    default: 0,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['set-duration'])

const localDuration = ref('')

const sourceLabel = computed(() =>
  props.sourceType === SOURCE_TYPE.YOUTUBE ? 'Link do YouTube' : 'Arquivo local',
)

const embedUrl = computed(() => (props.youtubeId ? getYouTubeEmbedUrl(props.youtubeId) : ''))

const needsDuration = computed(
  () => props.sourceType === SOURCE_TYPE.YOUTUBE && props.durationSeconds <= 0,
)

const formattedDuration = computed(() => formatDuration(props.durationSeconds))

watch(
  () => props.durationSeconds,
  (value) => {
    if (value) localDuration.value = formatDuration(value)
  },
)

function onSubmitDuration() {
  emit('set-duration', localDuration.value)
}
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
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  background: #09090d;
  aspect-ratio: 16 / 9;
}

.preview__media,
.preview__empty {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 0;
}

.preview__empty {
  display: grid;
  place-items: center;
  color: var(--text-dim);
}

.preview__badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.65);
  font-size: 11px;
  font-weight: 700;
}

.preview__row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.preview__hint {
  margin: 8px 0 0;
  font-size: 12px;
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
