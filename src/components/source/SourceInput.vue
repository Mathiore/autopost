<template>
  <section class="card source">
    <p class="eyebrow">Origem</p>
    <h2 class="section-title">Vídeo ou link do YouTube</h2>
    <p class="muted source__lead">
      Envie o arquivo completo. Os cortes cobrem o vídeo inteiro, sempre entre
      1:01 e 1:05 — nunca 1:00 exato — e saem no formato vertical do TikTok.
    </p>

    <div
      class="dropzone"
      :class="{ 'dropzone--active': isDragging }"
      @dragenter.prevent="isDragging = true"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="fileInput?.click()"
    >
      <input
        ref="fileInput"
        class="dropzone__input"
        type="file"
        :accept="accept"
        @change="onFileChange"
      />
      <strong>{{ isLoading ? 'Lendo o vídeo…' : 'Arraste o vídeo ou clique para selecionar' }}</strong>
      <span class="dim">MP4, WebM, MOV ou MKV</span>
    </div>

    <div class="source__divider"><span>ou cole o link</span></div>

    <form class="source__form" @submit.prevent="onSubmitLink">
      <label class="field-label" for="youtube-url">Link do YouTube</label>
      <div class="source__row">
        <input
          id="youtube-url"
          v-model="url"
          class="input"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <button class="btn btn-ghost" type="submit">Usar link</button>
      </div>
    </form>

    <p v-if="error" class="source__error">{{ error }}</p>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { ACCEPTED_VIDEO_EXTENSIONS } from '@/constants/video'

defineProps({
  error: {
    type: String,
    default: '',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-file', 'submit-youtube'])

const accept = ACCEPTED_VIDEO_EXTENSIONS
const fileInput = ref(null)
const isDragging = ref(false)
const url = ref('')

function onFileChange(event) {
  const [file] = event.target.files || []
  if (file) emit('select-file', file)
  event.target.value = ''
}

function onDrop(event) {
  isDragging.value = false
  const [file] = event.dataTransfer?.files || []
  if (file) emit('select-file', file)
}

function onSubmitLink() {
  emit('submit-youtube', url.value)
}
</script>

<style scoped>
.source {
  padding: 28px;
}

.source__lead {
  max-width: 62ch;
  margin: 10px 0 22px;
}

.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 150px;
  padding: 24px;
  border: 1px dashed var(--line-strong);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent),
    var(--bg-elevated);
  text-align: center;
}

.dropzone--active {
  border-color: var(--cyan);
  box-shadow: inset 0 0 0 1px var(--cyan);
}

.dropzone__input {
  display: none;
}

.source__divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0 16px;
  color: var(--text-dim);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.source__divider::before,
.source__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--line);
}

.source__row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.source__error {
  margin: 14px 0 0;
  color: var(--accent);
  font-size: 13px;
}

@media (max-width: 640px) {
  .source__row {
    grid-template-columns: 1fr;
  }
}
</style>
