<template>
  <section class="card settings">
    <p class="eyebrow">Regras dos cortes</p>
    <h2>Como o vídeo será fatiado</h2>

    <ul>
      <li>
        <strong>1:01 a 1:05</strong>
        <span>Durações variadas em cada corte</span>
      </li>
      <li>
        <strong>Nunca 1:00</strong>
        <span>O minuto exato fica bloqueado</span>
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

    <div class="settings__actions">
      <button
        class="btn btn-primary"
        type="button"
        :disabled="!canGenerate || isGenerating"
        @click="$emit('generate')"
      >
        {{ isGenerating ? 'Gerando cortes…' : 'Gerar cortes' }}
      </button>
      <button class="btn btn-ghost" type="button" @click="$emit('reset')">
        Trocar origem
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  canGenerate: {
    type: Boolean,
    default: false,
  },
  isGenerating: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['generate', 'reset'])
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

.settings__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
