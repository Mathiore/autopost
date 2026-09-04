<template>
  <section class="card settings">
    <p class="eyebrow">Regras dos cortes</p>
    <h2>Como o vídeo será fatiado</h2>

    <label class="field-label" for="cut-minutes">Duração de cada corte</label>
    <div class="settings__duration">
      <button
        class="btn btn-ghost settings__step"
        type="button"
        :disabled="cutMinutes <= minMinutes || isGenerating"
        @click="adjust(-1)"
      >
        −
      </button>
      <div class="settings__value">
        <input
          id="cut-minutes"
          class="input"
          type="number"
          :min="minMinutes"
          :max="maxMinutes"
          :value="cutMinutes"
          :disabled="isGenerating"
          @change="onMinutesChange"
        />
        <span>min</span>
      </div>
      <button
        class="btn btn-ghost settings__step"
        type="button"
        :disabled="cutMinutes >= maxMinutes || isGenerating"
        @click="adjust(1)"
      >
        +
      </button>
    </div>
    <p class="dim settings__hint">De 1 a 5 minutos. O restante menor que isso fica de fora.</p>

    <ul>
      <li>
        <strong>{{ cutMinutes }} min</strong>
        <span>Tempo escolhido para cada corte</span>
      </li>
      <li>
        <strong>9:16</strong>
        <span>Recorte central para o formato TikTok</span>
      </li>
      <li>
        <strong>Vídeo inteiro</strong>
        <span>Os cortes avançam até cobrir a origem</span>
      </li>
    </ul>

    <p v-if="isYouTube" class="settings__note">
      Com link do YouTube, a fila e o preview são montados agora. O arquivo 9:16
      é gerado quando você envia o vídeo.
    </p>

    <p v-if="!canGenerate && !isGenerating" class="settings__note">
      O vídeo precisa ter pelo menos {{ cutMinutes }} min para gerar um corte.
    </p>

    <p v-if="error" class="settings__error">{{ error }}</p>

    <div class="settings__actions">
      <button
        class="btn btn-primary"
        type="button"
        :disabled="!canGenerate || isGenerating"
        @click="$emit('generate')"
      >
        {{ ctaLabel }}
      </button>
      <button class="btn btn-ghost" type="button" @click="$emit('reset')">
        Trocar origem
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import {
  CUT_MAX_MINUTES,
  CUT_MIN_MINUTES,
  SOURCE_TYPE,
  clampCutMinutes,
} from '@/constants/video'

const cutMinutes = defineModel('cutMinutes', {
  type: Number,
  default: 1,
})

const props = defineProps({
  canGenerate: {
    type: Boolean,
    default: false,
  },
  isGenerating: {
    type: Boolean,
    default: false,
  },
  sourceType: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  progress: {
    type: Object,
    default: () => ({ phase: '', current: 0, total: 0 }),
  },
})

defineEmits(['generate', 'reset'])

const minMinutes = CUT_MIN_MINUTES
const maxMinutes = CUT_MAX_MINUTES
const isYouTube = computed(() => props.sourceType === SOURCE_TYPE.YOUTUBE)

const ctaLabel = computed(() => {
  if (!props.isGenerating) return 'Gerar cortes'
  if (props.progress.phase === 'loading-engine') return 'Carregando motor de cortes…'
  if (props.progress.phase === 'writing') return 'Preparando o vídeo…'
  if (props.progress.phase === 'thumbnails') return 'Gerando previews 9:16…'
  if (props.progress.phase === 'cutting' && props.progress.total) {
    return `Gerando corte ${props.progress.current}/${props.progress.total}…`
  }
  return 'Gerando cortes…'
})

function adjust(delta) {
  cutMinutes.value = clampCutMinutes(cutMinutes.value + delta)
}

function onMinutesChange(event) {
  cutMinutes.value = clampCutMinutes(event.target.value)
}
</script>

<style scoped>
.settings {
  padding: 24px;
}

.settings h2 {
  margin: 0 0 18px;
  font-family: var(--font-display);
  font-size: 22px;
}

.settings__duration {
  display: grid;
  grid-template-columns: 46px 1fr 46px;
  gap: 10px;
  align-items: center;
}

.settings__step {
  min-height: 46px;
  padding: 0;
  font-size: 22px;
}

.settings__value {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
}

.settings__value span {
  color: var(--text-soft);
  font-family: var(--font-mono);
  font-size: 13px;
}

.settings__hint {
  margin: 8px 0 18px;
  font-size: 12px;
}

.settings ul {
  display: grid;
  gap: 12px;
  margin: 0 0 22px;
  padding: 0;
  list-style: none;
}

.settings li {
  display: grid;
  gap: 2px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
}

.settings li:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.settings strong {
  font-family: var(--font-mono);
}

.settings span {
  color: var(--text-soft);
  font-size: 13px;
}

.settings__note,
.settings__error {
  margin: 0 0 16px;
  font-size: 13px;
}

.settings__note {
  color: var(--text-soft);
}

.settings__error {
  color: var(--accent);
}

.settings__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
