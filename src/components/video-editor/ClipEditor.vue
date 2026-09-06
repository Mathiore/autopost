<template>
  <div class="editor">
    <div class="editor__times">
      <div>
        <label class="field-label" :for="`start-${clip.id}`">Início</label>
        <input
          :id="`start-${clip.id}`"
          class="input"
          type="text"
          inputmode="numeric"
          placeholder="00:15"
          :value="startInput"
          :disabled="isBusy"
          @input="onStartInput"
          @blur="onStartBlur"
        />
      </div>
      <div>
        <label class="field-label" :for="`end-${clip.id}`">Fim</label>
        <input
          :id="`end-${clip.id}`"
          class="input"
          type="text"
          inputmode="numeric"
          placeholder="00:42"
          :value="endInput"
          :disabled="isBusy"
          @input="onEndInput"
          @blur="onEndBlur"
        />
      </div>
    </div>
    <p class="dim editor__hint">Use mm:ss. Cada corte pode ter até {{ maxDuration }}s.</p>

    <label class="field-label" :for="`subtitle-${clip.id}`">Legenda</label>
    <textarea
      :id="`subtitle-${clip.id}`"
      class="input input--area"
      rows="3"
      placeholder="Digite a legenda do corte..."
      :value="clip.subtitle"
      :disabled="isBusy"
      @input="onSubtitleInput"
    ></textarea>

    <p v-if="clip.subtitle.trim()" class="editor__quote">
      Preview: “{{ clip.subtitle.trim() }}”
    </p>

    <div class="editor__options">
      <div>
        <p class="field-label">Tamanho</p>
        <div class="editor__pills">
          <button
            v-for="size in sizes"
            :key="size.id"
            class="editor__pill"
            :class="{ 'editor__pill--active': clip.subtitleSize === size.id }"
            type="button"
            :disabled="isBusy"
            @click="$emit('update', { subtitleSize: size.id })"
          >
            {{ size.label }}
          </button>
        </div>
      </div>

      <div>
        <p class="field-label">Posição</p>
        <div class="editor__pills">
          <button
            v-for="position in positions"
            :key="position.id"
            class="editor__pill"
            :class="{ 'editor__pill--active': clip.subtitlePosition === position.id }"
            type="button"
            :disabled="isBusy"
            @click="$emit('update', { subtitlePosition: position.id })"
          >
            {{ position.label }}
          </button>
        </div>
      </div>
    </div>

    <p v-if="validationError" class="editor__error">{{ validationError }}</p>
    <p v-else-if="clip.error" class="editor__error">{{ clip.error }}</p>

    <button
      class="btn btn-primary"
      type="button"
      :disabled="!canGenerate"
      @click="$emit('generate')"
    >
      {{ generateLabel }}
    </button>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { CLIP_STATUS, MAX_CLIP_DURATION, SUBTITLE_POSITIONS, SUBTITLE_SIZES } from '@/constants/editor'
import { canGenerateClip, validateClipTimes } from '@/utils/clipValidation'
import { formatTimecode, parseFlexibleDuration } from '@/utils/time'

const props = defineProps({
  clip: {
    type: Object,
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

const emit = defineEmits(['update', 'generate'])

const sizes = SUBTITLE_SIZES
const positions = SUBTITLE_POSITIONS
const maxDuration = MAX_CLIP_DURATION
const startInput = ref(formatTimecode(props.clip.startTime))
const endInput = ref(formatTimecode(props.clip.endTime))

const isProcessing = computed(() => props.clip.status === CLIP_STATUS.PROCESSING)
const isBusy = computed(() => isProcessing.value)

const validationError = computed(() =>
  validateClipTimes({
    startTime: props.clip.startTime,
    endTime: props.clip.endTime,
    videoDuration: props.videoDuration,
  }),
)

const canGenerate = computed(() =>
  canGenerateClip({
    hasVideo: props.hasVideo,
    startTime: props.clip.startTime,
    endTime: props.clip.endTime,
    videoDuration: props.videoDuration,
    isProcessing: isProcessing.value || props.isEngineBusy,
  }),
)

const generateLabel = computed(() => {
  if (props.clip.status === CLIP_STATUS.PROCESSING) {
    return props.clip.progress
      ? `Processando ${props.clip.progress}%`
      : 'Processando...'
  }
  if (props.isEngineBusy) return 'Na fila...'
  if (props.clip.status === CLIP_STATUS.READY) return 'Gerar novamente'
  return 'Gerar corte'
})

watch(
  () => props.clip.startTime,
  (value) => {
    startInput.value = formatTimecode(value)
  },
)

watch(
  () => props.clip.endTime,
  (value) => {
    endInput.value = formatTimecode(value)
  },
)

function commitTime(raw, key) {
  const seconds = parseFlexibleDuration(raw)
  if (seconds == null) return
  emit('update', { [key]: seconds })
}

function onStartInput(event) {
  startInput.value = event.target.value
}

function onEndInput(event) {
  endInput.value = event.target.value
}

function onStartBlur() {
  commitTime(startInput.value, 'startTime')
  startInput.value = formatTimecode(props.clip.startTime)
}

function onEndBlur() {
  commitTime(endInput.value, 'endTime')
  endInput.value = formatTimecode(props.clip.endTime)
}

function onSubtitleInput(event) {
  emit('update', { subtitle: event.target.value })
}
</script>

<style scoped>
.editor {
  display: grid;
  gap: 12px;
}

.editor__times {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.editor__hint {
  margin: 0;
  font-size: 12px;
}

.input--area {
  height: auto;
  min-height: 92px;
  padding: 12px 14px;
  resize: vertical;
}

.editor__quote {
  margin: 0;
  color: var(--text-soft);
  font-size: 13px;
}

.editor__options {
  display: grid;
  gap: 12px;
}

.editor__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.editor__pill {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  color: var(--text-soft);
  background: transparent;
  font-size: 12px;
  font-weight: 700;
}

.editor__pill--active {
  color: #062421;
  background: var(--cyan);
  border-color: var(--cyan);
}

.editor__error {
  margin: 0;
  color: var(--accent);
  font-size: 13px;
}

@media (max-width: 560px) {
  .editor__times {
    grid-template-columns: 1fr;
  }
}
</style>
