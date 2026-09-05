import { computed, ref } from 'vue'
import {
  disconnectTikTokAccount,
  getTikTokAccount,
  getTikTokAuthUrl,
  getTikTokCreator,
} from '@/api/tiktok'
import { useAuth } from '@/composables/useAuth'

const account = ref(null)
const creator = ref(null)
const isLoading = ref(false)
const error = ref('')

const CALLBACK_ERROR_LABELS = {
  oauth_denied: 'A conexão com o TikTok foi cancelada.',
  oauth_state_invalid: 'A sessão de login expirou. Tente conectar de novo.',
  oauth_failed: 'Não foi possível concluir o login do TikTok.',
}

export function useTikTok() {
  const { ensureSession, signOut, isSignedIn } = useAuth()

  const isConnected = computed(
    () => Boolean(account.value?.connected) && !account.value?.needs_reconnect,
  )

  async function refreshAccount() {
    if (!isSignedIn.value) {
      account.value = { connected: false, needs_reconnect: false }
      creator.value = null
      return account.value
    }

    isLoading.value = true
    error.value = ''

    try {
      account.value = await getTikTokAccount()
    } catch (requestError) {
      account.value = { connected: false, needs_reconnect: false }
      if (requestError?.status !== 401) {
        error.value = requestError.message || 'Não foi possível ler a conta TikTok.'
      }
    } finally {
      isLoading.value = false
    }

    return account.value
  }

  async function refreshCreator() {
    if (!isConnected.value) {
      creator.value = null
      return null
    }

    creator.value = await getTikTokCreator()
    return creator.value
  }

  async function connectTikTok() {
    ensureSession()
    error.value = ''
    isLoading.value = true

    try {
      const payload = await getTikTokAuthUrl()
      if (!payload?.authorization_url) {
        throw new Error('O backend não devolveu a URL de login do TikTok.')
      }
      window.location.assign(payload.authorization_url)
    } catch (requestError) {
      isLoading.value = false
      error.value = requestError.message || 'Não foi possível iniciar o login do TikTok.'
      throw requestError
    }
  }

  async function disconnectTikTok() {
    error.value = ''
    await disconnectTikTokAccount()
    account.value = { connected: false, needs_reconnect: false }
    creator.value = null
  }

  function clearSession() {
    signOut()
    account.value = { connected: false, needs_reconnect: false }
    creator.value = null
    error.value = ''
  }

  function callbackMessage(code) {
    return CALLBACK_ERROR_LABELS[code] || ''
  }

  return {
    account,
    creator,
    isLoading,
    error,
    isConnected,
    refreshAccount,
    refreshCreator,
    connectTikTok,
    disconnectTikTok,
    clearSession,
    callbackMessage,
  }
}
