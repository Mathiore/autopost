<template>
  <section class="cuts">
    <div class="cuts__head">
      <div>
        <p class="eyebrow">Fila vertical</p>
        <h2 class="section-title">{{ title }}</h2>
      </div>
      <p v-if="leftoverSeconds" class="cuts__leftover">
        {{ leftoverLabel }} ficaram fora do intervalo 1:01–1:05.
      </p>
    </div>

    <div v-if="cuts.length" class="cuts__grid">
      <CutCard v-for="cut in cuts" :key="cut.id" :cut="cut" />
    </div>

    <div v-else class="card cuts__empty">
      <p>Gere os cortes para ver a grade 9:16 e a ordem de postagem.</p>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import CutCard from './CutCard.vue'
import { formatDuration } from '@/utils/time'

const props = defineProps({
  cuts: {
    type: Array,
    default: () => [],
  },
  leftoverSeconds: {
    type: Number,
    default: 0,
  },
})

const title = computed(() => {
  if (!props.cuts.length) return 'Nenhum corte ainda'
  return `${props.cuts.length} corte${props.cuts.length > 1 ? 's' : ''} prontos`
})

const leftoverLabel = computed(() => formatDuration(props.leftoverSeconds))
</script>

<style scoped>
.cuts__head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: end;
  margin-bottom: 20px;
}

.cuts__leftover {
  margin: 0;
  color: var(--warn);
  font-size: 13px;
  max-width: 36ch;
}

.cuts__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.cuts__empty {
  padding: 36px;
  color: var(--text-soft);
}

@media (max-width: 720px) {
  .cuts__head {
    flex-direction: column;
    align-items: start;
  }
}
</style>
