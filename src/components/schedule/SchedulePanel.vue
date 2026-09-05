<template>
  <section class="card schedule">
    <p class="eyebrow">Publicação</p>
    <h2>Postar todos em ordem</h2>
    <p class="muted">
      O mesmo horário-base, com minutos diferentes. Exemplo: 15:05, depois 15:09,
      e assim por diante.
    </p>

    <div class="schedule__fields">
      <div>
        <label class="field-label" for="start-clock">Horário do primeiro corte</label>
        <input
          id="start-clock"
          :value="startClock"
          class="input"
          type="time"
          @input="$emit('update:startClock', $event.target.value)"
        />
      </div>
      <div>
        <label class="field-label" for="interval">Intervalo entre cortes</label>
        <input
          id="interval"
          :value="intervalMinutes"
          class="input"
          type="number"
          :min="minInterval"
          :max="maxInterval"
          @input="$emit('update:intervalMinutes', Number($event.target.value))"
        />
      </div>
    </div>

    <p class="schedule__preview">
      Fila: <strong>{{ preview }}</strong>
    </p>
    <p v-if="error" class="schedule__error">{{ error }}</p>

    <button
      class="btn btn-cyan schedule__cta"
      type="button"
      :disabled="!canPost || isPosting"
      @click="$emit('post-all')"
    >
      {{ ctaLabel }}
    </button>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import {
  MAX_POST_INTERVAL_MINUTES,
  MIN_POST_INTERVAL_MINUTES,
} from '@/constants/video'
import { addMinutes, clockToDate, formatClock } from '@/utils/time'

const props = defineProps({
  startClock: {
    type: String,
    required: true,
  },
  intervalMinutes: {
    type: Number,
    required: true,
  },
  cutCount: {
    type: Number,
    default: 0,
  },
  isPosting: {
    type: Boolean,
    default: false,
  },
  hasPosted: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

defineEmits(['update:startClock', 'update:intervalMinutes', 'post-all'])

const minInterval = MIN_POST_INTERVAL_MINUTES
const maxInterval = MAX_POST_INTERVAL_MINUTES

const canPost = computed(() => props.cutCount > 0 && !props.isPosting)

const ctaLabel = computed(() => {
  if (props.isPosting) return 'Enfileirando cortes…'
  if (props.hasPosted) return 'Fila agendada'
  return 'Enviar vídeos'
})

const preview = computed(() => {
  const start = clockToDate(props.startClock)
  if (!start || !props.cutCount) return 'gere os cortes para ver os horários'

  return Array.from({ length: Math.min(props.cutCount, 4) }, (_, index) =>
    formatClock(addMinutes(start, index * props.intervalMinutes)),
  ).join(' → ') + (props.cutCount > 4 ? '…' : '')
})
</script>

<style scoped>
.schedule {
  padding: 24px;
}

.schedule h2 {
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-size: 22px;
}

.schedule p {
  margin: 0 0 18px;
}

.schedule__fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.schedule__preview {
  color: var(--text-soft);
  font-size: 14px;
}

.schedule__preview strong {
  color: var(--cyan);
  font-family: var(--font-mono);
  font-weight: 500;
}

.schedule__error {
  color: var(--accent);
  font-size: 13px;
}

.schedule__cta {
  width: 100%;
}

@media (max-width: 640px) {
  .schedule__fields {
    grid-template-columns: 1fr;
  }
}
</style>
