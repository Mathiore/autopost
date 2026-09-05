<template>
  <main class="page login">
    <section class="card login__card">
      <p class="eyebrow">Conta TikTok</p>
      <h1>{{ heading }}</h1>
      <p class="muted">
        {{ lead }}
      </p>

      <p v-if="callbackError" class="login__error">{{ callbackError }}</p>
      <p v-if="error" class="login__error">{{ error }}</p>

      <div v-if="isConnected" class="login__status">
        <span class="chip">TikTok conectado</span>
        <p v-if="account?.open_id" class="dim">Conta pronta para receber os cortes.</p>
      </div>

      <div class="login__actions">
        <button
          v-if="!isConnected"
          class="btn btn-cyan"
          type="button"
          :disabled="isLoading"
          @click="onConnect"
        >
          {{ isLoading ? 'Abrindo o TikTok…' : 'Continuar com TikTok' }}
        </button>
        <RouterLink class="btn btn-ghost" :to="nextPath">
          {{ isConnected ? 'Voltar para enviar' : 'Voltar' }}
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePublishGate } from '@/composables/usePublishGate'
import { useTikTok } from '@/composables/useTikTok'

const route = useRoute()
const router = useRouter()
const { peekNext } = usePublishGate()
const {
  account,
  isConnected,
  isLoading,
  error,
  refreshAccount,
  connectTikTok,
} = useTikTok()

const callbackError = ref('')

const nextPath = computed(() => route.query.next || peekNext() || '/')
const hasPublishIntent = computed(() => Boolean(route.query.next) || peekNext() !== '/')

const heading = computed(() =>
  isConnected.value ? 'Conta conectada' : 'Entre para enviar os vídeos',
)

const lead = computed(() => {
  if (isConnected.value) {
    return 'Pode voltar à fila e enviar os cortes para o TikTok.'
  }
  if (hasPublishIntent.value) {
    return 'Os cortes já estão prontos. Conecte o TikTok para publicar na ordem combinada.'
  }
  return 'Conecte sua conta TikTok para enviar os cortes gerados no AutoTok.'
})

onMounted(async () => {
  await refreshAccount()
  if (isConnected.value && route.query.next) {
    await router.replace(nextPath.value)
  }
})

async function onConnect() {
  callbackError.value = ''
  try {
    await connectTikTok()
  } catch (connectError) {
    callbackError.value = connectError.message
  }
}
</script>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.login__card {
  width: min(560px, 100%);
  padding: 32px;
}

.login__card h1 {
  margin: 0 0 12px;
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1.1;
}

.login__card p {
  margin: 0 0 22px;
}

.login__status {
  display: grid;
  gap: 10px;
  margin-bottom: 22px;
}

.login__status p {
  margin: 0;
}

.login__error {
  color: var(--accent);
  font-size: 14px;
}

.login__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.login__actions .btn {
  text-decoration: none;
}
</style>
