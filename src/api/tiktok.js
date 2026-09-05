import { apiFetch } from '@/api/http'

export function getTikTokAuthUrl() {
  return apiFetch('/api/v1/tiktok/auth')
}

export function getTikTokAccount() {
  return apiFetch('/api/v1/tiktok/account')
}

export function disconnectTikTokAccount() {
  return apiFetch('/api/v1/tiktok/account', { method: 'DELETE' })
}

export function getTikTokCreator() {
  return apiFetch('/api/v1/tiktok/creator')
}

export function createTikTokPost(formData) {
  return apiFetch('/api/v1/tiktok/posts', {
    method: 'POST',
    body: formData,
  })
}

export function listTikTokPosts(params = {}) {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.pageSize) search.set('page_size', String(params.pageSize))
  if (params.status) search.set('status', params.status)

  const query = search.toString()
  return apiFetch(`/api/v1/tiktok/posts${query ? `?${query}` : ''}`)
}

export function getTikTokPost(postId) {
  return apiFetch(`/api/v1/tiktok/posts/${postId}`)
}

export function getTikTokPostStatus(postId) {
  return apiFetch(`/api/v1/tiktok/posts/${postId}/status`)
}
