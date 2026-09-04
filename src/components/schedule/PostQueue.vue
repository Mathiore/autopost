<template>
  <section v-if="cuts.length" class="card queue">
    <p class="eyebrow">Ordem de envio</p>
    <ol>
      <li v-for="cut in cuts" :key="cut.id">
        <span class="queue__index">{{ String(cut.index).padStart(2, '0') }}</span>
        <div>
          <strong>Corte {{ cut.index }} · {{ durationLabel(cut) }}</strong>
          <p>{{ rangeLabel(cut) }}</p>
        </div>
        <div class="queue__when">
          <span>{{ clockLabel(cut) }}</span>
          <small :class="`status-${cut.status}`">{{ statusLabel(cut) }}</small>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup>
import { CUT_STATUS_LABEL } from '@/constants/video'
import { formatClock, formatDuration } from '@/utils/time'

defineProps({
  cuts: {
    type: Array,
    default: () => [],
  },
})

function durationLabel(cut) {
  return formatDuration(cut.durationSeconds)
}

function rangeLabel(cut) {
  return `${formatDuration(cut.startSeconds)} — ${formatDuration(cut.endSeconds)}`
}

function clockLabel(cut) {
  return cut.scheduledAt ? formatClock(cut.scheduledAt) : '--:--'
}

function statusLabel(cut) {
  return CUT_STATUS_LABEL[cut.status] || 'Rascunho'
}
</script>

<style scoped>
.queue {
  padding: 22px;
}

.queue ol {
  display: grid;
  gap: 10px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}

.queue li {
  display: grid;
  grid-template-columns: 42px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
}

.queue__index {
  font-family: var(--font-mono);
  color: var(--text-dim);
}

.queue strong {
  display: block;
  font-size: 14px;
}

.queue p,
.queue small {
  margin: 3px 0 0;
  color: var(--text-dim);
  font-size: 12px;
}

.queue__when {
  text-align: right;
}

.queue__when span {
  font-family: var(--font-mono);
  color: var(--cyan);
}
</style>
