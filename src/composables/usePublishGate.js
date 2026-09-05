import { useRouter } from 'vue-router'
import { useTikTok } from '@/composables/useTikTok'

const PUBLISH_INTENT_KEY = 'autotok.publishIntent'
const SOURCE_URL_KEY = 'autotok.sourceUrl'
const NEXT_KEY = 'autotok.next'

export function usePublishGate() {
  const router = useRouter()
  const { isConnected, isLoading, refreshAccount } = useTikTok()

  function rememberSource(url) {
    if (url) {
      sessionStorage.setItem(SOURCE_URL_KEY, url)
    }
  }

  function peekSource() {
    return sessionStorage.getItem(SOURCE_URL_KEY) || ''
  }

  function setPublishIntent(next = '/') {
    sessionStorage.setItem(PUBLISH_INTENT_KEY, '1')
    sessionStorage.setItem(NEXT_KEY, next)
  }

  function consumePublishIntent() {
    const pending = sessionStorage.getItem(PUBLISH_INTENT_KEY) === '1'
    const next = sessionStorage.getItem(NEXT_KEY) || '/'
    sessionStorage.removeItem(PUBLISH_INTENT_KEY)
    return { pending, next }
  }

  function peekNext() {
    return sessionStorage.getItem(NEXT_KEY) || '/'
  }

  async function requireTikTok({ next = '/', sourceUrl = '' } = {}) {
    await refreshAccount()
    if (isConnected.value) {
      return true
    }

    rememberSource(sourceUrl)
    setPublishIntent(next)
    await router.push({ name: 'login', query: { next } })
    return false
  }

  return {
    isConnected,
    isLoading,
    rememberSource,
    peekSource,
    setPublishIntent,
    consumePublishIntent,
    peekNext,
    requireTikTok,
  }
}
