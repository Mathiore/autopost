<template>
  <article class="cut">
    <div class="cut__frame">
      <img
        v-if="cut.thumbnail"
        :src="cut.thumbnail"
        :alt="`Preview do corte ${cut.index}`"
      />
      <div v-else class="cut__placeholder">
        <span>{{ cut.aspectRatio }}</span>
      </div>
      <div class="cut__overlay">
        <span>{{ durationLabel }}</span>
        <span :class="`status-${cut.status}`">{{ statusLabel }}</span>
      </div>
    </div>

    <div class="cut__meta">
      <h3>Corte {{ String(cut.index).padStart(2, '0') }}</h3>
      <p>{{ rangeLabel }}</p>
      <p v-if="cut.scheduledAt" class="cut__time">
        {{ clockLabel }}
      </p>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { CUT_STATUS_LABEL } from '@/constants/video'
import { formatClock, formatDuration } from '@/utils/time'

const props = defineProps({
  cut: {
    type: Object,
    required: true,
  },
})

const durationLabel = computed(() => formatDuration(props.cut.durationSeconds))
const rangeLabel = computed(
  () => `${formatDuration(props.cut.startSeconds)} → ${formatDuration(props.cut.endSeconds)}`,
)
const clockLabel = computed(() =>
  props.cut.scheduledAt ? `Postagem ${formatClock(props.cut.scheduledAt)}` : '',
)
const statusLabel = computed(() => CUT_STATUS_LABEL[props.cut.status] || 'Rascunho')
</script>

<style scoped>
.cut {
  display: grid;
  gap: 10px;
}

.cut__frame {
  position: relative;
  overflow: hidden;
  aspect-ratio: 9 / 16;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(46, 230, 214, 0.12), rgba(255, 59, 92, 0.18)),
    #101016;
  border: 1px solid var(--line);
}

.cut__frame img,
.cut__placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cut__placeholder {
  display: grid;
  place-items: center;
  color: var(--text-soft);
  font-family: var(--font-mono);
}

.cut__overlay {
  position: absolute;
  inset: auto 10px 10px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 9px;
  border-radius: 10px;
  background: rgba(8, 8, 12, 0.78);
  font-size: 11px;
  font-weight: 700;
}

.cut__meta h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 15px;
}

.cut__meta p {
  margin: 4px 0 0;
  color: var(--text-soft);
  font-size: 13px;
}

.cut__time {
  color: var(--cyan);
  font-family: var(--font-mono);
  font-size: 12px;
}
</style>
