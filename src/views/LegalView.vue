<template>
  <main class="page legal">
    <p class="eyebrow">{{ eyebrow }}</p>
    <article class="legal__doc card" v-html="html"></article>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
  eyebrow: {
    type: String,
    default: 'Legal',
  },
})

const html = computed(() => renderMarkdown(props.source))
</script>

<style scoped>
.legal {
  max-width: 800px;
}

.legal__doc {
  padding: 28px 32px 36px;
}

.legal__doc :deep(h1) {
  margin: 0 0 12px;
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1.1;
}

.legal__doc :deep(h2) {
  margin: 32px 0 12px;
  font-family: var(--font-display);
  font-size: 22px;
  line-height: 1.25;
}

.legal__doc :deep(h3) {
  margin: 22px 0 8px;
  font-size: 16px;
}

.legal__doc :deep(p),
.legal__doc :deep(li) {
  color: var(--text-soft);
  font-size: 16px;
  line-height: 1.65;
}

.legal__doc :deep(p) {
  margin: 0 0 14px;
}

.legal__doc :deep(ul) {
  margin: 0 0 16px;
  padding-left: 22px;
}

.legal__doc :deep(li + li) {
  margin-top: 8px;
}

.legal__doc :deep(strong) {
  color: var(--text);
  font-weight: 600;
}

@media (max-width: 720px) {
  .legal__doc {
    padding: 22px 18px 28px;
  }
}
</style>
