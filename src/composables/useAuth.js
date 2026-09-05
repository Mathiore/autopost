import { computed, ref } from 'vue'
import { AUTH_STORAGE_KEY } from '@/api/http'

const userId = ref(localStorage.getItem(AUTH_STORAGE_KEY) || '')

export function useAuth() {
  const isSignedIn = computed(() => Boolean(userId.value))

  function ensureSession() {
    if (!userId.value) {
      userId.value = crypto.randomUUID()
      localStorage.setItem(AUTH_STORAGE_KEY, userId.value)
    }
    return userId.value
  }

  function signOut() {
    userId.value = ''
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return {
    userId,
    isSignedIn,
    ensureSession,
    signOut,
  }
}
