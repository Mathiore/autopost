<template>
  <main class="page callback">
    <section class="card callback__card">
      <p class="eyebrow">Integração TikTok</p>
      <h1>{{ title }}</h1>
      <p class="muted">{{ message }}</p>
      <RouterLink class="btn btn-cyan" :to="nextPath">
        {{ connected ? 'Continuar envio' : 'Tentar de novo' }}
      </RouterLink>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePublishGate } from '@/composables/usePublishGate'
import { useTikTok } from '@/composables/useTikTok'

const route = useRoute()
const router = useRouter()
const { consumePublishIntent, peekNext } = usePublishGate()
const { refreshAccount, callbackMessage } = useTikTok()

const connected = computed(() => route.query.connected === 'true')
const errorCode = computed(() => String(route.query.error || ''))
const nextPath = computed(() => peekNext() || '/')

const title = computed(() =>
  connected.value ? 'TikTok conectado' : 'Não foi possível conectar',
)

const message = computed(() => {
  if (connected.value) {
    return 'Sua conta foi vinculada. Vamos voltar para a fila de envio.'
  }
  return callbackMessage(errorCode.value) || 'A conexão com o TikTok não foi concluída.'
})

onMounted(async () => {
  await refreshAccount()
  const { next } = consumePublishIntent()
  const target = route.query.next || next || '/'

  window.setTimeout(() => {
    router.replace(target)
  }, 1400)
})
</script>

<style scoped>
.callback {
  display: flex;
  justify-content: center;
}

.callback__card {
  width: min(560px, 100%);
  padding: 32px;
}

.callback__card h1 {
  margin: 0 0 12px;
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1.1;
}

.callback__card p {
  margin: 0 0 22px;
}

.callback__card .btn {
  text-decoration: none;
}
</style>
