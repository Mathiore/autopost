<template>
  <section class="card upload">
    <p class="eyebrow">Upload</p>
    <h2 class="section-title">Vídeo original</h2>
    <p class="muted upload__lead">
      O arquivo fica só no navegador. Aceitamos MP4 e WebM para gerar cortes
      verticais com legenda.
    </p>

    <div
      class="dropzone"
      :class="{ 'dropzone--active': isDragging, 'dropzone--busy': isLoading }"
      @dragenter.prevent="isDragging = true"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <input
        ref="fileInput"
        class="dropzone__input"
        type="file"
        :accept="accept"
        @change="onFileChange"
      />
      <strong>{{ isLoading ? 'Lendo o vídeo…' : 'Arraste seu vídeo aqui' }}</strong>
      <span class="dim">ou</span>
      <button
        class="btn btn-ghost"
        type="button"
        :disabled="isLoading"
        @click="fileInput?.click()"
      >
        Selecionar vídeo
      </button>
      <span class="dim dropzone__hint">MP4 ou WebM</span>
    </div>

    <p v-if="error" class="upload__error">{{ error }}</p>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { EDITOR_ACCEPTED_VIDEO_EXTENSIONS } from '@/constants/editor'

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

const emit = defineEmits(['select-file'])

const accept = EDITOR_ACCEPTED_VIDEO_EXTENSIONS
const fileInput = ref(null)
const isDragging = ref(false)

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
</script>

<style scoped>
.upload {
  padding: 28px;
}

.upload__lead {
  max-width: 62ch;
  margin: 10px 0 22px;
}

.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 210px;
  padding: 28px;
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

.dropzone--busy {
  opacity: 0.7;
}

.dropzone__input {
  display: none;
}

.dropzone__hint {
  font-size: 12px;
}

.upload__error {
  margin: 14px 0 0;
  color: var(--accent);
  font-size: 13px;
}
</style>
